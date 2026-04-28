// src/apis/client.ts
import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

API.interceptors.response.use(
    (res) => res,
    async (error) => {
        const status = error.response?.status;
        const originalRequest = error.config;

        // If we get a 401, the access token is invalid or expired
        if (status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            // Clear out everything and redirect to login
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("authUser");
            window.location.href = "/login";
            return Promise.reject(error);
        }

        // If 403, go to unauthorized page ONLY—do NOT immediately logout
        if (status === 403) {
            window.location.href = "/unauthorized";
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export default API;
