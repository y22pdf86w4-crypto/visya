import axios from "axios";

const api = axios.create({
  baseURL: "http://172.18.4.12/api/dualforce",
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
