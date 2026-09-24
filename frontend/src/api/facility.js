import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/v1";


// =========================================================
// AUTHORIZATION HEADER
// =========================================================

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};


// =========================================================
// GET ALL FACILITIES
// =========================================================

export const getFacilities = async () => {
  const response = await axios.get(
    `${API_URL}/facilities`,
    getAuthHeaders()
  );

  return response.data;
};


// =========================================================
// GET ONE FACILITY
// =========================================================

export const getFacility = async (facilityId) => {
  const response = await axios.get(
    `${API_URL}/facilities/${facilityId}`,
    getAuthHeaders()
  );

  return response.data;
};


// =========================================================
// CREATE FACILITY
// PE ONLY
// =========================================================

export const createFacility = async (facilityData) => {
  const response = await axios.post(
    `${API_URL}/facilities`,
    facilityData,
    getAuthHeaders()
  );

  return response.data;
};


// =========================================================
// UPDATE FACILITY
// PE ONLY
// =========================================================

export const updateFacility = async (
  facilityId,
  facilityData
) => {
  const response = await axios.put(
    `${API_URL}/facilities/${facilityId}`,
    facilityData,
    getAuthHeaders()
  );

  return response.data;
};


// =========================================================
// DEACTIVATE FACILITY
// PE ONLY
// =========================================================

export const deactivateFacility = async (facilityId) => {
  const response = await axios.patch(
    `${API_URL}/facilities/${facilityId}/deactivate`,
    {},
    getAuthHeaders()
  );

  return response.data;
};