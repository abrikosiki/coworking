"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const FILTERS = ["All", "Developer", "Designer", "Marketing", "Other"];

const roleColors: Record<string, { bg: string; text: string }> = {
  Developer: { bg: "rgba(99,102,241,0.15)", text: "#818cf8" },
  Designer: { bg: "rgba(236,72,153,0.15)", text: "#f472b6" },
  Marketing: { bg: "rgba(245,158,11,0.15)", text: "#fbbf24" },
  Other: { bg: "rgba(20,184,166,0.15)", text: "#2dd4bf" },
};

const AVATAR_COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6", "#14b8a6", "#f97316", "#3b82f6"];

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function getColor(id: string) {
  const idx = id.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

type Profile = {
  id: string;
  name: string;
  specialization: string;
  avatar_url: string | null;
  checkin_at: string | null;
};

export default function HomePage() {
  const [filter, setFilter] = useState("All");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  // Load current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user);
    });
  }, []);

  // Load profiles who are checked in
  useEffect(() => {
    loadProfiles();

    // Realtime subscription
    const channel = supabase
      .channel("profiles-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        loadProfiles();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Check if current user is checked in
  useEffect(() => {
    if (!currentUser) return;
    const me = profiles.find(p => p.id === currentUser.id);
    setCheckedIn(!!me?.checkin_at);
  }, [profiles, currentUser]);

  const loadProfiles = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, name, specialization, avatar_url, checkin_at")
      .not("checkin_at", "is", null)
      .order("checkin_at", { ascending: false });

    setProfiles(data || []);
    setLoading(false);
  };

  const handleCheckin = async () => {
    if (!currentUser) {
      window.location.href = "/login";
      return;
    }

    setCheckingIn(true);

    if (checkedIn) {
      await supabase.from("profiles").update({ checkin_at: null }).eq("id", currentUser.id);
    } else {
      await supabase.from("profiles").update({ checkin_at: new Date().toISOString() }).eq("id", currentUser.id);
    }

    await loadProfiles();
    setCheckingIn(false);
  };

  const getTimeSince = (checkinAt: string) => {
    const diff = Date.now() - new Date(checkinAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h`;
  };

  const filtered = filter === "All"
    ? profiles
    : profiles.filter(p => p.specialization === filter);

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
            <span style={s.counterText}>{profiles.length} here now</span>
          </div>
          {currentUser && (
            <a href="/profile" style={s.profileLink}>My profile</a>
          )}
          <button onClick={handleCheckin} disabled={checkingIn} style={{
            ...s.checkinBtn,
            background: checkedIn ? "rgba(239,68,68,0.15)" : "#a3e635",
            color: checkedIn ? "#f87171" : "#0f172a",
            border: checkedIn ? "1.5px solid rgba(239,68,68,0.3)" : "none",
          }}>
            {checkingIn ? "..." : checkedIn ? "← Check out" : "Check in →"}
          </button>
        </div>
      </header>

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
        {loading ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>⏳</div>
            <p style={s.emptyText}>Loading...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>👀</div>
            <p style={s.emptyText}>No one here yet</p>
            <p style={s.emptySubtext}>Be the first to check in!</p>
          </div>
        ) : (
          <div style={s.grid2}>
            {filtered.map((profile, i) => {
              const color = getColor(profile.id);
              return (
                <a key={profile.id} href={`/users/${profile.id}`} style={{ ...s.card, animationDelay: `${i * 0.06}s`, textDecoration: "none" }}>
                  <div style={s.cardTop}>
                    <div style={{ ...s.avatar, background: color + "22", border: `2px solid ${color}44`, overflow: "hidden" }}>
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ ...s.avatarText, color }}>{getInitials(profile.name)}</span>
                      )}
                      <div style={s.onlineDot} />
                    </div>
                    <div style={s.since}>{profile.checkin_at ? getTimeSince(profile.checkin_at) : ""}</div>
                  </div>
                  <div style={s.cardInfo}>
                    <div style={s.name}>{profile.name}</div>
                    <div style={{
                      ...s.role,
                      background: roleColors[profile.specialization]?.bg || "rgba(100,116,139,0.15)",
                      color: roleColors[profile.specialization]?.text || "#94a3b8",
                    }}>
                      {profile.specialization || "Member"}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        a:hover > div { border-color: rgba(163,230,53,0.2) !important; }
      `}</style>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#080f1a", fontFamily: "'DM Sans', sans-serif", position: "relative" },
  grid: {
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
  headerRight: { display: "flex", alignItems: "center", gap: 16 },
  counter: { display: "flex", alignItems: "center", gap: 8 },
  counterDot: { width: 8, height: 8, borderRadius: "50%", background: "#a3e635", animation: "pulse 2s infinite", boxShadow: "0 0 8px #a3e635" },
  counterText: { fontSize: 13, color: "#94a3b8", fontWeight: 500 },
  profileLink: { fontSize: 13, color: "#64748b", textDecoration: "none", fontWeight: 500 },
  checkinBtn: {
    padding: "9px 18px", borderRadius: 10,
    fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13,
    cursor: "pointer", transition: "all 0.2s",
  },
  main: { maxWidth: 1100, margin: "0 auto", padding: "40px 32px" },
  titleRow: { marginBottom: 28 },
  title: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 32, color: "#f1f5f9", letterSpacing: "-0.5px", marginBottom: 6 },
  subtitle: { fontSize: 15, color: "#475569" },
  filters: { display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" },
  filterBtn: { padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s" },
  grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 },
  card: {
    background: "rgba(15,23,42,0.8)", border: "1px solid #1e293b",
    borderRadius: 16, padding: "20px", cursor: "pointer",
    transition: "all 0.2s", animation: "fadeUp 0.4s ease both", display: "block",
  },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  avatar: { width: 52, height: 52, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" },
  avatarText: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15 },
  onlineDot: {
    position: "absolute", bottom: 2, right: 2, width: 10, height: 10, borderRadius: "50%",
    background: "#a3e635", border: "2px solid #080f1a", boxShadow: "0 0 6px #a3e635",
  },
  since: { fontSize: 11, color: "#334155", fontWeight: 500 },
  cardInfo: { display: "flex", flexDirection: "column", gap: 8 },
  name: { fontSize: 15, fontWeight: 600, color: "#e2e8f0", fontFamily: "'Syne', sans-serif" },
  role: { display: "inline-block", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, width: "fit-content" },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20, color: "#334155" },
  emptySubtext: { fontSize: 14, color: "#1e293b" },
};
