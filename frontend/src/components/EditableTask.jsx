import React, { useState } from 'react';

function EditableText({ initialValue, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(initialValue);

  const handleSave = () => {
    // Só salva se o texto mudou e não está vazio
    if (text.trim() && text !== initialValue) {
      onSave(text);
    } else {
      // Se o texto não mudou ou está vazio, reverte para o valor original
      setText(initialValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setText(initialValue); // Cancela a edição
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleSave} // Salva quando o campo perde o foco
        onKeyDown={handleKeyDown}
        autoFocus
        className="editable-input"
      />
    );
  }

  return (
    <span onDoubleClick={() => setIsEditing(true)} className="editable-span">
      {initialValue}
    </span>
  );
}

export default EditableText;