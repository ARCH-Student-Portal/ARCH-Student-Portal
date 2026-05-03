import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedCounter from "./Utilities/AnimatedCounter";
import Sidebar from "./Components/shared/Sidebar";
import TeacherApi from "./config/teacherApi";
import "./TeacherDashV1.css";
import "./TeacherAttendance.css";
import { TEACHER_NAV } from "./config/TeacherNav";

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

// ── INLINE STYLES ─────────────────────────────────────────────────────────────
const tabContainerStyle = {
  display: "flex",
  gap: "8px",
  margin: "24px 32px 12px",
  flexWrap: "wrap",
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

// ── LOADING SKELETON ──────────────────────────────────────────────────────────
function Skeleton({ height = 20, width = "100%", style = {} }) {
  return (
    <div
      style={{
        height,
        width,
        borderRadius: 8,
        background: "linear-gradient(90deg, rgba(26,100,255,0.06) 25%, rgba(26,100,255,0.13) 50%, rgba(26,100,255,0.06) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s infinite",
        ...style,
      }}
    />
  );
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function TeacherAttendance() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const webglRef   = useRef(null);
  const sidebarRef = useRef(null);

  const [collapse,    setCollapse]    = useState(false);

  // API data
  const [sections,    setSections]    = useState([]);       // list from getSections()
  const [activeTab,   setActiveTab]   = useState(null);     // sectionId string
  const [students,    setStudents]    = useState([]);       // from getSectionStudents()
  const [history,     setHistory]     = useState({});       // { studentId: [{date, status}] }

  // UI state
  const [attendance,  setAttendance]  = useState({});
  const [selected,    setSelected]    = useState(null);
  const [unsaved,     setUnsaved]     = useState(false);
  const [showToast,   setShowToast]   = useState(false);

  // Loading / error
  const [loadingSections, setLoadingSections] = useState(true);
  const [loadingRoster,   setLoadingRoster]   = useState(false);
  const [saving,          setSaving]          = useState(false);
  const [error,           setError]           = useState(null);

  // ── FETCH SECTIONS ON MOUNT ──
  useEffect(() => {
    setLoadingSections(true);
    TeacherApi.getSections()
      .then((res) => {
        // Normalize: expect res to be an array or res.sections
        const list = Array.isArray(res) ? res : (res.sections ?? res.data ?? []);
        setSections(list);
        if (list.length > 0) setActiveTab(list[0].id ?? list[0]._id ?? list[0].sectionId);
      })
      .catch(() => setError("Failed to load sections."))
      .finally(() => setLoadingSections(false));
  }, []);

  // ── FETCH STUDENTS + ATTENDANCE WHEN TAB CHANGES ──
  useEffect(() => {
    if (!activeTab) return;
    setLoadingRoster(true);
    setError(null);

    Promise.all([
      TeacherApi.getSectionStudents(activeTab),
      TeacherApi.getAttendance(activeTab),
    ])
      .then(([studRes, attRes]) => {
        // ── Normalize students ──
        // Expected shape: array of { id/studentId/rollNumber, name/fullName }
        const rawStudents = Array.isArray(studRes) ? studRes : (studRes.students ?? studRes.data ?? []);
        const normalized = rawStudents.map((s) => ({
          id:   s.id ?? s.studentId ?? s.rollNumber ?? s._id,
          name: s.name ?? s.fullName ?? s.studentName ?? "Unknown",
          display: s.rollNumber ?? s.studentId ?? s.regNo ?? null,  // add this
        }));
        setStudents(normalized);
        setAttendance(initAttendance(normalized));
        setSelected(normalized[0]?.id ?? null);
        setUnsaved(false);

        // ── Normalize attendance history ──
        // Expected shape: array of { studentId, records: [{date, status}] }
        // OR: { [studentId]: [{date, status}] }
        const rawAtt = Array.isArray(attRes) ? attRes : (attRes.attendance ?? attRes.data ?? []);
        let histMap = {};
        if (Array.isArray(rawAtt)) {
          rawAtt.forEach((entry) => {
            const sid = entry.studentId ?? entry.id;
            // records can be [{date, status}] or [{date, present}]
            histMap[sid] = (entry.records ?? []).map((r) => ({
              date:   r.date,
              status: r.status ?? (r.present ? "P" : "A"),
            }));
          });
        } else {
          // already a map
          histMap = rawAtt;
        }
        setHistory(histMap);
      })
      .catch(() => setError("Failed to load roster or attendance."))
      .finally(() => setLoadingRoster(false));
  }, [activeTab]);

  const toggle = (id, val) => {
    setAttendance((prev) => ({ ...prev, [id]: val }));
    setUnsaved(true);
  };

  // ── SAVE ──
  const save = useCallback(() => {
    if (!activeTab) return;
    setSaving(true);
    const payload = students.map((s) => ({
      studentId: s.id,
      status:    attendance[s.id] ?? "P",
      date:      new Date().toISOString().split("T")[0],
    }));

    TeacherApi.markAttendance(activeTab, { records: payload })
      .then(() => {
        setUnsaved(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2600);
      })
      .catch(() => setError("Failed to save attendance. Please try again."))
      .finally(() => setSaving(false));
  }, [activeTab, attendance, students]);

  // ── DERIVED ──
  const activeSection = sections.find(
    (s) => (s.id ?? s._id ?? s.sectionId) === activeTab
  );
  const sectionLabel = activeSection
    ? (activeSection.code ?? activeSection.courseCode ?? activeSection.name ?? activeTab)
    : activeTab;
  const rawTime = activeSection?.time ?? activeSection?.schedule ?? "";
  const sectionTime = typeof rawTime === "object" && rawTime !== null ? `${rawTime.day ?? ""} ${rawTime.startTime ?? ""}–${rawTime.endTime ?? ""}${rawTime.room ? ` · ${rawTime.room}` : ""}`.trim() : rawTime;

  const presentCount = Object.values(attendance).filter((v) => v === "P").length;
  const absentCount  = students.length - presentCount;

  const selStudent = students.find((s) => s.id === selected) ?? students[0];
  const selHistory = selStudent ? (history[selStudent.id] ?? []) : [];
  const todayEntry = selStudent
    ? { date: "Today", status: attendance[selStudent.id] ?? "P" }
    : { date: "Today", status: "P" };
  const selPct     = selStudent ? calcPct(selHistory, todayEntry) : 0;
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

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <>
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

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  margin: "16px 32px 0",
                  padding: "12px 20px",
                  borderRadius: "10px",
                  background: "rgba(255,77,106,0.12)",
                  border: "1px solid rgba(255,77,106,0.3)",
                  color: "#ff4d6a",
                  fontSize: "14px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span>⚠</span>
                {error}
                <button
                  onClick={() => setError(null)}
                  style={{ marginLeft: "auto", background: "none", border: "none", color: "#ff4d6a", cursor: "pointer", fontSize: "16px" }}
                >✕</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scrollable content */}
          <div id="scroll" style={{ opacity: 1 }}>
            {loadingSections ? (
              // ── FULL PAGE SKELETON ──
              <div style={{ display: "grid", gridTemplateColumns: "460px 1fr", gap: "32px", alignItems: "start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div className="glass-card ta-card" style={{ padding: "24px" }}>
                    <Skeleton height={32} width="60%" style={{ marginBottom: 16 }} />
                    <Skeleton height={20} width="80%" style={{ marginBottom: 10 }} />
                    <Skeleton height={20} width="50%" />
                  </div>
                  <div className="glass-card ta-card" style={{ padding: "24px" }}>
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} height={48} style={{ marginBottom: 12 }} />
                    ))}
                  </div>
                </div>
                <div className="glass-card ta-detail-card" style={{ padding: "32px" }}>
                  <Skeleton height={40} width="50%" style={{ marginBottom: 20 }} />
                  <Skeleton height={16} style={{ marginBottom: 12 }} />
                  <Skeleton height={16} width="70%" />
                </div>
              </div>
            ) : (
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
                    <div style={tabContainerStyle}>
                      {sections.map((sec) => {
                        const sid = sec.id ?? sec._id ?? sec.sectionId;
                        const label = sec.code ?? sec.courseCode ?? sec.name ?? sid;
                        return (
                          <motion.button
                            key={sid}
                            style={tabBtnStyle(activeTab === sid)}
                            onClick={() => setActiveTab(sid)}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                          >
                            {label}
                          </motion.button>
                        );
                      })}
                    </div>

                    <div className="ta-date-row">
                      <span className="ta-date-label">SESSION DATE</span>
                      <span className="ta-date-value">{today}</span>
                    </div>

                    <div className="ta-date-row" style={{ borderBottom: "none" }}>
                      <span className="ta-date-label">{sectionLabel}</span>
                      <span className="ta-date-value" style={{ color: "var(--dimmer)" }}>{sectionTime}</span>
                    </div>
                  </div>

                  {/* Roster card */}
                  <div className="glass-card ta-card" style={{ padding: 0, display: "flex", flexDirection: "column", opacity: 1, transform: "none" }}>
                    {loadingRoster ? (
                      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
                        {[...Array(6)].map((_, i) => <Skeleton key={i} height={52} />)}
                      </div>
                    ) : (
                      <>
                        <div className="ta-roster">
                          {students.map((s) => {
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
                                  <div className="ta-student-id"> {s.display ?? `${String(s.id).slice(0, 8)}…`} </div>
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
                            <div className="ta-sum-num">{students.length}</div>
                            <div className="ta-sum-lbl">Total</div>
                          </div>
                          <motion.button
                            className={`ta-save-btn${unsaved ? " active-save" : ""}`}
                            onClick={save}
                            disabled={!unsaved || saving}
                            whileHover={{ scale: unsaved ? 1.05 : 1 }}
                            whileTap={{ scale: unsaved ? 0.95 : 1 }}
                            style={{ marginLeft: "auto" }}
                          >
                            {saving ? "Saving…" : "✓ Save"}
                          </motion.button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* ── RIGHT PANEL ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {loadingRoster ? (
                    <div className="glass-card ta-detail-card" style={{ padding: "32px" }}>
                      <Skeleton height={40} width="55%" style={{ marginBottom: 20 }} />
                      <Skeleton height={14} style={{ marginBottom: 12 }} />
                      <Skeleton height={14} width="65%" style={{ marginBottom: 24 }} />
                      <Skeleton height={10} style={{ marginBottom: 20 }} />
                      <div style={{ display: "flex", gap: 12 }}>
                        {[...Array(3)].map((_, i) => <Skeleton key={i} height={64} style={{ flex: 1 }} />)}
                      </div>
                    </div>
                  ) : selStudent ? (
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
                                {selStudent.display ?? `${String(selStudent.id).slice(0, 8)}…`} &nbsp;|&nbsp; {sectionLabel}
                              </div>
                            </div>
                            <div
                              className={`ta-big-pct ${selColor}`}
                              style={{ color: C.color, textShadow: `0 4px 16px ${C.shadow}` }}
                            >
                              <AnimatedCounter value={selPct} /><span>%</span>
                            </div>
                          </div>

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
                            <div className={`ta-log-row${attendance[selStudent.id] === "A" ? " absent" : ""}`}>
                              <div className={`ta-log-dot ${attendance[selStudent.id] === "P" ? "green" : "red"}`} />
                              <div className="ta-log-date">Today</div>
                              <div className="ta-log-topic">Current Session</div>
                              <div className={`ta-log-status ${attendance[selStudent.id] === "P" ? "green" : "red"}`}>
                                {attendance[selStudent.id] === "P" ? "Present" : "Absent"}
                              </div>
                            </div>

                            {[...selHistory].reverse().map((r, i) => (
                              <div key={i} className={`ta-log-row${r.status === "A" ? " absent" : ""}`}>
                                <div className={`ta-log-dot ${r.status === "P" ? "green" : "red"}`} />
                                <div className="ta-log-date">{r.date}</div>
                                <div className="ta-log-topic">{activeSection?.name ?? sectionLabel}</div>
                                <div className={`ta-log-status ${r.status === "P" ? "green" : "red"}`}>
                                  {r.status === "P" ? "Present" : "Absent"}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  ) : null}
                </div>
              </motion.div>
            )}
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
            Attendance saved for {sectionLabel}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}