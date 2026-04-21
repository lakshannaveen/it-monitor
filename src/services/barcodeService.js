import api from "./api";

const ENDPOINTS = {
  getBarcodeTimes: "/ProgressMonitoring/GetBarcodeTimes",
};

export const barcodeService = {
  getBarcodeTimes: async () => {
    const response = await api.get(ENDPOINTS.getBarcodeTimes);
    // API returns { StatusCode, Result, ResultSet }
    return response.data?.ResultSet || [];
  },
};
