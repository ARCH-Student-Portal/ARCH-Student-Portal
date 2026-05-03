import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { gsap } from "gsap";
import Sidebar from "./Components/shared/Sidebar";
import { STUDENT_NAV } from "./config/studentNav";
import { motion, AnimatePresence } from "framer-motion";
import StudentApi from "./config/studentApi";
import "./StudentTranscript.css";

// ── HELPERS ───────────────────────────────────────────────────────────────────

// "Fall 2022" → "F-22", "Spring 2023" → "S-23"
function semLabel(semStr = "") {
  const lower = semStr.toLowerCase();
  const yearMatch = semStr.match(/\d{4}/);
  const yr = yearMatch ? yearMatch[0].slice(2) : "??";
  if (lower.includes("fall"))   return `F-${yr}`;
  if (lower.includes("spring")) return `S-${yr}`;
  if (lower.includes("summer")) return `Su-${yr}`;
  return semStr.slice(0, 4);
}

// Derive academic year label from semester index (0-based)
function semYearLabel(idx) {
  const year = Math.floor(idx / 2) + 1;
  const suffix = ["st","nd","rd"][year - 1] ?? "th";
  return `${year}${suffix} Year`;
}

// Sort semester strings chronologically: Fall < Spring of next year
function semOrder(semStr = "") {
  const lower = semStr.toLowerCase();
  const yearMatch = semStr.match(/\d{4}/);
  const yr = yearMatch ? parseInt(yearMatch[0], 10) : 0;
  if (lower.includes("fall"))   return yr * 10 + 1;
  if (lower.includes("spring")) return yr * 10 + 2;
  if (lower.includes("summer")) return yr * 10 + 3;
  return yr * 10;
}

// Grade letter → point value (fallback mapping if gradePoints is missing)
const GRADE_POINTS = {
  "A+": 4.0, A: 4.0, "A-": 3.7,
  "B+": 3.3, B: 3.0, "B-": 2.7,
  "C+": 2.3, C: 2.0, "C-": 1.7,
  "D+": 1.3, D: 1.0, "D-": 0.7,
  F: 0.0,
};

function resolvePoints(gradePoints, letterGrade) {
  if (gradePoints != null && !isNaN(gradePoints)) return parseFloat(gradePoints);
  return GRADE_POINTS[letterGrade] ?? 0;
}

// Build SEMESTERS array from completedCourses + optional in-progress courses
function buildSemesters(completedCourses, inProgressCourses = []) {
  // Group completed by semester
  const semMap = {};
  completedCourses.forEach((c) => {
    const sem = c.semester ?? "Unknown";
    if (!semMap[sem]) semMap[sem] = [];
    semMap[sem].push(c);
  });

  // Sort semester keys chronologically
  const sortedKeys = Object.keys(semMap).sort((a, b) => semOrder(a) - semOrder(b));

  const semesters = sortedKeys.map((semStr, idx) => {
    const courses = semMap[semStr].map((c) => ({
      code:   c.courseCode  ?? "",
      name:   c.courseName  ?? "",
      cr:     c.creditHours ?? 0,
      grade:  c.letterGrade ?? "—",
      points: resolvePoints(c.gradePoints, c.letterGrade),
    }));

    const totalCr = courses.reduce((s, c) => s + c.cr, 0);
    const totalQP = courses.reduce((s, c) => s + c.cr * c.points, 0);
    const gpa     = totalCr > 0 ? parseFloat((totalQP / totalCr).toFixed(2)) : 0;

    return {
      id:         semStr.replace(/\s+/g, "-").toLowerCase(),
      name:       semStr,
      label:      semLabel(semStr),
      year:       semYearLabel(idx),
      courses,
      gpa,
      inProgress: false,
    };
  });

  // Append in-progress semester if we have active courses
  if (inProgressCourses.length > 0) {
    const semStr  = inProgressCourses[0].semester ?? "Current Semester";
    const courses = inProgressCourses.map((c) => ({
      code:   c.courseCode  ?? "",
      name:   c.name        ?? c.courseName ?? "",
      cr:     c.creditHours ?? 0,
      grade:  c.letterGrade ?? "IP",
      points: resolvePoints(c.gradePoints, c.letterGrade),
    }));
    const totalCr = courses.reduce((s, c) => s + c.cr, 0);
    const totalQP = courses.reduce((s, c) => s + c.cr * c.points, 0);
    const gpa     = totalCr > 0 ? parseFloat((totalQP / totalCr).toFixed(2)) : 0;

    semesters.push({
      id:         semStr.replace(/\s+/g, "-").toLowerCase() + "-ip",
      name:       semStr,
      label:      semLabel(semStr),
      year:       semYearLabel(semesters.length),
      courses,
      gpa,
      inProgress: true,
    });
  }

  return semesters;
}

