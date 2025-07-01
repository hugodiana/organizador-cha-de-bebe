import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';
import EditableText from '../components/EditableText'; // Importa o novo componente

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
      toast.error("Não foi possível adicionar a tarefa.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarcar = async (id, concluido) => {
    // Atualização otimista
    setItems(items.map(item => item.id === id ? { ...item, concluido: !concluido } : item));
    try {
      await apiClient.put(`/checklist/${id}`, { concluido: !concluido });
    } catch (error) {
      toast.error("Não foi possível salvar a alteração.");
      // Reverte a mudança se der erro
      setItems(items.map(item => item.id === id ? { ...item, concluido: concluido } : item));
    }
  };

  const handleRemover = async (id) => { /* ... (código existente, sem mudanças) ... */ };

  // --- NOVA FUNÇÃO PARA ATUALIZAR O TEXTO DA TAREFA ---
  const handleUpdateTarefa = async (id, novoTexto) => {
    try {
      await apiClient.put(`/checklist/${id}`, { tarefa: novoTexto });
      // Atualiza o estado local para refletir a mudança
      setItems(items.map(item => item.id === id ? { ...item, tarefa: novoTexto } : item));
      toast.success("Tarefa atualizada!");
    } catch (error) {
      toast.error("Não foi possível atualizar a tarefa.");
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
        {/* Formulário de adicionar tarefa continua o mesmo */}
      </div>

      {items.length > 0 ? (
        <ul className="checklist">
          {items.map(item => (
            <li key={item.id} className={item.concluido ? 'concluido' : ''}>
              <input type="checkbox" checked={item.concluido} onChange={() => handleMarcar(item.id, item.concluido)} />

              {/* SUBSTITUÍMOS O <span> ANTIGO PELO NOVO COMPONENTE */}
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