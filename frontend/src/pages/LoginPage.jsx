import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleUsernameChange = (e) => {
    const formattedUsername = e.target.value.toLowerCase().replace(/\s+/g, '');
    setUsername(formattedUsername);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (error) {
      toast.error("Usuário ou senha inválidos.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Bem-vindo(a) de volta!</h2>
        <p>Acesse sua conta para continuar o planejamento.</p>
        <form onSubmit={handleSubmit}>
          <input type="text" value={username} onChange={handleUsernameChange} placeholder="Nome de usuário" required />
          <div className="password-wrapper">
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          <button type="submit">Entrar</button>
        </form>
        <div className="auth-link">
          <p>Não tem uma conta? <Link to="/register">Cadastre-se</Link></p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;