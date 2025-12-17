import axios from "axios";

// URL base comum - AJUSTADA PARA CLOUDFLARE TUNNEL
const BASE_URL = "https://api.salesplan.com.br/api";

// 1. Instância para o DUALFORCE
export const api = axios.create({
  baseURL: BASE_URL, 
});

// 2. Instância para a LINHAGRO
export const apiLinhagro = axios.create({
  baseURL: `${BASE_URL}/linhagro`,
});

// Interceptor para adicionar token
const addTokenInterceptor = (instance) => {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("tokendualforce");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

addTokenInterceptor(api);
addTokenInterceptor(apiLinhagro);

export default api;
