import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { gsap } from "gsap";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";

import "./TeacherDashV1.css"; // Core shell layout
import "./TeacherGradebook.css"; // Gradebook specifics

// ── DATA ────────────────────────────────────────────────────────────────────
const SECTIONS_DATA = {
  "CS-3001": {
    name: "Object Oriented Analysis & Design",
    code: "CS-3001 · Sec A",
    assessments: [
      { key: "q1",   label: "Q1",   max: 10 },
      { key: "q2",   label: "Q2",   max: 10 },
      { key: "asgn", label: "ASGN", max: 20 },
      { key: "mid",  label: "MID",  max: 30 },
      { key: "final",label: "FIN",  max: 50 },
    ],
    students: [
      { id: "21K-3001", name: "Ali Khan",      init: "AK", att: "92%", attCls: "att-ok",   scores: { q1: 9,  q2: 8,  asgn: 18, mid: 25, final: null } },
      { id: "21K-3045", name: "Sara Ahmed",    init: "SA", att: "85%", attCls: "att-ok",   scores: { q1: 7,  q2: 9,  asgn: 17, mid: 22, final: null } },
      { id: "21K-3112", name: "Usman Tariq",   init: "UT", att: "74%", attCls: "att-warn", scores: { q1: 5,  q2: 6,  asgn: 12, mid: 16, final: null } },
      { id: "21K-3198", name: "Hira Baig",     init: "HB", att: "96%", attCls: "att-ok",   scores: { q1: 10, q2: 10, asgn: 19, mid: 27, final: null } },
      { id: "21K-3210", name: "Zain Raza",     init: "ZR", att: "61%", attCls: "att-bad",  scores: { q1: 4,  q2: 5,  asgn: 10, mid: 13, final: null } },
      { id: "21K-3277", name: "Mehwish Noor",  init: "MN", att: "88%", attCls: "att-ok",   scores: { q1: 8,  q2: 7,  asgn: 16, mid: 24, final: null } },
      { id: "21K-3340", name: "Bilal Hassan",  init: "BH", att: "79%", attCls: "att-warn", scores: { q1: 6,  q2: 8,  asgn: 14, mid: 19, final: null } },
    ],
  },
  "CS-2010": {
    name: "Data Structures & Algorithms",
    code: "CS-2010 · Sec B",
    assessments: [
      { key: "q1",   label: "Q1",   max: 10 },
      { key: "q2",   label: "Q2",   max: 10 },
      { key: "asgn", label: "ASGN", max: 20 },
      { key: "mid",  label: "MID",  max: 30 },
      { key: "final",label: "FIN",  max: 50 },
    ],
    students: [
      { id: "22K-4011", name: "Bilal Hasan",   init: "BH", att: "78%", attCls: "att-warn", scores: { q1: 7,  q2: 8,  asgn: 15, mid: 20, final: null } },
      { id: "22K-4099", name: "Maha Syed",     init: "MS", att: "82%", attCls: "att-ok",   scores: { q1: 9,  q2: 8,  asgn: 18, mid: 24, final: null } },
      { id: "22K-4130", name: "Hamza Qureshi", init: "HQ", att: "91%", attCls: "att-ok",   scores: { q1: 10, q2: 9,  asgn: 19, mid: 27, final: null } },
      { id: "22K-4202", name: "Ayesha Malik",  init: "AM", att: "67%", attCls: "att-bad",  scores: { q1: 4,  q2: 6,  asgn: 11, mid: 15, final: null } },
    ],
  },
};

// ── GRADE CALC ────────────────────────────────────────────────────────────
function computeTotal(scores, assessments) {
  return assessments.reduce((sum, a) => {
    const v = scores[a.key];
    return sum + (v !== null && v !== "" ? Number(v) : 0);
  }, 0);
}
function maxTotal(assessments) {
  return assessments.reduce((s, a) => s + a.max, 0);
}
function getGrade(pct) {
  if (pct >= 90) return "A+";
  if (pct >= 85) return "A";
  if (pct >= 80) return "B+";
  if (pct >= 70) return "B";
  if (pct >= 65) return "C+";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  return "F";
}
function gradeClass(g) {
  return "grade-" + g.replace("+", "-plus");
}

