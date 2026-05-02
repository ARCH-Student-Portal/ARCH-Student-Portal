import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { gsap } from "gsap";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import Sidebar from "./Components/shared/Sidebar";
import { TEACHER_NAV } from "./config/TeacherNav";
import "./TeacherDashV1.css"; // Core shell layout
import "./TeacherProfile.css"; // Specific profile overrides

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
const TEACHER_INFO = {
  name: "Dr. Ahmed Hassan",
  id: "EMP-8492",
  title: "Associate Professor",
  department: "Computer Science",
  email: "ahmed.hassan@nu.edu.pk",
  phone: "+92 300 1234567",
  office: "Faculty Block, Room 12",
  bio: "Dr. Ahmed specializes in Software Architecture and Distributed Systems. With over a decade of industry experience before joining academia, he brings real-world enterprise engineering practices into the classroom.",
  stats: {
    courses: 24,
    students: 1850,
    publications: 32,
    years: 8
  },
  publications: [
    { id: 1, title: "Scalable Microservices in High-Latency Environments", year: "2024", journal: "IEEE Transactions on Software Engineering" },
    { id: 2, title: "Optimizing React-Based Enterprise Dashboards", year: "2023", journal: "Journal of Web Engineering" },
    { id: 3, title: "A Study on Student Engagement in Remote Computer Science Education", year: "2022", journal: "ACM SIGCSE" },
  ]
};

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function TeacherProfile() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const webglRef   = useRef(null);
  const introCanvasRef = useRef(null);
  const introRef   = useRef(null);
  const appRef     = useRef(null);
  const sidebarRef = useRef(null);
  const topbarRef  = useRef(null);
  
  const [collapse, setCollapse] = useState(false);

  // Safely check session storage
  const [hasPlayedIntro] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("archTeacherIntroPlayed") === "true";
    }
    return false;
  });

  const [showStats, setShowStats] = useState(hasPlayedIntro);

  const handleLogout = () => {
    // Clear session storage to reset intro animations on next login
    sessionStorage.clear();
    navigate("/login");
  };

  // ── CINEMATIC INTRO ──
  useEffect(() => {
    if (hasPlayedIntro) {
      if (introRef.current) introRef.current.style.display = "none";
      if (appRef.current) appRef.current.style.opacity = 1;
      if (sidebarRef.current) sidebarRef.current.style.transform = "translateX(0)";
      if (topbarRef.current) topbarRef.current.style.opacity = 1;
      if (webglRef.current) webglRef.current.style.display = "none";
      setShowStats(true);
      return;
    }

    const canvas = introCanvasRef.current;
    if(!canvas) return;
    const ctx    = canvas.getContext("2d");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const words = ["FACULTY","PROFILE","RESEARCH","ACADEMICS","NUCES","SYSTEMS", "ARCH", "PORTAL"];
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      word: words[Math.floor(Math.random() * words.length)],
      opacity: Math.random() * 0.4 + 0.05, speed: Math.random() * 0.8 + 0.2,
      size: Math.floor(Math.random() * 10) + 10, flicker: Math.random() * 0.025 + 0.005,
      hue: Math.random() > 0.6 ? "255,255,255" : "100,180,255",
    }));
    let animId;
    const draw = () => {
      ctx.fillStyle = "rgba(0,4,14,0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.y -= p.speed * 0.4;
        if (p.y < -30) { p.y = canvas.height + 20; p.x = Math.random() * canvas.width; }
        ctx.font = `${p.size}px 'Inter', sans-serif`;
        ctx.fillStyle = `rgba(${p.hue},${p.opacity})`;
        ctx.fillText(p.word, p.x, p.y);
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    const tl = gsap.timeline({ onComplete: () => {
      cancelAnimationFrame(animId);
      sessionStorage.setItem("archTeacherIntroPlayed", "true");
      gsap.set(introRef.current, { display: "none" });
      gsap.to(appRef.current, { opacity: 1, duration: 0.6 });
      gsap.to(sidebarRef.current, { x: 0, duration: 1.2 });
      gsap.to(topbarRef.current, { opacity: 1, duration: 0.7 });
      setTimeout(() => setShowStats(true), 600);
      gsap.to(webglRef.current, { opacity: 0, duration: 2.5 });
      setTimeout(() => { if (webglRef.current) webglRef.current.style.display = "none"; }, 3000);
    }});
    
    tl.to("#intro-logo", { opacity: 1, scale: 1, duration: 0.7 }, 0.5)
      .to("#intro-logo", { scale: 50, opacity: 0, duration: 0.7 }, 2.4);
      
    return () => cancelAnimationFrame(animId);
  }, [hasPlayedIntro]);

  // ── THREE.JS BACKGROUND ──
  useEffect(() => {
    if (hasPlayedIntro) return;
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
  }, [hasPlayedIntro]);

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

      <div id="intro" ref={introRef}>
        <canvas id="intro-canvas" ref={introCanvasRef} />
        <div id="intro-logo">ARCH</div>
      </div>

      <div id="app" ref={appRef} style={{ opacity: hasPlayedIntro ? 1 : 0, zIndex: 10, position: 'relative' }}>
        
        {/* ── SIDEBAR ── */}
        <Sidebar
          sections={TEACHER_NAV}
          logoLabel="Faculty Portal"
          userName="Dr. Ahmed"
          userId="EMP-8492"
          collapse={collapse}
          onToggle={() => setCollapse(c => !c)}
        />

        {/* ── MAIN ── */}
        <div id="main">
          <div id="topbar" ref={topbarRef} style={{ opacity: hasPlayedIntro ? 1 : 0 }}>
            <div className="tb-glow" />
            <div className="pg-title"><span>Faculty Profile</span></div>
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
              className="tp-layout"
            >
              {/* ── LEFT: IDENTITY CARD ── */}
              <div className="tp-card tp-sidebar-card">
                <div className="tp-avatar-wrap">
                  <div className="tp-avatar">Dr.</div>
                  <div className="tp-status-dot"></div>
                </div>
                
                <h1 className="tp-name">{TEACHER_INFO.name}</h1>
                <div className="tp-title">{TEACHER_INFO.title}</div>
                <div className="tp-id-badge">{TEACHER_INFO.id}</div>

                <div className="tp-contact-list">
                  <div className="tp-contact-item">
                    <span className="tp-ci-icon">✉</span>
                    <div className="tp-ci-text">{TEACHER_INFO.email}</div>
                  </div>
                  <div className="tp-contact-item">
                    <span className="tp-ci-icon">✆</span>
                    <div className="tp-ci-text">{TEACHER_INFO.phone}</div>
                  </div>
                  <div className="tp-contact-item">
                    <span className="tp-ci-icon">🏢</span>
                    <div className="tp-ci-text">{TEACHER_INFO.office}</div>
                  </div>
                  <div className="tp-contact-item">
                    <span className="tp-ci-icon">🎓</span>
                    <div className="tp-ci-text">{TEACHER_INFO.department}</div>
                  </div>
                </div>

                <motion.button 
                  className="tp-logout-btn"
                  onClick={handleLogout}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span style={{ fontSize: 18, marginRight: 8 }}>⏏</span> Secure Logout
                </motion.button>
              </div>

              {/* ── RIGHT: DOSSIER ── */}
              <div className="tp-main-content">
                
                {/* KPI Grid */}
                <div className="tp-stats-grid">
                  <div className="tp-card tp-stat-box">
                    <div className="tp-stat-val blue">
                      {showStats ? <AnimatedCounter value={TEACHER_INFO.stats.courses} /> : "0"}
                    </div>
                    <div className="tp-stat-lbl">Courses Taught</div>
                  </div>
                  <div className="tp-card tp-stat-box">
                    <div className="tp-stat-val green">
                      {showStats ? <AnimatedCounter value={TEACHER_INFO.stats.students} /> : "0"}
                    </div>
                    <div className="tp-stat-lbl">Students Mentored</div>
                  </div>
                  <div className="tp-card tp-stat-box">
                    <div className="tp-stat-val amber">
                      {showStats ? <AnimatedCounter value={TEACHER_INFO.stats.publications} /> : "0"}
                    </div>
                    <div className="tp-stat-lbl">Publications</div>
                  </div>
                </div>

                {/* Bio Panel */}
                <div className="tp-card tp-panel">
                  <div className="panel-header" style={{ marginBottom: "20px" }}>
                    <h2 className="ct"><div className="ctbar"/>Biography</h2>
                  </div>
                  <p className="tp-bio-text">{TEACHER_INFO.bio}</p>
                </div>

                {/* Publications Panel */}
                <div className="tp-card tp-panel" style={{ flex: 1 }}>
                  <div className="panel-header" style={{ marginBottom: "24px" }}>
                    <h2 className="ct"><div className="ctbar"/>Recent Publications</h2>
                  </div>
                  
                  <div className="tp-pub-list">
                    {TEACHER_INFO.publications.map((pub, idx) => (
                      <motion.div 
                        key={pub.id} 
                        className="tp-pub-item"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <div className="tp-pub-year">{pub.year}</div>
                        <div className="tp-pub-content">
                          <div className="tp-pub-title">{pub.title}</div>
                          <div className="tp-pub-journal">{pub.journal}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}