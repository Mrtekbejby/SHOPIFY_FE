import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { addItemApi, toggleItemApi, deleteItemApi } from "./api/itemApi";
import { addMemberApi, removeMemberApi } from "./api/memberApi";
import { fetchLists, renameListApi } from "./api/listApi";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const PIE_COLORS = ["#22c55e", "#ef4444"];
const CURRENT_USER_ID = "u1";
const CURRENT_USER_EMAIL = "lucas@gmail.com";

function AlertModal({ message, onClose, t }) {
  return (
    <div className="alert-overlay">
      <div className="alert-card">
        <h3 className="alert-title">{t("oops")}</h3>
        <p className="alert-message">{message}</p>
        <button className="btn primary" onClick={onClose}>
          {t("ok")}
        </button>
      </div>
    </div>
  );
}

export default function ShoppingListDetail({ theme, onToggleTheme, lang, setLang, t }) {
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
      setAlertMessage(t("renameEmpty"));
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
        setAlertMessage(t("renameDuplicate"));
        setLoadingAction(false);
        return;
      }

      const updated = await renameListApi(list.id, trimmed);
      setList(updated);
      setEditingName(false);
    } catch {
      setAlertMessage(t("renameFailed"));
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

  const stats = useMemo(() => {
    const items = list?.items ?? [];
    const done = items.filter((i) => i.completed).length;
    const todo = items.length - done;

    return [
      { name: t("done"), value: done },
      { name: t("toBuy"), value: todo }
    ];
  }, [list, t]);

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
      alert(t("failedAddItem"));
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
      alert(t("failedUpdateItem"));
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
      alert(t("failedDeleteItem"));
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
      alert(t("failedAddMember"));
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
      alert(t("failedRemoveMember"));
    } finally {
      setLoadingAction(false);
    }
  };

  const leaveList = async () => {
    const me = list.members.find((m) => m.email === CURRENT_USER_EMAIL);
    if (me) await removeMember(me.id);
  };

  if (status === "loading") return <div className="page">{t("loading")}</div>;
  if (status === "error" || !list) return <div className="page">{t("listNotFound")}</div>;

  return (
    <div className="page">
      <header className="topbar">
        <button className="back" onClick={goBack}>← {t("back")}</button>

        {!editingName ? (
          <div className="title-row">
            <h2 className="title">{list.name}</h2>
            {isOwner && (
              <button className="link" onClick={startRename} title={t("renameTooltip")}>
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
            <button className="btn primary" onClick={saveRename}>{t("save")}</button>
            <button className="btn ghost" onClick={() => setEditingName(false)}>{t("cancel")}</button>
          </div>
        )}

        <div className="detail-actions">
          <button className="badge theme-toggle" onClick={onToggleTheme} title={t("toggleTheme")}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          <button
            className="badge badge-lang"
            onClick={() => setLang(lang === "en" ? "cs" : "en")}
            title={t("changeLang")}
          >
            <span className="flag" aria-hidden>{lang === "en" ? "🇬🇧" : "🇨🇿"}</span>
            <span className="code">{lang === "en" ? "EN" : "CS"}</span>
          </button>
        </div>

      </header>

      <main className="grid">

        {/* ITEMS */}
        <section className="card">
          <div className="card-header">
            <h3 className="card-title">{t("itemsTitle")}</h3>
            <label className="switch-wrap">
              <input type="checkbox" checked={showResolved} onChange={() => setShowResolved((v) => !v)} />
              <span>{t("showResolved")}</span>
            </label>
          </div>

          <div className="add-row">
            <input className="input"
              placeholder={t("addItemPlaceholder")}
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
            <h3 className="card-title">{t("membersTitle")}</h3>
          </div>

          <div className="add-row">
            <input type="email"
              className="input"
              placeholder={t("addMemberPlaceholder")}
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
                  <button className="btn ghost danger" onClick={() => removeMember(m.id)}>{t("remove")}</button>
                )}
              </li>
            ))}
          </ul>

          {!isOwner && (
            <button className="btn ghost danger" onClick={leaveList}>{t("leaveList")}</button>
          )}
        </section>

        {/* STATS */}
        <section className="card">
          <div className="card-header">
            <h3 className="card-title">{t("statsTitle")}</h3>
          </div>

          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={stats}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={0}
                >
                  {stats.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
            <span style={{ color: PIE_COLORS[0] }}>
              ● {t("done")}: {stats[0].value}
            </span>
            <span style={{ color: PIE_COLORS[1] }}>
              ● {t("toBuy")}: {stats[1].value}
            </span>
          </div>
        </section>

      </main>
      {alertMessage && (
        <AlertModal
          message={alertMessage}
          onClose={() => setAlertMessage("")}
          t={t}
        />
      )}

    </div>
  );
}