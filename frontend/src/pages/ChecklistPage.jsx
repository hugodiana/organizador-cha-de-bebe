import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';
import EditableTask from '../components/EditableTask';

function ChecklistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [novaTarefa, setNovaTarefa] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    apiClient.get('/checklist')
      .then(response => setItems(response.data))
      .catch(error => console.error("Erro ao buscar checklist", error))
      .finally(() => setLoading(false));
  }, []);

  const handleAdicionar = async (e) => {
    e.preventDefault();
    if (!novaTarefa.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/checklist', { tarefa: novaTarefa });
      setItems([...items, response.data]);
      toast.success("Tarefa adicionada!");
      setNovaTarefa('');
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
      toast.error("Não foi possível adicionar a tarefa.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarcar = async (id, concluido) => {
    try {
      await apiClient.put(`/checklist/${id}`, { concluido: !concluido });
      setItems(items.map(item => item.id === id ? { ...item, concluido: !concluido } : item));
    } catch (error) {
      console.error("Erro ao marcar tarefa:", error);
      toast.error("Não foi possível atualizar a tarefa.");
    }
  };

  const handleUpdateTarefa = async (id, novaTarefa) => {
    try {
      await apiClient.put(`/checklist/${id}`, { tarefa: novaTarefa });
      // Atualiza o estado local para refletir a mudança imediatamente
      setItems(items.map(item => item.id === id ? { ...item, tarefa: novaTarefa } : item));
      toast.success("Tarefa atualizada!");
    } catch (error) {
      toast.error("Não foi possível atualizar a tarefa.");
    }
  };
  
  const handleRemover = async (id) => {
    if (window.confirm("Tem certeza que deseja remover esta tarefa?")) {
      try {
        await apiClient.delete(`/checklist/${id}`);
        setItems(items.filter(item => item.id !== id));
        toast.success("Tarefa removida.");
      } catch (error) {
        console.error("Erro ao remover tarefa:", error);
        toast.error("Não foi possível remover a tarefa.");
      }
    }
  };

  if (loading) return <div>Carregando checklist...</div>;

  const tarefasConcluidas = items.filter(item => item.concluido).length;
  const totalTarefas = items.length;

  return (
    <div className="checklist-container">
      <h2>Checklist de Organização</h2>
      <div className="orcamento-status">
        Progresso: <strong>{tarefasConcluidas} de {totalTarefas} tarefas concluídas</strong>
      </div>

      <div className="form-container">
        <h3>Adicionar Nova Tarefa</h3>
        <form onSubmit={handleAdicionar}>
          <input
            type="text"
            value={novaTarefa}
            onChange={(e) => setNovaTarefa(e.target.value)}
            placeholder="Ex: Contratar fotógrafo"
            required
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adicionando...' : 'Adicionar Tarefa'}
          </button>
        </form>
      </div>

      {/* --- LÓGICA DO ESTADO VAZIO ADICIONADA AQUI --- */}
      {items.length > 0 ? (
        <ul className="checklist">
          {items.map(item => (
            <li key={item.id} className={item.concluido ? 'concluido' : ''}>
              <input
                type="checkbox"
                checked={item.concluido}
                onChange={() => handleMarcar(item.id, item.concluido)}
              />
              <span>{item.tarefa}</span>
              <button onClick={() => handleRemover(item.id)} className="remove-btn">×</button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <h3>Seu Checklist está Vazio</h3>
          <p>Adicione sua primeira tarefa para começar a se organizar.</p>
        </div>
      )}
    </div>
  );
}

export default ChecklistPage;