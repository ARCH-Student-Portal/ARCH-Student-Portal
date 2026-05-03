import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import * as THREE from "three";
import { gsap } from "gsap";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts"; 
import { motion, AnimatePresence } from "framer-motion"; 
import Sidebar from "./Components/shared/Sidebar";
import { STUDENT_NAV } from "./config/studentNav";
import StudentApi from "./config/studentApi";
import "./StudentAcademicV1.css"; 

export default function StudentAcademicV1() {
  const navigate = useNavigate();
  const location = useLocation();

  const webglRef = useRef(null);
  const introCanvasRef = useRef(null);
  const introRef = useRef(null);
  const appRef = useRef(null);
  const sidebarRef = useRef(null);
  
  const [collapse, setCollapse] = useState(false);
  const [activeTab, setActiveTab] = useState("gpa");

  // ── API STATE ──
  const [academicData, setAcademicData] = useState(null);
  const [gradeDistribution, setGradeDistribution] = useState([]);
  const [selectedSem, setSelectedSem] = useState(null);
  const [userName, setUserName] = useState("Loading...");
  const [userId, setUserId] = useState("...");
  const [loading, setLoading] = useState(true);

  // ── FETCH ALL DATA ──
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileRes, gpaRes, gradesRes] = await Promise.all([
          StudentApi.getProfile(),
          StudentApi.getGPA(),
          StudentApi.getGrades(),
        ]);

        // Profile → sidebar
        if (profileRes && profileRes.name) {
          setUserName(profileRes.name);
          setUserId(profileRes.rollNumber || profileRes.studentId || "");
        }

        // GPA → cgpa, credits, semesters
        if (gpaRes) {
          const built = {
            cgpa: gpaRes.cgpa ?? 0,
            credits: {
              done:      gpaRes.credits?.completed  ?? gpaRes.credits?.done      ?? 0,
              active:    gpaRes.credits?.inProgress ?? gpaRes.credits?.active    ?? 0,
              remaining: gpaRes.credits?.remaining  ?? 0,
              total:     gpaRes.credits?.total      ?? 0,
            },
            semesters: (gpaRes.semesters ?? []).map(sem => ({
              name:    sem.name ?? sem.semester ?? "",
              gpa:     sem.gpa  ?? 0,
              courses: (sem.courses ?? []).map(c => ({
                name:    c.name    ?? c.courseName ?? "",
                grade:   c.grade   ?? "",
                credits: c.credits ?? 3,
              })),
            })),
          };
          setAcademicData(built);
          if (built.semesters.length > 0) {
            setSelectedSem(built.semesters[built.semesters.length - 1]);
          }
        }

        // Grades → pie chart distribution
        if (gradesRes) {
          const list = Array.isArray(gradesRes) ? gradesRes : (gradesRes.grades ?? gradesRes.courses ?? []);
          const counts = {};
          list.forEach(item => {
            const grade   = item.grade ?? item.letterGrade ?? "";
            const credits = item.credits ?? item.creditHours ?? 3;
            if (grade) counts[grade] = (counts[grade] || 0) + credits;
          });
          const gradeOrder = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];
          const dist = Object.keys(counts)
            .map(grade => ({ name: grade, value: counts[grade] }))
            .sort((a, b) => gradeOrder.indexOf(a.name) - gradeOrder.indexOf(b.name));
          setGradeDistribution(dist);
        }

      } catch (err) {
        console.error("StudentAcademicV1 fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const getStanding = (gpa) => {
    if (gpa >= 3.5) return { label: "Excellent Standing", cls: "std-excel", bubble: true,  fire: false };
    if (gpa >= 2.5) return { label: "Good Standing",      cls: "std-good",  bubble: false, fire: false };
    return             { label: "At Risk",                cls: "std-risk",  bubble: false, fire: true  };
  };

  // ── CINEMATIC INTRO & FOCUS MODE TRANSITION ──
  useEffect(() => {
    const hasPlayedIntro = sessionStorage.getItem("archIntroPlayed");

    if (hasPlayedIntro) {
      introRef.current.style.display = "none";
      appRef.current.style.opacity = 1;
      sidebarRef.current.style.transform = "translateX(0)";
      
      if (webglRef.current) {
        webglRef.current.style.opacity = 0;
        webglRef.current.style.display = "none";
      }

      document.querySelectorAll(".glass-card").forEach((el, i) => {
        gsap.to(el, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: i * 0.1 });
      });
      return; 
    }

    const canvas = introCanvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const words = ["KNOWLEDGE","GRADES","CAMPUS","LECTURE","SEMESTER","THESIS","RESEARCH","LIBRARY"];
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
      
      gsap.to(webglRef.current, { opacity: 0, duration: 2.5, ease: "power2.inOut", delay: 0.5 });
      setTimeout(() => {
        if (webglRef.current) webglRef.current.style.display = "none";
      }, 3000);

      document.querySelectorAll(".glass-card").forEach((el, i) => {
        gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: "back.out(1.4)", delay: 0.2 + i * 0.1 });
      });
    };

    const tl = gsap.timeline({ delay: 0.2, onComplete: afterIntro });
    tl.to("#intro-line", { scaleX: 1, duration: 0.8, ease: "power3.out" })
      .to("#intro-logo", { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }, 0.5)
      .to("#intro-sub", { opacity: 1, y: 0, duration: 0.5 }, 1.1)
      .to("#intro-logo", { scale: 50, opacity: 0, duration: 0.7, ease: "power4.in" }, 2.4)
      .to("#intro-sub", { opacity: 0, duration: 0.3 }, 2.4)
      .to("#intro-line", { opacity: 0, duration: 0.3 }, 2.4)
      .to("#intro-flash", { opacity: 1, duration: 0.08 }, 2.85)
      .to("#intro-flash", { opacity: 0, duration: 0.4 }, 2.93)
      .to(introRef.current, { opacity: 0, duration: 0.35 }, 2.88);

    return () => cancelAnimationFrame(animId);
  }, []);

  // ── countUp triggered once academicData is ready ──
  useEffect(() => {
    if (!academicData) return;
    countUp("cgpa-val", academicData.cgpa, 2, "", 1500);
  }, [academicData]);

  // ── 3D Background (Only runs during intro) ──
  useEffect(() => {
    if (sessionStorage.getItem("archIntroPlayed")) return;

    const canvas = webglRef.current;
    if (!canvas) return;
    let W = window.innerWidth, H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H); renderer.setClearColor(0xf4f8ff, 1);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 200);
    camera.position.set(0, 2, 10);

    scene.add(new THREE.AmbientLight(0x0033aa, 0.8));
    const dirLight = new THREE.DirectionalLight(0x4488ff, 1.2); dirLight.position.set(5, 10, 5); scene.add(dirLight);

    const objects = [];
    const mkObject = (geo, mat, x, y, z, rotSpeed) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      scene.add(mesh);
      objects.push({ mesh, speed: Math.random() * 0.004 + 0.002, phase: Math.random() * Math.PI * 2, rotSpeed });
    };

    const bookGeo = new THREE.BoxGeometry(2, 0.2, 1.5);
    const bookMat = new THREE.MeshPhongMaterial({ color: 0x1155cc, transparent: true, opacity: 0.15, wireframe: true });
    mkObject(bookGeo, bookMat, -6, 3, -5, 0.005);
    mkObject(bookGeo, bookMat, 6, 1, -6, -0.003);
    mkObject(bookGeo, bookMat, -4, -4, -8, 0.004);
    mkObject(bookGeo, bookMat, 5, -3, -4, -0.006);

    const ringGeo = new THREE.TorusGeometry(1.5, 0.02, 16, 100);
    const ringMat = new THREE.MeshPhongMaterial({ color: 0x40a9ff, transparent: true, opacity: 0.3 });
    mkObject(ringGeo, ringMat, 0, 4, -9, 0.01);
    mkObject(ringGeo, ringMat, -7, -1, -6, -0.008);
    mkObject(ringGeo, ringMat, 7, 4, -7, 0.009);

    let nmx = 0, nmy = 0;
    const onMove = (e) => { nmx = (e.clientX / W) * 2 - 1; nmy = -(e.clientY / H) * 2 + 1; };
    document.addEventListener("mousemove", onMove);

    let t = 0, animId;
    const loop = () => {
      animId = requestAnimationFrame(loop); t += 0.008;
      objects.forEach((o) => {
        o.mesh.position.y += Math.sin(t * o.speed * 10 + o.phase) * 0.004;
        o.mesh.rotation.x += o.rotSpeed * 0.5;
        o.mesh.rotation.y += o.rotSpeed;
      });
      camera.position.x += (nmx * 0.6 - camera.position.x) * 0.015;
      camera.position.y += (nmy * 0.4 + 2 - camera.position.y) * 0.015;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    loop();

    return () => { cancelAnimationFrame(animId); document.removeEventListener("mousemove", onMove); };
  }, []);

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

  // ── LOADING GUARD ──
  if (loading || !academicData || !selectedSem) {
    return (
      <>
        <div className="mesh-bg">
          <div className="mesh-blob blob-1" />
          <div className="mesh-blob blob-2" />
          <div className="mesh-blob blob-3" />
        </div>
        <div id="app" style={{ opacity: 1, display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
          <div style={{ color: "#1a78ff", fontSize: "1.2rem", fontFamily: "Inter, sans-serif" }}>Loading academic data...</div>
        </div>
      </>
    );
  }

  const standing = getStanding(academicData.cgpa);

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
        <div id="intro-sub">Academic Records</div>
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
          onToggle={() => setCollapse(c => !c)}
        />

        <div id="main">
          <div id="topbar">
            <div className="pg-title"><span>Academic Overview</span></div>
          </div>

          <div id="scroll">
            <div className="tab-switcher">
              <button className={`tab-btn ${activeTab === 'gpa' ? 'active' : ''}`} onClick={() => setActiveTab('gpa')}>
                GPA Overview
              </button>
              <button className={`tab-btn ${activeTab === 'credits' ? 'active' : ''}`} onClick={() => setActiveTab('credits')}>
                Credit Progress
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'gpa' && (
                <motion.div 
                  key="gpa-tab"
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="aca-grid"
                >
                  <div className="glass-card hero-card" style={{opacity: 1, transform: 'none'}}>
                    <div className="hero-bg-glow" />
                    <div className="hero-label">Cumulative GPA</div>
                    <div className="hero-val" id="cgpa-val">{academicData.cgpa}</div>
                    <div className={`hero-standing ${standing.cls}`}>{standing.label}</div>
                    {standing.bubble && (
                      <div className="bubbles">
                        {[0,1,2,3,4,5].map(i => <span key={i} className="bubble" style={{ left:`${10+i*15}%`, animationDelay:`${i*0.3}s` }} />)}
                      </div>
                    )}
                  </div>

                  <div className="glass-card chart-card" style={{opacity: 1, transform: 'none'}}>
                    <div className="ch"><div className="ct"><div className="ctbar"/>GPA Trend</div></div>
                    <div className="chart-wrapper">
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={academicData.semesters} barSize={32}>
                          <XAxis dataKey="name" tick={{fill: '#1f4f99', fontSize: 18, fontWeight: 700, fontFamily: 'Inter, sans-serif'}} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 4]} tick={{fill: '#1f4f99', fontSize: 18, fontWeight: 700, fontFamily: 'Inter, sans-serif'}} axisLine={false} tickLine={false} />
                          <Tooltip cursor={{fill: 'rgba(20, 94, 201, 0.05)'}} contentStyle={{ borderRadius: '12px', border: '1px solid rgba(26,120,255,0.2)', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '18px', color: '#145ec9' }} />
                          <Bar 
                            dataKey="gpa" 
                            radius={[6, 6, 0, 0]} 
                            onClick={(data, index) => setSelectedSem(academicData.semesters[index])}
                          >
                            {academicData.semesters.map((entry, index) => (
                              <Cell 
                                cursor="pointer" 
                                fill={selectedSem.name === entry.name ? '#00e676' : '#1a78ff'} 
                                key={`cell-${index}`} 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="glass-card list-card" style={{opacity: 1, transform: 'none'}}>
                    <div className="sem-switcher">
                      {academicData.semesters.map((sem) => (
                        <button
                          key={sem.name}
                          className={`sem-pill ${selectedSem.name === sem.name ? 'active' : ''}`}
                          onClick={() => setSelectedSem(sem)}
                        >
                          {sem.name}
                        </button>
                      ))}
                    </div>

                    <div className="ch" style={{marginBottom: '10px'}}>
                      <div className="ct"><div className="ctbar"/>{selectedSem.name} Courses</div>
                      <div className="sem-chip">{selectedSem.gpa} GPA</div>
                    </div>

                    <div className="sem-list">
                      <AnimatePresence mode="wait">
                        <motion.div key={selectedSem.name} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                          {selectedSem.courses.map((course, i) => (
                            <div className="sem-row" key={i}>
                              <div className="sem-name">
                                {course.name} <span style={{fontSize: '18px', color: '#1f4f99', fontWeight: '600'}}>({course.credits} Cr)</span>
                              </div>
                              <div className="sem-gpa">{course.grade}</div>
                            </div>
                          ))}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'credits' && (
                <motion.div 
                  key="credits-tab"
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="credits-layout"
                >
                  <div className="glass-card full-width-card" style={{opacity: 1, transform: 'none'}}>
                    <div className="ch">
                      <div className="ct"><div className="ctbar"/>Degree Progress</div>
                      <div className="credit-total-text">{academicData.credits.done} / {academicData.credits.total} Hours</div>
                    </div>
                    
                    <div className="mega-bar-track">
                      <motion.div 
                        className="mega-bar-done" 
                        initial={{ width: 0 }} 
                        animate={{ width: `${(academicData.credits.done / academicData.credits.total) * 100}%` }} 
                        transition={{ duration: 1.2, ease: "easeOut" }} 
                      />
                      <motion.div 
                        className="mega-bar-active" 
                        initial={{ width: 0 }} 
                        animate={{ width: `${(academicData.credits.active / academicData.credits.total) * 100}%` }} 
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }} 
                      />
                      <div className="mega-bar-rem" />
                    </div>

                    <div className="mega-legend">
                      <div className="ml-item"><div className="ml-dot" style={{background: '#00e676'}}/><div className="ml-label">Completed</div><div className="ml-val">{academicData.credits.done}</div></div>
                      <div className="ml-item"><div className="ml-dot" style={{background: '#1a78ff'}}/><div className="ml-label">In Progress</div><div className="ml-val">{academicData.credits.active}</div></div>
                      <div className="ml-item"><div className="ml-dot" style={{background: '#e2e8f0'}}/><div className="ml-label">Remaining</div><div className="ml-val">{academicData.credits.remaining}</div></div>
                    </div>
                  </div>

                  <div className="glass-card full-width-card" style={{opacity: 1, transform: 'none'}}>
                    <div className="ch">
                      <div className="ct"><div className="ctbar"/>Grade Distribution</div>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '380px', width: '100%'}}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <defs>
                            <linearGradient id="grad-A" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#69f0ae" />
                              <stop offset="100%" stopColor="#00b35c" />
                            </linearGradient>
                            <linearGradient id="grad-B" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#91d5ff" />
                              <stop offset="100%" stopColor="#1a78ff" />
                            </linearGradient>
                            <linearGradient id="grad-C" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#ffcc80" />
                              <stop offset="100%" stopColor="#ff9100" />
                            </linearGradient>
                            <filter id="pie-shadow" x="-20%" y="-20%" width="140%" height="140%">
                              <feDropShadow dx="0" dy="8" stdDeviation="8" floodOpacity="0.15" />
                            </filter>
                          </defs>

                          <Pie 
                            data={gradeDistribution} 
                            dataKey="value" 
                            nameKey="name" 
                            cx="50%" 
                            cy="55%" 
                            innerRadius={80} 
                            outerRadius={120} 
                            paddingAngle={4}
                            stroke="none"
                            style={{ filter: 'url(#pie-shadow)', fontFamily: 'Inter', fontWeight: 800, fontSize: '18px', fill: '#145ec9' }} 
                            label={({name, value}) => `${name} (${value} Cr)`} 
                            labelLine={{ stroke: '#1a78ff', strokeWidth: 1, opacity: 0.5 }}
                          >
                            {gradeDistribution.map((entry, index) => {
                              let gradUrl = "url(#grad-B)";
                              if (entry.name.includes("A")) gradUrl = "url(#grad-A)";
                              if (entry.name.includes("C")) gradUrl = "url(#grad-C)";
                              return <Cell key={`cell-${index}`} fill={gradUrl} />;
                            })}
                          </Pie>
                          <Tooltip 
                            cursor={{fill: 'rgba(20, 94, 201, 0.05)'}} 
                            contentStyle={{ borderRadius: '12px', border: '1px solid rgba(26,120,255,0.2)', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '18px', color: '#145ec9' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </>
  );
}