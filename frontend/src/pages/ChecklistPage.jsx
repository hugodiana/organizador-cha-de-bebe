import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

function ChecklistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [novaTarefa, setNovaTarefa] = useState('');

  useEffect(() => {
    apiClient.get('/checklist')
      .then(response => setItems(response.data))
      .catch(error => console.error("Erro ao buscar checklist", error))
      .finally(() => setLoading(false));
  }, []);

  const handleAdicionar = async (e) => {
    e.preventDefault();
    if (!novaTarefa.trim()) return;
    try {
      const response = await apiClient.post('/checklist', { tarefa: novaTarefa });
      setItems([...items, response.data]);
      setNovaTarefa('');
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
      alert("Não foi possível adicionar a tarefa.");
    }
  };

  const handleMarcar = async (id, concluido) => {
    try {
      await apiClient.put(`/checklist/${id}`, { concluido: !concluido });
      setItems(items.map(item => item.id === id ? { ...item, concluido: !concluido } : item));
    } catch (error) {
      console.error("Erro ao marcar tarefa:", error);
      alert("Não foi possível atualizar a tarefa.");
    }
  };

  const handleRemover = async (id) => {
    if (window.confirm("Tem certeza que deseja remover esta tarefa?")) {
      try {
        await apiClient.delete(`/checklist/${id}`);
        setItems(items.filter(item => item.id !== id));
      } catch (error) {
        console.error("Erro ao remover tarefa:", error);
        alert("Não foi possível remover a tarefa.");
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
            placeholder="Ex: Enviar convites"
            required
          />
          <button type="submit">Adicionar Tarefa</button>
        </form>
      </div>

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
    </div>
  );
}

export default ChecklistPage;