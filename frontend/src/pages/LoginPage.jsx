import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Para feedback no botão
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleUsernameChange = (e) => {
    const formattedUsername = e.target.value.toLowerCase().replace(/\s+/g, '');
    setUsername(formattedUsername);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await login(username, password);
      toast.success('Login bem-sucedido!');
      navigate('/dashboard');
    } catch (error) {
      console.error("Erro no login:", error); // Log para depuração
      toast.error("Usuário ou senha inválidos.");
    } finally {
      setIsSubmitting(false); // Libera o botão
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Bem-vindo(a) de volta!</h2>
        <p>Acesse sua conta para continuar o planejamento.</p>
        <form onSubmit={handleSubmit}>
          <input type="text" value={username} onChange={handleUsernameChange} placeholder="Nome de usuário" required disabled={isSubmitting} />
          <div className="password-wrapper">
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" required disabled={isSubmitting} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={isSubmitting}>
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <div className="auth-link">
          <p>Não tem uma conta? <Link to="/register">Cadastre-se</Link></p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;