import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login'); // Redireciona para o login após o logout
  };

  // Se não há usuário, a Navbar não mostra nada (ou poderia mostrar um logo)
  if (!user || user.setup_completo === false) {
    return null; 
  }

  // A Navbar só aparece para usuários logados e com setup completo
  return (
    <nav className="navbar">
      <div>
        <Link to="/dashboard">Dashboard</Link>
        {/* Adicione os links para as futuras páginas aqui */}
        {/* <Link to="/convidados">Convidados</Link> */}
        {/* <Link to="/gastos">Gastos</Link> */}
      </div>
      <div className="nav-auth">
        <span>Olá, {user.nome_completo}!</span>
        <button onClick={handleLogout}>Sair</button>
      </div>
    </nav>
  );
}

export default Navbar;