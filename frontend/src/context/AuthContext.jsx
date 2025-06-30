import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api/apiClient'; // Criaremos este arquivo a seguir

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se o usuário já tem uma sessão ativa quando o app carrega
    apiClient.get('/status')
      .then(response => {
        if (response.data.is_logged_in) {
          setUser(response.data.user);
        }
      })
      .catch(err => console.error("Não foi possível buscar status da sessão", err))
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const response = await apiClient.post('/login', { username, password });
    setUser(response.data.user);
    return response.data; // Retorna os dados do usuário
  };

  const logout = async () => {
    await apiClient.post('/logout');
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