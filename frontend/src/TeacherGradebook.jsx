import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Components/shared/Sidebar";
import { TEACHER_NAV } from "./config/TeacherNav";
import AnimatedCounter from "./Utilities/AnimatedCounter";
import TeacherApi from "./config/teacherApi";
import "./TeacherDashV1.css";
import "./TeacherGradebook.css";

function computeTotal(scores, assessments) {
  return assessments.reduce((sum, a) => {
    const v = scores[a.key];
    return sum + (v !== null && v !== "" ? Number(v) : 0);
  }, 0);
}
function maxTotal(assessments) {
  return assessments.reduce((s, a) => s + a.max, 0);
}
function getGrade(pct) {
  if (pct >= 90) return "A+";
  if (pct >= 85) return "A";
  if (pct >= 80) return "B+";
  if (pct >= 70) return "B";
  if (pct >= 65) return "C+";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  return "F";
}
function gradeClass(g) {
  return "grade-" + g.replace("+", "-plus");
}

function normalizeSections(sectionsArr, gradebooksMap) {
  const out = {};
  sectionsArr.forEach((sec) => {
    const gb = gradebooksMap[sec.id] || {};
    const assessments = gb.assessments || [
      { key: "q1",    label: "Q1",   max: 10 },
      { key: "q2",    label: "Q2",   max: 10 },
      { key: "asgn",  label: "ASGN", max: 20 },
      { key: "mid",   label: "MID",  max: 30 },
      { key: "final", label: "FIN",  max: 50 },
    ];
    const students = (gb.students || []).map((s) => ({
      id:     s.id       || s.studentId || s.rollNo || "–",
      name:   s.name     || s.studentName || "Unknown",
      init:   s.init     || ((s.name || "??").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()),
      att:    s.att      || s.attendance || "–",
      attCls: s.attCls   || (
        parseFloat(s.att || s.attendance) >= 85 ? "att-ok" :
        parseFloat(s.att || s.attendance) >= 70 ? "att-warn" : "att-bad"
      ),
      scores: s.scores   || assessments.reduce((acc, a) => ({ ...acc, [a.key]: null }), {}),
    }));
    out[sec.id] = {
      name:        sec.name        || sec.courseName || sec.id,
      code:        sec.code        || `${sec.id} · Sec ${sec.section || "A"}`,
      assessments,
      students,
    };
  });
  return out;
}

