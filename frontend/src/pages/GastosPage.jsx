import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

function GastosPage() {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para o formulário
  const [descricao, setDescricao] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [valor, setValor] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState('Pix');

  useEffect(() => {
    apiClient.get('/gastos')
      .then(response => {
        setGastos(response.data);
      })
      .catch(error => console.error("Erro ao buscar gastos", error))
      .finally(() => setLoading(false));
  }, []);

  const handleAddGasto = async (e) => {
    e.preventDefault();
    const novoGasto = { descricao, fornecedor, valor: parseFloat(valor), metodo_pagamento: metodoPagamento };

    try {
      const response = await apiClient.post('/gastos', novoGasto);
      setGastos([response.data, ...gastos]); // Adiciona o novo gasto no topo da lista
      // Limpa os campos do formulário
      setDescricao('');
      setFornecedor('');
      setValor('');
      setMetodoPagamento('Pix');
    } catch (error) {
      console.error("Erro ao adicionar gasto:", error);
      alert('Não foi possível adicionar o gasto.');
    }
  };

  const handleDeleteGasto = async (id) => {
    // Confirmação antes de apagar
    if (window.confirm("Tem certeza que deseja apagar este gasto?")) {
      try {
        await apiClient.delete(`/gastos/${id}`);
        setGastos(gastos.filter(g => g.id !== id)); // Remove o gasto da lista na tela
      } catch (error) {
        console.error("Erro ao apagar gasto:", error);
        alert('Não foi possível apagar o gasto.');
      }
    }
  };

  if (loading) return <div>Carregando...</div>;

  const totalGasto = gastos.reduce((acc, gasto) => acc + gasto.valor, 0);

  return (
    <div className="gastos-container">
      <h2>Gestão de Gastos</h2>
      <div className="orcamento-status">
        Total Gasto: <strong>R$ {totalGasto.toFixed(2)}</strong>
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
          <button type="submit">Adicionar Gasto</button>
        </form>
      </div>

      <div className="gastos-list">
        <h3>Histórico de Gastos</h3>
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
            {gastos.map(gasto => (
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
      </div>
    </div>
  );
}

export default GastosPage;