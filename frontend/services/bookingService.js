import api from "./api";

export const createBooking = async (data) => {
  const response = await api.post("/bookings/create", data);
  return response.data;
};

export const confirmBooking = async (bookingId) => {
  const response = await api.post("/bookings/confirm", { bookingId });
  return response.data;
};

export const getMyBookings = async () => {
  const response = await api.get("/bookings/my-bookings");
  return response.data;
};

export const getBookingById = async (id) => {
  const response = await api.get(`/bookings/${id}`);
  return response.data;
};