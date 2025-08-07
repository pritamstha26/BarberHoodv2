import AppointmentModel from "../models/appointmentModel.js";
import ServiceModel from "../models/service.js";
import { UsersModel } from "../models/model.js";
import { decodeToken } from "./authController.js";
import {
  PriorityQueue,
  calculateAppointmentPriority,
  PRIORITY_LEVELS,
} from "../utils/priorityQueue.js";
import { Op } from "sequelize";

// Global priority queues for each barber
const barberQueues = new Map();

function getBarberQueue(barberId) {
  if (!barberQueues.has(barberId)) {
    barberQueues.set(barberId, new PriorityQueue());
  }
  return barberQueues.get(barberId);
}

async function checkAvailability(requestedDate, barberId) {
  const conflictingAppointment = await AppointmentModel.findOne({
    where: {
      barberId,
      date: requestedDate,
      status: "accepted",
    },
  });
  return !conflictingAppointment;
}

async function findBestBarberByPriority(appointmentDate, priority) {
  const barbers = await UsersModel.findAll({
    where: { role: "barber" },
    order: [["id", "ASC"]],
  });

  if (!barbers.length) return null;

  // For high priority appointments, find barber with shortest high-priority queue
  if (priority >= PRIORITY_LEVELS.VIP) {
    let bestBarber = null;
    let minHighPriorityCount = Infinity;

    for (const barber of barbers) {
      const available = await checkAvailability(appointmentDate, barber.id);
      if (available) {
        const queue = getBarberQueue(barber.id);
        const highPriorityCount = queue
          .getAll()
          .filter((apt) => apt.priority >= PRIORITY_LEVELS.VIP).length;

        if (highPriorityCount < minHighPriorityCount) {
          minHighPriorityCount = highPriorityCount;
          bestBarber = barber;
        }
      }
    }
    return bestBarber;
  }

  // For regular appointments, use round robin
  if (!global.roundRobinIndex) global.roundRobinIndex = 0;
  const startIndex = global.roundRobinIndex;

  for (let i = 0; i < barbers.length; i++) {
    const barber = barbers[(startIndex + i) % barbers.length];
    const available = await checkAvailability(appointmentDate, barber.id);
    if (available) {
      global.roundRobinIndex = (startIndex + i + 1) % barbers.length;
      return barber;
    }
  }

  return null;
}

async function updateQueuePositions(barberId) {
  const queue = getBarberQueue(barberId);
  const appointments = queue.getAll();

  for (let i = 0; i < appointments.length; i++) {
    await AppointmentModel.update(
      { queuePosition: i + 1 },
      { where: { id: appointments[i].id } }
    );
  }
}

