import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Sidebar from "./Components/shared/Sidebar";
import { STUDENT_NAV } from "./config/studentNav";
import { gsap } from "gsap";
import StudentApi from "./config/studentApi";
import "./StudentProfile.css";

// ── FALLBACK STUDENT DATA (used while loading or if API fails) ──
const STUDENT_FALLBACK = {
  name:       "",
  initials:   "??",
  rollNo:     "",
  program:    "",
  batch:      "",
  section:    "",
  semester:   "",
  email:      "",
  phone:      "",
  dob:        "",
  cnic:       "",
  guardian:   "",
  address:    "",
  department: "",
  faculty:    "",
};

// ── DERIVE INITIALS FROM NAME ──
function getInitials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "??";
}

export default function StudentProfileV1() {
  const webglRef    = useRef(null);
  const introCanvasRef = useRef(null);
  const introRef    = useRef(null);
  const appRef      = useRef(null);
  const sidebarRef  = useRef(null);
  const topbarRef   = useRef(null);

  const [collapse, setCollapse] = useState(false);
  const [student,  setStudent]  = useState(STUDENT_FALLBACK);
  const [userName, setUserName] = useState("Loading...");
  const [userId,   setUserId]   = useState("...");

  // ── FETCH PROFILE ──────────────────────────────────────────────────────────
  useEffect(() => {
    StudentApi.getProfile()
      .then((res) => {
        const d = res?.student ?? res ?? {};

        const name    = d.name       ?? "";
        const rollNo  = d.rollNumber ?? d.studentId ?? d.rollNo ?? "";
        const program = d.program    ?? d.degree    ?? "";
        const dept    = d.department ?? d.dept      ?? "";
        const faculty = d.faculty    ?? "";
        const batch   = d.batch      ?? d.cohort    ?? "";
        const semester= d.currentSemester
                          ? `${d.currentSemester}${["th","st","nd","rd"][Math.min(d.currentSemester,3)] ?? "th"} Semester`
                          : d.semester ?? "";
        const section = d.section    ?? "";
        const email   = d.email      ?? d.universityEmail ?? "";
        const phone   = d.phone      ?? d.phoneNumber     ?? "";
        const address = d.address    ?? d.residentialAddress ?? "";
        const dob     = d.dateOfBirth
                          ? new Date(d.dateOfBirth).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
                          : d.dob ?? "";
        const cnic    = d.cnic       ?? d.nationalId ?? "";
        const guardian= d.guardian   ?? d.guardianName ?? "";

        setStudent({
          name, rollNo, program, department: dept, faculty,
          batch, semester, section, email, phone, address,
          dob, cnic, guardian,
          initials: getInitials(name),
        });
        setUserName(name || "Student");
        setUserId(rollNo);
      })
      .catch((err) => {
        console.error("StudentProfile: getProfile failed", err);
      });
  }, []);

  // ── CINEMATIC INTRO ────────────────────────────────────────────────────────
  useEffect(() => {
    const hasPlayedIntro = sessionStorage.getItem("archIntroPlayed");
    if (hasPlayedIntro) {
      introRef.current.style.display = "none";
      appRef.current.style.opacity = 1;
      sidebarRef.current.style.transform = "translateX(0)";
      topbarRef.current.style.opacity = 1;
      document.querySelectorAll(".sc").forEach((el, i) => {
        gsap.to(el, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.7)", delay: i * 0.1 });
      });
      if (webglRef.current) {
        webglRef.current.style.display = "none";
      }
      return;
    }
    const canvas = introCanvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
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
    let animId;
    const draw = () => {
      ctx.fillStyle = "rgba(0,4,14,0.18)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        s.opacity += s.twinkle * (Math.random() > 0.5 ? 1 : -1);
        s.opacity = Math.max(0.05, Math.min(0.8, s.opacity));
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,210,255,${s.opacity})`; ctx.fill();
      });
      particles.forEach((p) => {
        p.y -= p.speed * 0.4; p.opacity += p.flicker * (Math.random() > 0.5 ? 1 : -1);
        p.opacity = Math.max(0.03, Math.min(0.55, p.opacity));
        if (p.y < -30) { p.y = canvas.height + 20; p.x = Math.random() * canvas.width; p.word = words[Math.floor(Math.random() * words.length)]; }
        ctx.font = `${p.size}px 'Inter', sans-serif`;
        ctx.fillStyle = `rgba(${p.hue},${p.opacity})`;
        ctx.letterSpacing = "0.15em"; ctx.fillText(p.word, p.x, p.y);
      });
      animId = requestAnimationFrame(draw);
    };
    ctx.fillStyle = "#00040e"; ctx.fillRect(0, 0, canvas.width, canvas.height); draw();
    const afterIntro = () => {
      cancelAnimationFrame(animId);
      sessionStorage.setItem("archIntroPlayed", "true");
      gsap.set(introRef.current, { display: "none" });
      gsap.to(appRef.current, { opacity: 1, duration: 0.6 });
      gsap.to(sidebarRef.current, { x: 0, duration: 1.2, ease: "expo.out", delay: 0.05 });
      gsap.to(topbarRef.current, { opacity: 1, duration: 0.7, delay: 0.4 });
      document.querySelectorAll(".sc").forEach((el, i) => {
        gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.4)", delay: 0.8 + i * 0.1 });
      });
      gsap.to(webglRef.current, { opacity: 0, duration: 2.5, ease: "power2.inOut", delay: 0.5 });
      setTimeout(() => {
        if (webglRef.current) webglRef.current.style.display = "none";
      }, 3000);
    };
    const tl = gsap.timeline({ delay: 0.4, onComplete: afterIntro });
    tl.to("#intro-line", { scaleX: 1, duration: 0.8, ease: "power3.out" }, 0)
      .to("#intro-logo", { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }, 0.5)
      .to("#intro-logo", { textShadow: "0 0 80px rgba(80,160,255,1), 0 0 160px rgba(40,100,255,0.8), 0 0 300px rgba(0,60,200,0.5)", duration: 0.5 }, 1.0)
      .to("#intro-sub", { opacity: 1, y: 0, duration: 0.5 }, 1.1)
      .to("#intro-logo", { scale: 50, opacity: 0, duration: 0.7, ease: "power4.in" }, 2.4)
      .to("#intro-sub", { opacity: 0, duration: 0.3 }, 2.4)
      .to("#intro-line", { opacity: 0, duration: 0.3 }, 2.4)
      .to("#intro-flash", { opacity: 1, duration: 0.08 }, 2.85)
      .to("#intro-flash", { opacity: 0, duration: 0.4 }, 2.93)
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
    renderer.setSize(W, H); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xf4f8ff, 1);
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xe9f2ff, 0.014);
    const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 200);
    camera.position.set(0, 2, 10);
    scene.add(new THREE.AmbientLight(0x0033aa, 0.8));
    const dirLight = new THREE.DirectionalLight(0x4488ff, 1.2); dirLight.position.set(5, 10, 5); scene.add(dirLight);
    const pointLight = new THREE.PointLight(0x0066ff, 2, 30); pointLight.position.set(0, 5, 0); scene.add(pointLight);
    const objects = [];
    const mkAtom = (x, y, z, scale, color) => {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.SphereGeometry(0.2 * scale, 16, 16), new THREE.MeshPhongMaterial({ color: 0x66aaff, transparent: true, opacity: 0.5, emissive: 0x0033aa, emissiveIntensity: 0.5 })));
      for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5 * scale, 0.025 * scale, 8, 48), new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.25, shininess: 200 }));
        ring.rotation.x = (Math.PI / 3) * i; ring.rotation.y = (Math.PI / 4) * i; g.add(ring);
      }
      g.position.set(x, y, z); scene.add(g);
      objects.push({ mesh: g, type: "atom", speed: Math.random() * 0.005 + 0.003, phase: Math.random() * Math.PI * 2, rotSpeed: Math.random() * 0.01 + 0.005 });
    };
    mkAtom(-4, 0, -3, 1.4, 0x4499ff); mkAtom(3, -1, -5, 1.8, 0x2277ff);
    const COUNT = 250;
    const ptPos = new Float32Array(COUNT * 3); const ptCol = new Float32Array(COUNT * 3); const ptVel = [];
    for (let i = 0; i < COUNT; i++) {
      ptPos[i * 3] = (Math.random() - 0.5) * 30; ptPos[i * 3 + 1] = (Math.random() - 0.5) * 20; ptPos[i * 3 + 2] = (Math.random() - 0.5) * 15 - 5;
      ptVel.push({ x: (Math.random() - 0.5) * 0.004, y: (Math.random() - 0.5) * 0.004 });
      const white = Math.random() > 0.5; ptCol[i * 3] = white ? 0.8 : 0.1; ptCol[i * 3 + 1] = white ? 0.9 : 0.5; ptCol[i * 3 + 2] = 1.0;
    }
    const ptGeo = new THREE.BufferGeometry(); ptGeo.setAttribute("position", new THREE.BufferAttribute(ptPos, 3)); ptGeo.setAttribute("color", new THREE.BufferAttribute(ptCol, 3));
    scene.add(new THREE.Points(ptGeo, new THREE.PointsMaterial({ size: 0.06, transparent: true, opacity: 0.7, vertexColors: true })));
    let nmx = 0, nmy = 0;
    const onMove = (e) => { nmx = (e.clientX / W) * 2 - 1; nmy = -(e.clientY / H) * 2 + 1; };
    document.addEventListener("mousemove", onMove);
    let t = 0, animId;
    const loop = () => {
      animId = requestAnimationFrame(loop); t += 0.008;
      objects.forEach((o) => {
        o.mesh.position.y += Math.sin(t * o.speed * 10 + o.phase) * 0.004; o.mesh.rotation.y += o.rotSpeed;
        if (o.type === "atom") { o.mesh.rotation.x += o.rotSpeed * 0.5; o.mesh.rotation.z += o.rotSpeed * 0.3; }
      });
      const p = ptGeo.attributes.position.array;
      for (let i = 0; i < COUNT; i++) {
        p[i * 3] += ptVel[i].x + nmx * 0.0006; p[i * 3 + 1] += ptVel[i].y + nmy * 0.0006;
        if (p[i * 3] > 15) p[i * 3] = -15; if (p[i * 3] < -15) p[i * 3] = 15;
        if (p[i * 3 + 1] > 10) p[i * 3 + 1] = -10; if (p[i * 3 + 1] < -10) p[i * 3 + 1] = 10;
      }
      ptGeo.attributes.position.needsUpdate = true;
      camera.position.x += (nmx * 0.6 - camera.position.x) * 0.015; camera.position.y += (nmy * 0.4 + 2 - camera.position.y) * 0.015;
      camera.lookAt(0, 0, 0); renderer.render(scene, camera);
    };
    loop();
    const onResize = () => { W = window.innerWidth; H = window.innerHeight; renderer.setSize(W, H); camera.aspect = W / H; camera.updateProjectionMatrix(); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); document.removeEventListener("mousemove", onMove); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <>
      <div className="mesh-bg">
        <div className="mesh-blob blob-1" />
        <div className="mesh-blob blob-2" />
        <div className="mesh-blob blob-3" />
      </div>
      <canvas id="webgl" ref={webglRef} />
      <div id="intro" ref={introRef}>
        <canvas id="intro-canvas" ref={introCanvasRef} />
        <div id="intro-line" />
        <div id="intro-logo">ARCH</div>
        <div id="intro-sub">Student Profile</div>
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
          <div id="topbar" ref={topbarRef}>
            <div className="tb-glow" />
            <div className="pg-title"><span>Student Profile</span></div>
            <div className="tb-r">
              <div className="sem-chip">Spring 2025</div>
              <div className="nb-btn hov-target">
                🔔
                <div className="nb-pip" />
              </div>
            </div>
          </div>
          <div id="scroll">
            <div className="profile-container">
              <div className="glass-card sc profile-hero-card">
                <div className="hero-avatar">{student.initials}</div>
                <div className="hero-details">
                  <div className="hero-name">{student.name}</div>
                  <div className="hero-roll">{student.rollNo}</div>
                  <div className="hero-program">{student.program}</div>
                </div>
              </div>

              <div className="profile-grid">
                <div className="glass-card sc">
                  <div className="card-header">
                    <div className="ch-bar" />
                    <div className="ch-title">Academic Details</div>
                  </div>
                  <div className="info-list">
                    <div className="info-item"><span className="info-label">Program</span><span className="info-val">{student.program}</span></div>
                    <div className="info-item"><span className="info-label">Department</span><span className="info-val">{student.department}</span></div>
                    <div className="info-item"><span className="info-label">Faculty</span><span className="info-val">{student.faculty}</span></div>
                    <div className="info-item"><span className="info-label">Batch</span><span className="info-val">{student.batch}</span></div>
                    <div className="info-item"><span className="info-label">Semester</span><span className="info-val">{student.semester}</span></div>
                    <div className="info-item"><span className="info-label">Section</span><span className="info-val">{student.section}</span></div>
                  </div>
                </div>

                <div className="glass-card sc">
                  <div className="card-header">
                    <div className="ch-bar" />
                    <div className="ch-title">Contact & Logistics</div>
                  </div>
                  <div className="info-list">
                    <div className="info-item"><span className="info-label">University Email</span><span className="info-val">{student.email}</span></div>
                    <div className="info-item"><span className="info-label">Phone Number</span><span className="info-val">{student.phone}</span></div>
                    <div className="info-item"><span className="info-label">Residential Address</span><span className="info-val wrap">{student.address}</span></div>
                  </div>
                </div>

                <div className="glass-card sc">
                  <div className="card-header">
                    <div className="ch-bar" />
                    <div className="ch-title">Personal Record</div>
                  </div>
                  <div className="info-list">
                    <div className="info-item"><span className="info-label">Date of Birth</span><span className="info-val">{student.dob}</span></div>
                    <div className="info-item"><span className="info-label">National ID (CNIC)</span><span className="info-val">{student.cnic}</span></div>
                    <div className="info-item"><span className="info-label">Guardian Name</span><span className="info-val">{student.guardian}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}