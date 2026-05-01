import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { gsap } from "gsap";
import "./StudentNotices.css";

// ── CURRENT WEEK (1-indexed, 0 = semester not started) ───────────────────────
const CURRENT_WEEK = 7;

// ── TODAY for deadline calculations (set to the "portal's" reference date) ────
// Spring 2025 semester — we simulate today as Mar 4, 2025 (start of W7)
const TODAY = new Date("2025-03-04");

// ── DEADLINE STATUS ───────────────────────────────────────────────────────────
function getDeadlineStatus(isoDate) {
  if (!isoDate) return null;
  const d = new Date(isoDate);
  if (isNaN(d)) return null;
  const diffMs   = d - TODAY;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0)  return "done";
  if (diffDays <= 3) return "urgent";
  return "upcoming";
}

// ── WEEK DATA ─────────────────────────────────────────────────────────────────
const WEEK_DATA = {
  1:  { notices: [] },
  2:  { notices: [
    { type: "quiz",       course: "DSA",   title: "Quiz 1",           detail: "Covers arrays, linked lists, and Big-O notation. Closed book, 20 mins.", date: "Mon, Jan 20", isoDate: "2025-01-20" },
  ]},
  3:  { notices: [] },
  4:  { notices: [
    { type: "assignment", course: "OOAD",  title: "Assignment 1 Due", detail: "UML class diagram for a library management system. Submit on LMS before 11:59 PM.", date: "Wed, Feb 5", isoDate: "2025-02-05" },
    { type: "quiz",       course: "DB",    title: "Quiz 1",           detail: "ER diagrams, relational model, and normalization up to 3NF.", date: "Fri, Feb 7", isoDate: "2025-02-07" },
  ]},
  5:  { exam: "Mid 1", notices: [
    { type: "exam",       course: "DSA",   title: "Mid 1 — DSA",      detail: "Chapters 1–5: Arrays, LL, Stacks, Queues, Trees. 2-hour paper. Hall C.", date: "Mon, Feb 10", isoDate: "2025-02-10" },
    { type: "exam",       course: "OOAD",  title: "Mid 1 — OOAD",     detail: "UML, use-cases, design patterns (Singleton, Factory). 1.5 hours.", date: "Wed, Feb 12", isoDate: "2025-02-12" },
    { type: "exam",       course: "DB",    title: "Mid 1 — Database",  detail: "ER to relational mapping, SQL queries, normalization. Open notes.", date: "Thu, Feb 13", isoDate: "2025-02-13" },
  ]},
  6:  { notices: [] },
  7:  { notices: [
    { type: "quiz",       course: "DSA",   title: "Quiz 2",           detail: "Binary search trees, AVL trees, and graph traversal. 15 mins, in-lab.", date: "Tue, Mar 4", isoDate: "2025-03-04" },
    { type: "assignment", course: "OOAD",  title: "Assignment 2 Due", detail: "Sequence and activity diagrams for an e-commerce platform. Groups of 3.", date: "Thu, Mar 6", isoDate: "2025-03-06" },
  ]},
  8:  { notices: [
    { type: "assignment", course: "DB",    title: "Assignment 2 Due", detail: "Full SQL schema + 15 queries for a hospital database. ER diagram required.", date: "Wed, Mar 12", isoDate: "2025-03-12" },
  ]},
  9:  { notices: [
    { type: "quiz",       course: "Calc",  title: "Quiz 3",           detail: "Integration by parts, partial fractions, and improper integrals.", date: "Mon, Mar 17", isoDate: "2025-03-17" },
    { type: "quiz",       course: "OOAD",  title: "Quiz 2",           detail: "Design patterns: Observer, Decorator, Strategy. MCQs + short answers.", date: "Fri, Mar 21", isoDate: "2025-03-21" },
  ]},
  10: { exam: "Mid 2", notices: [
    { type: "exam",       course: "DSA",   title: "Mid 2 — DSA",      detail: "Graphs, shortest paths (Dijkstra), hashing, heaps. 2 hours. Hall A.", date: "Tue, Mar 25", isoDate: "2025-03-25" },
    { type: "exam",       course: "OOAD",  title: "Mid 2 — OOAD",     detail: "Full design cycle, SOLID principles, refactoring. 1.5 hours.", date: "Thu, Mar 27", isoDate: "2025-03-27" },
    { type: "exam",       course: "DB",    title: "Mid 2 — Database",  detail: "Transactions, concurrency, indexing, query optimisation.", date: "Fri, Mar 28", isoDate: "2025-03-28" },
  ]},
  11: { notices: [] },
  12: { notices: [
    { type: "assignment", course: "DSA",   title: "Assignment 3 Due", detail: "Implement a graph library with BFS, DFS, Dijkstra, and Kruskal. C++.", date: "Mon, Apr 7", isoDate: "2025-04-07" },
    { type: "quiz",       course: "DB",    title: "Quiz 2",           detail: "Stored procedures, triggers, and views in SQL Server.", date: "Wed, Apr 9", isoDate: "2025-04-09" },
  ]},
  13: { notices: [
    { type: "quiz",       course: "DSA",   title: "Quiz 3",           detail: "Dynamic programming: knapsack, LCS, matrix chain multiplication.", date: "Tue, Apr 15", isoDate: "2025-04-15" },
  ]},
  14: { notices: [
    { type: "assignment", course: "OOAD",  title: "Final Project Due", detail: "Full OO design + implementation of a student portal module. Demo required.", date: "Thu, Apr 24", isoDate: "2025-04-24" },
    { type: "assignment", course: "DB",    title: "Final Project Due", detail: "End-to-end database application with front-end. Viva on submission day.", date: "Fri, Apr 25", isoDate: "2025-04-25" },
  ]},
  15: { notices: [
    { type: "quiz",       course: "Calc",  title: "Quiz 4",           detail: "Series, sequences, and Taylor/Maclaurin expansions. Last graded activity.", date: "Mon, Apr 28", isoDate: "2025-04-28" },
  ]},
  16: { exam: "Finals", notices: [
    { type: "exam",       course: "DSA",   title: "Final — DSA",      detail: "Comprehensive. All topics. 3-hour paper. Grand Hall.", date: "Mon, May 5", isoDate: "2025-05-05" },
    { type: "exam",       course: "OOAD",  title: "Final — OOAD",     detail: "Full semester content + project evaluation. 2.5 hours.", date: "Wed, May 7", isoDate: "2025-05-07" },
    { type: "exam",       course: "DB",    title: "Final — Database",  detail: "All topics including NoSQL overview. 2.5 hours. Open notes.", date: "Thu, May 8", isoDate: "2025-05-08" },
    { type: "exam",       course: "Calc",  title: "Final — Calculus",  detail: "Comprehensive calculus exam. Calculators allowed. 2 hours.", date: "Fri, May 9", isoDate: "2025-05-09" },
    { type: "exam",       course: "PF",    title: "Final — Prog Fund", detail: "Python fundamentals, OOP, file I/O. Practical component included.", date: "Sat, May 10", isoDate: "2025-05-10" },
  ]},
};

