import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { gsap } from "gsap";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import "./TeacherDashV1.css";
import AnimatedCounter from "./Utilities/AnimatedCounter";
import Sidebar from "./Components/shared/Sidebar";
import { TEACHER_NAV } from "./config/TeacherNav";


export default function TeacherDashV1() {
  const navigate = useNavigate();
  const location = useLocation();
  const webglRef = useRef(null);
  const introCanvasRef = useRef(null);
  const introRef = useRef(null);
  const appRef = useRef(null);
  const sidebarRef = useRef(null);
  const topbarRef = useRef(null);
  
  const [collapse, setCollapse] = useState(false);
  const [showStats, setShowStats] = useState(false); // Controls when data fades in

  const courses = [
    { color: "#1a78ff", name: "Object Oriented Analysis & Design", code: "CS-3001 · Sec A", grade: "38 Students" },
    { color: "#40a9ff", name: "Data Structures & Algorithms", code: "CS-2010 · Sec B", grade: "42 Students" },
    { color: "#69c0ff", name: "Database Systems", code: "CS-2012 · Sec A", grade: "35 Students" },
    { color: "#91d5ff", name: "Software Engineering", code: "CS-3005 · Sec C", grade: "40 Students" },
  ];

  const notices = [
    { tag: "Sent", cls: "tag-univ", title: "Assignment 2 deadline extended to Friday", date: "CS-3001 · Sec A · 2h ago", fire: true },
    { tag: "Sent", cls: "tag-univ", title: "Quiz 3 scheduled for next Tuesday", date: "CS-2010 · Sec B · 1d ago", fire: false },
    { tag: "Draft", cls: "tag-faculty", title: "Midterm marks have been uploaded", date: "CS-2012 · Sec A · Draft", fire: false },
  ];

  const attendances = [
    { pct: 72, label: "CS-2010", good: false },
    { pct: 88, label: "CS-3001", good: true },
    { pct: 92, label: "CS-2012", good: true },
  ];

  // ── CINEMATIC INTRO ──
  useEffect(() => {
    const hasPlayedIntro = sessionStorage.getItem("archTeacherIntroPlayed");

    if (hasPlayedIntro) {
      // 1. Set React state first
      setShowStats(true);

      // 2. Safely apply styles only if the refs are connected
      if (introRef.current) introRef.current.style.display = "none";
      if (appRef.current) appRef.current.style.opacity = 1;
      if (sidebarRef.current) sidebarRef.current.style.transform = "translateX(0)";
      if (topbarRef.current) topbarRef.current.style.opacity = 1;

      // 3. Handle WebGL ref safely
      if (webglRef.current) {
        webglRef.current.style.opacity = 0;
        webglRef.current.style.display = "none";
      }
      return;
    }

    const canvas = introCanvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const words = [
      "FACULTY","TEACHING","SYLLABUS","LECTURE","SEMESTER",
      "RESEARCH","PUBLICATIONS","ALERTS","STUDENT","GRADES",
      "EXAM","EVALUATION","RUBRIC","SCIENCE","ENGINEERING",
      "FAST","NUCES","PORTAL","ACADEMIC","FUTURE"
    ];

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      word: words[Math.floor(Math.random() * words.length)],
      opacity: Math.random() * 0.4 + 0.05,
      speed: Math.random() * 0.8 + 0.2,
      size: Math.floor(Math.random() * 10) + 10,
      flicker: Math.random() * 0.025 + 0.005,
      hue: Math.random() > 0.6 ? "255,255,255" : Math.random() > 0.5 ? "100,180,255" : "60,140,255",
    }));

    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5,
      opacity: Math.random() * 0.6 + 0.1,
      twinkle: Math.random() * 0.02,
    }));

    let animId, frame = 0;
    const draw = () => {
      ctx.fillStyle = "rgba(0,4,14,0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      frame++;

      stars.forEach((s) => {
        s.opacity += s.twinkle * (Math.random() > 0.5 ? 1 : -1);
        s.opacity = Math.max(0.05, Math.min(0.8, s.opacity));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,210,255,${s.opacity})`;
        ctx.fill();
      });

      particles.forEach((p) => {
        p.y -= p.speed * 0.4;
        p.opacity += p.flicker * (Math.random() > 0.5 ? 1 : -1);
        p.opacity = Math.max(0.03, Math.min(0.55, p.opacity));
        if (p.y < -30) {
          p.y = canvas.height + 20;
          p.x = Math.random() * canvas.width;
          p.word = words[Math.floor(Math.random() * words.length)];
        }
        ctx.font = `${p.size}px 'Inter', sans-serif`; 
        ctx.fillStyle = `rgba(${p.hue},${p.opacity})`;
        ctx.letterSpacing = "0.15em";
        ctx.fillText(p.word, p.x, p.y);
      });

      const scanY = ((frame * 1.8) % (canvas.height + 60)) - 30;
      const g = ctx.createLinearGradient(0, scanY - 4, 0, scanY + 4);
      g.addColorStop(0, "transparent");
      g.addColorStop(0.5, "rgba(80,160,255,0.12)");
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(0, scanY - 4, canvas.width, 8);

      [0.2, 0.5, 0.8].forEach((frac, i) => {
        const cx = canvas.width * frac;
        const colG = ctx.createLinearGradient(cx - 1, 0, cx + 1, 0);
        colG.addColorStop(0, "transparent");
        colG.addColorStop(0.5, `rgba(60,120,255,${0.04 + Math.sin(frame * 0.02 + i) * 0.02})`);
        colG.addColorStop(1, "transparent");
        ctx.fillStyle = colG;
        ctx.fillRect(cx - 30, 0, 60, canvas.height);
      });

      animId = requestAnimationFrame(draw);
    };
    ctx.fillStyle = "#00040e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    draw();

    const afterIntro = () => {
      cancelAnimationFrame(animId);
      sessionStorage.setItem("archTeacherIntroPlayed", "true"); 
      gsap.set(introRef.current, { display: "none" });
      gsap.to(appRef.current, { opacity: 1, duration: 0.6 });
      gsap.to(sidebarRef.current, { x: 0, duration: 1.2, ease: "expo.out", delay: 0.05 });
      gsap.to(topbarRef.current, { opacity: 1, duration: 0.7, delay: 0.4 });
      
      setTimeout(() => setShowStats(true), 600); // Trigger React animations smoothly

      gsap.to(webglRef.current, { opacity: 0, duration: 2.5, ease: "power2.inOut", delay: 0.5 });
      setTimeout(() => {
        if (webglRef.current) webglRef.current.style.display = "none";
      }, 3000);
    };

    const tl = gsap.timeline({ delay: 0.4, onComplete: afterIntro });
    tl.to("#intro-line", { scaleX: 1, duration: 0.8, ease: "power3.out" }, 0)
      .to("#intro-logo", { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }, 0.5)
      .to("#intro-logo", { textShadow: "0 0 80px rgba(80,160,255,1), 0 0 160px rgba(40,100,255,0.8), 0 0 300px rgba(0,60,200,0.5)", duration: 0.5 }, 1.0)
      .to("#intro-sub", { opacity: 1, y: 0, duration: 0.5 }, 1.1)
      .to("#intro-uni", { opacity: 1, duration: 0.4 }, 1.4)
      .to("#intro-logo", { scale: 50, opacity: 0, duration: 0.7, ease: "power4.in" }, 2.4)
      .to("#intro-sub", { opacity: 0, duration: 0.3 }, 2.4)
      .to("#intro-uni", { opacity: 0, duration: 0.3 }, 2.4)
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
        <div id="intro-uni">FAST National University · Lahore</div>
        <div id="intro-flash" />
      </div>

      <div id="app" ref={appRef}>
        <Sidebar
          sections={TEACHER_NAV}
          logoLabel="Faculty Portal"
          userName="Dr. Ahmed"
          userId="EMP-8492"
          collapse={collapse}
          onToggle={() => setCollapse(c => !c)}
        />

        <div id="main">
          <div id="topbar" ref={topbarRef}>
            <div className="pg-title"><span>Dashboard</span></div>
            <div className="tb-r">
              <motion.div whileHover={{ scale: 1.05 }} className="sem-chip">Spring 2025</motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="notif-bell">🔔<span className="notif-dot"/></motion.div>
            </div>
          </div>

          <div id="scroll">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="dash-container">
              
              {/* ── TOP KPI ROW (SPRING HOVER EFFECTS) ── */}
              <div className="kpi-grid">
                {[
                  { title: "Classes Today", val: 4, sub: "↑ 1 remaining", color: "green", delay: 0 },
                  { title: "Total Students", val: 155, sub: "across 4 sections", color: "dimmer", delay: 0.1 },
                  { title: "Pending Tasks", val: 2, sub: "sections unmarked", color: "amber", bubbles: true, delay: 0.2 },
                  { title: "Alerts Sent", val: 3, sub: "this week", color: "green", fire: true, delay: 0.3 }
                ].map((kpi, idx) => (
                  <motion.div 
                    key={idx}
                    className={`glass-card kpi-card kpi-anim-${idx}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: showStats ? 1 : 0, y: showStats ? 0 : 30 }}
                    transition={{ duration: 0.5, delay: kpi.delay, type: "spring", stiffness: 200 }}
                    whileHover={{ scale: 1.02, y: -6, boxShadow: "0 16px 40px rgba(26,120,255,0.15)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="kpi-title">{kpi.title}</div>
                    <div className="kpi-val blue">
                      {showStats ? <AnimatedCounter value={kpi.val} delay={kpi.delay} /> : "0"}
                    </div>
                    
                    <AnimatePresence>
                      {showStats && (
                        <motion.div 
                          className={`kpi-sub ${kpi.color}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: kpi.delay + 0.6 }}
                        >
                          {kpi.sub}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {kpi.bubbles && (
                      <div className="bubbles">
                        {[0,1,2,3,4,5,6].map(i => (
                          <span key={i} className="bubble" style={{ left:`${5+i*13}%`, animationDelay:`${i*0.3}s`, animationDuration:`${2+i*0.22}s`, width:`${6+i%3*2}px`, height:`${6+i%3*2}px` }} />
                        ))}
                      </div>
                    )}
                    {kpi.fire && (
                      <div className="dash-fire-container">
                        <div className="dash-fire">
                          <div className="dash-flame dash-flame--1" />
                          <div className="dash-flame dash-flame--2" />
                          <div className="dash-flame dash-flame--3" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* ── MAIN DASHBOARD GRID ── */}
              <div className="dash-grid">
                
                {/* LEFT: CURRENT SECTIONS */}
                <motion.div 
                  className="glass-card dash-panel courses-panel"
                  initial={{ opacity: 0, x: -30 }} animate={{ opacity: showStats ? 1 : 0, x: showStats ? 0 : -30 }} transition={{ delay: 0.4, type: "spring" }}
                  whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,0,0,0.12)" }}
                >
                  <div className="panel-header">
                    <h2 className="ct"><div className="ctbar"/>My Sections</h2>
                    <motion.span whileHover={{x: 4}} className="panel-link" onClick={() => navigate('/teacher/sections')}>Manage →</motion.span>
                  </div>
                  
                  <div className="dash-list">
                    {courses.map((c, i) => (
                      <motion.div whileHover={{ x: 6, backgroundColor: "rgba(26,100,255,0.05)" }} className="dash-course-item" key={i}>
                        <div className="dash-course-dot" style={{background: c.color}} />
                        <div className="dash-course-info">
                          <div className="dash-course-name">{c.name}</div>
                          <div className="dash-course-meta">{c.code}</div>
                        </div>
                        <div className="dash-course-grade">{c.grade}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* SMOOTH PROGRESS BARS */}
                  <div className="credit-progress-wrap">
                    <div className="progress-labels">
                      <span>Semester Progression</span>
                      <span>Week 6 / 16</span>
                    </div>
                    <div className="progress-bar-bg">
                      <motion.div className="progress-bar-fill done" initial={{ width: "0%" }} animate={{ width: showStats ? "40%" : "0%" }} transition={{ delay: 1, duration: 1.5, ease: "easeOut" }} />
                      <motion.div className="progress-bar-fill active" initial={{ width: "0%" }} animate={{ width: showStats ? "60%" : "0%" }} transition={{ delay: 1.2, duration: 1.5, ease: "easeOut" }} />
                    </div>
                    <div className="progress-legend">
                      <span className="leg-item"><div className="leg-dot done"/>Done: 6</span>
                      <span className="leg-item"><div className="leg-dot active"/>Active: 1</span>
                      <span className="leg-item"><div className="leg-dot left"/>Left: 9</span>
                    </div>
                  </div>
                </motion.div>

                {/* RIGHT COLUMN */}
                <div className="dash-right-col">
                  
                  {/* NOTICES */}
                  <motion.div 
                    className="glass-card dash-panel notices-panel"
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: showStats ? 1 : 0, x: showStats ? 0 : 30 }} transition={{ delay: 0.5, type: "spring" }}
                    whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,0,0,0.12)" }}
                  >
                    <div className="panel-header">
                      <h2 className="ct"><div className="ctbar"/>Recent Alerts</h2>
                      <motion.span whileHover={{x: 4}} className="panel-link" onClick={() => navigate('/teacher/alerts')}>Broadcast new →</motion.span>
                    </div>
                    <div className="dash-list">
                      {notices.map((n, i) => (
                        <motion.div whileHover={{ x: 6, backgroundColor: "rgba(26,100,255,0.05)" }} className="dash-notice-item" key={i}>
                          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                            <div className={`notice-tag ${n.cls}`}>{n.tag}</div>
                            {n.fire && (
                              <div className="inline-fire">
                                <div className="iflame if1"/><div className="iflame if2"/><div className="iflame if3"/>
                              </div>
                            )}
                          </div>
                          <div className="dash-notice-title">{n.title}</div>
                          <div className="dash-notice-date">{n.date}</div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* ATTENDANCE MINI-PANEL */}
                  <motion.div 
                    className="glass-card dash-panel attendance-panel"
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: showStats ? 1 : 0, y: showStats ? 0 : 30 }} transition={{ delay: 0.6, type: "spring" }}
                    whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,0,0,0.12)" }}
                  >
                    <div className="panel-header">
                      <h2 className="ct"><div className="ctbar"/>Section Health</h2>
                      <motion.span whileHover={{x: 4}} className="panel-link" onClick={() => navigate('/teacher/attendance')}>View all →</motion.span>
                    </div>
                    <div className="dash-att-grid">
                      {attendances.map((a, i) => (
                        <motion.div 
                          className={`dash-att-box ${a.good ? "safe" : "risk"}`} key={i}
                          whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.95 }}
                        >
                          {a.good && (
                            <div className="att-bubbles">
                              {[0,1,2,3].map(j => <span key={j} className="att-bubble" style={{left:`${10+j*25}%`,animationDelay:`${j*0.4}s`}}/>)}
                            </div>
                          )}
                          {!a.good && (
                            <div className="dash-fire-mini">
                              <div className="dash-flame dash-flame--1" />
                              <div className="dash-flame dash-flame--2" />
                              <div className="dash-flame dash-flame--3" />
                            </div>
                          )}
                          <div className="att-val">{showStats ? <AnimatedCounter value={a.pct} suffix="%" delay={0.8} /> : "0%"}</div>
                          <div className="att-lbl">{a.label}</div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}