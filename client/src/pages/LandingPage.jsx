import { useState } from "react";
import {useNavigate} from "react-router-dom"
import background from "../assets/tree_background.jpg"
import {
  ChevronDown,
  ArrowRight,
  Play,
  Layers,
} from "lucide-react";
import {
  ACCENT,
  FEATURES,
  STEPS,
  TABLE_ROWS,
  FAQS,
} from "../data/landingPageData";

/* ─────────────────────────────────────────────
   DESIGN TOKENS
   bg: #dfdfdf   accent: #000000 (solid black)
   text: #1a1a2e  muted: #6b7280
───────────────────────────────────────────── */

// ── Accordion FAQ Item ────────────────────────
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border rounded-xl overflow-hidden transition-all duration-300 bg-gray-400"
      style={{ borderColor: open ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.1)" }}
    >
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-left gap-4"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-[#1a1a2e] text-sm leading-snug">{q}</span>
        <ChevronDown
          size={18}
          className="flex-shrink-0 transition-transform duration-300"
          style={{
            color: ACCENT,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? 200 : 0 }}
      >
        <p className="px-6 pb-4 text-sm text-white leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

// ── Main Landing Page ─────────────────────────
export default function LandingPage() {

  const navigate = useNavigate()

  return (
    <div
      className="min-h-screen font-sans relative overflow-x-hidden"
      style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {/* Blurred background image layer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: -10,
          backgroundImage: `url(${background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(6px)",
          transform: "scale(1.05)",
          pointerEvents: "none",
        }}
      />
      {/* Semi-transparent white overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: -9,
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          pointerEvents: "none",
        }}
      />
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500;600&family=Syne:wght@600;700;800&display=swap');
        * { box-sizing: border-box; }
        .syne { font-family: 'Syne', sans-serif; }
        .mono { font-family: 'DM Mono', monospace; }
        @keyframes pulse-ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,0,0,0.25); }
          50% { box-shadow: 0 0 0 6px rgba(0,0,0,0); }
        }
        .pulse-ring { animation: pulse-ring 2.5s ease-in-out infinite; }
        .card-hover {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.12);
        }
        .btn-primary {
          background: #000;
          color: #fff;
          border: none;
          transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
        }
        .btn-primary:hover {
          opacity: 0.82;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.28);
        }
        .btn-outline {
          background: transparent;
          color: #1a1a2e;
          border: 1.5px solid rgba(26,26,46,0.28);
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
        }
        .btn-outline:hover {
          border-color: #000;
          background: rgba(0,0,0,0.05);
          transform: translateY(-1px);
        }
        .nav-link {
          color: #4b5563;
          font-size: 0.875rem;
          font-weight: 500;
          transition: color 0.18s;
        }
        .nav-link:hover { color: #000; }
      `}</style>

      {/* ── NAV ──────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4"
        style={{
          background: "transparent",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "#000" }}
          >
            <Layers size={16} className="text-white" />
          </div>
          <span className="syne font-700 text-lg tracking-tight text-[#1a1a2e]">Vektrix</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Features", "Docs", "Pricing"].map((l) => (
            <a key={l} href="#" className="nav-link">{l}</a>
          ))}
        </div>

        <button className="btn-primary pulse-ring px-5 py-2 rounded-lg text-sm font-semibold">
          Launch Canvas
        </button>
      </nav>

      {/* ── HERO — exactly 100vh, single column, dummy image right ── */}
      <section
        className="relative flex items-center"
        style={{ height: "calc(100vh - 57px)" }}
      >
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 h-full flex items-center">
          <div className="grid md:grid-cols-2 gap-12 items-center w-full">

            {/* Left — text content */}
            <div>
              {/* <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mono mb-6 uppercase tracking-widest"
                style={{
                  background: "rgba(0,0,0,0.07)",
                  color: "#000",
                  border: "1px solid rgba(0,0,0,0.15)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-black" />
                Built for Engineering &amp; Product Teams
              </div> */}

              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-800 leading-tight tracking-tight mb-6"
                style={{ color: "#1a1a2e", fontFamily: "Sora" }}
              >
                Where complex
                <br />
                <span style={{ color: "#000", fontStyle: "normal" }}>architectures</span>
                <br />
                become crystal clear.
              </h1>

              <p className="text-white text-lg leading-relaxed mb-8 max-w-md">
                A high-performance, real-time collaborative canvas designed for technical
                brainstorming, system design, and lightning-fast prototyping.{" "}
                <span className="font-semibold text-black">Zero friction. Infinite scale.</span>
              </p>

              <div className="flex flex-wrap gap-3">
                <button className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
                onClick={() => {navigate("/dashboard")}}
                >
                  Launch Canvas
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className="flex items-center gap-8 mt-10"
              >
                {[
                  { val: "50+", label: "Simultaneous users" },
                  { val: "<1ms", label: "Sync latency" },
                  { val: "∞", label: "Canvas scale" },
                ].map((s) => (
                  <div key={s.val}
                    style={{ fontFamily: "Sora" }}>
                    <div className="font-700 text-2xl text-black">{s.val}</div>
                    <div className="text-xs text-white mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — dummy placeholder image */}
            <div
              className="hidden md:flex w-full h-full items-center justify-center rounded-2xl overflow-hidden"
              style={{
                minHeight: 360,
                maxHeight: 480,
                background: "#c8c8c8",
                border: "1px solid rgba(0,0,0,0.1)",
              }}
            >
              {/* Placeholder graphic */}
              <div className="flex flex-col items-center gap-3 select-none">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="64" height="64" rx="16" fill="rgba(0,0,0,0.08)" />
                  <rect x="12" y="24" width="40" height="24" rx="4" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" fill="none" />
                  <circle cx="32" cy="20" r="6" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" fill="none" />
                  <line x1="20" y1="36" x2="44" y2="36" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
                  <line x1="20" y1="40" x2="36" y2="40" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
                </svg>
                <span
                  className="mono text-xs uppercase tracking-widest"
                  style={{ color: "rgba(0,0,0,0.3)" }}
                >
                  Image placeholder
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────── */}
      <section className="px-6 md:px-12 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="mono text-xs uppercase tracking-widest mb-3 text-black">
            Core Capabilities
          </p>
          <h2 className=" text-3xl md:text-4xl font-700 text-[#1a1a2e] leading-tight"
            style={{ fontFamily: "Sora" }}>
            Everything your engineering team needs
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="card-hover rounded-2xl p-6"
                style={{
                  background: "#ebebeb",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    background: "rgba(0,0,0,0.07)",
                    border: "1px solid rgba(0,0,0,0.1)",
                  }}
                >
                  <Icon size={20} color="#000" />
                </div>
                <h3 className=" font-700 text-[#1a1a2e] text-base mb-2 leading-snug"
                  style={{ fontFamily: "Sora" }}>
                  {f.title}
                </h3>
                <p className="text-sm text-white leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────── */}
      <section
        className="py-20 mb-24"
        style={{
          background: "rgba(0,0,0,0.035)",
          borderTop: "1px solid rgba(0,0,0,0.07)",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
        }}
      >
        <div className="px-6 md:px-12 max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="mono text-xs uppercase tracking-widest mb-3 text-black">
              Workflow
            </p>
            <h2 className="syne text-3xl md:text-4xl font-700 text-[#1a1a2e]">
              How it works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* connecting line */}
            <div
              className="hidden md:block absolute top-10 left-[calc(16.66%+16px)] right-[calc(16.66%+16px)] h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.2), transparent)" }}
            />

            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.num} className="relative text-center">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 relative z-10"
                    style={{
                      background: i === 1 ? "#000" : "#ebebeb",
                      border: i === 1 ? "none" : "1.5px solid rgba(0,0,0,0.1)",
                      boxShadow: i === 1 ? "0 12px 32px rgba(0,0,0,0.22)" : "none",
                    }}
                  >
                    <Icon size={28} color={i === 1 ? "#fff" : "#000"} />
                  </div>
                  <div className="mono text-xs font-600 mb-2 text-black">
                    STEP {s.num}
                  </div>
                  <h3 className="font-700 text-black text-lg mb-2"
                    style={{ fontFamily: "Sora" }}>{s.title}</h3>
                  <p className="text-sm text-white leading-relaxed max-w-xs mx-auto">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ─────────────────────── */}
      <section className="px-6 md:px-12 mb-24 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="mono text-xs uppercase tracking-widest mb-3 text-black">
            Technical Edge
          </p>
          <h2 className="syne text-3xl md:text-4xl font-700 text-[#1a1a2e]">
            Micro-utilities that matter
          </h2>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            border: "1px solid rgba(0,0,0,0.1)",
            background: "#ebebeb",
          }}
        >
          {/* header */}
          <div
            className="grid grid-cols-3 px-6 py-3 text-xs font-semibold mono uppercase tracking-wider"
            style={{
              background: "rgba(0,0,0,0.06)",
              borderBottom: "1px solid rgba(0,0,0,0.07)",
              color: "#000",
            }}
          >
            <span>Capability</span>
            <span>What it does</span>
            <span>Your benefit</span>
          </div>

          {TABLE_ROWS.map((row, i) => {
            const Icon = row.icon;
            return (
              <div
                key={row.feature}
                className="grid grid-cols-3 px-6 py-5 gap-4 items-start transition-colors hover:bg-black/5"
                style={{
                  borderBottom: i < TABLE_ROWS.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.1)" }}
                  >
                    <Icon size={14} color="#000" />
                  </div>
                  <span className="font-semibold text-[#1a1a2e] text-sm">{row.feature}</span>
                </div>
                <p className="text-sm text-white leading-relaxed">{row.detail}</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-black" />
                  <p className="text-sm font-medium text-[#1a1a2e]">{row.benefit}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FOOTER CTA ───────────────────────────── */}
      <section className="px-6 md:px-12 mb-24 max-w-5xl mx-auto">
        <div
          className="rounded-3xl p-12 text-center relative overflow-hidden"
          style={{
            background: "#111",
            boxShadow: "0 32px 64px rgba(0,0,0,0.18)",
          }}
        >
          {/* dot grid overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
            <defs>
              <pattern id="dot2" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot2)" />
          </svg>

          <div className="relative z-10">
            <p className="mono text-xs uppercase tracking-widest mb-4 text-white">
              Get Started Today
            </p>
            <h2 className="syne text-3xl md:text-5xl font-800 text-white leading-tight mb-4">
              Stop explaining it in text.
              <br />
              <span className="text-white">Draw it together.</span>
            </h2>
            <p className="text-zinc-400 text-base mb-8 max-w-md mx-auto">
              Join thousands of developers mapping the future of software, one pixel at a time.
            </p>
            <button
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-black bg-white transition-all hover:scale-105 active:scale-100"
              style={{ boxShadow: "0 8px 32px rgba(255,255,255,0.14)" }}
              onClick={() => {navigate("/dashboard")}}
            >
              Open Your First Board Now
              <ArrowRight size={18} />
            </button>
            <p className="text-zinc-600 text-xs mt-4">No credit card required · Free forever plan</p>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────── */}
      <section className="px-6 md:px-12 mb-24 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="mono text-xs uppercase tracking-widest mb-3 text-black">
            FAQ
          </p>
          <h2 className="syne text-3xl md:text-4xl font-700 text-[#1a1a2e]">
            Common questions
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {FAQS.map((f) => (
            <FAQItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────── */}
      <footer
        className="px-6 md:px-12 py-8"
        style={{ borderTop: "1px solid rgba(0,0,0,0.09)" }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center bg-black">
              <Layers size={12} className="text-white" />
            </div>
            <span className="syne font-700 text-sm text-black">Vektrix</span>
          </div>
          <p className="text-xs text-white mono">
            © 2025 Vektrix Inc. Built for builders.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Status", "GitHub"].map((l) => (
              <a key={l} href="#" className="text-xs text-white hover:text-white transition-colors">
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}