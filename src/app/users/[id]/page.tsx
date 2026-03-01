"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
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
  name: string;
  specialization: string;
  bio: string;
  linkedin: string;
  telegram: string;
  skills: string[];
  avatar_url: string | null;
  checkin_at: string | null;
  created_at: string;
};

export default function UserProfilePage() {
  const params = useParams();
  const userId = params?.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState("");

  const loadProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) {
      setNotFound(true);
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!userId) return;
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const copyToClipboard = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(""), 2000);
  };

  const getMemberSince = (createdAt: string) => {
    return new Date(createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  // Loading
  if (loading) return (
    <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={s.grid} />
      <p style={{ color: "#475569", fontFamily: "'DM Sans', sans-serif" }}>Loading...</p>
    </div>
  );

  // Not found
  if (notFound || !profile) return (
    <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={s.grid} />
      <div style={{ textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
        <p style={{ color: "#475569", fontSize: 16 }}>User not found</p>
        <Link href="/" style={{ color: "#a3e635", fontSize: 14, textDecoration: "none", display: "block", marginTop: 12 }}>← Back to feed</Link>
      </div>
    </div>
  );

  const color = getColor(profile.id);

  return (
    <div style={s.page}>
      <div style={s.grid} />

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
        <Link href="/" style={s.backBtn}>← Back to feed</Link>
      </header>

      <main style={s.main}>
        {/* Hero */}
        <div style={s.heroCard}>
          <div style={{ ...s.heroBg, background: `radial-gradient(circle at 30% 50%, ${color}22, transparent 60%)` }} />

          <div style={s.heroContent}>
            <div style={s.avatarRow}>
              <div style={{ ...s.avatar, background: color + "22", border: `3px solid ${color}55`, overflow: "hidden" }}>
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 17 }} />
                ) : (
                  <span style={{ ...s.avatarText, color }}>{getInitials(profile.name)}</span>
                )}
              </div>
              {profile.checkin_at && (
                <div style={s.heroBadge}>
                  <span style={s.badgeDot} />
                  Here now
                </div>
              )}
            </div>

            <div>
              <h1 style={s.heroName}>{profile.name}</h1>
              <div style={{
                ...s.roleTag,
                background: roleColors[profile.specialization]?.bg,
                color: roleColors[profile.specialization]?.text,
              }}>
                {profile.specialization || "Member"}
              </div>
              {profile.bio && <p style={s.heroBio}>{profile.bio}</p>}
            </div>

            <div style={s.heroStats}>
              <div style={s.heroStat}>
                <span style={s.heroStatVal}>{getMemberSince(profile.created_at)}</span>
                <span style={s.heroStatLabel}>member since</span>
              </div>
              {profile.checkin_at && (
                <>
                  <div style={s.statDivider} />
                  <div style={s.heroStat}>
                    <span style={{ ...s.heroStatVal, color: "#a3e635" }}>● In</span>
                    <span style={s.heroStatLabel}>coworking now</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div style={s.bottomGrid}>
          {/* Skills */}
          {profile.skills?.length > 0 && (
            <div style={s.card}>
              <label style={s.sectionLabel}>Skills</label>
              <div style={s.skillsWrap}>
                {profile.skills.map(skill => (
                  <span key={skill} style={s.skillTag}>{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Contacts */}
          <div style={s.card}>
            <label style={s.sectionLabel}>Connect</label>
            <div style={s.contacts}>
              {[
                { icon: "💼", label: "LinkedIn", value: profile.linkedin, key: "linkedin" },
                { icon: "✈️", label: "Telegram", value: profile.telegram, key: "telegram" },
              ].filter(c => c.value).map(({ icon, label, value, key }) => (
                <div key={key} style={s.contactRow}>
                  <span style={s.contactIcon}>{icon}</span>
                  <div style={s.contactInfo}>
                    <span style={s.contactLabel}>{label}</span>
                    <span style={s.contactValue}>{value}</span>
                  </div>
                  <button onClick={() => copyToClipboard(value, key)} style={s.copyBtn}>
                    {copied === key ? "✓ Copied!" : "Copy"}
                  </button>
                </div>
              ))}

              {!profile.linkedin && !profile.telegram && (
                <p style={{ fontSize: 13, color: "#334155" }}>No contacts added yet</p>
              )}
            </div>
          </div>
        </div>
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
  backBtn: { fontSize: 13, color: "#64748b", textDecoration: "none", fontWeight: 500 },
  main: { maxWidth: 680, margin: "0 auto", padding: "40px 24px" },
  heroCard: {
    background: "rgba(15,23,42,0.9)", border: "1px solid #1e293b",
    borderRadius: 20, padding: "32px", marginBottom: 16,
    position: "relative", overflow: "hidden",
    animation: "fadeUp 0.4s ease both",
  },
  heroBg: { position: "absolute", inset: 0, pointerEvents: "none" },
  heroContent: { position: "relative", display: "flex", flexDirection: "column", gap: 20 },
  avatarRow: { display: "flex", alignItems: "center", gap: 16 },
  avatar: { width: 80, height: 80, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  avatarText: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26 },
  heroBadge: {
    display: "flex", alignItems: "center", gap: 6,
    background: "rgba(163,230,53,0.1)", border: "1px solid rgba(163,230,53,0.2)",
    color: "#a3e635", fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 20,
  },
  badgeDot: {
    width: 7, height: 7, borderRadius: "50%",
    background: "#a3e635", boxShadow: "0 0 6px #a3e635",
    animation: "pulse 2s infinite", display: "inline-block",
  },
  heroName: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, color: "#f1f5f9", letterSpacing: "-0.5px", marginBottom: 8 },
  roleTag: { display: "inline-block", padding: "4px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, width: "fit-content", marginBottom: 12 },
  heroBio: { fontSize: 14, color: "#94a3b8", lineHeight: 1.7, maxWidth: 480 },
  heroStats: { display: "flex", alignItems: "center", gap: 20, paddingTop: 4 },
  heroStat: { display: "flex", flexDirection: "column", gap: 2 },
  heroStatVal: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#e2e8f0" },
  heroStatLabel: { fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em" },
  statDivider: { width: 1, height: 32, background: "#1e293b" },
  bottomGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  card: {
    background: "rgba(15,23,42,0.9)", border: "1px solid #1e293b",
    borderRadius: 16, padding: "24px", animation: "fadeUp 0.4s ease both",
  },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 14 },
  skillsWrap: { display: "flex", flexWrap: "wrap", gap: 8 },
  skillTag: {
    padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
    background: "rgba(163,230,53,0.08)", color: "#a3e635", border: "1px solid rgba(163,230,53,0.2)",
  },
  contacts: { display: "flex", flexDirection: "column", gap: 12 },
  contactRow: { display: "flex", alignItems: "center", gap: 10 },
  contactIcon: { fontSize: 16, width: 24, textAlign: "center", flexShrink: 0 },
  contactInfo: { flex: 1, display: "flex", flexDirection: "column", gap: 1 },
  contactLabel: { fontSize: 10, color: "#334155", textTransform: "uppercase", letterSpacing: "0.05em" },
  contactValue: { fontSize: 12, color: "#64748b" },
  copyBtn: {
    background: "rgba(255,255,255,0.04)", border: "1px solid #1e293b",
    borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#64748b",
    cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap", transition: "all 0.15s", flexShrink: 0,
  },
};
