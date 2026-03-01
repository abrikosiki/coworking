"use client";
import { useEffect, useRef } from "react";

export default function QRDisplayPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const checkinUrl = typeof window !== "undefined" ? `${window.location.origin}/checkin` : "";

  const generateQR = (text: string, canvas: HTMLCanvasElement) => {
    // Simple QR code using a public API rendered on canvas via image
    const size = 280;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&bgcolor=0f172a&color=a3e635&margin=10`;
    img.onload = () => ctx.drawImage(img, 0, 0);
  };

  useEffect(() => {
    if (!canvasRef.current || !checkinUrl) return;
    generateQR(checkinUrl, canvasRef.current);
  }, [checkinUrl]);

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

        <h1 style={s.title}>Scan to check in</h1>
        <p style={s.subtitle}>Point your phone camera at the QR code</p>

        <div style={s.qrWrap}>
          <canvas ref={canvasRef} style={s.canvas} />
        </div>

        <div style={s.urlBox}>
          <span style={s.urlText}>{checkinUrl}</span>
        </div>

        <p style={s.hint}>
          Place this screen or print at the coworking entrance
        </p>

        <button onClick={() => window.print()} style={s.printBtn}>
          🖨️ Print QR code
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @media print {
          body { background: white; }
          button { display: none !important; }
        }
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
    width: "100%", maxWidth: 420,
    background: "rgba(15,23,42,0.9)", border: "1px solid #1e293b",
    borderRadius: 24, padding: "40px 36px",
    backdropFilter: "blur(20px)",
    boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
    animation: "fadeUp 0.5s ease both",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
    textAlign: "center",
  },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: {
    width: 32, height: 32, borderRadius: 8,
    background: "linear-gradient(135deg, #a3e635, #65a30d)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  logoText: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#f1f5f9" },
  title: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26, color: "#f1f5f9", letterSpacing: "-0.5px" },
  subtitle: { fontSize: 14, color: "#64748b" },
  qrWrap: {
    background: "#0f172a", borderRadius: 16, padding: 16,
    border: "1px solid #1e293b",
    boxShadow: "0 0 40px rgba(163,230,53,0.1)",
  },
  canvas: { display: "block", borderRadius: 8 },
  urlBox: {
    background: "#0f172a", border: "1px solid #1e293b",
    borderRadius: 8, padding: "8px 16px", width: "100%",
  },
  urlText: { fontSize: 11, color: "#475569", fontFamily: "monospace", wordBreak: "break-all" },
  hint: { fontSize: 13, color: "#334155", lineHeight: 1.5 },
  printBtn: {
    background: "transparent", border: "1.5px solid #1e293b",
    borderRadius: 10, padding: "10px 20px",
    color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer", width: "100%",
  },
};
