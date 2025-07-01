import React, { useState } from 'react';

function EditableTask({ item, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(item.tarefa);

  const handleUpdate = () => {
    // Só salva se o texto mudou
    if (text.trim() && text !== item.tarefa) {
      onUpdate(item.id, text);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleUpdate();
    } else if (e.key === 'Escape') {
      setText(item.tarefa); // Cancela a edição
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleUpdate} // Salva quando o campo perde o foco
        onKeyDown={handleKeyDown}
        autoFocus // Foca no campo de input automaticamente
        className="editable-input"
      />
    );
  }

  return (
    <span onDoubleClick={() => setIsEditing(true)} className="editable-span">
      {item.tarefa}
    </span>
  );
}

export default EditableTask;