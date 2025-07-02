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
  const [categoria, setCategoria] = useState('Outros'); // <-- NOVO ESTADO PARA CATEGORIA

  // Estados para os filtros
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroPagamento, setFiltroPagamento] = useState('Todos');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas'); // <-- NOVO ESTADO PARA FILTRO DE CATEGORIA

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
    if (!descricao.trim() || !valor.trim()) {
      toast.error("Por favor, preencha a descrição e o valor.");
      return;
    }
    // Adiciona a categoria ao objeto enviado para a API
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
      .filter(gasto => { // Filtro de Categoria
        if (filtroCategoria !== 'Todas') return gasto.categoria === filtroCategoria;
        return true;
      })
      .filter(gasto => { // Filtro de Pagamento
        if (filtroPagamento !== 'Todos') return gasto.metodo_pagamento === filtroPagamento;
        return true;
      })
      .filter(gasto => { // Filtro de Busca por texto
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
          {/* CAMPO DE CATEGORIA ADICIONADO */}
          <select value={categoria} onChange={e => setCategoria(e.target.value)}>
            <option>Outros</option>
            <option>Decoração</option>
            <option>Buffet/Comida</option>
            <option>Lembrancinhas</option>
            <option>Local</option>
            <option>Bebidas</option>
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
          {/* FILTRO DE CATEGORIA ADICIONADO */}
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
                <th>Categoria</th> {/* COLUNA DE CATEGORIA ADICIONADA */}
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
                  <td>{gasto.categoria}</td> {/* CÉLULA DE CATEGORIA ADICIONADA */}
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