import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  if (!user || user.setup_completo === false) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="nav-left">
        <h1 className="navbar-logo">Meu Chá</h1>
        <div className="nav-links">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/gastos">Gastos</NavLink>
          <NavLink to="/convidados">Convidados</NavLink>
          <NavLink to="/checklist">Checklist</NavLink>
          {/* CORREÇÃO APLICADA AQUI */}
          <NavLink to="/enxoval">Enxoval</NavLink> 
          <NavLink to="/meu-convite">Meu Convite</NavLink>
        </div>
      </div>

      <div className="nav-auth" ref={dropdownRef}>
        <button className="user-menu-button" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <span>Olá, {user.nome_completo.split(' ')[0]}!</span>
          <span className="dropdown-arrow">{dropdownOpen ? '▲' : '▼'}</span>
        </button>

        {dropdownOpen && (
          <div className="dropdown-menu">
            <NavLink to="/configuracoes" onClick={() => setDropdownOpen(false)}>Configurações</NavLink>
            <a href="#" onClick={handleLogout}>Sair</a>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;