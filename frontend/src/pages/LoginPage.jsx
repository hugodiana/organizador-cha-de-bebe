import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const auth = useAuth();
  // O useNavigate foi removido daqui

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // A única tarefa agora é chamar o login.
      // O App.jsx cuidará do redirecionamento.
      await auth.login(username, password);
    } catch (err) {
      setError('Falha no login. Verifique suas credenciais.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Nome de usuário" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" required />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit">Entrar</button>
      <p>Não tem uma conta? <Link to="/register">Registre-se</Link></p>
    </form>
  );
}

export default LoginPage;