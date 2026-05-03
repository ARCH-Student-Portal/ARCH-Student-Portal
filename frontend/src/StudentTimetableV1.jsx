import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Components/shared/Sidebar";
import { STUDENT_NAV } from "./config/studentNav";
import StudentApi from "./config/studentApi";
import "./StudentDashV1.css";
import "./StudentTimetableV1.css";

// ── NORMALIZE DAY TO 3-LETTER SHORT FORM ─────────────────────────────────────
const DAY_MAP = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed",
  thursday: "Thu", friday: "Fri", saturday: "Sat", sunday: "Sun",
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri",
};
function normalizeDay(day = "") {
  return DAY_MAP[day.toLowerCase()] ?? day.slice(0, 3);
}

// ── FORMAT TIME: "08:30" → "08:30 AM" ────────────────────────────────────────
function fmt24to12(t = "") {
  if (!t) return "";
  // Already has AM/PM
  if (/am|pm/i.test(t)) return t.trim();
  const [hStr, mStr] = t.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr ?? "00";
  const ampm = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${String(h).padStart(2, "0")}:${m} ${ampm}`;
}

// ── DERIVE initials FROM NAME ─────────────────────────────────────────────────
function toInitials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase() || "??";
}

// ── ADAPT BACKEND SLOT → FRONTEND CLASS SHAPE ─────────────────────────────────
let _uid = 0;
function adaptSlot(slot) {
  const day      = normalizeDay(slot.day);
  const start    = fmt24to12(slot.startTime);
  const end      = fmt24to12(slot.endTime);
  const timeStr  = start && end ? `${start} - ${end}` : slot.startTime ?? "";
  const type     = (slot.courseCode ?? "").endsWith("L") ? "lab" : "theory";
  const prof     = slot.teacher ?? "TBA";
  return {
    id:       ++_uid,
    day,
    name:     slot.courseName  ?? slot.courseCode ?? "",
    code:     slot.courseCode  ?? "",
    type,
    timeStr,
    room:     slot.room        ?? "TBA",
    prof,
    profInit: toInitials(prof),
    // Backend does not send per-course attendance or credits in timetable endpoint
    att:      null,
    credits:  null,
    section:  slot.section     ?? "",
  };
}

export default function StudentTimetableV1() {
  const navigate       = useNavigate();
  const location       = useLocation();
  const webglRef       = useRef(null);
  const introCanvasRef = useRef(null);
  const introRef       = useRef(null);
  const appRef         = useRef(null);
  const sidebarRef     = useRef(null);

  const [collapse, setCollapse] = useState(false);
  const [userName, setUserName] = useState("Loading...");
  const [userId,   setUserId]   = useState("...");
  const [schedule, setSchedule] = useState([]);

  const validDays      = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const currentDayStr  = new Date().toLocaleDateString("en-US", { weekday: "short" });
  const initialDay     = validDays.includes(currentDayStr) ? currentDayStr : "Mon";

  const [activeDay,      setActiveDay]      = useState(initialDay);
  const [selectedClass,  setSelectedClass]  = useState(null);

  // ── FETCH TIMETABLE + PROFILE ──────────────────────────────────────────────
  useEffect(() => {
    Promise.all([StudentApi.getProfile(), StudentApi.getTimetable()])
      .then(([profileRes, ttRes]) => {
        // Profile
        const d = profileRes?.student ?? profileRes ?? {};
        setUserName(d.name ?? "Student");
        setUserId(d.rollNumber ?? d.studentId ?? d.rollNo ?? "");

        // Timetable
        const raw     = ttRes?.timetable ?? [];
        const adapted = raw.map(adaptSlot);
        setSchedule(adapted);

        // Auto-select first class of initial day
        const dayClasses = adapted
          .filter((c) => c.day === initialDay)
          .sort((a, b) => a.timeStr.localeCompare(b.timeStr));
        setSelectedClass(dayClasses[0] ?? null);
      })
      .catch((err) => console.error("StudentTimetable fetch error:", err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredSchedule = schedule
    .filter((c) => c.day === activeDay)
    .sort((a, b) => a.timeStr.localeCompare(b.timeStr));

  const handleDayChange = (day) => {
    setActiveDay(day);
    const dayClasses = schedule
      .filter((c) => c.day === day)
      .sort((a, b) => a.timeStr.localeCompare(b.timeStr));
    setSelectedClass(dayClasses[0] ?? null);
  };

  // ── CINEMATIC INTRO ────────────────────────────────────────────────────────
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
    const words = ["SCHEDULE","TIMETABLE","LECTURE","ROOM","PROFESSOR","LAB","THEORY"];
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

      <div id="cur-ring" /><div id="cur-dot" /><div className="scanlines" /><div className="vignette" />
      <canvas id="webgl" ref={webglRef} />

      <div id="intro" ref={introRef}>
        <canvas id="intro-canvas" ref={introCanvasRef} />
        <div id="intro-line" />
        <div id="intro-logo">ARCH</div>
        <div id="intro-sub">Weekly Schedule</div>
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
            <div className="pg-title"><span>Weekly Timetable</span></div>
            <div className="tb-r"><div className="sem-chip">Spring 2025</div></div>
          </div>

          <div id="scroll">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="tt-layout"
            >
              <div className="tt-main">
                <div className="tt-header">
                  <h2 className="ct"><div className="ctbar" />Class Schedule</h2>
                  <div className="day-navigator">
                    {validDays.map((day) => (
                      <button
                        key={day}
                        onClick={() => handleDayChange(day)}
                        className={`day-tab ${activeDay === day ? "active" : ""}`}
                      >
                        {day === currentDayStr ? `${day} (Today)` : day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="tt-body">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeDay}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      {filteredSchedule.length === 0 ? (
                        <div className="tt-empty-state">
                          No classes scheduled for {activeDay}. Enjoy the day off!
                        </div>
                      ) : (
                        filteredSchedule.map((course) => (
                          <div className="timeline-row" key={course.id}>
                            <div className="time-col">
                              <div className="time-hr">
                                {course.timeStr.split(" - ")[0]?.split(" ")[0]}
                              </div>
                              <div className="time-ampm">
                                {course.timeStr.split(" - ")[0]?.split(" ")[1]}
                              </div>
                            </div>

                            <div className="cards-col">
                              <div
                                className={`class-card ${selectedClass?.id === course.id ? "active" : ""}`}
                                onClick={() => setSelectedClass(course)}
                              >
                                <div className={`card-accent acc-${course.type}`} />
                                <div className="card-main">
                                  <div className="card-code">
                                    {course.code} • {course.type === "lab" ? "Laboratory" : "Theory"}
                                  </div>
                                  <h3 className="card-title">{course.name}</h3>
                                  <div className="card-meta">
                                    <div className="meta-item">📍 {course.room}</div>
                                    <div className="meta-item">👨‍🏫 {course.prof}</div>
                                  </div>
                                </div>
                                {/* LIVE NOW indicator: show if this slot is happening right now */}
                                {(() => {
                                  if (course.day !== currentDayStr) return null;
                                  const now     = new Date();
                                  const [sH, sM] = (course.timeStr.split(" - ")[0] ?? "").replace(/(AM|PM)/i, "").trim().split(":").map(Number);
                                  const [eH, eM] = (course.timeStr.split(" - ")[1] ?? "").replace(/(AM|PM)/i, "").trim().split(":").map(Number);
                                  const isPM_s   = /PM/i.test(course.timeStr.split(" - ")[0] ?? "");
                                  const isPM_e   = /PM/i.test(course.timeStr.split(" - ")[1] ?? "");
                                  const start24  = (sH % 12) + (isPM_s ? 12 : 0);
                                  const end24    = (eH % 12) + (isPM_e ? 12 : 0);
                                  const nowMins  = now.getHours() * 60 + now.getMinutes();
                                  const sMins    = start24 * 60 + (sM || 0);
                                  const eMins    = end24   * 60 + (eM || 0);
                                  if (nowMins >= sMins && nowMins < eMins) {
                                    return <div className="indicator-now">LIVE NOW</div>;
                                  }
                                  return null;
                                })()}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <AnimatePresence>
                {selectedClass && (
                  <motion.div
                    className="side-panel"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 50, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <div className="sp-header">
                      <div className="sp-tag">{selectedClass.code}</div>
                      <div className="sp-title">{selectedClass.name}</div>
                    </div>

                    <div className="sp-prof-box">
                      <div className="sp-avatar">{selectedClass.profInit}</div>
                      <div>
                        <div className="sp-prof-label">Course Instructor</div>
                        <div className="sp-prof-name">{selectedClass.prof}</div>
                      </div>
                    </div>

                    <div className="sp-data-grid">
                      <div className="sp-data-box">
                        <div className="sp-label">Location</div>
                        <div className="sp-val">{selectedClass.room}</div>
                      </div>

                      <div className="sp-data-box">
                        <div className="sp-label">Timing</div>
                        <div className="sp-val-time">
                          <div className="sp-time-start">
                            {selectedClass.timeStr.split(" - ")[0]}
                          </div>
                          <div className="sp-time-end">
                            <span className="sp-time-to">TO</span>
                            <span className="sp-time-actual">
                              {selectedClass.timeStr.split(" - ")[1]}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="sp-data-box">
                        <div className="sp-label">Credits</div>
                        <div className="sp-val">
                          {selectedClass.credits != null ? `${selectedClass.credits} Hours` : "—"}
                        </div>
                      </div>

                      <div className="sp-data-box">
                        <div className="sp-label">Attendance</div>
                        <div className="sp-val success">
                          {selectedClass.att != null ? selectedClass.att : "—"}
                        </div>
                      </div>
                    </div>

                    <button className="btn-contact">Message Instructor</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}