export default function TeacherGradebook() {
  const webglRef       = useRef(null);
  const introCanvasRef = useRef(null);
  const introRef       = useRef(null);
  const appRef         = useRef(null);
  const topbarRef      = useRef(null);

  const [collapse,    setCollapse]    = useState(false);
  const [showStats,   setShowStats]   = useState(false);
  const [introPlayed, setIntroPlayed] = useState(
    () => !!sessionStorage.getItem("archTeacherIntroPlayed")
  );

  const [sectionsData,   setSectionsData]   = useState({});
  const [loading,        setLoading]        = useState(true);
  const [apiError,       setApiError]       = useState(null);
  const [activeSection,  setActiveSection]  = useState(null);
  const [scores,         setScores]         = useState({});
  const [unsaved,        setUnsaved]        = useState(false);
  const [showToast,      setShowToast]      = useState(false);
  const [toastMsg,       setToastMsg]       = useState("Grades synced to secure server");
  const [search,         setSearch]         = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setApiError(null);
      try {
        const sectionsRes = await TeacherApi.getSections();
        const sectionsArr = Array.isArray(sectionsRes)
          ? sectionsRes
          : sectionsRes.data || sectionsRes.sections || [];

        if (!sectionsArr.length) {
          if (!cancelled) { setSectionsData({}); setLoading(false); }
          return;
        }

        const gbResults = await Promise.allSettled(
          sectionsArr.map((s) => TeacherApi.getGradebook(s.id))
        );

        const gradebooksMap = {};
        sectionsArr.forEach((s, i) => {
          const res = gbResults[i];
          if (res.status === "fulfilled") {
            gradebooksMap[s.id] = res.value?.data || res.value || {};
          }
        });

        const normalized = normalizeSections(sectionsArr, gradebooksMap);

        const scoresInit = {};
        Object.entries(normalized).forEach(([secId, data]) => {
          scoresInit[secId] = {};
          data.students.forEach((s) => {
            scoresInit[secId][s.id] = { ...s.scores };
          });
        });

        if (!cancelled) {
          setSectionsData(normalized);
          setScores(scoresInit);
          setActiveSection(Object.keys(normalized)[0] || null);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setApiError(err.message || "Failed to load gradebook");
          setLoading(false);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const sectionData = activeSection ? sectionsData[activeSection] : null;
  const assessments = sectionData?.assessments || [];
  const maxPts      = maxTotal(assessments);

  const students = (sectionData?.students || []).filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleScore = useCallback((studentId, key, val, max) => {
    const num = val === "" ? null : Math.min(Number(val), max);
    setScores((prev) => ({
      ...prev,
      [activeSection]: {
        ...prev[activeSection],
        [studentId]: { ...prev[activeSection][studentId], [key]: num },
      },
    }));
    setUnsaved(true);
  }, [activeSection]);

  const handleSave = async () => {
    if (!activeSection) return;
    try {
      const payload = Object.entries(scores[activeSection]).map(([studentId, s]) => ({
        studentId,
        scores: s,
      }));
      await TeacherApi.updateGrades(activeSection, { grades: payload });
      setUnsaved(false);
      setToastMsg("Grades synced to secure server");
    } catch {
      setToastMsg("Save failed — check connection");
    } finally {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    }
  };

  const handleExport = () => {
    if (!sectionData) return;
    const headers = ["Roll No.", "Student", ...assessments.map((a) => a.label), "Total", "Grade"];
    const rows = students.map((s) => {
      const rowScores = scores[activeSection]?.[s.id] || {};
      const total = computeTotal(rowScores, assessments);
      const pct   = (total / maxPts) * 100;
      return [s.id, s.name, ...assessments.map((a) => rowScores[a.key] ?? ""), total, getGrade(pct)];
    });
    const csv  = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `gradebook_${activeSection}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const distribution = (() => {
    let A=0, B=0, C=0, DF=0;
    students.forEach((s) => {
      const total = computeTotal(scores[activeSection]?.[s.id] || {}, assessments);
      const pct   = (total / maxPts) * 100;
      const g     = getGrade(pct);
      if      (g === "A+" || g === "A") A++;
      else if (g === "B+" || g === "B") B++;
      else if (g === "C+" || g === "C") C++;
      else                              DF++;
    });
    const n = students.length || 1;
    return { A, B, C, DF, n };
  })();

  const avgScore = (() => {
    if (!students.length || !activeSection) return 0;
    const sum = students.reduce((acc, s) => acc + computeTotal(scores[activeSection]?.[s.id] || {}, assessments), 0);
    return (sum / students.length / maxPts) * 100;
  })();

  const highestScore = (() => {
    if (!students.length || !activeSection) return 0;
    return students.reduce((mx, s) => {
      const t = computeTotal(scores[activeSection]?.[s.id] || {}, assessments);
      return t > mx ? t : mx;
    }, 0);
  })();

  const passingCount = students.filter((s) => {
    const pct = (computeTotal(scores[activeSection]?.[s.id] || {}, assessments) / maxPts) * 100;
    return pct >= 50;
  }).length;

  // ── CINEMATIC INTRO ── (introPlayed in dep array fixes the exhaustive-deps warning)
  useEffect(() => {
    if (introPlayed) { setShowStats(true); return; }
    const canvas = introCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const words = ["FACULTY","TEACHING","SYLLABUS","LECTURE","SEMESTER","RESEARCH","PUBLICATIONS","ALERTS","STUDENT","GRADES","EXAM","EVALUATION","RUBRIC"];
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
        if (p.y < -30) { p.y = canvas.height + 20; p.x = Math.random() * canvas.width; p.word = words[Math.floor(Math.random() * words.length)]; }
        ctx.font = `${p.size}px 'Inter', sans-serif`;
        ctx.fillStyle = `rgba(${p.hue},${p.opacity})`;
        ctx.fillText(p.word, p.x, p.y);
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    const afterIntro = () => {
      cancelAnimationFrame(animId);
      sessionStorage.setItem("archTeacherIntroPlayed", "true");
      setIntroPlayed(true);
      if (appRef.current)    gsap.to(appRef.current,    { opacity: 1, duration: 0.6 });
      if (topbarRef.current) gsap.to(topbarRef.current, { opacity: 1, duration: 0.7 });
      setTimeout(() => setShowStats(true), 600);
      if (webglRef.current) {
        gsap.to(webglRef.current, { opacity: 0, duration: 2.5, ease: "power2.inOut", delay: 0.5 });
        setTimeout(() => { if (webglRef.current) webglRef.current.style.display = "none"; }, 3000);
      }
    };
    const tl = gsap.timeline({ delay: 0.4, onComplete: afterIntro });
    if (introRef.current) {
      tl.to("#intro-line", { scaleX: 1, duration: 0.8, ease: "power3.out" }, 0)
        .to("#intro-logo", { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }, 0.5)
        .to("#intro-logo", { scale: 50, opacity: 0, duration: 0.7, ease: "power4.in" }, 2.4)
        .to("#intro-line", { opacity: 0, duration: 0.3 }, 2.4)
        .to(introRef.current, { opacity: 0, duration: 0.35 }, 2.88);
    } else { afterIntro(); }
    return () => cancelAnimationFrame(animId);
  }, [introPlayed]);

  useEffect(() => {
    if (introPlayed) return;
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
  }, [introPlayed]);

  return (
    <>
      <div className="mesh-bg">
        <div className="mesh-blob blob-1" /><div className="mesh-blob blob-2" /><div className="mesh-blob blob-3" />
      </div>

      <canvas id="webgl" ref={webglRef} style={{ display: introPlayed ? "none" : undefined }} />

      {!introPlayed && (
        <div id="intro" ref={introRef}>
          <canvas id="intro-canvas" ref={introCanvasRef} />
          <div id="intro-line" />
          <div id="intro-logo">ARCH</div>
        </div>
      )}

      <div id="app" ref={appRef} style={{ opacity: 1 }}>
        <Sidebar
          sections={TEACHER_NAV}
          logoLabel="Faculty Portal"
          userName="Dr. Ahmed"
          userId="EMP-8492"
          collapse={collapse}
          onToggle={() => setCollapse((c) => !c)}
        />

        <div id="main">
          <div id="topbar" ref={topbarRef}>
            <div className="tb-glow" />
            <div className="pg-title"><span>Gradebook</span></div>
            <div className="tb-r">
              <AnimatePresence>
                {unsaved && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="gb-unsaved-badge">
                    <span className="gb-unsaved-dot" />UNSAVED CHANGES
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div whileHover={{ scale: 1.05 }} className="sem-chip">Spring 2025</motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="notif-bell">
                🔔<span className="notif-dot" />
              </motion.div>
            </div>
          </div>

          <div id="scroll">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="dash-container">

              {loading && (
                <div style={{ padding: "60px", textAlign: "center", color: "var(--dimmer)", fontSize: 16 }}>Loading gradebook…</div>
              )}
              {!loading && apiError && (
                <div style={{ padding: "60px", textAlign: "center", color: "#ff4d6a", fontSize: 15 }}>⚠ {apiError}</div>
              )}
              {!loading && !apiError && !activeSection && (
                <div style={{ padding: "60px", textAlign: "center", color: "var(--dimmer)", fontSize: 15 }}>No sections assigned.</div>
              )}

              {!loading && !apiError && activeSection && sectionData && (
                <>
                  <div className="gb-controls">
                    <div className="marks-tab-container">
                      {Object.keys(sectionsData).map((sec) => (
                        <motion.button key={sec} className={`marks-tab ${activeSection === sec ? "active" : ""}`} onClick={() => { setActiveSection(sec); setSearch(""); }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          {sec}
                        </motion.button>
                      ))}
                    </div>
                    <div className="gb-right-controls">
                      <div className="gb-search">
                        <span>🔍</span>
                        <input placeholder="Search student…" value={search} onChange={(e) => setSearch(e.target.value)} />
                      </div>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="gb-btn-export" onClick={handleExport}>↓ Export CSV</motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`gb-btn-save ${unsaved ? "active-save" : ""}`} onClick={handleSave} disabled={!unsaved}>✓ Save Grades</motion.button>
                    </div>
                  </div>

                  <div className="gb-summary">
                    <motion.div className="glass-card gb-stat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                      <div className="gb-stat-label">Class Average</div>
                      <div className={`gb-stat-value ${parseFloat(avgScore) >= 70 ? "green" : parseFloat(avgScore) >= 50 ? "amber" : "red"}`}>
                        {showStats ? <AnimatedCounter value={avgScore} decimals={1} suffix="%" /> : "0.0%"}
                      </div>
                      <div className="gb-stat-sub">out of {maxPts} pts</div>
                    </motion.div>
                    <motion.div className="glass-card gb-stat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                      <div className="gb-stat-label">Students</div>
                      <div className="gb-stat-value">{showStats ? <AnimatedCounter value={sectionData.students.length} /> : "0"}</div>
                      <div className="gb-stat-sub">{sectionData.code}</div>
                    </motion.div>
                    <motion.div className="glass-card gb-stat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                      <div className="gb-stat-label">Passing</div>
                      <div className="gb-stat-value green">{showStats ? <AnimatedCounter value={passingCount} /> : "0"}</div>
                      <div className="gb-stat-sub">≥ 50% threshold</div>
                    </motion.div>
                    <motion.div className="glass-card gb-stat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                      <div className="gb-stat-label">Highest Score</div>
                      <div className="gb-stat-value">{showStats ? <AnimatedCounter value={highestScore} /> : "0"}</div>
                      <div className="gb-stat-sub">out of {maxPts} pts</div>
                    </motion.div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div key={activeSection} className="glass-card gb-table-wrap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                      <div className="panel-header" style={{ marginBottom: "24px" }}>
                        <h2 className="ct"><div className="ctbar" />Assessment Entry</h2>
                      </div>
                      <div className="gb-table-head">
                        <div className="gb-col-hd left">Roll No.</div>
                        <div className="gb-col-hd left">Student Identity</div>
                        {assessments.map((a) => (
                          <div key={a.key} className="gb-col-hd editable-hd">{a.label}<span className="hd-max">/{a.max}</span></div>
                        ))}
                        <div className="gb-col-hd">Total</div>
                        <div className="gb-col-hd">Grade</div>
                      </div>
                      <div className="gb-roster">
                        {students.length === 0 ? (
                          <div style={{ padding: "40px", textAlign: "center", color: "var(--dimmer)", fontSize: 16 }}>
                            {search ? `No students match "${search}"` : "No students in section."}
                          </div>
                        ) : students.map((s, idx) => {
                          const rowScores = scores[activeSection]?.[s.id] || {};
                          const total     = computeTotal(rowScores, assessments);
                          const pct       = (total / maxPts) * 100;
                          const grade     = getGrade(pct);
                          return (
                            <motion.div className="gb-row hov-target" key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: idx * 0.05 }} whileHover={{ backgroundColor: "rgba(26,100,255,0.05)" }}>
                              <div className="gb-cell left gb-roll">{s.id}</div>
                              <div className="gb-cell left">
                                <div className="gb-name-cell">
                                  <div className="gb-avatar">{s.init}</div>
                                  <div>
                                    <div className="gb-student-name">{s.name}</div>
                                    <div className="gb-student-att">Att: <span className={s.attCls}>{s.att}</span></div>
                                  </div>
                                </div>
                              </div>
                              {assessments.map((a) => {
                                const val = rowScores[a.key];
                                const isInvalid = val !== null && val !== "" && (Number(val) > a.max || Number(val) < 0);
                                return (
                                  <div className="gb-cell" key={a.key}>
                                    <input className={`gb-score-input${isInvalid ? " invalid" : ""}`} type="number" min={0} max={a.max} placeholder="–" value={val === null ? "" : val} onChange={(e) => handleScore(s.id, a.key, e.target.value, a.max)} />
                                  </div>
                                );
                              })}
                              <div className="gb-cell"><div className="gb-total-cell">{total}<span className="gb-total-max">/{maxPts}</span></div></div>
                              <div className="gb-cell"><span className={`gb-grade-pill ${gradeClass(grade)}`}>{grade}</span></div>
                            </motion.div>
                          );
                        })}
                      </div>

                      <div className="gb-dist-wrap">
                        <div className="gb-dist-label">Grade Distribution</div>
                        <div className="gb-dist-bar">
                          <div className="dist-seg dist-a"  style={{ width: `${(distribution.A  / distribution.n) * 100}%` }} />
                          <div className="dist-seg dist-b"  style={{ width: `${(distribution.B  / distribution.n) * 100}%` }} />
                          <div className="dist-seg dist-c"  style={{ width: `${(distribution.C  / distribution.n) * 100}%` }} />
                          <div className="dist-seg dist-df" style={{ width: `${(distribution.DF / distribution.n) * 100}%` }} />
                        </div>
                        <div className="gb-dist-legend">
                          {[
                            { cls: "dist-a",  color: "#00c853", label: `A (${distribution.A})`    },
                            { cls: "dist-b",  color: "#1a78ff", label: `B (${distribution.B})`    },
                            { cls: "dist-c",  color: "#ffab00", label: `C (${distribution.C})`    },
                            { cls: "dist-df", color: "#ff4d6a", label: `D/F (${distribution.DF})` },
                          ].map((d) => (
                            <div className="dl-item" key={d.label}>
                              <div className="dl-dot" style={{ background: d.color }} />{d.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div className="gb-toast" initial={{ opacity: 0, y: 40, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.9 }} transition={{ duration: 0.3, type: "spring" }}>
            <div className="toast-icon">✓</div>{toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}