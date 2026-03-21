import { useEffect, useRef, useState } from "react"; /*Imported Components*/
import * as THREE from "three";
import { gsap } from "gsap";
import "./StudentDashV1.css";

export default function StudentDashV1() {
  const webglRef = useRef(null);
  const introCanvasRef = useRef(null);
  const introRef = useRef(null);
  const appRef = useRef(null);
  const sidebarRef = useRef(null);
  const topbarRef = useRef(null);
  const [collapse, setCollapse] = useState(false); /*Sidebar Collapsing Usage*/

  // CURSOR
  useEffect(() => {
    const ring = document.getElementById("cur-ring");
    const dot = document.getElementById("cur-dot");
    let mx = 0, my = 0, rx = 0, ry = 0;
    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + "px"; dot.style.top = my + "px";
    };
    document.addEventListener("mousemove", onMove);
    const lerp = () => {
      rx += (mx - rx) * 0.1; ry += (my - ry) * 0.1;
      ring.style.left = Math.round(rx) + "px";
      ring.style.top = Math.round(ry) + "px";
      requestAnimationFrame(lerp);
    };
    lerp();
    const els = document.querySelectorAll(".hov-target");
    const on = () => document.body.classList.add("hov");
    const off = () => document.body.classList.remove("hov");
    els.forEach((el) => { el.addEventListener("mouseenter", on); el.addEventListener("mouseleave", off); });
    return () => document.removeEventListener("mousemove", onMove);
  }, []);

  // MARVEL INTRO
  useEffect(() => {
    const canvas = introCanvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // uni-themed words that fly in
    const words = [
      "KNOWLEDGE","GRADES","CAMPUS","LECTURE","SEMESTER",
      "THESIS","RESEARCH","LIBRARY","STUDENT","FACULTY",
      "EXAM","DEGREE","ALUMNI","SCIENCE","ENGINEERING",
      "MATHEMATICS","BIOLOGY","PHYSICS","COMPUTER","ARTS",
      "FAST","NUCES","PORTAL","LEARNING","FUTURE",
      "ATTENDANCE","TRANSCRIPT","CREDITS","GPA","SCHEDULE",
    ];

    // big cinematic word particles
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

    // starfield
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5,
      opacity: Math.random() * 0.6 + 0.1,
      twinkle: Math.random() * 0.02,
    }));

    let animId, frame = 0;
    const draw = () => {
      // deep space bg with slight blue tint
      ctx.fillStyle = "rgba(0,4,14,0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      frame++;

      // stars
      stars.forEach((s) => {
        s.opacity += s.twinkle * (Math.random() > 0.5 ? 1 : -1);
        s.opacity = Math.max(0.05, Math.min(0.8, s.opacity));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,210,255,${s.opacity})`;
        ctx.fill();
      });

      // word particles floating upward
      particles.forEach((p) => {
        p.y -= p.speed * 0.4;
        p.opacity += p.flicker * (Math.random() > 0.5 ? 1 : -1);
        p.opacity = Math.max(0.03, Math.min(0.55, p.opacity));
        if (p.y < -30) {
          p.y = canvas.height + 20;
          p.x = Math.random() * canvas.width;
          p.word = words[Math.floor(Math.random() * words.length)];
        }
        ctx.font = `${p.size}px 'Space Grotesk', sans-serif`;
        ctx.fillStyle = `rgba(${p.hue},${p.opacity})`;
        ctx.letterSpacing = "0.15em";
        ctx.fillText(p.word, p.x, p.y);
      });

      // cinematic horizontal light beam
      const scanY = ((frame * 1.8) % (canvas.height + 60)) - 30;
      const g = ctx.createLinearGradient(0, scanY - 4, 0, scanY + 4);
      g.addColorStop(0, "transparent");
      g.addColorStop(0.5, "rgba(80,160,255,0.12)");
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(0, scanY - 4, canvas.width, 8);

      // vertical light columns
      [0.2, 0.5, 0.8].forEach((frac, i) => {
        const cx = canvas.width * frac;
        const colG = ctx.createLinearGradient(cx - 1, 0, cx + 1, 0);
        colG.addColorStop(0, "transparent");
        colG.addColorStop(0.5, `rgba(60,120,255,${0.04 + Math.sin(frame * 0.02 + i) * 0.02})`);
        colG.addColorStop(1, "transparent");
        ctx.fillStyle = colG;
        ctx.fillRect(cx - 30, 0, 60, canvas.height);
      });

      animId = requestAnimationFrame(draw);
    };
    // solid black first frame
    ctx.fillStyle = "#00040e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    draw();

    const afterIntro = () => {
      cancelAnimationFrame(animId);
      gsap.set(introRef.current, { display: "none" });
      gsap.to(appRef.current, { opacity: 1, duration: 0.6 });
      gsap.to(sidebarRef.current, { x: 0, duration: 1.2, ease: "expo.out", delay: 0.05 });
      gsap.to(topbarRef.current, { opacity: 1, duration: 0.7, delay: 0.4 });
      document.querySelectorAll(".sc").forEach((el, i) => {
        gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: "back.out(1.7)", delay: 0.6 + i * 0.1 });
      });
      document.querySelectorAll(".glass-card").forEach((el, i) => {
        gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: "back.out(1.4)", delay: 1.0 + i * 0.12 });
      });
      setTimeout(() => {
        countUp("v1", 3.62, 2, "", 1400);
        countUp("v2", 86, 0, "", 1200);
        countUp("v3", 5, 0, "", 1000);
        countUp("v4", 78, 0, "%", 1200);
        setTimeout(() => {
          setText("d1", "↑ +0.08 this semester");
          setText("d2", "of 136 required");
          setText("d3", "courses active");
          setText("d4", "1 course at risk");
        }, 950);
      }, 650);
      setTimeout(() => {
        const bd = document.getElementById("bar-done");
        const ba = document.getElementById("bar-active");
        if (bd) bd.style.width = "63%";
        if (ba) ba.style.width = "11%";
      }, 1500);
    };

    // CINEMATIC GSAP TIMELINE
    const tl = gsap.timeline({ delay: 0.4, onComplete: afterIntro });
    // 1. horizontal line slices across
    tl.to("#intro-line", { scaleX: 1, duration: 0.8, ease: "power3.out" }, 0)
    // 2. ARCH logo materialises letter by letter feel — scale + opacity
      .to("#intro-logo", { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }, 0.5)
    // 3. glow intensifies
      .to("#intro-logo", { textShadow: "0 0 80px rgba(80,160,255,1), 0 0 160px rgba(40,100,255,0.8), 0 0 300px rgba(0,60,200,0.5)", duration: 0.5 }, 1.0)
    // 4. tagline fades in
      .to("#intro-sub", { opacity: 1, y: 0, duration: 0.5 }, 1.1)
    // 5. university name
      .to("#intro-uni", { opacity: 1, duration: 0.4 }, 1.4)
    // 6. hold for a beat then logo ROCKETS toward camera
      .to("#intro-logo", { scale: 50, opacity: 0, duration: 0.7, ease: "power4.in" }, 2.4)
      .to("#intro-sub", { opacity: 0, duration: 0.3 }, 2.4)
      .to("#intro-uni", { opacity: 0, duration: 0.3 }, 2.4)
      .to("#intro-line", { opacity: 0, duration: 0.3 }, 2.4)
    // 7. white flash
      .to("#intro-flash", { opacity: 1, duration: 0.08 }, 2.85)
      .to("#intro-flash", { opacity: 0, duration: 0.4 }, 2.93)
    // 8. fade intro out
      .to(introRef.current, { opacity: 0, duration: 0.35 }, 2.88);

    return () => cancelAnimationFrame(animId);
  }, []);

  // THREE.JS — UNI-THEMED 3D BG
  useEffect(() => {
    const canvas = webglRef.current;
    let W = window.innerWidth, H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xf4f8ff, 1);
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xe9f2ff, 0.014);
    const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 200);
    camera.position.set(0, 2, 10);

    // AMBIENT LIGHT
    scene.add(new THREE.AmbientLight(0x0033aa, 0.8));
    const dirLight = new THREE.DirectionalLight(0x4488ff, 1.2);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);
    const pointLight = new THREE.PointLight(0x0066ff, 2, 30);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    // LARGE BOOK / CAMPUS SHAPES — 3D floating objects
    const objects = [];

    // floating open book shapes (two planes angled)
    const mkBook = (x, y, z, scale, color) => {
      const g = new THREE.Group();
      const pageGeo = new THREE.BoxGeometry(1.2 * scale, 0.05 * scale, 0.9 * scale);
      const pageMat = new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.18, shininess: 80, specular: 0x4488ff });
      const p1 = new THREE.Mesh(pageGeo, pageMat);
      p1.rotation.z = 0.3;
      const p2 = new THREE.Mesh(pageGeo, pageMat);
      p2.rotation.z = -0.3;
      g.add(p1); g.add(p2);
      // spine
      const spineGeo = new THREE.CylinderGeometry(0.04 * scale, 0.04 * scale, 0.9 * scale, 8);
      const spineMat = new THREE.MeshPhongMaterial({ color: 0x88bbff, transparent: true, opacity: 0.4 });
      const spine = new THREE.Mesh(spineGeo, spineMat);
      spine.rotation.x = Math.PI / 2;
      g.add(spine);
      g.position.set(x, y, z);
      scene.add(g);
      objects.push({ mesh: g, type: "book", speed: Math.random() * 0.004 + 0.002, phase: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.008 });
      return g;
    };

    mkBook(-6, 3, -5, 1.8, 0x1155cc);
    mkBook(6, 1, -6, 2.2, 0x0066ff);
    mkBook(-3, -2, -4, 1.4, 0x2266dd);
    mkBook(4, 4, -8, 2.8, 0x0044aa);
    mkBook(0, -3, -6, 1.6, 0x3377ee);

    // floating graduation caps
    const mkGradCap = (x, y, z, scale) => {
      const g = new THREE.Group();
      // board
      const boardGeo = new THREE.BoxGeometry(1.2 * scale, 0.08 * scale, 1.2 * scale);
      const boardMat = new THREE.MeshPhongMaterial({ color: 0x0055dd, transparent: true, opacity: 0.22, shininess: 120 });
      const board = new THREE.Mesh(boardGeo, boardMat);
      board.position.y = 0.3 * scale;
      g.add(board);
      // head part
      const headGeo = new THREE.CylinderGeometry(0.35 * scale, 0.4 * scale, 0.3 * scale, 16);
      const headMat = new THREE.MeshPhongMaterial({ color: 0x003399, transparent: true, opacity: 0.2 });
      const head = new THREE.Mesh(headGeo, headMat);
      g.add(head);
      g.position.set(x, y, z);
      scene.add(g);
      objects.push({ mesh: g, type: "cap", speed: Math.random() * 0.003 + 0.002, phase: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.006 });
    };
    mkGradCap(5, -1, -3, 1.5);
    mkGradCap(-5, 2, -7, 2.0);
    mkGradCap(2, 5, -9, 2.4);

    // floating geometric atoms (education / science)
    const mkAtom = (x, y, z, scale, color) => {
      const g = new THREE.Group();
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.2 * scale, 16, 16), new THREE.MeshPhongMaterial({ color: 0x66aaff, transparent: true, opacity: 0.5, emissive: 0x0033aa, emissiveIntensity: 0.5 }));
      g.add(core);
      for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5 * scale, 0.025 * scale, 8, 48), new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.25, shininess: 200 }));
        ring.rotation.x = (Math.PI / 3) * i;
        ring.rotation.y = (Math.PI / 4) * i;
        g.add(ring);
      }
      g.position.set(x, y, z);
      scene.add(g);
      objects.push({ mesh: g, type: "atom", speed: Math.random() * 0.005 + 0.003, phase: Math.random() * Math.PI * 2, rotSpeed: Math.random() * 0.01 + 0.005 });
    };
    mkAtom(-4, 0, -3, 1.4, 0x4499ff);
    mkAtom(3, -1, -5, 1.8, 0x2277ff);
    mkAtom(-2, 4, -6, 1.2, 0x55aaff);

    // PARTICLES — floating blue/white dots
    const COUNT = 250;
    const ptPos = new Float32Array(COUNT * 3);
    const ptCol = new Float32Array(COUNT * 3);
    const ptVel = [];
    for (let i = 0; i < COUNT; i++) {
      ptPos[i * 3] = (Math.random() - 0.5) * 30;
      ptPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      ptPos[i * 3 + 2] = (Math.random() - 0.5) * 15 - 5;
      ptVel.push({ x: (Math.random() - 0.5) * 0.004, y: (Math.random() - 0.5) * 0.004 });
      const white = Math.random() > 0.5;
      ptCol[i * 3] = white ? 0.8 : 0.1;
      ptCol[i * 3 + 1] = white ? 0.9 : 0.5;
      ptCol[i * 3 + 2] = 1.0;
    }
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute("position", new THREE.BufferAttribute(ptPos, 3));
    ptGeo.setAttribute("color", new THREE.BufferAttribute(ptCol, 3));
    const ptMat = new THREE.PointsMaterial({ size: 0.06, transparent: true, opacity: 0.7, vertexColors: true });
    scene.add(new THREE.Points(ptGeo, ptMat));

    // CONNECTION LINES
    const linePos = new Float32Array(COUNT * COUNT * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
    lineGeo.setDrawRange(0, 0);
    scene.add(new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: 0x0044cc, transparent: true, opacity: 0.1 })));

    // GROUND GRID
    const grid = new THREE.GridHelper(60, 40, 0x001133, 0x001133);
    grid.position.y = -6;
    grid.material.transparent = true;
    grid.material.opacity = 0.4;
    scene.add(grid);

    // BIG BACKGROUND SPHERE (campus dome feel)
    const domeMat = new THREE.MeshBasicMaterial({ color: 0x000820, transparent: true, opacity: 0.6, side: THREE.BackSide, wireframe: true });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(50, 24, 24), domeMat);
    scene.add(dome);

    let nmx = 0, nmy = 0;
    const onMove = (e) => { nmx = (e.clientX / W) * 2 - 1; nmy = -(e.clientY / H) * 2 + 1; };
    document.addEventListener("mousemove", onMove);

    let t = 0, animId;
    const loop = () => {
      animId = requestAnimationFrame(loop);
      t += 0.008;

      // animate 3D objects
      objects.forEach((o) => {
        o.mesh.position.y += Math.sin(t * o.speed * 10 + o.phase) * 0.004;
        o.mesh.rotation.y += o.rotSpeed;
        if (o.type === "atom") {
          o.mesh.rotation.x += o.rotSpeed * 0.5;
          o.mesh.rotation.z += o.rotSpeed * 0.3;
        }
      });

      // particles
      const p = ptGeo.attributes.position.array;
      for (let i = 0; i < COUNT; i++) {
        p[i * 3] += ptVel[i].x + nmx * 0.0006;
        p[i * 3 + 1] += ptVel[i].y + nmy * 0.0006;
        if (p[i * 3] > 15) p[i * 3] = -15;
        if (p[i * 3] < -15) p[i * 3] = 15;
        if (p[i * 3 + 1] > 10) p[i * 3 + 1] = -10;
        if (p[i * 3 + 1] < -10) p[i * 3 + 1] = 10;
      }
      ptGeo.attributes.position.needsUpdate = true;

      // connection lines
      let lIdx = 0;
      const lp = lineGeo.attributes.position.array;
      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          const dx = p[i*3]-p[j*3], dy = p[i*3+1]-p[j*3+1];
          if (Math.sqrt(dx*dx+dy*dy) < 3.0 && lIdx < lp.length - 5) {
            lp[lIdx++]=p[i*3]; lp[lIdx++]=p[i*3+1]; lp[lIdx++]=p[i*3+2];
            lp[lIdx++]=p[j*3]; lp[lIdx++]=p[j*3+1]; lp[lIdx++]=p[j*3+2];
          }
        }
      }
      for (let k = lIdx; k < Math.min(lIdx+6, lp.length); k++) lp[k] = 0;
      lineGeo.attributes.position.needsUpdate = true;
      lineGeo.setDrawRange(0, lIdx / 3);

      pointLight.position.x = Math.sin(t * 0.5) * 8;
      pointLight.position.z = Math.cos(t * 0.3) * 6;
      grid.position.z = Math.sin(t * 0.2) * 0.3;
      dome.rotation.y += 0.0003;

      camera.position.x += (nmx * 0.6 - camera.position.x) * 0.015;
      camera.position.y += (nmy * 0.4 + 2 - camera.position.y) * 0.015;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    loop();

    const onResize = () => {
      W = window.innerWidth; H = window.innerHeight;
      renderer.setSize(W, H); camera.aspect = W / H; camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const courses = [
    { color: "#1a78ff", name: "Object Oriented Analysis & Design", code: "CS-3001 · 3 Cr · Sec A", grade: "A", gc: "g-a" },
    { color: "#40a9ff", name: "Data Structures & Algorithms", code: "CS-2010 · 3 Cr · Sec B", grade: "B+", gc: "g-b" },
    { color: "#69c0ff", name: "Database Systems", code: "CS-2012 · 3 Cr · Sec A", grade: "A-", gc: "g-a" },
    { color: "#91d5ff", name: "Calculus & Analytical Geometry", code: "MT-1001 · 3 Cr · Sec C", grade: "B", gc: "g-b" },
    { color: "#ff4d6a", name: "Programming Fundamentals", code: "CS-1001 · 3 Cr · Sec D", grade: "C+", gc: "g-c" },
  ];

  const notices = [
    { tag: "Urgent", cls: "nt-urg", title: "Mid-Term Examination Schedule Published", date: "2025-03-18", fire: true },
    { tag: "Faculty", cls: "nt-fac", title: "OOAD Assignment 2 Deadline Extended", date: "2025-03-16 · Hamza Raheel", fire: false },
    { tag: "University", cls: "nt-uni", title: "Campus Closure — Eid-ul-Fitr Holiday", date: "2025-03-14", fire: false },
  ];

  const attendances = [
    { pct: "88%", label: "OOAD", good: true },
    { pct: "72%", label: "DSA", good: false },
    { pct: "92%", label: "DB Sys", good: true },
  ];

  return (
    <>
      <div id="cur-ring" />
      <div id="cur-dot" />
      <div className="scanlines" />
      <div className="vignette" />
      <div className="corner-tl" /><div className="corner-tr" />
      <div className="corner-bl" /><div className="corner-br" />
      <canvas id="webgl" ref={webglRef} />

      {/* INTRO */}
      <div id="intro" ref={introRef}>
        <canvas id="intro-canvas" ref={introCanvasRef} />
        <div id="intro-line" />
        <div id="intro-logo">ARCH</div>
        <div id="intro-sub">Student Portal</div>
        <div id="intro-uni">FAST National University · Lahore</div>
        <div id="intro-flash" />
      </div>

      {/* APP */}
      <div id="app" ref={appRef}>
        <nav id="sidebar" ref={sidebarRef} className={collapse ? "collapse" : ""}>
          <div className="sb-top-bar" />
          <button className = "sb-toggle" onClick={() => setCollapse(c => !c)}> {/*Sidebar Icon Button*/}
            <span/><span/><span/>
          </button> 
          <div className="sb-logo">
            <div className="logo-box">A</div>
            <div><div className="logo-name">ARCH</div><div className="logo-tagline">Student Portal</div></div>
          </div>
          <div className="sb-user hov-target">
            <div className="uav">AB</div>
            <div><div className="uname">Areeb Bucha</div><div className="uid">21K-3210</div></div>
          </div>
          {[
            ["Overview", [["⊞","Dashboard",true],["◎","Academic",false]]],
            ["Courses",[["＋","Registration",false],["◈","Grades",false],["▦","Marks",false],["✓","Attendance",false],["▤","Timetable",false]]],
            ["Communication",[["◉","Notices",false]]],
            ["Account",[["◌","Profile",false]]],
          ].map(([sec, items]) => (
            <div key={sec}>
              <div className="nav-sec">{sec}</div>
              {items.map(([ic, label, active]) => (
                <div className={`ni hov-target${active ? " active" : ""}`} key={label}>
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
            <div className="pg-title"><span>Dashboard</span></div>
            <div className="tb-r">
              <div className="sem-chip">Spring 2025</div>
              <div className="nb-btn hov-target">
                🔔
                <div className="nb-pip" />
                <div className="notif-fire">
                  <div className="nflame nf1"/><div className="nflame nf2"/><div className="nflame nf3"/>
                </div>
              </div>
            </div>
          </div>

          <div id="scroll">
            <div className="sgrid">
              {[
                { id:"sc1", cls:"sc-a", label:"Cumulative GPA", vid:"v1", did:"d1", ddcls:"d-up", special:"none" },
                { id:"sc2", cls:"sc-b", label:"Credits Done", vid:"v2", did:"d2", ddcls:"d-blue", special:"none" },
                { id:"sc3", cls:"sc-c", label:"Enrolled Courses", vid:"v3", did:"d3", ddcls:"d-up", special:"bubbles" },
                { id:"sc4", cls:"sc-d", label:"Avg Attendance", vid:"v4", did:"d4", ddcls:"d-warn", special:"fire" },
              ].map((c) => (
                <div className={`sc ${c.cls} hov-target`} id={c.id} key={c.id}>
                  <div className="sc-blob" /><div className="sc-deco" />
                  <div className="sc-label">{c.label}</div>
                  <div className="sc-val" id={c.vid}>
                    {c.vid === "v1" ? "0.00" : c.vid === "v4" ? "0%" : "0"}
                  </div>
                  <div className={`sc-delta ${c.ddcls}`} id={c.did} />
                  {c.special === "bubbles" && (
                    <div className="bubbles">
                      {[0,1,2,3,4,5,6].map(i => (
                        <span key={i} className="bubble" style={{ left:`${5+i*13}%`, animationDelay:`${i*0.3}s`, animationDuration:`${2+i*0.22}s`, width:`${6+i%3*2}px`, height:`${6+i%3*2}px` }} />
                      ))}
                    </div>
                  )}
                  {c.special === "fire" && (
                    <div className="card-fire">
                      {[0,1,2,3,4].map(i => (
                        <div key={i} className={`cflame cf${i+1}`} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="cgrid">
              <div className="glass-card hov-target" id="card1">
                <div className="card-shine"/>
                <div className="ch">
                  <div className="ct"><div className="ctbar"/>Current Courses</div>
                  <div className="ca hov-target">View grades →</div>
                </div>
                {courses.map((c,i) => (
                  <div className="crow hov-target" key={i}>
                    <div className="cdot" style={{background:c.color,boxShadow:`0 0 10px ${c.color}88`}}/>
                    <div className="cinfo"><div className="cname">{c.name}</div><div className="cmeta">{c.code}</div></div>
                    <div className={`gbadge ${c.gc}`}>{c.grade}</div>
                  </div>
                ))}
                <div className="credit-wrap">
                  <div className="credit-hd"><div className="credit-title">Credit Progress</div><div className="credit-count">86 / 136 hrs</div></div>
                  <div className="credit-track">
                    <div className="cb-done" id="bar-done"/>
                    <div className="cb-active" id="bar-active"/>
                    <div className="cb-rem"/>
                  </div>
                  <div className="credit-leg">
                    <div className="cl"><div className="cl-sw" style={{background:"#00e676"}}/>Done: 86</div>
                    <div className="cl"><div className="cl-sw" style={{background:"#1a78ff"}}/>Active: 15</div>
                    <div className="cl"><div className="cl-sw" style={{background:"rgba(255,255,255,.15)"}}/>Left: 35</div>
                  </div>
                </div>
              </div>

              <div className="rcol">
                <div className="glass-card hov-target" id="card2">
                  <div className="card-shine"/>
                  <div className="ch">
                    <div className="ct"><div className="ctbar"/>Latest Notices</div>
                    <div className="ca hov-target">All →</div>
                  </div>
                  {notices.map((n,i) => (
                    <div className="nitem hov-target" key={i}>
                      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                        <span className={`ntag ${n.cls}`}>{n.tag}</span>
                        {n.fire && (
                          <div className="inline-fire">
                            <div className="iflame if1"/><div className="iflame if2"/><div className="iflame if3"/>
                          </div>
                        )}
                      </div>
                      <div className="ntitle">{n.title}</div>
                      <div className="ndate">{n.date}</div>
                    </div>
                  ))}
                </div>

                <div className="glass-card hov-target" id="card3">
                  <div className="card-shine"/>
                  <div className="ch">
                    <div className="ct"><div className="ctbar"/>Attendance</div>
                    <div className="ca hov-target">Full report →</div>
                  </div>
                  <div className="attgrid">
                    {attendances.map((a,i) => (
                      <div className={`attmini hov-target ${a.good?"att-ok":"att-bad"}`} key={i}>
                        {a.good && (
                          <div className="att-bubbles">
                            {[0,1,2,3].map(j => <span key={j} className="att-bubble" style={{left:`${10+j*25}%`,animationDelay:`${j*0.4}s`}}/>)}
                          </div>
                        )}
                        {!a.good && (
                          <div className="widget-fire">
                            <div className="wf wf1"/><div className="wf wf2"/><div className="wf wf3"/>
                            <div className="wf wf4"/><div className="wf wf5"/>
                          </div>
                        )}
                        <div className="attpct">{a.pct}</div>
                        <div className="attlabel">{a.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="att-alert">
                    <div className="alert-fire">
                      <div className="af af1"/><div className="af af2"/><div className="af af3"/>
                    </div>
                    <span>DSA at 72% — below 75% minimum. Grade at risk.</span>
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

function countUp(id, target, dec, suffix, duration) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = Date.now();
  const tick = () => {
    const p = Math.min((Date.now() - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 4);
    el.textContent = (target * ease).toFixed(dec) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
