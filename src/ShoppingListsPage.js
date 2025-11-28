import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreateListModal from "./CreateListModal";
import {
  fetchLists,
  createList,
  archiveListApi,
  deleteListApi
} from "./api/listApi";

const CURRENT_USER_ID = "u1";

function ShopifyWordmark() {
  return (
    <div className="brand">
      <svg className="brand-logo" viewBox="0 0 520 100" aria-label="Shopify" role="img">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2d68ff" />
            <stop offset="100%" stopColor="#55d3ff" />
          </linearGradient>
        </defs>
        <text
          x="0"
          y="72"
          fontFamily="system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
          fontWeight="900"
          fontSize="72"
          letterSpacing="1"
          fill="url(#g)"
        >
          SHOPIFY
        </text>
      </svg>
      <span className="brand-sub">Organize your shopping</span>
    </div>
  );
}

function StatBadge({ icon, value, label }) {
  return (
    <span className="badge">
      <span className="badge-icon" aria-hidden>{icon}</span>
      <span className="badge-value">{value}</span>
      <span className="badge-label">{label}</span>
    </span>
  );
}

function ListCard({
  name,
  itemCount,
  memberCount,
  archived,
  onClick,
  canDelete,
  onDelete,
  canArchive,
  onArchive
}) {
  return (
    <div
      className="listcard"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      style={{ cursor: "pointer" }}
    >
      <span className="listcard-name">
        {name}
        {archived && <span className="badge archived-badge">Archived</span>}
      </span>

      <span className="listcard-stats">
        <StatBadge icon="🧺" value={itemCount} label="items" />
        <StatBadge icon="👥" value={memberCount} label="members" />

        {canArchive && !archived && (
          <button
            type="button"
            className="badge"
            onClick={(e) => {
              e.stopPropagation();
              onArchive();
            }}
            title="Archive list"
          >
            <span className="badge-icon" aria-hidden>📦</span>
            <span className="badge-label">archive</span>
          </button>
        )}

        {canDelete && (
          <button
            type="button"
            className="badge badge-delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete list"
          >
            <span className="badge-icon" aria-hidden>🗑️</span>
            <span className="badge-label">delete</span>
          </button>
        )}
      </span>
    </div>
  );
}

function Toolbar({ showArchived, onToggleArchived, onNew }) {
  return (
    <div className="lists-toolbar">
      <label className="switch-wrap">
        <input
          type="checkbox"
          checked={showArchived}
          onChange={() => onToggleArchived(v => !v)}
        />
        <span>Show archived</span>
      </label>
        <button className="btn primary" onClick={onNew}>
          ＋ New List
        </button>
      </div>
  );
}

export default function ShoppingListsPage() {
  const navigate = useNavigate();

  const [lists, setLists] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const loadLists = async () => {
    setStatus("loading");
    setError("");
    try {
      const data = await fetchLists();
      setLists(data);
      setStatus("ready");
    } catch (e) {
      setError(e.message || "Failed to load lists");
      setStatus("error");
    }
  };

  useEffect(() => {
    loadLists();
  }, []);

  const visible = useMemo(
    () => lists.filter((l) => (showArchived ? true : !l.archived)),
    [lists, showArchived]
  );

  const handleCreateList = async (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      const created = await createList(trimmed);
      setLists((prev) => [...prev, created]);
    } catch (e) {
      alert(e.message || "Failed to create list");
    }
  };

  const openCreateModal = () => setModalOpen(true);

  const openList = (list) => {
    navigate(`/shopping-list/${list.id}`);
  };

  const askDelete = async (list) => {
    if (list.ownerId !== CURRENT_USER_ID) {
      alert("Only the owner can delete this list.");
      return;
    }
    const ok = window.confirm(`Delete list "${list.name}"? This action cannot be undone.`);
    if (!ok) return;

    try {
      await deleteListApi(list.id);
      setLists(prev => prev.filter((l) => l.id !== list.id));
    } catch (e) {
      alert(e.message || "Failed to delete list");
    }
  };

  const archiveList = async (list) => {
    if (list.ownerId !== CURRENT_USER_ID) {
      alert("Only the owner can archive this list.");
      return;
    }

    try {
      const updated = await archiveListApi(list.id);
      setLists(prev =>
        prev.map((l) =>
          l.id === list.id ? { ...l, archived: updated.archived } : l
        )
      );
    } catch (e) {
      alert(e.message || "Failed to archive list");
    }
  };

  return (
    <div className="page">
      <header className="lists-header">
        <ShopifyWordmark />
        <div className="spacer" />
        <button
          className="btn ghost"
          onClick={() => {
            alert("Signed out successfully! (demo only)");
          }}
        >
          ⎋ Sign Out
        </button>
      </header>

      <Toolbar
        showArchived={showArchived}
        onToggleArchived={setShowArchived}
        onNew={openCreateModal}
      />

      {status === "loading" && (
        <div className="info-banner">Loading lists…</div>
      )}

      {status === "error" && (
        <div className="error-banner">
          {error || "Something went wrong while loading lists."}
        </div>
      )}

      <div className="listgrid">
        {visible.map((l) => {
          const isOwner = l.ownerId === CURRENT_USER_ID;
          return (
            <ListCard
              key={l.id}
              name={l.name}
              itemCount={l.items.length}
              memberCount={l.members.length}
              archived={l.archived}
              onClick={() => openList(l)}
              canDelete={isOwner}
              onDelete={() => askDelete(l)}
              canArchive={isOwner}
              onArchive={() => archiveList(l)}
            />
          );
        })}
      </div>

      {modalOpen && (
        <CreateListModal
          onClose={() => setModalOpen(false)}
          onCreate={handleCreateList}
        />
      )}
    </div>
  );
}