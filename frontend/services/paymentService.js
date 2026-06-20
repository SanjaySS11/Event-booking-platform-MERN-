import api from "./api";

export const createPaymentOrder = async (bookingId) => {
  const response = await api.post("/payments/create-order", { bookingId });
  return response.data;
};

export const verifyPayment = async (data) => {
  const response = await api.post("/payments/webhook", data);
  return response.data;
};