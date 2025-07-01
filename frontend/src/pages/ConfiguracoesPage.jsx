import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast'; // Importando o toast

function ConfiguracoesPage() {
  const [bebes, setBebes] = useState([]);
  const [dataCha, setDataCha] = useState('');
  const [localCha, setLocalCha] = useState(''); // Estado para o local do chá
  const [semDataDefinida, setSemDataDefinida] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Busca as configurações atuais quando a página carrega
    apiClient.get('/configuracoes')
      .then(response => {
        const { bebes, data_cha, local_cha } = response.data;
        setBebes(bebes.length > 0 ? bebes : [{ nome: '', sexo: 'NaoInformado' }]);
        setDataCha(data_cha || '');
        setLocalCha(local_cha || ''); // CORREÇÃO: Carrega o local salvo no estado
        if (!data_cha) setSemDataDefinida(true);
      })
      .catch(error => {
        console.error("Erro ao buscar configurações", error);
        toast.error("Não foi possível carregar suas configurações.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleBebeChange = (index, event) => {
    const novosBebes = [...bebes];
    novosBebes[index][event.target.name] = event.target.value;
    setBebes(novosBebes);
  };

  const handleRemoverBebe = async (idParaRemover) => {
    if (bebes.length <= 1) {
      toast.error("Você não pode remover o único registro de bebê.");
      return;
    }
    if (window.confirm("Tem certeza que deseja remover este registro?")) {
        try {
            await apiClient.delete(`/bebes/${idParaRemover}`);
            setBebes(bebes.filter(b => b.id !== idParaRemover));
            toast.success("Registro do bebê removido!");
        } catch (error) {
            console.error("Erro ao remover bebê:", error);
            toast.error("Não foi possível remover o registro.");
        }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        bebes,
        data_cha: semDataDefinida ? '' : dataCha,
        local_cha: localCha // CORREÇÃO: Vírgula adicionada na linha anterior
      };
      await apiClient.put('/configuracoes', payload);
      toast.success('Configurações salvas com sucesso!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Ocorreu um erro ao salvar. Tente novamente.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
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

      {/* CORREÇÃO: Adicionado o campo para o Local do Chá */}
      <h4>Local do Chá</h4>
      <input 
        type="text" 
        value={localCha} 
        onChange={e => setLocalCha(e.target.value)} 
        placeholder="Ex: Salão de festas do condomínio" 
      />

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
      </button>
    </form>
  );
}

export default ConfiguracoesPage;