import React, { useState, useRef, useEffect } from "react";

export default function CreateListModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const submit = (e) => {
    e.preventDefault();
    const v = name.trim();
    if (!v) return;
    onCreate(v);
    onClose();
  };

  return (
    <div className="modal-backdrop" onMouseDown={handleBackdrop}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-title"
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 id="create-title" className="modal-title">Create New List</h2>
            <p className="modal-subtitle">
              Enter a name for your new shopping list
            </p>
          </div>
          <button
            className="modal-close"
            aria-label="Close"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <form onSubmit={submit}>
          <label className="field">
            <span className="field-label">List Name</span>
            <input
              ref={inputRef}
              className="input lg"
              placeholder="e.g. Weekly Groceries"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" className="btn ghost lg" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn primary lg"
              disabled={!name.trim()}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}