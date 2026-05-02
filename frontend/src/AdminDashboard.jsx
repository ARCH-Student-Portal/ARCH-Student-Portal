import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import "./AdminDashboardV1.css"; // 🔥 DEDICATED, ISOLATED CSS FILE

// ── CUSTOM SMOOTH COUNTER HOOK ──
function AnimatedCounter({ value, decimals = 0, suffix = "", prefix = "", duration = 1.2, delay = 0, useCommas = false }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    let num = Number(latest);
    if (isNaN(num)) num = 0;
    let formattedStr = num.toFixed(decimals);
    if (useCommas) formattedStr = parseFloat(formattedStr).toLocaleString('en-US');
    return prefix + formattedStr + suffix;
  });

  useEffect(() => {
    const safeValue = Number(value);
    const finalValue = isNaN(safeValue) ? 0 : safeValue;
    const controls = animate(count, finalValue, { 
      duration: duration, 
      delay: delay, 
      ease: [0.34, 1.56, 0.64, 1] 
    });
    return () => controls.stop();
  }, [value, duration, delay, count]);

  return <motion.span>{rounded}</motion.span>;
}

// ── DATA ─────────────────────────────────────────────────────────────
const DEPT_DATA = [
  { name: "CS",  count: 1240, max: 1240, color: "#1a78ff" },
  { name: "EE",  count:  480, max: 1240, color: "#7c3aed" },
  { name: "MT",  count:  310, max: 1240, color: "#00c96e" },
  { name: "BBA", count:  520, max: 1240, color: "#ffab00" },
  { name: "IS",  count:  297, max: 1240, color: "#ff4d6a" },
];

const ACTIVITY = [
  { icon: "👤", cls: "nt-uni", title: "New student registered — Rida Fatima (CS)",   time: "2 mins ago" },
  { icon: "📚", cls: "nt-fac", title: "Course CS-4050 (Deep Learning) was added",     time: "18 mins ago" },
  { icon: "✏️", cls: "nt-ok",  title: "Marks uploaded for DB Systems — Sec A",        time: "45 mins ago" },
  { icon: "⚠️", cls: "nt-urg", title: "Enrollment clash flagged — 3 students",        time: "1 hr ago", fire: true },
  { icon: "🗑️", cls: "nt-urg", title: "Course EE-2001 deactivated by Dr. Shahid",    time: "3 hrs ago" },
];