// ── CUSTOM SMOOTH COUNTER HOOK ──
function AnimatedCounter({ value, decimals = 0, suffix = "", duration = 1.2, delay = 0 }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => latest.toFixed(decimals) + suffix);

  useEffect(() => {
    const controls = animate(count, value, { 
      duration: duration, 
      delay: delay, 
      ease: [0.34, 1.56, 0.64, 1] 
    });
    return controls.stop;
  }, [value, duration, delay, count]);

  return <motion.span>{rounded}</motion.span>;
}

// ── COMPONENT ─────────────────────────────────────────────────────────────
export default function TeacherGradebook() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const webglRef  = useRef(null);
  const introCanvasRef = useRef(null);
  const introRef  = useRef(null);
  const appRef    = useRef(null);
  const sidebarRef = useRef(null);
  const topbarRef = useRef(null);
  const [collapse, setCollapse] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const [activeSection, setActiveSection] = useState("CS-3001");
  const [scores, setScores]  = useState(() => {
    const out = {};
    Object.entries(SECTIONS_DATA).forEach(([sec, data]) => {
      out[sec] = {};
      data.students.forEach(s => { out[sec][s.id] = { ...s.scores }; });
    });
    return out;
  });
  const [unsaved, setUnsaved]   = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [search, setSearch]     = useState("");

  const sectionData  = SECTIONS_DATA[activeSection];
  const assessments  = sectionData.assessments;
  const maxPts       = maxTotal(assessments);

  // ── FILTER STUDENTS ──
  const students = sectionData.students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  // ── SCORE EDIT ──
  const handleScore = useCallback((studentId, key, val, max) => {
    const num = val === "" ? null : Math.min(Number(val), max);
    setScores(prev => ({
      ...prev,
      [activeSection]: {
        ...prev[activeSection],
        [studentId]: { ...prev[activeSection][studentId], [key]: num },
      },
    }));
    setUnsaved(true);
  }, [activeSection]);

  // ── SAVE ──
  const handleSave = () => {
    setUnsaved(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  // ── GRADE DISTRIBUTION ──
  const distribution = (() => {
    let A=0, B=0, C=0, DF=0;
    students.forEach(s => {
      const total = computeTotal(scores[activeSection][s.id], assessments);
      const pct   = (total / maxPts) * 100;
      const g     = getGrade(pct);
      if      (g === "A+" || g === "A")  A++;
      else if (g === "B+" || g === "B")  B++;
      else if (g === "C+" || g === "C")  C++;
      else                               DF++;
    });
    const n = students.length || 1;
    return { A, B, C, DF, n };
  })();

  // ── SUMMARY STATS ──
  const avgScore = (() => {
    if (!students.length) return 0;
    const sum = students.reduce((acc, s) => acc + computeTotal(scores[activeSection][s.id], assessments), 0);
    return ((sum / students.length / maxPts) * 100);
  })();
  const highestScore = (() => {
    if (!students.length) return 0;
    return students.reduce((mx, s) => {
      const t = computeTotal(scores[activeSection][s.id], assessments);
      return t > mx ? t : mx;
    }, 0);
  })();
  const passingCount = students.filter(s => {
    const pct = (computeTotal(scores[activeSection][s.id], assessments) / maxPts) * 100;
    return pct >= 50;
  }).length;

  // ── CINEMATIC INTRO ──
  useEffect(() => {
    const hasPlayedIntro = sessionStorage.getItem("archTeacherIntroPlayed");
    if (hasPlayedIntro) {
      introRef.current.style.display = "none";
      appRef.current.style.opacity = 1;
      sidebarRef.current.style.transform = "translateX(0)";
      topbarRef.current.style.opacity = 1;
      setShowStats(true);
      if (webglRef.current) {
        webglRef.current.style.opacity = 0;
        webglRef.current.style.display = "none";
      }
      return; 
    }

    const canvas = introCanvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;

    const words = ["FACULTY","TEACHING","SYLLABUS","LECTURE","SEMESTER","RESEARCH","PUBLICATIONS","ALERTS","STUDENT","GRADES","EXAM","EVALUATION","RUBRIC"];
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      word: words[Math.floor(Math.random() * words.length)],
      opacity: Math.random() * 0.4 + 0.05, speed: Math.random() * 0.8 + 0.2,
      size: Math.floor(Math.random() * 10) + 10, flicker: Math.random() * 0.025 + 0.005,
      hue: Math.random() > 0.6 ? "255,255,255" : "60,140,255",
    }));

    let animId;
    const draw = () => {
      ctx.fillStyle = "rgba(0,4,14,0.18)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.y -= p.speed * 0.4; p.opacity += p.flicker * (Math.random() > 0.5 ? 1 : -1);
        p.opacity = Math.max(0.03, Math.min(0.55, p.opacity));
        if (p.y < -30) { p.y = canvas.height + 20; p.x = Math.random() * canvas.width; p.word = words[Math.floor(Math.random() * words.length)]; }
        ctx.font = `${p.size}px 'Inter', sans-serif`; 
        ctx.fillStyle = `rgba(${p.hue},${p.opacity})`;
        ctx.fillText(p.word, p.x, p.y);
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    const afterIntro = () => {
      cancelAnimationFrame(animId);
      sessionStorage.setItem("archTeacherIntroPlayed", "true"); 
      gsap.set(introRef.current, { display: "none" });
      gsap.to(appRef.current, { opacity: 1, duration: 0.6 });
      gsap.to(sidebarRef.current, { x: 0, duration: 1.2, ease: "expo.out" });
      gsap.to(topbarRef.current, { opacity: 1, duration: 0.7 });
      
      setTimeout(() => setShowStats(true), 600);

      gsap.to(webglRef.current, { opacity: 0, duration: 2.5, ease: "power2.inOut", delay: 0.5 });
      setTimeout(() => { if (webglRef.current) webglRef.current.style.display = "none"; }, 3000);
    };

    const tl = gsap.timeline({ delay: 0.4, onComplete: afterIntro });
    tl.to("#intro-line", { scaleX: 1, duration: 0.8, ease: "power3.out" }, 0)
      .to("#intro-logo", { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }, 0.5)
      .to("#intro-logo", { scale: 50, opacity: 0, duration: 0.7, ease: "power4.in" }, 2.4)
      .to("#intro-line", { opacity: 0, duration: 0.3 }, 2.4)
      .to(introRef.current, { opacity: 0, duration: 0.35 }, 2.88);

    return () => cancelAnimationFrame(animId);
  }, []);

  // ── THREE.JS BACKGROUND ──
  useEffect(() => {
    if (sessionStorage.getItem("archTeacherIntroPlayed")) return;
    const canvas = webglRef.current;
    if (!canvas) return;
    let W = window.innerWidth, H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H); renderer.setClearColor(0xf4f8ff, 1);
    const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 200); camera.position.set(0, 2, 10);
    scene.add(new THREE.AmbientLight(0x0033aa, 0.8));
    let nmx = 0, nmy = 0; const onMove = (e) => { nmx = (e.clientX / W) * 2 - 1; nmy = -(e.clientY / H) * 2 + 1; }; document.addEventListener("mousemove", onMove);
    let animId;
    const loop = () => {
      animId = requestAnimationFrame(loop); camera.position.x += (nmx * 0.6 - camera.position.x) * 0.015; camera.position.y += (nmy * 0.4 + 2 - camera.position.y) * 0.015; camera.lookAt(0, 0, 0); renderer.render(scene, camera);
    };
    loop(); return () => { cancelAnimationFrame(animId); document.removeEventListener("mousemove", onMove); };
  }, []);

  return (
    <>
      <div className="mesh-bg">
        <div className="mesh-blob blob-1" />
        <div className="mesh-blob blob-2" />
        <div className="mesh-blob blob-3" />
      </div>

      <canvas id="webgl" ref={webglRef} />

      <div id="intro" ref={introRef}>
        <canvas id="intro-canvas" ref={introCanvasRef} />
        <div id="intro-line" />
        <div id="intro-logo">ARCH</div>
      </div>

      <div id="app" ref={appRef} style={{ opacity: 1 }}>
        
        {/* ── SIDEBAR ── */}
        <nav id="sidebar" ref={sidebarRef} className={collapse ? "collapse" : ""}>
          <div className="sb-top-bar" />
          <button className="sb-toggle hov-target" onClick={() => setCollapse(c => !c)}>
            <span /><span /><span />
          </button>
          <div className="sb-logo">
            <div className="logo-box">A</div>
            <div><div className="logo-name">ARCH</div><div className="logo-tagline">Faculty Portal</div></div>
          </div>
          <div className="sb-user hov-target" onClick={() => navigate('/teacher/profile')}>
            <div className="uav">Dr.</div>
            <div><div className="uname">Dr. Ahmed</div><div className="uid">EMP-8492</div></div>
          </div>
          {[
            ["Overview", [["⊞","Dashboard","/teacher/dashboard"]]],
            ["Management",[["◈","My Sections","/teacher/sections"],["▦","Gradebook","/teacher/gradebook"],["✓","Attendance","/teacher/attendance"],["▤","Schedule","/teacher/schedule"]]],
            ["Communication",[["◉","Broadcasts","/teacher/alerts"]]],
            ["Account",[["◌","Profile","/teacher/profile"]]],
          ].map(([sec, items]) => (
            <div key={sec}>
              <div className="nav-sec">{sec}</div>
              {items.map(([ic, label, path]) => (
                <div
                  key={label}
                  className={`ni hov-target ${location.pathname === path ? " active" : ""}`}
                  onClick={() => navigate(path)}
                >
                  <div className="ni-ic">{ic}</div>{label}
                  {label === "Broadcasts" && <span className="nbadge">2</span>}
                </div>
              ))}
            </div>
          ))}
          <div className="sb-foot">Spring 2025 · FAST-NUCES</div>
        </nav>

        {/* ── MAIN ── */}
        <div id="main">
          <div id="topbar" ref={topbarRef}>
            <div className="tb-glow" />
            <div className="pg-title"><span>Gradebook</span></div>
            <div className="tb-r">
              <AnimatePresence>
                {unsaved && (
                  <motion.div initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.8}} className="gb-unsaved-badge">
                    <span className="gb-unsaved-dot" />
                    UNSAVED CHANGES
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div whileHover={{ scale: 1.05 }} className="sem-chip">Spring 2025</motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="notif-bell">🔔<span className="notif-dot"/></motion.div>
            </div>
          </div>

          <div id="scroll">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="dash-container"
            >

              {/* ── CONTROLS ── */}
              <div className="gb-controls">
                <div className="marks-tab-container">
                  {Object.keys(SECTIONS_DATA).map(sec => (
                    <motion.button
                      key={sec}
                      className={`marks-tab ${activeSection === sec ? "active" : ""}`}
                      onClick={() => { setActiveSection(sec); setSearch(""); }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {sec}
                    </motion.button>
                  ))}
                </div>

                <div className="gb-right-controls">
                  <div className="gb-search">
                    <span>🔍</span>
                    <input
                      placeholder="Search student…"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="gb-btn-export" onClick={() => {}}>
                    ↓ Export CSV
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`gb-btn-save ${unsaved ? "active-save" : ""}`} onClick={handleSave} disabled={!unsaved}>
                    ✓ Save Grades
                  </motion.button>
                </div>
              </div>

              {/* ── SUMMARY STRIP ── */}
              <div className="gb-summary">
                <motion.div className="glass-card gb-stat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <div className="gb-stat-label">Class Average</div>
                  <div className={`gb-stat-value ${parseFloat(avgScore) >= 70 ? "green" : parseFloat(avgScore) >= 50 ? "amber" : "red"}`}>
                    {showStats ? <AnimatedCounter value={avgScore} decimals={1} suffix="%" /> : "0.0%"}
                  </div>
                  <div className="gb-stat-sub">out of {maxPts} pts</div>
                </motion.div>
                <motion.div className="glass-card gb-stat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <div className="gb-stat-label">Students</div>
                  <div className="gb-stat-value">
                    {showStats ? <AnimatedCounter value={sectionData.students.length} /> : "0"}
                  </div>
                  <div className="gb-stat-sub">{sectionData.code}</div>
                </motion.div>
                <motion.div className="glass-card gb-stat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <div className="gb-stat-label">Passing</div>
                  <div className="gb-stat-value green">
                    {showStats ? <AnimatedCounter value={passingCount} /> : "0"}
                  </div>
                  <div className="gb-stat-sub">≥ 50% threshold</div>
                </motion.div>
                <motion.div className="glass-card gb-stat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <div className="gb-stat-label">Highest Score</div>
                  <div className="gb-stat-value">
                    {showStats ? <AnimatedCounter value={highestScore} /> : "0"}
                  </div>
                  <div className="gb-stat-sub">out of {maxPts} pts</div>
                </motion.div>
              </div>

              {/* ── GRADEBOOK TABLE ── */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  className="glass-card gb-table-wrap"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="panel-header" style={{ marginBottom: '24px' }}>
                    <h2 className="ct"><div className="ctbar"/>Assessment Entry</h2>
                  </div>

                  {/* HEADER */}
                  <div className="gb-table-head">
                    <div className="gb-col-hd left">Roll No.</div>
                    <div className="gb-col-hd left">Student Identity</div>
                    {assessments.map(a => (
                      <div key={a.key} className="gb-col-hd editable-hd">
                        {a.label}
                        <span className="hd-max">/{a.max}</span>
                      </div>
                    ))}
                    <div className="gb-col-hd">Total</div>
                    <div className="gb-col-hd">Grade</div>
                  </div>

                  {/* ROWS */}
                  <div className="gb-roster">
                    {students.length === 0 ? (
                      <div style={{ padding: "40px", textAlign: "center", color: "var(--dimmer)", fontSize: 16 }}>
                        No students match "{search}"
                      </div>
                    ) : students.map((s, idx) => {
                      const rowScores = scores[activeSection][s.id];
                      const total     = computeTotal(rowScores, assessments);
                      const pct       = (total / maxPts) * 100;
                      const grade     = getGrade(pct);

                      return (
                        <motion.div
                          className="gb-row hov-target"
                          key={s.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: idx * 0.05 }}
                          whileHover={{ backgroundColor: "rgba(26,100,255,0.05)" }}
                        >
                          {/* Roll */}
                          <div className="gb-cell left gb-roll">{s.id}</div>

                          {/* Name */}
                          <div className="gb-cell left">
                            <div className="gb-name-cell">
                              <div className="gb-avatar">{s.init}</div>
                              <div>
                                <div className="gb-student-name">{s.name}</div>
                                <div className="gb-student-att">
                                  Att: <span className={s.attCls}>{s.att}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Score Inputs */}
                          {assessments.map(a => {
                            const val = rowScores[a.key];
                            const isInvalid = val !== null && val !== "" && (Number(val) > a.max || Number(val) < 0);
                            return (
                              <div className="gb-cell" key={a.key}>
                                <input
                                  className={`gb-score-input${isInvalid ? " invalid" : ""}`}
                                  type="number"
                                  min={0}
                                  max={a.max}
                                  placeholder="–"
                                  value={val === null ? "" : val}
                                  onChange={e => handleScore(s.id, a.key, e.target.value, a.max)}
                                />
                              </div>
                            );
                          })}

                          {/* Total */}
                          <div className="gb-cell">
                            <div className="gb-total-cell">{total}<span className="gb-total-max">/{maxPts}</span></div>
                          </div>

                          {/* Grade */}
                          <div className="gb-cell">
                            <span className={`gb-grade-pill ${gradeClass(grade)}`}>{grade}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* DISTRIBUTION BAR */}
                  <div className="gb-dist-wrap">
                    <div className="gb-dist-label">Grade Distribution</div>
                    <div className="gb-dist-bar">
                      <div className="dist-seg dist-a"   style={{ width: `${(distribution.A  / distribution.n) * 100}%` }} />
                      <div className="dist-seg dist-b"   style={{ width: `${(distribution.B  / distribution.n) * 100}%` }} />
                      <div className="dist-seg dist-c"   style={{ width: `${(distribution.C  / distribution.n) * 100}%` }} />
                      <div className="dist-seg dist-df"  style={{ width: `${(distribution.DF / distribution.n) * 100}%` }} />
                    </div>
                    <div className="gb-dist-legend">
                      {[
                        { cls: "dist-a",  color: "#00c853", label: `A (${distribution.A})`  },
                        { cls: "dist-b",  color: "#1a78ff", label: `B (${distribution.B})`  },
                        { cls: "dist-c",  color: "#ffab00", label: `C (${distribution.C})`  },
                        { cls: "dist-df", color: "#ff4d6a", label: `D/F (${distribution.DF})` },
                      ].map(d => (
                        <div className="dl-item" key={d.label}>
                          <div className="dl-dot" style={{ background: d.color }} />
                          {d.label}
                        </div>
                      ))}
                    </div>
                  </div>

                </motion.div>
              </AnimatePresence>

            </motion.div>
          </div>
        </div>
      </div>

      {/* ── SAVED TOAST ── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            className="gb-toast"
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ duration: 0.3, type: "spring" }}
          >
            <div className="toast-icon">✓</div>
            Grades synced to secure server
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}