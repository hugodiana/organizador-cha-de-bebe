import React, { useState } from 'react';

function EditableText({ initialValue, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(initialValue);

  const handleSave = () => {
    if (text.trim() && text !== initialValue) {
      onSave(text);
    } else {
      setText(initialValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setText(initialValue);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleSave}
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