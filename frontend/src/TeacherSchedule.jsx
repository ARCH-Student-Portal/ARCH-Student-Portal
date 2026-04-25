import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import "./StudentDashV1.css";
import "./TeacherSchedule.css";

// ── SCHEDULE DATA ─────────────────────────────────────────────────────────────

const SCHEDULE = [
  // Monday
  {
    id: 1, day: "Mon",
    name: "Object Oriented Analysis & Design",
    code: "CS-3001", section: "Sec A",
    type: "lecture",
    timeStr: "01:00 PM - 02:30 PM",
    room: "CR-204", students: 38, credits: 3,
  },
  {
    id: 2, day: "Mon",
    name: "Office Hours",
    code: "OFFICE", section: "",
    type: "office",
    timeStr: "03:00 PM - 04:00 PM",
    room: "Faculty Room 12", students: null, credits: null,
  },

  // Tuesday
  {
    id: 3, day: "Tue",
    name: "Data Structures & Algorithms",
    code: "CS-2010", section: "Sec B",
    type: "lecture",
    timeStr: "08:00 AM - 09:30 AM",
    room: "CR-101", students: 42, credits: 3,
  },
  {
    id: 4, day: "Tue",
    name: "Database Systems Lab",
    code: "CS-2012L", section: "Sec A",
    type: "lab",
    timeStr: "11:30 AM - 02:30 PM",
    room: "CS-Lab 3", students: 35, credits: 1,
  },

  // Wednesday
  {
    id: 5, day: "Wed",
    name: "Object Oriented Analysis & Design",
    code: "CS-3001", section: "Sec A",
    type: "lecture",
    timeStr: "01:00 PM - 02:30 PM",
    room: "CR-204", students: 38, credits: 3,
  },
  {
    id: 6, day: "Wed",
    name: "Department Meeting",
    code: "DEPT", section: "",
    type: "meeting",
    timeStr: "03:30 PM - 04:30 PM",
    room: "CS Faculty Lounge", students: null, credits: null,
  },

  // Thursday
  {
    id: 7, day: "Thu",
    name: "Data Structures & Algorithms",
    code: "CS-2010", section: "Sec B",
    type: "lecture",
    timeStr: "08:00 AM - 09:30 AM",
    room: "CR-101", students: 42, credits: 3,
  },
  {
    id: 8, day: "Thu",
    name: "Software Engineering",
    code: "CS-3005", section: "Sec C",
    type: "lecture",
    timeStr: "11:00 AM - 12:30 PM",
    room: "CR-302", students: 40, credits: 3,
  },
  {
    id: 9, day: "Thu",
    name: "Office Hours",
    code: "OFFICE", section: "",
    type: "office",
    timeStr: "02:00 PM - 03:00 PM",
    room: "Faculty Room 12", students: null, credits: null,
  },

  // Friday
  {
    id: 10, day: "Fri",
    name: "Software Engineering",
    code: "CS-3005", section: "Sec C",
    type: "lecture",
    timeStr: "09:00 AM - 10:30 AM",
    room: "CR-302", students: 40, credits: 3,
  },
];

const VALID_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

// ── HELPERS ───────────────────────────────────────────────────────────────────

function parseTime(timeStr) {
  const [h, rest] = timeStr.split(":");
  const [m, ap]   = rest.split(" ");
  let hour = parseInt(h);
  if (ap === "PM" && hour !== 12) hour += 12;
  if (ap === "AM" && hour === 12) hour = 0;
  return hour * 60 + parseInt(m);
}

function isNow(timeStr) {
  const now   = new Date();
  const mins  = now.getHours() * 60 + now.getMinutes();
  const [start, end] = timeStr.split(" - ");
  return mins >= parseTime(start) && mins <= parseTime(end);
}

