import { UsersModel } from '../models/model.js';
import { findNearbyBarbers, calculateDistance } from '../utils/location.js';
import { decodeToken } from './authController.js';
import { Op } from 'sequelize';

/**
 * Get nearby barbers based on provided coordinates
 * @route GET /api/location/nearby-barbers
 */
export const getNearbyBarbers = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 10 } = req.query;

    // Validate required parameters
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Convert to numbers
    const clientLat = parseFloat(latitude);
    const clientLng = parseFloat(longitude);
    const maxDistanceKm = parseFloat(maxDistance);

    // Validate parameters
    if (isNaN(clientLat) || isNaN(clientLng) || isNaN(maxDistanceKm)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid parameters. Latitude, longitude, and maxDistance must be valid numbers.'
      });
    }

    // Get all barbers
    const barbers = await UsersModel.findAll({
      where: {
        role: 'barber',
        latitude: { [Op.not]: null },
        longitude: { [Op.not]: null }
      },
      attributes: [
        'id', 'first_name', 'last_name', 'email', 'phone_number',
        'latitude', 'longitude', 'location_name'
      ]
    });

    // Find nearby barbers
    const nearbyBarbers = findNearbyBarbers(clientLat, clientLng, barbers, maxDistanceKm);

    return res.status(200).json({
      success: true,
      count: nearbyBarbers.length,
      data: nearbyBarbers
    });
  } catch (error) {
    console.error('Error finding nearby barbers:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while finding nearby barbers',
      error: error.message
    });
  }
};

/**
 * Update user's location
 * @route PUT /api/location/update
 */
export const updateUserLocation = async (req, res) => {
  try {
    // Get user from token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decodedToken = decodeToken(token);
    if (!decodedToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = decodedToken.id;
    const { latitude, longitude, location_name } = req.body;

    // Validate required parameters
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Convert to numbers
    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);

    // Validate parameters
    if (isNaN(userLat) || isNaN(userLng)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid parameters. Latitude and longitude must be valid numbers.'
      });
    }

    // Update user location
    await UsersModel.update(
      {
        latitude: userLat,
        longitude: userLng,
        location_name: location_name || null
      },
      { where: { id: userId } }
    );

    return res.status(200).json({
      success: true,
      message: 'Location updated successfully'
    });
  } catch (error) {
    console.error('Error updating user location:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating location',
      error: error.message
    });
  }
};

/**
 * Get user's current location
 * @route GET /api/location/current
 */
export const getCurrentLocation = async (req, res) => {
  try {
    // Get user from token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decodedToken = decodeToken(token);
    if (!decodedToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = decodedToken.id;

    // Get user's location
    const user = await UsersModel.findByPk(userId, {
      attributes: ['id', 'latitude', 'longitude', 'location_name']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        latitude: user.latitude,
        longitude: user.longitude,
        location_name: user.location_name
      }
    });
  } catch (error) {
    console.error('Error getting user location:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while getting location',
      error: error.message
    });
  }
};

/**
 * Get distance between two users
 * @route GET /api/location/distance/:userId
 */
export const getDistanceToUser = async (req, res) => {
  try {
    // Get user from token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decodedToken = decodeToken(token);
    if (!decodedToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const currentUserId = decodedToken.id;
    const { userId } = req.params;

    // Get both users' locations
    const currentUser = await UsersModel.findByPk(currentUserId, {
      attributes: ['id', 'latitude', 'longitude']
    });

    const otherUser = await UsersModel.findByPk(userId, {
      attributes: ['id', 'first_name', 'last_name', 'latitude', 'longitude', 'location_name']
    });

    if (!currentUser || !otherUser) {
      return res.status(404).json({
        success: false,
        message: 'One or both users not found'
      });
    }

    // Check if both users have location data
    if (!currentUser.latitude || !currentUser.longitude ||
        !otherUser.latitude || !otherUser.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Location data missing for one or both users'
      });
    }

    // Calculate distance
    const distance = calculateDistance(
      currentUser.latitude,
      currentUser.longitude,
      otherUser.latitude,
      otherUser.longitude
    );

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: otherUser.id,
          name: `${otherUser.first_name} ${otherUser.last_name}`,
          location_name: otherUser.location_name
        },
        distance: parseFloat(distance.toFixed(2)), // Distance in km, rounded to 2 decimal places
        unit: 'km'
      }
    });
  } catch (error) {
    console.error('Error calculating distance:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while calculating distance',
      error: error.message
    });
  }
};
