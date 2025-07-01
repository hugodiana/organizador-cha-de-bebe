import { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';

function GastosPage() {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [descricao, setDescricao] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [valor, setValor] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState('Pix');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroPagamento, setFiltroPagamento] = useState('Todos');

  useEffect(() => {
    apiClient.get('/gastos')
      .then(response => {
        setGastos(response.data);
      })
      .catch(error => {
        console.error("Erro ao buscar gastos:", error);
        toast.error("Não foi possível carregar os gastos.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAddGasto = async (e) => {
    e.preventDefault();
    if (!descricao.trim() || !valor.trim()) {
      toast.error("Por favor, preencha a descrição e o valor.");
      return;
    }
    const novoGasto = { descricao, fornecedor, valor: parseFloat(valor), metodo_pagamento: metodoPagamento };
    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/gastos', novoGasto);
      setGastos([response.data, ...gastos]);
      toast.success("Gasto adicionado com sucesso!");
      setDescricao('');
      setFornecedor('');
      setValor('');
      setMetodoPagamento('Pix');
    } catch (error) {
      console.error("Erro ao adicionar gasto:", error);
      toast.error('Não foi possível adicionar o gasto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGasto = async (id) => {
    if (window.confirm("Tem certeza que deseja apagar este gasto?")) {
      try {
        await apiClient.delete(`/gastos/${id}`);
        setGastos(gastos.filter(g => g.id !== id));
        toast.success("Gasto removido com sucesso.");
      } catch (error) {
        console.error("Erro ao apagar gasto:", error);
        toast.error('Não foi possível apagar o gasto.');
      }
    }
  };

  const gastosFiltrados = useMemo(() => {
    return gastos
      .filter(gasto => {
        if (filtroPagamento !== 'Todos') {
          return gasto.metodo_pagamento === filtroPagamento;
        }
        return true;
      })
      .filter(gasto => {
        const busca = termoBusca.toLowerCase();
        return (
          gasto.descricao.toLowerCase().includes(busca) ||
          (gasto.fornecedor && gasto.fornecedor.toLowerCase().includes(busca))
        );
      });
  }, [gastos, termoBusca, filtroPagamento]);

  if (loading) return <div>Carregando...</div>;

  const totalGastoFiltrado = gastosFiltrados.reduce((acc, gasto) => acc + gasto.valor, 0);

  return (
    <div className="gastos-container">
      <h2>Gestão de Gastos</h2>
      <div className="orcamento-status">
        Total Exibido: <strong>R$ {totalGastoFiltrado.toFixed(2)}</strong>
      </div>

      <div className="form-container">
        <h3>Adicionar Novo Gasto</h3>
        <form onSubmit={handleAddGasto}>
          <input type="text" value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descrição (ex: Bolo e doces)" required />
          <input type="text" value={fornecedor} onChange={e => setFornecedor(e.target.value)} placeholder="Fornecedor (ex: Doce Sabor)" />
          <input type="number" value={valor} onChange={e => setValor(e.target.value)} placeholder="Valor (ex: 450.00)" step="0.01" required />
          <select value={metodoPagamento} onChange={e => setMetodoPagamento(e.target.value)}>
            <option>Pix</option>
            <option>Cartão de Crédito</option>
            <option>Débito</option>
            <option>Dinheiro</option>
            <option>Outro</option>
          </select>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adicionando...' : 'Adicionar Gasto'}
          </button>
        </form>
      </div>

      <div className="gastos-list">
        <h3>Histórico de Gastos</h3>
        <div className="filter-container">
          <input 
            type="text"
            placeholder="Buscar por descrição ou fornecedor..."
            value={termoBusca}
            onChange={e => setTermoBusca(e.target.value)}
          />
          <select value={filtroPagamento} onChange={e => setFiltroPagamento(e.target.value)}>
            <option value="Todos">Todos os Pagamentos</option>
            <option value="Pix">Pix</option>
            <option value="Cartão de Crédito">Cartão de Crédito</option>
            <option value="Débito">Débito</option>
            <option value="Dinheiro">Dinheiro</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        {gastos.length > 0 && gastosFiltrados.length === 0 ? (
            <div className="empty-state">
                <h3>Nenhum resultado encontrado</h3>
                <p>Tente ajustar os termos da sua busca ou filtro.</p>
            </div>
        ) : gastos.length === 0 ? (
            <div className="empty-state">
                <h3>Nenhum Gasto Registrado</h3>
                <p>Comece a adicionar suas despesas no formulário acima.</p>
            </div>
        ) : (
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Fornecedor</th>
                  <th>Valor</th>
                  <th>Pagamento</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {gastosFiltrados.map(gasto => (
                  <tr key={gasto.id}>
                    <td>{gasto.descricao}</td>
                    <td>{gasto.fornecedor}</td>
                    <td>R$ {gasto.valor.toFixed(2)}</td>
                    <td>{gasto.metodo_pagamento}</td>
                    <td><button className="remove-btn" onClick={() => handleDeleteGasto(gasto.id)}>×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
        )}
      </div>
    </div>
  );
}
export default GastosPage;
