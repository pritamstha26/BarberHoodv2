import AppointmentModel from "../models/appointmentModel.js";
import ServiceModel from "../models/service.js";
import { UsersModel } from "../models/model.js";
import { decodeToken } from "./authController.js";

// export const createAppointment = async (req, res) => {
//   try {
//     const { date, serviceId } = req.body;

//     // Validate serviceId
//     const service = await ServiceModel.findByPk(serviceId);
//     if (!service) {
//       return res.status(404).json({ message: "Service not found" });
//     }
//     const decodedToken = decodeToken(req.headers.authorization.split(" ")[1]);
//     if (!decodedToken) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     // Check if the user is authenticated

//     // Create appointment
//     const appointment = await AppointmentModel.create({
//       date,
//       serviceId,
//     });

//     return res.status(201).json({
//       message: "Appointment created successfully",
//       appointment,
//     });
//   } catch (error) {
//     console.error("Error creating appointment:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };
import { AppError } from "../utils/error.js";

export const createAppointment = async (req, res) => {
  try {
    const decodedToken = decodeToken(req.headers.authorization.split(" ")[1]);
    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { serviceId, date } = req.body;
    const clientId = decodedToken.id;
    // Validate service
    const service = await ServiceModel.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    // Get all active barbers
    const barbers = await UsersModel.findAll({
      where: { role: "barber", isActive: true },
      order: [["id", "ASC"]],
    });
    if (!barbers || barbers.length === 0) {
      return res.status(404).json({ message: "No barbers available" });
    }
    // Extract date and time for availability check
    const appointmentDate = new Date(date);
    const dateStr = appointmentDate.toISOString().split("T")[0];
    const timeStr = appointmentDate.toTimeString().substring(0, 5);
    // Round-robin pointer (in-memory, for demo)
    let assignedBarber = null;
    let startIndex = 0;
    if (!global.roundRobinIndex) global.roundRobinIndex = 0;
    startIndex = global.roundRobinIndex;
    for (let i = 0; i < barbers.length; i++) {
      const barber = barbers[(startIndex + i) % barbers.length];
      const available = await checkAvailability(dateStr, timeStr, barber.id);
      if (available) {
        assignedBarber = barber;
        global.roundRobinIndex = (startIndex + i + 1) % barbers.length;
        break;
      }
    }
    if (!assignedBarber) {
      return res
        .status(409)
        .json({ message: "No barbers available at the requested time" });
    }
    // Create appointment
    const appointment = await AppointmentModel.create({
      serviceId,
      barberId: assignedBarber.id,
      clientId,
      date,
      status: "pending",
    });
    res.status(201).json({
      message: `Appointment created and assigned to barber ${assignedBarber.id}`,
      appointment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const decodedToken = decodeToken(req.headers.authorization.split(" ")[1]);
    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { id } = req.params;
    const appointment = await AppointmentModel.findOne({
      where: { id, userId: decodedToken.id }, // Assuming req.user is set by authentication middleware
      include: [
        {
          model: ServiceModel,
          as: "service", // Adjust based on your association
        },
        {
          model: UsersModel,
          as: "user", // Adjust based on your association
        },
      ],
    });
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    return res.status(200).json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const updateAppointment = async (req, res) => {
  try {
    const decodedToken = decodeToken(req.headers.authorization.split(" ")[1]);
    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { id } = req.params;
    const { date, serviceId } = req.body;

    // Validate serviceId
    const service = await ServiceModel.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Update appointment
    const [updated] = await AppointmentModel.update(
      { date, serviceId },
      { where: { id, userId: decodedToken.id } } // Assuming req.user is set by authentication middleware
    );

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

// export const getAppointments = async (req, res) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res
//         .status(401)
//         .json({ message: "Unauthorized: Token missing or malformed" });
//     }

//     const token = authHeader.split(" ")[1];
//     const decodedToken = decodeToken(token);

//     if (!decodedToken) {
//       return res.status(401).json({ message: "Unauthorized: Invalid token" });
//     }

//     // Admin logic: Return all appointments
//     if (decodedToken.role === "admin") {
//       const appointments = await AppointmentModel.findAll({
//         include: [
//           {
//             model: ServiceModel,
//             as: "service",
//             include: [
//               {
//                 model: UsersModel,
//                 as: "user",
//                 attributes: ["id", "first_name", "last_name", "email"],
//               },
//             ],
//           },
//         ],
//       });

//       return res.status(200).json(appointments);
//     }

//     const appointments = await AppointmentModel.findAll({
//       where: { serviceId: service.id },
//       include: [
//         {
//           model: ServiceModel,
//           as: "service",
//         },
//       ],
//     });

//     return res.status(200).json(appointments);
//   } catch (error) {
//     console.error("Error fetching appointments:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

// export const getAppointments = async (req, res) => {
//   try {
//     const appointments = await AppointmentModel.findAll();
//     console.log("hello");
//     res.json(appointments);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

export const getAppointments = async (req, res) => {
  try {
    const decodedToken = decodeToken(req.headers.authorization.split(" ")[1]);
    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.body.user_id = decodedToken.id; // Set user_id from decoded token
    const appointment = new AppointmentModel(req.body);

    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