const TYPE_META = {
  lecture : { label: "Lecture",  accentClass: "acc-lecture", tagClass: "tag-lecture" },
  lab     : { label: "Lab",      accentClass: "acc-lab",     tagClass: "tag-lab"     },
  office  : { label: "Office Hours", accentClass: "acc-office", tagClass: "tag-office" },
  meeting : { label: "Meeting",  accentClass: "acc-meeting", tagClass: "tag-meeting" },
};

// weekly load summary
function weekStats() {
  const lectures = SCHEDULE.filter(s => s.type === "lecture");
  const sections = [...new Set(lectures.map(s => s.code + s.section))].length;
  const totalStudents = [...new Map(lectures.map(s => [s.code + s.section, s.students])).values()]
    .reduce((a, b) => a + b, 0);
  const hours = lectures.reduce((sum, s) => {
    const [start, end] = s.timeStr.split(" - ");
    return sum + (parseTime(end) - parseTime(start)) / 60;
  }, 0);
  return { sections, totalStudents, hours: hours.toFixed(1) };
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────

export default function TeacherSchedule() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const webglRef   = useRef(null);
  const introRef   = useRef(null);
  const introCanvasRef = useRef(null);
  const appRef     = useRef(null);
  const sidebarRef = useRef(null);
  const topbarRef  = useRef(null);
  const [collapse, setCollapse] = useState(false);

  const todayStr   = new Date().toLocaleDateString("en-US", { weekday: "short" });
  const initialDay = VALID_DAYS.includes(todayStr) ? todayStr : "Mon";
  const firstClass = SCHEDULE.filter(s => s.day === initialDay)[0] ?? null;

  const [activeDay,  setActiveDay]  = useState(initialDay);
  const [selected,   setSelected]   = useState(firstClass);

  const filtered = SCHEDULE
    .filter(s => s.day === activeDay)
    .sort((a, b) => parseTime(a.timeStr.split(" - ")[0]) - parseTime(b.timeStr.split(" - ")[0]));

  const handleDayChange = (day) => {
    setActiveDay(day);
    const first = SCHEDULE.filter(s => s.day === day)
      .sort((a, b) => parseTime(a.timeStr.split(" - ")[0]) - parseTime(b.timeStr.split(" - ")[0]))[0] ?? null;
    setSelected(first);
  };

  const stats = weekStats();

  // ── THREE.JS BG ──
  useEffect(() => {
    const canvas = webglRef.current;
    let W = window.innerWidth, H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setClearColor(0xf4f8ff, 1);
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
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    loop();
    return () => { cancelAnimationFrame(animId); document.removeEventListener("mousemove", onMove); };
  }, []);

  // ── INTRO SKIP ──
  useEffect(() => {
    const played = sessionStorage.getItem("archTeacherIntroPlayed");
    if (played) {
      introRef.current.style.display = "none";
      appRef.current.style.opacity   = 1;
      sidebarRef.current.style.transform = "translateX(0)";
      topbarRef.current.style.opacity = 1;
      return;
    }
    const canvas = introCanvasRef.current;
    const ctx    = canvas.getContext("2d");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const words  = ["FACULTY","SCHEDULE","LECTURE","SEMESTER","STUDENTS","GRADES"];
    const parts  = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      word: words[Math.floor(Math.random() * words.length)],
      opacity: Math.random() * 0.4 + 0.05, speed: Math.random() * 0.8 + 0.2,
      size: Math.floor(Math.random() * 10) + 10, hue: "100,180,255",
    }));
    let animId;
    const draw = () => {
      ctx.fillStyle = "rgba(0,4,14,0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      parts.forEach(p => {
        p.y -= p.speed * 0.4;
        if (p.y < -30) { p.y = canvas.height + 20; p.x = Math.random() * canvas.width; }
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

  // ── NAV ──
  const navItems = [
    ["Overview",     [["⊞", "Dashboard",  "/teacher/dashboard"]]],
    ["Management",   [
      ["◈", "My Sections", "/teacher/sections"],
      ["▦", "Gradebook",   "/teacher/gradebook"],
      ["✓", "Attendance",  "/teacher/attendance"],
      ["▤", "Schedule",    "/teacher/Schedule"],
    ]],
    ["Communication",[["◉", "Broadcast Alerts", "/teacher/alerts"]]],
    ["Account",      [["◌", "Profile",           "/teacher/profile"]]],
  ];

  // ── RENDER ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="scanlines" />
      <div className="vignette" />
      <canvas id="webgl" ref={webglRef} />

      <div id="intro" ref={introRef}>
        <canvas id="intro-canvas" ref={introCanvasRef} />
        <div id="intro-logo">ARCH</div>
      </div>

      <div id="app" ref={appRef}>
        {/* ── SIDEBAR ── */}
        <nav id="sidebar" ref={sidebarRef} className={collapse ? "collapse" : ""}>
          <div className="sb-top-bar" />
          <button className="sb-toggle" onClick={() => setCollapse(c => !c)}>
            <span /><span /><span />
          </button>
          <div className="sb-logo">
            <div className="logo-box">A</div>
            <div><div className="logo-name">ARCH</div><div className="logo-tagline">Faculty Portal</div></div>
          </div>
          <div className="sb-user">
            <div className="uav">Dr.</div>
            <div><div className="uname">Dr. Ahmed</div><div className="uid">EMP-8492</div></div>
          </div>

          {navItems.map(([sec, items]) => (
            <div key={sec}>
              <div className="nav-sec">{sec}</div>
              {items.map(([ic, label, path]) => (
                <div
                  key={label}
                  className={`ni hov-target${location.pathname === path ? " active" : ""}`}
                  onClick={() => navigate(path)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="ni-ic">{ic}</div>{label}
                </div>
              ))}
            </div>
          ))}
          <div className="sb-foot">Spring 2025 · FAST-NUCES</div>
        </nav>

        {/* ── MAIN ── */}
        <div id="main">
          <div id="topbar" ref={topbarRef}>
            <div className="tb-glow" />
            <div className="pg-title"><span>Weekly Schedule</span></div>
            <div className="tb-r"><div className="sem-chip">Spring 2025</div></div>
          </div>

          <div id="scroll">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="tt-layout"
            >
              {/* ── Schedule MAIN ── */}
              <div className="tt-main">
                <div className="tt-header">
                  <h2 className="ct" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="ctbar" />Teaching Schedule
                  </h2>
                  <div className="day-navigator">
                    {VALID_DAYS.map(day => (
                      <button
                        key={day}
                        className={`day-tab${activeDay === day ? " active" : ""}`}
                        onClick={() => handleDayChange(day)}
                      >
                        {day === todayStr ? `${day} · Today` : day}
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
                      transition={{ duration: 0.18 }}
                    >
                      {filtered.length === 0 ? (
                        <div className="tt-empty">
                          <div className="tt-empty-icon">◈</div>
                          No classes scheduled for {activeDay}. A free day.
                        </div>
                      ) : (
                        filtered.map(item => {
                          const meta = TYPE_META[item.type];
                          const live = item.type === "lecture" && activeDay === todayStr && isNow(item.timeStr);
                          return (
                            <div className="timeline-row" key={item.id}>
                              {/* TIME */}
                              <div className="time-col">
                                {item.timeStr.split(" - ")[0].split(" ")[0]}
                                <span className="time-ampm">{item.timeStr.split(" - ")[0].split(" ")[1]}</span>
                              </div>

                              {/* CARD */}
                              <div className="cards-col">
                                <div
                                  className={`class-card${selected?.id === item.id ? " active" : ""}`}
                                  onClick={() => setSelected(item)}
                                >
                                  <div className={`card-accent ${meta.accentClass}`} />

                                  <div className="card-main">
                                    <div className="card-code-row">
                                      <span className={`tt-type-tag ${meta.tagClass}`}>{meta.label}</span>
                                      {item.code !== "OFFICE" && item.code !== "DEPT" && (
                                        <span className="card-code">{item.code} · {item.section}</span>
                                      )}
                                    </div>
                                    <h3>{item.name}</h3>
                                    <div className="card-meta">
                                      <div className="meta-item">📍 {item.room}</div>
                                      {item.students != null && (
                                        <div className="meta-item">👥 {item.students} students</div>
                                      )}
                                      <div className="meta-item">
                                        🕐 {item.timeStr.split(" - ")[1]}
                                      </div>
                                    </div>
                                  </div>

                                  {live && <div className="indicator-now">LIVE NOW</div>}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* ── SIDE PANEL ── */}
              <AnimatePresence>
                {selected && (
                  <motion.div
                    className="side-panel"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 50, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    {/* Header */}
                    <div className="sp-header">
                      <div className="sp-tag">{selected.code}</div>
                      <div className="sp-title">{selected.name}</div>
                      {selected.section && (
                        <div className="sp-section-badge">{selected.section}</div>
                      )}
                    </div>

                    {/* Data grid */}
                    <div className="sp-data-grid">
                      <div className="sp-data-box">
                        <div className="sp-label">Room</div>
                        <div className="sp-val mono">{selected.room}</div>
                      </div>
                      <div className="sp-data-box">
                        <div className="sp-label">Type</div>
                        <div className={`sp-val tt-type-tag ${TYPE_META[selected.type].tagClass}`} style={{ display: "inline-flex" }}>
                          {TYPE_META[selected.type].label}
                        </div>
                      </div>
                      <div className="sp-data-box" style={{ gridColumn: "1 / -1" }}>
                        <div className="sp-label">Timing</div>
                        <div className="sp-val" style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em", lineHeight: 1.5 }}>
                          <div style={{ color: "var(--text-main)" }}>{selected.timeStr.split(" - ")[0]}</div>
                          <div style={{ color: "var(--dimmer)", display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>TO</span>
                            {selected.timeStr.split(" - ")[1]}
                          </div>
                        </div>
                      </div>

                      {selected.students != null && (
                        <div className="sp-data-box">
                          <div className="sp-label">Students</div>
                          <div className="sp-val">{selected.students}</div>
                        </div>
                      )}
                      {selected.credits != null && (
                        <div className="sp-data-box">
                          <div className="sp-label">Credits</div>
                          <div className="sp-val">{selected.credits} Hr</div>
                        </div>
                      )}
                    </div>

                    {/* Weekly load strip — shown for lecture/lab only */}
                    {(selected.type === "lecture" || selected.type === "lab") && (
                      <div className="sp-load-box">
                        <div className="sp-label" style={{ marginBottom: 12 }}>Weekly Load Summary</div>
                        <div className="sp-load-row">
                          <div className="sp-load-stat">
                            <div className="sp-load-num">{stats.sections}</div>
                            <div className="sp-load-lbl">Sections</div>
                          </div>
                          <div className="sp-load-divider" />
                          <div className="sp-load-stat">
                            <div className="sp-load-num">{stats.totalStudents}</div>
                            <div className="sp-load-lbl">Students</div>
                          </div>
                          <div className="sp-load-divider" />
                          <div className="sp-load-stat">
                            <div className="sp-load-num">{stats.hours}h</div>
                            <div className="sp-load-lbl">Teach hrs</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quick actions */}
                    <div className="sp-actions">
                      {selected.type === "lecture" || selected.type === "lab" ? (
                        <>
                          <button
                            className="sp-action-btn primary"
                            onClick={() => navigate("/teacher/attendance")}
                          >
                            ✓ Mark Attendance
                          </button>
                          <button
                            className="sp-action-btn secondary"
                            onClick={() => navigate("/teacher/gradebook")}
                          >
                            ▦ Open Gradebook
                          </button>
                        </>
                      ) : (
                        <button className="sp-action-btn secondary">
                          ◉ Add to Calendar
                        </button>
                      )}
                    </div>
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