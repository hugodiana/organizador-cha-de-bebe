import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';

// --- Componente para o Contador Regressivo ---
function Countdown({ dataAlvo }) {
  const calculateTimeLeft = () => {
    const difference = +new Date(dataAlvo) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        dias: Math.ceil(difference / (1000 * 60 * 60 * 24)),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000); // Atualiza a cada minuto
    return () => clearTimeout(timer);
  });

  if (!timeLeft.dias || timeLeft.dias <= 0) {
    return <span>O grande dia chegou!</span>;
  }

  return <span>Faltam <strong>{timeLeft.dias}</strong> {timeLeft.dias === 1 ? 'dia' : 'dias'} para o seu chá!</span>;
}

// --- Componente Principal da Página do Dashboard ---
function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/dashboard')
      .then(response => {
        setData(response.data);
      })
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
      
      <div className="dashboard-grid">
         <div className="dashboard-card">
            <h3>Ferramentas</h3>
            <p>Gerencie seus gastos e convidados para manter tudo sob controle.</p>
            {/* Adicionaremos os links para as ferramentas aqui */}
         </div>
         <div className="dashboard-card">
            <h3>Checklist</h3>
            <p>Acompanhe as tarefas para não esquecer de nada.</p>
         </div>
      </div>
    </div>
  );
}

export default DashboardPage;