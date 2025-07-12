const pool = require('../config/db'); // Import database connection
const transporter = require('../config/email'); // Import email transporter configuration
const qrcode = require('qrcode');

// A reusable function to send a registration confirmation email with a QR code.
const sendRegistrationConfirmation = async (user, event) => {
  const qrData = `userId:${user.id},eventId:${event.id}`;
  
  try {
    const qrImage = await qrcode.toDataURL(qrData);
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: user.email,
      subject: `Registration Confirmation for ${event.purpose}`,
      html: `
        <p>Dear ${user.name},</p>
        <p>You have successfully registered for <strong>${event.purpose}</strong>.</p>
        <p>Please present this QR code at the event for check-in:</p>
        <img src="${qrImage}" alt="Your Event QR Code" />
        <p>We look forward to seeing you there!</p>
      `,
      text: `Dear ${user.name},\n\nYou have successfully registered for ${event.purpose}. Your QR code data is: ${qrData}\n\nPlease present this QR code at the event.`,
    };

    await transporter.sendMail(mailOptions);
    await pool.query(
      'INSERT INTO notification_logs (user_id, event_id, type, status) VALUES (?, ?, ?, ?)',
      [user.id, event.id, 'registration', 'sent']
    );
    console.log(`Registration email sent to ${user.email} for event ${event.id}`);
  } catch (error) {
    console.error(`Failed to send registration email to ${user.email}:`, error);
    await pool.query(
      'INSERT INTO notification_logs (user_id, event_id, type, status) VALUES (?, ?, ?, ?)',
      [user.id, event.id, 'registration', 'failed']
    );
    // Do not re-throw the error, as the user registration itself was successful.
  }
};

// A reusable function to send an attendance confirmation email.
const sendAttendanceConfirmation = async (user, event) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: user.email,
      subject: `Attendance Recorded for ${event.purpose}`,
      text: `Dear ${user.name},\n\nYour attendance for ${event.purpose} has been recorded on ${new Date().toLocaleString()}.`,
    };

    await transporter.sendMail(mailOptions);
    await pool.query(
      'INSERT INTO notification_logs (user_id, event_id, type, status) VALUES (?, ?, ?, ?)',
      [user.id, event.id, 'attendance', 'sent']
    );
    console.log(`Attendance email sent to ${user.email} for event ${event.id}`);
  } catch (error) {
    console.error(`Failed to send attendance email to ${user.email}:`, error);
    await pool.query(
      'INSERT INTO notification_logs (user_id, event_id, type, status) VALUES (?, ?, ?, ?)',
      [user.id, event.id, 'attendance', 'failed']
    );
  }
};

module.exports = { sendRegistrationConfirmation, sendAttendanceConfirmation };