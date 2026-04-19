import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { gsap } from "gsap";

// IMPORT THE SHELL CSS TO KEEP THE LAYOUT PERFECT
import "./StudentDashV1.css";
// IMPORT THE SPECIFIC CSS FOR THE SECTIONS PAGE
import "./TeacherSections.css";

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

  const sectionsData = {
    "CS-3001": {
      name: "Object Oriented Analysis & Design",
      code: "CS-3001 · Sec A",
      time: "Mon/Wed 13:00 - 14:30",
      totalStudents: 38,
      avgAttendance: "88%",
      students: [
        { id: "21K-3001", name: "Ali Khan", att: "92%", grade: "A", status: "ok" },
        { id: "21K-3045", name: "Sara Ahmed", att: "85%", grade: "B+", status: "ok" },
        { id: "21K-3112", name: "Usman Tariq", att: "74%", grade: "C", status: "warn" },
      ]
    },
    "CS-2010": {
      name: "Data Structures & Algorithms",
      code: "CS-2010 · Sec B",
      time: "Tue/Thu 08:00 - 09:30",
      totalStudents: 42,
      avgAttendance: "76%",
      students: [
        { id: "22K-4011", name: "Bilal Hasan", att: "78%", grade: "B", status: "ok" },
        { id: "22K-4099", name: "Maha Syed", att: "82%", grade: "B+", status: "ok" },
      ]
    }
  };

  const activeData = sectionsData[activeTab];

  // ── MARVEL INTRO (Full) ──
  useEffect(() => {
    const hasPlayedIntro = sessionStorage.getItem("archTeacherIntroPlayed");
    if (hasPlayedIntro) {
      introRef.current.style.display = "none";
      appRef.current.style.opacity = 1;
      sidebarRef.current.style.transform = "translateX(0)";
      topbarRef.current.style.opacity = 1;
      return;
    }

    const canvas = introCanvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;

    const words = ["FACULTY","TEACHING","SYLLABUS","LECTURE","SEMESTER","RESEARCH","PUBLICATIONS","ALERTS","STUDENT","GRADES"];
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      word: words[Math.floor(Math.random() * words.length)],
      opacity: Math.random() * 0.4 + 0.05, speed: Math.random() * 0.8 + 0.2,
      size: Math.floor(Math.random() * 10) + 10, flicker: Math.random() * 0.025 + 0.005,
      hue: "100,180,255"
    }));

    let animId, frame = 0;
    const draw = () => {
      ctx.fillStyle = "rgba(0,4,14,0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      frame++;
      particles.forEach((p) => {
        p.y -= p.speed * 0.4;
        if (p.y < -30) { p.y = canvas.height + 20; }
        ctx.font = `${p.size}px 'Space Grotesk', sans-serif`;
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
    }});
    tl.to("#intro-logo", { opacity: 1, scale: 1, duration: 0.7 }, 0.5)
      .to("#intro-logo", { scale: 50, opacity: 0, duration: 0.7 }, 2.4);

    return () => cancelAnimationFrame(animId);
  }, []);

  // ── THREE.JS BACKGROUND ──
  useEffect(() => {
    const canvas = webglRef.current;
    let W = window.innerWidth, H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setClearColor(0xf4f8ff, 1);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 200);
    camera.position.set(0, 2, 10);
    scene.add(new THREE.AmbientLight(0x0033aa, 0.8));
    
    // Animate
    let animId;
    const loop = () => {
      animId = requestAnimationFrame(loop);
      renderer.render(scene, camera);
    };
    loop();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <>
      <div className="scanlines" />
      <div className="vignette" />
      <canvas id="webgl" ref={webglRef} />
      
      {/* INTRO */}
      <div id="intro" ref={introRef}>
        <canvas id="intro-canvas" ref={introCanvasRef} />
        <div id="intro-logo">ARCH</div>
      </div>

      <div id="app" ref={appRef}>
        <nav id="sidebar" ref={sidebarRef}>
          <div className="sb-logo">
            <div className="logo-box">A</div>
            <div><div className="logo-name">ARCH</div><div className="logo-tagline">Faculty Portal</div></div>
          </div>
          <div className="sb-user">
            <div className="uav">Dr.</div>
            <div><div className="uname">Dr. Ahmed</div><div className="uid">EMP-8492</div></div>
          </div>
          
          <div className="nav-sec">Management</div>
          <div className="ni active" onClick={() => navigate('/teacher/sections')}><div className="ni-ic">◈</div>My Sections</div>
          <div className="ni" onClick={() => navigate('/teacher/dashboard')}><div className="ni-ic">⊞</div>Dashboard</div>
          <div className="sb-foot">Spring 2025 · FAST-NUCES</div>
        </nav>

        <div id="main">
          <div id="topbar" ref={topbarRef}>
            <div className="pg-title"><span>My Sections</span></div>
          </div>

          <div id="scroll">
            <div className="ts-tabs">
                {Object.keys(sectionsData).map(k => (
                    <button key={k} className={`ts-tab ${activeTab === k ? "active" : ""}`} onClick={() => setActiveTab(k)}>{k}</button>
                ))}
            </div>

            <div className="cgrid" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="glass-card">
                <div className="ch"><div className="ct"><div className="ctbar"/>Overview</div></div>
                <h2 style={{color:'#145ec9', marginBottom:'10px'}}>{activeData.name}</h2>
                <div className="ts-action-grid">
                    <button className="ts-btn" onClick={() => navigate('/teacher/attendance')}>Mark Attendance</button>
                    <button className="ts-btn" onClick={() => navigate('/teacher/gradebook')}>Enter Grades</button>
                </div>
              </div>

              <div className="glass-card">
                <div className="ch"><div className="ct"><div className="ctbar"/>Class Roster</div></div>
                <div className="ts-table">
                    {activeData.students.map((s,i) => (
                    <div className="ts-row" key={i}>
                        <span>{s.id}</span>
                        <span style={{fontWeight:600}}>{s.name}</span>
                        <span className={s.status}>{s.att}</span>
                    </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }