import StudentApi from './config/studentApi';
import TeacherApi from './config/teacherApi';
import AdminApi from './config/adminApi';
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

export default function LoginPage() {
  const webglRef       = useRef(null);
  const introCanvasRef = useRef(null);
  const introRef       = useRef(null);
  const appRef         = useRef(null);

  const [activeTab,  setActiveTab]  = useState("student");
  const [mode,       setMode]       = useState("login");   // "login" | "signup"
  const [userId,     setUserId]     = useState("");
  const [password,   setPassword]   = useState("");
  const [showPw,     setShowPw]     = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [errorMsg,   setErrorMsg]   = useState("");

  // signup-only fields — name + password only, no email
  const [signupName,    setSignupName]    = useState("");
  const [signupPw,      setSignupPw]      = useState("");
  const [signupPwConf,  setSignupPwConf]  = useState("");
  const [signupShowPw,  setSignupShowPw]  = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const navigate = useNavigate();

  const resetForms = () => {
    setUserId(""); setPassword(""); setErrorMsg("");
    setSignupName(""); setSignupPw("");
    setSignupPwConf(""); setSignupSuccess(false);
  };

  const switchMode = (m) => { setMode(m); resetForms(); };
  const switchTab  = (t) => { setActiveTab(t); resetForms(); };

  // ── CINEMATIC INTRO ──
  useEffect(() => {
    const canvas = introCanvasRef.current;
    const ctx    = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const words = [
      "TELEMETRY","ROSTER","CAMPUS","LECTURE","SEMESTER",
      "RECORDS","RESEARCH","LIBRARY","STUDENT","FACULTY",
      "ATTENDANCE","TRANSCRIPT","CREDITS","GPA","SCHEDULE",
    ];
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
      stars.forEach((s) => {
        s.opacity += s.twinkle * (Math.random() > 0.5 ? 1 : -1);
        s.opacity = Math.max(0.05, Math.min(0.8, s.opacity));
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,210,255,${s.opacity})`; ctx.fill();
      });
      particles.forEach((p) => {
        p.y -= p.speed * 0.4;
        p.opacity += p.flicker * (Math.random() > 0.5 ? 1 : -1);
        p.opacity = Math.max(0.03, Math.min(0.55, p.opacity));
        if (p.y < -30) { p.y = canvas.height + 20; p.x = Math.random() * canvas.width; p.word = words[Math.floor(Math.random() * words.length)]; }
        ctx.font = `${p.size}px 'Inter', sans-serif`;
        ctx.fillStyle = `rgba(${p.hue},${p.opacity})`;
        ctx.fillText(p.word, p.x, p.y);
      });
      const scanY = ((frame * 1.8) % (canvas.height + 60)) - 30;
      const g = ctx.createLinearGradient(0, scanY - 4, 0, scanY + 4);
      g.addColorStop(0, "transparent"); g.addColorStop(0.5, "rgba(80,160,255,0.12)"); g.addColorStop(1, "transparent");
      ctx.fillStyle = g; ctx.fillRect(0, scanY - 4, canvas.width, 8);
      animId = requestAnimationFrame(draw);
    };
    ctx.fillStyle = "#00040e"; ctx.fillRect(0, 0, canvas.width, canvas.height); draw();

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
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x010308, 1);
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x010308, 0.015);
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 300);
    camera.position.set(0, 15, 30); camera.lookAt(0, 0, 0);
    const segmentsX = 90, segmentsZ = 60;
    const geo = new THREE.PlaneGeometry(180, 120, segmentsX, segmentsZ);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position.array;
    const origY = new Float32Array(pos.length / 3);
    const colors = new Float32Array(pos.length);
    for (let i = 0; i < pos.length; i += 3) {
      let x = pos[i], z = pos[i + 2];
      let y = (Math.sin(x * 0.05) + Math.cos(z * 0.05)) * 2 + Math.sin(x * 0.1 + z * 0.1);
      pos[i + 1] = y; origY[i / 3] = y;
      colors[i] = 0.05; colors[i + 1] = 0.15; colors[i + 2] = 0.3;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const wireMat = new THREE.MeshBasicMaterial({ wireframe: true, color: 0x1a78ff, transparent: true, opacity: 0.12 });
    const mesh = new THREE.Mesh(geo, wireMat); scene.add(mesh);
    const ptsMat = new THREE.PointsMaterial({ size: 0.25, vertexColors: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending });
    const pts = new THREE.Points(geo, ptsMat); scene.add(pts);
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-100, -100);
    const intersectPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const mouseWorld = new THREE.Vector3();
    const onMove = (e) => { mouse.x = (e.clientX / W) * 2 - 1; mouse.y = -(e.clientY / H) * 2 + 1; };
    document.addEventListener("mousemove", onMove);
    let frame = 0, animId;
    const loop = () => {
      animId = requestAnimationFrame(loop); frame++;
      const time = frame * 0.02;
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(intersectPlane, mouseWorld);
      const sweepZ = (time * 12) % 180 - 90;
      for (let i = 0; i < pos.length; i += 3) {
        let x = pos[i], z = pos[i + 2], idx = i / 3;
        let dMouse = Math.hypot(x - mouseWorld.x, z - mouseWorld.z);
        let mElev = Math.max(0, 15 - dMouse) * 0.4;
        let dSweep = Math.abs(z - sweepZ);
        let sElev = Math.max(0, 4 - dSweep) * 0.8;
        let breathe = Math.sin(time + x * 0.1) * 0.5;
        pos[i + 1] = origY[idx] + mElev + sElev + breathe;
        if (dMouse < 15 || dSweep < 4) {
          let intensity = Math.min(1, Math.max(0, 1 - dMouse / 15) + Math.max(0, 1 - dSweep / 4));
          colors[i] = 0.05 + 0.85 * intensity; colors[i + 1] = 0.15 + 0.85 * intensity; colors[i + 2] = 0.30 + 0.70 * intensity;
        } else { colors[i] = 0.02; colors[i + 1] = 0.08; colors[i + 2] = 0.2; }
      }
      geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true;
      camera.position.x += (mouse.x * 5 - camera.position.x) * 0.02; camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    loop();
    const onResize = () => { W = window.innerWidth; H = window.innerHeight; renderer.setSize(W, H); camera.aspect = W / H; camera.updateProjectionMatrix(); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); document.removeEventListener("mousemove", onMove); window.removeEventListener("resize", onResize); };
  }, []);

  // ── LOGIN SUBMIT ──
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!userId.trim())   { setErrorMsg(`[ERR] Required: ${activeTab === "student" ? "Student" : activeTab === "teacher" ? "Faculty" : "Admin"} ID`); return; }
    if (!password.trim()) { setErrorMsg("[ERR] Required: Security Passcode"); return; }
    setLoading(true);
    try {
      let response;
      if (activeTab === "student") response = await StudentApi.login(userId, password);
      else if (activeTab === "teacher") response = await TeacherApi.login(userId, password);
      else if (activeTab === "admin")   response = await AdminApi.login(userId, password);

      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', activeTab);
        localStorage.setItem('user', JSON.stringify(response.student || response.teacher || response.admin));
        if (activeTab === "student") navigate("/student/dashboard");
        if (activeTab === "teacher") navigate("/teacher/dashboard");
        if (activeTab === "admin")   navigate("/admin/dashboard");
      } else {
        setErrorMsg(`[ERR] ${response.message || 'Authentication failed'}`);
      }
    } catch {
      setErrorMsg("[ERR] Connection failed — check server status");
    } finally {
      setLoading(false);
    }
  };

  // ── SIGNUP SUBMIT — name + password only ──
  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!signupName.trim()) { setErrorMsg("[ERR] Required: Full name");  return; }
    if (!signupPw.trim())   { setErrorMsg("[ERR] Required: Password");    return; }
    if (signupPw !== signupPwConf) { setErrorMsg("[ERR] Passwords do not match"); return; }
    if (signupPw.length < 6) { setErrorMsg("[ERR] Password min 6 characters"); return; }

    setLoading(true);
    try {
      const res = await StudentApi.signup(signupName.trim(), signupPw);

      if (res.message && !res.error) {
        setSignupSuccess(true);
      } else {
        setErrorMsg(`[ERR] ${res.message || 'Signup failed'}`);
      }
    } catch {
      setErrorMsg("[ERR] Connection failed — check server status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="lp-scanlines" />
      <div className="lp-vignette"  />
      <canvas id="lp-webgl" ref={webglRef} />

      <div id="lp-intro" ref={introRef}>
        <canvas id="lp-intro-canvas" ref={introCanvasRef} />
        <div id="lp-intro-line"  />
        <div id="lp-intro-logo">ARCH</div>
        <div id="lp-intro-sub">System Initialization</div>
        <div id="lp-intro-uni">FAST National University · Lahore</div>
        <div id="lp-intro-flash" />
      </div>

      <div id="lp-app" ref={appRef}>
        <div className="lp-hud-terminal">

          <div className="lp-hud-decor-top">
            <span>{mode === "login" ? "SYS.REQ.001" : "SYS.REG.001"}</span>
            <span className="lp-hud-blinker"></span>
          </div>

          <div className="lp-hud-header">
            <h2>{mode === "login" ? "ARCH.TELEMETRY" : "ARCH.REGISTER"}</h2>
            <p>LAT: 31.4811 N // LON: 74.3030 E</p>
          </div>

          {/* tabs — only on login, signup is student-only */}
          {mode === "login" && (
            <div className="lp-hud-tabs">
              {["student", "teacher", "admin"].map((tab) => (
                <button key={tab} type="button"
                  className={`lp-hud-tab ${activeTab === tab ? "active" : ""}`}
                  onClick={() => switchTab(tab)}
                >
                  [{tab}]
                </button>
              ))}
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {mode === "login" && (
            <form className="lp-hud-form" onSubmit={handleLogin} autoComplete="off">
              {errorMsg && <div className="lp-hud-error">{errorMsg}</div>}

              <div className="lp-hud-field">
                <label htmlFor="uid">
                  U/ID {activeTab === "student" ? "(STUDENT)" : activeTab === "teacher" ? "(FACULTY)" : "(ADMIN)"}
                </label>
                <input id="uid" type="text"
                  className={errorMsg && !userId ? "error" : ""}
                  placeholder={activeTab === "student" ? "21K-3210" : activeTab === "teacher" ? "FAC-092" : "ADM-0001"}
                  value={userId} onChange={(e) => setUserId(e.target.value)}
                  autoComplete="off" spellCheck={false}
                />
              </div>

              <div className="lp-hud-field">
                <label htmlFor="pw">PASS_KEY</label>
                <div className="lp-hud-pw-wrap">
                  <input id="pw" type={showPw ? "text" : "password"}
                    className={errorMsg && !password ? "error" : ""}
                    placeholder="Enter decryption key"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" className="lp-hud-toggle" onClick={() => setShowPw(!showPw)} tabIndex={-1}>
                    {showPw ? "X" : "O"}
                  </button>
                </div>
              </div>

              <button type="submit" className="lp-hud-btn" disabled={loading}>
                {loading ? "AUTHENTICATING..." : "INITIATE_UPLINK()"}
              </button>

              {/* signup link — student tab only */}
              {activeTab === "student" && (
                <div className="lp-hud-switch">
                  <span>No account?</span>
                  <button type="button" className="lp-hud-switch-btn" onClick={() => switchMode("signup")}>
                    REQUEST_ACCESS()
                  </button>
                </div>
              )}
            </form>
          )}

          {/* ── SIGNUP FORM — name + password only ── */}
          {mode === "signup" && (
            <form className="lp-hud-form" onSubmit={handleSignup} autoComplete="off">
              {errorMsg && <div className="lp-hud-error">{errorMsg}</div>}

              {signupSuccess ? (
                <div className="lp-hud-success">
                  <div className="lp-hud-success-icon">✓</div>
                  <div>REQUEST TRANSMITTED</div>
                  <div style={{ fontSize: 13, marginTop: 8, opacity: 0.7 }}>
                    Await admin approval. You will be assigned a roll number upon activation.
                  </div>
                  <button type="button" className="lp-hud-btn" style={{ marginTop: 20 }} onClick={() => switchMode("login")}>
                    RETURN_TO_LOGIN()
                  </button>
                </div>
              ) : (
                <>
                  <div className="lp-hud-field">
                    <label>FULL_NAME</label>
                    <input type="text" placeholder="Muhammad Ali Khan"
                      value={signupName} onChange={(e) => setSignupName(e.target.value)}
                      autoComplete="off" spellCheck={false}
                    />
                  </div>

                  <div className="lp-hud-field">
                    <label>PASS_KEY</label>
                    <div className="lp-hud-pw-wrap">
                      <input type={signupShowPw ? "text" : "password"}
                        placeholder="Min 6 characters"
                        value={signupPw} onChange={(e) => setSignupPw(e.target.value)}
                      />
                      <button type="button" className="lp-hud-toggle" onClick={() => setSignupShowPw(s => !s)} tabIndex={-1}>
                        {signupShowPw ? "X" : "O"}
                      </button>
                    </div>
                  </div>

                  <div className="lp-hud-field">
                    <label>CONFIRM_KEY</label>
                    <div className="lp-hud-pw-wrap">
                      <input type={signupShowPw ? "text" : "password"}
                        placeholder="Repeat password"
                        value={signupPwConf} onChange={(e) => setSignupPwConf(e.target.value)}
                      />
                    </div>
                  </div>

                  <button type="submit" className="lp-hud-btn" disabled={loading}>
                    {loading ? "TRANSMITTING..." : "SUBMIT_REQUEST()"}
                  </button>

                  <div className="lp-hud-switch">
                    <span>Have account?</span>
                    <button type="button" className="lp-hud-switch-btn" onClick={() => switchMode("login")}>
                      RETURN_TO_LOGIN()
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          <div className="lp-hud-footer">
            <span>v2.0.4</span>
            <span>SECURE CONNECTION</span>
          </div>
        </div>
      </div>
    </>
  );
}