import axios from "axios";


const API_URL =
  "http://127.0.0.1:8000/api/v1";


// =========================================================
// AUTH HEADERS
// =========================================================

const getAuthHeaders = () => {

  const token =
    localStorage.getItem("access_token");

  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

};


// =========================================================
// GET MY TEAM PROPOSALS
// =========================================================

export const getMyTeamProposals = async () => {

  const response = await axios.get(
    `${API_URL}/teams/my-proposals`,
    getAuthHeaders()
  );

  return response.data;

};