// ── VISUAL HELPERS (unchanged from original) ──────────────────────────────────

function gpaClass(gpa) {
  if (gpa >= 3.5) return "gpa-excellent";
  if (gpa >= 3.0) return "gpa-good";
  if (gpa >= 2.0) return "gpa-average";
  return "gpa-poor";
}

function gradeClass(grade) {
  const g = (grade ?? "")[0];
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

// ── TRANSCRIPT CARD (completely unchanged) ────────────────────────────────────

function TranscriptCard({ sem }) {
  const totalCr = sem.courses.reduce((s, c) => s + c.cr, 0);
  const totalQP = sem.courses.reduce((s, c) => s + c.cr * c.points, 0);

  return (
    <div className={`tr-sem-card ${gpaClass(sem.gpa)}`}>
      <div className={`tr-card-accent ${accentClass(sem.gpa)}`} />

      <div className="tr-card-hd">
        <div>
          <div className="tr-card-sem-name">
            {sem.name}
            {sem.inProgress && (
              <span className="in-progress-badge">In Progress</span>
            )}
          </div>
          <div className="tr-card-sem-sub">
            {sem.year} · {sem.courses.length} courses
          </div>
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
                  <span className={`tr-grade ${gradeClass(c.grade)}`}>
                    {c.grade}
                  </span>
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

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function StudentTranscript() {
  const navigate = useNavigate();
  const location = useLocation();
  const webglRef       = useRef(null);
  const introCanvasRef = useRef(null);
  const introRef       = useRef(null);
  const appRef         = useRef(null);
  const sidebarRef     = useRef(null);

  const [collapse,  setCollapse]  = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  // Live data
  const [userName,  setUserName]  = useState("Loading...");
  const [userId,    setUserId]    = useState("...");
  const [program,   setProgram]   = useState("BS Computer Science");
  const [semesters, setSemesters] = useState([]);
  const [cgpa,      setCgpa]      = useState("—");
  const [creditsEarned,   setCreditsEarned]   = useState(0);
  const [creditsRequired, setCreditsRequired] = useState(0);

  // ── FETCH ────────────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      StudentApi.getTranscript(),
      StudentApi.getCourses(),    // for in-progress semester courses
    ])
      .then(([transcriptRes, coursesRes]) => {
        const t = transcriptRes;

        // Profile info from transcript response
        const studentInfo = t?.student ?? {};
        const name     = studentInfo.name       ?? "";
        const rollNo   = studentInfo.rollNumber  ?? studentInfo.studentId ?? "";
        const prog     = studentInfo.program     ?? "BS Computer Science";
        setUserName(name || "Student");
        setUserId(rollNo);
        setProgram(prog);

        // Stats
        setCgpa(t?.cgpa != null ? parseFloat(t.cgpa).toFixed(2) : "—");
        setCreditsEarned(t?.totalCreditsEarned   ?? 0);
        setCreditsRequired(t?.totalCreditsRequired ?? 0);

        // In-progress courses from getCourses (active enrollments)
        const activeCourses = coursesRes?.courses ?? [];

        // Build semesters
        const built = buildSemesters(t?.completedCourses ?? [], activeCourses);
        setSemesters(built);
        // Start on last semester (most recent)
        setActiveIdx(Math.max(0, built.length - 1));
      })
      .catch((err) => console.error("StudentTranscript fetch error:", err));
  }, []);

  // ── KEYBOARD NAV ─────────────────────────────────────────────────────────
  const prev = () => setActiveIdx((i) => Math.max(0, i - 1));
  const next = () => setActiveIdx((i) => Math.min(semesters.length - 1, i + 1));

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semesters.length]);

  // Derived stats
  const completedSems = semesters.filter((s) => !s.inProgress);
  const allCr         = semesters.reduce((s, sem) => s + sem.courses.reduce((a, c) => a + c.cr, 0), 0);

  // ── CINEMATIC INTRO ───────────────────────────────────────────────────────
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
    const ctx    = canvas.getContext("2d");
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
      setTimeout(() => { if (webglRef.current) webglRef.current.style.display = "none"; }, 3000);
    };
    const tl = gsap.timeline({ delay: 0.2, onComplete: afterIntro });
    tl.to("#intro-line", { scaleX: 1, duration: 0.8, ease: "power3.out" })
      .to("#intro-logo", { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }, 0.5)
      .to("#intro-sub",  { opacity: 1, y: 0, duration: 0.5 }, 1.1)
      .to("#intro-logo", { scale: 50, opacity: 0, duration: 0.7, ease: "power4.in" }, 2.4)
      .to("#intro-sub",  { opacity: 0, duration: 0.3 }, 2.4)
      .to("#intro-line", { opacity: 0, duration: 0.3 }, 2.4)
      .to("#intro-flash",{ opacity: 1, duration: 0.08 }, 2.85)
      .to("#intro-flash",{ opacity: 0, duration: 0.4  }, 2.93)
      .to(introRef.current, { opacity: 0, duration: 0.35 }, 2.88);
    return () => cancelAnimationFrame(animId);
  }, []);

  // ── THREE.JS BACKGROUND ───────────────────────────────────────────────────
  useEffect(() => {
    if (sessionStorage.getItem("archIntroPlayed")) return;
    const canvas = webglRef.current;
    if (!canvas) return;
    let W = window.innerWidth, H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H); renderer.setClearColor(0xf4f8ff, 1);
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 200);
    camera.position.set(0, 2, 10);
    scene.add(new THREE.AmbientLight(0x0033aa, 0.8));
    let nmx = 0, nmy = 0;
    const onMove = (e) => { nmx = (e.clientX / W) * 2 - 1; nmy = -(e.clientY / H) * 2 + 1; };
    document.addEventListener("mousemove", onMove);
    let animId;
    const loop = () => {
      animId = requestAnimationFrame(loop);
      camera.position.x += (nmx * 0.6 - camera.position.x) * 0.015;
      camera.position.y += (nmy * 0.4 + 2 - camera.position.y) * 0.015;
      camera.lookAt(0, 0, 0); renderer.render(scene, camera);
    };
    loop();
    return () => { cancelAnimationFrame(animId); document.removeEventListener("mousemove", onMove); };
  }, []);

  // ── RENDER ────────────────────────────────────────────────────────────────
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
        <Sidebar
          ref={sidebarRef}
          sections={STUDENT_NAV}
          logoLabel="Student Portal"
          userName={userName}
          userId={userId}
          collapse={collapse}
          onToggle={() => setCollapse((c) => !c)}
        />

        <div id="main">
          <div id="topbar">
            <div className="pg-title">Academic Transcript</div>
            <div className="tb-r">
              <div className="sem-chip">{userId} · {program}</div>
            </div>
          </div>

          <div id="scroll">
            <div className="tr-stage">

              {/* ── STATS BAR ── */}
              <div className="tr-stats-bar">
                <div className="tr-stat-item">
                  <div className="tr-stat-label">Cumulative GPA</div>
                  <div className="tr-stat-value green">{cgpa}</div>
                </div>
                <div className="tr-stat-item">
                  <div className="tr-stat-label">Credits Earned</div>
                  <div className="tr-stat-value blue">{creditsEarned}</div>
                </div>
                <div className="tr-stat-item">
                  <div className="tr-stat-label">Total Credits (incl. current)</div>
                  <div className="tr-stat-value">{allCr}</div>
                </div>
                <div className="tr-stat-item">
                  <div className="tr-stat-label">Semesters Completed</div>
                  <div className="tr-stat-value">{completedSems.length}</div>
                </div>
                <div
                  className="tr-stat-item"
                  style={{ marginLeft: "auto", borderRight: "none", alignItems: "flex-end", justifyContent: "center" }}
                >
                  <div className="tr-stat-label">Program</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "var(--text-main)", marginTop: 4 }}>
                    {program}
                  </div>
                </div>
              </div>

              {/* ── SEMESTER NAV ── */}
              {semesters.length > 0 && (
                <>
                  <div className="tr-nav">
                    <span className="tr-nav-label">Semester Timeline</span>
                    <div className="tr-pills">
                      {semesters.map((sem, i) => (
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
                      <button className="tr-arrow" onClick={next} disabled={activeIdx === semesters.length - 1}>›</button>
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
                          <TranscriptCard sem={semesters[activeIdx]} />
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    <div className="tr-hint">← → use arrow keys to navigate semesters</div>
                  </div>

                  <div className="tr-dots">
                    {semesters.map((_, i) => (
                      <div
                        key={i}
                        className={`tr-dot${activeIdx === i ? " active" : ""}`}
                        onClick={() => setActiveIdx(i)}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Loading state — only shown while semesters haven't loaded yet */}
              {semesters.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-sub)", opacity: 0.6 }}>
                  Loading transcript…
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}