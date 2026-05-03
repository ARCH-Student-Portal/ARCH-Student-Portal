import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedCounter from "./Utilities/AnimatedCounter";
import "./TeacherDashV1.css";
import "./TeacherBroadcasts.css";
import TeacherApi from "./config/teacherApi";

export default function TeacherBroadcasts() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const webglRef   = useRef(null);
  const sidebarRef = useRef(null);

  const [collapse,          setCollapse]         = useState(false);
  const [sections,          setSections]         = useState([]);
  const [selectedSections,  setSelectedSections] = useState([]);
  const [subject,           setSubject]          = useState("");
  const [message,           setMessage]          = useState("");
  const [isUrgent,          setIsUrgent]         = useState(false);
  const [history,           setHistory]          = useState([]);
  const [showToast,         setShowToast]        = useState(false);
  const [loading,           setLoading]          = useState(true);

  const teacherUser = JSON.parse(localStorage.getItem('user') || '{}');

  const isFormValid = selectedSections.length > 0 && subject.trim().length > 0 && message.trim().length > 0;

  // fetch sections and announcements
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sectionsRes, announcementsRes] = await Promise.all([
          TeacherApi.getSections(),
          TeacherApi.getAnnouncements()
        ]);

        const secs = (sectionsRes.sections || []).map(s => ({
          id: s.sectionId,
          courseId: s.courseId,
          name: `${s.courseCode} · Sec ${s.sectionName}`,
          students: s.studentCount
        }));
        setSections(secs);
        if (secs.length > 0) setSelectedSections([secs[0].id]);

        const hist = (announcementsRes.announcements || []).map(a => ({
          id: a.id,
          subject: a.title,
          preview: a.body?.substring(0, 70) + (a.body?.length > 70 ? "..." : ""),
          date: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          sections: a.course ? [a.course.code] : ['All'],
          urgent: a.isPinned
        }));
        setHistory(hist);
      } catch (err) {
        console.error('Broadcasts fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleSection = (id) => {
    setSelectedSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSend = async () => {
    if (!isFormValid) return;

    try {
      // find course id from first selected section
      const section = sections.find(s => s.id === selectedSections[0]);

      await TeacherApi.postAnnouncement({
        title: subject,
        body: message,
        type: 'faculty',
        course: section?.courseId || null,
        category: isUrgent ? 'notice' : 'notice'
      });

      const newBroadcast = {
        id: Date.now(),
        subject,
        preview: message.substring(0, 70) + (message.length > 70 ? "..." : ""),
        date: "Just now",
        sections: selectedSections.map(id => sections.find(s => s.id === id)?.name || id),
        urgent: isUrgent
      };

      setHistory(prev => [newBroadcast, ...prev]);
      setSubject("");
      setMessage("");
      setIsUrgent(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error('Send broadcast error:', err);
    }
  };

  // three.js background
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
      <div className="mesh-bg">
        <div className="mesh-blob blob-1" />
        <div className="mesh-blob blob-2" />
        <div className="mesh-blob blob-3" />
      </div>

      <canvas id="webgl" ref={webglRef} style={{ display: 'none' }} />

      <div id="app" style={{ opacity: 1, zIndex: 10, position: 'relative' }}>

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
            <div className="uav">{(teacherUser.name || 'DR').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}</div>
            <div>
              <div className="uname">{teacherUser.name || 'Teacher'}</div>
              <div className="uid">{teacherUser.employeeId || ''}</div>
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
                  {label === "Broadcasts" && history.length > 0 && (
                    <span className="nbadge">{history.length}</span>
                  )}
                </div>
              ))}
            </div>
          ))}

          <div className="sb-foot">Spring 2025 · FAST-NUCES</div>
        </nav>

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
              {/* LEFT: COMPOSER */}
              <div className="bc-composer">
                <div className="panel-header">
                  <h2 className="ct"><div className="ctbar"/>New Broadcast</h2>
                </div>

                <div className="bc-form">
                  <div className="bc-field">
                    <label>Send To</label>
                    <div className="bc-pills">
                      {loading ? (
                        <div style={{ color: '#94a3b8' }}>Loading sections...</div>
                      ) : sections.map(sec => (
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

                  <div className="bc-field">
                    <input
                      type="text"
                      className="bc-subject-input"
                      placeholder="Subject Line..."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>

                  <div className="bc-field" style={{ flex: 1 }}>
                    <textarea
                      className="bc-message-input"
                      placeholder="Type your announcement here."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

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
                        return acc + (sections.find(s => s.id === curr)?.students || 0);
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

              {/* RIGHT: HISTORY */}
              <div className="bc-ledger">
                <div className="bc-kpi-row">
                  <div className="bc-kpi-card">
                    <div className="bc-kpi-val blue">
                      <AnimatedCounter value={history.length} />
                    </div>
                    <div className="bc-kpi-lbl">Sent This Term</div>
                  </div>
                  <div className="bc-kpi-card">
                    <div className="bc-kpi-val green">
                      <AnimatedCounter value={sections.reduce((sum, s) => sum + s.students, 0)} />
                    </div>
                    <div className="bc-kpi-lbl">Total Students</div>
                  </div>
                </div>

                <div className="bc-history-panel">
                  <div className="panel-header" style={{ marginBottom: "24px" }}>
                    <h2 className="ct"><div className="ctbar"/>Broadcast History</h2>
                  </div>

                  <div className="bc-history-list">
                    <AnimatePresence>
                      {history.length === 0 ? (
                        <div style={{ color: '#94a3b8', padding: 20, textAlign: 'center' }}>
                          No broadcasts yet
                        </div>
                      ) : history.map((item, idx) => (
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
                                {Array.isArray(item.sections) ? item.sections.join(", ") : item.sections}
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