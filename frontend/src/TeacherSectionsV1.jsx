import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { gsap } from "gsap";
import { motion } from "framer-motion";
import Sidebar from "./Components/shared/Sidebar";
import AnimatedCounter from "./Utilities/AnimatedCounter";
import { TEACHER_NAV } from "./config/TeacherNav";
import TeacherApi from "./config/teacherApi";

import "./TeacherDashV1.css";
import "./TeacherSections.css";

export default function TeacherSectionsV1() {
  const navigate = useNavigate();

  const webglRef       = useRef(null);
  const introCanvasRef = useRef(null);
  const introRef       = useRef(null);
  const appRef         = useRef(null);
  const sidebarRef     = useRef(null);
  const topbarRef      = useRef(null);

  const [collapse,       setCollapse]       = useState(false);
  const [showStats,      setShowStats]      = useState(false);
  const [sections,       setSections]       = useState([]);
  const [activeTab,      setActiveTab]      = useState(null);
  const [sectionDetail,  setSectionDetail]  = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [detailLoading,  setDetailLoading]  = useState(false);
  const [error,          setError]          = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    TeacherApi.getSections()
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res) ? res : res?.sections ?? res?.data ?? [];
        setSections(list);
        if (list.length > 0) setActiveTab(list[0].id ?? list[0]._id ?? list[0].sectionId);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load sections. Check connection or login.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!activeTab) return;
    let cancelled = false;
    setDetailLoading(true);
    setSectionDetail(null);

    Promise.all([
      TeacherApi.getSectionStudents(activeTab),
      TeacherApi.getGradebook(activeTab),
      TeacherApi.getAttendance(activeTab),
    ])
      .then(([studRes, gradeRes, attRes]) => {
        if (cancelled) return;

        const students = Array.isArray(studRes) ? studRes : studRes?.students ?? studRes?.data ?? [];
        const grades = Array.isArray(gradeRes) ? gradeRes : gradeRes?.gradebook ?? gradeRes?.data ?? [];
        const att = Array.isArray(attRes) ? attRes : attRes?.attendance ?? attRes?.data ?? [];

const gradeMap = {};
grades.forEach((g) => {
    const key = g.rollNumber ?? g.studentId ?? g.id;
    gradeMap[key] = g.letterGrade ?? g.grade ?? "—";
});

const attMap = {};
att.forEach((a) => {
    const key = a.studentId ?? a.rollNumber ?? a.id;
    if (a.attendancePercentage !== undefined && a.attendancePercentage !== null) {
        attMap[key] = `${a.attendancePercentage}%`;
    } else if (a.attendedLectures !== undefined && a.totalLectures !== undefined && a.totalLectures > 0) {
        attMap[key] = `${Math.round((a.attendedLectures / a.totalLectures) * 100)}%`;
    } else {
        attMap[key] = "—";
    }
});

        const merged = students.map((s) => {
    const sid    = s.rollNumber ?? s.id ?? s._id ?? s.studentId;
    const attPct = attMap[sid] ?? "—";
    const attNum = parseInt(attPct);
    const status = isNaN(attNum) ? "ok" : attNum < 70 ? "danger" : attNum < 80 ? "warn" : "ok";
    return {
        id:    sid,
        name:  s.name ?? `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim(),
        att:   attPct,
        grade: gradeMap[sid] ?? "—",
        status,
    };
});

        const totalStudents = merged.length;
        const validAtts     = merged.map((s) => parseInt(s.att)).filter((n) => !isNaN(n));
        const avgAttendance = validAtts.length
          ? Math.round(validAtts.reduce((a, b) => a + b, 0) / validAtts.length)
          : 0;

        setSectionDetail({ students: merged, totalStudents, avgAttendance });
      })
      .catch(() => {
        if (!cancelled) setSectionDetail({ students: [], totalStudents: 0, avgAttendance: 0 });
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });

    return () => { cancelled = true; };
  }, [activeTab]);

  const activeSection = sections.find((s) => (s.id ?? s._id ?? s.sectionId) === activeTab);

  useEffect(() => {
    const hasPlayedIntro = sessionStorage.getItem("archTeacherIntroPlayed");

    if (hasPlayedIntro) {
      setShowStats(true);
      if (introRef.current)   introRef.current.style.display = "none";
      if (appRef.current)     appRef.current.style.opacity = 1;
      if (sidebarRef.current) sidebarRef.current.style.transform = "translateX(0)";
      if (topbarRef.current)  topbarRef.current.style.opacity = 1;
      if (webglRef.current)   { webglRef.current.style.opacity = 0; webglRef.current.style.display = "none"; }
      return;
    }

    const canvas = introCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;

    const words = ["FACULTY","TEACHING","SYLLABUS","LECTURE","SEMESTER","RESEARCH","PUBLICATIONS","ALERTS","STUDENT","GRADES","EXAM","EVALUATION","RUBRIC","SCIENCE","ENGINEERING","FAST","NUCES","PORTAL","ACADEMIC","FUTURE"];
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
      sessionStorage.setItem("archTeacherIntroPlayed", "true");
      gsap.set(introRef.current, { display: "none" });
      gsap.to(appRef.current, { opacity: 1, duration: 0.6 });
      gsap.to(sidebarRef.current, { x: 0, duration: 1.2, ease: "expo.out", delay: 0.05 });
      gsap.to(topbarRef.current, { opacity: 1, duration: 0.7, delay: 0.4 });
      setTimeout(() => setShowStats(true), 600);
      gsap.to(webglRef.current, { opacity: 0, duration: 2.5, ease: "power2.inOut", delay: 0.5 });
      setTimeout(() => { if (webglRef.current) webglRef.current.style.display = "none"; }, 3000);
    };

    const tl = gsap.timeline({ delay: 0.4, onComplete: afterIntro });
    tl.to("#intro-line", { scaleX: 1, duration: 0.8, ease: "power3.out" }, 0)
      .to("#intro-logo", { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }, 0.5)
      .to("#intro-sub",  { opacity: 1, y: 0, duration: 0.5 }, 1.1)
      .to("#intro-logo", { scale: 50, opacity: 0, duration: 0.7, ease: "power4.in" }, 2.4)
      .to("#intro-sub",  { opacity: 0, duration: 0.3 }, 2.4)
      .to("#intro-line", { opacity: 0, duration: 0.3 }, 2.4)
      .to("#intro-flash", { opacity: 1, duration: 0.08 }, 2.85)
      .to("#intro-flash", { opacity: 0, duration: 0.4  }, 2.93)
      .to(introRef.current, { opacity: 0, duration: 0.35 }, 2.88);

    return () => cancelAnimationFrame(animId);
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem("archTeacherIntroPlayed")) return;
    const canvas = webglRef.current;
    if (!canvas) return;
    let W = window.innerWidth, H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H); renderer.setClearColor(0xf4f8ff, 1);
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 200);
    camera.position.set(0, 2, 10);
    scene.add(new THREE.AmbientLight(0x0033aa, 0.8));
    let nmx = 0, nmy = 0;
    const onMove = (e) => { nmx = (e.clientX / W) * 2 - 1; nmy = -(e.clientY / H) * 2 + 1; };
    document.addEventListener("mousemove", onMove);
    let animId;
    const loop = () => {
      animId = requestAnimationFrame(loop);
      camera.position.x += (nmx * 0.6 - camera.position.x) * 0.015;
      camera.position.y += (nmy * 0.4 + 2 - camera.position.y) * 0.015;
      camera.lookAt(0, 0, 0); renderer.render(scene, camera);
    };
    loop();
    return () => { cancelAnimationFrame(animId); document.removeEventListener("mousemove", onMove); };
  }, []);

  const getSectionLabel = (s) => s.courseCode ?? s.code ?? s.sectionCode ?? s.id ?? s._id ?? "Section";
  const getSectionName  = (s) => s.courseName ?? s.name ?? s.title ?? "Untitled Course";
  const getSectionMeta = (s) => {
    const secName = s.sectionName ? `Sec ${s.sectionName}` : "";
    const schedule = Array.isArray(s.schedule) && s.schedule.length > 0
        ? `${s.schedule[0].day} ${s.schedule[0].startTime}–${s.schedule[0].endTime}`
        : "";
    return [secName, schedule].filter(Boolean).join("  |  ");
};

  return (
    <>
      <div className="mesh-bg">
        <div className="mesh-blob blob-1" /><div className="mesh-blob blob-2" /><div className="mesh-blob blob-3" />
      </div>

      <canvas id="webgl" ref={webglRef} />

      <div id="intro" ref={introRef}>
        <canvas id="intro-canvas" ref={introCanvasRef} />
        <div id="intro-line" /><div id="intro-logo">ARCH</div>
        <div id="intro-sub">Faculty Portal</div><div id="intro-flash" />
      </div>

      <div id="app" ref={appRef}>
        <Sidebar
          ref={sidebarRef}
          sections={TEACHER_NAV}
          logoLabel="Faculty Portal"
          userName={JSON.parse(localStorage.getItem('user') || '{}').name || 'Teacher'}
          userId={JSON.parse(localStorage.getItem('user') || '{}').employeeId || ''}
          collapse={collapse}
          onToggle={() => setCollapse((c) => !c)}
        />

        <div id="main">
          <div id="topbar" ref={topbarRef}>
            <div className="tb-glow" />
            <div className="pg-title"><span>My Sections</span></div>
            <div className="tb-r">
              <motion.div whileHover={{ scale: 1.05 }} className="sem-chip">Spring 2025</motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="notif-bell">
                🔔<span className="notif-dot" />
              </motion.div>
            </div>
          </div>

          <div id="scroll">
            <div className="dash-container">

              {loading && <div className="ts-state-msg">Loading sections…</div>}
              {!loading && error && <div className="ts-state-msg ts-error">{error}</div>}
              {!loading && !error && sections.length === 0 && <div className="ts-state-msg">No sections assigned.</div>}

              {!loading && !error && sections.length > 0 && (
                <>
                  <div className="marks-tab-container">
                    {sections.map((s) => {
                      const sid = s.id ?? s._id ?? s.sectionId;
                      return (
                        <motion.button key={sid} className={`marks-tab ${activeTab === sid ? "active" : ""}`} onClick={() => setActiveTab(sid)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          {getSectionLabel(s)}
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="dash-grid">
                    <motion.div key={`left-${activeTab}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "32px" }} whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,0,0,0.12)" }}>
                      <div className="panel-header">
                        <h2 className="ct"><div className="ctbar" />Section Overview</h2>
                      </div>

                      {activeSection && (
                        <div className="ts-course-header">
                          <h3 className="ts-course-name">{getSectionName(activeSection)}</h3>
                          <p className="ts-course-code">{getSectionMeta(activeSection)}</p>
                        </div>
                      )}

                      {detailLoading ? (
                        <div className="ts-state-msg">Loading details…</div>
                      ) : sectionDetail ? (
                        <>
                          <div className="ts-viz-box">
                            <div className="ts-viz-info">
                              <div className="ts-viz-stat">
                                <div className="ts-stat-label">Total Students</div>
                                <h3>{showStats ? <AnimatedCounter value={sectionDetail.totalStudents} /> : "0"}</h3>
                              </div>
                              <div className="ts-viz-stat">
                                <div className="ts-stat-label">Avg Attendance</div>
                                <h3>
                                  {showStats ? <AnimatedCounter value={sectionDetail.avgAttendance} /> : "0"}
                                  <span style={{ fontSize: "42px", color: "var(--blue)", marginLeft: "4px" }}>%</span>
                                </h3>
                              </div>
                            </div>

                            {(() => {
                              const gradeGroups = { A: 0, B: 0, C: 0, F: 0 };
                              sectionDetail.students.forEach(({ grade }) => {
                                if (!grade || grade === "—") return;
                                const g = grade.charAt(0).toUpperCase();
                                if (g in gradeGroups) gradeGroups[g]++;
                              });
                              const max = Math.max(...Object.values(gradeGroups), 1);
                              const heights = {
                                A: `${Math.round((gradeGroups.A / max) * 90) || 5}%`,
                                B: `${Math.round((gradeGroups.B / max) * 90) || 5}%`,
                                C: `${Math.round((gradeGroups.C / max) * 90) || 5}%`,
                                F: `${Math.round((gradeGroups.F / max) * 90) || 5}%`,
                              };
                              return (
                                <div className="ts-iso-chart">
                                  {[["A", ""], ["B", "bar-b"], ["C", "bar-c"], ["F", "bar-f"]].map(([lbl, cls], i) => (
                                    <motion.div key={lbl} className={`iso-bar ${cls}`} initial={{ height: 0 }} animate={{ height: heights[lbl] }} transition={{ duration: 1, delay: 0.2 + i * 0.1 }}>
                                      <div className="iso-top" /><div className="iso-face" /><div className="iso-lbl">{lbl}</div>
                                    </motion.div>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>

                          <div className="ts-actions">
                            <motion.button className="ts-btn btn-primary" onClick={() => navigate("/teacher/attendance")} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Mark Attendance →</motion.button>
                            <motion.button className="ts-btn btn-secondary" onClick={() => navigate("/teacher/gradebook")} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Enter Grades →</motion.button>
                          </div>
                        </>
                      ) : null}
                    </motion.div>

                    <motion.div key={`right-${activeTab}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="glass-card" style={{ padding: 0, overflow: "hidden" }} whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,0,0,0.12)" }}>
                      <div className="panel-header" style={{ padding: "32px 40px 16px" }}>
                        <h2 className="ct"><div className="ctbar" />Class Roster</h2>
                      </div>

                      {detailLoading ? (
                        <div className="ts-state-msg" style={{ padding: "40px" }}>Loading roster…</div>
                      ) : sectionDetail && sectionDetail.students.length === 0 ? (
                        <div className="ts-state-msg" style={{ padding: "40px" }}>No students enrolled.</div>
                      ) : sectionDetail ? (
                        <>
                          <div className="ts-roster-header">
                            <div className="tr-id">Roll No</div>
                            <div className="tr-name">Student Identity</div>
                            <div className="tr-att">Att %</div>
                            <div className="tr-grd">Grade</div>
                          </div>
                          <div className="ts-roster-list">
                            {sectionDetail.students.map((s, i) => (
                              <motion.div className="ts-roster-row" key={s.id ?? i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }} whileHover={{ x: 6, backgroundColor: "rgba(18,78,170,.06)", borderColor: "rgba(18,78,170,.15)" }}>
                                <div className="tr-id">{s.id}</div>
                                <div className="tr-name"><div className="tr-avatar">{s.name?.charAt(0) ?? "?"}</div>{s.name}</div>
                                <div className={`tr-att status-${s.status}`}>{s.att}</div>
                                <div className="tr-grd">{s.grade}</div>
                              </motion.div>
                            ))}
                          </div>
                        </>
                      ) : null}
                    </motion.div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}