import AppointmentModel from "../models/appointmentModel.js";
import { UsersModel } from "../models/model.js";
import { decodeToken } from "./authController.js";
import { PRIORITY_LEVELS, PriorityQueue } from "../utils/priorityQueue.js";
import { Op } from "sequelize";
import { calculateAppointmentPriority } from "../utils/appointmentPriority.js";
import RestaurateurService from "../models/RestaurateurServices.js";

// Global priority queues for each restaurateur
const restaurateursQueues = new Map();

function getrestaurateursQueue(restaurateurId) {
  if (!restaurateursQueues.has(restaurateurId)) {
    restaurateursQueues.set(restaurateurId, new PriorityQueue());
  }
  return restaurateursQueues.get(restaurateurId);
}

async function checkAvailability(requestedDate, restaurateurId) {
  const conflictingAppointment = await AppointmentModel.findOne({
    where: {
      restaurateurId: restaurateurId,
      date: requestedDate,
      status: "accepted",
    },
  });
  return !conflictingAppointment;
}

async function findBestrestaurateursByPriority(appointmentDate, priority) {
  const restaurateurss = await UsersModel.findAll({
    where: { role: "restaurateurs" },
    order: [["id", "ASC"]],
  });

  if (!restaurateurss.length) return null;

  // For high priority appointments, find restaurateurs with shortest high-priority queue
  if (priority >= PRIORITY_LEVELS.VIP) {
    let bestrestaurateurs = null;
    let minHighPriorityCount = Infinity;

    for (const restaurateurs of restaurateurss) {
      const available = await checkAvailability(
        appointmentDate,
        restaurateurs.id,
      );
      if (available) {
        const queue = getrestaurateursQueue(restaurateurs.id);
        const highPriorityCount = queue
          .getAll()
          .filter((apt) => apt.priority >= PRIORITY_LEVELS.VIP).length;

        if (highPriorityCount < minHighPriorityCount) {
          minHighPriorityCount = highPriorityCount;
          bestrestaurateurs = restaurateurs;
        }
      }
    }
    return bestrestaurateurs;
  }

  // For regular appointments, use round robin
  if (!global.roundRobinIndex) global.roundRobinIndex = 0;
  const startIndex = global.roundRobinIndex;

  for (let i = 0; i < restaurateurss.length; i++) {
    const restaurateurs =
      restaurateurss[(startIndex + i) % restaurateurss.length];
    const available = await checkAvailability(
      appointmentDate,
      restaurateurs.id,
    );
    if (available) {
      global.roundRobinIndex = (startIndex + i + 1) % restaurateurss.length;
      return restaurateurs;
    }
  }

  return null;
}

async function updateQueuePositions(restaurateurId) {
  const queue = getrestaurateursQueue(restaurateurId);
  const appointments = queue.getAll();

  for (let i = 0; i < appointments.length; i++) {
    await AppointmentModel.update(
      { queuePosition: i + 1 },
      { where: { id: appointments[i].id } },
    );
  }
}

