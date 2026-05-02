import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import AnimatedCounter from "./Utilities/AnimatedCounter";
import "./TeacherDashV1.css"; // Core shell layout
import "./TeacherAttendance.css"; // Specific attendance overrides


// ── DATA ──────────────────────────────────────────────────────────────────────
const SECTIONS = {
  "CS-3001": {
    name: "Object Oriented Analysis & Design",
    code: "CS-3001 · Sec A",
    time: "Mon/Wed  13:00 – 14:30",
    students: [
      { id: "21K-3001", name: "Ali Khan" },
      { id: "21K-3045", name: "Sara Ahmed" },
      { id: "21K-3112", name: "Usman Tariq" },
      { id: "21K-3190", name: "Hira Malik" },
      { id: "21K-3204", name: "Zain Ul Abdin" },
      { id: "21K-3267", name: "Ayesha Noor" },
      { id: "21K-3311", name: "Hamza Sheikh" },
      { id: "21K-3398", name: "Mahnoor Fatima" },
    ],
    history: {
      "21K-3001": [{ date: "Apr 14", status: "P" }, { date: "Apr 16", status: "P" }, { date: "Apr 21", status: "P" }, { date: "Apr 23", status: "A" }],
      "21K-3045": [{ date: "Apr 14", status: "P" }, { date: "Apr 16", status: "A" }, { date: "Apr 21", status: "P" }, { date: "Apr 23", status: "P" }],
      "21K-3112": [{ date: "Apr 14", status: "A" }, { date: "Apr 16", status: "A" }, { date: "Apr 21", status: "P" }, { date: "Apr 23", status: "A" }],
      "21K-3190": [{ date: "Apr 14", status: "P" }, { date: "Apr 16", status: "P" }, { date: "Apr 21", status: "P" }, { date: "Apr 23", status: "P" }],
      "21K-3204": [{ date: "Apr 14", status: "P" }, { date: "Apr 16", status: "A" }, { date: "Apr 21", status: "A" }, { date: "Apr 23", status: "P" }],
      "21K-3267": [{ date: "Apr 14", status: "P" }, { date: "Apr 16", status: "P" }, { date: "Apr 21", status: "P" }, { date: "Apr 23", status: "P" }],
      "21K-3311": [{ date: "Apr 14", status: "A" }, { date: "Apr 16", status: "P" }, { date: "Apr 21", status: "A" }, { date: "Apr 23", status: "A" }],
      "21K-3398": [{ date: "Apr 14", status: "P" }, { date: "Apr 16", status: "P" }, { date: "Apr 21", status: "P" }, { date: "Apr 23", status: "P" }],
    },
  },
  "CS-2010": {
    name: "Data Structures & Algorithms",
    code: "CS-2010 · Sec B",
    time: "Tue/Thu  08:00 – 09:30",
    students: [
      { id: "22K-4011", name: "Bilal Hasan" },
      { id: "22K-4099", name: "Maha Syed" },
      { id: "22K-4150", name: "Omer Farooq" },
      { id: "22K-4212", name: "Laraib Qureshi" },
      { id: "22K-4305", name: "Ahmed Raza" },
      { id: "22K-4388", name: "Nimra Iqbal" },
    ],
    history: {
      "22K-4011": [{ date: "Apr 15", status: "P" }, { date: "Apr 17", status: "P" }, { date: "Apr 22", status: "A" }, { date: "Apr 24", status: "P" }],
      "22K-4099": [{ date: "Apr 15", status: "P" }, { date: "Apr 17", status: "P" }, { date: "Apr 22", status: "P" }, { date: "Apr 24", status: "P" }],
      "22K-4150": [{ date: "Apr 15", status: "A" }, { date: "Apr 17", status: "A" }, { date: "Apr 22", status: "P" }, { date: "Apr 24", status: "A" }],
      "22K-4212": [{ date: "Apr 15", status: "P" }, { date: "Apr 17", status: "P" }, { date: "Apr 22", status: "P" }, { date: "Apr 24", status: "P" }],
      "22K-4305": [{ date: "Apr 15", status: "P" }, { date: "Apr 17", status: "A" }, { date: "Apr 22", status: "A" }, { date: "Apr 24", status: "P" }],
      "22K-4388": [{ date: "Apr 15", status: "P" }, { date: "Apr 17", status: "P" }, { date: "Apr 22", status: "P" }, { date: "Apr 24", status: "A" }],
    },
  },
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
const today = new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
function initAttendance(students) { return Object.fromEntries(students.map((s) => [s.id, "P"])); }
function getColor(pct) { if (pct >= 75) return "green"; if (pct >= 60) return "amber"; return "red"; }
function calcPct(history, todayRecord) {
  const all = [...history, todayRecord];
  const present = all.filter((r) => r.status === "P").length;
  if (all.length === 0) return 0;
  return Math.round((present / all.length) * 100);
}
function initials(name) { return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(); }

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function TeacherAttendance() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const webglRef   = useRef(null);
  
  const [collapse, setCollapse] = useState(false);
  const [activeTab, setActiveTab] = useState("CS-3001");
  const [attendance, setAttendance] = useState(() => initAttendance(SECTIONS["CS-3001"].students));
  const [selected, setSelected] = useState(SECTIONS["CS-3001"].students[0].id);
  const [unsaved, setUnsaved] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const section  = SECTIONS[activeTab];
  const history  = section.history;

  useEffect(() => {
    setAttendance(initAttendance(section.students));
    setSelected(section.students[0].id);
    setUnsaved(false);
  }, [activeTab, section.students]);

  const toggle = (id, val) => {
    setAttendance((prev) => ({ ...prev, [id]: val }));
    setUnsaved(true);
  };

  const save = () => {
    setUnsaved(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2600);
  };

  const presentCount = Object.values(attendance).filter((v) => v === "P").length;
  const absentCount  = section.students.length - presentCount;

  const selStudent = section.students.find((s) => s.id === selected) || section.students[0];
  const selHistory = history[selStudent.id] || [];
  const todayEntry = { date: "Today", status: attendance[selStudent.id] || "P" };
  const selPct     = calcPct(selHistory, todayEntry);
  const selColor   = getColor(selPct);

  // ── THREE.JS BACKGROUND ──
  useEffect(() => {
    const canvas = webglRef.current;
    if (!canvas) return;
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

  const navItems = [
    ["Management", [
      ["◈", "My Sections",   "/teacher/sections"],
      ["⊞", "Dashboard",     "/teacher/dashboard"],
      ["▦", "Gradebook",     "/teacher/gradebook"],
      ["✓", "Attendance",    "/teacher/attendance"],
      ["▤", "Schedule",      "/teacher/schedule"],
    ]],
    ["Communication", [["◉", "Broadcasts", "/teacher/alerts"]]],
    ["Account",       [["◌", "Profile",    "/teacher/profile"]]],
  ];

  return (
    <>
      <div className="mesh-bg">
        <div className="mesh-blob blob-1" />
        <div className="mesh-blob blob-2" />
        <div className="mesh-blob blob-3" />
      </div>

      <canvas id="webgl" ref={webglRef} style={{ display: 'none' }} />

      <div id="app" style={{ opacity: 1, zIndex: 10, position: 'relative' }}>
        
        {/* ── SIDEBAR ── */}
        <nav id="sidebar" className={collapse ? "collapse" : ""} style={{ transform: "translateX(0)" }}>
          <div className="sb-top-bar" />
          <button className="sb-toggle hov-target" onClick={() => setCollapse(c => !c)}>
            <span /><span /><span />
          </button>
          <div className="sb-logo">
            <div className="logo-box">A</div>
            <div>
              <div className="logo-name">ARCH</div>
              <div className="logo-tagline">Faculty Portal</div>
            </div>
          </div>
          <div className="sb-user hov-target" onClick={() => navigate('/teacher/profile')}>
            <div className="uav">Dr.</div>
            <div>
              <div className="uname">Dr. Ahmed</div>
              <div className="uid">EMP-8492</div>
            </div>
          </div>

          {navItems.map(([sec, items]) => (
            <div key={sec}>
              <div className="nav-sec">{sec}</div>
              {items.map(([ic, label, path]) => (
                <div
                  key={label}
                  className={`ni hov-target${location.pathname === path ? " active" : ""}`}
                  onClick={() => navigate(path)}
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
          <div id="topbar" style={{ opacity: 1 }}>
            <div className="tb-glow" />
            <div className="pg-title"><span>Mark Attendance</span></div>
            <div className="tb-r">
              <AnimatePresence>
                {unsaved && (
                  <motion.div initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.8}} className="ta-unsaved-badge">
                    <span className="ta-unsaved-dot" />
                    UNSAVED
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div whileHover={{ scale: 1.05 }} className="sem-chip">Spring 2025</motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="notif-bell">🔔<span className="notif-dot"/></motion.div>
            </div>
          </div>

          <div id="scroll">
            <motion.div 
              className="ta-layout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* ── LEFT PANEL ── */}
              <div className="ta-left">
                <div className="glass-card ta-card" style={{ flex: "0 0 auto", padding: "0" }}>
                  {/* Section tabs */}
                  <div className="marks-tab-container" style={{ margin: "24px 32px 12px" }}>
                    {Object.keys(SECTIONS).map((k) => (
                      <motion.button
                        key={k}
                        className={`marks-tab${activeTab === k ? " active" : ""}`}
                        onClick={() => setActiveTab(k)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {k}
                      </motion.button>
                    ))}
                  </div>

                  <div className="ta-date-row">
                    <span className="ta-date-label">SESSION DATE</span>
                    <span className="ta-date-value">{today}</span>
                  </div>

                  <div className="ta-date-row" style={{ borderBottom: "none" }}>
                    <span className="ta-date-label">{section.code}</span>
                    <span className="ta-date-value" style={{ color: "var(--dimmer)" }}>{section.time}</span>
                  </div>
                </div>

                {/* Roster */}
                <div className="glass-card ta-card" style={{ flex: 1, display: "flex", flexDirection: "column", padding: 0 }}>
                  <div className="ta-roster">
                    {section.students.map((s) => {
                      const status = attendance[s.id];
                      return (
                        <motion.div
                          key={s.id}
                          className={`ta-student-row${selected === s.id ? " selected" : ""}`}
                          onClick={() => setSelected(s.id)}
                          whileHover={{ backgroundColor: "rgba(26,100,255,0.05)" }}
                        >
                          <div className="ta-student-avatar">{initials(s.name)}</div>
                          <div className="ta-student-info">
                            <div className="ta-student-name">{s.name}</div>
                            <div className="ta-student-id">{s.id}</div>
                          </div>
                          <div className="ta-toggle-wrap">
                            <div className="ta-toggle">
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                className={`ta-toggle-btn${status === "P" ? " p-active" : ""}`}
                                onClick={(e) => { e.stopPropagation(); toggle(s.id, "P"); }}
                              >
                                P
                              </motion.button>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                className={`ta-toggle-btn${status === "A" ? " a-active" : ""}`}
                                onClick={(e) => { e.stopPropagation(); toggle(s.id, "A"); }}
                              >
                                A
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Summary footer */}
                  <div className="ta-summary-footer">
                    <div className="ta-sum-stat">
                      <div className="ta-sum-num green">{presentCount}</div>
                      <div className="ta-sum-lbl">Present</div>
                    </div>
                    <div className="ta-sum-divider" />
                    <div className="ta-sum-stat">
                      <div className="ta-sum-num red">{absentCount}</div>
                      <div className="ta-sum-lbl">Absent</div>
                    </div>
                    <div className="ta-sum-divider" />
                    <div className="ta-sum-stat">
                      <div className="ta-sum-num">{section.students.length}</div>
                      <div className="ta-sum-lbl">Total</div>
                    </div>
                    <motion.button 
                      className={`ta-save-btn ${unsaved ? "active-save" : ""}`} 
                      onClick={save} 
                      disabled={!unsaved}
                      whileHover={{ scale: unsaved ? 1.05 : 1 }}
                      whileTap={{ scale: unsaved ? 0.95 : 1 }}
                      style={{ marginLeft: "auto" }}
                    >
                      ✓ Save
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* ── RIGHT PANEL ── */}
              <div className="ta-right">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={selStudent.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    style={{display: 'flex', flexDirection: 'column', gap: '24px', height: '100%'}}
                  >
                    {/* Student detail card */}
                    <div className="glass-card ta-detail-card">
                      <div className="ta-detail-top">
                        <div>
                          <div className="ta-detail-name">{selStudent.name}</div>
                          <div className="ta-detail-meta">{selStudent.id} &nbsp;|&nbsp; {section.code}</div>
                        </div>
                        <div className={`ta-big-pct ${selColor}`}>
                          <AnimatedCounter value={selPct} /><span>%</span>
                        </div>
                      </div>

                      {/* Bar */}
                      <div className="ta-bar-track">
                        <motion.div
                          className={`ta-bar-fill ${selColor}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${selPct}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                        <div className="ta-threshold-line" />
                      </div>

                      <div className="ta-bar-labels">
                        <span className={selPct >= 75 ? "lbl-ok" : selPct >= 60 ? "lbl-warn" : "lbl-bad"}>
                          {selPct >= 75 ? "Attendance OK" : selPct >= 60 ? "At Risk" : "Below Threshold"}
                        </span>
                        <span className="lbl-dim">Minimum 75%</span>
                      </div>

                      {/* Stat pills */}
                      <div className="ta-stat-row">
                        <div className="ta-stat-pill green">
                          <div className="ta-stat-num">
                            <AnimatedCounter value={[...selHistory, todayEntry].filter((r) => r.status === "P").length} />
                          </div>
                          <div className="ta-stat-lbl">Present</div>
                        </div>
                        <div className="ta-stat-pill red">
                          <div className="ta-stat-num">
                            <AnimatedCounter value={[...selHistory, todayEntry].filter((r) => r.status === "A").length} />
                          </div>
                          <div className="ta-stat-lbl">Absent</div>
                        </div>
                        <div className="ta-stat-pill blue">
                          <div className="ta-stat-num">
                            <AnimatedCounter value={selHistory.length + 1} />
                          </div>
                          <div className="ta-stat-lbl">Classes Held</div>
                        </div>
                      </div>
                    </div>

                    {/* Attendance log */}
                    <div className="glass-card ta-log-card">
                      <div className="panel-header" style={{ marginBottom: "20px" }}>
                        <h2 className="ct"><div className="ctbar"/>Attendance Log</h2>
                        <div className="ta-log-count">{selHistory.length + 1} sessions</div>
                      </div>

                      <div className="ta-log-list">
                        {/* Today's row (live) */}
                        <div className={`ta-log-row${attendance[selStudent.id] === "A" ? " absent" : ""}`}>
                          <div className={`ta-log-dot ${attendance[selStudent.id] === "P" ? "green" : "red"}`} />
                          <div className="ta-log-date">Today</div>
                          <div className="ta-log-topic">Current Session</div>
                          <div className={`ta-log-status ${attendance[selStudent.id] === "P" ? "green" : "red"}`}>
                            {attendance[selStudent.id] === "P" ? "Present" : "Absent"}
                          </div>
                        </div>

                        {/* Historical rows */}
                        {[...selHistory].reverse().map((r, i) => (
                          <div key={i} className={`ta-log-row${r.status === "A" ? " absent" : ""}`}>
                            <div className={`ta-log-dot ${r.status === "P" ? "green" : "red"}`} />
                            <div className="ta-log-date">{r.date}</div>
                            <div className="ta-log-topic">{section.name}</div>
                            <div className={`ta-log-status ${r.status === "P" ? "green" : "red"}`}>
                              {r.status === "P" ? "Present" : "Absent"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            className="ta-toast"
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ duration: 0.3, type: "spring" }}
          >
            <div className="toast-icon">✓</div>
            Attendance saved for {section.code}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}