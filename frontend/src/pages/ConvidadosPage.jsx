import { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';

// Um pequeno componente para o formulário de adicionar familiar
function AddMembroForm({ grupoId, onAdd }) {
  const [nome, setNome] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nome.trim()) return;
    onAdd(grupoId, nome);
    setNome(''); // Limpa o campo após adicionar
  };

  return (
    <form onSubmit={handleSubmit} className="add-membro-form">
      <input
        type="text"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome do acompanhante..."
      />
      <button type="submit">+</button>
    </form>
  );
}

// --- Componente Principal da Página ---
function ConvidadosPage() {
  const [convidados, setConvidados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [novoConvidadoNome, setNovoConvidadoNome] = useState('');
  const [termoBusca, setTermoBusca] = useState('');

  // Função para buscar os dados, garantindo que o 'loading' seja desativado
  const fetchConvidados = () => {
    apiClient.get('/convidados')
      .then(response => {
        setConvidados(response.data);
      })
      .catch(error => {
        console.error("Erro ao buscar convidados:", error);
        toast.error("Não foi possível carregar a lista de convidados.");
      })
      .finally(() => {
        setLoading(false); // Esta linha é crucial
      });
  };

  useEffect(() => {
    fetchConvidados();
  }, []);

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
    const originalConvidados = [...convidados];
    // Atualização otimista na tela
    setConvidados(prevConvidados => prevConvidados.map(grupo => {
        if (grupo.id === convidadoId) return { ...grupo, confirmado: !statusAtual };
        return {
            ...grupo,
            familia: grupo.familia.map(familiar => 
                familiar.id === convidadoId ? { ...familiar, confirmado: !statusAtual } : familiar
            )
        };
    }));
    try {
      await apiClient.put(`/convidados/${convidadoId}/confirmar`, { confirmado: !statusAtual });
    } catch (error) {
      toast.error("Erro ao atualizar status.");
      setConvidados(originalConvidados); // Reverte se der erro
    }
  };

  const handleRemover = async (convidadoId) => {
    if (window.confirm("Tem certeza? Esta ação removerá o convidado. Se for o principal, a família inteira será removida.")) {
      try {
        await apiClient.delete(`/convidados/${convidadoId}`);
        toast.success("Removido com sucesso.");
        fetchConvidados();
      } catch (error) { toast.error("Não foi possível remover."); }
    }
  };

  const convidadosFiltrados = useMemo(() => {
    if (!termoBusca.trim()) return convidados;
    const busca = termoBusca.toLowerCase();
    return convidados.filter(grupo => 
      grupo.nome.toLowerCase().includes(busca) ||
      grupo.familia.some(familiar => familiar.nome.toLowerCase().includes(busca))
    );
  }, [convidados, termoBusca]);

  const totalPessoas = convidados.reduce((acc, grupo) => acc + 1 + grupo.familia.length, 0);
  const totalConfirmados = convidados.reduce((acc, grupo) => {
    const confirmadosNoGrupo = (grupo.confirmado ? 1 : 0) + grupo.familia.filter(f => f.confirmado).length;
    return acc + confirmadosNoGrupo;
  }, 0);

  if (loading) return <div>Carregando lista de convidados...</div>;

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
        <div className="filter-container">
          <input type="text" placeholder="Buscar por nome..." value={termoBusca} onChange={e => setTermoBusca(e.target.value)} />
        </div>

        {convidados.length > 0 && convidadosFiltrados.length === 0 ? (
            <div className="empty-state"><h3>Nenhum convidado encontrado</h3><p>Tente ajustar os termos da sua busca.</p></div>
        ) : convidados.length === 0 ? (
            <div className="empty-state"><h3>Sua Lista de Convidados está Vazia</h3><p>Use o formulário acima para começar a adicionar as pessoas especiais.</p></div>
        ) : (
          <ul>
            {convidadosFiltrados.map(grupo => (
              <li key={grupo.id}>
                <div className="convidado-item principal">
                  <input type="checkbox" id={`convidado-${grupo.id}`} checked={!!grupo.confirmado} onChange={() => handleToggleConfirmacao(grupo.id, grupo.confirmado)} />
                  <label htmlFor={`convidado-${grupo.id}`} className={grupo.confirmado ? 'confirmado' : ''}>{grupo.nome}</label>
                  <div className="convidado-actions">
                    <button onClick={() => handleRemover(grupo.id)} className="remove-btn mini" title="Remover grupo familiar">×</button>
                  </div>
                </div>
                {grupo.familia.map(familiar => (
                  <div key={familiar.id} className="convidado-item familiar">
                    <input type="checkbox" id={`convidado-${familiar.id}`} checked={!!familiar.confirmado} onChange={() => handleToggleConfirmacao(familiar.id, familiar.confirmado)} />
                    <label htmlFor={`convidado-${familiar.id}`} className={familiar.confirmado ? 'confirmado' : ''}>{familiar.nome}</label>
                    <button onClick={() => handleRemover(familiar.id)} className="remove-btn mini" title={`Remover ${familiar.nome}`}>×</button>
                  </div>
                ))}
                <div className="familiar">
                  <AddMembroForm grupoId={grupo.id} onAdd={handleAddMembro} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
export default ConvidadosPage;