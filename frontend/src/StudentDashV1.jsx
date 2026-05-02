import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import "./StudentDashV1.css";
import Sidebar from "./Components/shared/Sidebar";
import { STUDENT_NAV } from "./config/studentNav";
import AnimatedCounter from "./Utilities/AnimatedCounter";
import StudentApi from "./config/studentApi";

export default function StudentDashV1() {
  const navigate = useNavigate();

  const introCanvasRef = useRef(null);
  const introRef       = useRef(null);
  const appRef         = useRef(null);
  const sidebarRef     = useRef(null);
  const topbarRef      = useRef(null);
  const [collapse, setCollapse]   = useState(false);
  const [showStats, setShowStats] = useState(false);

  const [barDone,   setBarDone]   = useState("0%");
  const [barActive, setBarActive] = useState("0%");

  const [dashData, setDashData] = useState({
    gpa: null,
    courses: [],
    notices: [],
    attendance: []
  });

  const deltas = showStats
    ? [
        dashData.gpa ? `↑ +0.08 this semester` : "",
        dashData.gpa ? `of ${dashData.gpa.totalCreditsRequired} required` : "",
        "courses active",
        dashData.attendance.some(a => a.percentage < 75) ? "1 course at risk" : ""
      ]
    : ["", "", "", ""];

  // fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [gpaRes, coursesRes, attendanceRes, announcementsRes] = await Promise.all([
          StudentApi.getGPA(),
          StudentApi.getCourses(),
          StudentApi.getAttendance(),
          StudentApi.getAnnouncements()
        ]);

        setDashData({
          gpa: gpaRes,
          courses: coursesRes.courses || [],
          attendance: attendanceRes.attendance || [],
          notices: announcementsRes.announcements || []
        });

        if (gpaRes) {
          const done   = gpaRes.creditsCompleted;
          const active = gpaRes.creditsInProgress;
          const total  = gpaRes.totalCreditsRequired;
          setBarDone(`${Math.round((done / total) * 100)}%`);
          setBarActive(`${Math.round((active / total) * 100)}%`);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      }
    };
    fetchDashboard();
  }, []);

  // intro animation
  useEffect(() => {
    const hasPlayedIntro = sessionStorage.getItem("archIntroPlayed");

    if (hasPlayedIntro) {
      introRef.current.style.display     = "none";
      appRef.current.style.opacity       = 1;
      sidebarRef.current.style.transform = "translateX(0)";
      topbarRef.current.style.opacity    = 1;
      setShowStats(true);
      return;
    }

    const canvas = introCanvasRef.current;
    const ctx    = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const words = [
      "KNOWLEDGE","GRADES","CAMPUS","LECTURE","SEMESTER",
      "THESIS","RESEARCH","LIBRARY","STUDENT","FACULTY",
      "EXAM","DEGREE","ALUMNI","SCIENCE","ENGINEERING",
      "FAST","NUCES","PORTAL","LEARNING","FUTURE",
      "ATTENDANCE","TRANSCRIPT","CREDITS","GPA","SCHEDULE",
    ];

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      word: words[Math.floor(Math.random() * words.length)],
      opacity: Math.random() * 0.4 + 0.05, speed: Math.random() * 0.8 + 0.2,
      size: Math.floor(Math.random() * 10) + 10, flicker: Math.random() * 0.025 + 0.005,
      hue: Math.random() > 0.6 ? "255,255,255" : Math.random() > 0.5 ? "100,180,255" : "60,140,255",
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
      sessionStorage.setItem("archIntroPlayed", "true");
      gsap.set(introRef.current, { display: "none" });
      gsap.to(appRef.current,     { opacity: 1, duration: 0.6 });
      gsap.to(sidebarRef.current, { x: 0, duration: 1.2, ease: "expo.out", delay: 0.05 });
      gsap.to(topbarRef.current,  { opacity: 1, duration: 0.7, delay: 0.4 });
      document.querySelectorAll(".sc").forEach((el, i) =>
        gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: "back.out(1.7)", delay: 0.6 + i * 0.1 })
      );
      document.querySelectorAll(".glass-card").forEach((el, i) =>
        gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: "back.out(1.4)", delay: 1.0 + i * 0.12 })
      );
      setTimeout(() => setShowStats(true), 650);
    };

    const tl = gsap.timeline({ delay: 0.4, onComplete: afterIntro });
    tl.to("#intro-line",  { scaleX: 1, duration: 0.8, ease: "power3.out" }, 0)
      .to("#intro-logo",  { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }, 0.5)
      .to("#intro-logo",  { textShadow: "0 0 80px rgba(80,160,255,1), 0 0 160px rgba(40,100,255,0.8)", duration: 0.5 }, 1.0)
      .to("#intro-sub",   { opacity: 1, y: 0, duration: 0.5 }, 1.1)
      .to("#intro-uni",   { opacity: 1, duration: 0.4 }, 1.4)
      .to("#intro-logo",  { scale: 50, opacity: 0, duration: 0.7, ease: "power4.in" }, 2.4)
      .to("#intro-sub",   { opacity: 0, duration: 0.3 }, 2.4)
      .to("#intro-uni",   { opacity: 0, duration: 0.3 }, 2.4)
      .to("#intro-line",  { opacity: 0, duration: 0.3 }, 2.4)
      .to("#intro-flash", { opacity: 1, duration: 0.08 }, 2.85)
      .to("#intro-flash", { opacity: 0, duration: 0.4  }, 2.93)
      .to(introRef.current, { opacity: 0, duration: 0.35 }, 2.88);

    return () => cancelAnimationFrame(animId);
  }, []);

  const avgAttendance = dashData.attendance.length > 0
    ? Math.round(dashData.attendance.reduce((sum, a) => sum + (a.percentage ?? 0), 0) / dashData.attendance.length)
    : 0;

  const STATS = [
    { id: "sc1", cls: "sc-a", label: "Cumulative GPA",  value: dashData.gpa?.cgpa ?? 0,               decimals: 2, suffix: "",  delta: deltas[0], ddcls: "d-up",   special: "none"    },
    { id: "sc2", cls: "sc-b", label: "Credits Done",     value: dashData.gpa?.creditsCompleted ?? 0,   decimals: 0, suffix: "",  delta: deltas[1], ddcls: "d-blue", special: "none"    },
    { id: "sc3", cls: "sc-c", label: "Enrolled Courses", value: dashData.courses.length,                decimals: 0, suffix: "",  delta: deltas[2], ddcls: "d-up",   special: "bubbles" },
    { id: "sc4", cls: "sc-d", label: "Avg Attendance",   value: avgAttendance,                          decimals: 0, suffix: "%", delta: deltas[3], ddcls: "d-warn", special: "fire"    },
  ];

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <>
      <div className="mesh-bg">
        <div className="mesh-blob blob-1" />
        <div className="mesh-blob blob-2" />
        <div className="mesh-blob blob-3" />
      </div>

      <div id="intro" ref={introRef}>
        <canvas id="intro-canvas" ref={introCanvasRef} />
        <div id="intro-line" />
        <div id="intro-logo">ARCH</div>
        <div id="intro-sub">Student Portal</div>
        <div id="intro-uni">FAST National University · Lahore</div>
        <div id="intro-flash" />
      </div>

      <div id="app" ref={appRef}>
        <Sidebar
          ref={sidebarRef}
          sections={STUDENT_NAV}
          logoLabel="Student Portal"
          userName={user.name || 'Student'}
          userId={user.rollNumber || ''}
          collapse={collapse}
          onToggle={() => setCollapse(c => !c)}
        />

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
              {STATS.map((c) => (
                <div className={`sc ${c.cls} hov-target`} id={c.id} key={c.id}>
                  <div className="sc-blob" /><div className="sc-deco" />
                  <div className="sc-label">{c.label}</div>
                  <div className="sc-val">
                    {showStats
                      ? <AnimatedCounter value={c.value} decimals={c.decimals} suffix={c.suffix} />
                      : (c.decimals > 0 ? "0.00" : c.suffix ? "0" + c.suffix : "0")}
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
                      {[0,1,2,3,4].map(i => <div key={i} className={`cflame cf${i+1}`} />)}
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

                {dashData.courses.map((c, i) => (
                  <div className="crow hov-target" key={i}>
                    <div className="cdot" style={{ background: '#1a78ff', boxShadow: '0 0 10px #1a78ff88' }}/>
                    <div className="cinfo">
                      <div className="cname">{c.name}</div>
                      <div className="cmeta">{c.courseCode} · {c.creditHours} Cr · Sec {c.section}</div>
                    </div>
                    <div className="gbadge">{c.letterGrade ?? '—'}</div>
                  </div>
                ))}

                <div className="credit-wrap">
                  <div className="credit-hd">
                    <div className="credit-title">Credit Progress</div>
                    <div className="credit-count">
                      {dashData.gpa?.creditsCompleted ?? 0} / {dashData.gpa?.totalCreditsRequired ?? 130} hrs
                    </div>
                  </div>
                  <div className="credit-track">
                    <div className="cb-done"  style={{ width: barDone,   transition: "width 1.8s cubic-bezier(.34,1,.64,1)" }}/>
                    <div className="cb-active" style={{ width: barActive, transition: "width 1.8s cubic-bezier(.34,1,.64,1) .15s" }}/>
                    <div className="cb-rem"/>
                  </div>
                  <div className="credit-leg">
                    <div className="cl"><div className="cl-sw" style={{background:"#00e676"}}/>Done: {dashData.gpa?.creditsCompleted ?? 0}</div>
                    <div className="cl"><div className="cl-sw" style={{background:"#1a78ff"}}/>Active: {dashData.gpa?.creditsInProgress ?? 0}</div>
                    <div className="cl"><div className="cl-sw" style={{background:"rgba(255,255,255,.15)"}}/>Left: {dashData.gpa?.creditsRemaining ?? 0}</div>
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
                  {dashData.notices.map((n, i) => (
                    <div className="nitem hov-target" key={i}>
                      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                        <span className={`ntag ${n.type === 'university' ? 'nt-univ' : 'nt-fac'}`}>{n.tag}</span>
                        {n.isPinned && (
                          <div className="inline-fire">
                            <div className="iflame if1"/><div className="iflame if2"/><div className="iflame if3"/>
                          </div>
                        )}
                      </div>
                      <div className="ntitle">{n.title}</div>
                      <div className="ndate">{new Date(n.createdAt).toISOString().split('T')[0]}</div>
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
                    {dashData.attendance.map((a, i) => (
                      <div className={`attmini hov-target ${a.percentage >= 75 ? "att-ok" : "att-bad"}`} key={i}>
                        {a.percentage >= 75 && (
                          <div className="att-bubbles">
                            {[0,1,2,3].map(j => <span key={j} className="att-bubble" style={{left:`${10+j*25}%`,animationDelay:`${j*0.4}s`}}/>)}
                          </div>
                        )}
                        {a.percentage < 75 && (
                          <div className="widget-fire">
                            <div className="wf wf1"/><div className="wf wf2"/><div className="wf wf3"/><div className="wf wf4"/><div className="wf wf5"/>
                          </div>
                        )}
                        <div className="attpct">{a.percentage ?? 0}%</div>
                        <div className="attlabel">{a.courseCode}</div>
                      </div>
                    ))}
                  </div>
                  {dashData.attendance.some(a => a.percentage < 75) && (
                    <div className="att-alert">
                      <div className="alert-fire">
                        <div className="af af1"/><div className="af af2"/><div className="af af3"/>
                      </div>
                      <span>
                        {dashData.attendance.filter(a => a.percentage < 75).map(a => a.courseCode).join(', ')} below 75% minimum. Grade at risk.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}