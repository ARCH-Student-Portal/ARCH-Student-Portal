import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import * as THREE from "three";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion"; 
import "./StudentDashV1.css"; 
import "./StudentRegistrationV1.css"; 

export default function StudentRegistrationV1() {
  const navigate = useNavigate();
  const location = useLocation();
  const webglRef = useRef(null);
  const introCanvasRef = useRef(null);
  const introRef = useRef(null);
  const appRef = useRef(null);
  const sidebarRef = useRef(null);
  const [collapse, setCollapse] = useState(false);

  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: "", message: "", type: "error" });
  const closeAlert = () => setModalConfig({ ...modalConfig, isOpen: false });

  // The global list of courses a student MUST take this semester
  const mandatoryCourses = ["CS-3001", "CS-2012"];

  // --- MOCK DATA ---
  const [enrolled, setEnrolled] = useState([
    { id: "e1", code: "CS-3001", name: "Object Oriented Analysis & Design", prof: "Hamza Raheel", credits: 3, price: 45000, time: "Mon 08:30 AM", mandatory: true },
    { id: "e2", code: "CS-2012", name: "Database Systems", prof: "Dr. Ayesha", credits: 4, price: 60000, time: "Tue 10:00 AM", mandatory: true },
    { id: "e3", code: "MT-2005", name: "Probability & Stats", prof: "Dr. Kamran", credits: 3, price: 45000, time: "Wed 11:30 AM", mandatory: false }
  ]); 

  const [availableData, setAvailableData] = useState([
    { id: "a1", code: "CS-3005", name: "Web Programming", prof: "Usman Ali", credits: 3, price: 45000, time: "Thu 01:00 PM", seats: 42, maxSeats: 50, mandatory: false },
    { id: "a2", code: "CS-3004", name: "Artificial Intelligence", prof: "Dr. Zafar", credits: 4, price: 60000, time: "Fri 08:30 AM", seats: 50, maxSeats: 50, mandatory: false },
    { id: "a3", code: "EE-2003", name: "Digital Logic Design", prof: "Engr. Bilal", credits: 3, price: 45000, time: "Mon 08:30 AM", seats: 15, maxSeats: 40, mandatory: false },
    { id: "a4", code: "CS-4001", name: "Data Science", prof: "Dr. Fatima", credits: 4, price: 60000, time: "Wed 02:00 PM", seats: 10, maxSeats: 50, req: "CS-2012", mandatory: false }
  ]);

  // Dynamic Ledger Math
  const totalCredits = enrolled.reduce((acc, curr) => acc + curr.credits, 0);
  const totalTuition = enrolled.reduce((acc, curr) => acc + curr.price, 0);
  const minCredits = 12;
  const maxCredits = 18;

  // 🚀 DYNAMIC ALIVE LOGIC: Evaluates status (Clashes/Locks) in real-time based on your current cart!
  const available = availableData.map(course => {
    let status = course.seats >= course.maxSeats ? 'full' : 'open';
    const clashCourse = enrolled.find(e => e.time === course.time);
    
    if (clashCourse) {
      status = 'clash';
      course.clashWith = clashCourse.code;
    } else if (course.req && !enrolled.some(e => e.code === course.req)) {
      status = 'locked';
    }
    return { ...course, status };
  });

  // --- HANDLERS ---
  const handleEnroll = (course) => {
    if (totalCredits + course.credits > maxCredits) {
      setModalConfig({ isOpen: true, title: "Credit Limit Exceeded", message: `You cannot exceed the maximum of ${maxCredits} credits.`, type: "error" });
      return;
    }
    setAvailableData(prev => prev.filter(c => c.id !== course.id));
    setEnrolled(prev => [...prev, course]);
  };

  const handleDrop = (course) => {
    // REMOVED THE BOTTLENECK! You can now freely drop courses, even to 0 credits.
    setEnrolled(prev => prev.filter(c => c.id !== course.id));
    setAvailableData(prev => [...prev, course]); 
  };

  const handleShift = (course) => {
    setModalConfig({ isOpen: true, title: "Shift Section", message: `Alternate sections for ${course.code} are currently being verified by the department.`, type: "info" });
  };

  // 🚀 THE ULTIMATE VALIDATION CHECK (Fires only on save)
  const handleConfirm = () => {
    // Check 1: Minimum Credits
    if (totalCredits < minCredits) {
      setModalConfig({ isOpen: true, title: "Minimum Credits Not Met", message: `You must enroll in at least ${minCredits} credits to confirm your schedule. You currently have ${totalCredits} credits.`, type: "error" });
      return;
    }
    // Check 2: Mandatory Courses
    const missing = mandatoryCourses.filter(code => !enrolled.some(e => e.code === code));
    if (missing.length > 0) {
      setModalConfig({ isOpen: true, title: "Missing Mandatory Courses", message: `You cannot confirm your registration. You are missing the following mandatory courses: ${missing.join(", ")}.`, type: "error" });
      return;
    }
    // Check 3: Prerequisite Dependencies (if they dropped a prereq but kept the advanced course)
    const prereqErrors = enrolled.filter(c => c.req && !enrolled.some(e => e.code === c.req));
    if (prereqErrors.length > 0) {
      setModalConfig({ isOpen: true, title: "Prerequisite Error", message: `You are enrolled in ${prereqErrors[0].code}, but you dropped its prerequisite (${prereqErrors[0].req}). Please fix your schedule.`, type: "error" });
      return;
    }

    setModalConfig({ isOpen: true, title: "Registration Confirmed!", message: `Your schedule has been successfully locked in. You are registered for ${totalCredits} credits. Total Tuition: Rs. ${totalTuition.toLocaleString()}.`, type: "success" });
  };

  // --- GSAP INTRO LOGIC ---
  useEffect(() => {
    const hasPlayedIntro = sessionStorage.getItem("archIntroPlayed");
    if (hasPlayedIntro) {
      introRef.current.style.display = "none";
      appRef.current.style.opacity = 1;
      sidebarRef.current.style.transform = "translateX(0)";
      return; 
    }
    const canvas = introCanvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const words = ["ENROLL","REGISTER","TUITION","TIMETABLE","PREREQUISITE","SECTION"];
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      word: words[Math.floor(Math.random() * words.length)], opacity: Math.random() * 0.4 + 0.05, speed: Math.random() * 0.8 + 0.2,
      size: Math.floor(Math.random() * 10) + 10, flicker: Math.random() * 0.025 + 0.005, hue: Math.random() > 0.6 ? "255,255,255" : "60,140,255",
    }));
    let animId;
    const draw = () => {
      ctx.fillStyle = "rgba(0,4,14,0.18)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
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
      gsap.set(introRef.current, { display: "none" }); gsap.to(appRef.current, { opacity: 1, duration: 0.6 }); gsap.to(sidebarRef.current, { x: 0, duration: 1.2, ease: "expo.out" });
    };
    const tl = gsap.timeline({ delay: 0.2, onComplete: afterIntro });
    tl.to("#intro-line", { scaleX: 1, duration: 0.8, ease: "power3.out" }).to("#intro-logo", { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }, 0.5).to("#intro-sub", { opacity: 1, y: 0, duration: 0.5 }, 1.1).to("#intro-logo", { scale: 50, opacity: 0, duration: 0.7, ease: "power4.in" }, 2.4).to("#intro-sub", { opacity: 0, duration: 0.3 }, 2.4).to("#intro-line", { opacity: 0, duration: 0.3 }, 2.4).to("#intro-flash", { opacity: 1, duration: 0.08 }, 2.85).to("#intro-flash", { opacity: 0, duration: 0.4 }, 2.93).to(introRef.current, { opacity: 0, duration: 0.35 }, 2.88);
    return () => cancelAnimationFrame(animId);
  }, []);

  // --- 3D BACKGROUND ---
  useEffect(() => {
    const canvas = webglRef.current;
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
      <AnimatePresence>
        {modalConfig.isOpen && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className={`custom-modal ${modalConfig.type}`} initial={{ y: 50, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 20, opacity: 0, scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
              <div className="cm-title">
                {modalConfig.type === 'error' && '⚠️ Action Blocked'}
                {modalConfig.type === 'info' && 'ℹ️ Notice'}
                {modalConfig.type === 'success' && '✅ Success'}
              </div>
              <div className="cm-body">{modalConfig.message}</div>
              <div className="cm-footer">
                <button className="cm-btn" onClick={closeAlert}>{modalConfig.type === 'success' ? 'View Dashboard' : 'Understood'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div id="cur-ring" /><div id="cur-dot" /><div className="scanlines" /><div className="vignette" /><div className="corner-tl" /><div className="corner-tr" /><div className="corner-bl" /><div className="corner-br" />
      <canvas id="webgl" ref={webglRef} />

      <div id="intro" ref={introRef}><canvas id="intro-canvas" ref={introCanvasRef} /><div id="intro-line" /><div id="intro-logo">ARCH</div><div id="intro-sub">Course Registration</div><div id="intro-flash" /></div>

      <div id="app" ref={appRef}>
        <nav id="sidebar" ref={sidebarRef} className={collapse ? "collapse" : ""}>
          <div className="sb-top-bar" /><button className="sb-toggle" onClick={() => setCollapse(c => !c)}><span/><span/><span/></button> 
          <div className="sb-logo"><div className="logo-box">A</div><div><div className="logo-name">ARCH</div><div className="logo-tagline">Student Portal</div></div></div>
          <div className="sb-user"><div className="uav">AB</div><div><div className="uname">Areeb Bucha</div><div className="uid">21K-3210</div></div></div>
          {[
            ["Overview", [["⊞","Dashboard","/student/dashboard"],["◎","Academic","/student/academic"]]],
            ["Courses",[["＋","Registration","/student/registration"],["◈","Grades","/student/grades"],["▦","Marks","/student/marks"],["✓","Attendance","/student/attendance"],["▤","Timetable","/student/timetable"]]],
            ["Communication",[["◉","Notices","/student/notices"]]],
            ["Account",[["◌","Profile","/student/profile"]]],
          ].map(([sec, items]) => (
            <div key={sec}>
              <div className="nav-sec">{sec}</div>
              {items.map(([ic, label, path]) => (
                <div className={`ni ${location.pathname === path ? " active" : ""}`} key={label} onClick={() => navigate(path)} style={{cursor: 'pointer'}}><div className="ni-ic">{ic}</div>{label}</div>
              ))}
            </div>
          ))}
        </nav>

        <div id="main">
          <div id="topbar"><div className="pg-title"><span>Course Registration</span></div><div className="tb-r"><div className="sem-chip">Spring 2025</div></div></div>

          <div id="scroll">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="reg-layout">
              
              {/* LEFT PANEL */}
              <div className="reg-market">
                <div className="market-header">
                  <h2 className="ct"><div className="ctbar"/>Available Courses</h2>
                  <input type="text" className="search-bar" placeholder="Search by code, name, or professor..." />
                </div>

                <AnimatePresence>
                  {available.map(course => (
                    <motion.div key={course.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }} className={`course-card ${course.status === 'locked' ? 'locked' : ''}`}>
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
                            <span style={{color: "var(--dimmer)"}}>Seats</span>
                            <span style={{color: course.status === 'full' ? 'var(--red)' : 'var(--blue)'}}>{course.seats} / {course.maxSeats}</span>
                          </div>
                          <div className="seat-bar-bg">
                            <div className={`seat-bar-fill ${course.status === 'full' ? 'sb-red' : (course.seats / course.maxSeats) > 0.8 ? 'sb-amber' : 'sb-green'}`} style={{ width: `${(course.seats / course.maxSeats) * 100}%` }} />
                          </div>
                        </div>

                        <div>
                          {course.status === 'open' && <button className="btn-enroll" onClick={() => handleEnroll(course)}>Enroll Now</button>}
                          {course.status === 'full' && <span className="status-badge badge-full">Course Full</span>}
                          {course.status === 'clash' && <span className="status-badge badge-clash">Clash: {course.clashWith}</span>}
                          {course.status === 'locked' && <span className="status-badge badge-lock">🔒 Req: {course.req}</span>}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* RIGHT PANEL */}
              <div className="reg-portfolio">
                <div className="ledger-card">
                  <div className="ledger-row">
                    <div className="ledger-label">Total Registered Credits</div>
                    <div className={`ledger-val ${totalCredits < minCredits ? 'warn' : ''}`}>{totalCredits} <span style={{fontSize:'16px', color:'var(--dimmer)', fontFamily:'Inter'}}>hrs</span></div>
                  </div>
                  <div className="credit-limit-bar">
                    <div className="limit-marker" />
                    <div className="limit-fill" style={{ width: `${(totalCredits / maxCredits) * 100}%`, background: totalCredits < minCredits ? 'var(--amber)' : totalCredits === maxCredits ? 'var(--green)' : 'var(--blue)'}} />
                  </div>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:'11px', color:'var(--dimmer)', marginTop:'6px', fontWeight:'700'}}>
                    <span>0</span><span>Min: 12</span><span>Max: 18</span>
                  </div>
                  <div className="ledger-row" style={{marginTop: '24px', marginBottom: 0}}>
                    <div className="ledger-label">Est. Tuition Fee</div>
                    <div className="ledger-val" style={{fontSize: '28px'}}>Rs. {totalTuition.toLocaleString()}</div>
                  </div>
                </div>

                <h2 className="ct" style={{marginTop: '10px'}}><div className="ctbar"/>Active Schedule</h2>
                
                <div className="enrolled-list">
                  <AnimatePresence>
                    {enrolled.map(course => (
                      <motion.div key={course.id} layout initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }} className="course-card" style={{padding: '16px'}}>
                        <div className="cc-top">
                          <div className="cc-code-wrap">
                            <span className="cc-code" style={{fontSize:'11px'}}>{course.code}</span>
                            {course.mandatory && <span className="badge-mandatory">Mandatory</span>}
                          </div>
                        </div>
                        <div className="cc-name" style={{fontSize:'15px', marginTop:'6px'}}>{course.name}</div>
                        <div className="cc-mid" style={{fontSize:'12px'}}>
                          <div className="cc-detail">⏰ {course.time}</div><div className="cc-detail">📚 {course.credits} Cr</div>
                        </div>
                        <div className="cc-bot" style={{paddingTop:'12px', marginTop:'8px'}}>
                          <button className="btn-shift" onClick={() => handleShift(course)}>Shift Section</button>
                          <button className="btn-drop" onClick={() => handleDrop(course)}>Drop</button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* THE NEW CONFIRM BUTTON */}
                <div className="confirm-wrapper">
                  <button className="btn-confirm" onClick={handleConfirm}>
                    Confirm Registration
                  </button>
                </div>

              </div>

            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}