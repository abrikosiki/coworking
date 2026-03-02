"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

const steps = [
  { id: 1, label: "Account" },
  { id: 2, label: "Coworking" },
  { id: 3, label: "Done" },
];

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M4 10l4.5 4.5L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

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

export default function AdminRegister() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    coworkingName: "", city: "", address: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const update = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: "" }));
    setServerError("");
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Enter your name";
    if (!form.email.includes("@")) e.email = "Invalid email";
    if (form.password.length < 8) e.password = "Minimum 8 characters";
    return e;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.coworkingName.trim()) e.coworkingName = "Enter coworking name";
    if (!form.city.trim()) e.city = "Enter city";
    if (!form.address.trim()) e.address = "Enter address";
    return e;
  };

  const handleNext = async () => {
    if (step === 1) {
      const e = validateStep1();
      if (Object.keys(e).length) { setErrors(e); return; }
      setStep(2);
      return;
    }

    if (step === 2) {
      const e = validateStep2();
      if (Object.keys(e).length) { setErrors(e); return; }

      setLoading(true);
      setServerError("");

      try {
        // 1. Create user in Supabase auth (or sign in if already exists)
        let userId: string;

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { name: form.name } }
        });

        if (authError) {
          // User already exists — try signing in to continue setup
          if (authError.message.toLowerCase().includes("already registered")) {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: form.email,
              password: form.password,
            });
            if (signInError) throw new Error("Account exists. Wrong password?");
            if (!signInData.user) throw new Error("Failed to sign in");
            userId = signInData.user.id;
          } else {
            throw new Error(authError.message);
          }
        } else {
          if (!authData.user) throw new Error("Failed to create account");
          userId = authData.user.id;
        }

        // 2. Create or update profile with admin role
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: userId,
            name: form.name,
            role: "admin",
          });

        if (profileError) throw new Error(profileError.message);

        // 3. Create coworking
        const { error: coworkingError } = await supabase
          .from("coworkings")
          .insert({
            name: form.coworkingName,
            city: form.city,
            address: form.address,
            owner_id: userId,
          });

        if (coworkingError) throw new Error(coworkingError.message);

        window.location.href = "/dashboard";
      } catch (err: unknown) {
        setServerError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={s.page}>
      <div style={s.grid} />

      <div style={s.card}>
        <div style={s.topRow}>
          <div style={s.logo}>
            <div style={s.logoIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
            </div>
            <span style={s.logoText}>CoWork</span>
          </div>
          <button
            type="button"
            onClick={() => window.history.back()}
            style={s.topBackBtn}
          >
            ← Back
          </button>
        </div>

        {step < 3 && (
          <>
            <h1 style={s.title}>Register your coworking</h1>
            <p style={s.subtitle}>Set up your space in 2 minutes</p>

            <div style={s.stepsRow}>
              {steps.slice(0, 2).map((st, i) => (
                <div key={st.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    ...s.stepDot,
                    background: step > st.id ? "#a3e635" : step === st.id ? "#a3e635" : "transparent",
                    border: step >= st.id ? "2px solid #a3e635" : "2px solid #334155",
                    color: step >= st.id ? "#0f172a" : "#64748b",
                  }}>
                    {step > st.id ? <CheckIcon /> : st.id}
                  </div>
                  <span style={{ ...s.stepLabel, color: step >= st.id ? "#e2e8f0" : "#475569" }}>{st.label}</span>
                  {i === 0 && <div style={s.stepLine} />}
                </div>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <div style={s.form}>
            <Field label="Your name" placeholder="Anna Smith" value={form.name} onChange={v => update("name", v)} error={errors.name} />
            <Field label="Email" placeholder="anna@cowork.com" type="email" value={form.email} onChange={v => update("email", v)} error={errors.email} />
            <div style={{ position: "relative" }}>
              <Field label="Password" placeholder="At least 8 characters"
                type={showPassword ? "text" : "password"} value={form.password}
                onChange={v => update("password", v)} error={errors.password} />
              <button onClick={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
                <EyeIcon open={showPassword} />
              </button>
            </div>
            <Btn onClick={handleNext}>Continue →</Btn>
            <p style={s.loginLink}>Already have an account? <a href="/login" style={s.link}>Sign in</a></p>
          </div>
        )}

        {step === 2 && (
          <div style={s.form}>
            <Field label="Coworking name" placeholder="e.g. WorkHub London" value={form.coworkingName} onChange={v => update("coworkingName", v)} error={errors.coworkingName} />
            <Field label="City" placeholder="London" value={form.city} onChange={v => update("city", v)} error={errors.city} />
            <Field label="Address" placeholder="123 Main Street" value={form.address} onChange={v => update("address", v)} error={errors.address} />

            {serverError && (
              <div style={s.errorBox}>⚠️ {serverError}</div>
            )}

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setStep(1)} style={s.backBtn}>← Back</button>
              <Btn onClick={handleNext} loading={loading} flex>
                {loading ? "Creating..." : "Register"}
              </Btn>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={s.success}>
            <div style={s.successIcon}><CheckIcon /></div>
            <h2 style={s.successTitle}>Coworking created!</h2>
            <p style={s.successText}>
              <strong style={{ color: "#a3e635" }}>{form.coworkingName}</strong> has been registered.<br />
              Check <strong style={{ color: "#e2e8f0" }}>{form.email}</strong> to confirm your account.
            </p>
            <Btn onClick={() => window.location.href = "/dashboard"}>Go to dashboard →</Btn>
          </div>
        )}
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

function Field({ label, placeholder, type = "text", value, onChange, error }: {
  label: string; placeholder: string; type?: string;
  value: string; onChange: (v: string) => void; error?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={s.label}>{label}</label>
      <input type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        style={{ ...s.input, borderColor: error ? "#f87171" : "#1e293b" }} />
      {error && <span style={s.error}>{error}</span>}
    </div>
  );
}

function Btn({ onClick, children, loading, flex }: {
  onClick: () => void; children: React.ReactNode; loading?: boolean; flex?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={loading} style={{ ...s.btn, flex: flex ? 1 : undefined }}>
      {loading ? <span style={s.spinner} /> : children}
    </button>
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
    width: "100%", maxWidth: 460,
    background: "rgba(15, 23, 42, 0.9)", border: "1px solid #1e293b",
    borderRadius: 20, padding: "40px 40px 36px",
    backdropFilter: "blur(20px)",
    boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
    animation: "fadeUp 0.5s ease both",
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
    gap: 12,
  },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: {
    width: 36, height: 36, borderRadius: 10,
    background: "linear-gradient(135deg, #a3e635, #65a30d)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  logoText: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: "#f1f5f9" },
  topBackBtn: {
    background: "transparent",
    border: "1px solid #1e293b",
    borderRadius: 999,
    padding: "6px 12px",
    fontSize: 12,
    color: "#64748b",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  title: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 24, color: "#f1f5f9", letterSpacing: "-0.5px", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#64748b", marginBottom: 28 },
  stepsRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 28 },
  stepDot: {
    width: 28, height: 28, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 700, transition: "all 0.3s", flexShrink: 0,
  },
  stepLabel: { fontSize: 13, fontWeight: 500, transition: "color 0.3s" },
  stepLine: { flex: 1, height: 1, background: "#1e293b", minWidth: 24 },
  form: { display: "flex", flexDirection: "column", gap: 16, animation: "fadeUp 0.3s ease both" },
  label: { fontSize: 13, fontWeight: 500, color: "#94a3b8" },
  input: {
    background: "#0f172a", border: "1.5px solid #1e293b", borderRadius: 10,
    padding: "11px 14px", fontSize: 14, color: "#f1f5f9", transition: "all 0.2s", width: "100%",
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
  backBtn: {
    background: "transparent", border: "1.5px solid #1e293b", borderRadius: 10,
    padding: "13px 16px", color: "#64748b", fontSize: 14, cursor: "pointer", whiteSpace: "nowrap",
  },
  eyeBtn: {
    position: "absolute", right: 12, top: 36,
    background: "none", border: "none", color: "#475569", cursor: "pointer",
    display: "flex", alignItems: "center",
  },
  loginLink: { textAlign: "center", fontSize: 13, color: "#475569" },
  link: { color: "#a3e635", textDecoration: "none", fontWeight: 500 },
  spinner: {
    width: 18, height: 18, border: "2px solid #0f172a",
    borderTop: "2px solid transparent", borderRadius: "50%",
    animation: "spin 0.7s linear infinite", display: "inline-block",
  },
  success: { display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center", padding: "8px 0", animation: "fadeUp 0.4s ease both" },
  successIcon: {
    width: 56, height: 56, borderRadius: "50%",
    background: "linear-gradient(135deg, #a3e635, #65a30d)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#0f172a", boxShadow: "0 0 30px rgba(163,230,53,0.3)",
  },
  successTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26, color: "#f1f5f9" },
  successText: { fontSize: 14, color: "#64748b", lineHeight: 1.7 },
};
