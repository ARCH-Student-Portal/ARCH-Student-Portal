import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { gsap } from "gsap";
import "./StudentProfile.css";

// ── STUDENT DATA ──
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

export default function StudentProfileV1() {
  const navigate = useNavigate();
  const location = useLocation();

  const webglRef = useRef(null);
  const introCanvasRef = useRef(null);
  const introRef = useRef(null);
  const appRef = useRef(null);
  const sidebarRef = useRef(null);
  const topbarRef = useRef(null);
  const [collapse, setCollapse] = useState(false);

  // ── CINEMATIC INTRO ──
  useEffect(() => {
    const hasPlayedIntro = sessionStorage.getItem("archIntroPlayed");
    if (hasPlayedIntro) {
      introRef.current.style.display = "none";
      appRef.current.style.opacity = 1;
      sidebarRef.current.style.transform = "translateX(0)";
      topbarRef.current.style.opacity = 1;
      document.querySelectorAll(".bp-anim").forEach((el, i) => {
        gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: i * 0.1 });
      });
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

    let animId, frame = 0;
    const draw = () => {
      ctx.fillStyle = "rgba(0,4,14,0.18)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      frame++;
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
        ctx.font = `${p.size}px 'Space Grotesk', sans-serif`;
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
      document.querySelectorAll(".bp-anim").forEach((el, i) => {
        gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.8 + i * 0.1 });
      });
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

  // ── THREE.JS BACKGROUND ──
  useEffect(() => {
    const canvas = webglRef.current;
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
    const mkBook = (x, y, z, scale, color) => {
      const g = new THREE.Group();
      const pageMat = new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.18, shininess: 80, specular: 0x4488ff });
      const p1 = new THREE.Mesh(new THREE.BoxGeometry(1.2 * scale, 0.05 * scale, 0.9 * scale), pageMat); p1.rotation.z = 0.3;
      const p2 = new THREE.Mesh(new THREE.BoxGeometry(1.2 * scale, 0.05 * scale, 0.9 * scale), pageMat); p2.rotation.z = -0.3;
      g.add(p1); g.add(p2);
      const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.04 * scale, 0.04 * scale, 0.9 * scale, 8), new THREE.MeshPhongMaterial({ color: 0x88bbff, transparent: true, opacity: 0.4 }));
      spine.rotation.x = Math.PI / 2; g.add(spine);
      g.position.set(x, y, z); scene.add(g);
      objects.push({ mesh: g, type: "book", speed: Math.random() * 0.004 + 0.002, phase: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.008 });
    };
    mkBook(-6, 3, -5, 1.8, 0x1155cc); mkBook(6, 1, -6, 2.2, 0x0066ff); mkBook(0, -3, -6, 1.6, 0x3377ee);

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
      <canvas id="webgl" ref={webglRef} />

      {/* INTRO */}
      <div id="intro" ref={introRef}>
        <canvas id="intro-canvas" ref={introCanvasRef} />
        <div id="intro-line" />
        <div id="intro-logo">ARCH</div>
        <div id="intro-sub">Student Profile</div>
        <div id="intro-flash" />
      </div>

      {/* APP SHELL */}
      <div id="app" ref={appRef}>
        
        {/* SIDEBAR */}
        <nav id="sidebar" ref={sidebarRef} className={collapse ? "collapse" : ""}>
          <div className="sb-top-bar" />
          <button className="sb-toggle" onClick={() => setCollapse(c => !c)}><span/><span/><span/></button> 
          <div className="sb-logo">
            <div className="logo-box">A</div>
            <div><div className="logo-name">ARCH</div><div className="logo-tagline">Student Portal</div></div>
          </div>
          <div className="sb-user hov-target">
            <div className="uav">{student.initials}</div>
            <div><div className="uname">{student.name}</div><div className="uid">{student.rollNo}</div></div>
          </div>
          
          {[
            ["Overview", [["⊞","Dashboard","/student/dashboard"],["◎","Academic","/student/academic"]]],
            ["Courses",[["＋","Registration","/student/registration"],["◈","Transcript","/student/transcript"],["▦","Marks","/student/marks"],["✓","Attendance","/student/attendance"],["▤","Timetable","/student/timetable"]]],
            ["Communication",[["◉","Notices","/student/notices"]]],
            ["Account",[["◌","Profile","/student/profile"]]],
          ].map(([sec, items]) => (
            <div key={sec}>
              <div className="nav-sec">{sec}</div>
              {items.map(([ic, label, path]) => (
                <div className={`ni hov-target${location.pathname === path ? " active" : ""}`} key={label} onClick={() => navigate(path)} style={{cursor: 'pointer'}}>
                  <div className="ni-ic">{ic}</div>{label}
                  {label === "Notices" && <span className="nbadge">3</span>}
                </div>
              ))}
            </div>
          ))}
          <div className="sb-foot">Spring 2025 · FAST-NUCES</div>
        </nav>

        {/* MAIN CONTENT */}
        <div id="main">
          <div id="topbar" ref={topbarRef}>
            <div className="tb-glow" />
            <div className="pg-title"><span>Student Profile</span></div>
            <div className="tb-r">
              <div className="sem-chip">Spring 2025</div>
            </div>
          </div>

          <div id="scroll">
            
            {/* ── ARCHITECTURAL BLUEPRINT LAYOUT ── */}
            <div className="bp-board">
              
              {/* Millimeter Grid Overlay */}
              <div className="bp-grid-layer" />

              {/* Crosshairs & Borders */}
              <div className="bp-crosshair top-left">+</div>
              <div className="bp-crosshair top-right">+</div>
              <div className="bp-crosshair bottom-left">+</div>
              <div className="bp-crosshair bottom-right">+</div>

              {/* Title Block (Standard Engineering Spec) */}
              <div className="bp-title-block bp-anim">
                <div className="bp-tb-row">
                  <div className="bp-tb-cell">PROJECT: <span>ARCH TELEMETRY</span></div>
                  <div className="bp-tb-cell">SCALE: <span>1:1</span></div>
                  <div className="bp-tb-cell">DATE: <span>{new Date().toISOString().split('T')[0]}</span></div>
                </div>
                <div className="bp-tb-row">
                  <div className="bp-tb-cell heavy">DWG NO: <span>{student.rollNo}</span></div>
                  <div className="bp-tb-cell">REV: <span>A</span></div>
                  <div className="bp-tb-cell">APVD: <span>SYS</span></div>
                </div>
              </div>

              {/* Drawing Area */}
              <div className="bp-drawing-area">
                
                {/* 1. Identity Schematic */}
                <div className="bp-zone bp-anim">
                  <div className="bp-zone-title">SECTION A: IDENTITY MATRIX</div>
                  
                  <div className="bp-id-layout">
                    {/* Architectural Avatar */}
                    <div className="bp-avatar-schematic">
                      <div className="bp-dim-top">Ø 120mm <span className="bp-line-h"></span></div>
                      <div className="bp-avatar-circle">
                        <div className="bp-center-cross">+</div>
                        <div className="bp-ring-inner"></div>
                        <div className="bp-ring-outer"></div>
                        <span className="bp-av-txt">{student.initials}</span>
                      </div>
                      <div className="bp-dim-side"><span className="bp-line-v"></span> 120mm</div>
                    </div>

                    {/* Raw Data */}
                    <div className="bp-data-block">
                      <div className="bp-data-line"><span className="bp-key">NAME_VAR</span> <span className="bp-val leader">{student.name}</span></div>
                      <div className="bp-data-line"><span className="bp-key">ROLL_NUM</span> <span className="bp-val leader">{student.rollNo}</span></div>
                      <div className="bp-data-line"><span className="bp-key">DOB_TME</span> <span className="bp-val leader">{student.dob}</span></div>
                      <div className="bp-data-line"><span className="bp-key">NAT_IDN</span> <span className="bp-val leader">{student.cnic}</span></div>
                    </div>
                  </div>
                </div>

                <div className="bp-separator bp-anim"><div className="bp-sep-line"></div><span>X-AXIS DIVIDER</span><div className="bp-sep-line"></div></div>

                {/* 2. Academic Vector */}
                <div className="bp-zone bp-anim">
                  <div className="bp-zone-title">SECTION B: ACADEMIC VECTOR</div>
                  
                  <div className="bp-grid-2">
                    <div className="bp-data-block bracket-left">
                      <div className="bp-coord">[X: 104, Y: 22]</div>
                      <div className="bp-data-line"><span className="bp-key">PROGRAM_ID</span> <span className="bp-val">{student.program}</span></div>
                      <div className="bp-data-line"><span className="bp-key">DEPT_LOC</span> <span className="bp-val">{student.department}</span></div>
                      <div className="bp-data-line"><span className="bp-key">FAC_ZONE</span> <span className="bp-val">{student.faculty}</span></div>
                    </div>
                    
                    <div className="bp-data-block bracket-left">
                      <div className="bp-coord">[X: 208, Y: 22]</div>
                      <div className="bp-data-line"><span className="bp-key">BATCH_YR</span> <span className="bp-val">{student.batch}</span></div>
                      <div className="bp-data-line"><span className="bp-key">CUR_SEM</span> <span className="bp-val">{student.semester}</span></div>
                      <div className="bp-data-line"><span className="bp-key">SEC_ALLOC</span> <span className="bp-val">{student.section}</span></div>
                    </div>
                  </div>
                </div>

                <div className="bp-separator bp-anim"><div className="bp-sep-line"></div><span>Y-AXIS DIVIDER</span><div className="bp-sep-line"></div></div>

                {/* 3. Logistics & Comms */}
                <div className="bp-zone bp-anim">
                  <div className="bp-zone-title">SECTION C: COMMS & LOGISTICS</div>
                  
                  <div className="bp-data-block bracket-bottom">
                    <div className="bp-data-line"><span className="bp-key">UPLINK_MAIL</span> <span className="bp-val">{student.email}</span></div>
                    <div className="bp-data-line"><span className="bp-key">SECURE_COMMS</span> <span className="bp-val">{student.phone}</span></div>
                    <div className="bp-data-line"><span className="bp-key">GUARD_REL</span> <span className="bp-val">{student.guardian}</span></div>
                    <div className="bp-data-line"><span className="bp-key">GEO_LOC</span> <span className="bp-val wrap">{student.address}</span></div>
                  </div>
                </div>

              </div>

              {/* Absolute Positioned Kill Switch */}
              <button className="bp-kill-switch bp-anim" onClick={() => navigate('/')}>
                <span className="bp-ks-icon">▲</span>
                SYS.TERMINATE
              </button>

            </div>

          </div>
        </div>
      </div>
    </>
  );
}