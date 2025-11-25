import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateListModal from "./CreateListModal";

const CURRENT_USER_ID = "u1";

const SEED = [
  {
    id: "l1",
    name: "Weekend shopping",
    archived: true,
    items: [],
    members: ["lucas@gmail.com", "marie@gmail.com"],
    ownerId: "u1"
  },
  {
    id: "l2",
    name: "Birthday party supplies",
    archived: false,
    items: [],
    members: ["simon@gmail.com", "anna@gmail.com", "paul@gmail.com"],
    ownerId: "u1"
  },
  {
    id: "l3",
    name: "Weekly groceries",
    archived: false,
    items: new Array(9).fill(null),
    members: ["sofia@gmail.com", "emma@gmail.com", "john@gmail.com", "adam@gmail.com"],
    ownerId: "u2"
  },
  {
    id: "l4",
    name: "Office snacks",
    archived: false,
    items: new Array(6).fill(null),
    members: ["alex@gmail.com","misa@gmail.com"],
    ownerId: "u2"
  },
  {
    id: "l5",
    name: "Camping trip food list",
    archived: false,
    items: new Array(3).fill(null),
    members: ["peter@gmail.com", "nina@gmail.com", "maria@gmail.com", "tom@gmail.com", "sofia@gmail.com"],
    ownerId: "u1"
  }
];

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
  const archiveLabel = archived ? "unarchive" : "archive";

  return (
    <div
      className="listcard"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      style={{ cursor: "pointer" }}
    >
      <span className="listcard-name">{name}</span>

      <span className="listcard-stats">
        <StatBadge icon="🧺" value={itemCount} label="items" />
        <StatBadge icon="👥" value={memberCount} label="members" />

        {canArchive && (
          <button
            type="button"
            className="badge"
            onClick={(e) => {
              e.stopPropagation();
              onArchive();
            }}
            title={archiveLabel}
          >
            <span className="badge-icon" aria-hidden>
              📥
            </span>
            <span className="badge-label">{archiveLabel}</span>
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
            <span className="badge-icon" aria-hidden>
              🗑️
            </span>
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

      <button className="btn primary" onClick={onNew}>＋ New List</button>
    </div>
  );
}

export default function ShoppingListsPage() {
  const navigate = useNavigate();

  const [lists, setLists] = useState(SEED);
  const [showArchived, setShowArchived] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const visible = useMemo(
    () => lists.filter(l => (showArchived ? true : !l.archived)),
    [lists, showArchived]
  );

  const addList = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setLists(prev => [
      ...prev,
      {
        id: "l" + Date.now(),
        name: trimmed,
        archived: false,
        items: [],
        members: [],
        ownerId: CURRENT_USER_ID
      }
    ]);
  };

  const openCreateModal = () => setModalOpen(true);

  const openList = (list) => {
    navigate(`/shopping-list/${list.id}`, { state: { list } });
  };

  const askDelete = (list) => {
    if (list.ownerId !== CURRENT_USER_ID) {
      alert("Only the owner can delete this list.");
      return;
    }
    const ok = window.confirm(`Delete list "${list.name}"? This action cannot be undone.`);
    if (!ok) return;
    setLists(prev => prev.filter(l => l.id !== list.id));
  };

  const toggleArchive = (list) => {
    if (list.ownerId !== CURRENT_USER_ID) {
      alert("Only the owner can archive this list.");
      return;
    }
    setLists(prev =>
      prev.map(l =>
        l.id === list.id ? { ...l, archived: !l.archived } : l
      )
    );
  };

  return (
    <div className="page">
      <header className="lists-header">
        <ShopifyWordmark />
        <div className="spacer" />
        <button
          className="btn ghost"
          onClick={() => { alert("Signed out successfully! (demo only)"); }}
        >
          ⎋ Sign Out
        </button>
      </header>

      <Toolbar
        showArchived={showArchived}
        onToggleArchived={setShowArchived}
        onNew={openCreateModal}
      />

      <div className="listgrid">
        {visible.map(l => {
          const isOwner = l.ownerId === CURRENT_USER_ID;
          const canDelete = isOwner;
          const canArchive = isOwner;

          return (
            <ListCard
              key={l.id}
              name={l.name}
              itemCount={l.items.length}
              memberCount={l.members.length}
              archived={l.archived}
              onClick={() => openList(l)}
              canDelete={canDelete}
              onDelete={() => askDelete(l)}
              canArchive={canArchive}
              onArchive={() => toggleArchive(l)}
            />
          );
        })}
      </div>

      {modalOpen && (
        <CreateListModal
          onClose={() => setModalOpen(false)}
          onCreate={addList}
        />
      )}
    </div>
  );
}