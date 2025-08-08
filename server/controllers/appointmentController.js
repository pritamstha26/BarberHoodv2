import AppointmentModel from '../models/appointmentModel.js';
import { UsersModel } from '../models/model.js';
import { decodeToken } from './authController.js';
import { PRIORITY_LEVELS, PriorityQueue } from '../utils/priorityQueue.js';
import { Op } from 'sequelize';
import { calculateAppointmentPriority } from '../utils/appointmentPriority.js';
import BarberService from '../models/barberServices.js';

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
      status: 'accepted'
    }
  });
  return !conflictingAppointment;
}

async function findBestBarberByPriority(appointmentDate, priority) {
  const barbers = await UsersModel.findAll({
    where: { role: 'barber' },
    order: [['id', 'ASC']]
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
    await AppointmentModel.update({ queuePosition: i + 1 }, { where: { id: appointments[i].id } });
  }
}

export const createAppointment = async (req, res) => {
  try {
    // 1. Authenticate user
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decodedToken = decodeToken(token);
    if (!decodedToken) return res.status(401).json({ message: 'Unauthorized' });

    const clientId = decodedToken.id;

    // 2. Extract request body
    const {
      service_id,
      date,
      clientType = 'regular',
      isReschedule = false,
      barber_id: barberId
    } = req.body;
    if (!service_id || !date) {
      return res.status(400).json({ message: 'serviceId and date are required' });
    }

    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate)) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const service = await BarberService.findByPk(service_id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const appointment = await AppointmentModel.create({
      serviceId: service_id,
      clientId,
      barberId,
      date: appointmentDate,
      status: 'pending',
      clientType,
      isReschedule
    });

    res.status(201).json({
      message: `Priority appointment created and assigned to barber `,
      appointment: {
        ...appointment.toJSON()
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Get appointments ordered by priority
export const getAppointmentsByPriority = async (req, res) => {
  try {
    const decodedToken = decodeToken(req.headers.authorization.split(' ')[1]);
    if (!decodedToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { barberId } = req.params;

    const appointments = await AppointmentModel.findAll({
      where: {
        barberId: barberId || undefined,
        status: ['pending', 'accepted']
      },
      include: [
        {
          model: UsersModel,
          as: 'client',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: UsersModel,
          as: 'barber',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: BarberService,
          as: 'service',
          attributes: ['id', 'name', 'price', 'duration']
        }
      ],
      order: [
        ['priority', 'DESC'],
        ['date', 'ASC']
      ]
    });

    res.status(200).json({
      appointments,
      queueInfo: {
        totalInQueue: appointments.length,
        highPriority: appointments.filter((apt) => apt.priority >= PRIORITY_LEVELS.VIP).length,
        regular: appointments.filter((apt) => apt.priority < PRIORITY_LEVELS.VIP).length
      }
    });
  } catch (error) {
    console.error('Error fetching priority appointments:', error);
    res.status(500).json({ error: error.message });
  }
};

// Process next appointment in queue
export const processNextAppointment = async (req, res) => {
  try {
    const decodedToken = decodeToken(req.headers.authorization.split(' ')[1]);
    if (!decodedToken || decodedToken.role !== 'barber') {
      return res.status(401).json({ message: 'Unauthorized - Barber access required' });
    }

    const barberId = decodedToken.id;
    const queue = getBarberQueue(barberId);

    if (queue.isEmpty()) {
      return res.status(200).json({ message: 'No appointments in queue' });
    }

    const nextAppointmentItem = queue.dequeue();
    const appointment = nextAppointmentItem.appointment;

    // Update appointment status to accepted
    await AppointmentModel.update(
      { status: 'accepted', queuePosition: null },
      { where: { id: appointment.id } }
    );

    // Update queue positions for remaining appointments
    await updateQueuePositions(barberId);

    res.status(200).json({
      message: 'Next appointment processed',
      appointment,
      remainingInQueue: queue.size()
    });
  } catch (error) {
    console.error('Error processing next appointment:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update appointment priority
export const updateAppointmentPriority = async (req, res) => {
  try {
    const decodedToken = decodeToken(req.headers.authorization.split(' ')[1]);
    if (!decodedToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;
    const { clientType, isEmergency = false } = req.body;

    const appointment = await AppointmentModel.findByPk(id, {
      include: [{ model: BarberService, as: 'service' }]
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Recalculate priority
    const newClientType = isEmergency ? 'emergency' : clientType;
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
        clientType: newClientType
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
      message: 'Appointment priority updated',
      appointment: updatedAppointment,
      newPriority
    });
  } catch (error) {
    console.error('Error updating appointment priority:', error);
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
        status: 'pending',
        queuePosition: { [Op.not]: null }
      },
      include: [
        {
          model: UsersModel,
          as: 'client',
          attributes: ['first_name', 'last_name']
        },
        {
          model: BarberService,
          as: 'service',
          attributes: ['name', 'duration']
        }
      ],
      order: [['queuePosition', 'ASC']]
    });

    res.status(200).json({
      barberId,
      queueSize: queue.size(),
      appointments: queuedAppointments,
      estimatedTotalTime: queuedAppointments.reduce(
        (total, apt) => total + (apt.service.duration || 30),
        0
      )
    });
  } catch (error) {
    console.error('Error getting queue status:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete an appointment

export const getAppointmentById = async (req, res) => {
  try {
    const decodedToken = decodeToken(req.headers.authorization.split(' ')[1]);
    if (!decodedToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const appointment = await AppointmentModel.findAll({
      where: { clientId: decodedToken.id },
      include: [
        {
          model: UsersModel,
          as: 'client',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: UsersModel,
          as: 'barber',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: BarberService,
          as: 'service',
          attributes: ['id', 'name', 'price', 'duration']
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllAppointment = async (req, res) => {
  try {
    const decodedToken = decodeToken(req.headers.authorization.split(' ')[1]);
    if (!decodedToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const appointments = await AppointmentModel.findAll({
      include: [
        {
          model: UsersModel,
          as: 'client', // ✅ must match association
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: UsersModel,
          as: 'barber', // ✅ must match association
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: BarberService,
          as: 'service', // ✅ must match association
          attributes: ['id', 'name', 'price']
        }
      ]
    });
    console.log({ appointments });

    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error while getting appointments:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const decodedToken = decodeToken(req.headers.authorization.split(' ')[1]);
    if (!decodedToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { id } = req.params;
    const { date, serviceId, status } = req.body;

    // If this is a status update only
    if (status && !date && !serviceId) {
      // Validate status
      if (!['pending', 'accepted', 'rejected', 'cancelled', 'completed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }

      const appointment = await AppointmentModel.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      // Update appointment status
      const [updated] = await AppointmentModel.update({ status }, { where: { id } });

      if (updated) {
        // Get the updated appointment to return
        const updatedAppointment = await AppointmentModel.findByPk(id, {
          include: [
            {
              model: UsersModel,
              as: 'client',
              attributes: ['id', 'first_name', 'last_name', 'email', 'phone_number']
            },
            {
              model: BarberService,
              as: 'service',
              attributes: ['id', 'name', 'price', 'duration']
            }
          ]
        });

        return res.status(200).json({
          message: `Appointment status updated to ${status} successfully`,
          data: updatedAppointment
        });
      }

      return res.status(404).json({ message: 'Failed to update appointment status' });
    }

    // Otherwise, this is a date/service update
    // Validate serviceId if provided
    if (serviceId) {
      const service = await BarberService.findByPk(serviceId);
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
    }

    // Create update object with only the fields that were provided
    const updateObject = {};
    if (date) updateObject.date = date;
    if (serviceId) updateObject.serviceId = serviceId;
    if (status) updateObject.status = status;

    // Update appointment
    const [updated] = await AppointmentModel.update(updateObject, { where: { id } });

    if (updated) {
      return res.status(200).json({ message: 'Appointment updated successfully' });
    }

    return res.status(404).json({ message: 'Appointment not found' });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const decodedToken = decodeToken(req.headers.authorization.split(' ')[1]);
    if (!decodedToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    // Delete appointment
    const deleted = await AppointmentModel.destroy({
      where: { id, userId: decodedToken.id } // Assuming req.user is set by authentication middleware
    });

    if (deleted) {
      return res.status(200).json({ message: 'Appointment deleted successfully' });
    }

    return res.status(404).json({ message: 'Appointment not found' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get appointments for a specific barber
export const getAppointmentsByBarberId = async (req, res) => {
  try {
    const { barberId } = req.params;

    if (!barberId) {
      return res.status(400).json({ message: 'Barber ID is required' });
    }

    const appointments = await AppointmentModel.findAll({
      where: { barberId },
      include: [
        {
          model: UsersModel,
          as: 'client',
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone_number']
        },
        {
          model: BarberService,
          as: 'service',
          attributes: ['id', 'name', 'price', 'duration']
        }
      ],
      order: [['date', 'ASC']]
    });

    // Format the response to match the structure needed by the client
    const formattedAppointments = appointments.map((appointment) => {
      const appointmentData = appointment.toJSON();
      return {
        id: appointmentData.id,
        client_id: appointmentData.clientId,
        client_name: appointmentData.client
          ? `${appointmentData.client.first_name} ${appointmentData.client.last_name}`
          : 'Unknown Client',
        service_id: appointmentData.serviceId,
        service_name: appointmentData.service ? appointmentData.service.name : 'Unknown Service',
        date: appointmentData.date,
        status: appointmentData.status,
        duration: appointmentData.service ? appointmentData.service.duration : '30',
        price: appointmentData.service ? appointmentData.service.price : '0',
        barber_id: appointmentData.barberId,
        phone: appointmentData.client ? appointmentData.client.phone_number : null
      };
    });

    res.status(200).json({
      message: 'Appointments retrieved successfully',
      data: formattedAppointments
    });
  } catch (error) {
    console.error('Error fetching barber appointments:', error);
    res.status(500).json({ error: error.message });
  }
};

// Endpoint to specifically confirm an appointment
export const confirmAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const decodedToken = decodeToken(req.headers.authorization.split(' ')[1]);

    if (!decodedToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify the user is a barber
    if (decodedToken.role !== 'barber') {
      return res.status(403).json({ message: 'Only barbers can confirm appointments' });
    }

    // Find the appointment
    const appointment = await AppointmentModel.findByPk(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify the barber is assigned to this appointment
    if (appointment.barberId !== decodedToken.id) {
      return res.status(403).json({ message: 'You can only confirm your own appointments' });
    }

    // Update the status
    const [updated] = await AppointmentModel.update({ status: 'accepted' }, { where: { id } });

    if (updated) {
      const updatedAppointment = await AppointmentModel.findByPk(id, {
        include: [
          {
            model: UsersModel,
            as: 'client',
            attributes: ['id', 'first_name', 'last_name', 'email', 'phone_number']
          },
          {
            model: BarberService,
            as: 'service',
            attributes: ['id', 'name', 'price', 'duration']
          }
        ]
      });

      return res.status(200).json({
        message: 'Appointment confirmed successfully',
        data: updatedAppointment
      });
    }

    return res.status(500).json({ message: 'Failed to confirm appointment' });
  } catch (error) {
    console.error('Error confirming appointment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Endpoint to specifically cancel an appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const decodedToken = decodeToken(req.headers.authorization.split(' ')[1]);

    if (!decodedToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find the appointment
    const appointment = await AppointmentModel.findByPk(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Different rules based on user role
    if (decodedToken.role === 'barber') {
      // Barbers can only cancel their own appointments
      if (appointment.barberId !== decodedToken.id) {
        return res.status(403).json({ message: 'You can only cancel your own appointments' });
      }
    } else if (decodedToken.role === 'client') {
      // Clients can only cancel their own appointments
      if (appointment.clientId !== decodedToken.id) {
        return res.status(403).json({ message: 'You can only cancel your own appointments' });
      }
    } else if (decodedToken.role !== 'admin') {
      // Admin can cancel any appointment
      return res.status(403).json({ message: 'You do not have permission to cancel appointments' });
    }

    // Update the status
    const [updated] = await AppointmentModel.update({ status: 'cancelled' }, { where: { id } });

    if (updated) {
      const updatedAppointment = await AppointmentModel.findByPk(id, {
        include: [
          {
            model: UsersModel,
            as: 'client',
            attributes: ['id', 'first_name', 'last_name', 'email', 'phone_number']
          },
          {
            model: BarberService,
            as: 'service',
            attributes: ['id', 'name', 'price', 'duration']
          }
        ]
      });

      return res.status(200).json({
        message: 'Appointment cancelled successfully',
        data: updatedAppointment
      });
    }

    return res.status(500).json({ message: 'Failed to cancel appointment' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Endpoint to mark an appointment as completed
export const completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const decodedToken = decodeToken(req.headers.authorization.split(' ')[1]);

    if (!decodedToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify the user is a barber
    if (decodedToken.role !== 'barber') {
      return res.status(403).json({ message: 'Only barbers can mark appointments as completed' });
    }

    // Find the appointment
    const appointment = await AppointmentModel.findByPk(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify the barber is assigned to this appointment
    if (appointment.barberId !== decodedToken.id) {
      return res.status(403).json({ message: 'You can only complete your own appointments' });
    }

    // Update the status
    const [updated] = await AppointmentModel.update({ status: 'completed' }, { where: { id } });

    if (updated) {
      const updatedAppointment = await AppointmentModel.findByPk(id, {
        include: [
          {
            model: UsersModel,
            as: 'client',
            attributes: ['id', 'first_name', 'last_name', 'email', 'phone_number']
          },
          {
            model: BarberService,
            as: 'service',
            attributes: ['id', 'name', 'price', 'duration']
          }
        ]
      });

      return res.status(200).json({
        message: 'Appointment marked as completed successfully',
        data: updatedAppointment
      });
    }

    return res.status(500).json({ message: 'Failed to complete appointment' });
  } catch (error) {
    console.error('Error completing appointment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get appointments for a specific client
export const getAppointmentsByClientId = async (req, res) => {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res.status(400).json({ message: 'Client ID is required' });
    }

    const appointments = await AppointmentModel.findAll({
      where: { clientId },
      include: [
        {
          model: UsersModel,
          as: 'barber',
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone_number']
        },
        {
          model: BarberService,
          as: 'service',
          attributes: ['id', 'name', 'price', 'duration']
        }
      ],
      order: [['date', 'ASC']]
    });

    // Format the response to match the structure needed by the client
    const formattedAppointments = appointments.map((appointment) => {
      const appointmentData = appointment.toJSON();
      return {
        id: appointmentData.id,
        client_id: appointmentData.clientId,
        barber_id: appointmentData.barberId,
        barber_name: appointmentData.barber
          ? `${appointmentData.barber.first_name} ${appointmentData.barber.last_name}`
          : 'Unknown Barber',
        service_id: appointmentData.serviceId,
        service_name: appointmentData.service ? appointmentData.service.name : 'Unknown Service',
        date: appointmentData.date,
        status: appointmentData.status,
        duration: appointmentData.service ? appointmentData.service.duration : '30',
        price: appointmentData.service ? appointmentData.service.price : '0'
      };
    });

    res.status(200).json({
      message: 'Appointments retrieved successfully',
      data: formattedAppointments
    });
  } catch (error) {
    console.error('Error fetching client appointments:', error);
    res.status(500).json({ error: error.message });
  }
};
