import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
// Importa os componentes necessários da biblioteca de gráficos
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Componente Countdown (sem alterações) ---
function Countdown({ dataAlvo }) {
  const calculateTimeLeft = () => {
    const difference = +new Date(dataAlvo) - +new Date();
    let timeLeft = {};
    if (difference > 0) {
      timeLeft = { dias: Math.ceil(difference / (1000 * 60 * 60 * 24)) };
    }
    return timeLeft;
  };
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  useEffect(() => {
    const timer = setTimeout(() => setTimeLeft(calculateTimeLeft()), 60000);
    return () => clearTimeout(timer);
  });
  if (!timeLeft.dias || timeLeft.dias <= 0) return <span>O grande dia chegou!</span>;
  return <span>Faltam <strong>{timeLeft.dias}</strong> {timeLeft.dias === 1 ? 'dia' : 'dias'} para o seu chá!</span>;
}

// --- Componente Principal da Página do Dashboard (ATUALIZADO) ---
function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/dashboard')
      .then(response => setData(response.data))
      .catch(error => console.error("Erro ao buscar dados do dashboard", error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Carregando seu painel...</div>;
  if (!data) return <div>Não foi possível carregar os dados.</div>;

  const tituloCha = () => {
    if (!data.bebes || data.bebes.length === 0) return "Meu Chá de Bebê";
    const nomes = data.bebes.map(b => b.nome).join(' e ');
    return `Organizando o Chá de ${nomes}`;
  };

  const dadosGraficoGastos = data.resumo_gastos.por_categoria;
  const COLORS = ['#8EC5FC', '#E0C3FC', '#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

  return (
    <div className="dashboard-container">
      <h2>{tituloCha()}</h2>
      <div className="dashboard-header">
        <p>Olá, {data.nome_organizador}! Bem-vindo(a) de volta.</p>
        {data.data_cha && <p className="countdown"><Countdown dataAlvo={data.data_cha} /></p>}
      </div>
      
      <div className="dashboard-grid">
        
        {/* Card de Gastos agora com o Gráfico */}
        <div className="dashboard-card" style={{gridColumn: '1 / -1'}}>
          <h3>Resumo de Gastos</h3>
          <div className="resumo-gastos-container">
            <div className="resumo-numeros">
              <p>Total Gasto:</p>
              <span className="card-total">R$ {data.resumo_gastos.total.toFixed(2)}</span>
              <Link to="/gastos" className="card-link">Gerenciar Gastos →</Link>
            </div>
            <div className="resumo-grafico">
              {dadosGraficoGastos.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={dadosGraficoGastos} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
                      {dadosGraficoGastos.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="grafico-vazio">Adicione gastos com categorias para ver o gráfico.</p> }
            </div>
          </div>
        </div>

        {/* Outros cards */}
        <Link to="/convidados" className="dashboard-card-link">
          <div className="dashboard-card">
              <h3>Lista de Convidados</h3>
              <p>Total de pessoas na lista:</p>
              <span className="card-total">{data.resumo_convidados.total}</span>
          </div>
        </Link>
        
        <Link to="/checklist" className="dashboard-card-link">
          <div className="dashboard-card">
              <h3>Checklist</h3>
              <p>Progresso das tarefas:</p>
              <span className="card-total">{data.resumo_checklist.concluidas} de {data.resumo_checklist.total}</span>
          </div>
        </Link>

      </div>
    </div>
  );
}

export default DashboardPage;