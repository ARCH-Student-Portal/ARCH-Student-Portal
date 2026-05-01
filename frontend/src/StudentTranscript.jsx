import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import "./StudentTranscript.css";

const SEMESTERS = [
  {
    id: "fall22", name: "Fall 2022", label: "F-22", year: "1st Year",
    courses: [
      { code: "CS-1001", name: "Programming Fundamentals",          cr: 3, grade: "B+", points: 3.3 },
      { code: "CS-1002", name: "Discrete Structures",               cr: 3, grade: "B",  points: 3.0 },
      { code: "MT-1001", name: "Calculus & Analytic Geometry",      cr: 3, grade: "C+", points: 2.3 },
      { code: "EE-1001", name: "Applied Physics",                   cr: 3, grade: "B-", points: 2.7 },
      { code: "HU-1001", name: "Islamic Studies / Ethics",          cr: 2, grade: "A",  points: 4.0 },
      { code: "HU-1002", name: "Functional English",                cr: 2, grade: "B+", points: 3.3 },
    ], gpa: 2.81,
  },
  {
    id: "spr23", name: "Spring 2023", label: "S-23", year: "1st Year",
    courses: [
      { code: "CS-1003", name: "Object-Oriented Programming",       cr: 4, grade: "A-", points: 3.7 },
      { code: "CS-1004", name: "Digital Logic Design",              cr: 3, grade: "B+", points: 3.3 },
      { code: "MT-1002", name: "Linear Algebra",                    cr: 3, grade: "B",  points: 3.0 },
      { code: "EE-1002", name: "Workshop Practice",                 cr: 1, grade: "A",  points: 4.0 },
      { code: "HU-1003", name: "Communication Skills",              cr: 2, grade: "A-", points: 3.7 },
      { code: "HU-1004", name: "Pakistan Studies",                  cr: 2, grade: "B+", points: 3.3 },
    ], gpa: 3.12,
  },
  {
    id: "fall23", name: "Fall 2023", label: "F-23", year: "2nd Year",
    courses: [
      { code: "CS-2001", name: "Data Structures & Algorithms",      cr: 4, grade: "A",  points: 4.0 },
      { code: "CS-2002", name: "Computer Organization",             cr: 3, grade: "A-", points: 3.7 },
      { code: "CS-2003", name: "Numerical Methods",                 cr: 3, grade: "B+", points: 3.3 },
      { code: "MT-2001", name: "Probability & Statistics",          cr: 3, grade: "B+", points: 3.3 },
      { code: "HU-2001", name: "Professional Ethics",               cr: 2, grade: "A",  points: 4.0 },
    ], gpa: 3.29,
  },
  {
    id: "spr24", name: "Spring 2024", label: "S-24", year: "2nd Year",
    courses: [
      { code: "CS-2012", name: "Database Systems",                  cr: 4, grade: "A",  points: 4.0 },
      { code: "CS-2011", name: "Operating Systems",                 cr: 4, grade: "A-", points: 3.7 },
      { code: "CS-2010", name: "Computer Networks",                 cr: 3, grade: "B+", points: 3.3 },
      { code: "MT-2005", name: "Differential Equations",            cr: 3, grade: "B+", points: 3.3 },
      { code: "HU-2002", name: "Technical Report Writing",          cr: 2, grade: "A",  points: 4.0 },
    ], gpa: 3.54,
  },
  {
    id: "fall24", name: "Fall 2024", label: "F-24", year: "3rd Year",
    courses: [
      { code: "CS-3001", name: "Object Oriented Analysis & Design", cr: 3, grade: "A",  points: 4.0 },
      { code: "CS-3004", name: "Artificial Intelligence",           cr: 4, grade: "A-", points: 3.7 },
      { code: "CS-3012", name: "Computer Networks",                 cr: 3, grade: "A",  points: 4.0 },
      { code: "CS-3015", name: "Operating Systems",                 cr: 3, grade: "A",  points: 4.0 },
      { code: "MT-3001", name: "Linear Algebra",                    cr: 3, grade: "A-", points: 3.7 },
    ], gpa: 3.75,
  },
  {
    id: "spr25", name: "Spring 2025", label: "S-25", year: "3rd Year",
    courses: [
      { code: "CS-3005", name: "Web Programming",                   cr: 3, grade: "A",  points: 4.0 },
      { code: "CS-2012", name: "Database Systems",                  cr: 4, grade: "A",  points: 4.0 },
      { code: "MT-2005", name: "Probability & Statistics",          cr: 3, grade: "A-", points: 3.7 },
    ], gpa: 3.82, inProgress: true,
  },
];

