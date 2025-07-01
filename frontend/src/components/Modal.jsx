import React from 'react';

function Modal({ isOpen, onClose, children }) {
  // Se o modal não estiver aberto, não renderiza nada.
  if (!isOpen) {
    return null;
  }

  return (
    // O "backdrop" é o fundo semi-transparente que cobre a página.
    // Clicar nele fecha o modal.
    <div className="modal-backdrop" onClick={onClose}>
      {/* O "content" é a caixa branca do modal.
          Usamos e.stopPropagation() para evitar que um clique DENTRO do modal
          seja propagado para o backdrop e feche a janela. */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
}

export default Modal;