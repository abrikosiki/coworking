"use client";
import { useState } from "react";

const STATS = [
  { label: "Here now", value: "6", icon: "🟢", trend: "+2" },
  { label: "Today", value: "24", icon: "📅", trend: "+8" },
  { label: "This week", value: "142", icon: "📈", trend: "+12%" },
  { label: "Members", value: "89", icon: "👥", trend: "+3" },
];

const WEEK_DATA = [
  { day: "Mon", count: 18 },
  { day: "Tue", count: 24 },
  { day: "Wed", count: 31 },
  { day: "Thu", count: 27 },
  { day: "Fri", count: 35 },
  { day: "Sat", count: 12 },
  { day: "Sun", count: 8 },
];

const MEMBERS = [
  { id: 1, name: "Alex Chen", role: "Developer", email: "alex@cowork.com", avatar: "AC", color: "#6366f1", status: "active", checkedIn: true },
  { id: 2, name: "Maria Santos", role: "Designer", email: "maria@cowork.com", avatar: "MS", color: "#ec4899", status: "active", checkedIn: true },
  { id: 3, name: "James Park", role: "Marketing", email: "james@cowork.com", avatar: "JP", color: "#f59e0b", status: "active", checkedIn: false },
  { id: 4, name: "Lena Müller", role: "Developer", email: "lena@cowork.com", avatar: "LM", color: "#10b981", status: "active", checkedIn: true },
  { id: 5, name: "Omar Hassan", role: "Designer", email: "omar@cowork.com", avatar: "OH", color: "#8b5cf6", status: "blocked", checkedIn: false },
  { id: 6, name: "Yuki Tanaka", role: "Other", email: "yuki@cowork.com", avatar: "YT", color: "#14b8a6", status: "active", checkedIn: true },
];

const roleColors: Record<string, { bg: string; text: string }> = {
  Developer: { bg: "rgba(99,102,241,0.15)", text: "#818cf8" },
  Designer: { bg: "rgba(236,72,153,0.15)", text: "#f472b6" },
  Marketing: { bg: "rgba(245,158,11,0.15)", text: "#fbbf24" },
  Other: { bg: "rgba(20,184,166,0.15)", text: "#2dd4bf" },
};

const maxCount = Math.max(...WEEK_DATA.map(d => d.count));

