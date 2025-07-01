import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { toPng } from 'html-to-image';
import toast from 'react-hot-toast';

function ConvitePreview({ dados, forwardedRef }) {
    if (!dados) return null;
    
    const formatarData = (dataISO) => {
        if (!dataISO) return 'A ser definida';
        const data = new Date(dataISO);
        return new Date(data.getTime() + data.getTimezoneOffset() * 60000)
          .toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const nomesBebe = dados.bebes?.map(b => b.nome).join(' e ') || 'Nosso Bebê';

    return (
        <div className="convite-card" ref={forwardedRef} style={{ margin: '0 auto 20px auto' }}>
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
                <p><strong>Data:</strong> {formatarData(dados.data_cha)}</p>
                <p><strong>Local:</strong> {dados.local_cha || 'A ser definido'}</p>
            </div>
            </div>
            <div className="convite-footer">
            <p>Esperamos por você!</p>
            </div>
        </div>
    );
}

function MeuConvitePage() {
  const [dadosConvite, setDadosConvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const conviteRef = useRef(null);

  useEffect(() => {
    // Se o usuário está logado e temos um ID, busca os dados
    if (user?.id) {
      apiClient.get(`/convite/${user.id}`)
        .then(response => setDadosConvite(response.data))
        .catch(error => {
            console.error("Erro ao buscar dados do convite", error);
            toast.error("Não foi possível carregar os dados do convite.");
        })
        .finally(() => setLoading(false));
    } else if (user === null) {
        // Se sabemos que o usuário não está logado, para de carregar
        setLoading(false);
    }
    // A dependência [user] garante que o efeito rode novamente se o estado do usuário mudar
  }, [user]);

  // Se ainda estiver carregando (esperando o 'user' do AuthContext), mostra a mensagem
  if (loading) return <div>Carregando seu convite...</div>;
  
  // Se não foi possível carregar os dados (ex: usuário sem setup completo)
  if (!dadosConvite) {
    return (
        <div className="empty-state">
            <h3>Convite não configurado</h3>
            <p>Parece que você ainda não preencheu todos os dados necessários. Por favor, verifique a página de Configurações.</p>
        </div>
    );
  }

  const linkParaCompartilhar = `${window.location.origin}/convite/${user.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(linkParaCompartilhar);
    toast.success("Link copiado para a área de transferência!");
  };

  const handleDownload = async () => {
    if (conviteRef.current === null) return;
    try {
      const dataUrl = await toPng(conviteRef.current, { cacheBust: true, backgroundColor: 'white' });
      const link = document.createElement('a');
      link.download = 'convite-cha-de-bebe.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      toast.error("Oops, não foi possível baixar a imagem.");
    }
  };

  return (
    <div className="meu-convite-container">
      <h2>Meu Convite Digital</h2>
      <p>Abaixo está uma prévia do seu convite. Use os botões para compartilhar ou baixar.</p>
      
      <div className="preview-container">
        <ConvitePreview dados={dadosConvite} forwardedRef={conviteRef} />
      </div>

      <div className="actions-container">
        <h4>Compartilhe seu Convite</h4>
        <div className="link-box">
          <input type="text" value={linkParaCompartilhar} readOnly />
          <button onClick={handleCopyLink}>Copiar Link</button>
        </div>
        <div className="download-box">
          <button onClick={handleDownload}>Baixar como Imagem (PNG)</button>
        </div>
      </div>
    </div>
  );
}

export default MeuConvitePage;