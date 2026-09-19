import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/v1";

export const loginUser = async (identifier, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, {
    identifier: identifier,
    password: password,
  });

  return response.data;
};