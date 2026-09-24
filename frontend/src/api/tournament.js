import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/v1";


// =========================================================
// AUTH HEADERS
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
// GET ALL TOURNAMENT PROPOSALS
// SPORTS COORDINATOR
// =========================================================

export const getTournamentProposals = async () => {

  const response = await axios.get(
    `${API_URL}/tournaments/proposals`,
    getAuthHeaders()
  );

  return response.data;
};


// =========================================================
// GET COACH'S OWN TOURNAMENT PROPOSALS
// =========================================================

export const getMyTournamentProposals = async () => {

  const response = await axios.get(
    `${API_URL}/tournaments/my-proposals`,
    getAuthHeaders()
  );

  return response.data;
};


// =========================================================
// GET APPROVED TOURNAMENTS
// SPORTS COORDINATOR
// =========================================================

export const getApprovedTournaments = async () => {

  const response = await axios.get(
    `${API_URL}/tournaments/approved`,
    getAuthHeaders()
  );

  return response.data;
};