import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// --- Importação de Componentes de Layout ---
import Navbar from './components/Navbar';

// --- Importação de Páginas ---
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PersonalizacaoPage from './pages/PersonalizacaoPage';
import DashboardPage from './pages/DashboardPage'; // A importação aparece apenas UMA VEZ agora

// --- Importação de Estilos ---
import './App.css';


// Este componente decide qual conjunto de rotas mostrar
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

  // Se HÁ um usuário logado E o setup ESTÁ completo
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardPage />} />
      {/* Adicione outras rotas do app aqui (ex: /convidados, /gastos) */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}


function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="content">
          <AppRoutes />
        </main>
      </div>
    </Router>
  );
}

export default App;