const TYPE_META = {
  quiz:       { icon: "✏️", label: "Quiz",       color: "#40a9ff", bg: "rgba(64,169,255,.12)",  border: "rgba(64,169,255,.3)"  },
  assignment: { icon: "📋", label: "Assignment", color: "#ff9800", bg: "rgba(255,152,0,.10)",   border: "rgba(255,152,0,.3)"   },
  exam:       { icon: "📝", label: "Exam",       color: "#ff4d6a", bg: "rgba(255,77,106,.10)",  border: "rgba(255,77,106,.3)"  },
  announcement: { icon: "📣", label: "Announcement", color: "#7c4dff", bg: "rgba(124,77,255,.10)", border: "rgba(124,77,255,.3)" },
};

// ── INITIAL PINNED ANNOUNCEMENTS ──────────────────────────────────────────────
const INITIAL_PINNED = [
  {
    id: "pin-1",
    type: "announcement",
    title: "Mid-Term 2 Hall Allocation Published",
    detail: "Hall assignments for Mid 2 exams (Week 10) are now available on the LMS portal under 'Exam Schedule'. Students must carry their ID cards.",
    date: "Mar 18, 2025",
    from: "Exam Office",
  },
  {
    id: "pin-2",
    type: "announcement",
    title: "LMS Maintenance — Saturday 2–4 AM",
    detail: "The LMS portal will be unavailable for scheduled maintenance. Plan submissions accordingly. No deadline extensions will be granted for this window.",
    date: "Mar 16, 2025",
    from: "IT Department",
  },
  {
    id: "pin-3",
    type: "exam",
    title: "Reminder: OOAD Assignment 2 — Groups of 3 Only",
    detail: "Individual submissions will not be accepted. Ensure your group is registered on LMS before submitting sequence and activity diagrams.",
    date: "Mar 14, 2025",
    from: "Dr. Hamza Raheel",
  },
];

