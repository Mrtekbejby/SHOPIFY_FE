import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const TEMPLATE_LIST = {
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

const ITEMS_TEMPLATES = {
  "Weekly groceries": [
    { id: "wg-1", text: "bread", completed: false },
    { id: "wg-2", text: "ham", completed: true },
    { id: "wg-3", text: "milk", completed: false },
    { id: "wg-4", text: "pasta", completed: true },
    { id: "wg-5", text: "water", completed: false },
    { id: "wg-6", text: "pork chops", completed: true },
    { id: "wg-7", text: "eggs", completed: true },
    { id: "wg-8", text: "apple", completed: true },
    { id: "wg-9", text: "garlic", completed: false }
  ],
  "Office snacks": [
    { id: "sn-1", text: "chips", completed: false },
    { id: "sn-2", text: "cookies", completed: false },
    { id: "sn-3", text: "nuts", completed: false },
    { id: "sn-4", text: "chocolate bar", completed: false },
    { id: "sn-5", text: "cola", completed: false },
    { id: "sn-6", text: "sparkling water", completed: false }
  ],
  "Camping trip food list": [
    { id: "ct-1", text: "sausages", completed: false },
    { id: "ct-2", text: "marshmallows", completed: false },
    { id: "ct-3", text: "bread rolls", completed: false }
  ],
  "Birthday party supplies": [
    { id: "bp-1", text: "balloons", completed: true },
    { id: "bp-2", text: "cake", completed: false },
    { id: "bp-3", text: "napkins", completed: true },
    { id: "bp-4", text: "paper plates", completed: false },
    { id: "bp-5", text: "cups", completed: false }
  ]
};

const CURRENT_USER_ID = "u1";

const validateName = (value, original) => {
  const name = value.trim();
  if (!name) return "List name cannot be empty.";
  if (name === original) return "New name must be different from the current one.";
  return "";
};

function buildInitialItems(passedList) {
  if (Array.isArray(passedList.items)) {
    const hasRealText = passedList.items.some(
      (it) => it && typeof it === "object" && typeof it.text === "string"
    );
    if (hasRealText) {
      return passedList.items.map((it, index) => ({
        id: it.id || it.itemId || `${passedList.id}-item-${index + 1}`,
        text: it.text ?? `Item ${index + 1}`,
        completed: !!it.completed
      }));
    }
  }

  const count = Array.isArray(passedList.items)
    ? passedList.items.length
    : 0;

  const template = ITEMS_TEMPLATES[passedList.name];
  if (template) {
    return template.slice(0, count);
  }

  if (count > 0) {
    return Array.from({ length: count }, (_, i) => ({
      id: `${passedList.id}-item-${i + 1}`,
      text: `Item ${i + 1}`,
      completed: false
    }));
  }

  return [];
}

export default function ShoppingListDetail() {
  const navigate = useNavigate();
  const location = useLocation();

  const passedList = location.state?.list || null;

  const initialList = passedList
    ? {
        ...TEMPLATE_LIST,
        id: passedList.id,
        name: passedList.name,
        archived: passedList.archived ?? false,
        ownerId: passedList.ownerId ?? TEMPLATE_LIST.ownerId,
        items: buildInitialItems(passedList),
        members: (passedList.members || []).map((email, index) => ({
          id: "u" + index,
          name: email.split("@")[0],
          email
        }))
      }
    : TEMPLATE_LIST;

  const [list, setList] = useState(initialList);
  const [showResolved, setShowResolved] = useState(true);
  const [newItemText, setNewItemText] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(initialList.name);
  const [nameError, setNameError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isOwner = CURRENT_USER_ID === list.ownerId;
  const isMember = list.members.some((m) => m.id === CURRENT_USER_ID);
  const canLeave = !isOwner && isMember;

  const visibleItems = useMemo(() => {
    const itemsArray = Array.isArray(list.items) ? list.items : [];
    if (!showResolved) return itemsArray.filter((it) => !it.completed);
    return [...itemsArray].sort(
      (a, b) => Number(a.completed) - Number(b.completed)
    );
  }, [list.items, showResolved]);

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/shopping-lists");
  };

  // Items
  const addItem = () => {
    const text = newItemText.trim();
    if (!text) return;
    const id = "i" + Date.now();
    setList((prev) => ({
      ...prev,
      items: [...(prev.items || []), { id, text, completed: false }]
    }));
    setNewItemText("");
  };

  const toggleItem = (id) =>
    setList((prev) => ({
      ...prev,
      items: (prev.items || []).map((it) =>
        it.id === id ? { ...it, completed: !it.completed } : it
      )
    }));

  const removeItem = (id) =>
    setList((prev) => ({
      ...prev,
      items: (prev.items || []).filter((it) => it.id !== id)
    }));

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
    if (list.members.some((m) => m.email.toLowerCase() === email.toLowerCase()))
      return;

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
    setList((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== id)
    }));
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
        <button className="back" onClick={goBack}>
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
                <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                  {nameError}
                </div>
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
            <button
              className="btn primary"
              onClick={addItem}
              disabled={!newItemText.trim()}
            >
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
                <button
                  className="btn ghost danger"
                  onClick={() => removeItem(it.id)}
                >
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
            <div
              style={{
                color: "green",
                fontSize: "14px",
                marginTop: "6px",
                marginBottom: "8px"
              }}
            >
              {successMessage}
            </div>
          )}

          <div className="subhead">
            <span>Members</span>
          </div>
          <ul className="list members">
            {list.members.map((m) => (
              <li key={m.id} className="member">
                <div className="member-info">
                  <strong>{m.name}</strong>
                  <div className="muted">{m.email}</div>
                </div>
                {isOwner && m.id !== list.ownerId && (
                  <button
                    className="btn ghost danger"
                    onClick={() => removeMember(m.id)}
                  >
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