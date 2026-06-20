import api from "./api";

export const getAllEvents = async (params = {}) => {
  const response = await api.get("/events", { params });
  return response.data;
};

export const getEventById = async (id) => {
  const response = await api.get(`/events/${id}`);
  return response.data;
};