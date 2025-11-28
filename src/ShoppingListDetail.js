import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { addItemApi, toggleItemApi, deleteItemApi } from "./api/itemApi";
import { addMemberApi, removeMemberApi } from "./api/memberApi";
import { fetchLists, renameListApi } from "./api/listApi";

const CURRENT_USER_ID = "u1";
const CURRENT_USER_EMAIL = "lucas@gmail.com"; 
function AlertModal({ message, onClose }) {
  return (
    <div className="alert-overlay">
      <div className="alert-card">
        <h3 className="alert-title">Oops…</h3>
        <p className="alert-message">{message}</p>
        <button className="btn primary" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}

export default function ShoppingListDetail() {
  const navigate = useNavigate();
  const { listId } = useParams();

  const [list, setList] = useState(null);
  const [status, setStatus] = useState("loading");

  const [showResolved, setShowResolved] = useState(true);
  const [newItemText, setNewItemText] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const isOwner = list && CURRENT_USER_ID === list.ownerId;

  const loadList = async () => {
    try {
      const allLists = await fetchLists();
      const found = allLists.find((l) => l.id === listId);
      setList(found ?? null);
      setStatus(found ? "ready" : "error");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    loadList();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId]);

  // RENAME
  const startRename = () => {
    setTempName(list.name);
    setEditingName(true);
  };

  const saveRename = async () => {
    const trimmed = tempName.trim();
  
    if (!trimmed) {
      setAlertMessage("List name cannot be empty.");
      return;
    }
  
    try {
      setLoadingAction(true);
      const allLists = await fetchLists();
      const exists = allLists.some(
        (l) =>
          l.id !== list.id &&
          l.name.toLowerCase() === trimmed.toLowerCase()
      );
  
      if (exists) {
        setAlertMessage("A list with this name already exists.");
        setLoadingAction(false);
        return;
      }
  
      const updated = await renameListApi(list.id, trimmed);
      setList(updated);
      setEditingName(false);
    } catch {
      setAlertMessage("Failed to rename list. Please try again.");
    } finally {
      setLoadingAction(false);
    }
  };

  const visibleItems = useMemo(() => {
    if (!list) return [];
    const items = list.items ?? [];
    if (!showResolved) return items.filter((i) => !i.completed);
    return [...items].sort((a, b) => Number(a.completed) - Number(b.completed));
  }, [list, showResolved]);

  const goBack = () => navigate("/shopping-lists");

  const addItem = async () => {
    const text = newItemText.trim();
    if (!text) return;
    try {
      setLoadingAction(true);
      setList(await addItemApi(list.id, text));
      await loadList();
      setNewItemText("");
    } catch {
      alert("Failed to add item");
    } finally {
      setLoadingAction(false);
    }
  };

  const toggleItem = async (id) => {
    try {
      setLoadingAction(true);
      setList(await toggleItemApi(list.id, id));
      await loadList();
    } catch {
      alert("Failed to update item");
    } finally {
      setLoadingAction(false);
    }
  };

  const removeItem = async (id) => {
    try {
      setLoadingAction(true);
      setList(await deleteItemApi(list.id, id));
      await loadList();
    } catch {
      alert("Failed to delete item");
    } finally {
      setLoadingAction(false);
    }
  };

  const addMember = async () => {
    const email = newMemberEmail.trim();
    if (!email) return;
    try {
      setLoadingAction(true);
      setList(await addMemberApi(list.id, email));
      await loadList();
      setNewMemberEmail("");
    } catch {
      alert("Failed to add member");
    } finally {
      setLoadingAction(false);
    }
  };

  const removeMember = async (memberId) => {
    try {
      setLoadingAction(true);
      setList(await removeMemberApi(list.id, memberId));
      await loadList();
    } catch {
      alert("Failed to remove member");
    } finally {
      setLoadingAction(false);
    }
  };

  const leaveList = async () => {
    const me = list.members.find((m) => m.email === CURRENT_USER_EMAIL);
    if (me) await removeMember(me.id);
  };

  if (status === "loading") return <div className="page">Loading...</div>;
  if (status === "error" || !list) return <div className="page">List not found</div>;

  return (
    <div className="page">
     <header className="topbar">
  <button className="back" onClick={goBack}>← Back</button>

  {!editingName ? (
    <div className="title-row">
      <h2 className="title">{list.name}</h2>
      {isOwner && (
        <button className="link" onClick={startRename} title="Rename list">
          ✎
        </button>
      )}
    </div>
  ) : (
    <div className="rename-row">
      <input
        className="input"
        value={tempName}
        onChange={(e) => setTempName(e.target.value)}
      />
      <button className="btn primary" onClick={saveRename}>Save</button>
      <button className="btn ghost" onClick={() => setEditingName(false)}>Cancel</button>
    </div>
  )}
</header>

      <main className="grid">

        {/* ITEMS */}
        <section className="card">
          <div className="card-header">
            <h3 className="card-title">Items</h3>
            <label className="switch-wrap">
              <input type="checkbox" checked={showResolved} onChange={() => setShowResolved((v) => !v)} />
              <span>Show resolved</span>
            </label>
          </div>

          <div className="add-row">
            <input className="input"
              placeholder="Add item..."
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
            />
            <button className="btn primary" disabled={!newItemText.trim() || loadingAction} onClick={addItem}>＋</button>
          </div>

          <ul className="list">
            {visibleItems.map((it) => (
              <li key={it.id} className="item">
                <label className="item-left">
                  <input type="checkbox" checked={it.completed} onChange={() => toggleItem(it.id)} />
                  <span className={it.completed ? "done" : ""}>{it.text}</span>
                </label>
                <button className="btn ghost danger" onClick={() => removeItem(it.id)}>×</button>
              </li>
            ))}
          </ul>
        </section>

        {/* MEMBERS */}
        <section className="card">
          <div className="card-header">
            <h3 className="card-title">Members</h3>
          </div>

          <div className="add-row">
            <input type="email"
              className="input"
              placeholder="Add member (email@example.com)"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addMember()}
              disabled={!isOwner}
            />
            <button className="btn primary" disabled={!isOwner || !newMemberEmail.trim() || loadingAction} onClick={addMember}>＋</button>
          </div>

          <ul className="list members">
            {list.members.map((m) => (
              <li key={m.id} className="member">
                <div className="member-info">
                  <strong>{m.email.split("@")[0]}</strong>
                  <div className="muted">{m.email}</div>
                </div>
                {isOwner && m.id !== list.ownerId && (
                  <button className="btn ghost danger" onClick={() => removeMember(m.id)}>Remove</button>
                )}
              </li>
            ))}
          </ul>

          {!isOwner && (
            <button className="btn ghost danger" onClick={leaveList}>Leave list</button>
          )}
        </section>
      </main>
      {alertMessage && (
        <AlertModal
          message={alertMessage}
          onClose={() => setAlertMessage("")}
        />
      )}

    </div>
  );
}