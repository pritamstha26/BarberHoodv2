import { UsersModel } from "../models/model.js";
import ServiceModel from "../models/service.js";
import jwt from "jsonwebtoken";

export async function addService(req, res) {
  try {
    const service = new ServiceModel(req.body);
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function getAllServices(req, res) {
  try {
    const services = await ServiceModel.findAll({
      include: [
        {
          model: UsersModel,
          as: "user",
          attributes: ["id", "first_name", "last_name", "email"],
        },
      ],
    });
    console.log(services);
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
export async function getServices(req, res) {
  try {
    //getting the token
    const reqToken = req.headers.authorization;
    const token = reqToken && reqToken.split(" ")[1];
    const decodedToken = jwt.decode(token);
    const services = await ServiceModel.findAll({
      where: { user_id: decodedToken.id },
    });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get service by ID
export async function getServiceById(req, res) {
  try {
    const id = req.params.id;
    const service = await ServiceModel.findByPk(id);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update service by ID
export async function updateServiceById(req, res) {
  try {
    const id = req.params.id;
    const [updated] = await ServiceModel.update(req.body, { where: { id } });

    if (updated === 0) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Fetch updated service
    const updatedService = await ServiceModel.findByPk(id);
    res.json(updatedService);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteServiceById(req, res) {
  try {
    const id = req.params.id;
    const deleted = await ServiceModel.destroy({ where: { id } });

    if (deleted === 0) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
