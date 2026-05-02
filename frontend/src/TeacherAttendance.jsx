import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedCounter from "./Utilities/AnimatedCounter";
import Sidebar from "./Components/shared/Sidebar";
import "./TeacherDashV1.css";
import "./TeacherAttendance.css";
import { TEACHER_NAV } from "./config/TeacherNav";

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
const today = new Date().toLocaleDateString("en-GB", {
  weekday: "short", day: "numeric", month: "short", year: "numeric",
});
function initAttendance(students) {
  return Object.fromEntries(students.map((s) => [s.id, "P"]));
}
function getColor(pct) {
  if (pct >= 75) return "green";
  if (pct >= 60) return "amber";
  return "red";
}
function calcPct(history, todayRecord) {
  const all = [...history, todayRecord];
  const present = all.filter((r) => r.status === "P").length;
  if (all.length === 0) return 0;
  return Math.round((present / all.length) * 100);
}
function initials(name) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

const COLOR_CSS = {
  green: { color: "#00c853", shadow: "rgba(0,200,83,0.3)" },
  amber: { color: "#ff9100", shadow: "rgba(255,145,0,0.3)" },
  red:   { color: "#ff4d6a", shadow: "rgba(255,77,106,0.3)" },
};

// ── INLINE STYLES (for classes missing from CSS files) ────────────────────────
const tabContainerStyle = {
  display: "flex",
  gap: "8px",
  margin: "24px 32px 12px",
};
function tabBtnStyle(active) {
  return {
    padding: "8px 20px",
    borderRadius: "10px",
    border: "none",
    fontFamily: "'Inter', sans-serif",
    fontSize: "14px",
    fontWeight: 800,
    cursor: "pointer",
    letterSpacing: "0.02em",
    background: active
      ? "linear-gradient(135deg, #1a78ff, #0050cc)"
      : "rgba(18,78,170,.08)",
    color: active ? "#fff" : "#6b7fa8",
    boxShadow: active ? "0 4px 14px rgba(26,120,255,.35)" : "none",
    transition: "all 0.2s",
  };
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function TeacherAttendance() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const webglRef  = useRef(null);
  const sidebarRef = useRef(null);

  const [collapse,   setCollapse]   = useState(false);
  const [activeTab,  setActiveTab]  = useState("CS-3001");
  const [attendance, setAttendance] = useState(() => initAttendance(SECTIONS["CS-3001"].students));
  const [selected,   setSelected]   = useState(SECTIONS["CS-3001"].students[0].id);
  const [unsaved,    setUnsaved]    = useState(false);
  const [showToast,  setShowToast]  = useState(false);

  const section = SECTIONS[activeTab];
  const history = section.history;

  // Reset state when tab changes
  useEffect(() => {
    setAttendance(initAttendance(section.students));
    setSelected(section.students[0].id);
    setUnsaved(false);
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const C          = COLOR_CSS[selColor];
  const allEntries = [...selHistory, todayEntry];

  // ── THREE.JS BACKGROUND ──
  useEffect(() => {
    const canvas = webglRef.current;
    if (!canvas) return;
    const W = window.innerWidth, H = window.innerHeight;
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
      ["◈", "My Sections",  "/teacher/sections"],
      ["⊞", "Dashboard",    "/teacher/dashboard"],
      ["▦", "Gradebook",    "/teacher/gradebook"],
      ["✓", "Attendance",   "/teacher/attendance"],
      ["▤", "Schedule",     "/teacher/schedule"],
    ]],
    ["Communication", [["◉", "Broadcasts", "/teacher/alerts"]]],
    ["Account",       [["◌", "Profile",    "/teacher/profile"]]],
  ];

  return (
    <>
      {/* ── MESH BACKGROUND ── */}
      <div className="mesh-bg">
        <div className="mesh-blob blob-1" />
        <div className="mesh-blob blob-2" />
        <div className="mesh-blob blob-3" />
      </div>

      <canvas id="webgl" ref={webglRef} style={{ display: "none" }} />

      <div id="app" style={{ opacity: 1, zIndex: 10, position: "relative", display: "flex", height: "100vh", width: "100vw" }}>

        {/* ── SIDEBAR ── */}
        <Sidebar
          ref={sidebarRef}
          sections={TEACHER_NAV}
          logoLabel="Faculty Portal"
          userName="Dr. Ahmed"
          userId="EMP-8492"
          collapse={collapse}
          onToggle={() => setCollapse(c => !c)}
        />

        {/* ── MAIN ── */}
        <div id="main">
          {/* Topbar */}
          <div id="topbar" style={{ opacity: 1 }}>
            <div className="tb-glow" />
            <div className="pg-title"><span>Mark Attendance</span></div>
            <div className="tb-r">
              <AnimatePresence>
                {unsaved && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="ta-unsaved-badge"
                  >
                    <span className="ta-unsaved-dot" />
                    UNSAVED
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div whileHover={{ scale: 1.05 }} className="sem-chip">
                Spring 2025
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="notif-bell"
              >
                🔔<span className="notif-dot" />
              </motion.div>
            </div>
          </div>

          {/* Scrollable content */}
          <div id="scroll" style={{ opacity: 1 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                display: "grid",
                gridTemplateColumns: "460px 1fr",
                gap: "32px",
                alignItems: "start",
                minHeight: "100%",
              }}
            >
              {/* ── LEFT PANEL ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                {/* Section info card */}
                <div className="glass-card ta-card" style={{ padding: 0, opacity: 1, transform: "none" }}>
                  {/* Section tabs */}
                  <div style={tabContainerStyle}>
                    {Object.keys(SECTIONS).map((k) => (
                      <motion.button
                        key={k}
                        style={tabBtnStyle(activeTab === k)}
                        onClick={() => setActiveTab(k)}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
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

                {/* Roster card */}
                <div className="glass-card ta-card" style={{ padding: 0, display: "flex", flexDirection: "column", opacity: 1, transform: "none" }}>
                  <div className="ta-roster">
                    {section.students.map((s) => {
                      const status     = attendance[s.id];
                      const isSelected = selected === s.id;
                      return (
                        <motion.div
                          key={s.id}
                          className={`ta-student-row${isSelected ? " selected" : ""}`}
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
                              >P</motion.button>
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                className={`ta-toggle-btn${status === "A" ? " a-active" : ""}`}
                                onClick={(e) => { e.stopPropagation(); toggle(s.id, "A"); }}
                              >A</motion.button>
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
                      className={`ta-save-btn${unsaved ? " active-save" : ""}`}
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
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selStudent.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: "flex", flexDirection: "column", gap: "24px" }}
                  >
                    {/* Detail card */}
                    <div className="glass-card ta-detail-card" style={{ opacity: 1, transform: "none" }}>
                      <div className="ta-detail-top">
                        <div>
                          <div className="ta-detail-name">{selStudent.name}</div>
                          <div className="ta-detail-meta">
                            {selStudent.id} &nbsp;|&nbsp; {section.code}
                          </div>
                        </div>
                        <div
                          className={`ta-big-pct ${selColor}`}
                          style={{ color: C.color, textShadow: `0 4px 16px ${C.shadow}` }}
                        >
                          <AnimatedCounter value={selPct} /><span>%</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="ta-bar-track">
                        <motion.div
                          className={`ta-bar-fill ${selColor}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${selPct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
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
                            <AnimatedCounter value={allEntries.filter((r) => r.status === "P").length} />
                          </div>
                          <div className="ta-stat-lbl">Present</div>
                        </div>
                        <div className="ta-stat-pill red">
                          <div className="ta-stat-num">
                            <AnimatedCounter value={allEntries.filter((r) => r.status === "A").length} />
                          </div>
                          <div className="ta-stat-lbl">Absent</div>
                        </div>
                        <div className="ta-stat-pill blue">
                          <div className="ta-stat-num">
                            <AnimatedCounter value={allEntries.length} />
                          </div>
                          <div className="ta-stat-lbl">Classes Held</div>
                        </div>
                      </div>
                    </div>

                    {/* Attendance log */}
                    <div className="glass-card ta-log-card" style={{ opacity: 1, transform: "none" }}>
                      <div className="panel-header" style={{ marginBottom: "20px" }}>
                        <h2 className="ct">
                          <div className="ctbar" />
                          Attendance Log
                        </h2>
                        <div className="ta-log-count">{allEntries.length} sessions</div>
                      </div>

                      <div className="ta-log-list">
                        {/* Today's live row */}
                        <div className={`ta-log-row${attendance[selStudent.id] === "A" ? " absent" : ""}`}>
                          <div className={`ta-log-dot ${attendance[selStudent.id] === "P" ? "green" : "red"}`} />
                          <div className="ta-log-date">Today</div>
                          <div className="ta-log-topic">Current Session</div>
                          <div className={`ta-log-status ${attendance[selStudent.id] === "P" ? "green" : "red"}`}>
                            {attendance[selStudent.id] === "P" ? "Present" : "Absent"}
                          </div>
                        </div>

                        {/* Historical rows (newest first) */}
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