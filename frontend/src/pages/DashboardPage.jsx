// Arquivo: frontend/src/pages/DashboardPage.jsx (Versão Corrigida)

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';

// --- Componente para o Contador Regressivo (não precisa mudar) ---
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

  return (
    <div className="dashboard-container">
      <h2>{tituloCha()}</h2>
      <div className="dashboard-header">
        <p>Olá, {data.nome_organizador}! Bem-vindo(a) de volta.</p>
        {data.data_cha && <p className="countdown"><Countdown dataAlvo={data.data_cha} /></p>}
      </div>

      {/* --- GRID DE CARDS ATUALIZADO E DINÂMICO --- */}
      <div className="dashboard-grid">

        <Link to="/gastos" className="dashboard-card-link">
          <div className="dashboard-card">
              <h3>Gestão de Gastos</h3>
              <p>Total gasto até agora:</p>
              <span className="card-total">R$ {data.resumo_gastos.total.toFixed(2)}</span>
          </div>
        </Link>

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