"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

const SPECIALIZATIONS = ["Developer", "Designer", "Marketing", "Other"];

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

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", specialization: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const update = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: "" }));
    setServerError("");
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Enter your name";
    if (!form.email.includes("@")) e.email = "Invalid email";
    if (form.password.length < 8) e.password = "Minimum 8 characters";
    if (!form.specialization) e.specialization = "Pick your specialization";
    return e;
  };

  const handleSignup = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    setServerError("");

    try {
      // 1. Create user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.name } }
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error("Failed to create account");

      // 2. Create profile with member role
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          full_name: form.name,
          role: "member",
          specialization: form.specialization,
        });

      if (profileError) throw new Error(profileError.message);

      setDone(true);
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
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
          <div style={s.success}>
            <div style={s.successIcon}>✓</div>
            <h2 style={s.successTitle}>You're in! 🎉</h2>
            <p style={s.successText}>
              Welcome, <strong style={{ color: "#a3e635" }}>{form.name}</strong>!<br />
              Check <strong style={{ color: "#e2e8f0" }}>{form.email}</strong> to confirm your account.
            </p>
            <button onClick={() => window.location.href = "/login"} style={s.btn}>
              Sign in →
            </button>
          </div>
        </div>
        <style>{cssReset}</style>
      </div>
    );
  }

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

        <h1 style={s.title}>Create account</h1>
        <p style={s.subtitle}>Join your coworking community</p>

        <div style={s.form}>
          {/* Name */}
          <div style={s.fieldWrap}>
            <label style={s.label}>Your name</label>
            <input placeholder="Anna Smith" value={form.name}
              onChange={e => update("name", e.target.value)}
              style={{ ...s.input, borderColor: errors.name ? "#f87171" : "#1e293b" }} />
            {errors.name && <span style={s.error}>{errors.name}</span>}
          </div>

          {/* Email */}
          <div style={s.fieldWrap}>
            <label style={s.label}>Email</label>
            <input type="email" placeholder="anna@cowork.com" value={form.email}
              onChange={e => update("email", e.target.value)}
              style={{ ...s.input, borderColor: errors.email ? "#f87171" : "#1e293b" }} />
            {errors.email && <span style={s.error}>{errors.email}</span>}
          </div>

          {/* Password */}
          <div style={s.fieldWrap}>
            <label style={s.label}>Password</label>
            <div style={{ position: "relative" }}>
              <input type={showPassword ? "text" : "password"} placeholder="At least 8 characters"
                value={form.password} onChange={e => update("password", e.target.value)}
                style={{ ...s.input, borderColor: errors.password ? "#f87171" : "#1e293b" }} />
              <button onClick={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
                <EyeIcon open={showPassword} />
              </button>
            </div>
            {errors.password && <span style={s.error}>{errors.password}</span>}
          </div>

          {/* Specialization */}
          <div style={s.fieldWrap}>
            <label style={s.label}>I am a...</label>
            <div style={s.specRow}>
              {SPECIALIZATIONS.map(spec => (
                <button key={spec} onClick={() => update("specialization", spec)} style={{
                  ...s.specBtn,
                  background: form.specialization === spec ? "rgba(163,230,53,0.15)" : "rgba(255,255,255,0.03)",
                  color: form.specialization === spec ? "#a3e635" : "#475569",
                  border: form.specialization === spec ? "1.5px solid rgba(163,230,53,0.4)" : "1.5px solid #1e293b",
                }}>
                  {spec}
                </button>
              ))}
            </div>
            {errors.specialization && <span style={s.error}>{errors.specialization}</span>}
          </div>

          {serverError && (
            <div style={s.errorBox}>⚠️ {serverError}</div>
          )}

          <button onClick={handleSignup} disabled={loading} style={s.btn}>
            {loading ? <span style={s.spinner} /> : "Create account →"}
          </button>

          <p style={s.bottomText}>
            Already have an account?{" "}
            <a href="/login" style={s.link}>Sign in</a>
          </p>
        </div>
      </div>

      <style>{cssReset}</style>
    </div>
  );
}

const cssReset = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  input::placeholder { color: #475569; }
  input:focus { outline: none; border-color: #a3e635 !important; box-shadow: 0 0 0 3px rgba(163,230,53,0.15); }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

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
    width: "100%", maxWidth: 440,
    background: "rgba(15,23,42,0.9)", border: "1px solid #1e293b",
    borderRadius: 20, padding: "40px 40px 36px",
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
    background: "#0f172a", border: "1.5px solid #1e293b", borderRadius: 10,
    padding: "11px 14px", fontSize: 14, color: "#f1f5f9", transition: "all 0.2s", width: "100%",
  },
  eyeBtn: {
    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", color: "#475569", cursor: "pointer",
    display: "flex", alignItems: "center",
  },
  specRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  specBtn: {
    padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
    cursor: "pointer", transition: "all 0.15s",
  },
  error: { fontSize: 12, color: "#f87171" },
  errorBox: {
    background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)",
    borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#f87171",
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
  bottomText: { textAlign: "center", fontSize: 13, color: "#475569" },
  link: { color: "#a3e635", textDecoration: "none", fontWeight: 500 },
  success: { display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" },
  successIcon: {
    width: 56, height: 56, borderRadius: "50%",
    background: "linear-gradient(135deg, #a3e635, #65a30d)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#0f172a", fontSize: 24, fontWeight: 800,
    boxShadow: "0 0 30px rgba(163,230,53,0.3)",
  },
  successTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26, color: "#f1f5f9" },
  successText: { fontSize: 14, color: "#64748b", lineHeight: 1.7 },
};
