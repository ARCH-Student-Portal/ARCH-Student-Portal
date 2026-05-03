import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Components/shared/Sidebar";
import { STUDENT_NAV } from "./config/studentNav";
import StudentApi from "./config/studentApi";
import "./StudentAttendance.css";

// ── HELPERS ───────────────────────────────────────────────────────────────────
const getPct  = (c) => Math.round((c.attended / (c.total || 1)) * 100);
const isRisk  = (c) => getPct(c) < 75;

// Format a date value from classLog into "Jan 13" style
function fmtDate(raw) {
  if (!raw) return "";
  const d = new Date(raw);
  if (isNaN(d)) return String(raw);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Adapt a single classLog entry to the shape the UI expects
function adaptLogEntry(entry, idx) {
  // Possible backend field names handled defensively
  const status = (entry.status ?? entry.attendance ?? "present").toLowerCase();
  const topic  = entry.topic ?? entry.description ?? entry.title ?? `Lecture ${idx + 1}`;
  const date   = entry.date
    ? fmtDate(entry.date)
    : entry.lectureDate
    ? fmtDate(entry.lectureDate)
    : entry.createdAt
    ? fmtDate(entry.createdAt)
    : `Class ${idx + 1}`;
  return { date, topic, status: status === "absent" ? "absent" : "present" };
}

// Build the attendance data array from API responses
function buildAttendanceData(attendanceArr, coursesArr) {
  // Map courseCode → creditHours from getCourses
  const creditMap = {};
  (coursesArr ?? []).forEach((c) => {
    if (c.courseCode) creditMap[c.courseCode] = c.creditHours ?? 0;
  });

  return attendanceArr.map((a, idx) => ({
    id:       idx + 1,
    course:   a.courseName  ?? a.courseCode ?? "Unknown Course",
    code:     a.courseCode  ?? "",
    credits:  creditMap[a.courseCode] ?? a.creditHours ?? 0,
    total:    a.totalLectures    ?? 0,
    attended: a.attendedLectures ?? 0,
    classes:  Array.isArray(a.classLog)
                ? a.classLog.map(adaptLogEntry)
                : [],
  }));
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function StudentAttendance() {
  const navigate = useNavigate();
  const location = useLocation();

  const webglRef       = useRef(null);
  const introCanvasRef = useRef(null);
  const introRef       = useRef(null);
  const appRef         = useRef(null);
  const sidebarRef     = useRef(null);

  const [collapse,       setCollapse]       = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [userName,       setUserName]       = useState("Loading...");
  const [userId,         setUserId]         = useState("...");

  // ── FETCH ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      StudentApi.getProfile(),
      StudentApi.getAttendance(),
      StudentApi.getCourses(),
    ])
      .then(([profileRes, attendanceRes, coursesRes]) => {
        // Profile → Sidebar
        const d = profileRes?.student ?? profileRes ?? {};
        setUserName(d.name ?? "Student");
        setUserId(d.rollNumber ?? d.studentId ?? d.rollNo ?? "");

        // Build attendance data
        const raw     = attendanceRes?.attendance ?? [];
        const courses = coursesRes?.courses       ?? [];
        const built   = buildAttendanceData(raw, courses);
        setAttendanceData(built);
        if (built.length > 0) setSelectedCourse(built[0]);
      })
      .catch((err) => console.error("StudentAttendance fetch error:", err));
  }, []);

  const pct    = selectedCourse ? getPct(selectedCourse)  : 0;
  const atRisk = selectedCourse ? isRisk(selectedCourse)  : false;

  // ── CINEMATIC INTRO ────────────────────────────────────────────────────────
  useEffect(() => {
    const hasPlayed = sessionStorage.getItem("archIntroPlayed");
    if (hasPlayed) {
      introRef.current.style.display = "none";
      appRef.current.style.opacity   = 1;
      sidebarRef.current.style.transform = "translateX(0)";
      if (webglRef.current) {
        webglRef.current.style.opacity = 0;
        webglRef.current.style.display = "none";
      }
      document.querySelectorAll(".glass-card").forEach((el, i) =>
        gsap.to(el, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: i * 0.08 })
      );
      return;
    }

    const canvas = introCanvasRef.current;
    const ctx    = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const words = ["ATTENDANCE","PRESENT","ABSENT","LECTURE","SEMESTER","CAMPUS","CLASSES","SCHEDULE"];
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
      document.querySelectorAll(".glass-card").forEach((el, i) =>
        gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: "back.out(1.4)", delay: 0.2 + i * 0.1 })
      );
    };

    const tl = gsap.timeline({ delay: 0.2, onComplete: afterIntro });
    tl.to("#att-intro-line",  { scaleX: 1, duration: 0.8, ease: "power3.out" })
      .to("#att-intro-logo",  { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }, 0.5)
      .to("#att-intro-sub",   { opacity: 1, y: 0, duration: 0.5 }, 1.1)
      .to("#att-intro-logo",  { scale: 50, opacity: 0, duration: 0.7, ease: "power4.in" }, 2.4)
      .to("#att-intro-sub",   { opacity: 0, duration: 0.3 }, 2.4)
      .to("#att-intro-line",  { opacity: 0, duration: 0.3 }, 2.4)
      .to("#att-intro-flash", { opacity: 1, duration: 0.08 }, 2.85)
      .to("#att-intro-flash", { opacity: 0, duration: 0.4  }, 2.93)
      .to(introRef.current,   { opacity: 0, duration: 0.35 }, 2.88);

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
    const dirLight = new THREE.DirectionalLight(0x4488ff, 1.2);
    dirLight.position.set(5, 10, 5); scene.add(dirLight);
    const objects = [];
    const mk = (geo, mat, x, y, z, rs) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z); scene.add(mesh);
      objects.push({ mesh, speed: Math.random() * 0.004 + 0.002, phase: Math.random() * Math.PI * 2, rs });
    };
    const bGeo = new THREE.BoxGeometry(2, 0.2, 1.5);
    const bMat = new THREE.MeshPhongMaterial({ color: 0x1155cc, transparent: true, opacity: 0.15, wireframe: true });
    mk(bGeo, bMat, -6, 3, -5, 0.005); mk(bGeo, bMat, 6, 1, -6, -0.003);
    mk(bGeo, bMat, -4, -4, -8, 0.004); mk(bGeo, bMat, 5, -3, -4, -0.006);
    const rGeo = new THREE.TorusGeometry(1.5, 0.02, 16, 100);
    const rMat = new THREE.MeshPhongMaterial({ color: 0x40a9ff, transparent: true, opacity: 0.3 });
    mk(rGeo, rMat, 0, 4, -9, 0.01); mk(rGeo, rMat, -7, -1, -6, -0.008); mk(rGeo, rMat, 7, 4, -7, 0.009);
    let nmx = 0, nmy = 0;
    const onMove = (e) => { nmx = (e.clientX / W) * 2 - 1; nmy = -(e.clientY / H) * 2 + 1; };
    document.addEventListener("mousemove", onMove);
    let t = 0, animId;
    const loop = () => {
      animId = requestAnimationFrame(loop); t += 0.008;
      objects.forEach((o) => {
        o.mesh.position.y += Math.sin(t * o.speed * 10 + o.phase) * 0.004;
        o.mesh.rotation.x += o.rs * 0.5; o.mesh.rotation.y += o.rs;
      });
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

      <canvas id="att-webgl" ref={webglRef} />

      <div id="att-intro" ref={introRef}>
        <canvas id="att-intro-canvas" ref={introCanvasRef} />
        <div id="att-intro-line"  />
        <div id="att-intro-logo">ARCH</div>
        <div id="att-intro-sub">Attendance Tracker</div>
        <div id="att-intro-flash" />
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
            <div className="pg-title"><span>Attendance</span></div>
            <div className="tb-r">
              <div className="sem-chip">Spring 2025</div>
            </div>
          </div>

          <div id="scroll">
            <div className="att-layout">

              {/* ── LEFT: Course List ── */}
              <div className="att-course-list glass-card" style={{ opacity: 1, transform: "none" }}>
                <div className="ch">
                  <div className="ct"><div className="ctbar" />Courses</div>
                  <div className="att-summary-chip">
                    {attendanceData.filter((c) => !isRisk(c)).length}/{attendanceData.length} on track
                  </div>
                </div>

                <div className="att-course-items">
                  {attendanceData.length === 0 && (
                    <div style={{ padding: "24px", color: "var(--text-sub)", opacity: 0.6, textAlign: "center" }}>
                      Loading attendance…
                    </div>
                  )}
                  {attendanceData.map((course) => {
                    const cp    = getPct(course);
                    const risk  = isRisk(course);
                    const isSel = selectedCourse?.id === course.id;
                    return (
                      <div
                        key={course.id}
                        className={`att-course-row${isSel ? " selected" : ""}${risk ? " risk" : ""}`}
                        onClick={() => setSelectedCourse(course)}
                      >
                        <div className="att-course-row-top">
                          <div className="att-course-info">
                            <div className="att-course-name">{course.course}</div>
                            <div className="att-course-meta">
                              {course.code}
                              {course.credits ? ` · ${course.credits} Cr` : ""}
                            </div>
                          </div>
                          <div className={`att-pct-badge${risk ? " red" : " green"}`}>{cp}%</div>
                        </div>
                        <div className="att-mini-bar-track">
                          <div
                            className={`att-mini-bar-fill${risk ? " red" : " green"}`}
                            style={{ width: `${cp}%` }}
                          />
                          <div className="att-threshold-line" />
                        </div>
                        <div className="att-mini-counts">
                          <span>{course.attended} attended</span>
                          <span>{course.total - course.attended} absent</span>
                          <span>{course.total} total</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── RIGHT: Class Detail ── */}
              {selectedCourse && (
                <div className="att-detail-col">

                  {/* Header card */}
                  <div className="glass-card att-detail-header" style={{ opacity: 1, transform: "none" }}>
                    <div className="att-dh-top">
                      <div>
                        <div className="att-dh-title">{selectedCourse.course}</div>
                        <div className="att-dh-meta">
                          {selectedCourse.code}
                          {selectedCourse.credits ? ` · ${selectedCourse.credits} Credit Hours` : ""}
                          {" · Spring 2025"}
                        </div>
                      </div>
                      <div className={`att-big-pct${atRisk ? " red" : " green"}`}>{pct}%</div>
                    </div>

                    {/* Big attendance bar */}
                    <div className="att-big-bar-wrap">
                      <div className="att-big-bar-track">
                        <motion.div
                          key={selectedCourse.id + "-bar"}
                          className={`att-big-bar-fill${atRisk ? " red" : " green"}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.9, ease: "easeOut" }}
                        />
                        <div className="att-big-threshold" title="75% minimum" />
                      </div>
                      <div className="att-bar-labels">
                        <span className={atRisk ? "lbl-red" : "lbl-green"}>
                          {atRisk ? "⚠ Below minimum attendance" : "✓ Attendance satisfactory"}
                        </span>
                        <span className="lbl-dim">
                          {selectedCourse.attended}/{selectedCourse.total} classes
                        </span>
                      </div>
                    </div>

                    {/* Stat pills */}
                    <div className="att-stat-row">
                      <div className="att-stat-pill green">
                        <span className="att-stat-num">{selectedCourse.attended}</span>
                        <span className="att-stat-lbl">Present</span>
                      </div>
                      <div className="att-stat-pill red">
                        <span className="att-stat-num">{selectedCourse.total - selectedCourse.attended}</span>
                        <span className="att-stat-lbl">Absent</span>
                      </div>
                      <div className="att-stat-pill blue">
                        <span className="att-stat-num">{selectedCourse.total}</span>
                        <span className="att-stat-lbl">Total</span>
                      </div>
                      <div className="att-stat-pill blue">
                        <span className="att-stat-num">
                          {Math.max(0, Math.ceil(selectedCourse.total * 0.75) - selectedCourse.attended)}
                        </span>
                        <span className="att-stat-lbl">
                          {atRisk ? "Needed to clear" : "Can miss"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Class log */}
                  <div className="glass-card att-log-card" style={{ opacity: 1, transform: "none" }}>
                    <div className="ch">
                      <div className="ct"><div className="ctbar" />Class Log</div>
                      <div className="att-log-count">{selectedCourse.classes.length} records</div>
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={selectedCourse.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25 }}
                        className="att-log-list"
                      >
                        {selectedCourse.classes.length === 0 ? (
                          <div style={{ padding: "16px", color: "var(--text-sub)", opacity: 0.5, textAlign: "center" }}>
                            No class log available
                          </div>
                        ) : (
                          selectedCourse.classes.map((cls, i) => (
                            <div
                              key={i}
                              className={`att-log-row${cls.status === "absent" ? " absent" : ""}`}
                            >
                              <div className={`att-log-dot${cls.status === "absent" ? " red" : " green"}`} />
                              <div className="att-log-date">{cls.date}</div>
                              <div className="att-log-topic">{cls.topic}</div>
                              <div className={`att-log-status${cls.status === "absent" ? " red" : " green"}`}>
                                {cls.status === "present" ? "Present" : "Absent"}
                              </div>
                            </div>
                          ))
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}