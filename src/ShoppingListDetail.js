import React, { useMemo, useState } from "react";

const INITIAL_LIST = {
  id: "list-1",
  name: "Weekly groceries",
  archived: false,
  ownerId: "u1",
  items: [
    { id: "i1", text: "bread", completed: false },
    { id: "i2", text: "ham", completed: true },
    { id: "i3", text: "milk", completed: false },
    { id: "i4", text: "pasta", completed: true },
    { id: "i5", text: "water", completed: false },
    { id: "i6", text: "pork chops", completed: true },
    { id: "i7", text: "eggs", completed: true },
    { id: "i8", text: "apple", completed: true },
    { id: "i9", text: "garlic", completed: false }
  ],
  members: []
};

const CURRENT_USER_ID = "u1";

const validateName = (value, original) => {
  const name = value.trim();
  if (!name) return "List name cannot be empty.";
  if (name === original) return "New name must be different from the current one.";
  return "";
};

export default function ShoppingListDetail() {
  const [list, setList] = useState(INITIAL_LIST);
  const [showResolved, setShowResolved] = useState(true);
  const [newItemText, setNewItemText] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(list.name);
  const [nameError, setNameError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isOwner = CURRENT_USER_ID === list.ownerId;
  const isMember = list.members.some((m) => m.id === CURRENT_USER_ID);
  const canLeave = !isOwner && isMember;

  const visibleItems = useMemo(() => {
    if (!showResolved) return list.items.filter((it) => !it.completed);
    return [...list.items].sort((a, b) => Number(a.completed) - Number(b.completed));
  }, [list.items, showResolved]);

  // Items
  const addItem = () => {
    const text = newItemText.trim();
    if (!text) return;
    const id = "i" + Date.now();
    setList((prev) => ({ ...prev, items: [...prev.items, { id, text, completed: false }] }));
    setNewItemText("");
  };

  const toggleItem = (id) =>
    setList((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id === id ? { ...it, completed: !it.completed } : it))
    }));

  const removeItem = (id) =>
    setList((prev) => ({ ...prev, items: prev.items.filter((it) => it.id !== id) }));

  // Rename
  const startRename = () => {
    if (!isOwner) return;
    setTempName(list.name);
    setNameError("");
    setEditingName(true);
  };

  const saveRename = () => {
    if (!isOwner) return;
    if (nameError) return; 
    const name = tempName.trim();
    setList((prev) => ({ ...prev, name }));
    setEditingName(false);
    setNameError("");
  };

  // Members 
  const addMember = () => {
    if (!isOwner) return;

    const email = newMemberEmail.trim();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return;
    if (list.members.some((m) => m.email.toLowerCase() === email.toLowerCase())) return;

    const id = "u" + Date.now();
    setList((prev) => ({
      ...prev,
      members: [...prev.members, { id, name: email.split("@")[0], email }]
    }));
    setNewMemberEmail("");

  setSuccessMessage("Member added successfully!");
  setTimeout(() => setSuccessMessage(""), 2500);
};

  const removeMember = (id) => {
    if (!isOwner || id === list.ownerId) return;
    setList((prev) => ({ ...prev, members: prev.members.filter((m) => m.id !== id) }));
  };

  const leaveList = () => {
    if (!canLeave) return;
    setList((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== CURRENT_USER_ID)
    }));
  };

  return (
    <div className="page">
      {/* Header */}
      <header className="topbar">
        <button className="back" onClick={() => alert("Back (demo)")}>
          ← Back
        </button>

        <div className="title-row">
          {editingName ? (
            <div className="inline-edit">
              <input
                className="input"
                value={tempName}
                onChange={(e) => {
                  const v = e.target.value;
                  setTempName(v);
                  setNameError(validateName(v, list.name));
                }}
                placeholder="List Name"
              />
              <button
                className="btn primary"
                onClick={saveRename}
                disabled={!isOwner || !!nameError} 
              >
                Save
              </button>
              <button
                className="btn ghost"
                onClick={() => {
                  setEditingName(false);
                  setNameError("");
                }}
              >
                Cancel
              </button>

              {nameError && (
                <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>{nameError}</div>
              )}
            </div>
          ) : (
            <>
              <h2 className="title">{list.name}</h2>
              {isOwner && (
                <button className="link" onClick={startRename}>
                  ✎
                </button>
              )}
            </>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="grid">
        {/* Items Panel */}
        <section className="card">
          <div className="card-header">
            <h3 className="card-title">Items</h3>
            <label className="switch-wrap">
              <input
                type="checkbox"
                checked={showResolved}
                onChange={() => setShowResolved((v) => !v)}
              />
              <span>Show resolved</span>
            </label>
          </div>

          <div className="add-row">
            <input
              className="input"
              placeholder="Add item..."
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
            />
            <button className="btn primary" onClick={addItem} disabled={!newItemText.trim()}>
              ＋
            </button>
          </div>

          <ul className="list">
            {visibleItems.map((it) => (
              <li key={it.id} className="item">
                <label className="item-left">
                  <input
                    type="checkbox"
                    checked={it.completed}
                    onChange={() => toggleItem(it.id)}
                  />
                  <span className={it.completed ? "done" : ""}>{it.text}</span>
                </label>
                <button className="btn ghost danger" onClick={() => removeItem(it.id)}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Members Panel */}
        <section className="card">
          <div className="card-header">
            <h3 className="card-title">Members</h3>
          </div>

          <div className="add-row">
            <input
              type="email"
              className="input"
              placeholder="Add member (e-mail@example.com)"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addMember()}
              disabled={!isOwner}
            />
            <button
              className="btn primary"
              onClick={addMember}
              disabled={!isOwner || !newMemberEmail.trim()}
            >
              ＋
            </button>
          </div>
          
          {successMessage && (
  <div style={{
    color: "green",
    fontSize: "14px",
    marginTop: "6px",
    marginBottom: "8px"
  }}>
    {successMessage}
  </div>
)}
          <div className="subhead">
            <span>Owner</span>
          </div>
          <ul className="list members">
            {list.members.map((m) => (
              <li key={m.id} className="member">
                <div className="member-info">
                  <strong>{m.name}</strong>
                  <div className="muted">{m.email}</div>
                </div>
                {isOwner && m.id !== list.ownerId && (
                  <button className="btn ghost danger" onClick={() => removeMember(m.id)}>
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>

          {canLeave && (
            <div style={{ marginTop: 12 }}>
              <button className="btn ghost danger" onClick={leaveList}>
                Leave list
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}