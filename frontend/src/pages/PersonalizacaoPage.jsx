import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';

function PersonalizacaoPage() {
  const [bebes, setBebes] = useState([{ nome: '', sexo: 'NaoInformado' }]);
  const [dataCha, setDataCha] = useState('');
  const [semDataDefinida, setSemDataDefinida] = useState(false);
  const [isGemeos, setIsGemeos] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const auth = useAuth();

  // Atualiza os dados de um bebê específico na lista
  const handleBebeChange = (index, event) => {
    const novosBebes = [...bebes];
    novosBebes[index][event.target.name] = event.target.value;
    setBebes(novosBebes);
  };

  // Controla a opção de gêmeos
  const handleGemeosChange = (e) => {
    setIsGemeos(e.target.checked);
    if (e.target.checked) {
      setBebes([...bebes, { nome: '', sexo: 'NaoInformado' }]);
    } else {
      setBebes(bebes.slice(0, 1)); // Mantém apenas o primeiro bebê
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        bebes,
        data_cha: semDataDefinida ? null : dataCha
      };
      await apiClient.post('/personalizar', payload);

      // Atualiza o estado do usuário no AuthContext
      auth.setUser({ ...auth.user, setup_completo: true });
      navigate('/dashboard'); // Envia para o dashboard após salvar

    } catch (err) {
      setError('Ocorreu um erro ao salvar. Tente novamente.');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Personalize seu Chá de Bebê</h2>
      <p>Vamos começar com algumas informações básicas.</p>

      {bebes.map((bebe, index) => (
        <div key={index}>
          <h4>Bebê {index + 1}</h4>
          <input name="nome" value={bebe.nome} onChange={(e) => handleBebeChange(index, e)} placeholder={`Nome do Bebê ${index + 1}`} required />
          <select name="sexo" value={bebe.sexo} onChange={(e) => handleBebeChange(index, e)}>
            <option value="NaoInformado">Prefiro não informar</option>
            <option value="Menino">Menino</option>
            <option value="Menina">Menina</option>
          </select>
        </div>
      ))}
      
      <div>
        <input type="checkbox" id="gemeos" checked={isGemeos} onChange={handleGemeosChange} />
        <label htmlFor="gemeos">É uma gestação de gêmeos?</label>
      </div>

      <h4>Data do Chá</h4>
      <input type="date" value={dataCha} onChange={(e) => setDataCha(e.target.value)} disabled={semDataDefinida} />
      <div>
        <input type="checkbox" id="semData" checked={semDataDefinida} onChange={(e) => setSemDataDefinida(e.target.checked)} />
        <label htmlFor="semData">Ainda não decidi a data</label>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit">Salvar e Continuar</button>
    </form>
  );
}

export default PersonalizacaoPage;