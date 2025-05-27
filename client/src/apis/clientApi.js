// api/clientApi.js
import axiosInstance from "./axiosInstance";

export const registerClient = async (clientData) => {
  try {
    const response = await axiosInstance.post("/register", clientData);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || "Registration failed";
    throw new Error(errMsg);
  }
};
