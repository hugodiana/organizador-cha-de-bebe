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
        setLoading(false);
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
    try {
      await apiClient.put(`/convidados/${convidadoId}/confirmar`, { confirmado: !statusAtual });
    } catch (error) {
      toast.error("Erro ao atualizar status.");
      setConvidados(originalConvidados);
    }
  };

  const handleRemover = async (convidadoId) => {
    const convidadoParaRemover = convidados.flatMap(g => [g, ...g.familia]).find(c => c.id === convidadoId);
    if (!convidadoParaRemover) return;
    
    if (window.confirm(`Tem certeza que deseja remover "${convidadoParaRemover.nome}"? ${!convidadoParaRemover.convidado_principal_id ? 'Toda a família será removida.' : ''}`)) {
      const originalConvidados = [...convidados];
      // Atualização otimista na tela
      setConvidados(prev => prev.map(g => ({
        ...g,
        familia: g.familia.filter(f => f.id !== convidadoId)
      })).filter(g => g.id !== convidadoId));

      try {
        await apiClient.delete(`/convidados/${convidadoId}`);
        toast.success("Removido com sucesso.");
        // Se a remoção otimista deu certo, podemos chamar fetchConvidados para garantir consistência total
        fetchConvidados();
      } catch (error) { 
        toast.error("Não foi possível remover.");
        setConvidados(originalConvidados); // Reverte se der erro
      }
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
    <div className="page-container">
      <h2>Lista de Convidados</h2>
      <div className="summary-bar">
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

      <div className="data-list">
        <h3>Convidados</h3>
        <div className="filter-container">
          <input type="text" placeholder="Buscar por nome..." value={termoBusca} onChange={e => setTermoBusca(e.target.value)} />
        </div>

        {convidados.length > 0 && convidadosFiltrados.length === 0 ? (
            <div className="empty-state"><h3>Nenhum convidado encontrado</h3><p>Tente ajustar os termos da sua busca.</p></div>
        ) : convidados.length === 0 ? (
            <div className="empty-state"><h3>Sua Lista de Convidados está Vazia</h3><p>Use o formulário acima para começar.</p></div>
        ) : (
          <ul className="guest-list">
            {convidadosFiltrados.map(grupo => (
              <li key={grupo.id} className="guest-group">
                <div className="guest-row">
                  <div className="guest-info">
                    <input type="checkbox" checked={!!grupo.confirmado} onChange={() => handleToggleConfirmacao(grupo.id, grupo.confirmado)} id={`convidado-${grupo.id}`} />
                    <label htmlFor={`convidado-${grupo.id}`} className={grupo.confirmado ? 'confirmed' : ''}>{grupo.nome}</label>
                  </div>
                  <div className="guest-actions">
                    <button onClick={() => handleRemover(grupo.id)} className="remove-btn" title="Remover grupo familiar">×</button>
                  </div>
                </div>

                {grupo.familia.map(familiar => (
                  <div key={familiar.id} className="guest-row familiar">
                    <div className="guest-info">
                      <input type="checkbox" checked={!!familiar.confirmado} onChange={() => handleToggleConfirmacao(familiar.id, familiar.confirmado)} id={`convidado-${familiar.id}`} />
                      <label htmlFor={`convidado-${familiar.id}`} className={familiar.confirmado ? 'confirmed' : ''}>{familiar.nome}</label>
                    </div>
                    <div className="guest-actions">
                      <button onClick={() => handleRemover(familiar.id)} className="remove-btn" title={`Remover ${familiar.nome}`}>×</button>
                    </div>
                  </div>
                ))}

                <div className="guest-row familiar add-member-form-container">
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