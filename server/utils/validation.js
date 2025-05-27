import validator from 'validator';
import { AppError } from './error.js';

// Validate registration data
export const validateRegister = (data) => {
  const errors = [];
  
  if (!validator.isEmail(data.email)) {
    errors.push('Invalid email format');
  }
  
  if (!validator.isLength(data.password, { min: 8 })) {
    errors.push('Password must be at least 8 characters');
  }
  
  if (errors.length > 0) {
    throw new AppError(errors.join(', '), 400);
  }
};

// Validate appointment data
export const validateAppointment = (data) => {
  const errors = [];
  
  if (!validator.isDate(data.date, { format: 'YYYY-MM-DD' })) {
    errors.push('Invalid date format (YYYY-MM-DD)');
  }
  
  if (!validator.matches(data.time, /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
    errors.push('Invalid time format (HH:MM)');
  }
  
  if (errors.length > 0) {
    throw new AppError(errors.join(', '), 400);
  }
};

// Sanitize input data
export const sanitizeInput = (data) => {
  return Object.entries(data).reduce((acc, [key, value]) => {
    if (typeof value === 'string') {
      acc[key] = validator.escape(validator.trim(value));
    } else {
      acc[key] = value;
    }
    return acc;
  }, {});
};