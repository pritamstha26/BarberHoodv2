import { query } from '../config/db.js';

// Check if time slot is available
export const checkAvailability = async (date, time, barberId) => {
  try {
    const result = await query(
      `SELECT * FROM appointments 
       WHERE date = $1 AND time = $2 AND barber_id = $3 
       AND status != 'cancelled'`,
      [date, time, barberId]
    );
    
    return result.rows.length === 0;
  } catch (err) {
    console.error('Availability check error:', err);
    return false;
  }
};

// Generate available time slots
export const generateSlots = (startTime, endTime, duration, bookedSlots) => {
  const slots = [];
  let current = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);
  
  while (current <= end) {
    const timeStr = current.toTimeString().substring(0, 5);
    const isBooked = bookedSlots.some(slot => slot.time.substring(0, 5) === timeStr);
    
    if (!isBooked) {
      slots.push(timeStr);
    }
    
    current = new Date(current.getTime() + duration * 60000);
  }
  
  return slots;
};