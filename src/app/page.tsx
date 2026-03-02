"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const FILTERS = ["All", "Developer", "Designer", "Marketing", "Other"];

const THEMES = [
  { id: "original", name: "Original", color: "#a3e635" },
  { id: "lime", name: "Lime", color: "#BEF264" },
  { id: "midnight", name: "Midnight", color: "#d946ef" },
  { id: "forest", name: "Forest", color: "#34d399" },
  { id: "swiss", name: "Swiss", color: "#2563eb" },
  { id: "paper", name: "Paper", color: "#ea580c" },
];

const AVATAR_COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6", "#14b8a6", "#f97316", "#3b82f6"];

const roleBadgeClasses: Record<string, string> = {
  Developer: "bg-blue-500/10 border-blue-500/20 text-blue-400 group-hover:border-blue-400",
  Designer: "bg-pink-500/10 border-pink-500/20 text-pink-400 group-hover:border-pink-400",
  Marketing: "bg-purple-500/10 border-purple-500/20 text-purple-400 group-hover:border-purple-400",
  Other: "bg-orange-500/10 border-orange-500/20 text-orange-400 group-hover:border-orange-400",
};

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
  const [userRole, setUserRole] = useState<string | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("original");
  const [themeOpen, setThemeOpen] = useState(false);

  const applyTheme = (themeName: string) => {
    if (themeName === "original") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", themeName);
    }
    localStorage.setItem("cowork-theme", themeName);
    setCurrentTheme(themeName);
    setThemeOpen(false);
  };

  // Restore saved theme
  useEffect(() => {
    const saved = localStorage.getItem("cowork-theme") || "original";
    setCurrentTheme(saved);
    if (saved !== "original") {
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = () => setThemeOpen(false);
    if (themeOpen) {
      document.addEventListener("click", handler);
      return () => document.removeEventListener("click", handler);
    }
  }, [themeOpen]);

  // Load current user
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setCurrentUser(data.user);
      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        setUserRole(profile?.role || null);

        if (profile?.role === "admin") {
          window.location.href = "/dashboard";
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false); // Stop loading if not logged in
      }
    });
  }, []);

  const loadProfiles = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, name, specialization, avatar_url, checkin_at")
      .not("checkin_at", "is", null)
      .order("checkin_at", { ascending: false });

    setProfiles(data || []);
    setLoading(false);
  };

  // Load profiles who are checked in
  useEffect(() => {
    if (!currentUser || userRole === "admin") return;

    loadProfiles();

    const channel = supabase
      .channel("profiles-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        loadProfiles();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUser, userRole]);

  // Check if current user is checked in
  useEffect(() => {
    if (!currentUser) return;
    const me = profiles.find(p => p.id === currentUser.id);
    setCheckedIn(!!me?.checkin_at);
  }, [profiles, currentUser]);


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
    const diff = Date.now() - new Date(checkinAt).getTime(); // eslint-disable-line react-hooks/purity
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h`;
  };

  const filtered = filter === "All"
    ? profiles
    : profiles.filter(p => p.specialization === filter);

  if (loading) {
    return (
      <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={s.grid} />
        <div style={s.spinnerLg} />
      </div>
    );
  }

  // ====== UNAUTHENTICATED LANDING PAGE ======
  if (!currentUser) {
    return (
      <div style={s.page}>
        <div style={s.grid} />

        {/* Header */}
        <header style={{ ...s.header, background: "transparent", borderBottom: "none", paddingTop: 32 }}>
          <div style={s.logo}>
            <div style={s.logoIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
            </div>
            <span style={{ ...s.logoText, fontSize: 24 }}>CoWork</span>
          </div>
          <div style={s.headerRight}>
            <a href="/login" style={s.loginBtnOutline}>Log in</a>
            <a href="/signup" style={s.signupBtnPrimary}>Get Started</a>
          </div>
        </header>

        <main style={s.heroMain}>
          <div style={s.heroTextContainer}>
            <h1 style={s.heroTitle}>
              The network for <br />
              <span style={s.textGradient}>modern coworking</span>
            </h1>
            <p style={s.heroSubtitle}>
              Whether you're an independent professional looking to connect, or a space owner building a community.
            </p>
          </div>

          <div style={s.splitCards}>
            {/* User Card */}
            <div style={s.offerCard}>
              <div style={s.offerIconWrap}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a3e635" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h2 style={s.offerTitle}>For Coworkers</h2>
              <p style={s.offerDesc}>Check in to your space, discover who's around you, and network with other professionals.</p>
              <ul style={s.offerList}>
                <li>✓ See who is currently working</li>
                <li>✓ Filter by specializations</li>
                <li>✓ Seamless daily check-ins</li>
              </ul>
              <a href="/signup" style={s.offerBtn}>Join as Member →</a>
            </div>

            {/* Admin Card */}
            <div style={s.offerCardAlt}>
              <div style={s.offerBadge}>For Owners</div>
              <div style={s.offerIconWrapAlt}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
              <h2 style={s.offerTitle}>For Coworking Spaces</h2>
              <p style={{ ...s.offerDesc, color: "#334155" }}>Register your space, manage your members, and gain insights into attendance.</p>
              <ul style={{ ...s.offerList, color: "#1e293b" }}>
                <li>✓ Detailed analytics dashboard</li>
                <li>✓ Member management & blocking</li>
                <li>✓ Real-time occupancy metrics</li>
              </ul>
              <a href="/register" style={s.offerBtnAlt}>Register Space →</a>
            </div>
          </div>
        </main>

        <style>{styles}</style>
      </div>
    );
  }

  // ====== AUTHENTICATED FEED (For Members) ======
  return (
    <>
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none grid-bg z-0" />

      {/* Header */}
      <header className="relative z-10 w-full px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-primary-fg flex items-center justify-center text-xl shadow-[0_0_15px_rgba(190,242,100,0.3)]">
            <i className="fa-solid fa-desktop" />
          </div>
          <span className="text-xl font-bold tracking-tight">CoWork</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm font-medium text-text-muted">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>{profiles.length} here now</span>
          </div>
          {/* Theme Dropdown */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setThemeOpen(!themeOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-border text-sm font-medium text-text-muted hover:text-text-main hover:border-primary/50 transition-all cursor-pointer"
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: THEMES.find(t => t.id === currentTheme)?.color }}
              />
              <span>{THEMES.find(t => t.id === currentTheme)?.name}</span>
              <i className={`fa-solid fa-chevron-down text-[10px] transition-transform ${themeOpen ? "rotate-180" : ""}`} />
            </button>

            {themeOpen && (
              <div className="absolute top-full right-0 mt-2 w-44 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-50">
                {THEMES.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => applyTheme(theme.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${currentTheme === theme.id
                        ? "text-primary bg-surface-hover"
                        : "text-text-muted hover:text-text-main hover:bg-surface-hover"
                      }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20"
                      style={{ background: theme.color }}
                    />
                    <span>{theme.name}</span>
                    {currentTheme === theme.id && (
                      <i className="fa-solid fa-check text-xs ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {currentUser && (
            <a href="/profile" className="text-sm font-medium text-text-muted hover:text-text-main transition-colors">
              My profile
            </a>
          )}
          <button
            onClick={handleCheckin}
            disabled={checkingIn}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity shadow-lg cursor-pointer ${checkedIn
                ? "bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25"
                : "bg-primary text-primary-fg hover:opacity-90 shadow-primary/20"
              }`}
          >
            {checkingIn ? "..." : checkedIn ? (
              <><i className="fa-solid fa-arrow-left mr-1" /> Check out</>
            ) : (
              <>Check in <i className="fa-solid fa-arrow-right ml-1" /></>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-20">

        {/* Hero Section */}
        <section className="mb-12">
          <div className="relative inline-block">
            <div className="absolute -inset-1 bg-linear-to-r from-primary to-transparent opacity-20 blur-lg rounded-lg" />
            <h1 className="relative text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
              Who&apos;s here today
            </h1>
          </div>
          <p className="text-lg text-text-muted max-w-xl">
            Connect with people around you. Find your next collaborator, lunch buddy, or just say hello.
          </p>
        </section>

        {/* Filters */}
        <section className="mb-10">
          <div className="flex flex-wrap gap-3">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${filter === f
                    ? "bg-primary text-primary-fg shadow-lg shadow-primary/10 hover:scale-105"
                    : "bg-surface border border-border text-text-muted hover:border-primary hover:text-text-main hover:bg-surface-hover"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </section>

        {/* Users Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="text-5xl">⏳</div>
            <p className="text-lg font-semibold text-text-muted">Loading...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="text-5xl">👀</div>
            <p className="text-lg font-semibold text-text-muted">No one here yet</p>
            <p className="text-sm text-text-muted/50">Be the first to check in!</p>
          </div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((profile, i) => {
              const color = getColor(profile.id);
              const badgeClass = roleBadgeClasses[profile.specialization] ||
                "bg-surface-hover border-border text-text-muted group-hover:border-primary/30 group-hover:text-primary";

              return (
                <a
                  key={profile.id}
                  href={`/users/${profile.id}`}
                  className="group relative bg-surface border border-border rounded-3xl p-6 card-hover cursor-pointer overflow-hidden no-underline animate-fade-up"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className="absolute top-0 right-0 p-5 opacity-50 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-mono text-text-muted">
                      {profile.checkin_at ? getTimeSince(profile.checkin_at) : ""}
                    </span>
                  </div>

                  <div className="flex flex-col items-start gap-4">
                    <div className="relative">
                      <div
                        className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-border group-hover:ring-primary transition-all flex items-center justify-center"
                        style={{ background: profile.avatar_url ? undefined : color + "22" }}
                      >
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-bold text-base" style={{ color }}>{getInitials(profile.name)}</span>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-surface rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full border border-surface" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">
                        {profile.name}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${badgeClass}`}>
                        {profile.specialization || "Member"}
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}

            {/* Invite Card */}
            <div className="group relative bg-surface/30 border border-dashed border-border rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-4 hover:bg-surface hover:border-primary/50 transition-all cursor-pointer min-h-[200px]">
              <div className="w-14 h-14 rounded-full bg-surface-hover flex items-center justify-center text-text-muted group-hover:text-primary group-hover:scale-110 transition-all">
                <i className="fa-solid fa-plus text-xl" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-main">Invite friend</h3>
                <p className="text-xs text-text-muted mt-1">Send an invite link</p>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  a:hover > div { border-color: rgba(163,230,53,0.2) !important; }
`;

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#080f1a", fontFamily: "'DM Sans', sans-serif", position: "relative" },
  grid: {
    position: "fixed", inset: 0,
    backgroundImage: "linear-gradient(rgba(163,230,53,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(163,230,53,0.03) 1px, transparent 1px)",
    backgroundSize: "48px 48px", pointerEvents: "none",
  },
  spinnerLg: {
    width: 32, height: 32, border: "3px solid #1e293b",
    borderTop: "3px solid #a3e635", borderRadius: "50%",
    animation: "spin 1s linear infinite",
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
  logoutBtn: {
    padding: "7px 14px", borderRadius: 999, border: "1px solid #1f2933",
    background: "transparent", color: "#64748b", fontSize: 12, cursor: "pointer",
  },
  checkinBtn: {
    padding: "9px 18px", borderRadius: 10,
    fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13,
    cursor: "pointer", transition: "all 0.2s",
  },
  loginBtnOutline: {
    padding: "9px 18px", borderRadius: 10, border: "1.5px solid #1e293b",
    color: "#f1f5f9", textDecoration: "none", fontSize: 14, fontWeight: 500,
    transition: "all 0.2s",
  },
  signupBtnPrimary: {
    padding: "10px 20px", borderRadius: 10, background: "#a3e635",
    color: "#0f172a", textDecoration: "none", fontSize: 14, fontWeight: 600, fontFamily: "'Syne', sans-serif",
    transition: "all 0.2s", boxShadow: "0 4px 14px rgba(163,230,53,0.3)",
  },

  // Hero section for unauthenticated
  heroMain: { maxWidth: 1000, margin: "0 auto", padding: "80px 32px 100px", display: "flex", flexDirection: "column", alignItems: "center" },
  heroTextContainer: { textAlign: "center", marginBottom: 60, animation: "fadeUp 0.6s ease both" },
  heroTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 56, color: "#f1f5f9", letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: 20 },
  textGradient: { background: "linear-gradient(135deg, #a3e635, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  heroSubtitle: { fontSize: 18, color: "#64748b", maxWidth: 500, margin: "0 auto", lineHeight: 1.5 },

  // Split cards
  splitCards: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, width: "100%", animation: "fadeUp 0.8s ease both" },

  // Card 1 (Member)
  offerCard: {
    background: "rgba(15,23,42,0.6)", border: "1px solid #1e293b", borderRadius: 24,
    padding: "40px", display: "flex", flexDirection: "column", backdropFilter: "blur(10px)",
    transition: "transform 0.3s, border-color 0.3s", cursor: "default",
  },
  offerIconWrap: {
    width: 48, height: 48, borderRadius: 12, background: "rgba(163,230,53,0.1)",
    border: "1px solid rgba(163,230,53,0.2)", display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: 24,
  },
  offerTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 24, color: "#f1f5f9", marginBottom: 12 },
  offerDesc: { fontSize: 15, color: "#94a3b8", lineHeight: 1.6, marginBottom: 24, minHeight: 48 },
  offerList: { listStyle: "none", display: "flex", flexDirection: "column", gap: 12, marginBottom: 36, color: "#cbd5e1", fontSize: 14 },
  offerBtn: {
    marginTop: "auto", padding: "14px 20px", borderRadius: 12, background: "rgba(255,255,255,0.05)",
    border: "1px solid #334155", color: "#f1f5f9", textDecoration: "none", textAlign: "center",
    fontWeight: 600, fontSize: 15, transition: "all 0.2s",
  },

  // Card 2 (Admin)
  offerCardAlt: {
    background: "linear-gradient(145deg, #a3e635, #65a30d)", borderRadius: 24,
    padding: "40px", display: "flex", flexDirection: "column", position: "relative",
    boxShadow: "0 20px 40px rgba(163,230,53,0.15)",
  },
  offerBadge: {
    position: "absolute", top: 20, right: 24, background: "rgba(0,0,0,0.2)",
    color: "#f1f5f9", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20,
    textTransform: "uppercase", letterSpacing: "0.05em",
  },
  offerIconWrapAlt: {
    width: 48, height: 48, borderRadius: 12, background: "rgba(255,255,255,0.2)",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: 24,
  },
  offerBtnAlt: {
    marginTop: "auto", padding: "14px 20px", borderRadius: 12, background: "#0f172a",
    color: "#f1f5f9", textDecoration: "none", textAlign: "center",
    fontWeight: 600, fontSize: 15, transition: "all 0.2s", boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
  },

  // Authenticated Feed
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
