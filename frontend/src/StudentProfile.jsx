import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { gsap } from "gsap";
import "./StudentProfile.css";

// ── STUDENT DATA (single source of truth) ──────────────────────────────────────
const student = {
  name:      "Areeb Bucha",
  initials:  "AB",
  rollNo:    "21K-3210",
  program:   "BS Computer Science",
  batch:     "Fall 2021",
  section:   "Section A",
  semester:  "7th Semester",
  email:     "21k-3210@stu.nu.edu.pk",
  phone:     "+92 300 1234567",
  dob:       "15 March 2003",
  cnic:      "35201-1234567-1",
  guardian:  "Muhammad Bucha",
  address:   "House 12, Block B, Johar Town, Lahore",
  department:"Computer Science",
  faculty:   "Faculty of Computing",
};

// ── DIGITAL ID CARD ─────────────────────────────────────────────────────────────
export function DigitalIDCard() {
  return (
    <div className="id-card">
      <div className="id-card-header">
        <div className="id-uni-logo">A</div>
        <div>
          <div className="id-uni-name">FAST National University</div>
          <div className="id-uni-sub">NUCES · Lahore Campus</div>
        </div>
        <div className="id-hologram" />
      </div>

      <div className="id-card-body">
        <div className="id-avatar-wrap">
          <div className="id-avatar-ring" />
          <div className="id-avatar">{student.initials}</div>
        </div>
        <div className="id-info">
          <div className="id-name">{student.name}</div>
          <div className="id-program">{student.program}</div>
          <div className="id-rows">
            <div className="id-row"><span className="id-lbl">Roll No.</span><span className="id-val mono">{student.rollNo}</span></div>
            <div className="id-row"><span className="id-lbl">Batch</span><span className="id-val">{student.batch}</span></div>
            <div className="id-row"><span className="id-lbl">Section</span><span className="id-val">{student.section}</span></div>
            <div className="id-row"><span className="id-lbl">Semester</span><span className="id-val">{student.semester}</span></div>
            <div className="id-row"><span className="id-lbl">Email</span><span className="id-val mono" style={{ fontSize: 9 }}>{student.email}</span></div>
          </div>
        </div>
      </div>

      <div className="id-card-footer">
        <div className="id-barcode">
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} className="id-bar" style={{ height: `${12 + Math.sin(i * 1.7) * 8}px` }} />
          ))}
        </div>
        <div className="id-validity">Valid: {student.batch} — {student.semester}</div>
        <div className="id-chip"><div className="id-chip-inner" /></div>
      </div>

      <div className="id-card-shine" />
      <div className="id-card-bg-pattern" />
    </div>
  );
}

// ── ID CARD MODAL (used by all sidebar pages) ───────────────────────────────────
export function IDCardModal({ onClose }) {
  return (
    <div className="id-modal-overlay" onClick={onClose}>
      <div className="id-modal-box" onClick={e => e.stopPropagation()}>
        <button className="id-modal-close" onClick={onClose}>✕</button>
        <DigitalIDCard />
      </div>
    </div>
  );
}

// ── SIDEBAR SECTIONS ────────────────────────────────────────────────────────────
const sidebarSections = [
  ["Overview",      [["⊞","Dashboard","/student/dashboard"],["◎","Academic","/student/academic"]]],
  ["Courses",       [["＋","Registration","/student/registration"],["◈","Grades","/student/grades"],["▦","Marks","/student/marks"],["✓","Attendance","/student/attendance"],["▤","Timetable","/student/timetable"]]],
  ["Communication", [["◉","Notices","/student/notices"]]],
  ["Account",       [["◌","Profile","/student/profile"]]],
];

