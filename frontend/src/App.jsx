import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PersonalizacaoPage from './pages/PersonalizacaoPage';
import DashboardPage from './pages/DashboardPage';
import GastosPage from './pages/GastosPage';
import ConvidadosPage from './pages/ConvidadosPage';
import ChecklistPage from './pages/ChecklistPage';
import EnxovalPage from './pages/EnxovalPage';
import ConfiguracoesPage from './pages/ConfiguracoesPage';
import MeuConvitePage from './pages/MeuConvitePage';
import ConvitePublicoPage from './pages/ConvitePublicoPage';

import './App.css';

function MainLayout({ children }) {
  return (
    <div className="App">
      <Navbar />
      <main className="content">
        {children}
      </main>
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando aplicação...</div>;
  }

  return (
    <Routes>
      {/* Rota pública do convite não usa o layout principal */}
      <Route path="/convite/:userId" element={<ConvitePublicoPage />} />

      {/* Se NÃO HÁ um usuário logado */}
      {!user && (
        <>
          <Route path="/login" element={<MainLayout><LoginPage /></MainLayout>} />
          <Route path="/register" element={<MainLayout><RegisterPage /></MainLayout>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}

      {/* Se HÁ um usuário logado */}
      {user && (
        user.setup_completo === false ? (
          // Força a personalização
          <>
            <Route path="/personalizar" element={<MainLayout><PersonalizacaoPage /></MainLayout>} />
            <Route path="*" element={<Navigate to="/personalizar" replace />} />
          </>
        ) : (
          // Mostra as rotas principais do app
          <>
            <Route path="/dashboard" element={<MainLayout><DashboardPage /></MainLayout>} />
            <Route path="/gastos" element={<MainLayout><GastosPage /></MainLayout>} />
            <Route path="/convidados" element={<MainLayout><ConvidadosPage /></MainLayout>} />
            <Route path="/checklist" element={<MainLayout><ChecklistPage /></MainLayout>} />
            <Route path="/enxoval" element={<MainLayout><EnxovalPage /></MainLayout>} />
            <Route path="/configuracoes" element={<MainLayout><ConfiguracoesPage /></MainLayout>} />
            <Route path="/meu-convite" element={<MainLayout><MeuConvitePage /></MainLayout>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )
      )}
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <AppRoutes />
    </Router>
  );
}

export default App;