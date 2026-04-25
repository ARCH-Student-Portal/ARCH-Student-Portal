import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

import "./StudentDashV1.css";
import "./TeacherGradebook.css";

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

// ── COMPONENT ─────────────────────────────────────────────────────────────
export default function TeacherGradebook() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const webglRef  = useRef(null);
  const appRef    = useRef(null);
  const sidebarRef = useRef(null);
  const [collapse, setCollapse] = useState(false);

  const [activeSection, setActiveSection] = useState("CS-3001");
  const [scores, setScores]  = useState(() => {
    // Deep-clone scores so we can edit locally
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
    return ((sum / students.length / maxPts) * 100).toFixed(1);
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

  // ── THREE.JS BACKGROUND ──
  useEffect(() => {
    const canvas = webglRef.current;
    let W = window.innerWidth, H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setClearColor(0xf4f8ff, 1);
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 200);
    camera.position.set(0, 2, 10);
    scene.add(new THREE.AmbientLight(0x0033aa, 0.8));
    let animId;
    const loop = () => { animId = requestAnimationFrame(loop); renderer.render(scene, camera); };
    loop();
    return () => cancelAnimationFrame(animId);
  }, []);

  // ── NAV ITEMS ──
  const navItems = [
    ["Management", [
      ["◈", "My Sections",  "/teacher/sections"],
      ["⊞", "Dashboard",    "/teacher/dashboard"],
      ["▦", "Gradebook",    "/teacher/gradebook"],
    ]],
    ["Communication", [["◉", "Broadcast Alerts", "/teacher/alerts"]]],
    ["Account",       [["◌", "Profile",           "/teacher/profile"]]],
  ];

  return (
    <>
      <div className="scanlines" />
      <div className="vignette"  />
      <canvas id="webgl" ref={webglRef} />

      <div id="app" ref={appRef} style={{ opacity: 1 }}>
        {/* ── SIDEBAR ── */}
        <nav id="sidebar" ref={sidebarRef} className={collapse ? "collapse" : ""} style={{ transform: "translateX(0)" }}>
          <div className="sb-top-bar" />
          <button className="sb-toggle" onClick={() => setCollapse(c => !c)}>
            <span /><span /><span />
          </button>
          <div className="sb-logo">
            <div className="logo-box">A</div>
            <div><div className="logo-name">ARCH</div><div className="logo-tagline">Faculty Portal</div></div>
          </div>
          <div className="sb-user">
            <div className="uav">Dr.</div>
            <div><div className="uname">Dr. Ahmed</div><div className="uid">EMP-8492</div></div>
          </div>
          {navItems.map(([sec, items]) => (
            <div key={sec}>
              <div className="nav-sec">{sec}</div>
              {items.map(([ic, label, path]) => (
                <div
                  key={label}
                  className={`ni${location.pathname === path ? " active" : ""}`}
                  onClick={() => navigate(path)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="ni-ic">{ic}</div>{label}
                </div>
              ))}
            </div>
          ))}
          <div className="sb-foot">Spring 2025 · FAST-NUCES</div>
        </nav>

        {/* ── MAIN ── */}
        <div id="main">
          <div id="topbar">
            <div className="tb-glow" />
            <div className="pg-title"><span>Gradebook</span></div>
            <div className="tb-r">
              {unsaved && (
                <div className="gb-unsaved-badge">
                  <span className="gb-unsaved-dot" />
                  UNSAVED CHANGES
                </div>
              )}
              <div className="sem-chip">Spring 2025</div>
            </div>
          </div>

          <div id="scroll">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >

              {/* ── CONTROLS ── */}
              <div className="gb-controls">
                <div className="gb-section-tabs">
                  {Object.keys(SECTIONS_DATA).map(sec => (
                    <button
                      key={sec}
                      className={`gb-sec-tab${activeSection === sec ? " active" : ""}`}
                      onClick={() => { setActiveSection(sec); setSearch(""); }}
                    >
                      {sec}
                    </button>
                  ))}
                </div>

                <div className="gb-right-controls">
                  <div className="gb-search">
                    <span style={{ fontSize: 12, opacity: 0.5 }}>🔍</span>
                    <input
                      placeholder="Search student…"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                  <button className="gb-btn-export" onClick={() => {}}>
                    ↓ Export
                  </button>
                  <button className="gb-btn-save" onClick={handleSave} disabled={!unsaved}>
                    ✓ Save Grades
                  </button>
                </div>
              </div>

              {/* ── SUMMARY STRIP ── */}
              <div className="gb-summary">
                <div className="gb-stat">
                  <div className="gb-stat-label">Class Average</div>
                  <div className={`gb-stat-value ${parseFloat(avgScore) >= 70 ? "green" : parseFloat(avgScore) >= 50 ? "amber" : "red"}`}>{avgScore}%</div>
                  <div className="gb-stat-sub">out of {maxPts} pts</div>
                </div>
                <div className="gb-stat">
                  <div className="gb-stat-label">Students</div>
                  <div className="gb-stat-value">{sectionData.students.length}</div>
                  <div className="gb-stat-sub">{sectionData.code}</div>
                </div>
                <div className="gb-stat">
                  <div className="gb-stat-label">Passing</div>
                  <div className="gb-stat-value green">{passingCount}</div>
                  <div className="gb-stat-sub">≥ 50% threshold</div>
                </div>
                <div className="gb-stat">
                  <div className="gb-stat-label">Highest Score</div>
                  <div className="gb-stat-value">{highestScore}</div>
                  <div className="gb-stat-sub">out of {maxPts} pts</div>
                </div>
              </div>

              {/* ── GRADEBOOK TABLE ── */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  className="gb-table-wrap"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* HEADER */}
                  <div className="gb-table-head">
                    <div className="gb-col-hd left">Roll No.</div>
                    <div className="gb-col-hd left">Student</div>
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
                      <div style={{ padding: "40px", textAlign: "center", color: "#a0b8d8", fontFamily: "JetBrains Mono, monospace", fontSize: 13 }}>
                        No students match "{search}"
                      </div>
                    ) : students.map((s, idx) => {
                      const rowScores = scores[activeSection][s.id];
                      const total     = computeTotal(rowScores, assessments);
                      const pct       = (total / maxPts) * 100;
                      const grade     = getGrade(pct);

                      return (
                        <motion.div
                          className="gb-row"
                          key={s.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: idx * 0.03 }}
                        >
                          {/* Roll */}
                          <div className="gb-cell left gb-roll">{s.id}</div>

                          {/* Name */}
                          <div className="gb-cell left">
                            <div className="gb-name-cell">
                              <div className="gb-avatar">{s.init}</div>
                              <div>
                                <div className="gb-student-name">{s.name}</div>
                                <div style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "#a0b8d8", marginTop: 1 }}>
                                  Att: <span className={s.attCls} style={{ fontWeight: 700 }}>{s.att}</span>
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
                            <div className="gb-total-cell">{total}<span style={{ fontSize: 10, color: "#a0b8d8", fontWeight: 500 }}>/{maxPts}</span></div>
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
                        { cls: "dist-a",  color: "#00c853", label: `A  ${distribution.A}`  },
                        { cls: "dist-b",  color: "#1a78ff", label: `B  ${distribution.B}`  },
                        { cls: "dist-c",  color: "#ffab00", label: `C  ${distribution.C}`  },
                        { cls: "dist-df", color: "#ff4d6a", label: `D/F ${distribution.DF}` },
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
          >
            ✓ Grades saved successfully
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}