import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import "./StudentAttendance.css";

// ── MOCK DATA ──────────────────────────────────────────────────────────────────
const attendanceData = [
  {
    id: 1,
    course: "Artificial Intelligence",
    code: "CS-471",
    credits: 3,
    total: 32,
    attended: 29,
    classes: [
      { date: "Jan 13", topic: "Introduction to AI", status: "present" },
      { date: "Jan 15", topic: "Search Algorithms", status: "present" },
      { date: "Jan 20", topic: "Uninformed Search", status: "present" },
      { date: "Jan 22", topic: "Informed Search", status: "absent" },
      { date: "Jan 27", topic: "A* Algorithm", status: "present" },
      { date: "Jan 29", topic: "CSP", status: "present" },
      { date: "Feb 3",  topic: "Propositional Logic", status: "present" },
      { date: "Feb 5",  topic: "First-Order Logic", status: "present" },
      { date: "Feb 10", topic: "Planning", status: "present" },
      { date: "Feb 12", topic: "Uncertain Knowledge", status: "present" },
      { date: "Feb 17", topic: "Bayesian Networks", status: "present" },
      { date: "Feb 19", topic: "Hidden Markov Models", status: "present" },
      { date: "Feb 24", topic: "Machine Learning Intro", status: "present" },
      { date: "Feb 26", topic: "Decision Trees", status: "absent" },
      { date: "Mar 3",  topic: "Neural Networks", status: "present" },
      { date: "Mar 5",  topic: "Backpropagation", status: "present" },
      { date: "Mar 10", topic: "CNNs", status: "present" },
      { date: "Mar 12", topic: "RNNs", status: "present" },
      { date: "Mar 17", topic: "NLP Basics", status: "present" },
      { date: "Mar 19", topic: "Transformers", status: "present" },
      { date: "Mar 24", topic: "Reinforcement Learning", status: "present" },
      { date: "Mar 26", topic: "Q-Learning", status: "present" },
      { date: "Mar 31", topic: "Ethics in AI", status: "present" },
      { date: "Apr 2",  topic: "Adversarial Attacks", status: "present" },
      { date: "Apr 7",  topic: "Explainable AI", status: "present" },
      { date: "Apr 9",  topic: "Computer Vision", status: "present" },
      { date: "Apr 14", topic: "Object Detection", status: "present" },
      { date: "Apr 16", topic: "GANs", status: "present" },
      { date: "Apr 21", topic: "Revision I", status: "present" },
      { date: "Apr 23", topic: "Revision II", status: "present" },
      { date: "Apr 28", topic: "Mock Exam", status: "present" },
      { date: "Apr 30", topic: "Final Review", status: "present" },
    ],
  },
  {
    id: 2,
    course: "Final Year Project",
    code: "CS-491",
    credits: 6,
    total: 28,
    attended: 25,
    classes: [
      { date: "Jan 13", topic: "Project Kickoff", status: "present" },
      { date: "Jan 20", topic: "Literature Review", status: "present" },
      { date: "Jan 27", topic: "Proposal Draft", status: "present" },
      { date: "Feb 3",  topic: "Proposal Defense", status: "present" },
      { date: "Feb 10", topic: "System Design", status: "absent" },
      { date: "Feb 17", topic: "DB Schema", status: "present" },
      { date: "Feb 24", topic: "Backend Setup", status: "present" },
      { date: "Mar 3",  topic: "API Design", status: "present" },
      { date: "Mar 10", topic: "Frontend Integration", status: "present" },
      { date: "Mar 17", topic: "Sprint Review I", status: "present" },
      { date: "Mar 24", topic: "Testing Phase I", status: "present" },
      { date: "Mar 31", topic: "Sprint Review II", status: "absent" },
      { date: "Apr 7",  topic: "Testing Phase II", status: "present" },
      { date: "Apr 14", topic: "Documentation", status: "present" },
      { date: "Apr 21", topic: "Pre-Defense Demo", status: "present" },
      { date: "Apr 28", topic: "Final Defense", status: "absent" },
      { date: "Jan 15", topic: "Scope Discussion", status: "present" },
      { date: "Jan 22", topic: "Tech Stack Decision", status: "present" },
      { date: "Jan 29", topic: "Wireframing", status: "present" },
      { date: "Feb 5",  topic: "Milestone 1 Check", status: "present" },
      { date: "Feb 12", topic: "Data Collection", status: "present" },
      { date: "Feb 19", topic: "Model Training", status: "present" },
      { date: "Feb 26", topic: "Evaluation Metrics", status: "present" },
      { date: "Mar 5",  topic: "Peer Review", status: "present" },
      { date: "Mar 12", topic: "Supervisor Meeting", status: "present" },
      { date: "Mar 19", topic: "Risk Assessment", status: "present" },
      { date: "Mar 26", topic: "Deployment Setup", status: "present" },
      { date: "Apr 2",  topic: "Final Presentation Prep", status: "present" },
    ],
  },
  {
    id: 3,
    course: "Software Project Management",
    code: "CS-461",
    credits: 3,
    total: 30,
    attended: 19,
    classes: [
      { date: "Jan 13", topic: "PM Overview", status: "present" },
      { date: "Jan 15", topic: "SDLC Models", status: "absent" },
      { date: "Jan 20", topic: "Agile Basics", status: "present" },
      { date: "Jan 22", topic: "Scrum Framework", status: "absent" },
      { date: "Jan 27", topic: "Kanban", status: "present" },
      { date: "Jan 29", topic: "Project Charter", status: "absent" },
      { date: "Feb 3",  topic: "WBS", status: "present" },
      { date: "Feb 5",  topic: "Gantt Charts", status: "absent" },
      { date: "Feb 10", topic: "Risk Management", status: "present" },
      { date: "Feb 12", topic: "Stakeholder Analysis", status: "absent" },
      { date: "Feb 17", topic: "Cost Estimation", status: "present" },
      { date: "Feb 19", topic: "Resource Planning", status: "present" },
      { date: "Feb 24", topic: "Quality Assurance", status: "absent" },
      { date: "Feb 26", topic: "Change Management", status: "present" },
      { date: "Mar 3",  topic: "Communications Plan", status: "absent" },
      { date: "Mar 5",  topic: "Sprint Planning", status: "present" },
      { date: "Mar 10", topic: "Retrospectives", status: "present" },
      { date: "Mar 12", topic: "Project Closure", status: "absent" },
      { date: "Mar 17", topic: "Case Study I", status: "present" },
      { date: "Mar 19", topic: "Case Study II", status: "present" },
      { date: "Mar 24", topic: "Procurement", status: "absent" },
      { date: "Mar 26", topic: "Contracts", status: "present" },
      { date: "Mar 31", topic: "Legal & Compliance", status: "absent" },
      { date: "Apr 2",  topic: "Ethics in PM", status: "present" },
      { date: "Apr 7",  topic: "Earned Value Mgmt", status: "present" },
      { date: "Apr 9",  topic: "Revision I", status: "absent" },
      { date: "Apr 14", topic: "Revision II", status: "present" },
      { date: "Apr 16", topic: "Mock Exam", status: "present" },
      { date: "Apr 21", topic: "Final Review", status: "present" },
      { date: "Apr 23", topic: "Q&A Session", status: "absent" },
    ],
  },
  {
    id: 4,
    course: "Information Security",
    code: "CS-452",
    credits: 3,
    total: 30,
    attended: 27,
    classes: [
      { date: "Jan 13", topic: "CIA Triad", status: "present" },
      { date: "Jan 15", topic: "Threat Models", status: "present" },
      { date: "Jan 20", topic: "Cryptography Basics", status: "present" },
      { date: "Jan 22", topic: "Symmetric Encryption", status: "present" },
      { date: "Jan 27", topic: "Asymmetric Encryption", status: "present" },
      { date: "Jan 29", topic: "Hashing", status: "present" },
      { date: "Feb 3",  topic: "Digital Signatures", status: "present" },
      { date: "Feb 5",  topic: "PKI", status: "present" },
      { date: "Feb 10", topic: "TLS/SSL", status: "present" },
      { date: "Feb 12", topic: "Firewalls & IDS", status: "absent" },
      { date: "Feb 17", topic: "Network Attacks", status: "present" },
      { date: "Feb 19", topic: "Social Engineering", status: "present" },
      { date: "Feb 24", topic: "Malware Analysis", status: "present" },
      { date: "Feb 26", topic: "Web Security", status: "present" },
      { date: "Mar 3",  topic: "SQL Injection", status: "present" },
      { date: "Mar 5",  topic: "XSS & CSRF", status: "present" },
      { date: "Mar 10", topic: "Penetration Testing", status: "present" },
      { date: "Mar 12", topic: "Ethical Hacking", status: "present" },
      { date: "Mar 17", topic: "Forensics", status: "present" },
      { date: "Mar 19", topic: "Incident Response", status: "absent" },
      { date: "Mar 24", topic: "Cloud Security", status: "present" },
      { date: "Mar 26", topic: "Zero Trust", status: "present" },
      { date: "Mar 31", topic: "Security Policies", status: "present" },
      { date: "Apr 2",  topic: "Compliance", status: "present" },
      { date: "Apr 7",  topic: "Risk Assessment", status: "present" },
      { date: "Apr 9",  topic: "Blockchain Security", status: "absent" },
      { date: "Apr 14", topic: "IoT Security", status: "present" },
      { date: "Apr 16", topic: "Revision I", status: "present" },
      { date: "Apr 21", topic: "Revision II", status: "present" },
      { date: "Apr 23", topic: "Final Review", status: "present" },
    ],
  },
  {
    id: 5,
    course: "Technical Writing",
    code: "HU-301",
    credits: 2,
    total: 26,
    attended: 24,
    classes: [
      { date: "Jan 14", topic: "Writing Fundamentals", status: "present" },
      { date: "Jan 21", topic: "Technical Reports", status: "present" },
      { date: "Jan 28", topic: "Documentation Standards", status: "present" },
      { date: "Feb 4",  topic: "Audience Analysis", status: "present" },
      { date: "Feb 11", topic: "Grammar & Style", status: "present" },
      { date: "Feb 18", topic: "Proposals", status: "present" },
      { date: "Feb 25", topic: "Manuals & SOPs", status: "present" },
      { date: "Mar 4",  topic: "Research Papers", status: "absent" },
      { date: "Mar 11", topic: "Presentation Skills", status: "present" },
      { date: "Mar 18", topic: "Email Etiquette", status: "present" },
      { date: "Mar 25", topic: "CV & Cover Letters", status: "present" },
      { date: "Apr 1",  topic: "Editing & Proofreading", status: "present" },
      { date: "Apr 8",  topic: "Peer Review Workshop", status: "present" },
      { date: "Apr 15", topic: "Technical Descriptions", status: "present" },
      { date: "Apr 22", topic: "Final Paper Workshop", status: "present" },
      { date: "Jan 16", topic: "Clarity & Conciseness", status: "present" },
      { date: "Jan 23", topic: "Paragraph Structure", status: "present" },
      { date: "Jan 30", topic: "Memo Writing", status: "present" },
      { date: "Feb 6",  topic: "Visuals in Writing", status: "absent" },
      { date: "Feb 13", topic: "Case Analysis", status: "present" },
      { date: "Feb 20", topic: "Academic Citations", status: "present" },
      { date: "Feb 27", topic: "Lab Reports", status: "present" },
      { date: "Mar 6",  topic: "Abstracts & Summaries", status: "present" },
      { date: "Mar 13", topic: "Revision Techniques", status: "present" },
      { date: "Mar 20", topic: "Industry Writing", status: "present" },
      { date: "Apr 29", topic: "Final Review", status: "present" },
    ],
  },
];

