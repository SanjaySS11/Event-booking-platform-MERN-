import api from "./api";

export const requestRefund = async (bookingId, reason) => {
  const response = await api.post("/refunds/request", { bookingId, reason });
  return response.data;
};
