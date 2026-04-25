import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

export default function LoginPage() {
  const introCanvasRef = useRef(null);
  const auroraCanvasRef = useRef(null);
  const introRef       = useRef(null);
  const appRef         = useRef(null);

  const [activeTab, setActiveTab] = useState("student");
  const [userId,    setUserId]    = useState("");
  const [password,  setPassword]  = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [errorMsg,  setErrorMsg]  = useState("");

  const navigate = useNavigate();

  // ── CINEMATIC INTRO (100% UNTOUCHED) ──
  useEffect(() => {
    const canvas = introCanvasRef.current;
    const ctx    = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const words = [
      "KNOWLEDGE","GRADES","CAMPUS","LECTURE","SEMESTER",
      "THESIS","RESEARCH","LIBRARY","STUDENT","FACULTY",
      "EXAM","DEGREE","ALUMNI","SCIENCE","ENGINEERING",
      "MATHEMATICS","BIOLOGY","PHYSICS","COMPUTER","ARTS",
      "FAST","NUCES","PORTAL","LEARNING","FUTURE",
      "ATTENDANCE","TRANSCRIPT","CREDITS","GPA","SCHEDULE",
    ];

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      word: words[Math.floor(Math.random() * words.length)],
      opacity: Math.random() * 0.4 + 0.05,
      speed:   Math.random() * 0.8 + 0.2,
      size:    Math.floor(Math.random() * 10) + 10,
      flicker: Math.random() * 0.025 + 0.005,
      hue: Math.random() > 0.6 ? "255,255,255" : Math.random() > 0.5 ? "100,180,255" : "60,140,255",
    }));

    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5,
      opacity: Math.random() * 0.6 + 0.1,
      twinkle: Math.random() * 0.02,
    }));

    let animId, frame = 0;
    const draw = () => {
      ctx.fillStyle = "rgba(0,4,14,0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      frame++;

      stars.forEach((s) => {
        s.opacity += s.twinkle * (Math.random() > 0.5 ? 1 : -1);
        s.opacity = Math.max(0.05, Math.min(0.8, s.opacity));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,210,255,${s.opacity})`;
        ctx.fill();
      });

      particles.forEach((p) => {
        p.y -= p.speed * 0.4;
        p.opacity += p.flicker * (Math.random() > 0.5 ? 1 : -1);
        p.opacity = Math.max(0.03, Math.min(0.55, p.opacity));
        if (p.y < -30) {
          p.y = canvas.height + 20;
          p.x = Math.random() * canvas.width;
          p.word = words[Math.floor(Math.random() * words.length)];
        }
        ctx.font = `${p.size}px 'Space Grotesk', sans-serif`;
        ctx.fillStyle = `rgba(${p.hue},${p.opacity})`;
        ctx.fillText(p.word, p.x, p.y);
      });

      const scanY = ((frame * 1.8) % (canvas.height + 60)) - 30;
      const g = ctx.createLinearGradient(0, scanY - 4, 0, scanY + 4);
      g.addColorStop(0, "transparent");
      g.addColorStop(0.5, "rgba(80,160,255,0.12)");
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(0, scanY - 4, canvas.width, 8);

      animId = requestAnimationFrame(draw);
    };
    ctx.fillStyle = "#00040e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    draw();

    const afterIntro = () => {
      cancelAnimationFrame(animId);
      gsap.set(introRef.current, { display: "none" });
      gsap.to(appRef.current, { opacity: 1, duration: 0.6 });
    };

    const tl = gsap.timeline({ delay: 0.4, onComplete: afterIntro });
    tl.to("#lp-intro-line",  { scaleX: 1, duration: 0.8, ease: "power3.out" }, 0)
      .to("#lp-intro-logo",  { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }, 0.5)
      .to("#lp-intro-logo",  { textShadow: "0 0 80px rgba(80,160,255,1), 0 0 160px rgba(40,100,255,0.8)", duration: 0.5 }, 1.0)
      .to("#lp-intro-sub",   { opacity: 1, y: 0, duration: 0.5 }, 1.1)
      .to("#lp-intro-uni",   { opacity: 1, duration: 0.4 }, 1.4)
      .to("#lp-intro-logo",  { scale: 50, opacity: 0, duration: 0.7, ease: "power4.in" }, 2.4)
      .to("#lp-intro-sub",   { opacity: 0, duration: 0.3 }, 2.4)
      .to("#lp-intro-uni",   { opacity: 0, duration: 0.3 }, 2.4)
      .to("#lp-intro-line",  { opacity: 0, duration: 0.3 }, 2.4)
      .to("#lp-intro-flash", { opacity: 1, duration: 0.08 }, 2.85)
      .to("#lp-intro-flash", { opacity: 0, duration: 0.4  }, 2.93)
      .to(introRef.current,  { opacity: 0, duration: 0.35 }, 2.88);

    return () => cancelAnimationFrame(animId);
  }, []);

  // ── AURORA MESH BACKGROUND ──
  useEffect(() => {
    const canvas = auroraCanvasRef.current;
    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");

    // Each blob: position, size, color, drift speed and phase
    const blobs = [
      { x: 0.15, y: 0.3,  r: 0.45, color: "26,100,255",   speed: 0.00018, phase: 0 },
      { x: 0.75, y: 0.6,  r: 0.5,  color: "64,169,255",   speed: 0.00013, phase: 1.2 },
      { x: 0.5,  y: 0.85, r: 0.4,  color: "10,60,180",    speed: 0.00022, phase: 2.4 },
      { x: 0.85, y: 0.15, r: 0.38, color: "100,60,255",   speed: 0.00016, phase: 0.7 },
      { x: 0.25, y: 0.75, r: 0.42, color: "0,180,255",    speed: 0.00019, phase: 3.1 },
      { x: 0.6,  y: 0.2,  r: 0.35, color: "20,40,140",    speed: 0.00014, phase: 1.8 },
    ];

    // Stars drawn once on a static layer
    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.2 + 0.2,
      o: Math.random() * 0.5 + 0.1,
      tw: (Math.random() - 0.5) * 0.008,
    }));

    let t = 0, animId;

    const draw = () => {
      animId = requestAnimationFrame(draw);
      t += 1;

      // Deep space base
      ctx.fillStyle = "#00040e";
      ctx.fillRect(0, 0, W, H);

      // Aurora blobs — each is a large soft radial gradient
      blobs.forEach((b) => {
        // Drift: each blob drifts in a slow elliptical path
        const ox = Math.sin(t * b.speed * Math.PI * 2 + b.phase) * 0.12;
        const oy = Math.cos(t * b.speed * Math.PI * 2 + b.phase * 0.7) * 0.08;

        const cx = (b.x + ox) * W;
        const cy = (b.y + oy) * H;
        const radius = b.r * Math.min(W, H);

        // Breathing: pulse opacity slowly
        const breathe = 0.055 + Math.sin(t * b.speed * Math.PI * 4 + b.phase) * 0.025;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0,   `rgba(${b.color},${breathe})`);
        grad.addColorStop(0.4, `rgba(${b.color},${breathe * 0.5})`);
        grad.addColorStop(1,   `rgba(${b.color},0)`);

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      });

      // Subtle horizontal aurora bands
      const bandY1 = H * (0.35 + Math.sin(t * 0.00025) * 0.08);
      const bandY2 = H * (0.65 + Math.cos(t * 0.0002)  * 0.06);

      [bandY1, bandY2].forEach((by, idx) => {
        const bh = H * 0.18;
        const bg = ctx.createLinearGradient(0, by - bh, 0, by + bh);
        bg.addColorStop(0,   "rgba(26,100,255,0)");
        bg.addColorStop(0.5, `rgba(26,100,255,${0.022 + idx * 0.008})`);
        bg.addColorStop(1,   "rgba(26,100,255,0)");
        ctx.fillStyle = bg;
        ctx.fillRect(0, by - bh, W, bh * 2);
      });

      // Twinkling stars on top
      stars.forEach((s) => {
        s.o = Math.max(0.05, Math.min(0.65, s.o + s.tw));
        if (Math.random() < 0.002) s.tw *= -1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,210,255,${s.o})`;
        ctx.fill();
      });

      // Very faint scanline overlay
      ctx.fillStyle = "rgba(0,4,14,0.08)";
      for (let y = 0; y < H; y += 4) {
        ctx.fillRect(0, y, W, 1);
      }
    };

    draw();

    const onResize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      stars.forEach(s => { s.x = Math.random() * W; s.y = Math.random() * H; });
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
  }, []);

  // ── SUBMIT HANDLER — role based routing ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const isStudent = activeTab === "student";
    const isTeacher = activeTab === "teacher";

    if (!userId.trim()) {
      setErrorMsg(`Please enter your ${isStudent ? "Student" : "Faculty"} ID.`);
      return;
    }
    if (!password.trim()) {
      setErrorMsg("Please enter your password.");
      return;
    }

    setLoading(true);
    await new Promise((res) => setTimeout(res, 1400));
    setLoading(false);

    if (isStudent) navigate("/student/dashboard");
    if (isTeacher) navigate("/teacher/dashboard");
  };

  return (
    <>
      {/* Overlays */}
      <div className="lp-scanlines" />
      <div className="lp-vignette"  />
      <div className="lp-corner tl" />
      <div className="lp-corner tr" />
      <div className="lp-corner bl" />
      <div className="lp-corner br" />

      {/* Aurora background canvas */}
      <canvas id="lp-aurora" ref={auroraCanvasRef} />

      {/* Intro (UNTOUCHED) */}
      <div id="lp-intro" ref={introRef}>
        <canvas id="lp-intro-canvas" ref={introCanvasRef} />
        <div id="lp-intro-line"  />
        <div id="lp-intro-logo">ARCH</div>
        <div id="lp-intro-sub">Student Portal</div>
        <div id="lp-intro-uni">FAST National University · Lahore</div>
        <div id="lp-intro-flash" />
      </div>

      {/* App */}
      <div id="lp-app" ref={appRef}>
        <div className="lp-card">
          <div className="lp-top-bar"   />
          <div className="lp-card-shine"/>

          {/* Branding */}
          <div className="lp-brand">
            <div className="lp-logo-box hov-target">A</div>
            <div className="lp-brand-text">
              <div className="lp-brand-name">ARCH</div>
              <div className="lp-brand-tagline">
                {activeTab === "student" ? "Student Portal" : activeTab === "teacher" ? "Faculty Portal" : "Admin Panel"} · FAST-NUCES
              </div>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="lp-tabs">
            {[
              { key: "student", label: "Student", icon: "🎓" },
              { key: "teacher", label: "Teacher", icon: "📖" },
              { key: "admin",   label: "Admin",   icon: "⚙️"  },
            ].map((t) => (
              <button
                key={t.key}
                className={`lp-tab hov-target${activeTab === t.key ? " active" : ""}`}
                onClick={() => { setActiveTab(t.key); setErrorMsg(""); setUserId(""); setPassword(""); }}
              >
                <span className="lp-tab-icon">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Student + Teacher share the same form — content changes dynamically */}
          {(activeTab === "student" || activeTab === "teacher") && (
            <>
              <div className="lp-form-head">
                <div className="lp-form-title">
                  Welcome back, <span>{activeTab === "student" ? "Scholar" : "Professor"}</span>
                </div>
                <div className="lp-form-sub">
                  {activeTab === "student"
                    ? "Sign in to access your academic portal"
                    : "Sign in to access your faculty dashboard"}
                </div>
              </div>

              {errorMsg && (
                <div className="lp-error-msg">
                  <span>⚠</span> {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} autoComplete="off">
                {/* ID Field */}
                <div className="lp-field">
                  <label className="lp-label" htmlFor="uid">
                    {activeTab === "student" ? "Student ID" : "Faculty ID"}
                  </label>
                  <div className="lp-input-wrap">
                    <span className="lp-input-icon">
                      {activeTab === "student" ? "🪪" : "🏛️"}
                    </span>
                    <input
                      id="uid"
                      className={`lp-input hov-target${errorMsg && !userId ? " error" : ""}`}
                      type="text"
                      placeholder={activeTab === "student" ? "e.g. 21K-3210" : "e.g. FAC-092"}
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="lp-field">
                  <label className="lp-label" htmlFor="pw">Password</label>
                  <div className="lp-input-wrap">
                    <span className="lp-input-icon">🔒</span>
                    <input
                      id="pw"
                      className={`lp-input hov-target${errorMsg && !password ? " error" : ""}`}
                      type={showPw ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="lp-pw-toggle hov-target"
                      onClick={() => setShowPw((v) => !v)}
                      tabIndex={-1}
                    >
                      {showPw ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="lp-btn hov-target"
                  disabled={loading}
                >
                  <div className="lp-btn-shine" />
                  {loading
                    ? <><span className="lp-spinner" />Authenticating…</>
                    : "Sign In →"
                  }
                </button>
              </form>
            </>
          )}

          {/* Admin — still coming soon */}
          {activeTab === "admin" && (
            <div className="lp-coming-soon">
              <div className="lp-cs-icon">⚙️</div>
              <div className="lp-cs-title">Admin Panel — Coming Soon</div>
              <div className="lp-cs-sub">This module is under development.</div>
            </div>
          )}

          {/* Footer */}
          <div className="lp-card-foot">
            Spring 2025 · FAST-NUCES Lahore · v1.0
          </div>
        </div>
      </div>
    </>
  );
}