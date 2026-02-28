"use client";
import { useState } from "react";

const MOCK_USERS = [
  { id: 1, name: "Alex Chen", role: "Developer", avatar: "AC", color: "#6366f1", checkedIn: true, since: "2h" },
  { id: 2, name: "Maria Santos", role: "Designer", avatar: "MS", color: "#ec4899", checkedIn: true, since: "45m" },
  { id: 3, name: "James Park", role: "Marketing", avatar: "JP", color: "#f59e0b", checkedIn: true, since: "3h" },
  { id: 4, name: "Lena Müller", role: "Developer", avatar: "LM", color: "#10b981", checkedIn: true, since: "1h" },
  { id: 5, name: "Omar Hassan", role: "Designer", avatar: "OH", color: "#8b5cf6", checkedIn: true, since: "30m" },
  { id: 6, name: "Yuki Tanaka", role: "Other", avatar: "YT", color: "#14b8a6", checkedIn: true, since: "4h" },
];

const FILTERS = ["All", "Developer", "Designer", "Marketing", "Other"];

const roleColors = {
  Developer: { bg: "rgba(99,102,241,0.15)", text: "#818cf8" },
  Designer: { bg: "rgba(236,72,153,0.15)", text: "#f472b6" },
  Marketing: { bg: "rgba(245,158,11,0.15)", text: "#fbbf24" },
  Other: { bg: "rgba(20,184,166,0.15)", text: "#2dd4bf" },
};

