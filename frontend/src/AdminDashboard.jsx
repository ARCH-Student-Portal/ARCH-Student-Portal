import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { gsap } from "gsap";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import Sidebar from "./Components/shared/Sidebar";
import { ADMIN_NAV } from "./config/AdminNav";
import AnimatedCounter from "./Utilities/AnimatedCounter";
import StatsGrid from "./data/StatsGrid";
import AdminApi from "./config/adminApi";
import "./AdminDashboardV1.css";

// ── FALLBACK DATA (used while loading or on error) ─────────────────────
const FALLBACK_DEPT_DATA = [
  { name: "CS",  count: 0, max: 1, color: "#1a78ff" },
  { name: "EE",  count: 0, max: 1, color: "#7c3aed" },
  { name: "MT",  count: 0, max: 1, color: "#00c96e" },
  { name: "BBA", count: 0, max: 1, color: "#ffab00" },
  { name: "IS",  count: 0, max: 1, color: "#ff4d6a" },
];

const FALLBACK_ACTIVITY = [
  { icon: "ℹ️", cls: "nt-fac", title: "No recent activity found.", time: "" },
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

  // ── API STATE ──────────────────────────────────────────────────────────
  const [dashStats, setDashStats]       = useState(null);   // from getDashboard
  const [recentStudents, setRecentStudents] = useState([]); // from getStudents
  const [announcements, setAnnouncements]   = useState([]); // from getAnnouncements
  const [deptData, setDeptData]         = useState(FALLBACK_DEPT_DATA);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  // real counts fetched independently
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [totalCourses,  setTotalCourses]  = useState(0);

  const [hasPlayedIntro] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("archAdminIntroPlayed") === "true";
    }
    return false;
  });

  const [showStats, setShowStats] = useState(hasPlayedIntro);

  // ── FETCH DASHBOARD DATA ───────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        const [dashRes, studentsRes, announcementsRes, teachersRes, coursesRes] = await Promise.all([
          AdminApi.getDashboard(),
          AdminApi.getStudents(1, 500),
          AdminApi.getAnnouncements(),
          AdminApi.getTeachers(),
          AdminApi.getCourses(1, 1),
        ]);

        // Dashboard stats
        if (dashRes && !dashRes.error) {
          setDashStats(dashRes);

          // Build dept data from dashboard response
          // Expects dashRes.departmentStats = [{ name, count }] or similar
          if (dashRes.departmentStats && Array.isArray(dashRes.departmentStats)) {
            const maxCount = Math.max(...dashRes.departmentStats.map(d => d.count), 1);
            const DEPT_COLORS = {
              CS: "#1a78ff", EE: "#7c3aed", MT: "#00c96e", BBA: "#ffab00", IS: "#ff4d6a",
            };
            setDeptData(
              dashRes.departmentStats.map(d => ({
                name:  d.name,
                count: d.count,
                max:   maxCount,
                color: DEPT_COLORS[d.name] || "#1a78ff",
              }))
            );
          }
        }

        // Recent students
        if (studentsRes && !studentsRes.error) {
          const list = Array.isArray(studentsRes)
            ? studentsRes
            : studentsRes.students || studentsRes.data || [];
          
          setRecentStudents(list.slice(0, 4));
          
          const count = studentsRes.total ?? studentsRes.totalCount ?? studentsRes.pagination?.total ?? list.length;
          setTotalStudents(count);

          // ── BUILD DEPT DATA from student records if dashboard didn't provide it ──
          if (!dashRes?.departmentStats?.length) {
            const DEPT_COLORS = {
              CS: "#1a78ff", EE: "#7c3aed", MT: "#00c96e", BBA: "#ffab00", IS: "#ff4d6a",
            };
            const deptMap = {};
            list.forEach(s => {
              const dept = s.department || s.dept || "Other";
              deptMap[dept] = (deptMap[dept] || 0) + 1;
            });
            const maxCount = Math.max(...Object.values(deptMap), 1);
            setDeptData(
              Object.entries(deptMap).map(([name, cnt]) => ({
                name,
                count: cnt,
                max: maxCount,
                color: DEPT_COLORS[name] || "#1a78ff",
              }))
            );
          }
        }

        // Teachers total count
        if (teachersRes && !teachersRes.error) {
          const list = Array.isArray(teachersRes)
            ? teachersRes
            : teachersRes.teachers || teachersRes.data || [];
          const count = teachersRes.total ?? teachersRes.totalCount ?? teachersRes.pagination?.total ?? list.length;
          setTotalTeachers(count);
        }

        // Courses total count
        if (coursesRes && !coursesRes.error) {
          const list = Array.isArray(coursesRes)
            ? coursesRes
            : coursesRes.courses || coursesRes.data || [];
          const count = coursesRes.total ?? coursesRes.totalCount ?? coursesRes.pagination?.total ?? list.length;
          setTotalCourses(count);
        }

        // Announcements → activity feed
        if (announcementsRes && !announcementsRes.error) {
          const list = Array.isArray(announcementsRes)
            ? announcementsRes
            : announcementsRes.announcements || announcementsRes.data || [];
          setAnnouncements(list);
        }
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // ── DERIVE STATS CARDS ─────────────────────────────────────────────────
  // Real counts from dedicated API calls — not reliant on dashStats shape
  const statsCards = [
    { cls: "sc-a", label: "Total Students",  value: totalStudents, special: "none",    useCommas: true },
    { cls: "sc-b", label: "Total Teachers",  value: totalTeachers, special: "bubbles" },
    { cls: "sc-c", label: "Total Courses",   value: totalCourses,  special: "none" },
  ];

  // ── DERIVE ACTIVITY FEED FROM ANNOUNCEMENTS ────────────────────────────
  const ACTIVITY_ICON_MAP = { info: "ℹ️", alert: "⚠️", success: "✅", warning: "⚠️" };
  const activityFeed = announcements.length > 0
    ? announcements.slice(0, 5).map(a => ({
        icon:  ACTIVITY_ICON_MAP[a.type] || "📣",
        cls:   a.type === "alert" ? "nt-urg" : a.type === "success" ? "nt-ok" : "nt-fac",
        title: a.title || a.message || a.content || "Announcement",
        time:  a.createdAt
          ? new Date(a.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "",
        fire:  a.type === "alert",
      }))
    : FALLBACK_ACTIVITY;

  // ── TOTAL FROM DEPT DATA ───────────────────────────────────────────────
  // Prefer API-fetched student total; fall back to summing dept data if dashboard provides it
  const totalEnrollment = totalStudents > 0
    ? totalStudents
    : deptData.reduce((sum, d) => sum + d.count, 0);

  // ── STUDENT STATUS HELPER ──────────────────────────────────────────────
  const statusCls = (status) => {
    if (!status) return "nt-fac";
    const s = status.toLowerCase();
    if (s === "active")  return "nt-ok";
    if (s === "pending") return "nt-fac";
    if (s === "dropped") return "nt-urg";
    return "nt-fac";
  };

  // ── CINEMATIC INTRO ────────────────────────────────────────────────────
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
    if (!canvas) return;
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
      .to("#intro-line", { opacity: 0, duration: 0.3 }, 2.4);

    return () => cancelAnimationFrame(animId);
  }, [hasPlayedIntro]);

  // ── RENDER ─────────────────────────────────────────────────────────────
  return (
    <div id="admin-root" className="admin-dash-wrapper">
      {/* MESH BACKGROUND */}
      <div className="mesh-bg">
        <div className="mesh-blob blob-1" />
        <div className="mesh-blob blob-2" />
        <div className="mesh-blob blob-3" />
      </div>

      {/* INTRO OVERLAY */}
      {!hasPlayedIntro && (
        <div id="intro" ref={introRef}>
          <canvas ref={introCanvasRef} id="intro-canvas" />
          <div id="intro-line" />
          <div id="intro-logo">ARCH</div>
          <div id="intro-sub">Admin Portal</div>
          <div id="intro-uni">FAST — NUCES</div>
          <div id="intro-flash" />
        </div>
      )}

      {/* APP */}
      <div id="app" ref={appRef} style={{ opacity: hasPlayedIntro ? 1 : 0 }}>
        <Sidebar
          ref={sidebarRef}
          sections={ADMIN_NAV}
          logoLabel="Admin Portal"
          userName={JSON.parse(localStorage.getItem("user") || "{}").name ?? "Admin User"}
          userId={JSON.parse(localStorage.getItem("user") || "{}").adminId ?? "admin"}          collapse={collapse}
          onToggle={() => setCollapse(c => !c)}
        />

        {/* MAIN */}
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

            {/* ERROR BANNER */}
            {error && (
              <div style={{
                background: "rgba(255,77,106,0.15)",
                border: "1px solid #ff4d6a",
                borderRadius: 10,
                padding: "12px 20px",
                marginBottom: 16,
                color: "#ff4d6a",
                fontSize: 14,
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* TOP STATS GRID */}
            <StatsGrid
              showStats={showStats}
              cards={statsCards}
            />

            {/* MAIN CONTENT GRID */}
            <div className="cgrid adm-cgrid">

              {/* LEFT COLUMN */}
              <div className="rcol" style={{ gap: "32px" }}>

                {/* Department Distribution */}
                <div
                  className="glass-card hov-target"
                  style={{ opacity: hasPlayedIntro ? 1 : 0, transform: hasPlayedIntro ? "translateY(0)" : "translateY(40px)" }}
                >
                  <div className="card-shine" />
                  <div className="ch">
                    <div className="ct"><div className="ctbar" />Enrollment by Department</div>
                    <div className="ca" style={{ fontSize: 20, fontWeight: 800 }}>
                      Total: {loading ? "…" : totalEnrollment.toLocaleString()}
                    </div>
                  </div>

                  <div className="adm-dept-list">
                    {deptData.map((d, i) => (
                      <div className="adm-dept-row" key={d.name}>
                        <div className="adm-dept-name">{d.name}</div>
                        <div className="adm-dept-bar-track">
                          <motion.div
                            className="adm-dept-bar-fill"
                            initial={{ width: 0 }}
                            animate={{ width: showStats ? `${(d.count / d.max) * 100}%` : "0%" }}
                            transition={{ duration: 1.2, delay: 0.5 + i * 0.1, ease: "easeOut" }}
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

                {/* Recent Enrollments */}
                <div
                  className="glass-card hov-target"
                  style={{ opacity: hasPlayedIntro ? 1 : 0, transform: hasPlayedIntro ? "translateY(0)" : "translateY(40px)" }}
                >
                  <div className="card-shine" />
                  <div className="ch">
                    <div className="ct"><div className="ctbar" />Recent Enrollments</div>
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
                        {loading ? (
                          <tr>
                            <td colSpan={4} style={{ textAlign: "center", opacity: 0.5, padding: "20px" }}>
                              Loading…
                            </td>
                          </tr>
                        ) : recentStudents.length === 0 ? (
                          <tr>
                            <td colSpan={4} style={{ textAlign: "center", opacity: 0.5, padding: "20px" }}>
                              No students found.
                            </td>
                          </tr>
                        ) : (
                          recentStudents.map((s, i) => (
                            <tr className="crow hov-target" key={s._id || s.id || i}>
                              <td className="td-mono">{s.rollNumber || s.roll || s.studentId || "—"}</td>
                              <td className="cname">{s.name || `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || "—"}</td>
                              <td className="cmeta">{s.program || s.degree || s.department || "—"}</td>
                              <td>
                                <span className={`ntag ${statusCls(s.status)}`}>
                                  {s.status ?? "Active"}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN */}
              <div className="rcol" style={{ gap: "32px" }}>

                {/* Quick Actions */}
                <div
                  className="glass-card hov-target"
                  style={{ opacity: hasPlayedIntro ? 1 : 0, transform: hasPlayedIntro ? "translateY(0)" : "translateY(40px)" }}
                >
                  <div className="card-shine" />
                  <div className="ch">
                    <div className="ct"><div className="ctbar" />Quick Actions</div>
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

                {/* Activity Feed — driven by announcements */}
                <div
                  className="glass-card hov-target"
                  style={{ opacity: hasPlayedIntro ? 1 : 0, transform: hasPlayedIntro ? "translateY(0)" : "translateY(40px)", flex: 1 }}
                >
                  <div className="card-shine" />
                  <div className="ch">
                    <div className="ct"><div className="ctbar" />System Activity</div>
                  </div>
                  <div className="rcol" style={{ gap: "16px", marginTop: "16px" }}>
                    {loading ? (
                      <div style={{ textAlign: "center", opacity: 0.5, padding: "20px" }}>Loading…</div>
                    ) : (
                      activityFeed.map((a, i) => (
                        <div
                          className="nitem hov-target"
                          key={i}
                          style={{ padding: "20px 24px", display: "flex", gap: "20px", alignItems: "center" }}
                        >
                          <div className="act-icon">{a.icon}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                              {a.time && (
                                <span className={`ntag ${a.cls}`} style={{ fontSize: "14px" }}>{a.time}</span>
                              )}
                              {a.fire && (
                                <div className="inline-fire">
                                  <div className="iflame if1" /><div className="iflame if2" /><div className="iflame if3" />
                                </div>
                              )}
                            </div>
                            <div className="ntitle" style={{ fontSize: "20px", lineHeight: 1.3 }}>{a.title}</div>
                          </div>
                        </div>
                      ))
                    )}
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