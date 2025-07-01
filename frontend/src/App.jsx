import React from 'react'; // Importe o React
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PersonalizacaoPage from './pages/PersonalizacaoPage';
import DashboardPage from './pages/DashboardPage';
import GastosPage from './pages/GastosPage';
import ConvidadosPage from './pages/ConvidadosPage';
import ChecklistPage from './pages/ChecklistPage';
import ConfiguracoesPage from './pages/ConfiguracoesPage';
import ConvitePublicoPage from './pages/ConvitePublicoPage';
import MeuConvitePage from './pages/MeuConvitePage';
import EnxovalPage from './pages/EnxovalPage';
import './App.css';

// Componente para renderizar o layout principal (com Navbar e estilos)
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

// O App agora decide qual layout usar
function App() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Carregando aplicação...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Rota pública do convite não usa o layout principal */}
        <Route path="/convite/:userId" element={<ConvitePublicoPage />} />

        {/* Rotas para usuários deslogados */}
        {!user && (
          <>
            <Route path="/login" element={<MainLayout><LoginPage /></MainLayout>} />
            <Route path="/register" element={<MainLayout><RegisterPage /></MainLayout>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}

        {/* Rotas para usuários logados */}
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
              <Route path="/configuracoes" element={<MainLayout><ConfiguracoesPage /></MainLayout>} />
              <Route path="/meu-convite" element={<MeuConvitePage />} />
              <Route path="/enxoval" element={<EnxovalPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          )
        )}
      </Routes>
    </Router>
  );
}

export default App;