export default function AdminDashboardV1() {
  const navigate = useNavigate();
  const location = useLocation();

  const introCanvasRef = useRef(null);
  const introRef = useRef(null);
  const appRef = useRef(null);
  const sidebarRef = useRef(null);
  const topbarRef = useRef(null);
  const [collapse, setCollapse] = useState(false);

  const [hasPlayedIntro] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("archAdminIntroPlayed") === "true";
    }
    return false;
  });

  const [showStats, setShowStats] = useState(hasPlayedIntro);

  // ── CINEMATIC INTRO ──
  useEffect(() => {
    if (hasPlayedIntro) {
      if (introRef.current) introRef.current.style.display = "none";
      if (appRef.current) appRef.current.style.opacity = 1;
      if (sidebarRef.current) sidebarRef.current.style.transform = "translateX(0)";
      if (topbarRef.current) topbarRef.current.style.opacity = 1;

      document.querySelectorAll(".sc").forEach((el, i) => {
        gsap.to(el, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.7)", delay: i * 0.1 });
      });
      document.querySelectorAll(".glass-card").forEach((el, i) => {
        gsap.to(el, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.4)", delay: 0.2 + i * 0.1 });
      });
      setShowStats(true);
      return; 
    }

    const canvas = introCanvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const words = [
      "ADMINISTRATION","CONTROL","RECORDS","FACULTY","STUDENTS",
      "ENROLLMENT","SYSTEMS","SECURITY","DATA","ANALYTICS",
      "FAST","NUCES","PORTAL","MANAGEMENT","DATABASE",
      "REGISTRATION","OVERSIGHT","INFRASTRUCTURE","ACCESS","GLOBAL",
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
        ctx.font = `${p.size}px 'Inter', sans-serif`;
        ctx.fillStyle = `rgba(${p.hue},${p.opacity})`;
        ctx.letterSpacing = "0.15em";
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
      sessionStorage.setItem("archAdminIntroPlayed", "true"); 

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
      
      setTimeout(() => setShowStats(true), 600);
    };

    const tl = gsap.timeline({ delay: 0.4, onComplete: afterIntro });
    tl.to("#intro-line", { scaleX: 1, duration: 0.8, ease: "power3.out" }, 0)
      .to("#intro-logo", { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }, 0.5)
      .to("#intro-logo", { textShadow: "0 0 80px rgba(80,160,255,1), 0 0 160px rgba(40,100,255,0.8), 0 0 300px rgba(0,60,200,0.5)", duration: 0.5 }, 1.0)
      .to("#intro-sub", { opacity: 1, y: 0, duration: 0.5 }, 1.1)
      .to("#intro-uni", { opacity: 1, duration: 0.4 }, 1.4)
      .to("#intro-logo", { scale: 50, opacity: 0, duration: 0.7, ease: "power4.in" }, 2.4)
      .to("#intro-sub", { opacity: 0, duration: 0.3 }, 2.4)
      .to("#intro-uni", { opacity: 0, duration: 0.3 }, 2.4)
      .to("#intro-line", { opacity: 0, duration: 0.3 }, 2.4)
      .to("#intro-flash", { opacity: 1, duration: 0.08 }, 2.85)
      .to("#intro-flash", { opacity: 0, duration: 0.4 }, 2.93)
      .to(introRef.current, { opacity: 0, duration: 0.35 }, 2.88);

    return () => cancelAnimationFrame(animId);
  }, [hasPlayedIntro]);

  return (
    /* 🔥 THE MASTER WRAPPER - STOPS CSS BLEED 🔥 */
    <div className="admin-dash-wrapper">
      
      <div className="mesh-bg">
        <div className="mesh-blob blob-1" />
        <div className="mesh-blob blob-2" />
        <div className="mesh-blob blob-3" />
      </div>

      {/* INTRO */}
      <div id="intro" ref={introRef}>
        <canvas id="intro-canvas" ref={introCanvasRef} />
        <div id="intro-line" />
        <div id="intro-logo">ARCH</div>
        <div id="intro-sub">Admin Portal</div>
        <div id="intro-uni">System Initialization</div>
        <div id="intro-flash" />
      </div>

      {/* APP */}
      <div id="app" ref={appRef} style={{ opacity: hasPlayedIntro ? 1 : 0 }}>
        
        {/* ── SIDEBAR ── */}
        <nav id="sidebar" ref={sidebarRef} className={collapse ? "collapse" : ""} style={{ transform: hasPlayedIntro ? "translateX(0)" : "translateX(-100%)" }}>
          <div className="sb-top-bar" />
          <button className="sb-toggle" onClick={() => setCollapse(c => !c)}> 
            <span/><span/><span/>
          </button> 
          <div className="sb-logo">
            <div className="logo-box">A</div>
            <div><div className="logo-name">ARCH</div><div className="logo-tagline">Admin Portal</div></div>
          </div>
          <div className="sb-user hov-target">
            <div className="uav">SA</div>
            <div><div className="uname">Super Admin</div><div className="uid">ADM-0001</div></div>
          </div>
          
          {[
            ["Overview",   [["⊞", "Dashboard",       "/admin/dashboard"]]],
            ["Management", [["👥", "Student Records", "/admin/students"],
                            ["🎓", "Teachers",        "/admin/teachers"],
                            ["📚", "Course Catalog",  "/admin/courses"],
                            ["📋", "Enrollment",      "/admin/enrollment"],
                            ["📣", "Announcements",   "/admin/announcements"]]]
          ].map(([sec, items]) => (
            <div key={sec}>
              <div className="nav-sec">{sec}</div>
              {items.map(([ic, label, path]) => (
                <div 
                  className={`ni hov-target${location.pathname === path ? " active" : ""}`} 
                  key={label}
                  onClick={() => navigate(path)}
                >
                  <div className="ni-ic">{ic}</div>{label}
                </div>
              ))}
            </div>
          ))}
          
          <div className="sb-foot">Spring 2025 · FAST-NUCES</div>
        </nav>

        {/* ── MAIN ── */}
        <div id="main">
          <div id="topbar" ref={topbarRef} style={{ opacity: hasPlayedIntro ? 1 : 0 }}>
            <div className="tb-glow" />
            <div className="pg-title"><span>Admin Dashboard</span></div>
            <div className="tb-r">
              <div className="sem-chip">Spring 2025</div>
              <div className="nb-btn hov-target">
                🔔
                <div className="nb-pip" />
              </div>
            </div>
          </div>

          <div id="scroll">
            
            {/* ── TOP STATS GRID ── */}
            <div className="sgrid">
              {[
                { id:"sc1", cls:"sc-a", label:"Total Students", val:2847, did:"d1", ddcls:"d-up", delta:"↑ 142 this semester", special:"none", comma:true, suff:"" },
                { id:"sc2", cls:"sc-b", label:"Active Courses", val:89, did:"d2", ddcls:"d-blue", delta:"↑ 6 new this term", special:"none", comma:false, suff:"" },
                { id:"sc3", cls:"sc-c", label:"Faculty Members", val:124, did:"d3", ddcls:"d-up", delta:"Stable", special:"bubbles", comma:false, suff:"" },
                { id:"sc4", cls:"sc-d", label:"Avg Attendance", val:94, did:"d4", ddcls:"d-warn", delta:"↓ 2% vs last sem", special:"fire", comma:false, suff:"%" },
              ].map((c) => (
                <div className={`sc ${c.cls} hov-target`} id={c.id} key={c.id} style={{ opacity: hasPlayedIntro ? 1 : 0, transform: hasPlayedIntro ? "translateY(0)" : "translateY(50px)" }}>
                  <div className="sc-blob" /><div className="sc-deco" />
                  <div className="sc-label">{c.label}</div>
                  <div className="sc-val">
                    {showStats ? <AnimatedCounter value={c.val} useCommas={c.comma} suffix={c.suff} /> : "0"}
                  </div>
                  <div className={`sc-delta ${c.ddcls}`}>{c.delta}</div>
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

            {/* ── MAIN CONTENT GRID ── */}
            <div className="cgrid adm-cgrid">
              
              {/* LEFT COLUMN */}
              <div className="rcol" style={{ gap: "32px" }}>
                
                {/* Department Distribution */}
                <div className="glass-card hov-target" style={{ opacity: hasPlayedIntro ? 1 : 0, transform: hasPlayedIntro ? "translateY(0)" : "translateY(40px)" }}>
                  <div className="card-shine"/>
                  <div className="ch">
                    <div className="ct"><div className="ctbar"/>Enrollment by Department</div>
                    <div className="ca" style={{ fontSize: 20, fontWeight: 800 }}>Total: 2,847</div>
                  </div>
                  
                  <div className="adm-dept-list">
                    {DEPT_DATA.map((d, i) => (
                      <div className="adm-dept-row" key={d.name}>
                        <div className="adm-dept-name">{d.name}</div>
                        <div className="adm-dept-bar-track">
                          <motion.div
                            className="adm-dept-bar-fill"
                            initial={{ width: 0 }}
                            animate={{ width: showStats ? `${(d.count / d.max) * 100}%` : "0%" }}
                            transition={{ duration: 1.2, delay: 0.5 + (i * 0.1), ease: "easeOut" }}
                            style={{ background: d.color, boxShadow: `0 0 12px ${d.color}66` }}
                          />
                        </div>
                        <div className="adm-dept-count">
                          {showStats ? <AnimatedCounter value={d.count} useCommas={true} /> : "0"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Records */}
                <div className="glass-card hov-target" style={{ opacity: hasPlayedIntro ? 1 : 0, transform: hasPlayedIntro ? "translateY(0)" : "translateY(40px)" }}>
                  <div className="card-shine"/>
                  <div className="ch">
                    <div className="ct"><div className="ctbar"/>Recent Enrollments</div>
                    <motion.button 
                      className="adm-btn-secondary" 
                      onClick={() => navigate("/admin/students")}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ padding: "10px 20px", fontSize: "16px", borderRadius: "10px" }}
                    >
                      View All →
                    </motion.button>
                  </div>
                  
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>Roll No.</th>
                          <th>Name</th>
                          <th>Program</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { roll: "24K-0421", name: "Rida Fatima",    prog: "BS-CS", status: "Active", cls: "nt-ok" },
                          { roll: "24K-0418", name: "Kamran Bashir",  prog: "BS-CS", status: "Active", cls: "nt-ok" },
                          { roll: "22K-1892", name: "Hira Noor",      prog: "BS-IS", status: "Active", cls: "nt-ok" },
                          { roll: "23K-0771", name: "Zaid Siddiqui",  prog: "BS-EE", status: "Pending", cls: "nt-fac" },
                        ].map((r, i) => (
                          <tr className="crow hov-target" key={i}>
                            <td className="td-mono">{r.roll}</td>
                            <td className="cname">{r.name}</td>
                            <td className="cmeta">{r.prog}</td>
                            <td><span className={`ntag ${r.cls}`}>{r.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN */}
              <div className="rcol" style={{ gap: "32px" }}>
                
                {/* Quick Actions */}
                <div className="glass-card hov-target" style={{ opacity: hasPlayedIntro ? 1 : 0, transform: hasPlayedIntro ? "translateY(0)" : "translateY(40px)" }}>
                  <div className="card-shine"/>
                  <div className="ch">
                    <div className="ct"><div className="ctbar"/>Quick Actions</div>
                  </div>
                  <div className="adm-quick-grid">
                    <button className="adm-quick-btn hov-target" onClick={() => navigate("/admin/students")}>
                      <div className="aq-icon">➕</div> Add Student
                    </button>
                    <button className="adm-quick-btn hov-target" onClick={() => navigate("/admin/courses")}>
                      <div className="aq-icon">📖</div> Add Course
                    </button>
                    <button className="adm-quick-btn hov-target" onClick={() => navigate("/admin/announcements")}>
                      <div className="aq-icon">📣</div> Broadcast
                    </button>
                    <button className="adm-quick-btn hov-target">
                      <div className="aq-icon">📥</div> Import CSV
                    </button>
                  </div>
                </div>

                {/* Activity Feed */}
                <div className="glass-card hov-target" style={{ opacity: hasPlayedIntro ? 1 : 0, transform: hasPlayedIntro ? "translateY(0)" : "translateY(40px)", flex: 1 }}>
                  <div className="card-shine"/>
                  <div className="ch">
                    <div className="ct"><div className="ctbar"/>System Activity</div>
                  </div>
                  <div className="rcol" style={{ gap: "16px", marginTop: "16px" }}>
                    {ACTIVITY.map((a, i) => (
                      <div className="nitem hov-target" key={i} style={{ padding: "20px 24px", display: "flex", gap: "20px", alignItems: "center" }}>
                        <div className="act-icon">{a.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                            <span className={`ntag ${a.cls}`} style={{ fontSize: "14px" }}>{a.time}</span>
                            {a.fire && (
                              <div className="inline-fire">
                                <div className="iflame if1"/><div className="iflame if2"/><div className="iflame if3"/>
                              </div>
                            )}
                          </div>
                          <div className="ntitle" style={{ fontSize: "20px", lineHeight: 1.3 }}>{a.title}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}