import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendBookingConfirmationEmail = async ({
  to,
  userName,
  eventTitle,
  eventDate,
  seats,
  totalAmount,
  qrCode,
}) => {
  const seatList = seats.map((s) => s.seatNumber).join(", ");

  const mailOptions = {
    from: `"Event Ticket Platform" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Booking Confirmed - ${eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Booking Confirmed! 🎉</h2>
        <p>Hi ${userName},</p>
        <p>Your booking for <strong>${eventTitle}</strong> has been confirmed.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Event Date</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${new Date(eventDate).toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Seats</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${seatList}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Total Amount</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">₹${totalAmount}</td>
          </tr>
        </table>
        <p>Your QR ticket is attached below. Please show this at the venue entrance.</p>
        <img src="${qrCode}" alt="QR Ticket" style="width: 200px; height: 200px;" />
        <p style="margin-top: 20px; color: #888;">Thank you for booking with us!</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendRefundConfirmationEmail = async ({
  to,
  userName,
  eventTitle,
  refundAmount,
}) => {
  const mailOptions = {
    from: `"Event Ticket Platform" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Refund Processed - ${eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Refund Processed </h2>
        <p>Hi ${userName},</p>
        <p>Your refund of <strong>₹${refundAmount}</strong> for <strong>${eventTitle}</strong> has been processed successfully.</p>
        <p>It may take 5-7 business days to reflect in your account.</p>
        <p style="margin-top: 20px; color: #888;">Thank you for your patience!</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};