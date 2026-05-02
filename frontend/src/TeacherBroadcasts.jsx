import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import "./TeacherDashV1.css"; // Core shell layout
import "./TeacherBroadcasts.css"; // Specific broadcast overrides

// ── CUSTOM SMOOTH COUNTER HOOK ──
function AnimatedCounter({ value, decimals = 0, suffix = "", duration = 1.2, delay = 0 }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    const num = Number(latest);
    return (isNaN(num) ? 0 : num).toFixed(decimals) + suffix;
  });

  useEffect(() => {
    const safeValue = Number(value);
    const finalValue = isNaN(safeValue) ? 0 : safeValue;
    const controls = animate(count, finalValue, { 
      duration: duration, 
      delay: delay, 
      ease: [0.34, 1.56, 0.64, 1] 
    });
    return () => controls.stop();
  }, [value, duration, delay, count]);

  return <motion.span>{rounded}</motion.span>;
}

// ── DUMMY DATA ─────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: "CS-3001", name: "OOAD · Sec A", students: 38 },
  { id: "CS-2010", name: "DSA · Sec B", students: 42 },
  { id: "CS-2012L", name: "DB Lab · Sec A", students: 35 },
];

const INITIAL_HISTORY = [
  { id: 1, subject: "Assignment 2 deadline extended", preview: "Due to the recent server outage, you now have until Friday midnight...", date: "Today · 10:30 AM", sections: ["CS-3001"], urgent: true },
  { id: 2, subject: "Quiz 3 Syllabus", preview: "Please note that Quiz 3 will cover chapters 4, 5, and the first half of 6.", date: "Yesterday · 02:15 PM", sections: ["CS-2010"], urgent: false },
  { id: 3, subject: "Welcome to the new semester", preview: "Looking forward to seeing you all in our first lab session tomorrow.", date: "Jan 12 · 09:00 AM", sections: ["CS-2012L", "CS-3001"], urgent: false },
];

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function TeacherBroadcasts() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const webglRef   = useRef(null);
  const sidebarRef = useRef(null);
  
  const [collapse, setCollapse] = useState(false);

  // Form State
  const [selectedSections, setSelectedSections] = useState(["CS-3001"]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [showToast, setShowToast] = useState(false);

  const isFormValid = selectedSections.length > 0 && subject.trim().length > 0 && message.trim().length > 0;

  const toggleSection = (id) => {
    setSelectedSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSend = () => {
    if (!isFormValid) return;
    
    const newBroadcast = {
      id: Date.now(),
      subject: subject,
      preview: message.substring(0, 70) + (message.length > 70 ? "..." : ""),
      date: "Just now",
      sections: selectedSections,
      urgent: isUrgent
    };

    setHistory([newBroadcast, ...history]);
    setSubject("");
    setMessage("");
    setIsUrgent(false);
    
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

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
        <nav id="sidebar" ref={sidebarRef} className={collapse ? "collapse" : ""} style={{ transform: "translateX(0)" }}>
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
                  {label === "Broadcasts" && <span className="nbadge">2</span>}
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
            <div className="pg-title"><span>Broadcasts</span></div>
            <div className="tb-r">
              <motion.div whileHover={{ scale: 1.05 }} className="sem-chip">Spring 2025</motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="notif-bell">🔔<span className="notif-dot"/></motion.div>
            </div>
          </div>

          <div id="scroll">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bc-layout"
            >
              {/* ── LEFT: COMPOSER (glass-card removed) ── */}
              <div className="bc-composer">
                <div className="panel-header">
                  <h2 className="ct"><div className="ctbar"/>New Broadcast</h2>
                </div>

                <div className="bc-form">
                  {/* Targets */}
                  <div className="bc-field">
                    <label>Send To</label>
                    <div className="bc-pills">
                      {SECTIONS.map(sec => (
                        <motion.button
                          key={sec.id}
                          className={`bc-pill ${selectedSections.includes(sec.id) ? "active" : ""}`}
                          onClick={() => toggleSection(sec.id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {sec.name}
                          {selectedSections.includes(sec.id) && <span className="pill-check">✓</span>}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="bc-field">
                    <input 
                      type="text" 
                      className="bc-subject-input" 
                      placeholder="Subject Line..." 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>

                  {/* Message Body */}
                  <div className="bc-field" style={{ flex: 1 }}>
                    <textarea 
                      className="bc-message-input" 
                      placeholder="Type your announcement here. Markdown is supported."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  {/* Footer / Actions */}
                  <div className="bc-composer-footer">
                    <div className="bc-priority-wrap">
                      <motion.button 
                        className={`bc-priority-btn ${isUrgent ? "urgent" : ""}`}
                        onClick={() => setIsUrgent(!isUrgent)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isUrgent ? "🔥 Urgent Alert" : "🔔 Normal Priority"}
                      </motion.button>
                    </div>

                    <div className="bc-stats-hint">
                      Reaching {selectedSections.reduce((acc, curr) => {
                        return acc + (SECTIONS.find(s => s.id === curr)?.students || 0);
                      }, 0)} Students
                    </div>

                    <motion.button 
                      className={`bc-send-btn ${isFormValid ? "ready" : ""}`}
                      disabled={!isFormValid}
                      onClick={handleSend}
                      whileHover={{ scale: isFormValid ? 1.02 : 1 }}
                      whileTap={{ scale: isFormValid ? 0.95 : 1 }}
                    >
                      Send Broadcast ✈
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* ── RIGHT: HISTORY LEDGER ── */}
              <div className="bc-ledger">
                
                {/* Mini KPI row for the Ledger (glass-card removed) */}
                <div className="bc-kpi-row">
                  <div className="bc-kpi-card">
                    <div className="bc-kpi-val blue">
                      <AnimatedCounter value={history.length} />
                    </div>
                    <div className="bc-kpi-lbl">Sent This Term</div>
                  </div>
                  <div className="bc-kpi-card">
                    <div className="bc-kpi-val green">
                      <AnimatedCounter value={94} suffix="%" />
                    </div>
                    <div className="bc-kpi-lbl">Avg Read Rate</div>
                  </div>
                </div>

                {/* History Panel (glass-card removed) */}
                <div className="bc-history-panel">
                  <div className="panel-header" style={{ marginBottom: "24px" }}>
                    <h2 className="ct"><div className="ctbar"/>Broadcast History</h2>
                  </div>

                  <div className="bc-history-list">
                    <AnimatePresence>
                      {history.map((item, idx) => (
                        <motion.div 
                          key={item.id}
                          className="bc-history-item hov-target"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ x: 4, backgroundColor: "rgba(26,100,255,0.03)" }}
                        >
                          <div className="bc-hi-header">
                            <div className="bc-hi-meta">
                              <span className="bc-hi-date">{item.date}</span>
                              <span className="bc-hi-sections">
                                {item.sections.join(", ")}
                              </span>
                            </div>
                            {item.urgent && <span className="bc-hi-urgent">URGENT</span>}
                          </div>
                          
                          <div className="bc-hi-subject">{item.subject}</div>
                          <div className="bc-hi-preview">{item.preview}</div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── TOAST ── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            className="bc-toast"
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ duration: 0.3, type: "spring" }}
          >
            <div className="toast-icon">✓</div>
            Broadcast sent successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}