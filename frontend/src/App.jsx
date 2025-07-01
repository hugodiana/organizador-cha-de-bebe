// Arquivo: frontend/src/App.jsx (Versão Corrigida e Completa)

import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast'

// --- Componentes de Layout ---
import Navbar from './components/Navbar';

// --- Páginas Públicas ---
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// --- Páginas Protegidas ---
import PersonalizacaoPage from './pages/PersonalizacaoPage';
import DashboardPage from './pages/DashboardPage';
import GastosPage from './pages/GastosPage';
import ConvidadosPage from './pages/ConvidadosPage';
import ChecklistPage from './pages/ChecklistPage';
import ConfiguracoesPage from './pages/ConfiguracoesPage';

// --- Estilos ---
import './App.css';

// Componente que decide qual conjunto de rotas mostrar
function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando aplicação...</div>;
  }

  // Se NÃO HÁ um usuário logado
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Se HÁ um usuário logado, mas o setup NÃO está completo
  if (user.setup_completo === false) {
    return (
      <Routes>
        <Route path="/personalizar" element={<PersonalizacaoPage />} />
        <Route path="*" element={<Navigate to="/personalizar" replace />} />
      </Routes>
    );
  }
  
  // Se HÁ um usuário logado E o setup ESTÁ completo, mostra as rotas da área logada
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/gastos" element={<GastosPage />} />
      <Route path="/convidados" element={<ConvidadosPage />} />
      <Route path="/checklist" element={<ChecklistPage />} />
      <Route path="/configuracoes" element={<ConfiguracoesPage />} />
      
      {/* Redirecionamento padrão para o dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

// Componente App principal
function App() {
  return (
    <Router>
      <div className="App">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
        
        <Navbar />
        <main className="content">
          <AppRoutes />
        </main>
      </div>
    </Router>
  );
}

export default App;