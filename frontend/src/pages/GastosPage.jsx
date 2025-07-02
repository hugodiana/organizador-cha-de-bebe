import { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';

function GastosPage() {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para o formulário
  const [descricao, setDescricao] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [valor, setValor] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState('Pix');
  const [categoria, setCategoria] = useState('Outros');

  // Estados para os filtros
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroPagamento, setFiltroPagamento] = useState('Todos');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');

  useEffect(() => {
    apiClient.get('/gastos')
      .then(response => {
        setGastos(response.data);
      })
      .catch(error => {
        console.error("Erro ao buscar gastos:", error);
        toast.error("Não foi possível carregar os gastos.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAddGasto = async (e) => {
    e.preventDefault();
    // --- CORREÇÃO DA VALIDAÇÃO ESTÁ AQUI ---
    if (!descricao.trim() || !valor.trim()) {
      toast.error("Por favor, preencha a descrição e o valor.");
      return;
    }
    
    const novoGasto = { descricao, fornecedor, valor: parseFloat(valor), metodo_pagamento: metodoPagamento, categoria };
    
    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/gastos', novoGasto);
      setGastos([response.data, ...gastos]);
      toast.success("Gasto adicionado com sucesso!");
      
      // Limpa todos os campos do formulário
      setDescricao('');
      setFornecedor('');
      setValor('');
      setMetodoPagamento('Pix');
      setCategoria('Outros');
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
        if (filtroCategoria !== 'Todas') return gasto.categoria === filtroCategoria;
        return true;
      })
      .filter(gasto => {
        if (filtroPagamento !== 'Todos') return gasto.metodo_pagamento === filtroPagamento;
        return true;
      })
      .filter(gasto => {
        const busca = termoBusca.toLowerCase();
        return (
          gasto.descricao.toLowerCase().includes(busca) ||
          (gasto.fornecedor && gasto.fornecedor.toLowerCase().includes(busca))
        );
      });
  }, [gastos, termoBusca, filtroPagamento, filtroCategoria]);

  if (loading) return <div>Carregando...</div>;

  const totalGastoFiltrado = gastosFiltrados.reduce((acc, gasto) => acc + gasto.valor, 0);

  return (
    <div className="page-container">
      <h2>Gestão de Gastos</h2>
      <div className="summary-bar">
        Total Exibido: <strong>R$ {totalGastoFiltrado.toFixed(2)}</strong>
      </div>
      
      <div className="form-container">
        <h3>Adicionar Novo Gasto</h3>
        <form onSubmit={handleAddGasto}>
          <div className="form-group full-width">
            <label htmlFor="descricao">Descrição</label>
            <input id="descricao" type="text" value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Ex: Bolo e doces" required />
          </div>
          <div className="form-group full-width">
            <label htmlFor="fornecedor">Fornecedor (Opcional)</label>
            <input id="fornecedor" type="text" value={fornecedor} onChange={e => setFornecedor(e.target.value)} placeholder="Ex: Doce Sabor" />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="valor">Valor (R$)</label>
              <input id="valor" type="number" value={valor} onChange={e => setValor(e.target.value)} placeholder="450.00" step="0.01" required />
            </div>
            <div className="form-group">
              <label htmlFor="metodoPagamento">Método de Pagamento</label>
              <select id="metodoPagamento" value={metodoPagamento} onChange={e => setMetodoPagamento(e.target.value)}>
                <option>Pix</option>
                <option>Cartão de Crédito</option>
                <option>Débito</option>
                <option>Dinheiro</option>
                <option>Outro</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="categoria">Categoria</label>
              <select id="categoria" value={categoria} onChange={e => setCategoria(e.target.value)}>
                <option>Outros</option>
                <option>Decoração</option>
                <option>Buffet/Comida</option>
                <option>Lembrancinhas</option>
                <option>Local</option>
                <option>Bebidas</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adicionando...' : 'Adicionar Gasto'}
          </button>
        </form>
      </div>

      <div className="data-list">
        <h3>Histórico de Gastos</h3>
        <div className="filter-container">
          <input type="text" placeholder="Buscar por descrição ou fornecedor..." value={termoBusca} onChange={e => setTermoBusca(e.target.value)} />
          <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}>
            <option value="Todas">Todas as Categorias</option>
            <option>Outros</option>
            <option>Decoração</option>
            <option>Buffet/Comida</option>
            <option>Lembrancinhas</option>
            <option>Local</option>
            <option>Bebidas</option>
          </select>
          <select value={filtroPagamento} onChange={e => setFiltroPagamento(e.target.value)}>
            <option value="Todos">Todos os Pagamentos</option>
            <option>Pix</option>
            <option>Cartão de Crédito</option>
            <option>Débito</option>
            <option>Dinheiro</option>
            <option>Outro</option>
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
                <th>Categoria</th>
                <th>Valor</th>
                <th>Pagamento</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {gastosFiltrados.map(gasto => (
                <tr key={gasto.id}>
                  <td data-label="Descrição">{gasto.descricao}</td>
                  <td data-label="Fornecedor">{gasto.fornecedor}</td>
                  <td data-label="Categoria">{gasto.categoria}</td>
                  <td data-label="Valor">R$ {gasto.valor.toFixed(2)}</td>
                  <td data-label="Pagamento">{gasto.metodo_pagamento}</td>
                  <td data-label="Ação"><button className="remove-btn" onClick={() => handleDeleteGasto(gasto.id)}>×</button></td>
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