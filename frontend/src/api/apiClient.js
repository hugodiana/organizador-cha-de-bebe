// Arquivo: frontend/src/api/apiClient.js (Versão Final Corrigida)

import axios from 'axios';

const apiClient = axios.create({
  // Garanta que a URL termine com /api
  baseURL: 'https://meu-cha-api.onrender.com/api', 
  withCredentials: true
});

export default apiClient;