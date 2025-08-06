import jwt from "jsonwebtoken";
// import { query } from '../config/db.js';

import { AppError } from "../utils/error.js";
import sequelize from "../config/db.js";

export const protect = async (req, res, next) => {
  try {
    // 1) Get token from header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError("You are not logged in! Please log in to access.", 401)
      );
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const user = await query("SELECT * FROM clients WHERE client_id = $1", [
      decoded.id,
    ]);
    if (!user.rows[0]) {
      return next(
        new AppError("The user belonging to this token no longer exists.", 401)
      );
    }

    // 4) Grant access to protected route
    req.user = user.rows[0];
    next();
  } catch (err) {
    next(err);
  }
};

// import { UsersModel } from "../models/model.js"; // adjust path as needed
// import jwt from "jsonwebtoken";
// import { AppError } from "../utils/error.js";
// import sequelize from "../config/db.js";
// export const protect = async (req, res, next) => {
//   try {
//     let token;
//     if (
//       req.headers.authorization &&
//       req.headers.authorization.startsWith("Bearer")
//     ) {
//       token = req.headers.authorization.split(" ")[1];
//     }

//     if (!token) {
//       return next(
//         new AppError("You are not logged in! Please log in to access.", 401)
//       );
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Use Sequelize to find user by primary key
//     const user = await UsersModel.findByPk(decoded.id);

//     if (!user) {
//       return next(
//         new AppError("The user belonging to this token no longer exists.", 401)
//       );
//     }

//     req.user = user; // assign full Sequelize instance

//     next();
//   } catch (err) {
//     next(err);
//   }
// };
