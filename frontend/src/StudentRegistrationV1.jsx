import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import "./StudentDashV1.css";
import "./StudentRegistrationV1.css";
import Sidebar from "./Components/shared/Sidebar";
import { STUDENT_NAV } from "./config/studentNav";
import { useCourses, useEnrolledStats, useAvailableFiltered } from "./CourseContext";
import StudentApi from "./config/studentApi";

const MIN_CREDITS = 12;
const MAX_CREDITS = 18;

export default function StudentRegistrationV1() {
  const webglRef       = useRef(null);
  const introCanvasRef = useRef(null);
  const introRef       = useRef(null);
  const appRef         = useRef(null);
  const sidebarRef     = useRef(null);

  const [collapse,      setCollapse]      = useState(false);
  const [modalConfig,   setModalConfig]   = useState({ isOpen: false, title: "", message: "", type: "error" });
  const [actionLoading, setActionLoading] = useState(false);

  const closeAlert = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  // ── PROFILE ───────────────────────────────────────────────────────────────
  const [userName, setUserName] = useState("Loading...");
  const [userId,   setUserId]   = useState("...");

  useEffect(() => {
    StudentApi.getProfile().then(res => {
      if (res?.student) {
        setUserName(res.student.name     ?? "Student");
        setUserId(res.student.rollNumber ?? res.student.studentId ?? "");
      } else if (res?.name) {
        setUserName(res.name);
        setUserId(res.rollNumber ?? res.studentId ?? "");
      }
    }).catch(() => {});
  }, []);

  // ── CONTEXT ───────────────────────────────────────────────────────────────
  const { enrolled, loading, enrollCourse, dropCourse } = useCourses();
  const [search, setSearch] = useState("");

  // ── OBSERVER: computed stats ──────────────────────────────────────────────
  const { totalCredits, totalTuition, mandatoryMissing, prerequisiteErrors } = useEnrolledStats();

  // ── OBSERVER: filtered available ──────────────────────────────────────────
  const available = useAvailableFiltered(search);

  // ── HANDLERS ─────────────────────────────────────────────────────────────
  const handleEnroll = async (course) => {
    if (totalCredits + course.credits > MAX_CREDITS) {
      setModalConfig({ isOpen: true, title: "Credit Limit Exceeded", message: `You cannot exceed the maximum of ${MAX_CREDITS} credits.`, type: "error" });
      return;
    }
    setActionLoading(true);
    try {
      await enrollCourse(course);
    } catch (err) {
      const msgMap = {
        ALREADY_ENROLLED:  "You are already enrolled in this course.",
        NO_SEATS:          "No seats available in this section.",
        COURSE_NOT_FOUND:  "Course not found.",
        SECTION_NOT_FOUND: "Section not found.",
      };
      setModalConfig({ isOpen: true, title: "Enrollment Failed", message: msgMap[err.message] ?? err.message, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDrop = async (course) => {
    setActionLoading(true);
    try {
      await dropCourse(course);
    } catch (err) {
      setModalConfig({ isOpen: true, title: "Drop Failed", message: err.message, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleShift = (course) => {
    setModalConfig({ isOpen: true, title: "Shift Section", message: `Alternate sections for ${course.code} are currently being verified by the department.`, type: "info" });
  };

  const handleConfirm = () => {
    if (totalCredits > MAX_CREDITS) {
      setModalConfig({ isOpen: true, title: "Credit Limit Exceeded", message: `You cannot exceed the maximum of ${MAX_CREDITS} credits.`, type: "error" });
      return;
    }
    if (totalCredits < MIN_CREDITS) {
      setModalConfig({ isOpen: true, title: "Minimum Credits Not Met", message: `You must enroll in at least ${MIN_CREDITS} credits. You currently have ${totalCredits}.`, type: "error" });
      return;
    }
    if (mandatoryMissing.length > 0) {
      setModalConfig({ isOpen: true, title: "Missing Mandatory Courses", message: `Missing mandatory: ${mandatoryMissing.join(", ")}.`, type: "error" });
      return;
    }
    if (prerequisiteErrors.length > 0) {
      setModalConfig({ isOpen: true, title: "Prerequisite Error", message: `You enrolled in ${prerequisiteErrors[0].code} but dropped its prerequisite (${prerequisiteErrors[0].req}).`, type: "error" });
      return;
    }
    setModalConfig({
      isOpen: true,
      title: "Registration Confirmed!",
      message: `Your schedule is locked. ${totalCredits} credits registered. Est. Tuition: Rs. ${totalTuition.toLocaleString()}.`,
      type: "success",
    });
  };

  // ── CINEMATIC INTRO ───────────────────────────────────────────────────────
  useEffect(() => {
    const hasPlayedIntro = sessionStorage.getItem("archIntroPlayed");
    if (hasPlayedIntro) {
      introRef.current.style.display = "none";
      appRef.current.style.opacity = 1;
      sidebarRef.current.style.transform = "translateX(0)";
      if (webglRef.current) { webglRef.current.style.opacity = 0; webglRef.current.style.display = "none"; }
      return;
    }
    const canvas = introCanvasRef.current;
    const ctx    = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const words = ["ENROLL","REGISTER","TUITION","TIMETABLE","PREREQUISITE","SECTION"];
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      word:    words[Math.floor(Math.random() * words.length)],
      opacity: Math.random() * 0.4 + 0.05, speed: Math.random() * 0.8 + 0.2,
      size:    Math.floor(Math.random() * 10) + 10, flicker: Math.random() * 0.025 + 0.005,
      hue:     Math.random() > 0.6 ? "255,255,255" : "60,140,255",
    }));
    let animId;
    const draw = () => {
      ctx.fillStyle = "rgba(0,4,14,0.18)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.y -= p.speed * 0.4; p.opacity += p.flicker * (Math.random() > 0.5 ? 1 : -1);
        p.opacity = Math.max(0.03, Math.min(0.55, p.opacity));
        if (p.y < -30) { p.y = canvas.height + 20; p.x = Math.random() * canvas.width; }
        ctx.font = `${p.size}px 'Inter', sans-serif`; ctx.fillStyle = `rgba(${p.hue},${p.opacity})`; ctx.fillText(p.word, p.x, p.y);
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    const afterIntro = () => {
      cancelAnimationFrame(animId); sessionStorage.setItem("archIntroPlayed", "true");
      gsap.set(introRef.current, { display: "none" });
      gsap.to(appRef.current, { opacity: 1, duration: 0.6 });
      gsap.to(sidebarRef.current, { x: 0, duration: 1.2, ease: "expo.out" });
      gsap.to(webglRef.current, { opacity: 0, duration: 2.5, ease: "power2.inOut", delay: 0.5 });
      setTimeout(() => { if (webglRef.current) webglRef.current.style.display = "none"; }, 3000);
    };
    const tl = gsap.timeline({ delay: 0.2, onComplete: afterIntro });
    tl.to("#intro-line",  { scaleX: 1, duration: 0.8, ease: "power3.out" })
      .to("#intro-logo",  { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }, 0.5)
      .to("#intro-sub",   { opacity: 1, y: 0, duration: 0.5 }, 1.1)
      .to("#intro-logo",  { scale: 50, opacity: 0, duration: 0.7, ease: "power4.in" }, 2.4)
      .to("#intro-sub",   { opacity: 0, duration: 0.3 }, 2.4)
      .to("#intro-line",  { opacity: 0, duration: 0.3 }, 2.4)
      .to("#intro-flash", { opacity: 1, duration: 0.08 }, 2.85)
      .to("#intro-flash", { opacity: 0, duration: 0.4  }, 2.93)
      .to(introRef.current, { opacity: 0, duration: 0.35 }, 2.88);
    return () => cancelAnimationFrame(animId);
  }, []);

  // ── THREE.JS BG ───────────────────────────────────────────────────────────
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
    const onMove = e => { nmx = (e.clientX / W) * 2 - 1; nmy = -(e.clientY / H) * 2 + 1; };
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
      <AnimatePresence>
        {modalConfig.isOpen && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className={`custom-modal ${modalConfig.type}`}
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="cm-title">
                {modalConfig.type === "error"   && "⚠️ Action Blocked"}
                {modalConfig.type === "info"    && "ℹ️ Notice"}
                {modalConfig.type === "success" && "✅ Success"}
              </div>
              <div className="cm-body">{modalConfig.message}</div>
              <div className="cm-footer">
                <button className="cm-btn" onClick={closeAlert}>
                  {modalConfig.type === "success" ? "View Dashboard" : "Understood"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mesh-bg">
        <div className="mesh-blob blob-1" /><div className="mesh-blob blob-2" /><div className="mesh-blob blob-3" />
      </div>
      <div id="cur-ring" /><div id="cur-dot" /><div className="scanlines" /><div className="vignette" />
      <div className="corner-tl" /><div className="corner-tr" /><div className="corner-bl" /><div className="corner-br" />
      <canvas id="webgl" ref={webglRef} />

      <div id="intro" ref={introRef}>
        <canvas id="intro-canvas" ref={introCanvasRef} />
        <div id="intro-line" /><div id="intro-logo">ARCH</div>
        <div id="intro-sub">Course Registration</div><div id="intro-flash" />
      </div>

      <div id="app" ref={appRef}>
        <Sidebar
          ref={sidebarRef}
          sections={STUDENT_NAV}
          logoLabel="Student Portal"
          userName={userName}
          userId={userId}
          collapse={collapse}
          onToggle={() => setCollapse(c => !c)}
        />

        <div id="main">
          <div id="topbar">
            <div className="pg-title"><span>Course Registration</span></div>
            <div className="tb-r"><div className="sem-chip">Spring 2025</div></div>
          </div>

          <div id="scroll">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="reg-layout">

              {/* ── LEFT PANEL ── */}
              <div className="reg-market">
                <div className="market-header">
                  <h2 className="ct"><div className="ctbar"/>Available Courses</h2>
                  <input type="text" className="search-bar" placeholder="Search by code, name, professor, or slot..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>

                {loading ? (
                  <div style={{ color: "var(--dimmer)", fontWeight: 700, padding: "20px" }}>Loading available courses...</div>
                ) : (
                  <AnimatePresence>
                    {available.map(course => (
                      <motion.div key={course.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }} className={`course-card ${course.status === "locked" ? "locked" : ""}`}>
                        <div className="cc-top">
                          <div className="cc-code-wrap">
                            <span className="cc-code">{course.code}</span>
                            {course.mandatory && <span className="badge-mandatory">Mandatory</span>}
                          </div>
                          <div className="cc-price">Rs. {course.price.toLocaleString()}</div>
                        </div>
                        <div className="cc-name">{course.name}</div>
                        <div className="cc-mid">
                          <div className="cc-detail">👨‍🏫 {course.prof}</div>
                          <div className="cc-detail">📚 {course.credits} Credits</div>
                          <div className="cc-detail">⏰ {course.time}</div>
                        </div>
                        <div className="cc-bot">
                          <div className="seat-container">
                            <div className="seat-text">
                              <span style={{ color: "var(--dimmer)" }}>Seats</span>
                              <span style={{ color: course.status === "full" ? "var(--red)" : "var(--blue)" }}>{course.seats} / {course.maxSeats}</span>
                            </div>
                            <div className="seat-bar-bg">
                              <div className={`seat-bar-fill ${course.status === "full" ? "sb-red" : (course.seats / course.maxSeats) > 0.8 ? "sb-amber" : "sb-green"}`} style={{ width: `${Math.min((course.seats / course.maxSeats) * 100, 100)}%` }} />
                            </div>
                          </div>
                          <div>
                            {course.status === "open"   && <button className="btn-enroll" onClick={() => handleEnroll(course)} disabled={actionLoading}>{actionLoading ? "..." : "Enroll Now"}</button>}
                            {course.status === "clash"  && <span className="status-badge badge-clash">⚡ Clash · {course.clashWith}</span>}
                            {course.status === "locked" && <span className="status-badge badge-lock">🔒 Prereq not met</span>}
                            {course.status === "full"   && <span className="status-badge badge-full">Full</span>}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* ── RIGHT PANEL ── */}
              <div className="reg-portfolio">
                <div className="ledger-card">
                  <div className="ledger-row">
                    <div className="ledger-label">Total Registered Credits</div>
                    <div className={`ledger-val ${totalCredits < MIN_CREDITS ? "warn" : ""}`}>
                      {totalCredits} <span className="ledger-val-hrs">hrs</span>
                    </div>
                  </div>
                  <div className="credit-limit-bar">
                    <div className="limit-marker" />
                    <div className="limit-fill" style={{ width: `${Math.min((totalCredits / MAX_CREDITS) * 100, 100)}%`, background: totalCredits < MIN_CREDITS ? "var(--amber)" : totalCredits === MAX_CREDITS ? "var(--green)" : "var(--blue)" }} />
                  </div>
                  <div className="ledger-limit-text"><span>0</span><span>Min: 12</span><span>Max: 18</span></div>
                  <div className="ledger-row" style={{ marginTop: "32px", marginBottom: 0 }}>
                    <div className="ledger-label">Est. Tuition Fee</div>
                    <div className="ledger-val ledger-val--tuition">Rs. {totalTuition.toLocaleString()}</div>
                  </div>
                </div>

                <h2 className="ct" style={{ marginTop: "16px" }}><div className="ctbar"/>Active Schedule</h2>

                <div className="enrolled-list">
                  {loading ? (
                    <div style={{ color: "var(--dimmer)", fontWeight: 700, padding: "20px" }}>Loading enrolled courses...</div>
                  ) : (
                    <AnimatePresence>
                      {enrolled.map(course => (
                        <motion.div key={course.id} layout initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }} className="course-card">
                          <div className="cc-top">
                            <div className="cc-code-wrap">
                              <span className="cc-code">{course.code}</span>
                              {course.mandatory && <span className="badge-mandatory">Mandatory</span>}
                            </div>
                          </div>
                          <div className="cc-name">{course.name}</div>
                          <div className="cc-mid">
                            <div className="cc-detail">⏰ {course.time}</div>
                            <div className="cc-detail">📚 {course.credits} Cr</div>
                          </div>
                          <div className="cc-bot" style={{ paddingTop: "16px", marginTop: "10px" }}>
                            <button className="btn-shift" onClick={() => handleShift(course)}>Shift Section</button>
                            <button className="btn-drop" onClick={() => handleDrop(course)} disabled={actionLoading}>{actionLoading ? "..." : "Drop"}</button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>

                <div className="confirm-wrapper">
                  <button className="btn-confirm" onClick={handleConfirm}>Confirm Registration</button>
                </div>
              </div>

            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}