function gpaClass(gpa) {
  if (gpa >= 3.5) return "gpa-excellent";
  if (gpa >= 3.0) return "gpa-good";
  if (gpa >= 2.0) return "gpa-average";
  return "gpa-poor";
}

function gradeClass(grade) {
  const g = grade[0];
  if (g === "A") return "grade-A";
  if (g === "B") return "grade-B";
  if (g === "C") return "grade-C";
  if (g === "D") return "grade-D";
  return "grade-F";
}

function accentClass(gpa) {
  if (gpa >= 3.5) return "green";
  if (gpa >= 3.0) return "";
  return "gold";
}

function TranscriptCard({ sem }) {
  const totalCr  = sem.courses.reduce((s, c) => s + c.cr, 0);
  const totalQP  = sem.courses.reduce((s, c) => s + c.cr * c.points, 0);

  return (
    <div className={`tr-sem-card ${gpaClass(sem.gpa)}`}>
      <div className={`tr-card-accent ${accentClass(sem.gpa)}`} />

      <div className="tr-card-hd">
        <div>
          <div className="tr-card-sem-name">
            {sem.name}
            {sem.inProgress && (
              <span className="in-progress-badge">
                In Progress
              </span>
            )}
          </div>
          <div className="tr-card-sem-sub">{sem.year} · {sem.courses.length} courses</div>
        </div>

        <div className="tr-sem-gpa-ring">
          <div className="tr-sem-gpa-val">{sem.gpa.toFixed(2)}</div>
          <div className="tr-sem-gpa-lbl">GPA</div>
        </div>
      </div>

      <div className="tr-course-table">
        <table className="tr-table">
          <thead>
            <tr>
              <th style={{ width: "100px" }}>Code</th>
              <th style={{ textAlign: "left" }}>Course</th>
              <th style={{ width: "60px" }}>Cr</th>
              <th style={{ width: "100px" }}>Grade</th>
              <th style={{ width: "80px" }}>QP</th>
            </tr>
          </thead>
          <tbody>
            {sem.courses.map((c, i) => (
              <tr className="tr-course-row" key={i}>
                <td className="tr-td-code">{c.code}</td>
                <td className="tr-td-name">{c.name}</td>
                <td className="tr-td-cr">{c.cr}</td>
                <td>
                  <span className={`tr-grade ${gradeClass(c.grade)}`}>{c.grade}</span>
                </td>
                <td className="tr-td-qp">{(c.cr * c.points).toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="tr-card-foot">
        <div className="tr-foot-stat">
          <span className="tr-foot-label">Credits</span>
          <span className="tr-foot-value blue">{totalCr}</span>
        </div>
        <div className="tr-foot-stat">
          <span className="tr-foot-label">Quality Points</span>
          <span className="tr-foot-value">{totalQP.toFixed(1)}</span>
        </div>
        <div className="tr-foot-stat" style={{ marginLeft: "auto" }}>
          <span className="tr-foot-label">Sem GPA</span>
          <span className="tr-foot-value green">{sem.gpa.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

export default function StudentTranscript() {
  const navigate = useNavigate();
  const location = useLocation();
  const webglRef = useRef(null);
  const introCanvasRef = useRef(null);
  const introRef = useRef(null);
  const appRef = useRef(null);
  const sidebarRef = useRef(null);

  const [collapse, setCollapse]   = useState(false);
  const [activeIdx, setActiveIdx] = useState(SEMESTERS.length - 1); 

  const prev = () => setActiveIdx(i => Math.max(0, i - 1));
  const next = () => setActiveIdx(i => Math.min(SEMESTERS.length - 1, i + 1));

  const completedSems = SEMESTERS.filter(s => !s.inProgress);
  const totalCrDone   = completedSems.reduce((s, sem) => s + sem.courses.reduce((a, c) => a + c.cr, 0), 0);
  const totalQPDone   = completedSems.reduce((s, sem) => s + sem.courses.reduce((a, c) => a + c.cr * c.points, 0), 0);
  const cgpa          = totalCrDone > 0 ? (totalQPDone / totalCrDone).toFixed(2) : "—";
  const allCr         = SEMESTERS.reduce((s, sem) => s + sem.courses.reduce((a, c) => a + c.cr, 0), 0);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const hasPlayedIntro = sessionStorage.getItem("archIntroPlayed");

    if (hasPlayedIntro) {
      introRef.current.style.display = "none";
      appRef.current.style.opacity = 1;
      sidebarRef.current.style.transform = "translateX(0)";
      
      if (webglRef.current) {
        webglRef.current.style.opacity = 0;
        webglRef.current.style.display = "none";
      }
      return; 
    }

    const canvas = introCanvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const words = ["TRANSCRIPT","GRADES","CGPA","CREDITS","ACADEMICS","HONORS"];
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      word: words[Math.floor(Math.random() * words.length)],
      opacity: Math.random() * 0.4 + 0.05, speed: Math.random() * 0.8 + 0.2,
      size: Math.floor(Math.random() * 10) + 10, flicker: Math.random() * 0.025 + 0.005,
      hue: Math.random() > 0.6 ? "255,255,255" : "60,140,255",
    }));

    let animId;
    const draw = () => {
      ctx.fillStyle = "rgba(0,4,14,0.18)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.y -= p.speed * 0.4; p.opacity += p.flicker * (Math.random() > 0.5 ? 1 : -1);
        p.opacity = Math.max(0.03, Math.min(0.55, p.opacity));
        if (p.y < -30) { p.y = canvas.height + 20; p.x = Math.random() * canvas.width; }
        ctx.font = `${p.size}px 'Inter', sans-serif`; 
        ctx.fillStyle = `rgba(${p.hue},${p.opacity})`;
        ctx.fillText(p.word, p.x, p.y);
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    const afterIntro = () => {
      cancelAnimationFrame(animId);
      sessionStorage.setItem("archIntroPlayed", "true"); 
      gsap.set(introRef.current, { display: "none" });
      gsap.to(appRef.current, { opacity: 1, duration: 0.6 });
      gsap.to(sidebarRef.current, { x: 0, duration: 1.2, ease: "expo.out" });
      
      gsap.to(webglRef.current, { opacity: 0, duration: 2.5, ease: "power2.inOut", delay: 0.5 });
      setTimeout(() => {
        if (webglRef.current) webglRef.current.style.display = "none";
      }, 3000);
    };

    const tl = gsap.timeline({ delay: 0.2, onComplete: afterIntro });
    tl.to("#intro-line", { scaleX: 1, duration: 0.8, ease: "power3.out" })
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

  useEffect(() => {
    if (sessionStorage.getItem("archIntroPlayed")) return;

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
        <div id="intro-sub">Academic Transcript</div>
        <div id="intro-flash" />
      </div>

      <div id="app" ref={appRef}>

        <nav id="sidebar" ref={sidebarRef} className={collapse ? "collapse" : ""}>
          <div className="sb-top-bar" />
          <button className="sb-toggle" onClick={() => setCollapse(c => !c)}>
            <span /><span /><span />
          </button>
          <div className="sb-logo">
            <div className="logo-box">A</div>
            <div>
              <div className="logo-name">ARCH</div>
              <div className="logo-tagline">Student Portal</div>
            </div>
          </div>
          <div className="sb-user">
            <div className="uav">AB</div>
            <div>
              <div className="uname">Areeb Bucha</div>
              <div className="uid">21K-3210</div>
            </div>
          </div>
          {[
            ["Overview",      [["⊞","Dashboard","/student/dashboard"],["◎","Academic","/student/academic"]]],
            ["Courses",       [["＋","Registration","/student/registration"],["◈","Transcript","/student/transcript"],["▦","Marks","/student/marks"],["✓","Attendance","/student/attendance"],["▤","Timetable","/student/timetable"]]],
            ["Communication", [["◉","Notices","/student/notices"]]],
            ["Account",       [["◌","Profile","/student/profile"]]],
          ].map(([sec, items]) => (
            <div key={sec}>
              <div className="nav-sec">{sec}</div>
              {items.map(([ic, label, path]) => (
                <div
                  key={label}
                  className={`ni${location.pathname === path ? " active" : ""}`}
                  onClick={() => navigate(path)}
                  style={{cursor: 'pointer'}}
                >
                  <div className="ni-ic">{ic}</div>{label}
                </div>
              ))}
            </div>
          ))}
        </nav>

        <div id="main">
          <div id="topbar">
            <div className="pg-title">Academic Transcript</div>
            <div className="tb-r">
              <div className="sem-chip">21K-3210 · BS-CS</div>
            </div>
          </div>

          <div id="scroll">
            <div className="tr-stage">

              <div className="tr-stats-bar">
                <div className="tr-stat-item">
                  <div className="tr-stat-label">Cumulative GPA</div>
                  <div className="tr-stat-value green">{cgpa}</div>
                </div>
                <div className="tr-stat-item">
                  <div className="tr-stat-label">Credits Earned</div>
                  <div className="tr-stat-value blue">{totalCrDone}</div>
                </div>
                <div className="tr-stat-item">
                  <div className="tr-stat-label">Total Credits (incl. current)</div>
                  <div className="tr-stat-value">{allCr}</div>
                </div>
                <div className="tr-stat-item">
                  <div className="tr-stat-label">Semesters Completed</div>
                  <div className="tr-stat-value">{completedSems.length}</div>
                </div>
                <div className="tr-stat-item" style={{marginLeft: 'auto', borderRight: 'none', alignItems: 'flex-end', justifyContent: 'center'}}>
                  <div className="tr-stat-label">Program</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "var(--text-main)", marginTop: 4 }}>BS Computer Science</div>
                </div>
              </div>

              <div className="tr-nav">
                <span className="tr-nav-label">Semester Timeline</span>
                <div className="tr-pills">
                  {SEMESTERS.map((sem, i) => (
                    <button
                      key={sem.id}
                      className={`tr-pill${activeIdx === i ? " active" : ""}`}
                      onClick={() => setActiveIdx(i)}
                    >
                      {sem.label}
                    </button>
                  ))}
                </div>
                <div className="tr-nav-arrows">
                  <button className="tr-arrow" onClick={prev} disabled={activeIdx === 0}>‹</button>
                  <button className="tr-arrow" onClick={next} disabled={activeIdx === SEMESTERS.length - 1}>›</button>
                </div>
              </div>

              <div className="tr-viewport">
                <div className="tr-carousel">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeIdx}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -40 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="tr-centered-wrapper"
                    >
                      <TranscriptCard sem={SEMESTERS[activeIdx]} />
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="tr-hint">
                  ← → use arrow keys to navigate semesters
                </div>
              </div>

              <div className="tr-dots">
                {SEMESTERS.map((_, i) => (
                  <div
                    key={i}
                    className={`tr-dot${activeIdx === i ? " active" : ""}`}
                    onClick={() => setActiveIdx(i)}
                  />
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}