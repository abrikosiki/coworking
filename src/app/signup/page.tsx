 "use client";

import { useState } from "react";

const EyeIcon = ({ open }) =>
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

export default function UserSignup() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
  });
  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Enter your name";
    if (!form.email.includes("@")) e.email = "Invalid email";
    if (form.password.length < 8) e.password = "Minimum 8 characters";
    if (!form.specialization.trim()) e.specialization = "Enter your specialization";
    return e;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Account created!");
    }, 1000);
  };

  return (
    <div style={styles.page}>
      <div style={styles.grid} />

      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          </div>
          <span style={styles.logoText}>CoWork</span>
        </div>

        <h1 style={styles.title}>Create your account</h1>
        <p style={styles.subtitle}>Join the CoWork community in seconds</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <Field
            label="Name"
            placeholder="Anna Smith"
            value={form.name}
            onChange={(v) => update("name", v)}
            error={errors.name}
          />
          <Field
            label="Email"
            placeholder="anna@example.com"
            type="email"
            value={form.email}
            onChange={(v) => update("email", v)}
            error={errors.email}
          />
          <div style={{ position: "relative" }}>
            <Field
              label="Password"
              placeholder="At least 8 characters"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(v) => update("password", v)}
              error={errors.password}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <EyeIcon open={showPassword} />
            </button>
          </div>
          <Field
            label="Specialization"
            placeholder="Designer, Developer, Marketer..."
            value={form.specialization}
            onChange={(v) => update("specialization", v)}
            error={errors.specialization}
          />

          <Button loading={loading} type="submit">
            {loading ? "Creating..." : "Create account"}
          </Button>
        </form>
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

function Field({ label, placeholder, type = "text", value, onChange, error }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={styles.label}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...styles.input, borderColor: error ? "#f87171" : "#1e293b" }}
      />
      {error && <span style={styles.error}>{error}</span>}
    </div>
  );
}

function Button({ onClick, children, loading, type = "button", style = {} }) {
  return (
    <button type={type} onClick={onClick} disabled={loading} style={{ ...styles.btn, ...style }}>
      {loading ? <span style={styles.spinner} /> : children}
    </button>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#080f1a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Sans', sans-serif",
    padding: "24px",
    position: "relative",
    overflow: "hidden",
  },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(163,230,53,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(163,230,53,0.04) 1px, transparent 1px)",
    backgroundSize: "48px 48px",
    pointerEvents: "none",
  },
  card: {
    width: "100%",
    maxWidth: 460,
    background: "rgba(15, 23, 42, 0.9)",
    border: "1px solid #1e293b",
    borderRadius: 20,
    padding: "40px 40px 36px",
    backdropFilter: "blur(20px)",
    boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(163,230,53,0.05)",
    animation: "fadeUp 0.5s ease both",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 28,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "linear-gradient(135deg, #a3e635, #65a30d)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: 20,
    color: "#f1f5f9",
    letterSpacing: "-0.5px",
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: 24,
    color: "#f1f5f9",
    letterSpacing: "-0.5px",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 28,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    animation: "fadeUp 0.3s ease both",
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: "#94a3b8",
  },
  input: {
    background: "#0f172a",
    border: "1.5px solid #1e293b",
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 14,
    color: "#f1f5f9",
    transition: "all 0.2s",
    width: "100%",
  },
  error: {
    fontSize: 12,
    color: "#f87171",
  },
  btn: {
    background: "#a3e635",
    color: "#0f172a",
    border: "none",
    borderRadius: 10,
    padding: "13px 20px",
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    transition: "all 0.2s",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46,
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    top: 36,
    background: "none",
    border: "none",
    color: "#475569",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  spinner: {
    width: 18,
    height: 18,
    border: "2px solid #0f172a",
    borderTop: "2px solid transparent",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    display: "inline-block",
  },
};