// ── DEADLINE STATUS BADGE CONFIG ─────────────────────────────────────────────
const STATUS_META = {
  done:     { label: "Done",       color: "#16a34a", bg: "rgba(22,163,74,.1)",   border: "rgba(22,163,74,.25)",  icon: "✓" },
  urgent:   { label: "Due Soon",   color: "#dc2626", bg: "rgba(220,38,38,.1)",   border: "rgba(220,38,38,.25)",  icon: "⚠" },
  upcoming: { label: null,         color: null,      bg: null,                   border: null,                   icon: null },
};

// ── NOTICE ROW ────────────────────────────────────────────────────────────────
const NoticeRow = ({ n, pinned, onPin, onUnpin }) => {
  const meta   = TYPE_META[n.type] || TYPE_META.announcement;
  const status = getDeadlineStatus(n.isoDate);
  const sm     = STATUS_META[status] || null;

  const rowMod = status === "done"   ? " notice-row--done"
               : status === "urgent" ? " notice-row--urgent"
               : "";

  const barColor = status === "done"   ? "#16a34a"
                 : status === "urgent" ? "#dc2626"
                 : meta.color;

  return (
    <div className={`notice-row${rowMod}`}>
      <div className="notice-row-bar" style={{ background: barColor }} />
      <div className="notice-row-body">

        <div className="notice-row-top">
          <span className="notice-tag" style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}>
            {meta.icon} {meta.label}
          </span>
          <span className="notice-course-chip">{n.course || n.from}</span>

          {sm && sm.label && (
            <span className="deadline-badge" style={{ color: sm.color, background: sm.bg, borderColor: sm.border }}>
              {sm.icon} {sm.label}
            </span>
          )}

          <span className="notice-date-chip">{n.date}</span>

          <button
            className={`pin-btn${pinned ? " pin-btn--active" : ""}`}
            onClick={(e) => { e.stopPropagation(); pinned ? onUnpin(n) : onPin(n); }}
            title={pinned ? "Unpin this notice" : "Pin to board"}
            aria-label={pinned ? "Unpin" : "Pin"}
          >
            <span className="pin-btn-icon">📌</span>
            <span className="pin-btn-label">{pinned ? "Pinned" : "Pin"}</span>
          </button>
        </div>

        <div className={`notice-title${status === "done" ? " notice-title--done" : ""}`}>
          {n.title}
        </div>
        <div className="notice-detail">{n.detail}</div>
      </div>
    </div>
  );
};

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────────
export default function StudentNotices() {
  const navigate       = useNavigate();
  const location       = useLocation();
  const webglRef       = useRef(null);
  const introCanvasRef = useRef(null);
  const introRef       = useRef(null);
  const appRef         = useRef(null);
  const sidebarRef     = useRef(null);
  const panelRef       = useRef(null);
  const scrollRef      = useRef(null);

  const [collapse,      setCollapse]      = useState(false);
  const [selectedWeek,  setSelectedWeek]  = useState(null);
  const [pinnedItems,   setPinnedItems]   = useState(INITIAL_PINNED);
  const [dismissedPins, setDismissedPins] = useState(new Set());

  const visiblePinned = pinnedItems.filter(p => !dismissedPins.has(p.id));

  const pinNotice = (notice) => {
    const id = notice.id || `pin-${Date.now()}`;
    const item = { ...notice, id };
    setPinnedItems(prev => [item, ...prev.filter(p => p.id !== id)]);
    setDismissedPins(prev => { const s = new Set(prev); s.delete(id); return s; });
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const unpinItem = (item) => {
    setPinnedItems(prev => prev.filter(p => p.id !== item.id));
  };

  const dismissPin = (id) => {
    setDismissedPins(prev => new Set([...prev, id]));
  };

  const isPinned = (notice) => pinnedItems.some(p => p.id === notice.id || p.title === notice.title);

  const makeNoticeId = (week, idx) => `w${week}-n${idx}`;

  const handleWeekClick = (w) => {
    setSelectedWeek(prev => prev === w ? null : w);
  };

  useEffect(() => {
    if (panelRef.current) {
      gsap.fromTo(panelRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.32, ease: "power3.out" }
      );
    }
  }, [selectedWeek]);

  // ── CINEMATIC INTRO & FOCUS TRANSITION ──
  useEffect(() => {
    const hasPlayed = sessionStorage.getItem("archIntroPlayed");
    if (hasPlayed) {
      introRef.current.style.display = "none";
      appRef.current.style.opacity = 1;
      sidebarRef.current.style.transform = "translateX(0)";
      
      // INSTANTLY KILL 3D BACKGROUND FOR FOCUS MODE
      if (webglRef.current) {
        webglRef.current.style.opacity = 0;
        webglRef.current.style.display = "none";
      }
      return;
    }
    const canvas = introCanvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const words = [
      "KNOWLEDGE","GRADES","CAMPUS","LECTURE","SEMESTER",
      "THESIS","RESEARCH","LIBRARY","STUDENT","FACULTY",
      "EXAM","DEGREE","ALUMNI","SCIENCE","ENGINEERING",
      "FAST","NUCES","PORTAL","NOTICES","SCHEDULE",
    ];
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      word: words[Math.floor(Math.random() * words.length)],
      opacity: Math.random() * 0.4 + 0.05,
      speed: Math.random() * 0.8 + 0.2,
      size: Math.floor(Math.random() * 10) + 10,
      flicker: Math.random() * 0.025 + 0.005,
      hue: Math.random() > 0.6 ? "255,255,255" : Math.random() > 0.5 ? "100,180,255" : "60,140,255",
    }));
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5,
      opacity: Math.random() * 0.6 + 0.1,
      twinkle: Math.random() * 0.02,
    }));

    let animId;
    const draw = () => {
      ctx.fillStyle = "rgba(0,4,14,0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        s.opacity += s.twinkle * (Math.random() > 0.5 ? 1 : -1);
        s.opacity = Math.max(0.05, Math.min(0.8, s.opacity));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,210,255,${s.opacity})`;
        ctx.fill();
      });
      particles.forEach(p => {
        p.y -= p.speed * 0.4;
        p.opacity += p.flicker * (Math.random() > 0.5 ? 1 : -1);
        p.opacity = Math.max(0.03, Math.min(0.55, p.opacity));
        if (p.y < -30) {
          p.y = canvas.height + 20;
          p.x = Math.random() * canvas.width;
          p.word = words[Math.floor(Math.random() * words.length)];
        }
        ctx.font = `${p.size}px 'Inter', sans-serif`;
        ctx.fillStyle = `rgba(${p.hue},${p.opacity})`;
        ctx.fillText(p.word, p.x, p.y);
      });
      animId = requestAnimationFrame(draw);
    };
    ctx.fillStyle = "#00040e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    draw();

    const afterIntro = () => {
      cancelAnimationFrame(animId);
      sessionStorage.setItem("archIntroPlayed", "true");
      gsap.set(introRef.current, { display: "none" });
      gsap.to(appRef.current, { opacity: 1, duration: 0.6 });
      gsap.to(sidebarRef.current, { x: 0, duration: 1.2, ease: "expo.out", delay: 0.05 });
      
      gsap.to(webglRef.current, { opacity: 0, duration: 2.5, ease: "power2.inOut", delay: 0.5 });
      setTimeout(() => {
        if (webglRef.current) webglRef.current.style.display = "none";
      }, 3000);
    };

    const tl = gsap.timeline({ delay: 0.4, onComplete: afterIntro });
    tl.to("#ntc-intro-line",  { scaleX: 1, duration: 0.8, ease: "power3.out" }, 0)
      .to("#ntc-intro-logo",  { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }, 0.5)
      .to("#ntc-intro-sub",   { opacity: 1, y: 0, duration: 0.5 }, 1.1)
      .to("#ntc-intro-logo",  { scale: 50, opacity: 0, duration: 0.7, ease: "power4.in" }, 2.4)
      .to("#ntc-intro-sub",   { opacity: 0, duration: 0.3 }, 2.4)
      .to("#ntc-intro-line",  { opacity: 0, duration: 0.3 }, 2.4)
      .to("#ntc-intro-flash", { opacity: 1, duration: 0.08 }, 2.85)
      .to("#ntc-intro-flash", { opacity: 0, duration: 0.4 }, 2.93)
      .to(introRef.current,   { opacity: 0, duration: 0.35 }, 2.88);

    return () => cancelAnimationFrame(animId);
  }, []);

  // ── THREE.JS BG (Only runs during intro) ──
  useEffect(() => {
    if (sessionStorage.getItem("archIntroPlayed")) return;

    const canvas = webglRef.current;
    let W = window.innerWidth, H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xf0f5ff, 1);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xdeeaff, 0.018);

    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
    camera.position.set(0, 3, 12);

    scene.add(new THREE.AmbientLight(0x1144cc, 0.6));
    const sun = new THREE.DirectionalLight(0x6699ff, 1.4);
    sun.position.set(-6, 12, 8);
    scene.add(sun);
    const rimLight = new THREE.PointLight(0x0055ff, 3, 40);
    rimLight.position.set(0, 6, 0);
    scene.add(rimLight);
    const fillLight = new THREE.PointLight(0x88ccff, 1.5, 25);
    fillLight.position.set(-8, -2, 5);
    scene.add(fillLight);

    const objects = [];

    const mkIco = (x, y, z, r, color, opacity = 0.22) => {
      const mesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(r, 1),
        new THREE.MeshPhongMaterial({ color, wireframe: true, transparent: true, opacity, shininess: 120 })
      );
      mesh.position.set(x, y, z);
      scene.add(mesh);
      objects.push({ mesh, bobSpeed: Math.random()*0.008+0.004, bobPhase: Math.random()*Math.PI*2, driftX: (Math.random()-0.5)*0.006, driftZ: (Math.random()-0.5)*0.005, rotX: (Math.random()-0.5)*0.018, rotY: (Math.random()-0.5)*0.022, rotZ: (Math.random()-0.5)*0.014 });
    };
    mkIco(-7,  2, -6, 2.2, 0x1a78ff, 0.20);
    mkIco( 7, -1, -7, 2.8, 0x0055dd, 0.16);
    mkIco(-2,  4, -9, 3.4, 0x2266ee, 0.13);
    mkIco( 4,  3, -4, 1.6, 0x4499ff, 0.24);
    mkIco(-5, -3, -5, 1.8, 0x0044bb, 0.18);

    const mkKnot = (x, y, z, r, tube, p, q, color) => {
      const mesh = new THREE.Mesh(
        new THREE.TorusKnotGeometry(r, tube, 80, 12, p, q),
        new THREE.MeshPhongMaterial({ color, wireframe: true, transparent: true, opacity: 0.14, shininess: 200 })
      );
      mesh.position.set(x, y, z);
      scene.add(mesh);
      objects.push({ mesh, bobSpeed: Math.random()*0.007+0.004, bobPhase: Math.random()*Math.PI*2, driftX: (Math.random()-0.5)*0.007, driftZ: (Math.random()-0.5)*0.006, rotX: 0.012, rotY: 0.016, rotZ: 0.008 });
    };
    mkKnot( 6,  1, -8, 1.4, 0.28, 2, 3, 0x3388ff);
    mkKnot(-4, -2, -7, 1.0, 0.22, 3, 4, 0x1155cc);

    const mkDiamond = (x, y, z, scale, color) => {
      const mesh = new THREE.Mesh(
        new THREE.OctahedronGeometry(scale, 0),
        new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.12, shininess: 60, side: THREE.DoubleSide })
      );
      mesh.scale.set(1, 1.6, 0.3);
      mesh.position.set(x, y, z);
      scene.add(mesh);
      objects.push({ mesh, bobSpeed: Math.random()*0.009+0.005, bobPhase: Math.random()*Math.PI*2, driftX: (Math.random()-0.5)*0.008, driftZ: (Math.random()-0.5)*0.006, rotX: (Math.random()-0.5)*0.010, rotY: (Math.random()-0.5)*0.022, rotZ: 0.009 });
    };
    mkDiamond(-8,  0, -3, 1.8, 0x55aaff);
    mkDiamond( 5,  5, -6, 2.2, 0x2277ee);
    mkDiamond( 2, -3, -4, 1.4, 0x88bbff);
    mkDiamond(-3,  6, -8, 2.6, 0x0066cc);

    const mkRing = (x, y, z, r, color) => {
      const mesh = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.04, 6, 60),
        new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.28, shininess: 180 })
      );
      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;
      mesh.position.set(x, y, z);
      scene.add(mesh);
      objects.push({ mesh, bobSpeed: 0.007, bobPhase: Math.random()*Math.PI*2, driftX: (Math.random()-0.5)*0.007, driftZ: (Math.random()-0.5)*0.005, rotX: (Math.random()-0.5)*0.016, rotY: (Math.random()-0.5)*0.018, rotZ: (Math.random()-0.5)*0.010 });
    };
    mkRing(-6,  4, -7, 2.0, 0x4499ff);
    mkRing( 3, -1, -5, 1.5, 0x1166dd);
    mkRing( 8,  3, -9, 2.4, 0x0044aa);

    const COUNT = 240;
    const ptPos = new Float32Array(COUNT * 3);
    const ptCol = new Float32Array(COUNT * 3);
    const ptVel = [];
    for (let i = 0; i < COUNT; i++) {
      ptPos[i*3]   = (Math.random()-0.5)*34;
      ptPos[i*3+1] = (Math.random()-0.5)*22;
      ptPos[i*3+2] = (Math.random()-0.5)*18 - 6;
      ptVel.push({ x: (Math.random()-0.5)*0.010, y: (Math.random()-0.5)*0.008 });
      const pick = Math.random();
      if (pick < 0.4) {
        ptCol[i*3] = 0.1; ptCol[i*3+1] = 0.4; ptCol[i*3+2] = 1.0; 
      } else if (pick < 0.7) {
        ptCol[i*3] = 0.4; ptCol[i*3+1] = 0.8; ptCol[i*3+2] = 1.0; 
      } else {
        ptCol[i*3] = 0.9; ptCol[i*3+1] = 0.95; ptCol[i*3+2] = 1.0; 
      }
    }
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute("position", new THREE.BufferAttribute(ptPos, 3));
    ptGeo.setAttribute("color",    new THREE.BufferAttribute(ptCol, 3));
    scene.add(new THREE.Points(ptGeo, new THREE.PointsMaterial({ size: 0.055, transparent: true, opacity: 0.65, vertexColors: true })));

    const mkAngleGrid = (rotX, y, opacity, color) => {
      const g = new THREE.GridHelper(70, 28, color, color);
      g.position.y = y;
      g.rotation.x = rotX;
      g.material.transparent = true;
      g.material.opacity = opacity;
      scene.add(g);
      return g;
    };
    const floor1 = mkAngleGrid(0,        -5.5, 0.30, 0x002288);
    const floor2 = mkAngleGrid(Math.PI/2, -5.5, 0.10, 0x003399); 

    const lineMat = new THREE.LineBasicMaterial({ color: 0x1144cc, transparent: true, opacity: 0.08 });
    for (let i = -5; i <= 5; i++) {
      const pts = [
        new THREE.Vector3(i * 2.5, -5.5, 10),
        new THREE.Vector3(i * 0.3, 2, -30),
      ];
      const lg = new THREE.BufferGeometry().setFromPoints(pts);
      scene.add(new THREE.Line(lg, lineMat));
    }

    let nmx = 0, nmy = 0;
    const onMove = (e) => { nmx = (e.clientX/W)*2-1; nmy = -(e.clientY/H)*2+1; };
    document.addEventListener("mousemove", onMove);

    let t = 0, animId;
    const loop = () => {
      animId = requestAnimationFrame(loop);
      t += 0.012;
      objects.forEach(o => {
        o.mesh.position.y += Math.sin(t * o.bobSpeed * 10 + o.bobPhase) * 0.012;
        if (o.driftX) o.mesh.position.x += Math.sin(t * o.bobSpeed * 7  + o.bobPhase * 1.3) * 0.006;
        if (o.driftZ) o.mesh.position.z += Math.cos(t * o.bobSpeed * 5  + o.bobPhase * 0.7) * 0.005;
        o.mesh.rotation.x += o.rotX;
        o.mesh.rotation.y += o.rotY;
        if (o.rotZ) o.mesh.rotation.z += o.rotZ;
      });
      const p = ptGeo.attributes.position.array;
      for (let i = 0; i < COUNT; i++) {
        p[i*3]   += ptVel[i].x + nmx * 0.0018;
        p[i*3+1] += ptVel[i].y + nmy * 0.0018;
        if (p[i*3]   >  17) p[i*3]   = -17;
        if (p[i*3]   < -17) p[i*3]   =  17;
        if (p[i*3+1] >  11) p[i*3+1] = -11;
        if (p[i*3+1] < -11) p[i*3+1] =  11;
      }
      ptGeo.attributes.position.needsUpdate = true;
      rimLight.position.x  = Math.sin(t * 0.5) * 12;
      rimLight.position.z  = Math.cos(t * 0.35) * 9;
      fillLight.position.x = Math.cos(t * 0.4) * 10;
      fillLight.position.y = Math.sin(t * 0.28) * 5;
      floor1.position.z    = ((t * 0.8) % 2.5) - 1.25;
      camera.position.x   += (nmx * 1.2 - camera.position.x) * 0.018;
      camera.position.y   += (nmy * 0.8 + 3 - camera.position.y) * 0.018;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    loop();

    const onResize = () => {
      W = window.innerWidth; H = window.innerHeight;
      renderer.setSize(W, H);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <>
      {/* ── NEW APPLE/STRIPE FLUID MESH BACKGROUND ── */}
      <div className="mesh-bg">
        <div className="mesh-blob blob-1" />
        <div className="mesh-blob blob-2" />
        <div className="mesh-blob blob-3" />
      </div>

      <canvas id="ntc-webgl" ref={webglRef} />

      {/* INTRO */}
      <div id="ntc-intro" ref={introRef}>
        <canvas id="ntc-intro-canvas" ref={introCanvasRef} />
        <div id="ntc-intro-line" />
        <div id="ntc-intro-logo">ARCH</div>
        <div id="ntc-intro-sub">Student Portal</div>
        <div id="ntc-intro-flash" />
      </div>

      {/* APP */}
      <div id="ntc-app" ref={appRef}>
        <nav id="ntc-sidebar" ref={sidebarRef} className={collapse ? "collapse" : ""}>
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
                  className={`ni${location.pathname === path ? " active" : ""}`}
                  key={label}
                  onClick={() => navigate(path)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="ni-ic">{ic}</div>{label}
                  {label === "Notices" && <span className="nbadge">3</span>}
                </div>
              ))}
            </div>
          ))}
          <div className="sb-foot">Spring 2025 · FAST-NUCES</div>
        </nav>

        <div id="ntc-main">
          <div id="ntc-topbar">
            <div className="pg-title"><span>Notices</span></div>
            <div className="tb-r">
              <div className="sem-chip">Spring 2025</div>
            </div>
          </div>

          <div id="ntc-scroll" ref={scrollRef}>

            {/* ── SEMESTER TIMELINE CARD ── */}
            <div className="ntc-card tl-outer-card">
              <div className="tl-card-header">
                <div className="tl-card-header-left">
                  <div className="tl-card-title">
                    <div className="tl-ctbar" />
                    Spring 2025 — Semester Timeline
                  </div>
                  <div className="tl-card-sub">16 weeks · Select a week to see notices</div>
                </div>
                <div className="tl-legend">
                  <div className="tl-leg-item"><div className="tl-leg-swatch tl-leg-past" />Past</div>
                  <div className="tl-leg-item"><div className="tl-leg-swatch tl-leg-now" />Now</div>
                  <div className="tl-leg-item"><div className="tl-leg-swatch tl-leg-future" />Upcoming</div>
                  <div className="tl-leg-item"><div className="tl-leg-swatch tl-leg-notice" />Has Notices</div>
                  <div className="tl-leg-item"><span className="tl-leg-flame">🔥</span>Exam Week</div>
                </div>
              </div>

              <div className="tl-bar-wrap">
                <div className="tl-bar">
                  {Array.from({ length: 16 }, (_, i) => {
                    const w          = i + 1;
                    const past       = w < CURRENT_WEEK;
                    const isCurrent  = w === CURRENT_WEEK;
                    const data       = WEEK_DATA[w] || { notices: [] };
                    const isFire     = w === 5 || w === 10 || w === 16;
                    const hasNotices = data.notices.length > 0;
                    const isSelected = selectedWeek === w;
                    const fireLabels = { 5: "Mid 1", 10: "Mid 2", 16: "Finals" };

                    let state = "future";
                    if (past && hasNotices) state = "past-notice";
                    else if (past)          state = "past";
                    if (isCurrent)          state = "current";
                    if (isFire && !past)    state = "fire";
                    if (hasNotices && !past && !isFire && !isCurrent) state = "notice";

                    return (
                      <div
                        key={w}
                        className={`tl-seg tl-seg--${state}${isSelected ? " tl-seg--selected" : ""}`}
                        onClick={() => handleWeekClick(w)}
                      >
                        {isFire && (
                          <div className={`tl-fire${past ? " tl-fire--dim" : ""}`}>
                            {/* ── HYPER-REALISTIC LAYERED FLAME INJECTED HERE ── */}
                            <div className="tl-flame tl-flame--base" />
                            <div className="tl-flame tl-flame--mid" />
                            <div className="tl-flame tl-flame--core" />
                            <div className="tl-spark" />
                            <div className="tl-spark tl-spark--2" />
                          </div>
                        )}
                        {isCurrent && <div className="tl-pulse" />}
                        <div className="tl-seg-inner">
                          <div className="tl-seg-wnum">W{w}</div>
                          {isFire && <div className="tl-seg-exam">{fireLabels[w]}</div>}
                          {hasNotices && !isFire && <div className="tl-seg-pip">{data.notices.length}</div>}
                        </div>
                        {isSelected && <div className="tl-seg-notch" />}
                      </div>
                    );
                  })}
                </div>
                <div className="tl-progress-track">
                  <div className="tl-progress-fill" style={{ width: `${((CURRENT_WEEK - 1) / 16) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* ── LOWER SLOT: week detail OR pinned board ── */}
            {selectedWeek !== null ? (() => {
              const data      = WEEK_DATA[selectedWeek] || { notices: [] };
              const past      = selectedWeek < CURRENT_WEEK;
              const isCurrent = selectedWeek === CURRENT_WEEK;
              const isFire    = selectedWeek === 5 || selectedWeek === 10 || selectedWeek === 16;
              const fireLabels = { 5: "Mid 1", 10: "Mid 2", 16: "Finals" };
              const empty     = data.notices.length === 0;
              const statusLabel = isCurrent ? "Current Week" : past ? "Completed" : "Upcoming";
              const statusMod   = isCurrent ? "status--now" : past ? "status--past" : "status--future";

              return (
                <div className="ntc-card detail-card" ref={panelRef}>
                  <div className="detail-hd">
                    <div className="detail-hd-left">
                      <div className={`detail-week-pill${isFire ? " pill--fire" : past ? " pill--past" : isCurrent ? " pill--now" : ""}`}>
                        Week {selectedWeek}
                        {isFire && <span className="pill-exam-name">{fireLabels[selectedWeek]}</span>}
                      </div>
                      <div className={`detail-status ${statusMod}`}>{statusLabel}</div>
                    </div>
                    {/* ✕ closes detail and returns to pinned board */}
                    <button className="detail-close-btn" onClick={() => setSelectedWeek(null)}>✕</button>
                  </div>

                  <div className="detail-divider" />

                  {empty ? (
                    <div className="detail-empty">
                      <div className="detail-empty-glyph">—</div>
                      <div className="detail-empty-title">No notices this week</div>
                      <div className="detail-empty-hint">Nothing scheduled · check back later</div>
                    </div>
                  ) : (
                    <div className="detail-list">
                      {data.notices.map((n, idx) => {
                        const nWithId = { ...n, id: makeNoticeId(selectedWeek, idx) };
                        return (
                          <NoticeRow
                            key={idx}
                            n={nWithId}
                            pinned={isPinned(nWithId)}
                            onPin={pinNotice}
                            onUnpin={unpinItem}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })() : (
              /* ── PINNED BOARD — shown on load and after closing detail ── */
              <div className="ntc-card pinned-card-outer" ref={panelRef}>
                <div className="pinned-section-hd">
                  <div className="pinned-section-title">
                    <span className="pinned-icon">📌</span>
                    Pinned Announcements
                    {visiblePinned.length > 0 && (
                      <span className="pinned-count">{visiblePinned.length}</span>
                    )}
                  </div>
                  {visiblePinned.length > 0 && (
                    <button
                      className="pinned-clear-btn"
                      onClick={() => setDismissedPins(new Set(pinnedItems.map(p => p.id)))}
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {visiblePinned.length === 0 ? (
                  <div className="pinned-empty">
                    <div className="pinned-empty-glyph">📌</div>
                    <div className="pinned-empty-title">No pinned announcements</div>
                    <div className="pinned-empty-hint">Pin any notice from a week to keep it here</div>
                  </div>
                ) : (
                  <div className="pinned-list">
                    {visiblePinned.map(item => (
                      <div className="pinned-card" key={item.id}>
                        <div className="pinned-card-stripe" style={{ background: TYPE_META[item.type]?.color || "#7c4dff" }} />
                        <div className="pinned-card-body">
                          <div className="pinned-card-top">
                            <span
                              className="notice-tag"
                              style={{
                                color:       TYPE_META[item.type]?.color  || "#7c4dff",
                                background:  TYPE_META[item.type]?.bg     || "rgba(124,77,255,.1)",
                                borderColor: TYPE_META[item.type]?.border || "rgba(124,77,255,.3)",
                              }}
                            >
                              {TYPE_META[item.type]?.icon} {TYPE_META[item.type]?.label}
                            </span>
                            <span className="notice-course-chip">{item.course || item.from}</span>
                            <span className="notice-date-chip">{item.date}</span>
                            <div className="pinned-card-actions">
                              <button className="pinned-unpin-btn" onClick={() => unpinItem(item)} title="Unpin permanently">Unpin</button>
                              <button className="pinned-dismiss-btn" onClick={() => dismissPin(item.id)} title="Dismiss">✕</button>
                            </div>
                          </div>
                          <div className="notice-title">{item.title}</div>
                          <div className="notice-detail">{item.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}