import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/dualforce",
});

api.interceptors.request.use((config) => {
  // ✅ CORREÇÃO OBRIGATÓRIA: Usar token-dualforce (com hífen)
  const token = localStorage.getItem("token-dualforce"); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
