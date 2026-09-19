import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/v1";

export const getFacilities = async () => {
  const token = localStorage.getItem("access_token");

  const response = await axios.get(
    `${API_URL}/facilities`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};