export default function DashboardPage() {
  const [members, setMembers] = useState(MEMBERS);
  const [search, setSearch] = useState("");

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase())
  );

  const toggleBlock = (id: number) => {
    setMembers(prev => prev.map(m =>
      m.id === id ? { ...m, status: m.status === "blocked" ? "active" : "blocked" } : m
    ));
  };

  return (
    <div style={s.page}>
      <div style={s.gridBg} />

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
          <span style={s.adminBadge}>Admin</span>
        </div>
        <div style={s.headerRight}>
          <a href="/" style={s.headerLink}>View feed →</a>
        </div>
      </header>

      <main style={s.main}>
        <div style={s.titleRow}>
          <h1 style={s.title}>Dashboard</h1>
          <p style={s.subtitle}>WorkHub Moscow · Today, {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>

        {/* Stats */}
        <div style={s.statsGrid}>
          {STATS.map((stat) => (
            <div key={stat.label} style={s.statCard}>
              <div style={s.statTop}>
                <span style={s.statIcon}>{stat.icon}</span>
                <span style={s.statTrend}>{stat.trend}</span>
              </div>
              <div style={s.statValue}>{stat.value}</div>
              <div style={s.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={s.chartCard}>
          <h2 style={s.sectionTitle}>Visits this week</h2>
          <div style={s.chart}>
            {WEEK_DATA.map((d) => (
              <div key={d.day} style={s.chartCol}>
                <span style={s.chartNum}>{d.count}</span>
                <div style={s.barWrap}>
                  <div style={{
                    ...s.bar,
                    height: `${(d.count / maxCount) * 100}%`,
                    background: d.day === "Fri" ? "#a3e635" : "rgba(163,230,53,0.25)",
                  }} />
                </div>
                <span style={s.chartDay}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Members */}
        <div style={s.tableCard}>
          <div style={s.tableHeader}>
            <h2 style={s.sectionTitle}>Members</h2>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              style={s.searchInput}
            />
          </div>

          <div style={s.table}>
            {filtered.map((m) => (
              <div key={m.id} style={{ ...s.row, opacity: m.status === "blocked" ? 0.5 : 1 }}>
                <div style={s.rowLeft}>
                  <div style={{ ...s.avatar, background: m.color + "22", border: `2px solid ${m.color}44` }}>
                    <span style={{ ...s.avatarText, color: m.color }}>{m.avatar}</span>
                    {m.checkedIn && <div style={s.onlineDot} />}
                  </div>
                  <div>
                    <div style={s.memberName}>{m.name}</div>
                    <div style={s.memberEmail}>{m.email}</div>
                  </div>
                </div>
                <div style={s.rowRight}>
                  <span style={{
                    ...s.roleTag,
                    background: roleColors[m.role]?.bg,
                    color: roleColors[m.role]?.text,
                  }}>{m.role}</span>
                  <span style={{
                    ...s.statusTag,
                    background: m.checkedIn ? "rgba(163,230,53,0.1)" : "transparent",
                    color: m.checkedIn ? "#a3e635" : "#334155",
                    border: m.checkedIn ? "1px solid rgba(163,230,53,0.2)" : "1px solid #1e293b",
                  }}>
                    {m.checkedIn ? "● In" : "○ Out"}
                  </span>
                  <button onClick={() => toggleBlock(m.id)} style={{
                    ...s.actionBtn,
                    color: m.status === "blocked" ? "#a3e635" : "#ef4444",
                  }}>
                    {m.status === "blocked" ? "Unblock" : "Block"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { outline: none; border-color: #a3e635 !important; }
        input::placeholder { color: #334155; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#080f1a", fontFamily: "'DM Sans', sans-serif", position: "relative" },
  gridBg: {
    position: "fixed", inset: 0,
    backgroundImage: "linear-gradient(rgba(163,230,53,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(163,230,53,0.03) 1px, transparent 1px)",
    backgroundSize: "48px 48px", pointerEvents: "none",
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "20px 32px", borderBottom: "1px solid #0f1f35",
    background: "rgba(8,15,26,0.8)", backdropFilter: "blur(20px)",
    position: "sticky", top: 0, zIndex: 10,
  },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: {
    width: 32, height: 32, borderRadius: 8,
    background: "linear-gradient(135deg, #a3e635, #65a30d)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  logoText: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#f1f5f9" },
  adminBadge: {
    fontSize: 10, fontWeight: 700, color: "#a3e635",
    background: "rgba(163,230,53,0.1)", border: "1px solid rgba(163,230,53,0.2)",
    padding: "2px 8px", borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.05em",
  },
  headerRight: { display: "flex", gap: 16, alignItems: "center" },
  headerLink: { fontSize: 13, color: "#64748b", textDecoration: "none", fontWeight: 500 },
  main: { maxWidth: 1100, margin: "0 auto", padding: "40px 32px" },
  titleRow: { marginBottom: 32 },
  title: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 32, color: "#f1f5f9", letterSpacing: "-0.5px", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#475569" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 },
  statCard: {
    background: "rgba(15,23,42,0.9)", border: "1px solid #1e293b",
    borderRadius: 16, padding: "20px 24px",
    animation: "fadeUp 0.4s ease both",
  },
  statTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  statIcon: { fontSize: 20 },
  statTrend: { fontSize: 11, color: "#a3e635", fontWeight: 700, background: "rgba(163,230,53,0.1)", padding: "2px 8px", borderRadius: 6 },
  statValue: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 32, color: "#f1f5f9", marginBottom: 4 },
  statLabel: { fontSize: 12, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" },
  chartCard: {
    background: "rgba(15,23,42,0.9)", border: "1px solid #1e293b",
    borderRadius: 16, padding: "24px 28px", marginBottom: 24,
  },
  sectionTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: "#e2e8f0", marginBottom: 20 },
  chart: { display: "flex", gap: 8, alignItems: "flex-end", height: 120 },
  chartCol: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" },
  chartNum: { fontSize: 10, color: "#334155", fontWeight: 600 },
  barWrap: { flex: 1, width: "100%", display: "flex", alignItems: "flex-end" },
  bar: { width: "100%", borderRadius: "4px 4px 0 0", transition: "height 0.3s ease", minHeight: 4 },
  chartDay: { fontSize: 11, color: "#475569", fontWeight: 500 },
  tableCard: {
    background: "rgba(15,23,42,0.9)", border: "1px solid #1e293b",
    borderRadius: 16, padding: "24px 28px",
  },
  tableHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  searchInput: {
    background: "#0f172a", border: "1.5px solid #1e293b",
    borderRadius: 8, padding: "8px 14px",
    fontSize: 13, color: "#f1f5f9", width: 200,
  },
  table: { display: "flex", flexDirection: "column", gap: 4 },
  row: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "12px 16px", borderRadius: 10,
    transition: "background 0.15s",
    background: "rgba(255,255,255,0.02)",
  },
  rowLeft: { display: "flex", alignItems: "center", gap: 12 },
  rowRight: { display: "flex", alignItems: "center", gap: 10 },
  avatar: {
    width: 40, height: 40, borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
    position: "relative", flexShrink: 0,
  },
  avatarText: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 12 },
  onlineDot: {
    position: "absolute", bottom: 1, right: 1,
    width: 8, height: 8, borderRadius: "50%",
    background: "#a3e635", border: "2px solid #080f1a",
  },
  memberName: { fontSize: 14, fontWeight: 600, color: "#e2e8f0", fontFamily: "'Syne', sans-serif" },
  memberEmail: { fontSize: 12, color: "#475569" },
  roleTag: { padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600 },
  statusTag: { padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600 },
  actionBtn: {
    background: "transparent", border: "none",
    fontSize: 12, fontWeight: 600, cursor: "pointer",
    padding: "4px 8px",
  },
};
