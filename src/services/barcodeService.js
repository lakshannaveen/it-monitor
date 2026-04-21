import api from "./api";

const ENDPOINTS = {
  getBarcodeTimes: "/ProgressMonitoring/GetBarcodeTimes",
  getITOEmployees: "/ProgressMonitoring/GetITOEmployee",
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
    return set.map((r) => r?.Name).filter(Boolean);
  },
};
