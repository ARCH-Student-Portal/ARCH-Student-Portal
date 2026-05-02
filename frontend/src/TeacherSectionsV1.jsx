import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { gsap } from "gsap";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";

// IMPORT THE TEACHER SHELL CSS TO KEEP THE LAYOUT PERFECT
import "./TeacherDashV1.css";
// IMPORT THE SPECIFIC CSS FOR THE SECTIONS PAGE
import "./TeacherSections.css";

// ── CUSTOM SMOOTH COUNTER HOOK ──
function AnimatedCounter({ value, decimals = 0, suffix = "", duration = 1.2, delay = 0 }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => latest.toFixed(decimals) + suffix);

  useEffect(() => {
    const controls = animate(count, value, { 
      duration: duration, 
      delay: delay, 
      ease: [0.34, 1.56, 0.64, 1] // Springy ease
    });
    return controls.stop;
  }, [value, duration, delay, count]);

  return <motion.span>{rounded}</motion.span>;
}

export default function TeacherSectionsV1() {
  const navigate = useNavigate();
  const location = useLocation();

  const webglRef = useRef(null);
  const introCanvasRef = useRef(null);
  const introRef = useRef(null);
  const appRef = useRef(null);
  const sidebarRef = useRef(null);
  const topbarRef = useRef(null);
  const [collapse, setCollapse] = useState(false);
  const [activeTab, setActiveTab] = useState("CS-3001");
  const [showStats, setShowStats] = useState(false);

  const sectionsData = {
    "CS-3001": {
      name: "Object Oriented Analysis & Design",
      code: "CS-3001 · Section A",
      time: "Mon / Wed · 13:00 - 14:30",
      totalStudents: 38,
      avgAttendance: 88,
      students: [
        { id: "21K-3001", name: "Ali Khan", att: "92%", grade: "A", status: "ok" },
        { id: "21K-3045", name: "Sara Ahmed", att: "85%", grade: "B+", status: "ok" },
        { id: "21K-3112", name: "Usman Tariq", att: "74%", grade: "C", status: "warn" },
        { id: "21K-3210", name: "Areeb Bucha", att: "96%", grade: "A+", status: "ok" },
        { id: "21K-3344", name: "Hassan Raza", att: "62%", grade: "D", status: "danger" },
      ]
    },
    "CS-2010": {
      name: "Data Structures & Algorithms",
      code: "CS-2010 · Section B",
      time: "Tue / Thu · 08:00 - 09:30",
      totalStudents: 42,
      avgAttendance: 76,
      students: [
        { id: "22K-4011", name: "Bilal Hasan", att: "78%", grade: "B", status: "ok" },
        { id: "22K-4099", name: "Maha Syed", att: "82%", grade: "B+", status: "ok" },
        { id: "22K-4122", name: "Zainab Noor", att: "68%", grade: "C-", status: "warn" },
      ]
    }
  };

  const activeData = sectionsData[activeTab];

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

    const words = [
      "FACULTY","TEACHING","SYLLABUS","LECTURE","SEMESTER",
      "RESEARCH","PUBLICATIONS","ALERTS","STUDENT","GRADES",
      "EXAM","EVALUATION","RUBRIC","SCIENCE","ENGINEERING",
      "FAST","NUCES","PORTAL","ACADEMIC","FUTURE"
    ];

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      word: words[Math.floor(Math.random() * words.length)],
      opacity: Math.random() * 0.4 + 0.05, speed: Math.random() * 0.8 + 0.2,
      size: Math.floor(Math.random() * 10) + 10, flicker: Math.random() * 0.025 + 0.005,
      hue: Math.random() > 0.6 ? "255,255,255" : Math.random() > 0.5 ? "100,180,255" : "60,140,255",
    }));

    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.5, opacity: Math.random() * 0.6 + 0.1, twinkle: Math.random() * 0.02,
    }));

    let animId, frame = 0;
    const draw = () => {
      ctx.fillStyle = "rgba(0,4,14,0.18)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      frame++;
      stars.forEach((s) => {
        s.opacity += s.twinkle * (Math.random() > 0.5 ? 1 : -1);
        s.opacity = Math.max(0.05, Math.min(0.8, s.opacity));
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,210,255,${s.opacity})`; ctx.fill();
      });
      particles.forEach((p) => {
        p.y -= p.speed * 0.4; p.opacity += p.flicker * (Math.random() > 0.5 ? 1 : -1);
        p.opacity = Math.max(0.03, Math.min(0.55, p.opacity));
        if (p.y < -30) { p.y = canvas.height + 20; p.x = Math.random() * canvas.width; p.word = words[Math.floor(Math.random() * words.length)]; }
        ctx.font = `${p.size}px 'Inter', sans-serif`; 
        ctx.fillStyle = `rgba(${p.hue},${p.opacity})`;
        ctx.letterSpacing = "0.15em"; ctx.fillText(p.word, p.x, p.y);
      });
      animId = requestAnimationFrame(draw);
    };
    ctx.fillStyle = "#00040e"; ctx.fillRect(0, 0, canvas.width, canvas.height); draw();

    const afterIntro = () => {
      cancelAnimationFrame(animId);
      sessionStorage.setItem("archTeacherIntroPlayed", "true"); 
      gsap.set(introRef.current, { display: "none" });
      gsap.to(appRef.current, { opacity: 1, duration: 0.6 });
      gsap.to(sidebarRef.current, { x: 0, duration: 1.2, ease: "expo.out", delay: 0.05 });
      gsap.to(topbarRef.current, { opacity: 1, duration: 0.7, delay: 0.4 });
      
      setTimeout(() => setShowStats(true), 600);

      gsap.to(webglRef.current, { opacity: 0, duration: 2.5, ease: "power2.inOut", delay: 0.5 });
      setTimeout(() => { if (webglRef.current) webglRef.current.style.display = "none"; }, 3000);
    };

    const tl = gsap.timeline({ delay: 0.4, onComplete: afterIntro });
    tl.to("#intro-line", { scaleX: 1, duration: 0.8, ease: "power3.out" }, 0)
      .to("#intro-logo", { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }, 0.5)
      .to("#intro-sub", { opacity: 1, y: 0, duration: 0.5 }, 1.1)
      .to("#intro-logo", { scale: 50, opacity: 0, duration: 0.7, ease: "power4.in" }, 2.4)
      .to("#intro-sub", { opacity: 0, duration: 0.3 }, 2.4)
      .to("#intro-line", { opacity: 0, duration: 0.3 }, 2.4)
      .to("#intro-flash", { opacity: 1, duration: 0.08 }, 2.85)
      .to("#intro-flash", { opacity: 0, duration: 0.4 }, 2.93)
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
        <div id="intro-sub">Faculty Portal</div>
        <div id="intro-flash" />
      </div>

      <div id="app" ref={appRef}>
        
        {/* UNIFIED SIDEBAR */}
        <nav id="sidebar" ref={sidebarRef} className={collapse ? "collapse" : ""}>
          <div className="sb-top-bar" /><button className="sb-toggle hov-target" onClick={() => setCollapse(c => !c)}><span/><span/><span/></button> 
          <div className="sb-logo"><div className="logo-box">A</div><div><div className="logo-name">ARCH</div><div className="logo-tagline">Faculty Portal</div></div></div>
          <div className="sb-user hov-target" onClick={() => navigate('/teacher/profile')}>
            <div className="uav">Dr.</div><div><div className="uname">Dr. Ahmed</div><div className="uid">EMP-8492</div></div>
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
                <div className={`ni hov-target ${location.pathname === path ? " active" : ""}`} key={label} onClick={() => navigate(path)} style={{cursor: 'pointer'}}>
                  <div className="ni-ic">{ic}</div>{label}
                  {label === "Broadcasts" && <span className="nbadge">2</span>}
                </div>
              ))}
            </div>
          ))}
          <div className="sb-foot">Spring 2025 · FAST-NUCES</div>
        </nav>

        <div id="main">
          
          {/* UNIFIED TOPBAR */}
          <div id="topbar" ref={topbarRef}>
            <div className="tb-glow" />
            <div className="pg-title"><span>My Sections</span></div>
            <div className="tb-r">
              <motion.div whileHover={{ scale: 1.05 }} className="sem-chip">Spring 2025</motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="notif-bell">🔔<span className="notif-dot"/></motion.div>
            </div>
          </div>

          <div id="scroll">
            <div className="dash-container">
              
              {/* HEAVY TABS */}
              <div className="marks-tab-container">
                {Object.keys(sectionsData).map(k => (
                  <motion.button 
                    key={k} 
                    className={`marks-tab ${activeTab === k ? "active" : ""}`} 
                    onClick={() => setActiveTab(k)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {k}
                  </motion.button>
                ))}
              </div>

              <div className="dash-grid">
                
                {/* LEFT CARD: COMMAND BOARD */}
                <motion.div 
                  key={`left-${activeTab}`}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
                  className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '32px'}}
                  whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,0,0,0.12)" }}
                >
                  <div className="panel-header"><h2 className="ct"><div className="ctbar"/>Section Overview</h2></div>
                  
                  <div className="ts-course-header">
                    <h3 className="ts-course-name">{activeData.name}</h3>
                    <p className="ts-course-code">{activeData.code} &nbsp;&nbsp;|&nbsp;&nbsp; {activeData.time}</p>
                  </div>
                  
                  <div className="ts-viz-box">
                    <div className="ts-viz-info">
                      <div className="ts-viz-stat">
                        <div className="ts-stat-label">Total Students</div>
                        <h3>
                          {showStats ? <AnimatedCounter value={activeData.totalStudents} /> : "0"}
                        </h3>
                      </div>
                      <div className="ts-viz-stat">
                        <div className="ts-stat-label">Avg Attendance</div>
                        <h3>
                          {showStats ? <AnimatedCounter value={activeData.avgAttendance} /> : "0"}
                          <span style={{fontSize: '42px', color: 'var(--blue)', marginLeft: '4px'}}>%</span>
                        </h3>
                      </div>
                    </div>
                    {/* SCALED ISOMETRIC CHART */}
                    <div className="ts-iso-chart">
                      <motion.div className="iso-bar" initial={{ height: 0 }} animate={{ height: '90%' }} transition={{ duration: 1, delay: 0.2 }}>
                        <div className="iso-top"/><div className="iso-face"/>
                        <div className="iso-lbl">A</div>
                      </motion.div>
                      <motion.div className="iso-bar bar-b" initial={{ height: 0 }} animate={{ height: '60%' }} transition={{ duration: 1, delay: 0.3 }}>
                        <div className="iso-top"/><div className="iso-face"/>
                        <div className="iso-lbl">B</div>
                      </motion.div>
                      <motion.div className="iso-bar bar-c" initial={{ height: 0 }} animate={{ height: '40%' }} transition={{ duration: 1, delay: 0.4 }}>
                        <div className="iso-top"/><div className="iso-face"/>
                        <div className="iso-lbl">C</div>
                      </motion.div>
                      <motion.div className="iso-bar bar-f" initial={{ height: 0 }} animate={{ height: '15%' }} transition={{ duration: 1, delay: 0.5 }}>
                        <div className="iso-top"/><div className="iso-face"/>
                        <div className="iso-lbl">F</div>
                      </motion.div>
                    </div>
                  </div>

                  <div className="ts-actions">
                    <motion.button 
                      className="ts-btn btn-primary" 
                      onClick={() => navigate('/teacher/attendance')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Mark Attendance →
                    </motion.button>
                    <motion.button 
                      className="ts-btn btn-secondary" 
                      onClick={() => navigate('/teacher/gradebook')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Enter Grades →
                    </motion.button>
                  </div>
                </motion.div>

                {/* RIGHT CARD: CLASS ROSTER */}
                <motion.div 
                  key={`right-${activeTab}`}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
                  className="glass-card" style={{ padding: 0, overflow: 'hidden' }}
                  whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,0,0,0.12)" }}
                >
                  <div className="panel-header" style={{ padding: '32px 40px 16px' }}>
                    <h2 className="ct"><div className="ctbar"/>Class Roster</h2>
                  </div>
                  
                  <div className="ts-roster-header">
                    <div className="tr-id">Roll No</div>
                    <div className="tr-name">Student Identity</div>
                    <div className="tr-att">Att %</div>
                    <div className="tr-grd">Grade</div>
                  </div>
                  
                  <div className="ts-roster-list">
                    {activeData.students.map((s,i) => (
                      <motion.div 
                        className="ts-roster-row" 
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i }}
                        whileHover={{ x: 6, backgroundColor: "rgba(18,78,170,.06)", borderColor: "rgba(18,78,170,.15)" }}
                      >
                        <div className="tr-id">{s.id}</div>
                        <div className="tr-name">
                          <div className="tr-avatar">{s.name.charAt(0)}</div>
                          {s.name}
                        </div>
                        <div className={`tr-att status-${s.status}`}>{s.att}</div>
                        <div className="tr-grd">{s.grade}</div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}