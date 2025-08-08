import { Op } from 'sequelize';
import { UsersModel } from '../models/model.js';
import { decodeToken } from './authController.js';
import bcrypt from 'bcrypt';

import jwt from 'jsonwebtoken';
import AppointmentModel from '../models/appointmentModel.js';
// GET all users

export const getUsers = async (req, res) => {
  try {
    const users = await UsersModel.findAll({
      attributes: ['id', 'first_name', 'last_name', 'email', 'phone_number', 'role']
    });

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No users found'
      });
    }

    res.status(200).json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
      error: error.message
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const decodedToken = jwt.decode(req.headers.authorization.split(' ')[1]);
    const reqId = req.params.id;
    if (!decodeToken) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const user = await UsersModel.findOne({
      where: {
        id: reqId,
        role: decodedToken.role
      },
      attributes: ['id', 'first_name', 'last_name', 'email', 'phone_number', 'role']
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user',
      error: error.message
    });
  }
};

// export const updateUser = async (req, res) => {
//   try {
//     const decodedToken = jwt.decode(req.headers.authorization.split(" ")[1]);
//     const tokenId = decodedToken.id;
//     const reqId = req.params.id;

//     if (!decodedToken) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized",
//       });
//     }

//     // Allow if admin or same user
//     if (
//       decodedToken.role !== "admin" &&
//       parseInt(tokenId) !== parseInt(reqId)
//     ) {
//       return res.status(403).json({
//         success: false,
//         message: "Forbidden: Access denied",
//       });
//     }

//     const user = await UsersModel.findOne({
//       where: { id: reqId },
//     });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     const updatedUser = await UsersModel.update(req.body, {
//       where: { id: reqId },
//       returning: true,
//     });

//     res.json({
//       success: true,
//       message: "User updated successfully",
//       user: updatedUser[1][0],
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };
export const updateUser = async (req, res) => {
  try {
    const decodedToken = jwt.decode(req.headers.authorization.split(' ')[1]);
    const tokenId = decodedToken?.id;

    const reqId = req.params.id;

    if (!decodedToken) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Only allow admin or the same user
    if (decodedToken.role !== 'admin' && parseInt(tokenId) !== parseInt(reqId)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Access denied'
      });
    }

    const user = await UsersModel.findOne({ where: { id: reqId } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updateData = { ...req.body };

    // 🔐 Hash password if it exists
    if (typeof updateData.password === 'string' && updateData.password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password.trim(), salt);
    } else {
      delete updateData.password;
    }

    const updatedUser = await UsersModel.update(updateData, {
      where: { id: reqId },
      returning: true
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser[1][0]
    });
  } catch (error) {
    console.error('UPDATE USER ERROR:', {
      message: error.message,
      stack: error.stack,
      raw: error,
      updateData: typeof updateData !== 'undefined' ? updateData : 'updateData not defined'
    });
  }
};
// export const deleteUser = async (req, res) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//       return res
//         .status(401)
//         .json({ success: false, message: "No token provided" });
//     }

//     const decodedToken = jwt.decode(authHeader.split(" ")[1]);
//     if (!decodedToken) {
//       return res.status(401).json({ success: false, message: "Unauthorized" });
//     }

//     const tokenId = decodedToken.id;
//     const reqId = req.params.id;

//     const user = await UsersModel.findOne({
//       where: { id: tokenId },
//       attributes: ["role"],
//     });

//     if (!user || user.role !== "admin") {
//       return res
//         .status(403)
//         .json({ success: false, message: "Access denied. Admins only." });
//     }

//     const userToDelete = await UsersModel.findOne({ where: { id: reqId } });
//     if (!userToDelete) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User to delete not found" });
//     }

//     // ✅ Check if the user is referenced in appointments
//     const isReferenced = await AppointmentModel.findOne({
//       where: {
//         [Op.or]: [{ barberId: reqId }, { clientId: reqId }],
//       },
//     });

//     if (isReferenced) {
//       return res.status(400).json({
//         success: false,
//         message: "Cannot delete user with existing appointments.",
//       });
//     }

//     await UsersModel.destroy({ where: { id: reqId } });

//     res.json({ success: true, message: "User deleted successfully" });
//   } catch (error) {
//     console.error("DELETE USER ERROR:", error.message, error.stack);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };

export const deleteUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decodedToken = jwt.decode(authHeader.split(' ')[1]);
    if (!decodedToken || !decodeToken.role === 'admin') {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const tokenId = decodedToken.id;
    const reqId = req.params.id;

    const user = await UsersModel.findOne({
      where: { id: tokenId },
      attributes: ['role']
    });

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
    }

    const userToDelete = await UsersModel.findOne({ where: { id: reqId } });
    if (!userToDelete) {
      return res.status(404).json({ success: false, message: 'User to delete not found' });
    }

    // Update appointments status to 'cancelled' where barberId or clientId = reqId
    await AppointmentModel.update(
      { status: 'cancelled' },
      {
        where: {
          [Op.or]: [{ id: reqId }, { id: reqId }]
        }
      }
    );

    // Now delete the user
    await UsersModel.destroy({ where: { id: reqId } });

    res.json({
      success: true,
      message: 'User deleted successfully, related appointments cancelled'
    });
  } catch (error) {
    console.error('DELETE USER ERROR:', error.message, error.stack);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};
