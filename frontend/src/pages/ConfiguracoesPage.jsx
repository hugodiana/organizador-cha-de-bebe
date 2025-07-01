import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

function ConfiguracoesPage() {
  const [bebes, setBebes] = useState([]);
  const [dataCha, setDataCha] = useState('');
  const [semDataDefinida, setSemDataDefinida] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.get('/configuracoes')
      .then(response => {
        const { bebes, data_cha } = response.data;
        setBebes(bebes.length > 0 ? bebes : [{ nome: '', sexo: 'NaoInformado' }]);
        setDataCha(data_cha || '');
        if (!data_cha) setSemDataDefinida(true);
      })
      .catch(error => console.error("Erro ao buscar configurações", error))
      .finally(() => setLoading(false));
  }, []);

  const handleBebeChange = (index, event) => {
    const novosBebes = [...bebes];
    novosBebes[index][event.target.name] = event.target.value;
    setBebes(novosBebes);
  };

  // --- NOVA FUNÇÃO PARA REMOVER UM BEBÊ ---
  const handleRemoverBebe = async (idParaRemover) => {
    // Impede que o último bebê seja removido
    if (bebes.length <= 1) {
      alert("Você não pode remover o único registro de bebê.");
      return;
    }
    if (window.confirm("Tem certeza que deseja remover este registro?")) {
        try {
            await apiClient.delete(`/bebes/${idParaRemover}`);
            // Atualiza a lista na tela removendo o bebê apagado
            setBebes(bebes.filter(b => b.id !== idParaRemover));
            alert("Registro do bebê removido com sucesso!");
        } catch (error) {
            console.error("Erro ao remover bebê:", error);
            alert("Não foi possível remover o registro.");
        }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        bebes,
        data_cha: semDataDefinida ? '' : dataCha
      };
      await apiClient.put('/configuracoes', payload);
      alert('Configurações salvas com sucesso!');
      navigate('/dashboard');
    } catch (err) {
      alert('Ocorreu um erro ao salvar. Tente novamente.');
      console.error(err);
    }
  };

  if (loading) return <div>Carregando configurações...</div>;

  return (
    <form onSubmit={handleSubmit} className="config-container">
      <h2>Configurações do Chá</h2>

      {bebes.map((bebe, index) => (
        <div key={bebe.id || index} className="bebe-form-group">
          <div className="bebe-inputs">
            <h4>Bebê {index + 1}</h4>
            <input name="nome" value={bebe.nome} onChange={(e) => handleBebeChange(index, e)} placeholder={`Nome do Bebê ${index + 1}`} required />
            <select name="sexo" value={bebe.sexo} onChange={(e) => handleBebeChange(index, e)}>
              <option value="NaoInformado">Prefiro não informar</option>
              <option value="Menino">Menino</option>
              <option value="Menina">Menina</option>
            </select>
          </div>
          {/* --- BOTÃO DE REMOVER ADICIONADO AQUI --- */}
          {/* Só aparece se houver mais de um bebê */}
          {bebes.length > 1 && (
            <button type="button" onClick={() => handleRemoverBebe(bebe.id)} className="remove-btn">×</button>
          )}
        </div>
      ))}

      <h4>Data do Chá</h4>
      <input type="date" value={dataCha} onChange={(e) => setDataCha(e.target.value)} disabled={semDataDefinida} />
      <div>
        <input type="checkbox" id="semData" checked={semDataDefinida} onChange={(e) => setSemDataDefinida(e.target.checked)} />
        <label htmlFor="semData">Ainda não decidi a data</label>
      </div>

      <button type="submit">Salvar Alterações</button>
    </form>
  );
}

export default ConfiguracoesPage;