import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

export default function LoginPage() {
  const webglRef      = useRef(null);
  const introCanvasRef = useRef(null);
  const introRef      = useRef(null);
  const appRef        = useRef(null);

  const [activeTab,   setActiveTab]   = useState("student");
  const [studentId,   setStudentId]   = useState("");
  const [password,    setPassword]    = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [errorMsg,    setErrorMsg]    = useState("");

  const navigate = useNavigate();

  // ── CINEMATIC INTRO ──
  useEffect(() => {
    const canvas = introCanvasRef.current;
    const ctx    = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const words = [
      "KNOWLEDGE","GRADES","CAMPUS","LECTURE","SEMESTER",
      "THESIS","RESEARCH","LIBRARY","STUDENT","FACULTY",
      "EXAM","DEGREE","ALUMNI","SCIENCE","ENGINEERING",
      "MATHEMATICS","BIOLOGY","PHYSICS","COMPUTER","ARTS",
      "FAST","NUCES","PORTAL","LEARNING","FUTURE",
      "ATTENDANCE","TRANSCRIPT","CREDITS","GPA","SCHEDULE",
    ];

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      word: words[Math.floor(Math.random() * words.length)],
      opacity: Math.random() * 0.4 + 0.05,
      speed:   Math.random() * 0.8 + 0.2,
      size:    Math.floor(Math.random() * 10) + 10,
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

    let animId, frame = 0;
    const draw = () => {
      ctx.fillStyle = "rgba(0,4,14,0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      frame++;

      stars.forEach((s) => {
        s.opacity += s.twinkle * (Math.random() > 0.5 ? 1 : -1);
        s.opacity = Math.max(0.05, Math.min(0.8, s.opacity));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,210,255,${s.opacity})`;
        ctx.fill();
      });

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
        ctx.fillText(p.word, p.x, p.y);
      });

      const scanY = ((frame * 1.8) % (canvas.height + 60)) - 30;
      const g = ctx.createLinearGradient(0, scanY - 4, 0, scanY + 4);
      g.addColorStop(0, "transparent");
      g.addColorStop(0.5, "rgba(80,160,255,0.12)");
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(0, scanY - 4, canvas.width, 8);

      animId = requestAnimationFrame(draw);
    };
    ctx.fillStyle = "#00040e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    draw();

    const afterIntro = () => {
      cancelAnimationFrame(animId);
      gsap.set(introRef.current, { display: "none" });
      gsap.to(appRef.current, { opacity: 1, duration: 0.6 });
    };

    const tl = gsap.timeline({ delay: 0.4, onComplete: afterIntro });
    tl.to("#lp-intro-line",  { scaleX: 1, duration: 0.8, ease: "power3.out" }, 0)
      .to("#lp-intro-logo",  { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }, 0.5)
      .to("#lp-intro-logo",  { textShadow: "0 0 80px rgba(80,160,255,1), 0 0 160px rgba(40,100,255,0.8)", duration: 0.5 }, 1.0)
      .to("#lp-intro-sub",   { opacity: 1, y: 0, duration: 0.5 }, 1.1)
      .to("#lp-intro-uni",   { opacity: 1, duration: 0.4 }, 1.4)
      .to("#lp-intro-logo",  { scale: 50, opacity: 0, duration: 0.7, ease: "power4.in" }, 2.4)
      .to("#lp-intro-sub",   { opacity: 0, duration: 0.3 }, 2.4)
      .to("#lp-intro-uni",   { opacity: 0, duration: 0.3 }, 2.4)
      .to("#lp-intro-line",  { opacity: 0, duration: 0.3 }, 2.4)
      .to("#lp-intro-flash", { opacity: 1, duration: 0.08 }, 2.85)
      .to("#lp-intro-flash", { opacity: 0, duration: 0.4  }, 2.93)
      .to(introRef.current,  { opacity: 0, duration: 0.35 }, 2.88);

    return () => cancelAnimationFrame(animId);
  }, []);

  // ── THREE.JS BACKGROUND ──
  useEffect(() => {
  const canvas = webglRef.current;
  let W = window.innerWidth, H = window.innerHeight;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x00000e, 1);

  const scene  = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x00040e, 0.008);
  const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 300);
  camera.position.set(0, 2, 12);

  scene.add(new THREE.AmbientLight(0x001155, 1.2));
  const dirLight = new THREE.DirectionalLight(0x2255ff, 2.5);
  dirLight.position.set(-8, 15, 3);
  scene.add(dirLight);
  const pointLight = new THREE.PointLight(0x0033ff, 4, 40);
  pointLight.position.set(0, 5, 0);
  scene.add(pointLight);
  const pointLight2 = new THREE.PointLight(0xff2266, 2, 25);
  pointLight2.position.set(-10, -5, -5);
  scene.add(pointLight2);

  // ── SPIKY SHARDS instead of atoms ──
  const shards = [];
  const mkShard = (x, y, z, scale) => {
    const g = new THREE.Group();
    const geo = new THREE.IcosahedronGeometry(0.4 * scale, 0);
    const mat = new THREE.MeshPhongMaterial({
      color: 0x0044ff, wireframe: true,
      transparent: true, opacity: 45, lightMapIntensity: 12,
      emissive: 0x00040e, emissiveIntensity: 8, pointLight: 0x7bff24,
      shininess: 1000, wireframeLinewidth: 100
    });
    g.add(new THREE.Mesh(geo, mat));
    // inner solid
    const inner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.18 * scale, 0),
      new THREE.MeshPhongMaterial({ color: 0x113399, transparent: true, opacity: 0.6, emissive: 0x0022aa, emissiveIntensity: 1.2 })
    );
    g.add(inner);
    g.position.set(x, y, z);
    scene.add(g);
    shards.push({
      mesh: g,
      rx: (Math.random() - 0.5) * 0.03,
      ry: (Math.random() - 0.5) * 0.025,
      rz: (Math.random() - 0.5) * 0.02,
      floatSpeed: Math.random() * 0.012 + 0.005,
      floatPhase: Math.random() * Math.PI * 2,
    });
  };
  mkShard(-6, 3, -6, 2.2);
  mkShard(7, -2, -7, 2.8);
  mkShard(-3, -4, -8, 1.8);
  mkShard(4, 5, -9, 2.4);
  mkShard(0, 0, -10, 1.5);
  mkShard(-8, -1, -5, 1.3);
  mkShard(9, 2, -4, 1.6);

  // ── CHAOS PARTICLES ──
  const COUNT = 400;
  const ptPos = new Float32Array(COUNT * 3);
  const ptCol = new Float32Array(COUNT * 3);
  const ptVel = [];
  for (let i = 0; i < COUNT; i++) {
    ptPos[i*3]   = (Math.random() - 0.5) * 40;
    ptPos[i*3+1] = (Math.random() - 0.5) * 28;
    ptPos[i*3+2] = (Math.random() - 0.5) * 20 - 5;
    const speed = Math.random() * 0.018 + 0.004;
    const angle = Math.random() * Math.PI * 2;
    ptVel.push({
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
      burst: Math.random() * 300 | 0,
    });
    const t = Math.random();
    if (t < 0.3) { ptCol[i*3]=0.05; ptCol[i*3+1]=0.35; ptCol[i*3+2]=1.0; }
    else if (t < 0.55) { ptCol[i*3]=0.9; ptCol[i*3+1]=0.95; ptCol[i*3+2]=1.0; }
    else if (t < 0.75) { ptCol[i*3]=0.02; ptCol[i*3+1]=0.18; ptCol[i*3+2]=0.9; }
    else { ptCol[i*3]=0.5; ptCol[i*3+1]=0.7; ptCol[i*3+2]=1.0; }
  }
  const ptGeo = new THREE.BufferGeometry();
  ptGeo.setAttribute("position", new THREE.BufferAttribute(ptPos, 3));
  ptGeo.setAttribute("color",    new THREE.BufferAttribute(ptCol, 3));
  scene.add(new THREE.Points(ptGeo, new THREE.PointsMaterial({
    size: 0.09, transparent: true, opacity: 0.75, vertexColors: true,
  })));

  // ── DENSE CONNECTION LINES ──
  const maxLines = COUNT * COUNT;
  const linePos  = new Float32Array(maxLines * 6);
  const lineGeo  = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
  lineGeo.setDrawRange(0, 0);
  scene.add(new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
    color: 0x1155ff, transparent: true, opacity: 0.18,
  })));

  // second line layer — closer threshold, brighter
  const linePos2 = new Float32Array(maxLines * 6);
  const lineGeo2 = new THREE.BufferGeometry();
  lineGeo2.setAttribute("position", new THREE.BufferAttribute(linePos2, 3));
  lineGeo2.setDrawRange(0, 0);
  scene.add(new THREE.LineSegments(lineGeo2, new THREE.LineBasicMaterial({
    color: 0x4499ff, transparent: true, opacity: 0.32,
  })));

  // ── RANDOM STREAK LINES (static chaos) ──
  for (let s = 0; s < 18; s++) {
    const pts = [];
    let cx = (Math.random() - 0.5) * 30;
    let cy = (Math.random() - 0.5) * 20;
    const cz = (Math.random() - 0.5) * 12 - 4;
    const segs = Math.floor(Math.random() * 6) + 2;
    for (let k = 0; k <= segs; k++) {
      pts.push(new THREE.Vector3(cx, cy, cz));
      cx += (Math.random() - 0.5) * 8;
      cy += (Math.random() - 0.5) * 6;
    }
    const streakGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const alpha = Math.random() * 0.12 + 0.04;
    scene.add(new THREE.Line(streakGeo, new THREE.LineBasicMaterial({
      color: Math.random() > 0.4 ? 0x0033cc : 0x3366ff,
      transparent: true, opacity: alpha,
    })));
  }

  // ── DEBRIS PLANES ──
  for (let d = 0; d < 12; d++) {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(
        Math.random() * 2 + 0.5,
        Math.random() * 0.15 + 0.03
      ),
      new THREE.MeshBasicMaterial({
        color: 0x0044dd, transparent: true,
        opacity: Math.random() * 0.12 + 0.03,
        side: THREE.DoubleSide,
      })
    );
    mesh.position.set(
      (Math.random() - 0.5) * 24,
      (Math.random() - 0.5) * 16,
      (Math.random() - 0.5) * 10 - 3
    );
    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    scene.add(mesh);
  }

  let nmx = 0, nmy = 0;
  const onMove = (e) => { nmx = (e.clientX / W) * 2 - 1; nmy = -(e.clientY / H) * 2 + 1; };
  document.addEventListener("mousemove", onMove);

  let frame = 0, animId;
  const loop = () => {
    animId = requestAnimationFrame(loop);
    frame++;

    shards.forEach((s) => {
      s.mesh.rotation.x += s.rx;
      s.mesh.rotation.y += s.ry;
      s.mesh.rotation.z += s.rz;
      s.mesh.position.y += Math.sin(frame * s.floatSpeed + s.floatPhase) * 0.006;
    });

    const p = ptGeo.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      const v = ptVel[i];
      // occasional burst
      if (frame === v.burst) {
        const ba = Math.random() * Math.PI * 2;
        const bs = Math.random() * 0.06 + 0.02;
        v.x = Math.cos(ba) * bs;
        v.y = Math.sin(ba) * bs;
        v.burst = frame + Math.floor(Math.random() * 180) + 60;
      }
      p[i*3]   += v.x + nmx * 0.0012;
      p[i*3+1] += v.y + nmy * 0.0012;
      if (p[i*3]   >  20) p[i*3]   = -20;
      if (p[i*3]   < -20) p[i*3]   =  20;
      if (p[i*3+1] >  14) p[i*3+1] = -14;
      if (p[i*3+1] < -14) p[i*3+1] =  14;
    }
    ptGeo.attributes.position.needsUpdate = true;

    // dense lines
    let lIdx = 0;
    const lp = lineGeo.attributes.position.array;
    for (let i = 0; i < COUNT && lIdx < lp.length - 5; i++) {
      for (let j = i + 1; j < COUNT && lIdx < lp.length - 5; j++) {
        const dx = p[i*3]-p[j*3], dy = p[i*3+1]-p[j*3+1];
        if (Math.sqrt(dx*dx + dy*dy) < 5.5) {
          lp[lIdx++]=p[i*3]; lp[lIdx++]=p[i*3+1]; lp[lIdx++]=p[i*3+2];
          lp[lIdx++]=p[j*3]; lp[lIdx++]=p[j*3+1]; lp[lIdx++]=p[j*3+2];
        }
      }
    }
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.setDrawRange(0, lIdx / 3);

    // close bright lines
    let lIdx2 = 0;
    const lp2 = lineGeo2.attributes.position.array;
    for (let i = 0; i < COUNT && lIdx2 < lp2.length - 5; i++) {
      for (let j = i + 1; j < COUNT && lIdx2 < lp2.length - 5; j++) {
        const dx = p[i*3]-p[j*3], dy = p[i*3+1]-p[j*3+1];
        if (Math.sqrt(dx*dx + dy*dy) < 1.8) {
          lp2[lIdx2++]=p[i*3]; lp2[lIdx2++]=p[i*3+1]; lp2[lIdx2++]=p[i*3+2];
          lp2[lIdx2++]=p[j*3]; lp2[lIdx2++]=p[j*3+1]; lp2[lIdx2++]=p[j*3+2];
        }
      }
    }
    lineGeo2.attributes.position.needsUpdate = true;
    lineGeo2.setDrawRange(0, lIdx2 / 3);

    pointLight.position.x  = Math.sin(frame * 0.009) * 12;
    pointLight.position.z  = Math.cos(frame * 0.007) * 9;
    pointLight2.position.x = Math.cos(frame * 0.006) * 10;
    pointLight2.position.y = Math.sin(frame * 0.011) * 7 - 3;
    camera.position.x += (nmx * 1.2 - camera.position.x) * 0.018;
    camera.position.y += (nmy * 0.8 + 2 - camera.position.y) * 0.018;
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

  // ── SUBMIT HANDLER ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!studentId.trim()) { setErrorMsg("Please enter your Student ID."); return; }
    if (!password.trim())  { setErrorMsg("Please enter your password.");   return; }

    setLoading(true);
    // Simulate API call — replace with real axios call later
    await new Promise((res) => setTimeout(res, 1400));

    // No current backend failsefe check
    setLoading(false);
    navigate("/dashboard");
  };

  return (
    <>

      {/* Overlays */}
      <div className="lp-scanlines" />
      <div className="lp-vignette"  />
      <div className="lp-corner tl" />
      <div className="lp-corner tr" />
      <div className="lp-corner bl" />
      <div className="lp-corner br" />

      {/* Three.js canvas */}
      <canvas id="lp-webgl" ref={webglRef} />

      {/* Intro */}
      <div id="lp-intro" ref={introRef}>
        <canvas id="lp-intro-canvas" ref={introCanvasRef} />
        <div id="lp-intro-line"  />
        <div id="lp-intro-logo">ARCH</div>
        <div id="lp-intro-sub">Student Portal</div>
        <div id="lp-intro-uni">FAST National University · Lahore</div>
        <div id="lp-intro-flash" />
      </div>

      {/* App */}
      <div id="lp-app" ref={appRef}>
        <div className="lp-card">
          <div className="lp-top-bar"   />
          <div className="lp-card-shine"/>

          {/* Branding */}
          <div className="lp-brand">
            <div className="lp-logo-box hov-target">A</div>
            <div className="lp-brand-text">
              <div className="lp-brand-name">ARCH</div>
              <div className="lp-brand-tagline">Student Portal · FAST-NUCES</div>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="lp-tabs">
            {[
              { key: "student", label: "Student", icon: "🎓" },
              { key: "teacher", label: "Teacher", icon: "📖" },
              { key: "admin",   label: "Admin",   icon: "⚙️"  },
            ].map((t) => (
              <button
                key={t.key}
                className={`lp-tab hov-target${activeTab === t.key ? " active" : ""}`}
                onClick={() => { setActiveTab(t.key); setErrorMsg(""); }}
              >
                <span className="lp-tab-icon">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Student Form */}
          {activeTab === "student" && (
            <>
              <div className="lp-form-head">
                <div className="lp-form-title">Welcome back, <span>Scholar</span></div>
                <div className="lp-form-sub">Sign in to access your academic portal</div>
              </div>

              {errorMsg && (
                <div className="lp-error-msg">
                  <span>⚠</span> {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} autoComplete="off">
                {/* Student ID */}
                <div className="lp-field">
                  <label className="lp-label" htmlFor="sid">Student ID</label>
                  <div className="lp-input-wrap">
                    <span className="lp-input-icon">🪪</span>
                    <input
                      id="sid"
                      className={`lp-input hov-target${errorMsg && !studentId ? " error" : ""}`}
                      type="text"
                      placeholder="e.g. 21K-3210"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="lp-field">
                  <label className="lp-label" htmlFor="pw">Password</label>
                  <div className="lp-input-wrap">
                    <span className="lp-input-icon">🔒</span>
                    <input
                      id="pw"
                      className={`lp-input hov-target${errorMsg && !password ? " error" : ""}`}
                      type={showPw ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="lp-pw-toggle hov-target"
                      onClick={() => setShowPw((v) => !v)}
                      tabIndex={-1}
                    >
                      {showPw ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="lp-btn hov-target"
                  disabled={loading}
                >
                  <div className="lp-btn-shine" />
                  {loading
                    ? <><span className="lp-spinner" />Authenticating…</>
                    : "Sign In →"
                  }
                </button>
              </form>
            </>
          )}

          {/* Teacher / Admin — coming soon */}
          {(activeTab === "teacher" || activeTab === "admin") && (
            <div className="lp-coming-soon">
              <div className="lp-cs-icon">{activeTab === "teacher" ? "📖" : "⚙️"}</div>
              <div className="lp-cs-title">
                {activeTab === "teacher" ? "Teacher Portal" : "Admin Panel"} — Coming Soon
              </div>
              <div className="lp-cs-sub">This module is under development.</div>
            </div>
          )}

          {/* Footer */}
          <div className="lp-card-foot">
            Spring 2025 · FAST-NUCES Lahore · v1.0
          </div>
        </div>
      </div>
    </>
  );
}