export const createAppointment = async (req, res) => {
  try {
    // 1. Authenticate user
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decodedToken = decodeToken(token);
    if (!decodedToken) return res.status(401).json({ message: "Unauthorized" });

    const clientId = decodedToken.id;

    // 2. Extract request body
    const {
      serviceId,
      date,
      clientType = "regular",
      isReschedule = false,
    } = req.body;
    if (!serviceId || !date) {
      return res
        .status(400)
        .json({ message: "serviceId and date are required" });
    }

    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // 3. Verify service exists
    const service = await ServiceModel.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // 4. Calculate priority
    const priority = calculateAppointmentPriority(
      clientType,
      service.type,
      date,
      isReschedule
    );

    // 5. Find best available barber based on priority
    const assignedBarber = await findBestBarberByPriority(
      appointmentDate,
      priority
    );

    if (!assignedBarber) {
      return res.status(409).json({
        message: "No barbers available at the requested time",
      });
    }

    // 6. Create the appointment
    const appointment = await AppointmentModel.create({
      serviceId,
      clientId,
      barberId: assignedBarber.id,
      date: appointmentDate,
      status: "pending",
      priority,
      clientType,
      isReschedule,
    });

    // 7. Add to priority queue
    const queue = getBarberQueue(assignedBarber.id);
    queue.enqueue(appointment, priority);

    // 8. Update queue positions
    await updateQueuePositions(assignedBarber.id);

    // 9. Calculate estimated start time
    const queuePosition = appointment.queuePosition || queue.size();
    const avgServiceDuration = 30; // minutes
    const estimatedStartTime = new Date(
      Date.now() + (queuePosition - 1) * avgServiceDuration * 60000
    );

    await AppointmentModel.update(
      { estimatedStartTime },
      { where: { id: appointment.id } }
    );

    res.status(201).json({
      message: `Priority appointment created and assigned to barber ${assignedBarber.id}`,
      appointment: {
        ...appointment.toJSON(),
        queuePosition,
        estimatedStartTime,
        priority,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Get appointments ordered by priority
export const getAppointmentsByPriority = async (req, res) => {
  try {
    const decodedToken = decodeToken(req.headers.authorization.split(" ")[1]);
    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { barberId } = req.params;

    const appointments = await AppointmentModel.findAll({
      where: {
        barberId: barberId || undefined,
        status: ["pending", "accepted"],
      },
      include: [
        {
          model: UsersModel,
          as: "client",
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: UsersModel,
          as: "barber",
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: ServiceModel,
          as: "service",
          attributes: ["id", "title", "price", "duration"],
        },
      ],
      order: [
        ["priority", "DESC"],
        ["date", "ASC"],
      ],
    });

    res.status(200).json({
      appointments,
      queueInfo: {
        totalInQueue: appointments.length,
        highPriority: appointments.filter(
          (apt) => apt.priority >= PRIORITY_LEVELS.VIP
        ).length,
        regular: appointments.filter(
          (apt) => apt.priority < PRIORITY_LEVELS.VIP
        ).length,
      },
    });
  } catch (error) {
    console.error("Error fetching priority appointments:", error);
    res.status(500).json({ error: error.message });
  }
};

// Process next appointment in queue
export const processNextAppointment = async (req, res) => {
  try {
    const decodedToken = decodeToken(req.headers.authorization.split(" ")[1]);
    if (!decodedToken || decodedToken.role !== "barber") {
      return res
        .status(401)
        .json({ message: "Unauthorized - Barber access required" });
    }

    const barberId = decodedToken.id;
    const queue = getBarberQueue(barberId);

    if (queue.isEmpty()) {
      return res.status(200).json({ message: "No appointments in queue" });
    }

    const nextAppointmentItem = queue.dequeue();
    const appointment = nextAppointmentItem.appointment;

    // Update appointment status to accepted
    await AppointmentModel.update(
      { status: "accepted", queuePosition: null },
      { where: { id: appointment.id } }
    );

    // Update queue positions for remaining appointments
    await updateQueuePositions(barberId);

    res.status(200).json({
      message: "Next appointment processed",
      appointment,
      remainingInQueue: queue.size(),
    });
  } catch (error) {
    console.error("Error processing next appointment:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update appointment priority
export const updateAppointmentPriority = async (req, res) => {
  try {
    const decodedToken = decodeToken(req.headers.authorization.split(" ")[1]);
    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const { clientType, isEmergency = false } = req.body;

    const appointment = await AppointmentModel.findByPk(id, {
      include: [{ model: ServiceModel, as: "service" }],
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Recalculate priority
    const newClientType = isEmergency ? "emergency" : clientType;
    const newPriority = calculateAppointmentPriority(
      newClientType,
      appointment.service.type,
      appointment.date,
      appointment.isReschedule
    );

    // Update appointment
    await AppointmentModel.update(
      {
        priority: newPriority,
        clientType: newClientType,
      },
      { where: { id } }
    );

    // Update queue
    const queue = getBarberQueue(appointment.barberId);
    // Remove old appointment from queue and re-add with new priority
    const updatedAppointment = await AppointmentModel.findByPk(id);
    queue.enqueue(updatedAppointment, newPriority);

    await updateQueuePositions(appointment.barberId);

    res.status(200).json({
      message: "Appointment priority updated",
      appointment: updatedAppointment,
      newPriority,
    });
  } catch (error) {
    console.error("Error updating appointment priority:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get queue status for a barber
export const getQueueStatus = async (req, res) => {
  try {
    const { barberId } = req.params;
    const queue = getBarberQueue(barberId);

    const queuedAppointments = await AppointmentModel.findAll({
      where: {
        barberId,
        status: "pending",
        queuePosition: { [Op.not]: null },
      },
      include: [
        {
          model: UsersModel,
          as: "client",
          attributes: ["first_name", "last_name"],
        },
        {
          model: ServiceModel,
          as: "service",
          attributes: ["title", "duration"],
        },
      ],
      order: [["queuePosition", "ASC"]],
    });

    res.status(200).json({
      barberId,
      queueSize: queue.size(),
      appointments: queuedAppointments,
      estimatedTotalTime: queuedAppointments.reduce(
        (total, apt) => total + (apt.service.duration || 30),
        0
      ),
    });
  } catch (error) {
    console.error("Error getting queue status:", error);
    res.status(500).json({ error: error.message });
  }
};
