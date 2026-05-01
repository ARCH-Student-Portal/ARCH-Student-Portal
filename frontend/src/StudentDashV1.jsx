import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import "./StudentDashV1.css";

export default function StudentDashV1() {
  const navigate = useNavigate();
  const location = useLocation();

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

      document.querySelectorAll(".sc").forEach((el, i) => {
        gsap.to(el, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.7)", delay: i * 0.1 });
      });
      document.querySelectorAll(".glass-card").forEach((el, i) => {
        gsap.to(el, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.4)", delay: 0.2 + i * 0.1 });
      });

      countUp("v1", 3.62, 2, "", 1000);
      countUp("v2", 86, 0, "", 800);
      countUp("v3", 5, 0, "", 600);
      countUp("v4", 78, 0, "%", 800);
      
      setTimeout(() => {
        setText("d1", "↑ +0.08 this semester");
        setText("d2", "of 136 required");
        setText("d3", "courses active");
        setText("d4", "1 course at risk");
        const bd = document.getElementById("bar-done");
        const ba = document.getElementById("bar-active");
        if (bd) bd.style.width = "63%";
        if (ba) ba.style.width = "11%";
      }, 500);

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
      "MATHEMATICS","BIOLOGY","PHYSICS","COMPUTER","ARTS",
      "FAST","NUCES","PORTAL","LEARNING","FUTURE",
      "ATTENDANCE","TRANSCRIPT","CREDITS","GPA","SCHEDULE",
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
    ctx.fillStyle = "#00040e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    draw();

    const afterIntro = () => {
      cancelAnimationFrame(animId);
      sessionStorage.setItem("archIntroPlayed", "true"); 

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
      {/* ── NEW APPLE/STRIPE FLUID MESH BACKGROUND ── */}
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
        <div id="intro-sub">Student Portal</div>
        <div id="intro-uni">FAST National University · Lahore</div>
        <div id="intro-flash" />
      </div>

      {/* APP */}
      <div id="app" ref={appRef}>
        <nav id="sidebar" ref={sidebarRef} className={collapse ? "collapse" : ""}>
          <div className="sb-top-bar" />
          <button className = "sb-toggle" onClick={() => setCollapse(c => !c)}> 
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
            ["Overview", [["⊞","Dashboard","/student/dashboard"],["◎","Academic","/student/academic"]]],
            ["Courses",[["＋","Registration","/student/registration"],["◈","Transcript","/student/transcript"],["▦","Marks","/student/marks"],["✓","Attendance","/student/attendance"],["▤","Timetable","/student/timetable"]]],
            ["Communication",[["◉","Notices","/student/notices"]]],
            ["Account",[["◌","Profile","/student/profile"]]],
          ].map(([sec, items]) => (
            <div key={sec}>
              <div className="nav-sec">{sec}</div>
              {items.map(([ic, label, path]) => (
                <div 
                  className={`ni hov-target${location.pathname === path ? " active" : ""}`} 
                  key={label}
                  onClick={() => navigate(path)}
                  style={{cursor: 'pointer'}}
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
                  <div className="ca hov-target" onClick={() => navigate('/student/academic')} style={{cursor: 'pointer'}}>View grades →</div>
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
                    <div className="ca hov-target" onClick={() => navigate('/student/notices')} style={{cursor: 'pointer'}}>All →</div>
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
                    <div className="ca hov-target" onClick={() => navigate('/student/attendance')} style={{cursor: 'pointer'}}>Full report →</div>
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