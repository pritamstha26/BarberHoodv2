import ServiceModel from "../models/service.js";

export async function addService(req, res) {
  try {
    const service = new ServiceModel(req.body);
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function getServices(req, res) {
  try {
    const services = await ServiceModel.findAll();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