async function countActiveAppointments(restaurateurId) {
  return AppointmentModel.count({
    where: {
      restaurateurId,
      status: { [Op.in]: ["pending", "accepted", "in_progress"] },
    },
  });
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000; // 1 hour gap between same-restaurant bookings

function canBookAfterOneDay(existingAppointments, desiredDate) {
  if (!existingAppointments || !existingAppointments.length) return true;

  const desiredTime = desiredDate.getTime();
  const latestAppointmentTime = existingAppointments.reduce(
    (latest, appointment) => {
      const appointmentTime = new Date(appointment.date).getTime();
      return Math.max(latest, appointmentTime);
    },
    0,
  );

  return desiredTime >= latestAppointmentTime + ONE_DAY_MS;
}

/**
 * Check if booking is allowed after minimum gap time at same restaurant
 * Allows multiple bookings at same restaurant if they are spaced minimum gap apart
 * @param {Array} sameRestaurantAppointments - Appointments at same restaurant
 * @param {Date} desiredDate - Desired booking date
 * @param {number} minGapMs - Minimum gap in milliseconds (default: 1 hour)
 * @returns {boolean} True if booking is allowed
 */
function canBookAfterMinimumGap(
  sameRestaurantAppointments,
  desiredDate,
  minGapMs = ONE_HOUR_MS,
) {
  if (!sameRestaurantAppointments || sameRestaurantAppointments.length === 0)
    return true;

  const desiredTime = new Date(desiredDate).getTime();

  for (const appointment of sameRestaurantAppointments) {
    const appointmentTime = new Date(appointment.date).getTime();
    const timeDifference = Math.abs(desiredTime - appointmentTime);

    if (timeDifference < minGapMs) {
      return false;
    }
  }

  return true;
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
      service_id,
      serviceId,
      date,
      clientType = "regular",
      isReschedule = false,
      restaurateurs_id,
      restaurateur_id,
    } = req.body;
    const selectedServiceId = service_id || serviceId;
    const restaurateurId = restaurateurs_id || restaurateur_id;

    if (!selectedServiceId || !date) {
      return res.status(400).json({
        message: "service_id and date are required",
        received: { service_id: selectedServiceId, date },
      });
    }

    if (!restaurateurId) {
      return res.status(400).json({
        message: "restaurateur_id is required for this booking request",
        received: { restaurateur_id: restaurateurId },
      });
    }

    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Validate service exists
    const service = await RestaurateurService.findByPk(selectedServiceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: `Service with ID ${selectedServiceId} not found`,
        received: {
          service_id: selectedServiceId,
          type: typeof selectedServiceId,
        },
        hint: "Ensure the service_id is a valid RestaurateurService ID (not ServiceModel ID)",
      });
    }

    // Validate restaurateur exists and get capacity
    if (restaurateurId) {
      const restaurateur = await UsersModel.findOne({
        where: { id: restaurateurId, role: "restaurateurs" },
      });

      if (!restaurateur) {
        return res.status(404).json({
          success: false,
          message: `Restaurateur with ID ${restaurateurId} not found`,
        });
      }

      // Check capacity
      const activeAppointments = await countActiveAppointments(restaurateurId);
      const seatCapacity = restaurateur.seat_capacity ?? 10;
      if (activeAppointments >= seatCapacity) {
        return res.status(409).json({
          success: false,
          message:
            "Restaurant is fully booked. Please choose another time or restaurant.",
          details: {
            activeAppointments,
            seatCapacity,
          },
        });
      }
    }

    // Allow multiple bookings but enforce spacing constraints
    // Active statuses considered: pending, accepted, in_progress
    const existingAppointments = await AppointmentModel.findAll({
      where: {
        clientId,
        status: { [Op.in]: ["pending", "accepted", "in_progress"] },
      },
      order: [["date", "DESC"]],
    });

    // If booking at same restaurant, enforce 1-hour gap between appointments
    if (restaurateurId && existingAppointments.length > 0) {
      const sameRestaurantAppointments = existingAppointments.filter(
        (apt) => apt.restaurateurId === restaurateurId,
      );

      if (sameRestaurantAppointments.length > 0) {
        const canBook = canBookAfterMinimumGap(
          sameRestaurantAppointments,
          appointmentDate,
          ONE_HOUR_MS,
        );

        if (!canBook) {
          return res.status(409).json({
            success: false,
            message:
              "Please book at least 1 hour after your previous appointment at this restaurant.",
            details: {
              minGapRequired: "1 hour",
              reason:
                "Allows multiple bookings while preventing consecutive bookings",
            },
          });
        }
      }
    }

    // Create appointment with validated data
    try {
      const appointment = await AppointmentModel.create({
        serviceId: selectedServiceId,
        clientId,
        restaurateurId: restaurateurId || null,
        date: appointmentDate,
        status: "pending",
        clientType,
        isReschedule,
      });

      res.status(201).json({
        success: true,
        message: `Appointment created successfully`,
        appointment: {
          ...appointment.toJSON(),
        },
      });
    } catch (dbError) {
      // Handle FK constraint violations
      if (dbError.name === "SequelizeForeignKeyConstraintError") {
        return res.status(400).json({
          success: false,
          message: "Foreign key constraint violation",
          details: dbError.message,
          hint: "Ensure serviceId references a valid RestaurateurService and restaurateurId references a valid restaurateur user",
        });
      }
      throw dbError;
    }
  } catch (error) {
    console.error("createAppointment error:", error);

    // Handle FK constraint violations
    if (
      error.name === "SequelizeForeignKeyConstraintError" ||
      (error.name === "SequelizeDatabaseError" &&
        error.message &&
        error.message.includes("foreign key"))
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Foreign key constraint violation - Invalid service or restaurateur ID",
        details: error.message,
        hint: "Ensure the service_id exists in RestaurateurService table and restaurateur_id exists in Users table with role='restaurateurs'",
      });
    }

    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeDatabaseError"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get appointments ordered by priority
