import RatingModel from "../models/ratingModel.js";
import AppointmentModel from "../models/appointmentModel.js";
import { UsersModel } from "../models/model.js";
import { decodeToken } from "./authController.js";
import { Op } from "sequelize";

// Submit a rating for an appointment
export const submitRating = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

    const decoded = decodeToken(token);
    if (!decoded) return res.status(401).json({ success: false, message: "Unauthorized" });

    const raterId = decoded.id;
    const { appointmentId, rating, targetType } = req.body;

    if (!appointmentId || !rating || !targetType) {
      return res.status(400).json({
        success: false,
        message: "appointmentId, rating, and targetType are required",
      });
    }

    const ratingValue = Number(rating);
    if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ success: false, message: "Rating must be an integer between 1 and 5" });
    }

    if (!["client", "restaurateur"].includes(targetType)) {
      return res.status(400).json({ success: false, message: "targetType must be either 'client' or 'restaurateur'" });
    }

    // Check if appointment exists
    const appointment = await AppointmentModel.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // Only allow rating completed appointments
    if (appointment.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "You can only rate completed appointments",
      });
    }

    // Validate permission and determine rateeId
    let rateeId;
    if (targetType === "restaurateur") {
      // Client is rating Restaurateur
      if (Number(appointment.clientId) !== Number(raterId)) {
        return res.status(403).json({ success: false, message: "Forbidden - you are not the client for this appointment" });
      }
      rateeId = appointment.restaurateurId;
    } else {
      // Restaurateur is rating Client
      if (Number(appointment.restaurateurId) !== Number(raterId)) {
        return res.status(403).json({ success: false, message: "Forbidden - you are not the restaurateur for this appointment" });
      }
      rateeId = appointment.clientId;
    }

    // Upsert rating (if already rated, update it)
    const [existingOrNewRating, created] = await RatingModel.findOrCreate({
      where: {
        appointmentId,
        raterId,
        targetType,
      },
      defaults: {
        rateeId,
        rating: ratingValue,
      },
    });

    if (!created) {
      existingOrNewRating.rating = ratingValue;
      await existingOrNewRating.save();
    }

    res.status(200).json({
      success: true,
      message: created ? "Rating submitted successfully" : "Rating updated successfully",
      data: existingOrNewRating,
    });
  } catch (error) {
    console.error("Error submitting rating:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get the average rating of a restaurateur or client
export const getAverageRating = async (req, res) => {
  try {
    const { userId, type } = req.params;

    if (!userId || !type) {
      return res.status(400).json({ success: false, message: "userId and type are required" });
    }

    if (!["client", "restaurateur"].includes(type)) {
      return res.status(400).json({ success: false, message: "type must be either 'client' or 'restaurateur'" });
    }

    const ratings = await RatingModel.findAll({
      where: {
        rateeId: userId,
        targetType: type,
      },
    });

    if (ratings.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          averageRating: 0,
          totalRatings: 0,
        },
      });
    }

    const sum = ratings.reduce((total, r) => total + r.rating, 0);
    const averageRating = parseFloat((sum / ratings.length).toFixed(1));

    res.status(200).json({
      success: true,
      data: {
        averageRating,
        totalRatings: ratings.length,
      },
    });
  } catch (error) {
    console.error("Error getting average rating:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Check if rating exists for an appointment
export const getAppointmentRatings = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const ratings = await RatingModel.findAll({
      where: { appointmentId },
    });

    res.status(200).json({
      success: true,
      data: ratings,
    });
  } catch (error) {
    console.error("Error getting appointment ratings:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
