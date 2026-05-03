import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { gsap } from "gsap";
import { motion } from "framer-motion";
import Sidebar from "./Components/shared/Sidebar";
import { TEACHER_NAV } from "./config/TeacherNav";
import "./TeacherDashV1.css";
import "./TeacherProfile.css";
import AnimatedCounter from "./Utilities/AnimatedCounter";
import TeacherApi from "./config/teacherApi";

export default function TeacherProfile() {
  const navigate   = useNavigate();
  const webglRef   = useRef(null);
  const introCanvasRef = useRef(null);
  const introRef   = useRef(null);
  const appRef     = useRef(null);
  const sidebarRef = useRef(null);
  const topbarRef  = useRef(null);

  const [collapse, setCollapse] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [teacherData, setTeacherData] = useState({
    name: '',
    employeeId: '',
    department: '',
    email: '',
    role: '',
    stats: { totalSections: 0, totalStudents: 0 }
  });

  const [hasPlayedIntro] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("archTeacherIntroPlayed") === "true";
    }
    return false;
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    sessionStorage.clear();
    navigate("/login");
  };

  // fetch teacher profile
  useEffect(() => {
    TeacherApi.getProfile()
      .then(res => {
        const t = res.teacher ?? {};
        const stats = res.stats ?? { totalSections: 0, totalStudents: 0 };
        setTeacherData({
          name: t.name ?? '',
          employeeId: t.employeeId ?? '',
          department: t.department ?? '',
          email: t.email ?? '',
          role: t.role ?? 'teacher',
          stats
        });
      })
      .catch(err => console.error('TeacherProfile fetch error:', err));
  }, []);

  // cinematic intro
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
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const words = ["FACULTY","PROFILE","RESEARCH","ACADEMICS","NUCES","SYSTEMS","ARCH","PORTAL"];
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

  // three.js background
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

  // derive initials
  const initials = teacherData.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'DR';

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

        <Sidebar
          ref={sidebarRef}
          sections={TEACHER_NAV}
          logoLabel="Faculty Portal"
          userName={teacherData.name || 'Teacher'}
          userId={teacherData.employeeId || ''}
          collapse={collapse}
          onToggle={() => setCollapse(c => !c)}
        />

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
              {/* LEFT: IDENTITY CARD */}
              <div className="tp-card tp-sidebar-card">
                <div className="tp-avatar-wrap">
                  <div className="tp-avatar">{initials}</div>
                  <div className="tp-status-dot"></div>
                </div>

                <h1 className="tp-name">{teacherData.name || 'Loading...'}</h1>
                <div className="tp-title">{teacherData.role === 'teacher' ? 'Faculty Member' : teacherData.role}</div>
                <div className="tp-id-badge">{teacherData.employeeId}</div>

                <div className="tp-contact-list">
                  <div className="tp-contact-item">
                    <span className="tp-ci-icon">✉</span>
                    <div className="tp-ci-text">{teacherData.email}</div>
                  </div>
                  <div className="tp-contact-item">
                    <span className="tp-ci-icon">🎓</span>
                    <div className="tp-ci-text">{teacherData.department}</div>
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

              {/* RIGHT: DOSSIER */}
              <div className="tp-main-content">

                {/* KPI Grid */}
                <div className="tp-stats-grid">
                  <div className="tp-card tp-stat-box">
                    <div className="tp-stat-val blue">
                      {showStats ? <AnimatedCounter value={teacherData.stats.totalSections} /> : "0"}
                    </div>
                    <div className="tp-stat-lbl">Sections Assigned</div>
                  </div>
                  <div className="tp-card tp-stat-box">
                    <div className="tp-stat-val green">
                      {showStats ? <AnimatedCounter value={teacherData.stats.totalStudents} /> : "0"}
                    </div>
                    <div className="tp-stat-lbl">Students This Semester</div>
                  </div>
                </div>

                {/* Department Panel */}
                <div className="tp-card tp-panel">
                  <div className="panel-header" style={{ marginBottom: "20px" }}>
                    <h2 className="ct"><div className="ctbar"/>Faculty Information</h2>
                  </div>
                  <div className="info-list">
                    <div className="info-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ color: '#94a3b8', fontWeight: 600 }}>Employee ID</span>
                      <span style={{ color: '#e2e8f0', fontWeight: 700, fontFamily: 'monospace' }}>{teacherData.employeeId}</span>
                    </div>
                    <div className="info-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ color: '#94a3b8', fontWeight: 600 }}>Department</span>
                      <span style={{ color: '#e2e8f0', fontWeight: 700 }}>{teacherData.department}</span>
                    </div>
                    <div className="info-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ color: '#94a3b8', fontWeight: 600 }}>Email</span>
                      <span style={{ color: '#e2e8f0', fontWeight: 700 }}>{teacherData.email}</span>
                    </div>
                    <div className="info-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                      <span style={{ color: '#94a3b8', fontWeight: 600 }}>Role</span>
                      <span style={{ color: '#1a78ff', fontWeight: 700, textTransform: 'capitalize' }}>{teacherData.role}</span>
                    </div>
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