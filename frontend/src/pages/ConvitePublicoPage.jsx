import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Hook para ler parâmetros da URL
import apiClient from '../api/apiClient';

function ConvitePublicoPage() {
  // O useParams vai pegar o ID do usuário da URL (ex: /convite/1)
  const { userId } = useParams(); 
  const [dadosConvite, setDadosConvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;

    apiClient.get(`/convite/${userId}`)
      .then(response => {
        setDadosConvite(response.data);
      })
      .catch(err => {
        console.error("Erro ao buscar dados do convite:", err);
        setError("Oops! Não conseguimos encontrar este convite.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]); // Roda o efeito sempre que o userId mudar

  const formatarData = (dataISO) => {
    if (!dataISO) return '';
    const data = new Date(dataISO);
    return new Date(data.getTime() + data.getTimezoneOffset() * 60000) // Ajuste de fuso horário
      .toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
  };

  const nomesBebe = dadosConvite?.bebes.map(b => b.nome).join(' e ');

  if (loading) return <div className="convite-loading">Carregando convite...</div>;
  if (error) return <div className="convite-loading">{error}</div>;

  return (
    <div className="convite-background">
      <div className="convite-card">
        <div className="convite-header">
          <p>Você é nosso convidado especial para o</p>
          <h1>Chá de Bebê de</h1>
          <h2 className="convite-nome-bebe">{nomesBebe}</h2>
        </div>
        <div className="convite-body">
          <p className="frase-poema">
            Uma nova vida está a caminho,<br/>
            enchendo nossos corações de amor e carinho.
          </p>
          <div className="convite-detalhes">
            <p><strong>Data:</strong> {formatarData(dadosConvite.data_cha) || 'A ser definida'}</p>
            <p><strong>Local:</strong> {dadosConvite.local_cha || 'A ser definido'}</p>
          </div>
        </div>
        <div className="convite-footer">
          <p>Esperamos por você!</p>
        </div>
      </div>
    </div>
  );
}

export default ConvitePublicoPage;