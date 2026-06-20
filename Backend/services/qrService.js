import QRCode from "qrcode";

export const generateQRCode = async (bookingData) => {
  const qrData = JSON.stringify({
    bookingId: bookingData.bookingId,
    eventId: bookingData.eventId,
    userId: bookingData.userId,
    seats: bookingData.seats,
    verificationToken: bookingData.verificationToken,
  });

  // Generate QR code as base64 string
  const qrCode = await QRCode.toDataURL(qrData);
  return qrCode;
};