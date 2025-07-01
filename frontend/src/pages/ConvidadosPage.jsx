import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

function ConvidadosPage() {
  const [convidados, setConvidados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [novoConvidadoNome, setNovoConvidadoNome] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [convidadoPrincipalAtual, setConvidadoPrincipalAtual] = useState(null);
  const [novoMembroNome, setNovoMembroNome] = useState('');

  const fetchConvidados = () => {
    apiClient.get('/convidados')
      .then(response => setConvidados(response.data))
      .catch(error => console.error("Erro ao buscar convidados", error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchConvidados();
  }, []);

  const handleAddConvidadoPrincipal = async (e) => {
    e.preventDefault();
    if (!novoConvidadoNome.trim()) return;
    try {
      await apiClient.post('/convidados', { nome: novoConvidadoNome });
      toast.success(`"${novoConvidadoNome}" foi adicionado com sucesso!`);
      setNovoConvidadoNome('');
      fetchConvidados();
    } catch (error) {
      console.error("Erro ao adicionar convidado:", error);
      toast.error("Não foi possível adicionar o convidado.");
    }
  };

  const handleRemoverGrupo = async (id) => {
    if (window.confirm("Tem certeza que deseja remover este convidado e toda a sua família?")) {
      try {
        await apiClient.delete(`/convidados/${id}`);
        toast.success("Grupo removido com sucesso.");
        fetchConvidados();
      } catch (error) {
        console.error("Erro ao remover grupo:", error);
        toast.error("Não foi possível remover o grupo.");
      }
    }
  };

  const handleAbrirModalMembro = (grupo) => {
    setConvidadoPrincipalAtual(grupo);
    setNovoMembroNome('');
    setIsModalOpen(true);
  };

  const handleSalvarMembro = async (e) => {
    e.preventDefault();
    if (!novoMembroNome.trim()) return;
    try {
      await apiClient.post('/convidados', { 
        nome: novoMembroNome, 
        convidado_principal_id: convidadoPrincipalAtual.id 
      });
      toast.success(`"${novoMembroNome}" foi adicionado à família!`)
      fetchConvidados();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao adicionar membro da família:", error);
      toast.error("Não foi possível adicionar o membro da família.");
    }
  };

  const totalPessoas = convidados.reduce((acc, grupo) => acc + 1 + grupo.familia.length, 0);

  if (loading) return <div>Carregando lista de convidados...</div>;

  return (
    <div className="convidados-container">
      <h2>Lista de Convidados</h2>
      <div className="orcamento-status">
        Total de Pessoas na Lista: <strong>{totalPessoas}</strong>
      </div>

      <div className="form-container">
        <h3>Adicionar Novo Convidado (ou Família)</h3>
        <form onSubmit={handleAddConvidadoPrincipal}>
          <input type="text" value={novoConvidadoNome} onChange={e => setNovoConvidadoNome(e.target.value)} placeholder="Nome do convidado principal" required />
          <button type="submit">Adicionar Convidado</button>
        </form>
      </div>

      <div className="convidados-list">
        <h3>Convidados</h3>
        <ul>
          {convidados.map(grupo => (
            <li key={grupo.id}>
              <div className="convidado-info">
                <strong>{grupo.nome}</strong>
                {grupo.familia.length > 0 && <span> (+ {grupo.familia.map(f => f.nome).join(', ')})</span>}
              </div>
              <div className="convidado-actions">
                <button onClick={() => handleAbrirModalMembro(grupo)} className="add-family-btn">Add Membro</button>
                <button onClick={() => handleRemoverGrupo(grupo.id)} className="remove-btn">×</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSalvarMembro}>
          <h3>Adicionar Familiar a "{convidadoPrincipalAtual?.nome}"</h3>
          <input 
            type="text" 
            value={novoMembroNome}
            onChange={(e) => setNovoMembroNome(e.target.value)}
            placeholder="Nome do membro da família"
            required
            autoFocus
          />
          <button type="submit">Salvar Familiar</button>
        </form>
      </Modal>
    </div>
  );
}
export default ConvidadosPage;