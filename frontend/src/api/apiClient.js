import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://meu-cha-api.onrender.com/api',
});

// --- INTERCEPTOR DE REQUISIÇÃO ---
// Este código é executado ANTES de cada requisição ser enviada.
apiClient.interceptors.request.use(
  (config) => {
    // Pega o token do armazenamento local do navegador
    const token = localStorage.getItem('authToken');

    // Se o token existir, adiciona o cabeçalho de Autorização
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // Continua com a requisição modificada
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;