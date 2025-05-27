import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/auth", // CHANGE: Updated to match backend
  headers: { "Content-Type": "application/json" },
});

export default api;

export const realApi = (endpoints) => `http://localhost:5000/api/${endpoints}`;
