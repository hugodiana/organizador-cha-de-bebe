import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

function RegisterPage() {
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    telefone: '',
    username: '',
    password: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError('Você precisa aceitar os termos de serviço.');
      return;
    }
    setError('');
    try {
      await apiClient.post('/register', formData);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao registrar.');
    }
  };

  if (success) {
    return (
      <div>
        <h2>Registro realizado com sucesso!</h2>
        <p>Sua conta foi criada. Agora você pode fazer o login.</p>
        <Link to="/login">Ir para Login</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Crie sua Conta</h2>
      <input name="nome_completo" placeholder="Nome Completo" onChange={handleChange} required />
      <input name="email" type="email" placeholder="Seu melhor e-mail" onChange={handleChange} required />
      <input name="telefone" placeholder="Telefone (WhatsApp)" onChange={handleChange} />
      <input name="username" placeholder="Nome de usuário (para login)" onChange={handleChange} required />
      <input name="password" type="password" placeholder="Crie uma senha" onChange={handleChange} required />
      <div>
        <input type="checkbox" id="terms" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
        <label htmlFor="terms">
          Eu li e concordo com os Termos de Serviço e a Política de Privacidade.
        </label>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit">Criar Conta</button>
      <p>Já tem uma conta? <Link to="/login">Faça Login</Link></p>
    </form>
  );
}

export default RegisterPage;