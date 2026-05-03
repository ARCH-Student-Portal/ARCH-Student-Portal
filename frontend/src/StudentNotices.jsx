import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { gsap } from "gsap";
import Sidebar from "./Components/shared/Sidebar";
import { STUDENT_NAV } from "./config/studentNav";
import StudentApi from "./config/studentApi";
import "./StudentNotices.css";

// ── CURRENT WEEK (1-indexed) ──────────────────────────────────────────────────
const CURRENT_WEEK = 7;

// ── TODAY for deadline calculations ──────────────────────────────────────────
const TODAY = new Date("2025-03-04");

// ── CATEGORY → FRONTEND TYPE MAP ─────────────────────────────────────────────
function resolveType(announcement) {
  if (announcement.category === "mid")      return "exam";
  if (announcement.category === "final")    return "exam";
  if (announcement.category === "activity") return "assignment";
  if (announcement.type     === "faculty")  return "announcement";
  if (announcement.type     === "university") return "announcement";
  return "announcement";
}

// ── FORMAT DATE STRING FROM ISO ───────────────────────────────────────────────
function formatDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

// ── ADAPT BACKEND ANNOUNCEMENT → FRONTEND NOTICE SHAPE ───────────────────────
function adaptNotice(a) {
  return {
    id:      a.id      ?? String(a._id ?? Math.random()),
    type:    resolveType(a),
    course:  a.course?.code ?? a.course?.name ?? a.createdBy ?? "General",
    from:    a.createdBy ?? "Admin",
    title:   a.title   ?? "",
    detail:  a.body    ?? "",
    date:    formatDate(a.createdAt),
    isoDate: a.createdAt ? new Date(a.createdAt).toISOString().slice(0, 10) : null,
    week:    a.weekNumber ?? null,
    isPinned: a.isPinned ?? false,
  };
}

// ── BUILD WEEK_DATA MAP FROM NOTICES ARRAY ────────────────────────────────────
function buildWeekData(notices) {
  const map = {};
  for (let w = 1; w <= 16; w++) { map[w] = { notices: [] }; }
  notices.forEach(n => {
    const w = n.week;
    if (w && w >= 1 && w <= 16) {
      map[w].notices.push(n);
    }
  });
  return map;
}

// ── DEADLINE STATUS ───────────────────────────────────────────────────────────
function getDeadlineStatus(isoDate) {
  if (!isoDate) return null;
  const d = new Date(isoDate);
  if (isNaN(d)) return null;
  const diffDays = Math.ceil((d - TODAY) / (1000 * 60 * 60 * 24));
  if (diffDays < 0)  return "done";
  if (diffDays <= 3) return "urgent";
  return "upcoming";
}

// ── TYPE META ─────────────────────────────────────────────────────────────────
const TYPE_META = {
  quiz:         { icon: "✏️", label: "Quiz",         color: "#40a9ff", bg: "rgba(64,169,255,.12)",  border: "rgba(64,169,255,.3)"  },
  assignment:   { icon: "📋", label: "Assignment",   color: "#ff9800", bg: "rgba(255,152,0,.10)",   border: "rgba(255,152,0,.3)"   },
  exam:         { icon: "📝", label: "Exam",         color: "#ff4d6a", bg: "rgba(255,77,106,.10)",  border: "rgba(255,77,106,.3)"  },
  announcement: { icon: "📣", label: "Announcement", color: "#7c4dff", bg: "rgba(124,77,255,.10)",  border: "rgba(124,77,255,.3)"  },
};

// ── STATUS META ───────────────────────────────────────────────────────────────
const STATUS_META = {
  done:     { label: "Done",     color: "#16a34a", bg: "rgba(22,163,74,.1)",  border: "rgba(22,163,74,.25)",  icon: "✓" },
  urgent:   { label: "Due Soon", color: "#dc2626", bg: "rgba(220,38,38,.1)",  border: "rgba(220,38,38,.25)",  icon: "⚠" },
  upcoming: { label: null, color: null, bg: null, border: null, icon: null },
};

