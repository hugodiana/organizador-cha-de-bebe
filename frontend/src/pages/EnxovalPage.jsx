import { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';

function EnxovalPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para o novo formulário
  const [novoItem, setNovoItem] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('Roupas');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    toast.promise(
      apiClient.get('/enxoval').then(response => {
        setItems(response.data);
        return response.data;
      }),
      {
        loading: 'Buscando lista de enxoval...',
        success: 'Lista carregada!',
        error: 'Não foi possível carregar a lista.',
      }
    ).finally(() => setLoading(false));
  }, []);

  const itensAgrupados = useMemo(() => {
    return items.reduce((acc, item) => {
      (acc[item.categoria] = acc[item.categoria] || []).push(item);
      return acc;
    }, {});
  }, [items]);

  const handleMarcar = async (id, concluido) => {
    setItems(items.map(item => item.id === id ? { ...item, concluido: !concluido } : item));
    try {
      await apiClient.put(`/enxoval/${id}`, { concluido: !concluido });
    } catch (error) {
      toast.error("Não foi possível salvar a alteração.");
      setItems(items.map(item => item.id === id ? { ...item, concluido: concluido } : item));
    }
  };

  // --- NOVA FUNÇÃO PARA ADICIONAR ITEM ---
  const handleAdicionarItem = async (e) => {
    e.preventDefault();
    if (!novoItem.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/enxoval', { item: novoItem, categoria: novaCategoria });
      setItems([...items, response.data]); // Adiciona o novo item na tela
      toast.success("Item adicionado ao enxoval!");
      setNovoItem(''); // Limpa o campo
    } catch (error) {
      toast.error("Não foi possível adicionar o item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- NOVA FUNÇÃO PARA REMOVER ITEM ---
  const handleRemoverItem = async (id) => {
    // Usamos um toast de confirmação em vez de window.confirm
    toast((t) => (
      <span>
        Tem certeza? 
        <button 
          style={{ marginLeft: '10px', border: '1px solid white', background: 'var(--cor-erro)', color: 'white' }}
          onClick={async () => {
            toast.dismiss(t.id);
            try {
              await apiClient.delete(`/enxoval/${id}`);
              setItems(items.filter(item => item.id !== id));
              toast.success("Item removido.");
            } catch (err) {
              toast.error("Não foi possível remover.");
            }
          }}
        >
          Apagar
        </button>
      </span>
    ));
  };


  if (loading) return <div>Carregando...</div>;

  return (
    <div className="enxoval-container">
      <h2>Checklist de Enxoval</h2>
      <p>Marcamos alguns itens essenciais para você começar. Adicione, marque e remova para se organizar!</p>
      
      {/* --- FORMULÁRIO PARA ADICIONAR NOVOS ITENS --- */}
      <div className="form-container">
        <h3>Adicionar Novo Item ao Enxoval</h3>
        <form onSubmit={handleAdicionarItem}>
          <input
            type="text"
            value={novoItem}
            onChange={(e) => setNovoItem(e.target.value)}
            placeholder="Ex: Babador"
            required
          />
          <select value={novaCategoria} onChange={(e) => setNovaCategoria(e.target.value)}>
            <option>Roupas</option>
            <option>Higiene</option>
            <option>Quarto</option>
            <option>Passeio</option>
            <option>Outros</option>
          </select>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adicionando...' : 'Adicionar Item'}
          </button>
        </form>
      </div>
      
      {Object.keys(itensAgrupados).sort().map(categoria => (
        <div key={categoria} className="enxoval-categoria">
          <h3>{categoria}</h3>
          <ul className="checklist">
            {itensAgrupados[categoria].map(item => (
              <li key={item.id} className={item.concluido ? 'concluido' : ''}>
                <input
                  type="checkbox"
                  checked={item.concluido}
                  onChange={() => handleMarcar(item.id, item.concluido)}
                />
                <span>{item.item}</span>
                {/* --- BOTÃO DE REMOVER ADICIONADO AQUI --- */}
                <button onClick={() => handleRemoverItem(item.id)} className="remove-btn">×</button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
export default EnxovalPage;