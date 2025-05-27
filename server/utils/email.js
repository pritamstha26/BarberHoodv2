import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send appointment confirmation
export const sendAppointmentConfirmation = async (email, appointmentDetails) => {
  try {
    await transporter.sendMail({
      from: '"Barber Shop" <bookings@barbershop.com>',
      to: email,
      subject: 'Your Appointment Confirmation',
      html: `
        <h2>Appointment Confirmed</h2>
        <p>Date: ${appointmentDetails.date}</p>
        <p>Time: ${appointmentDetails.time}</p>
        <p>Barber: ${appointmentDetails.barberName}</p>
        <p>Service: ${appointmentDetails.serviceName} ($${appointmentDetails.price})</p>
      `
    });
  } catch (err) {
    console.error('Email sending error:', err);
  }
};

// Send password reset
export const sendPasswordReset = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  await transporter.sendMail({
    from: '"Barber Shop" <support@barbershop.com>',
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset</h2>
      <p>Click <a href="${resetUrl}">here</a> to reset your password</p>
      <p>This link expires in 10 minutes</p>
    `
  });
};