// ── NOTICE ROW ────────────────────────────────────────────────────────────────
const NoticeRow = ({ n, pinned, onPin, onUnpin }) => {
  const meta   = TYPE_META[n.type] || TYPE_META.announcement;
  const status = getDeadlineStatus(n.isoDate);
  const sm     = STATUS_META[status] || null;
  const rowMod = status === "done" ? " notice-row--done" : status === "urgent" ? " notice-row--urgent" : "";
  const barColor = status === "done" ? "#16a34a" : status === "urgent" ? "#dc2626" : meta.color;

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
        <div className={`notice-title${status === "done" ? " notice-title--done" : ""}`}>{n.title}</div>
        <div className="notice-detail">{n.detail}</div>
      </div>
    </div>
  );
};

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
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
  const [pinnedItems,   setPinnedItems]   = useState([]);
  const [dismissedPins, setDismissedPins] = useState(new Set());
  const [weekData,      setWeekData]      = useState(() => {
    const m = {};
    for (let w = 1; w <= 16; w++) m[w] = { notices: [] };
    return m;
  });
  const [userName, setUserName] = useState("Loading...");
  const [userId,   setUserId]   = useState("...");
  const [loading,  setLoading]  = useState(true);

  // ── FETCH ALL ANNOUNCEMENTS + PROFILE ──────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileRes, annRes] = await Promise.all([
          StudentApi.getProfile(),
          StudentApi.getAnnouncements(),
        ]);

        // Profile
        if (profileRes?.student) {
          setUserName(profileRes.student.name      ?? "Student");
          setUserId(profileRes.student.rollNumber  ?? profileRes.student.studentId ?? "");
        } else if (profileRes?.name) {
          setUserName(profileRes.name);
          setUserId(profileRes.rollNumber ?? profileRes.studentId ?? "");
        }

        // Announcements
        const raw = annRes?.announcements ?? [];
        const adapted = raw.map(adaptNotice);

        // Build week map
        setWeekData(buildWeekData(adapted));

        // Seed pinned board from isPinned flag
        const pinned = adapted.filter(a => a.isPinned);
        setPinnedItems(pinned);

      } catch (err) {
        console.error("StudentNotices fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── FETCH WEEK-SPECIFIC ANNOUNCEMENTS ON WEEK SELECT ──────────────────────
  useEffect(() => {
    if (selectedWeek === null) return;
    const fetchWeek = async () => {
      try {
        const res = await StudentApi.getAnnouncements(selectedWeek);
        const raw = res?.announcements ?? [];
        const adapted = raw.map(adaptNotice);
        // Merge into weekData — overwrite only the selected week
        setWeekData(prev => ({
          ...prev,
          [selectedWeek]: { notices: adapted.filter(a => a.week === selectedWeek || a.week === null) },
        }));
      } catch (err) {
        console.error("StudentNotices week fetch error:", err);
      }
    };
    fetchWeek();
  }, [selectedWeek]);

  const visiblePinned = pinnedItems.filter(p => !dismissedPins.has(p.id));

  const pinNotice = useCallback((notice) => {
    const id = notice.id || `pin-${Date.now()}`;
    const item = { ...notice, id };
    setPinnedItems(prev => [item, ...prev.filter(p => p.id !== id)]);
    setDismissedPins(prev => { const s = new Set(prev); s.delete(id); return s; });
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const unpinItem = useCallback((item) => {
    setPinnedItems(prev => prev.filter(p => p.id !== item.id));
  }, []);

  const dismissPin = useCallback((id) => {
    setDismissedPins(prev => new Set([...prev, id]));
  }, []);

  const isPinned = useCallback((notice) =>
    pinnedItems.some(p => p.id === notice.id || p.title === notice.title),
  [pinnedItems]);

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

  // ── CINEMATIC INTRO ───────────────────────────────────────────────────────
  useEffect(() => {
    const hasPlayed = sessionStorage.getItem("archIntroPlayed");
    if (hasPlayed) {
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
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const words = ["KNOWLEDGE","GRADES","CAMPUS","LECTURE","SEMESTER","THESIS","RESEARCH","LIBRARY","STUDENT","FACULTY","EXAM","DEGREE","ALUMNI","SCIENCE","ENGINEERING","FAST","NUCES","PORTAL","NOTICES","SCHEDULE"];
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      word:    words[Math.floor(Math.random() * words.length)],
      opacity: Math.random() * 0.4 + 0.05,
      speed:   Math.random() * 0.8 + 0.2,
      size:    Math.floor(Math.random() * 10) + 10,
      flicker: Math.random() * 0.025 + 0.005,
      hue:     Math.random() > 0.6 ? "255,255,255" : Math.random() > 0.5 ? "100,180,255" : "60,140,255",
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
        if (p.y < -30) { p.y = canvas.height + 20; p.x = Math.random() * canvas.width; p.word = words[Math.floor(Math.random() * words.length)]; }
        ctx.font      = `${p.size}px 'Inter', sans-serif`;
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
      setTimeout(() => { if (webglRef.current) webglRef.current.style.display = "none"; }, 3000);
    };

    const tl = gsap.timeline({ delay: 0.4, onComplete: afterIntro });
    tl.to("#ntc-intro-line",  { scaleX: 1, duration: 0.8, ease: "power3.out" }, 0)
      .to("#ntc-intro-logo",  { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }, 0.5)
      .to("#ntc-intro-sub",   { opacity: 1, y: 0, duration: 0.5 }, 1.1)
      .to("#ntc-intro-logo",  { scale: 50, opacity: 0, duration: 0.7, ease: "power4.in" }, 2.4)
      .to("#ntc-intro-sub",   { opacity: 0, duration: 0.3 }, 2.4)
      .to("#ntc-intro-line",  { opacity: 0, duration: 0.3 }, 2.4)
      .to("#ntc-intro-flash", { opacity: 1, duration: 0.08 }, 2.85)
      .to("#ntc-intro-flash", { opacity: 0, duration: 0.4  }, 2.93)
      .to(introRef.current,   { opacity: 0, duration: 0.35 }, 2.88);

    return () => cancelAnimationFrame(animId);
  }, []);

  // ── THREE.JS BG ───────────────────────────────────────────────────────────
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
    sun.position.set(-6, 12, 8); scene.add(sun);
    const rimLight  = new THREE.PointLight(0x0055ff, 3, 40);
    rimLight.position.set(0, 6, 0); scene.add(rimLight);
    const fillLight = new THREE.PointLight(0x88ccff, 1.5, 25);
    fillLight.position.set(-8, -2, 5); scene.add(fillLight);

    const objects = [];
    const mkIco = (x, y, z, r, color, opacity = 0.22) => {
      const mesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(r, 1),
        new THREE.MeshPhongMaterial({ color, wireframe: true, transparent: true, opacity, shininess: 120 })
      );
      mesh.position.set(x, y, z); scene.add(mesh);
      objects.push({ mesh, bobSpeed: Math.random()*.008+.004, bobPhase: Math.random()*Math.PI*2, driftX: (Math.random()-.5)*.006, driftZ: (Math.random()-.5)*.005, rotX: (Math.random()-.5)*.018, rotY: (Math.random()-.5)*.022, rotZ: (Math.random()-.5)*.014 });
    };
    mkIco(-7,2,-6,2.2,0x1a78ff,0.20); mkIco(7,-1,-7,2.8,0x0055dd,0.16);
    mkIco(-2,4,-9,3.4,0x2266ee,0.13); mkIco(4,3,-4,1.6,0x4499ff,0.24);
    mkIco(-5,-3,-5,1.8,0x0044bb,0.18);

    const mkKnot = (x, y, z, r, tube, p, q, color) => {
      const mesh = new THREE.Mesh(
        new THREE.TorusKnotGeometry(r, tube, 80, 12, p, q),
        new THREE.MeshPhongMaterial({ color, wireframe: true, transparent: true, opacity: 0.14, shininess: 200 })
      );
      mesh.position.set(x, y, z); scene.add(mesh);
      objects.push({ mesh, bobSpeed: Math.random()*.007+.004, bobPhase: Math.random()*Math.PI*2, driftX: (Math.random()-.5)*.007, driftZ: (Math.random()-.5)*.006, rotX: .012, rotY: .016, rotZ: .008 });
    };
    mkKnot(6,1,-8,1.4,0.28,2,3,0x3388ff); mkKnot(-4,-2,-7,1.0,0.22,3,4,0x1155cc);

    const mkDiamond = (x, y, z, scale, color) => {
      const mesh = new THREE.Mesh(
        new THREE.OctahedronGeometry(scale, 0),
        new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.12, shininess: 60, side: THREE.DoubleSide })
      );
      mesh.scale.set(1, 1.6, 0.3); mesh.position.set(x, y, z); scene.add(mesh);
      objects.push({ mesh, bobSpeed: Math.random()*.009+.005, bobPhase: Math.random()*Math.PI*2, driftX: (Math.random()-.5)*.008, driftZ: (Math.random()-.5)*.006, rotX: (Math.random()-.5)*.010, rotY: (Math.random()-.5)*.022, rotZ: .009 });
    };
    mkDiamond(-8,0,-3,1.8,0x55aaff); mkDiamond(5,5,-6,2.2,0x2277ee);
    mkDiamond(2,-3,-4,1.4,0x88bbff); mkDiamond(-3,6,-8,2.6,0x0066cc);

    const mkRing = (x, y, z, r, color) => {
      const mesh = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.04, 6, 60),
        new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.28, shininess: 180 })
      );
      mesh.rotation.x = Math.random()*Math.PI; mesh.rotation.y = Math.random()*Math.PI;
      mesh.position.set(x, y, z); scene.add(mesh);
      objects.push({ mesh, bobSpeed: .007, bobPhase: Math.random()*Math.PI*2, driftX: (Math.random()-.5)*.007, driftZ: (Math.random()-.5)*.005, rotX: (Math.random()-.5)*.016, rotY: (Math.random()-.5)*.018, rotZ: (Math.random()-.5)*.010 });
    };
    mkRing(-6,4,-7,2.0,0x4499ff); mkRing(3,-1,-5,1.5,0x1166dd); mkRing(8,3,-9,2.4,0x0044aa);

    const COUNT = 240;
    const ptPos = new Float32Array(COUNT * 3);
    const ptCol = new Float32Array(COUNT * 3);
    const ptVel = [];
    for (let i = 0; i < COUNT; i++) {
      ptPos[i*3]=(Math.random()-.5)*34; ptPos[i*3+1]=(Math.random()-.5)*22; ptPos[i*3+2]=(Math.random()-.5)*18-6;
      ptVel.push({ x:(Math.random()-.5)*.010, y:(Math.random()-.5)*.008 });
      const pick = Math.random();
      if (pick < .4)      { ptCol[i*3]=.1; ptCol[i*3+1]=.4;  ptCol[i*3+2]=1.0; }
      else if (pick < .7) { ptCol[i*3]=.4; ptCol[i*3+1]=.8;  ptCol[i*3+2]=1.0; }
      else                { ptCol[i*3]=.9; ptCol[i*3+1]=.95; ptCol[i*3+2]=1.0; }
    }
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute("position", new THREE.BufferAttribute(ptPos, 3));
    ptGeo.setAttribute("color",    new THREE.BufferAttribute(ptCol, 3));
    scene.add(new THREE.Points(ptGeo, new THREE.PointsMaterial({ size:.055, transparent:true, opacity:.65, vertexColors:true })));

    const floor1 = new THREE.GridHelper(70, 28, 0x002288, 0x002288);
    floor1.position.y = -5.5; floor1.material.transparent = true; floor1.material.opacity = 0.30;
    scene.add(floor1);
    const floor2 = new THREE.GridHelper(70, 28, 0x003399, 0x003399);
    floor2.position.y = -5.5; floor2.rotation.x = Math.PI/2; floor2.material.transparent = true; floor2.material.opacity = 0.10;
    scene.add(floor2);

    const lineMat = new THREE.LineBasicMaterial({ color: 0x1144cc, transparent: true, opacity: 0.08 });
    for (let i = -5; i <= 5; i++) {
      const pts = [new THREE.Vector3(i*2.5,-5.5,10), new THREE.Vector3(i*0.3,2,-30)];
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
    }

    let nmx = 0, nmy = 0;
    const onMove = (e) => { nmx=(e.clientX/W)*2-1; nmy=-(e.clientY/H)*2+1; };
    document.addEventListener("mousemove", onMove);

    let t = 0, animId;
    const loop = () => {
      animId = requestAnimationFrame(loop); t += 0.012;
      objects.forEach(o => {
        o.mesh.position.y += Math.sin(t*o.bobSpeed*10+o.bobPhase)*0.012;
        if (o.driftX) o.mesh.position.x += Math.sin(t*o.bobSpeed*7+o.bobPhase*1.3)*0.006;
        if (o.driftZ) o.mesh.position.z += Math.cos(t*o.bobSpeed*5+o.bobPhase*0.7)*0.005;
        o.mesh.rotation.x += o.rotX; o.mesh.rotation.y += o.rotY;
        if (o.rotZ) o.mesh.rotation.z += o.rotZ;
      });
      const p = ptGeo.attributes.position.array;
      for (let i = 0; i < COUNT; i++) {
        p[i*3]   += ptVel[i].x + nmx*.0018; p[i*3+1] += ptVel[i].y + nmy*.0018;
        if(p[i*3]>17)   p[i*3]=-17;   if(p[i*3]<-17)   p[i*3]=17;
        if(p[i*3+1]>11) p[i*3+1]=-11; if(p[i*3+1]<-11) p[i*3+1]=11;
      }
      ptGeo.attributes.position.needsUpdate = true;
      rimLight.position.x  = Math.sin(t*.5)*12;  rimLight.position.z  = Math.cos(t*.35)*9;
      fillLight.position.x = Math.cos(t*.4)*10;  fillLight.position.y = Math.sin(t*.28)*5;
      floor1.position.z    = ((t*.8)%2.5)-1.25;
      camera.position.x   += (nmx*1.2-camera.position.x)*.018;
      camera.position.y   += (nmy*.8+3-camera.position.y)*.018;
      camera.lookAt(0,0,0); renderer.render(scene, camera);
    };
    loop();

    const onResize = () => { W=window.innerWidth; H=window.innerHeight; renderer.setSize(W,H); camera.aspect=W/H; camera.updateProjectionMatrix(); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); document.removeEventListener("mousemove", onMove); window.removeEventListener("resize", onResize); };
  }, []);

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="mesh-bg">
        <div className="mesh-blob blob-1" />
        <div className="mesh-blob blob-2" />
        <div className="mesh-blob blob-3" />
      </div>

      <canvas id="ntc-webgl" ref={webglRef} />

      <div id="ntc-intro" ref={introRef}>
        <canvas id="ntc-intro-canvas" ref={introCanvasRef} />
        <div id="ntc-intro-line" />
        <div id="ntc-intro-logo">ARCH</div>
        <div id="ntc-intro-sub">Student Portal</div>
        <div id="ntc-intro-flash" />
      </div>

      <div id="ntc-app" ref={appRef}>
        <Sidebar
          ref={sidebarRef}
          sections={STUDENT_NAV}
          logoLabel="Student Portal"
          userName={userName}
          userId={userId}
          collapse={collapse}
          onToggle={() => setCollapse(c => !c)}
        />

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
                    const data       = weekData[w] || { notices: [] };
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

            {/* ── WEEK DETAIL or PINNED BOARD ── */}
            {selectedWeek !== null ? (() => {
              const data       = weekData[selectedWeek] || { notices: [] };
              const past       = selectedWeek < CURRENT_WEEK;
              const isCurrent  = selectedWeek === CURRENT_WEEK;
              const isFire     = selectedWeek === 5 || selectedWeek === 10 || selectedWeek === 16;
              const fireLabels = { 5: "Mid 1", 10: "Mid 2", 16: "Finals" };
              const empty      = data.notices.length === 0;
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
                    <button className="detail-close-btn" onClick={() => setSelectedWeek(null)}>✕</button>
                  </div>
                  <div className="detail-divider" />
                  {empty ? (
                    <div className="detail-empty">
                      <div className="detail-empty-glyph">—</div>
                      <div className="detail-empty-title">
                        {loading ? "Loading notices..." : "No notices this week"}
                      </div>
                      <div className="detail-empty-hint">
                        {loading ? "" : "Nothing scheduled · check back later"}
                      </div>
                    </div>
                  ) : (
                    <div className="detail-list">
                      {data.notices.map((n, idx) => {
                        const nWithId = { ...n, id: n.id || makeNoticeId(selectedWeek, idx) };
                        return (
                          <NoticeRow
                            key={nWithId.id}
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
              /* ── PINNED BOARD ── */
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
                    <div className="pinned-empty-title">
                      {loading ? "Loading announcements..." : "No pinned announcements"}
                    </div>
                    <div className="pinned-empty-hint">
                      {loading ? "" : "Pin any notice from a week to keep it here"}
                    </div>
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