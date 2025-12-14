import axios from "axios";

const api = axios.create({
  baseURL: "http://172.18.4.12:3001/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tokendualforce");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;