export default function HomePage() {
  const [filter, setFilter] = useState("All");
  const [checkedIn, setCheckedIn] = useState(false);
  const [users, setUsers] = useState(MOCK_USERS);

  const filtered = filter === "All" ? users : users.filter(u => u.role === filter);

  const handleCheckin = () => {
    setCheckedIn(!checkedIn);
    if (!checkedIn) {
      setUsers(prev => [...prev, {
        id: 99, name: "You", role: "Developer", avatar: "ME",
        color: "#a3e635", checkedIn: true, since: "now"
      }]);
    } else {
      setUsers(prev => prev.filter(u => u.id !== 99));
    }
  };

  return (
    <div style={s.page}>
      <div style={s.grid} />

      {/* Header */}
      <header style={s.header}>
        <div style={s.logo}>
          <div style={s.logoIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          </div>
          <span style={s.logoText}>CoWork</span>
        </div>

        <div style={s.headerRight}>
          <div style={s.counter}>
            <span style={s.counterDot} />
            <span style={s.counterText}>{users.length} here now</span>
          </div>
          <button onClick={handleCheckin} style={{ ...s.checkinBtn, background: checkedIn ? "rgba(239,68,68,0.15)" : "#a3e635", color: checkedIn ? "#f87171" : "#0f172a", border: checkedIn ? "1.5px solid rgba(239,68,68,0.3)" : "none" }}>
            {checkedIn ? "← Check out" : "Check in →"}
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={s.main}>
        <div style={s.titleRow}>
          <h1 style={s.title}>Who's here today</h1>
          <p style={s.subtitle}>Connect with people around you</p>
        </div>

        {/* Filters */}
        <div style={s.filters}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              ...s.filterBtn,
              background: filter === f ? "#a3e635" : "rgba(255,255,255,0.04)",
              color: filter === f ? "#0f172a" : "#64748b",
              border: filter === f ? "none" : "1.5px solid #1e293b",
            }}>
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>👀</div>
            <p style={s.emptyText}>No one here yet</p>
            <p style={s.emptySubtext}>Be the first to check in!</p>
          </div>
        ) : (
          <div style={s.grid2}>
            {filtered.map((user, i) => (
              <div key={user.id} style={{ ...s.card, animationDelay: `${i * 0.06}s` }}>
                <div style={s.cardTop}>
                  <div style={{ ...s.avatar, background: user.color + "22", border: `2px solid ${user.color}44` }}>
                    <span style={{ ...s.avatarText, color: user.color }}>{user.avatar}</span>
                    <div style={s.onlineDot} />
                  </div>
                  <div style={s.since}>{user.since}</div>
                </div>
                <div style={s.cardInfo}>
                  <div style={s.name}>{user.name}</div>
                  <div style={{
                    ...s.role,
                    background: roleColors[user.role]?.bg || "rgba(100,116,139,0.15)",
                    color: roleColors[user.role]?.text || "#94a3b8",
                  }}>
                    {user.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "#080f1a",
    fontFamily: "'DM Sans', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  grid: {
    position: "fixed", inset: 0,
    backgroundImage: "linear-gradient(rgba(163,230,53,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(163,230,53,0.03) 1px, transparent 1px)",
    backgroundSize: "48px 48px",
    pointerEvents: "none",
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "20px 32px",
    borderBottom: "1px solid #0f1f35",
    background: "rgba(8,15,26,0.8)",
    backdropFilter: "blur(20px)",
    position: "sticky", top: 0, zIndex: 10,
  },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: {
    width: 32, height: 32, borderRadius: 8,
    background: "linear-gradient(135deg, #a3e635, #65a30d)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  logoText: {
    fontFamily: "'Syne', sans-serif", fontWeight: 800,
    fontSize: 18, color: "#f1f5f9",
  },
  headerRight: { display: "flex", alignItems: "center", gap: 16 },
  counter: { display: "flex", alignItems: "center", gap: 8 },
  counterDot: {
    width: 8, height: 8, borderRadius: "50%",
    background: "#a3e635",
    animation: "pulse 2s infinite",
    boxShadow: "0 0 8px #a3e635",
  },
  counterText: { fontSize: 13, color: "#94a3b8", fontWeight: 500 },
  checkinBtn: {
    padding: "9px 18px", borderRadius: 10,
    fontFamily: "'Syne', sans-serif", fontWeight: 700,
    fontSize: 13, cursor: "pointer",
    transition: "all 0.2s",
  },
  main: {
    maxWidth: 1100, margin: "0 auto",
    padding: "40px 32px",
  },
  titleRow: { marginBottom: 28 },
  title: {
    fontFamily: "'Syne', sans-serif", fontWeight: 800,
    fontSize: 32, color: "#f1f5f9", letterSpacing: "-0.5px",
    marginBottom: 6,
  },
  subtitle: { fontSize: 15, color: "#475569" },
  filters: { display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" },
  filterBtn: {
    padding: "7px 16px", borderRadius: 8,
    fontSize: 13, fontWeight: 500, cursor: "pointer",
    transition: "all 0.2s",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 16,
  },
  card: {
    background: "rgba(15,23,42,0.8)",
    border: "1px solid #1e293b",
    borderRadius: 16, padding: "20px",
    cursor: "pointer",
    transition: "all 0.2s",
    animation: "fadeUp 0.4s ease both",
  },
  cardTop: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 14,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 14,
    display: "flex", alignItems: "center", justifyContent: "center",
    position: "relative",
  },
  avatarText: {
    fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15,
  },
  onlineDot: {
    position: "absolute", bottom: 2, right: 2,
    width: 10, height: 10, borderRadius: "50%",
    background: "#a3e635",
    border: "2px solid #080f1a",
    boxShadow: "0 0 6px #a3e635",
  },
  since: { fontSize: 11, color: "#334155", fontWeight: 500 },
  cardInfo: { display: "flex", flexDirection: "column", gap: 8 },
  name: {
    fontSize: 15, fontWeight: 600, color: "#e2e8f0",
    fontFamily: "'Syne', sans-serif",
  },
  role: {
    display: "inline-block",
    padding: "3px 10px", borderRadius: 6,
    fontSize: 11, fontWeight: 600,
    width: "fit-content",
  },
  empty: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", padding: "80px 20px", gap: 12,
  },
  emptyIcon: { fontSize: 48 },
  emptyText: {
    fontFamily: "'Syne', sans-serif", fontWeight: 700,
    fontSize: 20, color: "#334155",
  },
  emptySubtext: { fontSize: 14, color: "#1e293b" },
};
