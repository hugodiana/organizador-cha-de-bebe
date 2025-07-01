import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';

function RegisterPage() {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar senha
  const navigate = useNavigate();

  // Função para formatar o nome de usuário
  const handleUsernameChange = (e) => {
    const formattedUsername = e.target.value.toLowerCase().replace(/\s+/g, '');
    setUsername(formattedUsername);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/register', { nome_completo: nomeCompleto, username, password });
      toast.success('Cadastro realizado com sucesso! Faça o login.');
      navigate('/login');
    } catch (error) {
      const message = error.response?.data?.message || "Erro ao registrar.";
      toast.error(message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Crie sua Conta</h2>
        <p>Comece a organizar o seu chá de bebê dos sonhos.</p>
        <form onSubmit={handleSubmit}>
          <input type="text" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} placeholder="Seu nome completo" required />
          <input type="text" value={username} onChange={handleUsernameChange} placeholder="Crie um nome de usuário (sem espaços)" required />
          <div className="password-wrapper">
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Crie uma senha" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          <button type="submit">Cadastrar</button>
        </form>
        <div className="auth-link">
          <p>Já tem uma conta? <Link to="/login">Faça o login</Link></p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;