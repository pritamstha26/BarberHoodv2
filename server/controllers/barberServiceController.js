import { BarberService } from '../models/barberServices.js';
import { UsersModel } from '../models/model.js';

export const getBarberById = async (req, res) => {
  try {
    const reqId = req.params.id;

    const barber = await UsersModel.findOne({
      where: {
        id: reqId,
        role: 'barber'
      },
      attributes: ['id', 'first_name', 'last_name', 'email', 'phone_number', 'role']
    });
    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber not found'
      });
    }
    res.status(200).json({
      success: true,
      data: barber
    });
  } catch (error) {
    console.error('Error fetching barber:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user',
      error: error.message
    });
  }
};

export const getBarberServices = async (req, res) => {
  try {
    const services = await BarberService.findAll();
    res.json(services);
  } catch (error) {
    console.error('Error fetching barber services:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const deleteBarberService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await BarberService.findByPk(id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    await service.destroy();
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting barber service:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const updateBarberService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, duration } = req.body;
    const service = await BarberService.findByPk(id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    service.name = name;
    service.price = price;
    service.duration = duration;
    await service.save();
    res.json({ message: 'Service updated successfully' });
  } catch (error) {
    console.error('Error updating barber service:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const addBarberService = async (req, res) => {
  try {
    const { name, price, duration } = req.body;
    const newService = await BarberService.create({ name, price, duration });
    res.status(201).json(newService);
  } catch (error) {
    console.error('Error adding barber service:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