// ── MAIN COMPONENT ──────────────────────────────────────────────────────────────
export default function StudentProfile() {
  const navigate     = useNavigate();
  const location     = useLocation();
  const webglRef     = useRef(null);
  const introCanvasRef = useRef(null);
  const introRef     = useRef(null);
  const appRef       = useRef(null);
  const sidebarRef   = useRef(null);
  const topbarRef    = useRef(null);

  const [collapse, setCollapse] = useState(false);
  const [showIDModal, setShowIDModal] = useState(false);

  // ── INTRO (same pattern as other pages) ──
  useEffect(() => {
    const hasPlayed = sessionStorage.getItem("archIntroPlayed");

    if (hasPlayed) {
      introRef.current.style.display = "none";
      appRef.current.style.opacity = 1;
      sidebarRef.current.style.transform = "translateX(0)";
      topbarRef.current.style.opacity = 1;
      document.querySelectorAll(".glass-card").forEach((el, i) => {
        gsap.to(el, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.4)", delay: i * 0.1 });
      });
      return;
    }

    const canvas = introCanvasRef.current;
    const ctx    = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const words = ["KNOWLEDGE","GRADES","CAMPUS","LECTURE","SEMESTER","THESIS","RESEARCH","LIBRARY","STUDENT","FACULTY","FAST","NUCES"];
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      word: words[Math.floor(Math.random() * words.length)],
      opacity: Math.random() * 0.4 + 0.05, speed: Math.random() * 0.8 + 0.2,
      size: Math.floor(Math.random() * 10) + 10, flicker: Math.random() * 0.025 + 0.005,
      hue: Math.random() > 0.6 ? "255,255,255" : "100,180,255",
    }));
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.5, opacity: Math.random() * 0.6 + 0.1, twinkle: Math.random() * 0.02,
    }));

    let animId, frame = 0;
    const draw = () => {
      ctx.fillStyle = "rgba(0,4,14,0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      frame++;
      stars.forEach(s => {
        s.opacity += s.twinkle * (Math.random() > 0.5 ? 1 : -1);
        s.opacity = Math.max(0.05, Math.min(0.8, s.opacity));
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,210,255,${s.opacity})`; ctx.fill();
      });
      particles.forEach(p => {
        p.y -= p.speed * 0.4;
        p.opacity += p.flicker * (Math.random() > 0.5 ? 1 : -1);
        p.opacity = Math.max(0.03, Math.min(0.55, p.opacity));
        if (p.y < -30) { p.y = canvas.height + 20; p.x = Math.random() * canvas.width; }
        ctx.font = `${p.size}px 'Inter', sans-serif`;
        ctx.fillStyle = `rgba(${p.hue},${p.opacity})`;
        ctx.fillText(p.word, p.x, p.y);
      });
      animId = requestAnimationFrame(draw);
    };
    ctx.fillStyle = "#00040e"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    draw();

    const afterIntro = () => {
      cancelAnimationFrame(animId);
      sessionStorage.setItem("archIntroPlayed", "true");
      gsap.set(introRef.current, { display: "none" });
      gsap.to(appRef.current,   { opacity: 1, duration: 0.6 });
      gsap.to(sidebarRef.current, { x: 0, duration: 1.2, ease: "expo.out", delay: 0.05 });
      gsap.to(topbarRef.current, { opacity: 1, duration: 0.7, delay: 0.4 });
      document.querySelectorAll(".glass-card").forEach((el, i) => {
        gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: "back.out(1.4)", delay: 0.8 + i * 0.12 });
      });
    };

    const tl = gsap.timeline({ delay: 0.3, onComplete: afterIntro });
    tl.to("#prof-intro-line", { scaleX: 1, duration: 0.8, ease: "power3.out" }, 0)
      .to("#prof-intro-logo", { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }, 0.5)
      .to("#prof-intro-sub",  { opacity: 1, y: 0, duration: 0.5 }, 1.1)
      .to("#prof-intro-logo", { scale: 50, opacity: 0, duration: 0.7, ease: "power4.in" }, 2.2)
      .to("#prof-intro-sub",  { opacity: 0, duration: 0.3 }, 2.2)
      .to("#prof-intro-line", { opacity: 0, duration: 0.3 }, 2.2)
      .to("#prof-intro-flash", { opacity: 1, duration: 0.08 }, 2.65)
      .to("#prof-intro-flash", { opacity: 0, duration: 0.4 }, 2.73)
      .to(introRef.current,   { opacity: 0, duration: 0.35 }, 2.68);

    return () => cancelAnimationFrame(animId);
  }, []);

  // ── THREE.JS BG ──
  useEffect(() => {
    const canvas = webglRef.current;
    if (!canvas) return;
    let W = window.innerWidth, H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xf4f8ff, 1);
    const scene  = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xe9f2ff, 0.014);
    const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 200);
    camera.position.set(0, 2, 10);
    scene.add(new THREE.AmbientLight(0x0033aa, 0.8));
    const dir = new THREE.DirectionalLight(0x4488ff, 1.2); dir.position.set(5, 10, 5); scene.add(dir);
    const pt  = new THREE.PointLight(0x0066ff, 2, 30); pt.position.set(0, 5, 0); scene.add(pt);

    const objects = [];
    const mkBook = (x, y, z, sc, col) => {
      const g = new THREE.Group();
      const mat = new THREE.MeshPhongMaterial({ color: col, transparent: true, opacity: 0.18, shininess: 80, specular: 0x4488ff });
      [0.3, -0.3].forEach(rz => { const m = new THREE.Mesh(new THREE.BoxGeometry(1.2*sc, 0.05*sc, 0.9*sc), mat); m.rotation.z = rz; g.add(m); });
      const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.04*sc, 0.04*sc, 0.9*sc, 8), new THREE.MeshPhongMaterial({ color: 0x88bbff, transparent: true, opacity: 0.4 }));
      spine.rotation.x = Math.PI / 2; g.add(spine);
      g.position.set(x, y, z); scene.add(g);
      objects.push({ mesh: g, speed: Math.random() * 0.004 + 0.002, phase: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.008 });
    };
    mkBook(-6, 3, -5, 1.8, 0x1155cc); mkBook(6, 1, -6, 2.2, 0x0066ff); mkBook(0, -3, -6, 1.6, 0x3377ee);

    const COUNT = 200;
    const ptPos = new Float32Array(COUNT * 3); const ptCol = new Float32Array(COUNT * 3); const ptVel = [];
    for (let i = 0; i < COUNT; i++) {
      ptPos[i*3] = (Math.random()-0.5)*30; ptPos[i*3+1] = (Math.random()-0.5)*20; ptPos[i*3+2] = (Math.random()-0.5)*15 - 5;
      ptVel.push({ x: (Math.random()-0.5)*0.004, y: (Math.random()-0.5)*0.004 });
      const w = Math.random() > 0.5;
      ptCol[i*3] = w ? 0.8 : 0.1; ptCol[i*3+1] = w ? 0.9 : 0.5; ptCol[i*3+2] = 1.0;
    }
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute("position", new THREE.BufferAttribute(ptPos, 3));
    ptGeo.setAttribute("color",    new THREE.BufferAttribute(ptCol, 3));
    scene.add(new THREE.Points(ptGeo, new THREE.PointsMaterial({ size: 0.06, transparent: true, opacity: 0.7, vertexColors: true })));

    const grid = new THREE.GridHelper(60, 40, 0x001133, 0x001133);
    grid.position.y = -6; grid.material.transparent = true; grid.material.opacity = 0.4; scene.add(grid);

    let nmx = 0, nmy = 0;
    const onMove = e => { nmx = (e.clientX / W) * 2 - 1; nmy = -(e.clientY / H) * 2 + 1; };
    document.addEventListener("mousemove", onMove);

    let t = 0, animId;
    const loop = () => {
      animId = requestAnimationFrame(loop); t += 0.008;
      objects.forEach(o => { o.mesh.position.y += Math.sin(t * o.speed * 10 + o.phase) * 0.004; o.mesh.rotation.y += o.rotSpeed; });
      const p = ptGeo.attributes.position.array;
      for (let i = 0; i < COUNT; i++) {
        p[i*3] += ptVel[i].x + nmx * 0.0006; p[i*3+1] += ptVel[i].y + nmy * 0.0006;
        if (p[i*3]   >  15) p[i*3]   = -15; if (p[i*3]   < -15) p[i*3]   =  15;
        if (p[i*3+1] >  10) p[i*3+1] = -10; if (p[i*3+1] < -10) p[i*3+1] =  10;
      }
      ptGeo.attributes.position.needsUpdate = true;
      pt.position.x = Math.sin(t * 0.5) * 8; pt.position.z = Math.cos(t * 0.3) * 6;
      camera.position.x += (nmx * 0.6 - camera.position.x) * 0.015;
      camera.position.y += (nmy * 0.4 + 2 - camera.position.y) * 0.015;
      camera.lookAt(0, 0, 0); renderer.render(scene, camera);
    };
    loop();

    const onResize = () => { W = window.innerWidth; H = window.innerHeight; renderer.setSize(W, H); camera.aspect = W / H; camera.updateProjectionMatrix(); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); document.removeEventListener("mousemove", onMove); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <>
      <canvas id="prof-webgl" ref={webglRef} />

      {/* INTRO */}
      <div id="prof-intro" ref={introRef}>
        <canvas id="prof-intro-canvas" ref={introCanvasRef} />
        <div id="prof-intro-line" />
        <div id="prof-intro-logo">ARCH</div>
        <div id="prof-intro-sub">Student Profile</div>
        <div id="prof-intro-flash" />
      </div>

      {/* ID CARD MODAL */}
      {showIDModal && <IDCardModal onClose={() => setShowIDModal(false)} />}

      {/* APP */}
      <div id="app" ref={appRef}>
        <nav id="sidebar" ref={sidebarRef} className={collapse ? "collapse" : ""}>
          <div className="sb-top-bar" />
          <button className="sb-toggle" onClick={() => setCollapse(c => !c)}>
            <span/><span/><span/>
          </button>
          <div className="sb-logo">
            <div className="logo-box">A</div>
            <div><div className="logo-name">ARCH</div><div className="logo-tagline">Student Portal</div></div>
          </div>

          {/* Clickable user section → open ID card modal */}
          <div className="sb-user" onClick={() => setShowIDModal(true)} title="View Digital ID Card">
            <div className="uav">AB</div>
            <div>
              <div className="uname">Areeb Bucha</div>
              <div className="uid">21K-3210</div>
            </div>
          </div>

          {sidebarSections.map(([sec, items]) => (
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

        <div id="main">
          <div id="topbar" ref={topbarRef}>
            <div className="tb-glow" />
            <div className="pg-title">Student Profile</div>
          </div>

          <div id="scroll">

            {/* ── DIGITAL ID CARD — top center ── */}
            <div className="prof-id-section">
              <div className="prof-id-card-wrap">
                <DigitalIDCard />
              </div>
            </div>

            {/* ── TWO-COLUMN INFO GRID ── */}
            <div className="prof-body-grid">

              {/* LEFT — Personal Information */}
              <div className="glass-card">
                <div className="ch">
                  <div className="ct"><div className="ctbar"/>Personal Information</div>
                </div>
                <div className="prof-info-list">
                  {[
                    { icon: "🎓", label: "Program", value: student.program },
                    { icon: "🏫", label: "Department", value: student.department },
                    { icon: "📚", label: "Faculty", value: student.faculty },
                    { icon: "🗓️", label: "Batch", value: student.batch },
                    { icon: "📋", label: "Section", value: student.section },
                    { icon: "🔢", label: "Semester", value: student.semester },
                    { icon: "🎂", label: "Date of Birth", value: student.dob },
                    { icon: "🆔", label: "CNIC", value: student.cnic, mono: true },
                    { icon: "👤", label: "Guardian", value: student.guardian },
                  ].map(({ icon, label, value, mono }) => (
                    <div className="prof-info-row" key={label}>
                      <div className="prof-info-icon">{icon}</div>
                      <div>
                        <div className="prof-info-label">{label}</div>
                        <div className={`prof-info-value${mono ? " mono" : ""}`}>{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT — Contact Information */}
              <div className="glass-card">
                <div className="ch">
                  <div className="ct"><div className="ctbar"/>Contact Information</div>
                </div>
                <div className="prof-info-list">
                  {[
                    { icon: "📧", label: "University Email", value: student.email, mono: true },
                    { icon: "📱", label: "Phone Number", value: student.phone, mono: true },
                    { icon: "🏠", label: "Home Address", value: student.address },
                    { icon: "🔖", label: "Roll Number", value: student.rollNo, mono: true },
                  ].map(({ icon, label, value, mono }) => (
                    <div className="prof-info-row" key={label}>
                      <div className="prof-info-icon">{icon}</div>
                      <div>
                        <div className="prof-info-label">{label}</div>
                        <div className={`prof-info-value${mono ? " mono" : ""}`}>{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}