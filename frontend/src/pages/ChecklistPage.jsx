import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';
import EditableText from '../components/EditableText';

function ChecklistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [novaTarefa, setNovaTarefa] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    apiClient.get('/checklist')
      .then(response => setItems(response.data))
      .catch(error => {
        console.error("Erro ao buscar checklist", error);
        toast.error("Não foi possível carregar o checklist.");
      })
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
      toast.error("Não foi possível adicionar a tarefa.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarcar = async (id, concluido) => {
    const originalItems = [...items];
    setItems(items.map(item => item.id === id ? { ...item, concluido: !concluido } : item));
    try {
      await apiClient.put(`/checklist/${id}`, { concluido: !concluido });
    } catch (error) {
      toast.error("Não foi possível salvar a alteração.");
      setItems(originalItems);
    }
  };

  const handleRemover = async (id) => {
    if (window.confirm("Tem certeza que deseja remover esta tarefa?")) {
        try {
            await apiClient.delete(`/checklist/${id}`);
            setItems(items.filter(item => item.id !== id));
            toast.success("Tarefa removida.");
        } catch(error) {
            toast.error("Não foi possível remover a tarefa.");
            console.error(error);
        }
    }
  };

  const handleUpdateTarefa = async (id, novoTexto) => {
    const originalItems = [...items];
    setItems(items.map(item => item.id === id ? { ...item, tarefa: novoTexto } : item));
    try {
      await apiClient.put(`/checklist/${id}`, { tarefa: novoTexto });
      toast.success("Tarefa atualizada!");
    } catch (error) {
      toast.error("Não foi possível atualizar a tarefa.");
      setItems(originalItems);
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

      {/* --- FORMULÁRIO QUE FALTAVA --- */}
      <div className="form-container">
        <h3>Adicionar Nova Tarefa</h3>
        <form onSubmit={handleAdicionar}>
          <input
            type="text"
            value={novaTarefa}
            onChange={(e) => setNovaTarefa(e.target.value)}
            placeholder="Ex: Enviar convites"
            required
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adicionando...' : 'Adicionar Tarefa'}
          </button>
        </form>
      </div>

      {items.length > 0 ? (
        <ul className="checklist">
          {items.map(item => (
            <li key={item.id} className={item.concluido ? 'concluido' : ''}>
              <input type="checkbox" checked={item.concluido} onChange={() => handleMarcar(item.id, item.concluido)} />
              <EditableText 
                initialValue={item.tarefa} 
                onSave={(novoTexto) => handleUpdateTarefa(item.id, novoTexto)} 
              />
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