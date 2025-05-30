import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // CHANGE: Updated to match backend
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  function (config) {
    const access_token = localStorage.getItem("access_token");
    if (access_token) config.headers.Authorization = `Bearer ${access_token}`;
    return config;
  },
  function (error) {
    // Do something with request error
    console.log(error);
    return Promise.reject(error);
  }
);

export default api;
