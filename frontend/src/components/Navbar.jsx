// Arquivo: frontend/src/components/Navbar.jsx (Versão Corrigida)

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login'); // Redireciona para o login após o logout
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // A Navbar não aparece em telas públicas ou durante a personalização
  if (!user || user.setup_completo === false) {
    return null; 
  }

  // A Navbar completa, visível para usuários logados e com setup completo
  return (
    <nav className="navbar">
      <div className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/gastos">Gastos</Link>
        <Link to="/convidados">Convidados</Link>
        <Link to="/checklist">Checklist</Link>
        <Link to="/configuracoes">Configurações</Link>
      </div>
      <div className="nav-auth">
        <span>Olá, {user.nome_completo}!</span>
        {/* CORREÇÃO APLICADA AQUI: */}
        <button onClick={() => handleLogout()}>Sair</button>
      </div>
    </nav>
  );
}

export default Navbar;