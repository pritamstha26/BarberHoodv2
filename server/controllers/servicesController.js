import ServiceModel from '../models/service.js';

import jwt from 'jsonwebtoken';
import { decodeToken } from './authController.js';
import { Op } from 'sequelize';
import AppointmentModel from '../models/appointmentModel.js';
import { UsersModel } from '../models/model.js';
import { calculateAppointmentPriority } from '../utils/appointmentPriority.js';
import { PRIORITY_LEVELS } from '../utils/priorityQueue.js';

// Helper function to find the best available barber
async function findAvailableBarber(date, clientType, serviceType) {
  // Get all barbers
  const barbers = await UsersModel.findAll({
    where: { role: 'barber' }
  });

  if (!barbers.length) return null;

  // Calculate appointment priority based on client type and service type
  const priority = calculateAppointmentPriority(clientType, serviceType, date, false);

  // Different allocation strategies based on priority
  if (priority >= PRIORITY_LEVELS.VIP) {
    // For high priority clients, find barber with least high-priority appointments
    let bestBarber = null;
    let leastAppointments = Infinity;

    for (const barber of barbers) {
      // Check this barber's availability for the requested time
      const conflicting = await AppointmentModel.findOne({
        where: {
          barberId: barber.id,
          date: new Date(date),
          status: {
            [Op.in]: ['pending', 'accepted']
          }
        }
      });

      if (!conflicting) {
        // Count high-priority appointments for this barber
        const highPriorityCount = await AppointmentModel.count({
          where: {
            barberId: barber.id,
            priority: { [Op.gte]: PRIORITY_LEVELS.VIP },
            status: {
              [Op.in]: ['pending', 'accepted']
            }
          }
        });

        if (highPriorityCount < leastAppointments) {
          leastAppointments = highPriorityCount;
          bestBarber = barber;
        }
      }
    }

    return bestBarber;
  } else {
    // For regular clients, use a load balancing approach
    // Sort barbers by number of active appointments (ascending)
    const barberLoad = await Promise.all(
      barbers.map(async (barber) => {
        const appointmentCount = await AppointmentModel.count({
          where: {
            barberId: barber.id,
            status: {
              [Op.in]: ['pending', 'accepted']
            }
          }
        });

        // Check availability for requested time
        const conflicting = await AppointmentModel.findOne({
          where: {
            barberId: barber.id,
            date: new Date(date),
            status: {
              [Op.in]: ['pending', 'accepted']
            }
          }
        });

        return {
          barber,
          appointmentCount,
          isAvailable: !conflicting
        };
      })
    );

    // Filter available barbers and sort by load
    const availableBarbers = barberLoad
      .filter((item) => item.isAvailable)
      .sort((a, b) => a.appointmentCount - b.appointmentCount);

    return availableBarbers.length > 0 ? availableBarbers[0].barber : null;
  }
}

export async function addService(req, res) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decodedToken = decodeToken(token);

    if (!decodedToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { title, service_type, deadline, duration, price } = req.body;

    // 🔍 Check if service already exists with the same title and service_type
    const existing = await ServiceModel.findOne({
      where: {
        title,
        service_type
      }
    });

    if (existing) {
      return res.status(409).json({
        message: 'Service with this title and type already exists.'
      });
    }

    // Add user_id from token
    req.body.user_id = decodedToken.id;

    // Create new service
    const service = await ServiceModel.create(req.body);

    // Now, dynamically allocate a barber and create an appointment
    const clientId = decodedToken.id;
    const clientType = req.body.clientType || 'regular';

    // Find an available barber
    const assignedBarber = await findAvailableBarber(deadline, clientType, service_type);

    if (!assignedBarber) {
      // Still create the service, but notify that no barber is available
      return res.status(201).json({
        service,
        appointment: null,
        message: 'Service created, but no barbers are available at the requested time'
      });
    }

    // Calculate priority for appointment
    const priority = calculateAppointmentPriority(clientType, service_type, deadline, false);

    // Create appointment
    const appointment = await AppointmentModel.create({
      serviceId: service.id,
      clientId,
      barberId: assignedBarber.id,
      date: new Date(deadline),
      status: 'pending',
      priority,
      clientType,
      isReschedule: false
    });

    // Calculate estimated start time (simple estimate for now)
    const avgServiceDuration = duration || 30; // minutes
    const estimatedStartTime = new Date(new Date(deadline).getTime() - avgServiceDuration * 60000);

    await AppointmentModel.update({ estimatedStartTime }, { where: { id: appointment.id } });

    // Return service and appointment details
    res.status(201).json({
      service,
      appointment: {
        ...appointment.toJSON(),
        barberName: `${assignedBarber.first_name} ${assignedBarber.last_name}`,
        estimatedStartTime
      },
      message: 'Service requested and appointment created successfully'
    });
  } catch (error) {
    console.error('Error adding service:', error);
    res.status(400).json({ error: error.message });
  }
}

export async function getAllServices(req, res) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing or malformed' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = decodeToken(token);
    console.log(decodedToken);
    if (!decodedToken) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const services = await ServiceModel.findAll({
      attributes: [
        'id',
        'title',
        'description',
        'price',
        'service_type',
        'status',
        'duration',
        'deadline'
      ]
    });

    res.status(200).json({ message: 'Services fetched successfully', data: services });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getServices(req, res) {
  try {
    //getting the token
    const reqToken = req.headers.authorization;
    const token = reqToken && reqToken.split(' ')[1];
    const decodedToken = jwt.decode(token);
    const services = await ServiceModel.findAll({
      where: { user_id: decodedToken.id }
    });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get service by ID
export async function getServiceById(req, res) {
  try {
    const decodeToken = jwt.decode(req.headers.authorization.split(' ')[1]);

    if (!decodeToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.params.id;
    const service = await ServiceModel.findAll({
      where: { id: userId },
      attributes: ['id', 'title']
    });
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update service by ID
// export async function updateServiceById(req, res) {
//   try {
//     const decodeToken = jwt.decode(req.headers.authorization.split(" ")[1]);
//     if (!decodeToken) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     if (decodeToken.role !== "admin") {
//       return res.status(403).json({ message: "Modification denied" });
//     }
//     const service = await ServiceModel.findByPk(req.params.id);

//     if (!service) {
//       return res.status(404).json({ error: "Service not found" });
//     }

//     // Update service with new data
//     await service.update(req.body);
//     res.status(200).json({ message: "Service updated", data: service });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// }

export async function deleteServiceById(req, res) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing or malformed' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = decodeToken(token);
    if (!decodedToken) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;

    const deleted = await ServiceModel.destroy({
      where: {
        id: id
      }
    });

    if (deleted === 0) {
      return res.status(404).json({ message: 'Service not found or not allowed' });
    }

    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateServiceById(req, res) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing or malformed' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = decodeToken(token);
    if (!decodedToken) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;

    // Find the service to update
    const service = await ServiceModel.findOne({
      where: {
        id
      }
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Update with new data from req.body
    await service.update(req.body);

    res.status(200).json({
      message: 'Service updated successfully',
      data: service
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