export const getAppointmentsByPriority = async (req, res) => {
  try {
    const decodedToken = decodeToken(req.headers.authorization.split(" ")[1]);
    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { restaurateurId } = req.params;

    const barbarId = restaurateurId;

    const appointments = await AppointmentModel.findAll({
      where: {
        restaurateurId: barbarId || undefined,
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
          as: "restaurateurs",
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: RestaurateurService,
          as: "service",
          attributes: ["id", "name", "price", "duration"],
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
          (apt) => apt.priority >= PRIORITY_LEVELS.VIP,
        ).length,
        regular: appointments.filter(
          (apt) => apt.priority < PRIORITY_LEVELS.VIP,
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
    if (!decodedToken || decodedToken.role !== "restaurateurs") {
      return res
        .status(401)
        .json({ message: "Unauthorized - restaurateurs access required" });
    }

    const barbarId = decodedToken.id;
    const queue = getrestaurateursQueue(barbarId);

    if (queue.isEmpty()) {
      return res.status(200).json({ message: "No appointments in queue" });
    }

    const nextAppointmentItem = queue.dequeue();
    const appointment = nextAppointmentItem.appointment;

    // Update appointment status to accepted
    await AppointmentModel.update(
      { status: "accepted", queuePosition: null },
      { where: { id: appointment.id } },
    );

    // Update queue positions for remaining appointments
    await updateQueuePositions(barbarId);

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
      include: [{ model: RestaurateurService, as: "service" }],
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
      appointment.isReschedule,
    );

    // Update appointment
    await AppointmentModel.update(
      {
        priority: newPriority,
        clientType: newClientType,
      },
      { where: { id } },
    );

    // Update queue
    const queue = getrestaurateursQueue(appointment.restaurateurId);
    // Remove old appointment from queue and re-add with new priority
    const updatedAppointment = await AppointmentModel.findByPk(id);
    queue.enqueue(updatedAppointment, newPriority);

    await updateQueuePositions(appointment.restaurateurId);

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

// Get queue status for a restaurateurs
export const getQueueStatus = async (req, res) => {
  try {
    const { restaurateurId, barbarId: barbarParam } = req.params;
    const id = restaurateurId ?? barbarParam;
    const queue = getrestaurateursQueue(id);

    const queuedAppointments = await AppointmentModel.findAll({
      where: {
        restaurateurId: id,
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
          model: RestaurateurService,
          as: "service",
          attributes: ["name", "duration"],
        },
      ],
      order: [["queuePosition", "ASC"]],
    });

    res.status(200).json({
      restaurateurId: id,
      queueSize: queue.size(),
      appointments: queuedAppointments,
      estimatedTotalTime: queuedAppointments.reduce(
        (total, apt) => total + (apt.service.duration || 30),
        0,
      ),
    });
  } catch (error) {
    console.error("Error getting queue status:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete an appointment

export const getAppointmentById = async (req, res) => {
  try {
    const decodedToken = decodeToken(req.headers.authorization.split(" ")[1]);
    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const appointment = await AppointmentModel.findAll({
      where: { clientId: decodedToken.id },
      include: [
        {
          model: UsersModel,
          as: "client",
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: UsersModel,
          as: "restaurateurs",
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: RestaurateurService,
          as: "service",
          attributes: ["id", "name", "price", "duration"],
        },
      ],
    });

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllAppointment = async (req, res) => {
  try {
    const decodedToken = decodeToken(req.headers.authorization.split(" ")[1]);
    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const appointments = await AppointmentModel.findAll({
      include: [
        {
          model: UsersModel,
          as: "client", // ✅ must match association
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: UsersModel,
          as: "restaurateurs", // ✅ must match association
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: RestaurateurService,
          as: "service", // ✅ must match association
          attributes: ["id", "name", "price"],
        },
      ],
    });
    console.log({ appointments });

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error while getting appointments:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const decodedToken = decodeToken(req.headers.authorization.split(" ")[1]);
    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { id } = req.params;
    const { date, serviceId, status } = req.body;

    // If this is a status update only
    if (status && !date && !serviceId) {
      // Validate status
      if (
        !["pending", "accepted", "rejected", "cancelled", "completed"].includes(
          status,
        )
      ) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      const appointment = await AppointmentModel.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      // Update appointment status
      const [updated] = await AppointmentModel.update(
        { status },
        { where: { id } },
      );

      if (updated) {
        // Get the updated appointment to return
        const updatedAppointment = await AppointmentModel.findByPk(id, {
          include: [
            {
              model: UsersModel,
              as: "client",
              attributes: [
                "id",
                "first_name",
                "last_name",
                "email",
                "phone_number",
              ],
            },
            {
              model: RestaurateurService,
              as: "service",
              attributes: ["id", "name", "price", "duration"],
            },
          ],
        });

        return res.status(200).json({
          message: `Appointment status updated to ${status} successfully`,
          data: updatedAppointment,
        });
      }

      return res
        .status(404)
        .json({ message: "Failed to update appointment status" });
    }

    // Otherwise, this is a date/service update
    // Validate serviceId if provided
    if (serviceId) {
      const service = await RestaurateurService.findByPk(serviceId);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
    }

    // Create update object with only the fields that were provided
    const updateObject = {};
    if (date) updateObject.date = date;
    if (serviceId) updateObject.serviceId = serviceId;
    if (status) updateObject.status = status;

    // Update appointment
    const [updated] = await AppointmentModel.update(updateObject, {
      where: { id },
    });

    if (updated) {
      return res
        .status(200)
        .json({ message: "Appointment updated successfully" });
    }

    return res.status(404).json({ message: "Appointment not found" });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const decodedToken = decodeToken(req.headers.authorization.split(" ")[1]);
    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // Delete appointment
    const deleted = await AppointmentModel.destroy({
      where: { id, userId: decodedToken.id }, // Assuming req.user is set by authentication middleware
    });

    if (deleted) {
      return res
        .status(200)
        .json({ message: "Appointment deleted successfully" });
    }

    return res.status(404).json({ message: "Appointment not found" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get appointments for a specific restaurateurs
export const getAppointmentsBybarbarId = async (req, res) => {
  try {
    // Debug log to help trace requests
    console.debug(
      "getAppointmentsBybarbarId - req.params:",
      req.params,
      "req.query:",
      req.query,
    );

    // support multiple param and query name variants for compatibility
    const restaurateurId =
      req.params.restaurateurId ??
      req.params.restaurateursId ??
      req.params.barbarId ??
      req.params.restaurateur_id ??
      req.params.restaurateurs_id ??
      req.query.restaurateurId ??
      req.query.restaurateursId ??
      req.query.barbarId ??
      req.query.restaurateur_id ??
      req.query.restaurateurs_id;

    if (!restaurateurId) {
      return res.status(400).json({ message: "restaurateurs ID is required" });
    }

    const barbarId = restaurateurId; // local name used in legacy code

    const appointments = await AppointmentModel.findAll({
      where: { restaurateurId: barbarId },
      include: [
        {
          model: UsersModel,
          as: "client",
          attributes: [
            "id",
            "first_name",
            "last_name",
            "email",
            "phone_number",
          ],
        },
        {
          model: RestaurateurService,
          as: "service",
          attributes: ["id", "name", "price", "duration"],
        },
      ],
      order: [["date", "ASC"]],
    });

    // Format the response to match the structure needed by the client
    const formattedAppointments = appointments.map((appointment) => {
      const appointmentData = appointment.toJSON();
      return {
        id: appointmentData.id,
        client_id: appointmentData.clientId,
        client_name: appointmentData.client
          ? `${appointmentData.client.first_name} ${appointmentData.client.last_name}`
          : "Unknown Client",
        service_id: appointmentData.serviceId,
        service_name: appointmentData.service
          ? appointmentData.service.name
          : "Unknown Service",
        date: appointmentData.date,
        status: appointmentData.status,
        duration: appointmentData.service
          ? appointmentData.service.duration
          : "30",
        price: appointmentData.service ? appointmentData.service.price : "0",
        restaurateurs_id: appointmentData.restaurateurId,
        phone: appointmentData.client
          ? appointmentData.client.phone_number
          : null,
      };
    });

    res.status(200).json({
      message: "Appointments retrieved successfully",
      data: formattedAppointments,
    });
  } catch (error) {
    console.error("Error fetching restaurateurs appointments:", error);
    res.status(500).json({ error: error.message });
  }
};

// Endpoint to specifically confirm an appointment
export const confirmAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const decodedToken = decodeToken(req.headers.authorization.split(" ")[1]);

    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify the user is a restaurateurs
    if (decodedToken.role !== "restaurateurs") {
      return res
        .status(403)
        .json({ message: "Only restaurateurss can confirm appointments" });
    }

    // Find the appointment
    const appointment = await AppointmentModel.findByPk(id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Verify the restaurateurs is assigned to this appointment
    if (appointment.restaurateurId !== decodedToken.id) {
      return res
        .status(403)
        .json({ message: "You can only confirm your own appointments" });
    }

    // Update the status
    const [updated] = await AppointmentModel.update(
      { status: "accepted" },
      { where: { id } },
    );

    if (updated) {
      const updatedAppointment = await AppointmentModel.findByPk(id, {
        include: [
          {
            model: UsersModel,
            as: "client",
            attributes: [
              "id",
              "first_name",
              "last_name",
              "email",
              "phone_number",
            ],
          },
          {
            model: RestaurateurService,
            as: "service",
            attributes: ["id", "name", "price", "duration"],
          },
        ],
      });

      return res.status(200).json({
        message: "Appointment confirmed successfully",
        data: updatedAppointment,
      });
    }

    return res.status(500).json({ message: "Failed to confirm appointment" });
  } catch (error) {
    console.error("Error confirming appointment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Endpoint to specifically cancel an appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const decodedToken = decodeToken(req.headers.authorization.split(" ")[1]);

    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find the appointment
    const appointment = await AppointmentModel.findByPk(id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Different rules based on user role
    if (decodedToken.role === "restaurateurs") {
      // restaurateurss can only cancel their own appointments
      if (appointment.restaurateurId !== decodedToken.id) {
        return res
          .status(403)
          .json({ message: "You can only cancel your own appointments" });
      }
    } else if (decodedToken.role === "client") {
      // Clients can only cancel their own appointments
      if (appointment.clientId !== decodedToken.id) {
        return res
          .status(403)
          .json({ message: "You can only cancel your own appointments" });
      }
    } else if (decodedToken.role !== "admin") {
      // Admin can cancel any appointment
      return res
        .status(403)
        .json({ message: "You do not have permission to cancel appointments" });
    }

    // Update the status
    const [updated] = await AppointmentModel.update(
      { status: "cancelled" },
      { where: { id } },
    );

    if (updated) {
      const updatedAppointment = await AppointmentModel.findByPk(id, {
        include: [
          {
            model: UsersModel,
            as: "client",
            attributes: [
              "id",
              "first_name",
              "last_name",
              "email",
              "phone_number",
            ],
          },
          {
            model: RestaurateurService,
            as: "service",
            attributes: ["id", "name", "price", "duration"],
          },
        ],
      });

      // If the appointment belonged to a restaurateur, update queue positions
      try {
        if (updatedAppointment && updatedAppointment.restaurateurId) {
          await updateQueuePositions(updatedAppointment.restaurateurId);
        }
      } catch (qErr) {
        console.error("Error updating queue positions after cancel:", qErr);
        // non-fatal — continue returning success to client
      }

      return res.status(200).json({
        message: "Appointment cancelled successfully",
        data: updatedAppointment,
      });
    }

    return res.status(500).json({ message: "Failed to cancel appointment" });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Endpoint to mark an appointment as completed
export const completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const decodedToken = decodeToken(req.headers.authorization.split(" ")[1]);

    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify the user is a restaurateurs
    if (decodedToken.role !== "restaurateurs") {
      return res.status(403).json({
        message: "Only restaurateurss can mark appointments as completed",
      });
    }

    // Find the appointment
    const appointment = await AppointmentModel.findByPk(id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Verify the restaurateurs is assigned to this appointment
    if (appointment.restaurateurId !== decodedToken.id) {
      return res
        .status(403)
        .json({ message: "You can only complete your own appointments" });
    }

    // Update the status
    const [updated] = await AppointmentModel.update(
      { status: "completed" },
      { where: { id } },
    );

    if (updated) {
      const updatedAppointment = await AppointmentModel.findByPk(id, {
        include: [
          {
            model: UsersModel,
            as: "client",
            attributes: [
              "id",
              "first_name",
              "last_name",
              "email",
              "phone_number",
            ],
          },
          {
            model: BarberService,
            as: "service",
            attributes: ["id", "name", "price", "duration"],
          },
        ],
      });

      return res.status(200).json({
        message: "Appointment marked as completed successfully",
        data: updatedAppointment,
      });
    }

    return res.status(500).json({ message: "Failed to complete appointment" });
  } catch (error) {
    console.error("Error completing appointment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get appointments for a specific client
export const getAppointmentsByClientId = async (req, res) => {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res.status(400).json({ message: "Client ID is required" });
    }

    const appointments = await AppointmentModel.findAll({
      where: { clientId },
      include: [
        {
          model: UsersModel,
          as: "restaurateurs",
          attributes: [
            "id",
            "first_name",
            "last_name",
            "email",
            "phone_number",
          ],
        },
        {
          model: RestaurateurService,
          as: "service",
          attributes: ["id", "name", "price", "duration"],
        },
      ],
      order: [["date", "ASC"]],
    });

    // Format the response to match the structure needed by the client
    const formattedAppointments = appointments.map((appointment) => {
      const appointmentData = appointment.toJSON();
      return {
        id: appointmentData.id,
        client_id: appointmentData.clientId,
        restaurateurs_id: appointmentData.restaurateurId,
        restaurateurs_name: appointmentData.restaurateurs
          ? `${appointmentData.restaurateurs.first_name} ${appointmentData.restaurateurs.last_name}`
          : "Unknown restaurateurs",
        service_id: appointmentData.serviceId,
        service_name: appointmentData.service
          ? appointmentData.service.name
          : "Unknown Service",
        date: appointmentData.date,
        status: appointmentData.status,
        duration: appointmentData.service
          ? appointmentData.service.duration
          : "30",
        price: appointmentData.service ? appointmentData.service.price : "0",
      };
    });

    res.status(200).json({
      message: "Appointments retrieved successfully",
      data: formattedAppointments,
    });
  } catch (error) {
    console.error("Error fetching client appointments:", error);
    res.status(500).json({ error: error.message });
  }
};
