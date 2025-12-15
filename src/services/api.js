import axios from "axios";

// URL base comum
const BASE_URL = "http://172.18.4.12:3001/api";

// 1. Instância para o DUALFORCE (CORRIGIDO)
// Voltamos para a raiz, pois o arquivo DualForce.jsx já deve estar fazendo api.get("/dualforce/filtros")
export const api = axios.create({
  baseURL: BASE_URL, 
});

// 2. Instância para a LINHAGRO (MANTIDO)
// O Linhagroat.jsx nós já limpamos as rotas, então aqui precisa do prefixo
export const apiLinhagro = axios.create({
  baseURL: `${BASE_URL}/linhagro`,
});

// ... resto do código dos interceptors (igual ao anterior) ...

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
