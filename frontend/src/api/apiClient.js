import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://meu-cha-api.onrender.com',
  withCredentials: true // Essencial para enviar cookies de sessão
});

export default apiClient;