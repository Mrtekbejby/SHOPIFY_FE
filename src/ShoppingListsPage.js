import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreateListModal from "./CreateListModal";
import {
  fetchLists,
  createList,
  archiveListApi,
  deleteListApi
} from "./api/listApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const CURRENT_USER_ID = "u1";
const BAR_COLOR = "#3b82f6";

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
  onArchive,
  t
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
        {archived && <span className="badge archived-badge">{t("archived")}</span>}
      </span>

      <span className="listcard-stats">
        <StatBadge icon="🧺" value={itemCount} label={t("items")} />
        <StatBadge icon="👥" value={memberCount} label={t("members")} />

        {canArchive && !archived && (
          <button
            type="button"
            className="badge"
            onClick={(e) => {
              e.stopPropagation();
              onArchive();
            }}
            title={t("archive")}
          >
            <span className="badge-icon" aria-hidden>📦</span>
            <span className="badge-label">{t("archive")}</span>
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
            title={t("delete")}
          >
            <span className="badge-icon" aria-hidden>🗑️</span>
            <span className="badge-label">{t("delete")}</span>
          </button>
        )}
      </span>
    </div>
  );
}

function Toolbar({ showArchived, onToggleArchived, onNew, t }) {
  return (
    <div className="lists-toolbar">
      <label className="switch-wrap">
        <input
          type="checkbox"
          checked={showArchived}
          onChange={() => onToggleArchived(v => !v)}
        />
        <span>{t("showArchived")}</span>
      </label>
      <button className="btn primary" onClick={onNew}>
        ＋ {t("newList")}
      </button>
    </div>
  );
}

export default function ShoppingListsPage({ theme, onToggleTheme, lang, setLang, t }) {
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
      setError(e.message || t("loadError"));
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

  const chartData = useMemo(() => {
    return visible.map((l) => ({
      name: l.name,
      items: l.items.length
    }));
  }, [visible]);

  const handleCreateList = async (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      const created = await createList(trimmed);
      setLists((prev) => [...prev, created]);
    } catch {
      alert(t("failedCreate"));
    }
  };

  const openList = (list) => {
    navigate(`/shopping-list/${list.id}`);
  };

  const askDelete = async (list) => {
    if (list.ownerId !== CURRENT_USER_ID) {
      alert(t("onlyOwnerDelete"));
      return;
    }
    const ok = window.confirm(t("deleteConfirm", { name: list.name }));
    if (!ok) return;

    try {
      await deleteListApi(list.id);
      setLists(prev => prev.filter((l) => l.id !== list.id));
    } catch {
      alert(t("failedDelete"));
    }
  };

  const archiveList = async (list) => {
    if (list.ownerId !== CURRENT_USER_ID) {
      alert(t("onlyOwnerArchive"));
      return;
    }

    try {
      const updated = await archiveListApi(list.id);
      setLists(prev =>
        prev.map((l) =>
          l.id === list.id ? { ...l, archived: updated.archived } : l
        )
      );
    } catch {
      alert(t("failedArchive"));
    }
  };

  return (
    <div className="page">
      <header className="lists-header">
        <ShopifyWordmark />
        <div className="header-actions">
          <button
            className="badge badge-theme"
            onClick={onToggleTheme}
            title="Toggle theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          <button
            className="badge"
            onClick={() => setLang(lang === "en" ? "cs" : "en")}
            title="Toggle language"
          >
            {lang === "en" ? "🇨🇿 CZ" : "🇬🇧 EN"}
          </button>

          <button
            className="badge badge-signout"
            onClick={() => alert("Signed out successfully! (demo only)")}
            title={t("signOut")}
          >
            ⎋ {t("signOut")}
          </button>
        </div>
      </header>

      <Toolbar
        showArchived={showArchived}
        onToggleArchived={setShowArchived}
        onNew={() => setModalOpen(true)}
        t={t}
      />

      {status === "loading" && (
        <div className="info-banner">{t("loadingLists")}</div>
      )}

      {status === "error" && (
        <div className="error-banner">
          {error || t("loadError")}
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
              t={t}
            />
          );
        })}
      </div>

      {chartData.length > 0 && (
        <section className="card" style={{ marginTop: 24 }}>
          <div className="card-header">
            <h3 className="card-title">{t("listsOverview")}</h3>
          </div>

          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip cursor={false} wrapperStyle={{ outline: "none" }} />
                <Bar dataKey="items" fill={BAR_COLOR} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {modalOpen && (
        <CreateListModal
          onClose={() => setModalOpen(false)}
          onCreate={handleCreateList}
        />
      )}
    </div>
  );
}