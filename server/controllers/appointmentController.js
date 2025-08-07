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
import { Op } from "sequelize";

async function checkAvailability(requestedDate, barberId) {
  const conflictingAppointment = await AppointmentModel.findOne({
    where: {
      barberId,
      date: requestedDate,
      status: "accepted",
    },
  });
  return !conflictingAppointment; // true means available
}
export const createAppointment = async (req, res) => {
  try {
    // 1. Authenticate user & extract clientId
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decodedToken = decodeToken(token); // your JWT decode function here
    if (!decodedToken) return res.status(401).json({ message: "Unauthorized" });

    const clientId = decodedToken.id;

    // 2. Extract request body
    const { serviceId, date } = req.body;
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

    // 4. Get all barbers
    const barbers = await UsersModel.findAll({
      where: { role: "barber" },
      order: [["id", "ASC"]],
    });
    if (!barbers.length) {
      return res.status(404).json({ message: "No barbers available" });
    }

    // 5. Find an available barber (round robin)
    if (!global.roundRobinIndex) global.roundRobinIndex = 0;
    const startIndex = global.roundRobinIndex;

    let assignedBarber = null;
    for (let i = 0; i < barbers.length; i++) {
      const barber = barbers[(startIndex + i) % barbers.length];
      const available = await checkAvailability(appointmentDate, barber.id);
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

    // 6. Create the appointment
    const appointment = await AppointmentModel.create({
      serviceId,
      clientId,
      barberId: assignedBarber.id,
      date: appointmentDate,
      status: "pending",
    });

    // 7. Respond success
    res.status(201).json({
      message: `Appointment created and assigned to barber ${assignedBarber.id}`,
      appointment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
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
          as: "barber", // ✅ must match association
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: ServiceModel,
          as: "service", // ✅ must match association
          attributes: ["id", "title", "price"],
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
          as: "barber",
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: ServiceModel,
          as: "service",
          attributes: ["id", "title", "price", "duration", "status"],
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

// export const getAppointments = async (req, res) => {
//   try {
//     const decodedToken = decodeToken(req.headers.authorization.split(" ")[1]);
//     if (!decodedToken) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     req.body.user_id = decodedToken.id; // Set user_id from decoded token
//     const appointment = new AppointmentModel(req.body);

//     await appointment.save();
//     res.status(201).json(appointment);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };
//
