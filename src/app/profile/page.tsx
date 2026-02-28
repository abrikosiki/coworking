"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const SKILLS_OPTIONS = ["React", "TypeScript", "Node.js", "UI/UX", "Figma", "Python", "Marketing", "Branding", "Sales", "Design", "Vue", "Angular"];

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
  email: string;
  linkedin: string;
  telegram: string;
  skills: string[];
  checkin_at: string | null;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [draft, setDraft] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/login"; return; }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const p = {
      id: user.id,
      name: data?.name || "",
      specialization: data?.specialization || "Other",
      bio: data?.bio || "",
      email: user.email || "",
      linkedin: data?.linkedin || "",
      telegram: data?.telegram || "",
      skills: data?.skills || [],
      checkin_at: data?.checkin_at || null,
    };

    setProfile(p);
    setDraft(p);
    setLoading(false);
  };

  const saveChanges = async () => {
    if (!draft) return;
    setSaving(true);
    setSaveError("");

    const { error } = await supabase
      .from("profiles")
      .update({
        name: draft.name,
        specialization: draft.specialization,
        bio: draft.bio,
        linkedin: draft.linkedin,
        telegram: draft.telegram,
        skills: draft.skills,
      })
      .eq("id", draft.id);

    setSaving(false);

    if (error) {
      setSaveError(error.message);
      return;
    }

    setProfile(draft);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleSkill = (skill: string) => {
    if (!draft) return;
    const has = draft.skills.includes(skill);
    setDraft({ ...draft, skills: has ? draft.skills.filter(s => s !== skill) : [...draft.skills, skill] });
  };

  if (loading) return (
    <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={s.grid} />
      <p style={{ color: "#475569", fontFamily: "'DM Sans', sans-serif" }}>Loading...</p>
    </div>
  );

  if (!profile || !draft) return null;

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
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {saved && <span style={s.savedBadge}>✓ Saved!</span>}
          <a href="/" style={s.backBtn}>← Back to feed</a>
        </div>
      </header>

      <main style={s.main}>
        <div style={s.card}>

          {/* Top */}
          <div style={s.topSection}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <div style={{ ...s.avatar, background: color + "22", border: `3px solid ${color}55` }}>
                <span style={{ ...s.avatarText, color }}>{getInitials(profile.name)}</span>
              </div>
              {profile.checkin_at && <div style={s.onlineBadge}>● Here now</div>}
            </div>

            <div style={s.topInfo}>
              {editing ? (
                <input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })}
                  style={s.editInput} placeholder="Your name" />
              ) : (
                <h1 style={s.name}>{profile.name}</h1>
              )}

              {editing ? (
                <select value={draft.specialization} onChange={e => setDraft({ ...draft, specialization: e.target.value })} style={s.editSelect}>
                  {["Developer", "Designer", "Marketing", "Other"].map(r => <option key={r}>{r}</option>)}
                </select>
              ) : (
                <div style={{ ...s.roleTag, background: roleColors[profile.specialization]?.bg, color: roleColors[profile.specialization]?.text }}>
                  {profile.specialization}
                </div>
              )}
            </div>

            <button onClick={editing ? saveChanges : () => setEditing(true)} disabled={saving}
              style={{ ...s.editBtn, background: editing ? "#a3e635" : "transparent", color: editing ? "#0f172a" : "#64748b" }}>
              {saving ? "Saving..." : editing ? "Save" : "Edit profile"}
            </button>
          </div>

          {saveError && <div style={s.errorBox}>⚠️ {saveError}</div>}

          <div style={s.divider} />

          {/* Bio */}
          <div style={s.section}>
            <label style={s.sectionLabel}>About</label>
            {editing ? (
              <textarea value={draft.bio} onChange={e => setDraft({ ...draft, bio: e.target.value })}
                style={s.editTextarea} placeholder="Tell people about yourself" rows={3} />
            ) : (
              <p style={s.bio}>{profile.bio || <span style={{ color: "#334155" }}>No bio yet — click Edit to add one</span>}</p>
            )}
          </div>

          <div style={s.divider} />

          {/* Skills */}
          <div style={s.section}>
            <label style={s.sectionLabel}>Skills {editing && <span style={{ color: "#475569", fontWeight: 400 }}>— click to toggle</span>}</label>
            <div style={s.skillsWrap}>
              {(editing ? SKILLS_OPTIONS : profile.skills.length ? profile.skills : SKILLS_OPTIONS.slice(0, 3)).map(skill => {
                const active = editing ? draft.skills.includes(skill) : profile.skills.includes(skill);
                return (
                  <button key={skill} onClick={() => editing && toggleSkill(skill)} style={{
                    ...s.skillTag,
                    background: active ? "rgba(163,230,53,0.15)" : "rgba(255,255,255,0.04)",
                    color: active ? "#a3e635" : "#475569",
                    border: active ? "1.5px solid rgba(163,230,53,0.3)" : "1.5px solid #1e293b",
                    cursor: editing ? "pointer" : "default",
                    opacity: !editing && !active ? 0 : 1,
                    display: !editing && !active ? "none" : "inline-block",
                  }}>
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={s.divider} />

          {/* Contacts */}
          <div style={s.section}>
            <label style={s.sectionLabel}>Contacts</label>
            <div style={s.contacts}>
              {[
                { icon: "✉️", key: "email", label: "Email", placeholder: "your@email.com", readOnly: true },
                { icon: "💼", key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/you", readOnly: false },
                { icon: "✈️", key: "telegram", label: "Telegram", placeholder: "@yourhandle", readOnly: false },
              ].map(({ icon, key, placeholder, readOnly }) => (
                <div key={key} style={s.contactRow}>
                  <span style={s.contactIcon}>{icon}</span>
                  {editing && !readOnly ? (
                    <input value={(draft as Record<string, string>)[key]} onChange={e => setDraft({ ...draft, [key]: e.target.value })}
                      style={s.editInputSmall} placeholder={placeholder} />
                  ) : (
                    <span style={s.contactValue}>{(profile as Record<string, string>)[key] || <span style={{ color: "#334155" }}>—</span>}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {editing && (
            <button onClick={() => { setDraft(profile); setEditing(false); }} style={s.cancelBtn}>
              Cancel
            </button>
          )}
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus, textarea:focus, select:focus { outline: none; border-color: #a3e635 !important; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
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
  savedBadge: { fontSize: 12, color: "#a3e635", fontWeight: 600, background: "rgba(163,230,53,0.1)", padding: "4px 10px", borderRadius: 6 },
  main: { maxWidth: 600, margin: "0 auto", padding: "40px 24px" },
  card: {
    background: "rgba(15,23,42,0.9)", border: "1px solid #1e293b", borderRadius: 20, padding: "32px",
    backdropFilter: "blur(20px)", animation: "fadeUp 0.4s ease both",
  },
  topSection: { display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 28 },
  avatar: { width: 72, height: 72, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  avatarText: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22 },
  onlineBadge: {
    position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)",
    background: "rgba(163,230,53,0.15)", border: "1px solid rgba(163,230,53,0.3)",
    color: "#a3e635", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap",
  },
  topInfo: { flex: 1, display: "flex", flexDirection: "column", gap: 8, paddingTop: 4 },
  name: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: "#f1f5f9" },
  roleTag: { display: "inline-block", padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, width: "fit-content" },
  editBtn: { border: "1.5px solid #1e293b", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, fontFamily: "'Syne', sans-serif" },
  errorBox: { background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#f87171", marginBottom: 16 },
  divider: { height: 1, background: "#1e293b", margin: "0 0 24px" },
  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 12 },
  bio: { fontSize: 14, color: "#94a3b8", lineHeight: 1.7 },
  skillsWrap: { display: "flex", flexWrap: "wrap", gap: 8 },
  skillTag: { padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, transition: "all 0.15s" },
  contacts: { display: "flex", flexDirection: "column", gap: 12 },
  contactRow: { display: "flex", alignItems: "center", gap: 12 },
  contactIcon: { fontSize: 16, width: 24, textAlign: "center", flexShrink: 0 },
  contactValue: { fontSize: 14, color: "#64748b" },
  editInput: { background: "#0f172a", border: "1.5px solid #1e293b", borderRadius: 8, padding: "8px 12px", fontSize: 18, color: "#f1f5f9", fontWeight: 700, fontFamily: "'Syne', sans-serif", width: "100%" },
  editInputSmall: { background: "#0f172a", border: "1.5px solid #1e293b", borderRadius: 8, padding: "7px 12px", fontSize: 13, color: "#94a3b8", width: "100%" },
  editSelect: { background: "#0f172a", border: "1.5px solid #1e293b", borderRadius: 8, padding: "6px 12px", fontSize: 13, color: "#94a3b8", width: "fit-content" },
  editTextarea: { background: "#0f172a", border: "1.5px solid #1e293b", borderRadius: 8, padding: "10px 12px", fontSize: 14, color: "#94a3b8", width: "100%", resize: "none", lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" },
  cancelBtn: { width: "100%", background: "transparent", border: "1.5px solid #1e293b", borderRadius: 10, padding: "11px", color: "#475569", fontSize: 13, cursor: "pointer", marginTop: 8 },
};
