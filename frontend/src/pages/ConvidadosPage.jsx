import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';

function AddMembroForm({ grupoId, onAdd }) {
  const [nome, setNome] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nome.trim()) return;
    onAdd(grupoId, nome);
    setNome('');
  };
  return (
    <form onSubmit={handleSubmit} className="add-membro-form">
      <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do acompanhante..." />
      <button type="submit">+</button>
    </form>
  );
}

function ConvidadosPage() {
  const [convidados, setConvidados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [novoConvidadoNome, setNovoConvidadoNome] = useState('');

  const fetchConvidados = () => {
    apiClient.get('/convidados').then(response => setConvidados(response.data))
      .catch(error => console.error("Erro ao buscar convidados", error))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchConvidados(); }, []);

  const handleAddConvidadoPrincipal = async (e) => {
    e.preventDefault();
    if (!novoConvidadoNome.trim()) return;
    try {
      await apiClient.post('/convidados', { nome: novoConvidadoNome });
      toast.success(`"${novoConvidadoNome}" adicionado!`);
      setNovoConvidadoNome('');
      fetchConvidados();
    } catch (error) { toast.error("Não foi possível adicionar."); }
  };

  const handleAddMembro = async (idConvidadoPrincipal, nomeMembro) => {
    try {
      await apiClient.post('/convidados', { nome: nomeMembro, convidado_principal_id: idConvidadoPrincipal });
      toast.success(`"${nomeMembro}" adicionado!`);
      fetchConvidados();
    } catch (error) { toast.error("Não foi possível adicionar."); }
  };

  const handleToggleConfirmacao = async (convidadoId, statusAtual) => {
    try {
      await apiClient.put(`/convidados/${convidadoId}/confirmar`, { confirmado: !statusAtual });
      setConvidados(prevConvidados => prevConvidados.map(grupo => {
        let grupoAtualizado = { ...grupo };
        if (grupo.id === convidadoId) {
          grupoAtualizado.confirmado = !statusAtual;
        }
        grupoAtualizado.familia = grupo.familia.map(familiar => {
          if (familiar.id === convidadoId) {
            return { ...familiar, confirmado: !statusAtual };
          }
          return familiar;
        });
        return grupoAtualizado;
      }));
    } catch (error) {
      toast.error("Erro ao atualizar status.");
      console.error(error);
    }
  };

  const handleRemover = async (convidadoId) => {
    if (window.confirm("Tem certeza que deseja remover este convidado? Se for o principal, a família inteira será removida.")) {
      try {
        await apiClient.delete(`/convidados/${convidadoId}`);
        toast.success("Removido com sucesso.");
        fetchConvidados();
      } catch (error) { toast.error("Não foi possível remover."); }
    }
  };

  const totalPessoas = convidados.reduce((acc, grupo) => acc + 1 + grupo.familia.length, 0);
  const totalConfirmados = convidados.reduce((acc, grupo) => {
    const confirmadosNoGrupo = (grupo.confirmado ? 1 : 0) + grupo.familia.filter(f => f.confirmado).length;
    return acc + confirmadosNoGrupo;
  }, 0);

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="convidados-container">
      <h2>Lista de Convidados</h2>
      <div className="orcamento-status">
        <span>Pessoas na Lista: <strong>{totalPessoas}</strong></span>
        <span>Confirmados: <strong>{totalConfirmados}</strong></span>
      </div>

      <div className="form-container">
        <h3>Adicionar Novo Convidado/Família</h3>
        <form onSubmit={handleAddConvidadoPrincipal}>
          <input type="text" value={novoConvidadoNome} onChange={e => setNovoConvidadoNome(e.target.value)} placeholder="Nome do convidado principal" required />
          <button type="submit">Adicionar</button>
        </form>
      </div>

      <div className="convidados-list">
        <h3>Convidados</h3>
        {convidados.length > 0 ? (
          <ul className="convidados-list">
            {convidadosFiltrados.map(convidado => (
              <li key={convidado.id} className="convidado-item principal">
                <div className="convidado-info">
                  <input
                    type="checkbox"
                    id={`convidado-${convidado.id}`}
                    checked={convidado.confirmado}
                    onChange={() => handleConfirmar(convidado.id, !convidado.confirmado)}
                  />
                  <label htmlFor={`convidado-${convidado.id}`} className={convidado.confirmado ? 'confirmado' : ''}>
                    {convidado.nome}
                  </label>
                </div>
                <div className="convidado-actions">
                  <button onClick={() => setAdicionandoFamiliarPara(convidado.id)} className="action-btn add-family-btn" title="Adicionar familiar">+</button>
                  <button onClick={() => handleRemover(convidado.id)} className="remove-btn" title="Remover convidado e família">×</button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <h3>Sua Lista de Convidados está Vazia</h3>
            <p>Use o formulário acima para começar a adicionar as pessoas especiais que você quer convidar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
export default ConvidadosPage;