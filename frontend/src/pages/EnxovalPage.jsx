import { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';

function EnxovalPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Agrupa os itens por categoria para exibição
  const itensAgrupados = useMemo(() => {
    return items.reduce((acc, item) => {
      (acc[item.categoria] = acc[item.categoria] || []).push(item);
      return acc;
    }, {});
  }, [items]);

  const handleMarcar = async (id, concluido) => {
    // Atualização otimista na tela
    setItems(items.map(item => item.id === id ? { ...item, concluido: !concluido } : item));
    try {
      await apiClient.put(`/enxoval/${id}`, { concluido: !concluido });
    } catch (error) {
      toast.error("Não foi possível salvar a alteração.");
      // Reverte a mudança se der erro
      setItems(items.map(item => item.id === id ? { ...item, concluido: concluido } : item));
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="enxoval-container">
      <h2>Checklist de Enxoval</h2>
      <p>Marcamos alguns itens essenciais para você começar. Marque o que você já tem!</p>

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
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
export default EnxovalPage;