// ── HELPERS ────────────────────────────────────────────────────────────────────
const getPct = (c) => Math.round((c.attended / c.total) * 100);
const isRisk = (c) => getPct(c) < 75;

export default function StudentAttendance() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const webglRef       = useRef(null);
  const introCanvasRef = useRef(null);
  const introRef       = useRef(null);
  const appRef         = useRef(null);
  const sidebarRef     = useRef(null);

  const [collapse,     setCollapse]     = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(attendanceData[0]);

  // ── INTRO ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const hasPlayed = sessionStorage.getItem("archIntroPlayed");
    if (hasPlayed) {
      introRef.current.style.display = "none";
      appRef.current.style.opacity   = 1;
      sidebarRef.current.style.transform = "translateX(0)";
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

  // ── THREE.JS BACKGROUND ────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = webglRef.current;
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

  // ── SIDEBAR DATA ───────────────────────────────────────────────────────────
  const sidebarSections = [
    ["Overview",      [["⊞","Dashboard","/student/dashboard"],["◎","Academic","/student/academic"]]],
    ["Courses",       [["＋","Registration","/student/registration"],["◈","Transcript","/student/transcript"],["▦","Marks","/student/marks"],["✓","Attendance","/student/attendance"],["▤","Timetable","/student/timetable"]]],
    ["Communication", [["◉","Notices","/student/notices"]]],
    ["Account",       [["◌","Profile","/student/profile"]]],
  ];

  const pct    = getPct(selectedCourse);
  const atRisk = isRisk(selectedCourse);

  return (
    <>
      <canvas id="att-webgl" ref={webglRef} />

      {/* Intro */}
      <div id="att-intro" ref={introRef}>
        <canvas id="att-intro-canvas" ref={introCanvasRef} />
        <div id="att-intro-line"  />
        <div id="att-intro-logo">ARCH</div>
        <div id="att-intro-sub">Attendance Tracker</div>
        <div id="att-intro-flash" />
      </div>

      <div id="app" ref={appRef}>

        {/* ── SIDEBAR ── */}
        <nav id="sidebar" ref={sidebarRef} className={collapse ? "collapse" : ""}>
          <div className="sb-top-bar" />
          <button className="sb-toggle" onClick={() => setCollapse(c => !c)}>
            <span/><span/><span/>
          </button>
          <div className="sb-logo">
            <div className="logo-box">A</div>
            <div><div className="logo-name">ARCH</div><div className="logo-tagline">Student Portal</div></div>
          </div>
          <div className="sb-user">
            <div className="uav">AB</div>
            <div><div className="uname">Areeb Bucha</div><div className="uid">21K-3210</div></div>
          </div>
          {sidebarSections.map(([sec, items]) => (
            <div key={sec}>
              <div className="nav-sec">{sec}</div>
              {items.map(([ic, label, path]) => (
                <div
                  key={label}
                  className={`ni${location.pathname === path ? " active" : ""}`}
                  onClick={() => navigate(path)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="ni-ic">{ic}</div>{label}
                </div>
              ))}
            </div>
          ))}
        </nav>

        {/* ── MAIN ── */}
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
                  <div className="ct"><div className="ctbar"/>Courses</div>
                  <div className="att-summary-chip">
                    {attendanceData.filter(c => !isRisk(c)).length}/{attendanceData.length} on track
                  </div>
                </div>

                <div className="att-course-items">
                  {attendanceData.map((course) => {
                    const cp    = getPct(course);
                    const risk  = isRisk(course);
                    const isSel = selectedCourse.id === course.id;
                    return (
                      <div
                        key={course.id}
                        className={`att-course-row${isSel ? " selected" : ""}${risk ? " risk" : ""}`}
                        onClick={() => setSelectedCourse(course)}
                      >
                        <div className="att-course-row-top">
                          <div className="att-course-info">
                            <div className="att-course-name">{course.course}</div>
                            <div className="att-course-meta">{course.code} · {course.credits} Cr</div>
                          </div>
                          <div className={`att-pct-badge${risk ? " red" : " green"}`}>{cp}%</div>
                        </div>
                        <div className="att-mini-bar-track">
                          <div
                            className={`att-mini-bar-fill${risk ? " red" : " green"}`}
                            style={{ width: `${cp}%` }}
                          />
                          {/* 75% threshold line */}
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
              <div className="att-detail-col">

                {/* Header card */}
                <div className="glass-card att-detail-header" style={{ opacity: 1, transform: "none" }}>
                  <div className="att-dh-top">
                    <div>
                      <div className="att-dh-title">{selectedCourse.course}</div>
                      <div className="att-dh-meta">{selectedCourse.code} · {selectedCourse.credits} Credit Hours · Spring 2025</div>
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
                      <span className="lbl-dim">{selectedCourse.attended}/{selectedCourse.total} classes</span>
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
                    <div className="ct"><div className="ctbar"/>Class Log</div>
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
                      {selectedCourse.classes.map((cls, i) => (
                        <div key={i} className={`att-log-row${cls.status === "absent" ? " absent" : ""}`}>
                          <div className={`att-log-dot${cls.status === "absent" ? " red" : " green"}`} />
                          <div className="att-log-date">{cls.date}</div>
                          <div className="att-log-topic">{cls.topic}</div>
                          <div className={`att-log-status${cls.status === "absent" ? " red" : " green"}`}>
                            {cls.status === "present" ? "Present" : "Absent"}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}