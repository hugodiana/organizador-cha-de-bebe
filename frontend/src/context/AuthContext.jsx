import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Se temos um token guardado, tentamos validar a sessão com o backend
    if (token) {
      // O interceptor do apiClient vai adicionar o token ao header automaticamente
      apiClient.get('/profile') // Usamos a nova rota de perfil
        .then(response => {
          if (response.data.is_logged_in) {
            setUser(response.data.user);
          }
        })
        .catch(() => {
          // Se o token for inválido/expirado, limpa tudo
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      // Se não há token, não estamos logados e paramos de carregar
      setLoading(false);
    }
  }, [token]); // Roda este efeito se o token mudar

  const login = async (username, password) => {
    const response = await apiClient.post('/login', { username, password });

    // Guarda o token e os dados do usuário
    localStorage.setItem('authToken', response.data.token);
    setToken(response.data.token);
    setUser(response.data.user);

    return response.data;
  };

  const logout = () => {
    // Simplesmente remove os dados do frontend
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  };

  const value = { user, setUser, login, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}