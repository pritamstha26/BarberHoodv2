import { RestaurateurService } from "../models/RestaurateurServices.js";
import { UsersModel } from "../models/model.js";
import AppointmentModel from "../models/appointmentModel.js";
import { Op } from "sequelize";
import { calculateDynamicPricing } from "../utils/dynamicPricing.js";

export const getRestaurateursById = async (req, res) => {
  try {
    const reqId = req.params.id;

    const restaurateurs = await UsersModel.findOne({
      where: {
        id: reqId,
        role: "restaurateurs",
      },
      attributes: [
        "id",
        "first_name",
        "last_name",
        "email",
        "phone_number",
        "role",
        "seat_capacity",
      ],
    });
    if (!restaurateurs) {
      return res.status(404).json({
        success: false,
        message: "restaurateurs not found",
      });
    }
    res.status(200).json({
      success: true,
      data: restaurateurs,
    });
  } catch (error) {
    console.error("Error fetching restaurateurs:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user",
      error: error.message,
    });
  }
};

export const getRestaurateursServices = async (req, res) => {
  try {
    const services = await RestaurateurService.findAll();
    const dynamic = req.query.dynamic === "true" || req.query.dynamic === "1";

    if (!dynamic) {
      return res.json(services);
    }

    const restaurateurId = req.query.restaurateurId;
    const activeWhere = {
      status: { [Op.in]: ["pending", "accepted", "in_progress"] },
    };
    if (restaurateurId) {
      activeWhere.restaurateurId = restaurateurId;
    }

    const activeAppointments = await AppointmentModel.count({
      where: activeWhere,
    });

    let totalCapacity = 0;
    let restaurateurCapacity = null;
    if (restaurateurId) {
      const restaurateur = await UsersModel.findOne({
        where: { id: restaurateurId, role: "restaurateurs" },
        attributes: ["seat_capacity"],
      });
      restaurateurCapacity = restaurateur?.seat_capacity || 10;
      totalCapacity = restaurateurCapacity;
    } else {
      const restaurateurs = await UsersModel.findAll({
        where: { role: "restaurateurs" },
        attributes: ["seat_capacity"],
      });
      totalCapacity = restaurateurs.reduce(
        (sum, restaurateur) => sum + (restaurateur.seat_capacity || 10),
        0,
      );
    }

    const demandInfo = {
      restaurateurId: restaurateurId || null,
      activeAppointments,
      totalCapacity,
      restaurateurCapacity,
    };

    const responseServices = services.map((service) => {
      const pricing = calculateDynamicPricing({
        basePrice: service.price,
        activeAppointments,
        totalCapacity,
      });
      return {
        ...service.toJSON(),
        original_price: pricing.originalPrice,
        price: pricing.dynamicPrice,
        dynamic_price: pricing.dynamicPrice,
      };
    });

    res.json({ services: responseServices, demandInfo });
  } catch (error) {
    console.error("Error fetching restaurateurs services:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const deleteRestaurateursService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await RestaurateurService.findByPk(id);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    await service.destroy();
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting restaurateurs service:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const updateRestaurateursService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, duration } = req.body;
    const service = await RestaurateurService.findByPk(id);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    service.name = name;
    service.price = price;
    service.duration = duration;
    await service.save();
    res.json({ message: "Service updated successfully" });
  } catch (error) {
    console.error("Error updating restaurateurs service:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const addRestaurateursService = async (req, res) => {
  try {
    const { name, price, duration } = req.body;
    const newService = await RestaurateurService.create({
      name,
      price,
      duration,
    });
    res.status(201).json(newService);
  } catch (error) {
    console.error("Error adding restaurateurs service:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
