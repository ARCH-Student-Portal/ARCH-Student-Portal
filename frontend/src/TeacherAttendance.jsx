import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { gsap } from "gsap";

import "./StudentDashV1.css";
import "./TeacherAttendance.css";

// ── DATA ──────────────────────────────────────────────────────────────────────

const SECTIONS = {
  "CS-3001": {
    name: "Object Oriented Analysis & Design",
    code: "CS-3001 · Sec A",
    time: "Mon/Wed  13:00 – 14:30",
    students: [
      { id: "21K-3001", name: "Ali Khan" },
      { id: "21K-3045", name: "Sara Ahmed" },
      { id: "21K-3112", name: "Usman Tariq" },
      { id: "21K-3190", name: "Hira Malik" },
      { id: "21K-3204", name: "Zain Ul Abdin" },
      { id: "21K-3267", name: "Ayesha Noor" },
      { id: "21K-3311", name: "Hamza Sheikh" },
      { id: "21K-3398", name: "Mahnoor Fatima" },
    ],
    // Historical attendance log per student: array of { date, status }
    history: {
      "21K-3001": [
        { date: "Apr 14", status: "P" }, { date: "Apr 16", status: "P" },
        { date: "Apr 21", status: "P" }, { date: "Apr 23", status: "A" },
      ],
      "21K-3045": [
        { date: "Apr 14", status: "P" }, { date: "Apr 16", status: "A" },
        { date: "Apr 21", status: "P" }, { date: "Apr 23", status: "P" },
      ],
      "21K-3112": [
        { date: "Apr 14", status: "A" }, { date: "Apr 16", status: "A" },
        { date: "Apr 21", status: "P" }, { date: "Apr 23", status: "A" },
      ],
      "21K-3190": [
        { date: "Apr 14", status: "P" }, { date: "Apr 16", status: "P" },
        { date: "Apr 21", status: "P" }, { date: "Apr 23", status: "P" },
      ],
      "21K-3204": [
        { date: "Apr 14", status: "P" }, { date: "Apr 16", status: "A" },
        { date: "Apr 21", status: "A" }, { date: "Apr 23", status: "P" },
      ],
      "21K-3267": [
        { date: "Apr 14", status: "P" }, { date: "Apr 16", status: "P" },
        { date: "Apr 21", status: "P" }, { date: "Apr 23", status: "P" },
      ],
      "21K-3311": [
        { date: "Apr 14", status: "A" }, { date: "Apr 16", status: "P" },
        { date: "Apr 21", status: "A" }, { date: "Apr 23", status: "A" },
      ],
      "21K-3398": [
        { date: "Apr 14", status: "P" }, { date: "Apr 16", status: "P" },
        { date: "Apr 21", status: "P" }, { date: "Apr 23", status: "P" },
      ],
    },
  },
  "CS-2010": {
    name: "Data Structures & Algorithms",
    code: "CS-2010 · Sec B",
    time: "Tue/Thu  08:00 – 09:30",
    students: [
      { id: "22K-4011", name: "Bilal Hasan" },
      { id: "22K-4099", name: "Maha Syed" },
      { id: "22K-4150", name: "Omer Farooq" },
      { id: "22K-4212", name: "Laraib Qureshi" },
      { id: "22K-4305", name: "Ahmed Raza" },
      { id: "22K-4388", name: "Nimra Iqbal" },
    ],
    history: {
      "22K-4011": [
        { date: "Apr 15", status: "P" }, { date: "Apr 17", status: "P" },
        { date: "Apr 22", status: "A" }, { date: "Apr 24", status: "P" },
      ],
      "22K-4099": [
        { date: "Apr 15", status: "P" }, { date: "Apr 17", status: "P" },
        { date: "Apr 22", status: "P" }, { date: "Apr 24", status: "P" },
      ],
      "22K-4150": [
        { date: "Apr 15", status: "A" }, { date: "Apr 17", status: "A" },
        { date: "Apr 22", status: "P" }, { date: "Apr 24", status: "A" },
      ],
      "22K-4212": [
        { date: "Apr 15", status: "P" }, { date: "Apr 17", status: "P" },
        { date: "Apr 22", status: "P" }, { date: "Apr 24", status: "P" },
      ],
      "22K-4305": [
        { date: "Apr 15", status: "P" }, { date: "Apr 17", status: "A" },
        { date: "Apr 22", status: "A" }, { date: "Apr 24", status: "P" },
      ],
      "22K-4388": [
        { date: "Apr 15", status: "P" }, { date: "Apr 17", status: "P" },
        { date: "Apr 22", status: "P" }, { date: "Apr 24", status: "A" },
      ],
    },
  },
};

