import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (newAccessToken, newRefreshToken) => {
  refreshSubscribers.forEach((cb) => cb(newAccessToken, newRefreshToken));
  refreshSubscribers = [];
};

api.interceptors.request.use(
  function (config) {
    const access_token = sessionStorage.getItem("access_token");
    const refresh_token = sessionStorage.getItem("refresh_token");

    if (access_token) {
      config.headers.Authorization = `Bearer ${access_token}`;
    }

    config.metadata = { refresh_token };
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  function (response) {
    return response;
  },
  async function (error) {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.metadata?.refresh_token
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const response = await axios.post(
            "http://localhost:5000/api/auth/refresh-token",
            { refreshToken: originalRequest.metadata.refresh_token },
          );

          const newAccessToken = response.data.access_token;
          const newRefreshToken = response.data.refresh_token;

          sessionStorage.setItem("access_token", newAccessToken);
          sessionStorage.setItem("refresh_token", newRefreshToken);

          isRefreshing = false;
          onRefreshed(newAccessToken, newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.metadata.refresh_token = newRefreshToken;
          return api(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          refreshSubscribers = [];

          sessionStorage.removeItem("access_token");
          sessionStorage.removeItem("refresh_token");

          window.dispatchEvent(new Event("app:unauthorized"));
          return Promise.reject(refreshError);
        }
      }

      return new Promise((resolve) => {
        subscribeTokenRefresh((newAccessToken, newRefreshToken) => {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.metadata.refresh_token = newRefreshToken;
          resolve(api(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  },
);

export default api;
