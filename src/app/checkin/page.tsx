"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function QRCheckinPage() {
  const [status, setStatus] = useState<"loading" | "success" | "already" | "checkout" | "error" | "login">("loading");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    handleCheckin();
  }, []);

  const handleCheckin = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setStatus("login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("name, checkin_at")
      .eq("id", user.id)
      .single();

    setUserName(profile?.name || "Friend");

    if (profile?.checkin_at) {
      // Already checked in → check out
      await supabase.from("profiles").update({ checkin_at: null }).eq("id", user.id);
      setStatus("checkout");
    } else {
      // Check in
      await supabase.from("profiles").update({ checkin_at: new Date().toISOString() }).eq("id", user.id);
      setStatus("success");
    }

    // Redirect to feed after 2 seconds
    setTimeout(() => { window.location.href = "/"; }, 2500);
  };

  const icons: Record<string, string> = {
    loading: "⏳", success: "✓", already: "👋", checkout: "👋", error: "⚠️", login: "🔐"
  };

  const titles: Record<string, string> = {
    loading: "Checking in...",
    success: "Checked in!",
    already: "Already here!",
    checkout: "See you later!",
    error: "Something went wrong",
    login: "Please sign in first",
  };

  const subtitles: Record<string, string> = {
    loading: "Just a moment...",
    success: `Welcome, ${userName}! Redirecting to feed...`,
    already: `You're already checked in, ${userName}!`,
    checkout: `Goodbye, ${userName}! Come back soon.`,
    error: "Please try again or check in manually.",
    login: "You need to sign in to check in.",
  };

  const colors: Record<string, string> = {
    loading: "#475569",
    success: "#a3e635",
    already: "#a3e635",
    checkout: "#f59e0b",
    error: "#f87171",
    login: "#818cf8",
  };

  const color = colors[status];

  return (
    <div style={s.page}>
      <div style={s.grid} />

      <div style={s.card}>
        <div style={s.logo}>
          <div style={s.logoIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          </div>
          <span style={s.logoText}>CoWork</span>
        </div>

        <div style={{ ...s.iconWrap, background: color + "22", border: `2px solid ${color}44`, boxShadow: `0 0 30px ${color}33` }}>
          <span style={s.icon}>{icons[status]}</span>
        </div>

        <h1 style={{ ...s.title, color }}>{titles[status]}</h1>
        <p style={s.subtitle}>{subtitles[status].replace("${userName}", userName)}</p>

        {status === "login" && (
          <button onClick={() => window.location.href = "/login"} style={s.btn}>
            Sign in →
          </button>
        )}

        {(status === "success" || status === "checkout") && (
          <div style={s.progressWrap}>
            <div style={s.progressBar} />
          </div>
        )}

        {status === "error" && (
          <button onClick={() => window.location.href = "/"} style={s.btn}>
            Go to feed →
          </button>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes progress { from { width: 0%; } to { width: 100%; } }
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.8; transform:scale(0.96); } }
      `}</style>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh", background: "#080f1a",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'DM Sans', sans-serif", padding: "24px",
    position: "relative",
  },
  grid: {
    position: "fixed", inset: 0,
    backgroundImage: "linear-gradient(rgba(163,230,53,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(163,230,53,0.04) 1px, transparent 1px)",
    backgroundSize: "48px 48px", pointerEvents: "none",
  },
  card: {
    width: "100%", maxWidth: 380,
    background: "rgba(15,23,42,0.9)", border: "1px solid #1e293b",
    borderRadius: 24, padding: "40px 36px",
    backdropFilter: "blur(20px)",
    boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
    animation: "fadeUp 0.5s ease both",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
    textAlign: "center",
  },
  logo: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8 },
  logoIcon: {
    width: 32, height: 32, borderRadius: 8,
    background: "linear-gradient(135deg, #a3e635, #65a30d)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  logoText: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#f1f5f9" },
  iconWrap: {
    width: 80, height: 80, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    animation: "pulse 2s infinite",
  },
  icon: { fontSize: 36 },
  title: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, letterSpacing: "-0.5px" },
  subtitle: { fontSize: 14, color: "#64748b", lineHeight: 1.6 },
  btn: {
    background: "#a3e635", color: "#0f172a", border: "none", borderRadius: 10,
    padding: "12px 24px", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14,
    cursor: "pointer", width: "100%",
  },
  progressWrap: {
    width: "100%", height: 3, background: "#1e293b", borderRadius: 2, overflow: "hidden",
  },
  progressBar: {
    height: "100%", background: "#a3e635", borderRadius: 2,
    animation: "progress 2.5s linear forwards",
  },
};