// ── HELPERS ───────────────────────────────────────────────────────────────────

const today = new Date().toLocaleDateString("en-GB", {
  weekday: "short", day: "numeric", month: "short", year: "numeric",
});

function initAttendance(students) {
  return Object.fromEntries(students.map((s) => [s.id, "P"]));
}

function getColor(pct) {
  if (pct >= 75) return "green";
  if (pct >= 60) return "amber";
  return "red";
}

function calcPct(history, todayRecord) {
  const all = [...history, todayRecord];
  const present = all.filter((r) => r.status === "P").length;
  return Math.round((present / all.length) * 100);
}

function initials(name) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────

export default function TeacherAttendance() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const webglRef   = useRef(null);
  const introCanvasRef = useRef(null);
  const introRef   = useRef(null);
  const appRef     = useRef(null);
  const sidebarRef = useRef(null);
  const topbarRef  = useRef(null);

  const [activeTab,   setActiveTab]   = useState("CS-3001");
  const [attendance,  setAttendance]  = useState(() => initAttendance(SECTIONS["CS-3001"].students));
  const [selected,    setSelected]    = useState(SECTIONS["CS-3001"].students[0].id);
  const [unsaved,     setUnsaved]     = useState(false);
  const [showToast,   setShowToast]   = useState(false);

  const section  = SECTIONS[activeTab];
  const history  = section.history;

  // Switch section → reset state
  useEffect(() => {
    setAttendance(initAttendance(section.students));
    setSelected(section.students[0].id);
    setUnsaved(false);
  }, [activeTab]);

  // Mark toggle
  const toggle = (id, val) => {
    setAttendance((prev) => ({ ...prev, [id]: val }));
    setUnsaved(true);
  };

  // Save
  const save = () => {
    setUnsaved(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2600);
  };

  // Derived counts
  const presentCount = Object.values(attendance).filter((v) => v === "P").length;
  const absentCount  = section.students.length - presentCount;

  // Selected student detail
  const selStudent = section.students.find((s) => s.id === selected);
  const selHistory = history[selected] || [];
  const todayEntry = { date: "Today", status: attendance[selected] };
  const selPct     = calcPct(selHistory, todayEntry);
  const selColor   = getColor(selPct);

  // ── THREE.JS bg (minimal — same as dashboard) ──
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
    let animId;
    const loop = () => { animId = requestAnimationFrame(loop); renderer.render(scene, camera); };
    loop();
    return () => cancelAnimationFrame(animId);
  }, []);

  // ── INTRO (skip if already played) ──
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
    const words = ["FACULTY","ATTENDANCE","LECTURE","SEMESTER","STUDENTS","GRADES"];
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      word: words[Math.floor(Math.random() * words.length)],
      opacity: Math.random() * 0.4 + 0.05, speed: Math.random() * 0.8 + 0.2,
      size: Math.floor(Math.random() * 10) + 10, flicker: Math.random() * 0.025 + 0.005,
      hue: "100,180,255",
    }));
    let animId;
    const draw = () => {
      ctx.fillStyle = "rgba(0,4,14,0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
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

  // ── RENDER ────────────────────────────────────────────────────────────────

  const navItems = [
    ["Management", [
      ["◈", "My Sections",   "/teacher/sections"],
      ["⊞", "Dashboard",     "/teacher/dashboard"],
      ["✦", "Attendance",    "/teacher/attendance"],
      ["▦", "Gradebook",     "/teacher/gradebook"],
    ]],
    ["Communication", [["◉", "Broadcast Alerts", "/teacher/alerts"]]],
    ["Account",       [["◌", "Profile",          "/teacher/profile"]]],
  ];

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
        {/* ── SIDEBAR ── */}
        <nav id="sidebar" ref={sidebarRef}>
          <div className="sb-logo">
            <div className="logo-box">A</div>
            <div>
              <div className="logo-name">ARCH</div>
              <div className="logo-tagline">Faculty Portal</div>
            </div>
          </div>

          <div className="sb-user">
            <div className="uav">Dr.</div>
            <div>
              <div className="uname">Dr. Ahmed</div>
              <div className="uid">EMP-8492</div>
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
            <div className="pg-title">
              <span>Mark Attendance</span>
            </div>
            <div className="tb-r">
              {unsaved && (
                <div className="ta-unsaved-badge">
                  <div className="ta-unsaved-dot" />
                  UNSAVED
                </div>
              )}
              <div className="sem-chip">Spring 2025</div>
            </div>
          </div>

          <div id="scroll">
            <div className="ta-layout">

              {/* ── LEFT PANEL ── */}
              <div className="ta-left">
                <div className="ta-card" style={{ flex: "0 0 auto" }}>
                  {/* Section tabs */}
                  <div className="ta-section-tabs">
                    {Object.keys(SECTIONS).map((k) => (
                      <button
                        key={k}
                        className={`ta-sec-tab${activeTab === k ? " active" : ""}`}
                        onClick={() => setActiveTab(k)}
                      >
                        {k}
                      </button>
                    ))}
                  </div>

                  {/* Date row */}
                  <div className="ta-date-row">
                    <span className="ta-date-label">SESSION DATE</span>
                    <span className="ta-date-value">{today}</span>
                  </div>

                  {/* Section info row */}
                  <div className="ta-date-row" style={{ paddingTop: 10, paddingBottom: 10 }}>
                    <span className="ta-date-label">{section.code}</span>
                    <span className="ta-date-value" style={{ fontSize: 11, fontWeight: 600, color: "#8aadd6" }}>
                      {section.time}
                    </span>
                  </div>
                </div>

                {/* Roster */}
                <div className="ta-card" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  <div className="ta-roster">
                    {section.students.map((s) => {
                      const status = attendance[s.id];
                      return (
                        <div
                          key={s.id}
                          className={`ta-student-row${selected === s.id ? " selected" : ""}`}
                          onClick={() => setSelected(s.id)}
                        >
                          <div className="ta-student-avatar">{initials(s.name)}</div>
                          <div className="ta-student-info">
                            <div className="ta-student-name">{s.name}</div>
                            <div className="ta-student-id">{s.id}</div>
                          </div>
                          <div className="ta-toggle-wrap">
                            <div className="ta-toggle">
                              <button
                                className={`ta-toggle-btn${status === "P" ? " p-active" : ""}`}
                                onClick={(e) => { e.stopPropagation(); toggle(s.id, "P"); }}
                              >
                                P
                              </button>
                              <button
                                className={`ta-toggle-btn${status === "A" ? " a-active" : ""}`}
                                onClick={(e) => { e.stopPropagation(); toggle(s.id, "A"); }}
                              >
                                A
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary footer */}
                  <div className="ta-summary-footer">
                    <div className="ta-sum-stat">
                      <div className="ta-sum-num green">{presentCount}</div>
                      <div className="ta-sum-lbl">Present</div>
                    </div>
                    <div className="ta-sum-divider" />
                    <div className="ta-sum-stat">
                      <div className="ta-sum-num red">{absentCount}</div>
                      <div className="ta-sum-lbl">Absent</div>
                    </div>
                    <div className="ta-sum-divider" />
                    <div className="ta-sum-stat">
                      <div className="ta-sum-num">{section.students.length}</div>
                      <div className="ta-sum-lbl">Total</div>
                    </div>
                    <button className="ta-save-btn" onClick={save} disabled={!unsaved}>
                      ✓ Save
                    </button>
                  </div>
                </div>
              </div>

              {/* ── RIGHT PANEL ── */}
              <div className="ta-right">
                {selStudent ? (
                  <>
                    {/* Student detail card */}
                    <div className="ta-detail-card">
                      <div className="ta-detail-top">
                        <div>
                          <div className="ta-detail-name">{selStudent.name}</div>
                          <div className="ta-detail-meta">{selStudent.id} · {section.code}</div>
                        </div>
                        <div className={`ta-big-pct ${selColor}`}>{selPct}%</div>
                      </div>

                      {/* Bar */}
                      <div className="ta-bar-track">
                        <div
                          className={`ta-bar-fill ${selColor}`}
                          style={{ width: `${selPct}%` }}
                        />
                        <div className="ta-threshold-line" />
                      </div>

                      <div className="ta-bar-labels">
                        <span className={selPct >= 75 ? "lbl-ok" : selPct >= 60 ? "lbl-warn" : "lbl-bad"}>
                          {selPct >= 75 ? "Attendance OK" : selPct >= 60 ? "At Risk" : "Below Threshold"}
                        </span>
                        <span className="lbl-dim">Minimum 75%</span>
                      </div>

                      {/* Stat pills */}
                      <div className="ta-stat-row">
                        <div className="ta-stat-pill green">
                          <div className="ta-stat-num">
                            {[...selHistory, todayEntry].filter((r) => r.status === "P").length}
                          </div>
                          <div className="ta-stat-lbl">Present</div>
                        </div>
                        <div className="ta-stat-pill red">
                          <div className="ta-stat-num">
                            {[...selHistory, todayEntry].filter((r) => r.status === "A").length}
                          </div>
                          <div className="ta-stat-lbl">Absent</div>
                        </div>
                        <div className="ta-stat-pill blue">
                          <div className="ta-stat-num">{selHistory.length + 1}</div>
                          <div className="ta-stat-lbl">Classes Held</div>
                        </div>
                      </div>
                    </div>

                    {/* Attendance log */}
                    <div className="ta-log-card">
                      <div className="ta-log-header">
                        <div className="ta-log-title">
                          <div className="ta-log-ctbar" />
                          Attendance Log
                        </div>
                        <div className="ta-log-count">{selHistory.length + 1} sessions</div>
                      </div>

                      <div className="ta-log-list">
                        {/* Today's row (live) */}
                        <div className={`ta-log-row${attendance[selStudent.id] === "A" ? " absent" : ""}`}>
                          <div className={`ta-log-dot ${attendance[selStudent.id] === "P" ? "green" : "red"}`} />
                          <div className="ta-log-date">Today</div>
                          <div className="ta-log-topic">Current Session · {section.time.split("  ")[1]}</div>
                          <div className={`ta-log-status ${attendance[selStudent.id] === "P" ? "green" : "red"}`}>
                            {attendance[selStudent.id] === "P" ? "Present" : "Absent"}
                          </div>
                        </div>

                        {/* Historical rows (newest first) */}
                        {[...selHistory].reverse().map((r, i) => (
                          <div key={i} className={`ta-log-row${r.status === "A" ? " absent" : ""}`}>
                            <div className={`ta-log-dot ${r.status === "P" ? "green" : "red"}`} />
                            <div className="ta-log-date">{r.date}</div>
                            <div className="ta-log-topic">{section.name}</div>
                            <div className={`ta-log-status ${r.status === "P" ? "green" : "red"}`}>
                              {r.status === "P" ? "Present" : "Absent"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="ta-detail-card">
                    <div className="ta-empty">
                      <div className="ta-empty-icon">◈</div>
                      Select a student to view details
                    </div>
                  </div>
                )}
              </div>
            </div>{/* end ta-layout */}
          </div>{/* end scroll */}
        </div>{/* end main */}
      </div>{/* end app */}

      {/* Toast */}
      {showToast && (
        <div className="ta-toast">
          <span style={{ fontSize: 16 }}>✓</span>
          Attendance saved for {section.code}
        </div>
      )}
    </>
  );
}