import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Estado para o menu mobile
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Efeito para fechar o dropdown do usuário se clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  // Se não há usuário ou o setup não foi completo, não mostra a navbar
  if (!user || user.setup_completo === false) {
    return null; 
  }

  // Função para fechar ambos os menus ao clicar em um link
  const closeAllMenus = () => {
    setDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }

  return (
    <nav className="navbar">
      <div className="nav-left">
        <NavLink to="/dashboard" className="navbar-logo" onClick={closeAllMenus}>Meu Chá</NavLink>

        {/* Adicionamos uma classe condicional para o menu mobile */}
        <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <NavLink to="/dashboard" onClick={closeAllMenus}>Dashboard</NavLink>
          <NavLink to="/gastos" onClick={closeAllMenus}>Gastos</NavLink>
          <NavLink to="/convidados" onClick={closeAllMenus}>Convidados</NavLink>
          <NavLink to="/checklist" onClick={closeAllMenus}>Checklist</NavLink>
          <NavLink to="/enxoval" onClick={closeAllMenus}>Enxoval</NavLink>
          <NavLink to="/meu-convite" onClick={closeAllMenus}>Meu Convite</NavLink>
        </div>
      </div>

      <div className="nav-right">
        <div className="nav-auth" ref={dropdownRef}>
          <button className="user-menu-button" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <span>Olá, {user.nome_completo.split(' ')[0]}!</span>
            <span className="dropdown-arrow">{dropdownOpen ? '▲' : '▼'}</span>
          </button>

          {dropdownOpen && (
            <div className="dropdown-menu">
              <NavLink to="/configuracoes" onClick={closeAllMenus}>Configurações</NavLink>
              <a href="#" onClick={handleLogout}>Sair</a>
            </div>
          )}
        </div>

        {/* BOTÃO HAMBÚRGUER (só aparece no mobile) */}
        <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;