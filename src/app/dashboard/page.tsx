"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const roleColors: Record<string, { bg: string; text: string }> = {
  Developer: { bg: "rgba(99,102,241,0.15)", text: "#818cf8" },
  Designer: { bg: "rgba(236,72,153,0.15)", text: "#f472b6" },
  Marketing: { bg: "rgba(245,158,11,0.15)", text: "#fbbf24" },
  Other: { bg: "rgba(20,184,166,0.15)", text: "#2dd4bf" },
};

const AVATAR_COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6", "#14b8a6"];
function getInitials(name: string) {
  return name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
}
function getColor(id: string) {
  return AVATAR_COLORS[id?.charCodeAt(0) % AVATAR_COLORS.length] || "#6366f1";
}

type Profile = {
  id: string;
  full_name: string;
  specialization: string;
  email?: string;
  checkin_at: string | null;
  role: string;
  status?: string;
};

type DayStats = { day: string; count: number };

export default function DashboardPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [checkedIn, setCheckedIn] = useState<Profile[]>([]);
  const [weekStats, setWeekStats] = useState<DayStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/login"; return; }

    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", user.id).single();

    if (profile?.role !== "admin") {
      setUnauthorized(true);
      setLoading(false);
      return;
    }

    await Promise.all([loadProfiles(), loadWeekStats()]);
    setLoading(false);
  };

  const loadProfiles = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, specialization, checkin_at, role")
      .eq("role", "member")
      .order("full_name");

    const all = data || [];
    setProfiles(all);
    setCheckedIn(all.filter(p => p.checkin_at));
  };

  const loadWeekStats = async () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const stats: DayStats[] = days.map(day => ({ day, count: 0 }));

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data } = await supabase
      .from("checkin_history")
      .select("checked_in_at")
      .gte("checked_in_at", weekAgo.toISOString());

    if (data) {
      data.forEach(row => {
        const dayIdx = new Date(row.checked_in_at).getDay();
        stats[dayIdx].count++;
      });
    } else {
      // Fallback: use current checkins per day of week
      profiles.forEach(p => {
        if (p.checkin_at) {
          const dayIdx = new Date(p.checkin_at).getDay();
          stats[dayIdx].count++;
        }
      });
    }

    setWeekStats(stats);
  };

  const toggleBlock = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "blocked" ? "active" : "blocked";
    await supabase.from("profiles").update({ status: newStatus }).eq("id", id);
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  const filtered = profiles.filter(m =>
    m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  const maxCount = Math.max(...weekStats.map(d => d.count), 1);

  const STATS = [
    { label: "Here now", value: String(checkedIn.length), icon: "🟢" },
    { label: "Total members", value: String(profiles.length), icon: "👥" },
    { label: "Specializations", value: String(new Set(profiles.map(p => p.specialization)).size), icon: "🎯" },
    { label: "This week", value: String(weekStats.reduce((a, b) => a + b.count, 0) || checkedIn.length), icon: "📈" },
  ];

  if (loading) return (
    <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={s.gridBg} />
      <p style={{ color: "#475569", fontFamily: "'DM Sans', sans-serif" }}>Loading...</p>
    </div>
  );

  if (unauthorized) return (
    <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={s.gridBg} />
      <div style={{ textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <p style={{ color: "#f87171", fontSize: 16, marginBottom: 12 }}>Admin access only</p>
        <a href="/" style={{ color: "#a3e635", fontSize: 14, textDecoration: "none" }}>← Back to feed</a>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.gridBg} />

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
        <a href="/" style={s.headerLink}>View feed →</a>
      </header>

      <main style={s.main}>
        <div style={s.titleRow}>
          <h1 style={s.title}>Dashboard</h1>
          <p style={s.subtitle}>Today, {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>

        {/* Stats */}
        <div style={s.statsGrid}>
          {STATS.map((stat) => (
            <div key={stat.label} style={s.statCard}>
              <div style={s.statTop}>
                <span style={s.statIcon}>{stat.icon}</span>
              </div>
              <div style={s.statValue}>{stat.value}</div>
              <div style={s.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={s.chartCard}>
          <h2 style={s.sectionTitle}>Activity this week</h2>
          <div style={s.chart}>
            {weekStats.map((d) => (
              <div key={d.day} style={s.chartCol}>
                <span style={s.chartNum}>{d.count}</span>
                <div style={s.barWrap}>
                  <div style={{
                    ...s.bar,
                    height: `${(d.count / maxCount) * 100}%`,
                    background: d.count === maxCount && d.count > 0 ? "#a3e635" : "rgba(163,230,53,0.25)",
                  }} />
                </div>
                <span style={s.chartDay}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Members table */}
        <div style={s.tableCard}>
          <div style={s.tableHeader}>
            <h2 style={s.sectionTitle}>Members ({profiles.length})</h2>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search..." style={s.searchInput} />
          </div>

          {filtered.length === 0 ? (
            <p style={{ color: "#334155", fontSize: 14, padding: "20px 0" }}>
              {search ? "No members found" : "No members yet"}
            </p>
          ) : (
            <div style={s.table}>
              {filtered.map((m) => {
                const color = getColor(m.id);
                return (
                  <div key={m.id} style={{ ...s.row, opacity: m.status === "blocked" ? 0.5 : 1 }}>
                    <div style={s.rowLeft}>
                      <div style={{ ...s.avatar, background: color + "22", border: `2px solid ${color}44` }}>
                        <span style={{ ...s.avatarText, color }}>{getInitials(m.full_name)}</span>
                        {m.checkin_at && <div style={s.onlineDot} />}
                      </div>
                      <div>
                        <div style={s.memberName}>{m.full_name}</div>
                        <div style={s.memberSub}>{m.specialization || "Member"}</div>
                      </div>
                    </div>
                    <div style={s.rowRight}>
                      <span style={{
                        ...s.roleTag,
                        background: roleColors[m.specialization]?.bg || "rgba(100,116,139,0.15)",
                        color: roleColors[m.specialization]?.text || "#94a3b8",
                      }}>{m.specialization || "—"}</span>
                      <span style={{
                        ...s.statusTag,
                        background: m.checkin_at ? "rgba(163,230,53,0.1)" : "transparent",
                        color: m.checkin_at ? "#a3e635" : "#334155",
                        border: m.checkin_at ? "1px solid rgba(163,230,53,0.2)" : "1px solid #1e293b",
                      }}>
                        {m.checkin_at ? "● In" : "○ Out"}
                      </span>
                      <button onClick={() => toggleBlock(m.id, m.status || "active")} style={{
                        ...s.actionBtn,
                        color: m.status === "blocked" ? "#a3e635" : "#ef4444",
                      }}>
                        {m.status === "blocked" ? "Unblock" : "Block"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
  headerLink: { fontSize: 13, color: "#64748b", textDecoration: "none", fontWeight: 500 },
  main: { maxWidth: 1100, margin: "0 auto", padding: "40px 32px" },
  titleRow: { marginBottom: 32 },
  title: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 32, color: "#f1f5f9", letterSpacing: "-0.5px", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#475569" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 },
  statCard: {
    background: "rgba(15,23,42,0.9)", border: "1px solid #1e293b",
    borderRadius: 16, padding: "20px 24px", animation: "fadeUp 0.4s ease both",
  },
  statTop: { marginBottom: 12 },
  statIcon: { fontSize: 20 },
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
    borderRadius: 8, padding: "8px 14px", fontSize: 13, color: "#f1f5f9", width: 200,
  },
  table: { display: "flex", flexDirection: "column", gap: 4 },
  row: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.02)",
  },
  rowLeft: { display: "flex", alignItems: "center", gap: 12 },
  rowRight: { display: "flex", alignItems: "center", gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", flexShrink: 0 },
  avatarText: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 12 },
  onlineDot: { position: "absolute", bottom: 1, right: 1, width: 8, height: 8, borderRadius: "50%", background: "#a3e635", border: "2px solid #080f1a" },
  memberName: { fontSize: 14, fontWeight: 600, color: "#e2e8f0", fontFamily: "'Syne', sans-serif" },
  memberSub: { fontSize: 12, color: "#475569" },
  roleTag: { padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600 },
  statusTag: { padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600 },
  actionBtn: { background: "transparent", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", padding: "4px 8px" },
};
