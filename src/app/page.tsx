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
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user);
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
    loadProfiles();

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
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                      currentTheme === theme.id
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
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity shadow-lg cursor-pointer ${
              checkedIn
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
                className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                  filter === f
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
