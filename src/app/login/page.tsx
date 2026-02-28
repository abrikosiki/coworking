"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!email.includes("@")) { setError("Enter a valid email"); return; }
    if (password.length < 6) { setError("Password is too short"); return; }

    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    // Check role and redirect
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role === "admin") {
      window.location.href = "/dashboard";
    } else {
      window.location.href = "/";
    }
  };

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

        <h1 style={s.title}>Welcome back</h1>
        <p style={s.subtitle}>Sign in to your account</p>

        <div style={s.form}>
          <div style={s.fieldWrap}>
            <label style={s.label}>Email</label>
            <input
              type="email"
              placeholder="you@cowork.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(""); }}
              style={{ ...s.input, borderColor: error ? "#f87171" : "#1e293b" }}
            />
          </div>

          <div style={s.fieldWrap}>
            <label style={s.label}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                style={{ ...s.input, borderColor: error ? "#f87171" : "#1e293b" }}
              />
              <button onClick={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          <div style={{ textAlign: "right", marginTop: -8 }}>
            <a href="#" style={s.link}>Forgot password?</a>
          </div>

          {error && (
            <div style={s.errorBox}>
              <span>⚠️</span> {error}
            </div>
          )}

          <button onClick={handleLogin} disabled={loading} style={s.btn}>
            {loading ? <span style={s.spinner} /> : "Sign in →"}
          </button>

          <div style={s.divider}>
            <div style={s.dividerLine} />
            <span style={s.dividerText}>or</span>
            <div style={s.dividerLine} />
          </div>

          <p style={s.bottomText}>
            New member?{" "}
            <a href="/signup" style={s.link}>Create account</a>
          </p>
          <p style={s.bottomText}>
            Registering a coworking?{" "}
            <a href="/register" style={s.link}>Admin sign up</a>
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #475569; }
        input:focus { outline: none; border-color: #a3e635 !important; box-shadow: 0 0 0 3px rgba(163,230,53,0.15); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh", background: "#080f1a",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'DM Sans', sans-serif", padding: "24px",
    position: "relative", overflow: "hidden",
  },
  grid: {
    position: "fixed", inset: 0,
    backgroundImage: "linear-gradient(rgba(163,230,53,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(163,230,53,0.04) 1px, transparent 1px)",
    backgroundSize: "48px 48px", pointerEvents: "none",
  },
  card: {
    width: "100%", maxWidth: 420,
    background: "rgba(15, 23, 42, 0.9)",
    border: "1px solid #1e293b", borderRadius: 20,
    padding: "40px 40px 36px",
    backdropFilter: "blur(20px)",
    boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
    animation: "fadeUp 0.5s ease both",
  },
  logo: { display: "flex", alignItems: "center", gap: 10, marginBottom: 28 },
  logoIcon: {
    width: 36, height: 36, borderRadius: 10,
    background: "linear-gradient(135deg, #a3e635, #65a30d)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  logoText: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: "#f1f5f9" },
  title: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 26, color: "#f1f5f9", letterSpacing: "-0.5px", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#64748b", marginBottom: 28 },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  fieldWrap: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 500, color: "#94a3b8" },
  input: {
    background: "#0f172a", border: "1.5px solid #1e293b",
    borderRadius: 10, padding: "11px 14px",
    fontSize: 14, color: "#f1f5f9", transition: "all 0.2s", width: "100%",
  },
  eyeBtn: {
    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", color: "#475569", cursor: "pointer",
    display: "flex", alignItems: "center",
  },
  errorBox: {
    background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)",
    borderRadius: 8, padding: "10px 14px",
    fontSize: 13, color: "#f87171", display: "flex", alignItems: "center", gap: 8,
  },
  btn: {
    background: "#a3e635", color: "#0f172a", border: "none", borderRadius: 10,
    padding: "13px 20px", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14,
    cursor: "pointer", width: "100%",
    display: "flex", alignItems: "center", justifyContent: "center",
    minHeight: 46, transition: "all 0.2s",
  },
  spinner: {
    width: 18, height: 18, border: "2px solid #0f172a",
    borderTop: "2px solid transparent", borderRadius: "50%",
    animation: "spin 0.7s linear infinite", display: "inline-block",
  },
  divider: { display: "flex", alignItems: "center", gap: 12 },
  dividerLine: { flex: 1, height: 1, background: "#1e293b" },
  dividerText: { fontSize: 12, color: "#334155" },
  link: { color: "#a3e635", textDecoration: "none", fontWeight: 500 },
  bottomText: { textAlign: "center", fontSize: 13, color: "#475569" },
};
