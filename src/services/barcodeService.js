import api from "./api";

const ENDPOINTS = {
  getBarcodeTimes: "/ProgressMonitoring/GetBarcodeTimes",
  getITOEmployees: "/ProgressMonitoring/GetITOEmployee",
  getTaskDetails: "/ProgressMonitoring/GetTaskDetails",
  getUserImg: "/ProgressMonitoring/GetUserImg",
};

export const barcodeService = {
  getBarcodeTimes: async () => {
    const response = await api.get(ENDPOINTS.getBarcodeTimes);
    // API returns { StatusCode, Result, ResultSet }
    return response.data?.ResultSet || [];
  },
  getITOEmployees: async () => {
    const response = await api.get(ENDPOINTS.getITOEmployees);
    // Expected shape: { StatusCode, Result, ResultSet: [{ Name }] }
    const set = response.data?.ResultSet || [];
    // Return full objects so callers can use Service_No
    return set.map((r) => ({ Name: r?.Name, Service_No: r?.Service_No }));
  },
  getAvailability: async (serviceNo) => {
    if (!serviceNo) return null;
    try {
      const response = await api.get("/ProgressMonitoring/GetAvailability", {
        params: { serviceno: serviceNo },
      });
      // API returns { StatusCode, Result, ResultSet }
      return response.data?.ResultSet || null;
    } catch (e) {
      console.warn("Failed to fetch availability for", serviceNo, e);
      return null;
    }
  },
  getTaskDetails: async (serviceNo, year = new Date().getFullYear()) => {
    if (!serviceNo) return [];
    const response = await api.get(ENDPOINTS.getTaskDetails, {
      params: { serviceno: serviceNo, year },
    });
    return response.data?.ResultSet || [];
  },
  getUserImageUrl: (serviceNo) => {
    if (!serviceNo) return null;
    const base = api.defaults.baseURL || process.env.REACT_APP_BASE_URL || "";
    // Ensure no trailing slash
    const prefix = base.replace(/\/$/, "");
    return `${prefix}${ENDPOINTS.getUserImg}?serviceNo=${encodeURIComponent(serviceNo)}`;
  },
};
