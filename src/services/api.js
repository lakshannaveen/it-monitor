import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || "10000", 10),
  headers: { "Content-Type": "application/json" },
});

// Request interceptor
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
