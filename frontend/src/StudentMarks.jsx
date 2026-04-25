import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { AnimatePresence, motion } from "framer-motion";
import "./StudentMarks.css";
import { useCourses, MARKS_DATA } from "./CourseContext";

// ── Section icons ────────────────────────────────────────────────────────────
const SECTION_ICONS = {
  "Quizzes":    "◈",
  "Assignments":"▦",
  "Mid Exam":   "◎",
  "Final Exam": "⊞",
  "Projects":   "◉",
  "Lab Work":   "⬡",
};

// ── Grade thresholds ─────────────────────────────────────────────────────────
const GRADE_THRESHOLDS = {
  A: { min: 90, label: "A", color: "#1a78ff", glow: "rgba(26,120,255,.22)"  },
  B: { min: 80, label: "B", color: "#10b981", glow: "rgba(16,185,129,.22)"  },
  C: { min: 70, label: "C", color: "#f59e0b", glow: "rgba(245,158,11,.22)"  },
  D: { min: 60, label: "D", color: "#f97316", glow: "rgba(249,115,22,.22)"  },
  F: { min: 0,  label: "F", color: "#ef4444", glow: "rgba(239,68,68,.22)"   },
};

const GRADE_VARIANTS = {
  A: [
    { label: "A+", min: 97, desc: "Outstanding"  },
    { label: "A",  min: 93, desc: "Excellent"    },
    { label: "A−", min: 90, desc: "Very Good"    },
  ],
  B: [
    { label: "B+", min: 87, desc: "Good"         },
    { label: "B",  min: 83, desc: "Above Avg"    },
    { label: "B−", min: 80, desc: "Satisfactory" },
  ],
  C: [
    { label: "C+", min: 77, desc: "Average"      },
    { label: "C",  min: 73, desc: "Below Avg"    },
    { label: "C−", min: 70, desc: "Passing"      },
  ],
  D: [
    { label: "D+", min: 67, desc: "Weak"         },
    { label: "D",  min: 63, desc: "Poor"         },
    { label: "D−", min: 60, desc: "Borderline"   },
  ],
};

const GRADE_ORDER = ["A", "B", "C", "D", "F"];

// ── Helpers ──────────────────────────────────────────────────────────────────
const getSections = (code) => {
  const data = MARKS_DATA[code];
  return data ? Object.keys(data.sections) : [];
};

function computeScore(marksData) {
  if (!marksData?.sections) return null;
  const secs = Object.values(marksData.sections);
  if (!secs.length) return null;
  let totalMax = 0, totalScore = 0;
  for (const sec of secs) {
    totalScore += sec.entries.reduce((s, e) => s + e.marks, 0);
    totalMax   += sec.total;
  }
  return totalMax === 0 ? null : Math.round((totalScore / totalMax) * 100);
}

function getLetterGrade(pct) {
  if (pct === null || pct === undefined) return null;
  if (pct >= 97) return "A+";
  if (pct >= 93) return "A";
  if (pct >= 90) return "A−";
  if (pct >= 87) return "B+";
  if (pct >= 83) return "B";
  if (pct >= 80) return "B−";
  if (pct >= 77) return "C+";
  if (pct >= 73) return "C";
  if (pct >= 70) return "C−";
  if (pct >= 67) return "D+";
  if (pct >= 63) return "D";
  if (pct >= 60) return "D−";
  return "F";
}

// ── Grade Distribution ───────────────────────────────────────────────────────
function GradeDistribution({ marksMeta, selectedCourse, courseColor }) {
  const [popup, setPopup] = useState(null);

  const pct         = marksMeta ? computeScore(marksMeta) : null;
  const letterGrade = getLetterGrade(pct);
  const closePopup  = () => setPopup(null);

  return (
    <div className="gd-card">
      <div className="mrk-card-hd">
        <div className="mrk-card-title-wrap">
          <div
            className="mrk-card-bar"
            style={{ background: selectedCourse
              ? `linear-gradient(180deg,${courseColor},${courseColor}55)`
              : "linear-gradient(180deg,#10b981,#34d399)"
            }}
          />
          <div>
            <div className="mrk-card-title">Grade Distribution</div>
            <div className="mrk-card-sub">{selectedCourse ? selectedCourse.name : "Select a course above"}</div>
          </div>
        </div>
        {pct !== null && (
          <div
            className="gd-score-pill"
            style={{
              background:  GRADE_THRESHOLDS[letterGrade?.[0] || "F"].glow,
              borderColor: GRADE_THRESHOLDS[letterGrade?.[0] || "F"].color,
              color:       GRADE_THRESHOLDS[letterGrade?.[0] || "F"].color,
            }}
          >
            {pct}%
          </div>
        )}
      </div>

      {!selectedCourse ? (
        <div className="mrk-card-body">
          <span className="mrk-placeholder">// select a course to view grades</span>
        </div>
      ) : pct === null ? (
        <div className="mrk-card-body" style={{ flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 22 }}>📋</span>
          <span className="mrk-placeholder">// no marks uploaded yet</span>
        </div>
      ) : (
        <div className="gd-body">
          {/* Progress bar */}
          <div className="gd-progress-wrap">
            <div className="gd-progress-track">
              {GRADE_ORDER.map((g, i) => {
                const th      = GRADE_THRESHOLDS[g];
                const next    = GRADE_ORDER[i + 1];
                const nextMin = next ? GRADE_THRESHOLDS[next].min : 0;
                const width   = th.min - nextMin;
                return (
                  <div
                    key={g}
                    className="gd-zone"
                    style={{
                      width:       `${width}%`,
                      background:  `${th.color}22`,
                      borderRight: i < 4 ? `1px solid ${th.color}44` : "none",
                    }}
                  />
                );
              })}
              <div
                className="gd-needle"
                style={{ left: `${pct}%`, background: GRADE_THRESHOLDS[letterGrade?.[0] || "F"].color }}
              >
                <div className="gd-needle-tip" style={{ borderTopColor: GRADE_THRESHOLDS[letterGrade?.[0] || "F"].color }} />
              </div>
            </div>
            <div className="gd-progress-labels">
              <span>0</span><span>60</span><span>70</span><span>80</span><span>90</span><span>100</span>
            </div>
          </div>

          {/* Grade tiles */}
          <div className="gd-tiles">
            {GRADE_ORDER.map(g => {
              const th           = GRADE_THRESHOLDS[g];
              const isF          = g === "F";
              const isCurrent    = letterGrade?.startsWith(g);
              const achieved     = pct >= th.min;
              const pointsNeeded = Math.max(0, th.min - pct);
              return (
                <div
                  key={g}
                  className={`gd-tile${isCurrent ? " gd-tile--current" : ""}${achieved ? " gd-tile--achieved" : ""}${!isF ? " gd-tile--clickable" : ""}`}
                  style={{
                    "--tile-color": th.color,
                    "--tile-glow":  th.glow,
                    borderColor:    isCurrent ? th.color : undefined,
                    background:     isCurrent ? `${th.color}11` : undefined,
                  }}
                  onClick={() => !isF && setPopup(g)}
                >
                  <div className="gd-tile-letter" style={{ color: th.color }}>{g}</div>
                  <div className="gd-tile-min" style={{ color: th.color }}>
                    {isF ? "< 60" : `≥ ${th.min}`}
                    <span className="gd-tile-unit">%</span>
                  </div>
                  {isCurrent ? (
                    <div className="gd-tile-badge" style={{ background: th.color }}>Current</div>
                  ) : pointsNeeded > 0 ? (
                    <div className="gd-tile-gap">+{pointsNeeded}% needed</div>
                  ) : (
                    <div className="gd-tile-gap gd-tile-gap--achieved">✓ achieved</div>
                  )}
                  {!isF && <div className="gd-tile-hint">tap for variants</div>}
                </div>
              );
            })}
          </div>

          {/* Variants popup */}
          <AnimatePresence>
            {popup && (
              <>
                <motion.div
                  className="gd-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={closePopup}
                />
                <motion.div
                  className="gd-popup"
                  initial={{ opacity: 0, scale: 0.88, y: 18 }}
                  animate={{ opacity: 1, scale: 1,    y: 0  }}
                  exit={{ opacity: 0, scale: 0.88, y: 12 }}
                  transition={{ type: "spring", stiffness: 340, damping: 26 }}
                >
                  <div className="gd-popup-hd">
                    <span className="gd-popup-letter" style={{ color: GRADE_THRESHOLDS[popup].color }}>
                      Grade {popup}
                    </span>
                    <button className="gd-popup-close" onClick={closePopup}>✕</button>
                  </div>
                  <div className="gd-popup-sub">
                    Your score: <strong style={{ color: GRADE_THRESHOLDS[popup].color }}>{pct}%</strong>
                  </div>
                  <div className="gd-popup-variants">
                    {GRADE_VARIANTS[popup].map((v, i) => {
                      const delta     = v.min - pct;
                      const varColors = ["#1a78ff", "#10b981", "#f59e0b"];
                      const col       = varColors[i];
                      const achieved  = pct >= v.min;
                      return (
                        <div
                          key={v.label}
                          className={`gd-variant${achieved ? " gd-variant--achieved" : ""}`}
                          style={{ "--vc": col }}
                        >
                          <div className="gd-variant-label" style={{ color: col }}>{v.label}</div>
                          <div className="gd-variant-desc">{v.desc}</div>
                          <div className="gd-variant-bar-track">
                            <div
                              className="gd-variant-bar"
                              style={{ width: `${Math.min(100, (pct / v.min) * 100)}%`, background: col }}
                            />
                          </div>
                          <div className="gd-variant-req">
                            {achieved
                              ? <span className="gd-variant-ok">✓ Achieved — ≥ {v.min}%</span>
                              : <span style={{ color: col }}>Need {delta}% more · ≥ {v.min}%</span>
                            }
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ── Final Grade ──────────────────────────────────────────────────────────────
function FinalGrade({ marksMeta, selectedCourse, courseColor }) {
  const pct         = marksMeta ? computeScore(marksMeta) : null;
  const letterGrade = getLetterGrade(pct);
  const baseGrade   = letterGrade?.[0] || null;
  const threshColor = baseGrade ? GRADE_THRESHOLDS[baseGrade].color : courseColor;
  const threshGlow  = baseGrade ? GRADE_THRESHOLDS[baseGrade].glow  : "rgba(26,120,255,.1)";
  const hasData     = pct !== null;

  return (
    <div className="fg-card">
      <div className="mrk-card-hd">
        <div className="mrk-card-title-wrap">
          <div
            className="mrk-card-bar"
            style={{ background: selectedCourse
              ? `linear-gradient(180deg,${threshColor},${threshColor}55)`
              : "linear-gradient(180deg,#a78bfa,#c4b5fd)"
            }}
          />
          <div>
            <div className="mrk-card-title">Final Grade</div>
            <div className="mrk-card-sub">{selectedCourse ? "Current standing" : "Select a course"}</div>
          </div>
        </div>
      </div>
      <div className="fg-body">
        {!selectedCourse ? (
          <div className="fg-na">
            <span className="fg-na-symbol">—</span>
            <span className="fg-na-label">No course selected</span>
          </div>
        ) : !hasData ? (
          <div className="fg-na">
            <span className="fg-na-symbol">N/A</span>
            <span className="fg-na-label">No marks yet</span>
          </div>
        ) : (
          <div className="fg-display">
            <div className="fg-ring" style={{ borderColor: `${threshColor}44`, boxShadow: `0 0 28px ${threshGlow}` }}>
              <div className="fg-ring-inner" style={{ background: `${threshColor}0d` }}>
                <span className="fg-letter" style={{ color: threshColor }}>{letterGrade}</span>
              </div>
            </div>
            <div className="fg-pct" style={{ color: threshColor }}>{pct}%</div>
            <div className="fg-gpa-row">
              <span className="fg-gpa-label">GPA equiv.</span>
              <span className="fg-gpa-val" style={{ color: threshColor }}>
                {pct >= 97 ? "4.0" :
                 pct >= 93 ? "4.0" :
                 pct >= 90 ? "3.7" :
                 pct >= 87 ? "3.3" :
                 pct >= 83 ? "3.0" :
                 pct >= 80 ? "2.7" :
                 pct >= 77 ? "2.3" :
                 pct >= 73 ? "2.0" :
                 pct >= 70 ? "1.7" :
                 pct >= 67 ? "1.3" :
                 pct >= 63 ? "1.0" :
                 pct >= 60 ? "0.7" : "0.0"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Nav config ───────────────────────────────────────────────────────────────
const NAV = [
  ["Overview",      [["⊞","Dashboard","/student/dashboard"],["◎","Academic","/student/academic"]]],
  ["Courses",       [["＋","Registration","/student/registration"],["◈","Transcript","/student/transcript"],["▦","Marks","/student/marks"],["✓","Attendance","/student/attendance"],["▤","Timetable","/student/timetable"]]],
  ["Communication", [["◉","Notices","/student/notices"]]],
  ["Account",       [["◌","Profile","/student/profile"]]],
];

// ── Main page ────────────────────────────────────────────────────────────────
export default function StudentMarks() {
  const navigate = useNavigate();
  const location = useLocation();
  const webglRef = useRef(null);

  const { enrolled } = useCourses();

  const [collapse,         setCollapse]         = useState(false);
  const [selectedCourse,   setSelectedCourse]   = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  // Deselect if course is unenrolled
  useEffect(() => {
    if (selectedCourse && !enrolled.some(e => e.code === selectedCourse.code)) {
      setSelectedCourse(null);
      setExpandedSections({});
    }
  }, [enrolled, selectedCourse]);

  const toggleSection = (sec) =>
    setExpandedSections(p => ({ ...p, [sec]: !p[sec] }));

  const handleCourseSelect = (course) => {
    const active = selectedCourse?.code === course.code;
    setSelectedCourse(active ? null : course);
    setExpandedSections({});
  };

  // ── Three.js background ──────────────────────────────────────────────────
  useEffect(() => {
    const canvas = webglRef.current;
    let W = window.innerWidth, H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xf0f5ff, 1);
    const scene  = new THREE.Scene();
    scene.fog    = new THREE.FogExp2(0xdeeaff, 0.018);
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
    camera.position.set(0, 3, 12);
    scene.add(new THREE.AmbientLight(0x1144cc, 0.6));
    const sun = new THREE.DirectionalLight(0x6699ff, 1.4);
    sun.position.set(-6, 12, 8); scene.add(sun);
    const rimLight  = new THREE.PointLight(0x0055ff, 3, 40);
    rimLight.position.set(0, 6, 0); scene.add(rimLight);
    const fillLight = new THREE.PointLight(0x88ccff, 1.5, 25);
    fillLight.position.set(-8, -2, 5); scene.add(fillLight);
    const objects = [];
    const mkIco = (x, y, z, r, color, opacity = 0.22) => {
      const mesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(r, 1),
        new THREE.MeshPhongMaterial({ color, wireframe: true, transparent: true, opacity, shininess: 120 })
      );
      mesh.position.set(x, y, z); scene.add(mesh);
      objects.push({ mesh, bobSpeed: Math.random()*.008+.004, bobPhase: Math.random()*Math.PI*2, rotX: (Math.random()-.5)*.018, rotY: (Math.random()-.5)*.022, rotZ: (Math.random()-.5)*.014 });
    };
    mkIco(-7,2,-6,2.2,0x1a78ff,0.20); mkIco(7,-1,-7,2.8,0x0055dd,0.16);
    mkIco(-2,4,-9,3.4,0x2266ee,0.13); mkIco(4,3,-4,1.6,0x4499ff,0.24);
    mkIco(-5,-3,-5,1.8,0x0044bb,0.18);
    const mkRing = (x, y, z, r, color) => {
      const mesh = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.04, 6, 60),
        new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.28, shininess: 180 })
      );
      mesh.rotation.x = Math.random() * Math.PI; mesh.position.set(x, y, z); scene.add(mesh);
      objects.push({ mesh, bobSpeed: .007, bobPhase: Math.random()*Math.PI*2, rotX: (Math.random()-.5)*.016, rotY: (Math.random()-.5)*.018, rotZ: 0 });
    };
    mkRing(-6,4,-7,2.0,0x4499ff); mkRing(3,-1,-5,1.5,0x1166dd);
    const COUNT = 200;
    const ptPos = new Float32Array(COUNT * 3);
    const ptCol = new Float32Array(COUNT * 3);
    const ptVel = [];
    for (let i = 0; i < COUNT; i++) {
      ptPos[i*3]=(Math.random()-.5)*34; ptPos[i*3+1]=(Math.random()-.5)*22; ptPos[i*3+2]=(Math.random()-.5)*18-6;
      ptVel.push({ x:(Math.random()-.5)*.010, y:(Math.random()-.5)*.008 });
      const pick = Math.random();
      if      (pick < .4) { ptCol[i*3]=.1; ptCol[i*3+1]=.4;  ptCol[i*3+2]=1.0; }
      else if (pick < .7) { ptCol[i*3]=.4; ptCol[i*3+1]=.8;  ptCol[i*3+2]=1.0; }
      else                { ptCol[i*3]=.9; ptCol[i*3+1]=.95; ptCol[i*3+2]=1.0; }
    }
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute("position", new THREE.BufferAttribute(ptPos, 3));
    ptGeo.setAttribute("color",    new THREE.BufferAttribute(ptCol, 3));
    scene.add(new THREE.Points(ptGeo, new THREE.PointsMaterial({ size:.055, transparent:true, opacity:.65, vertexColors:true })));
    const floor1 = new THREE.GridHelper(70, 28, 0x002288, 0x002288);
    floor1.position.y = -5.5; floor1.material.transparent = true; floor1.material.opacity = 0.30;
    scene.add(floor1);
    let nmx = 0, nmy = 0;
    const onMove = e => { nmx=(e.clientX/W)*2-1; nmy=-(e.clientY/H)*2+1; };
    document.addEventListener("mousemove", onMove);
    let t = 0, animId;
    const loop = () => {
      animId = requestAnimationFrame(loop); t += .012;
      objects.forEach(o => {
        o.mesh.position.y += Math.sin(t*o.bobSpeed*10+o.bobPhase)*.012;
        o.mesh.rotation.x += o.rotX; o.mesh.rotation.y += o.rotY;
        if (o.rotZ) o.mesh.rotation.z += o.rotZ;
      });
      const p = ptGeo.attributes.position.array;
      for (let i=0; i<COUNT; i++) {
        p[i*3]   += ptVel[i].x+nmx*.0018; p[i*3+1] += ptVel[i].y+nmy*.0018;
        if(p[i*3]>17)   p[i*3]=-17;   if(p[i*3]<-17)   p[i*3]=17;
        if(p[i*3+1]>11) p[i*3+1]=-11; if(p[i*3+1]<-11) p[i*3+1]=11;
      }
      ptGeo.attributes.position.needsUpdate = true;
      rimLight.position.x = Math.sin(t*.5)*12; rimLight.position.z = Math.cos(t*.35)*9;
      floor1.position.z   = ((t*.8)%2.5)-1.25;
      camera.position.x  += (nmx*1.2-camera.position.x)*.018;
      camera.position.y  += (nmy*.8+3-camera.position.y)*.018;
      camera.lookAt(0,0,0); renderer.render(scene,camera);
    };
    loop();
    const onResize = () => { W=window.innerWidth; H=window.innerHeight; renderer.setSize(W,H); camera.aspect=W/H; camera.updateProjectionMatrix(); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); document.removeEventListener("mousemove",onMove); window.removeEventListener("resize",onResize); };
  }, []);

  // ── Derived state ────────────────────────────────────────────────────────
  const marksMeta    = selectedCourse ? MARKS_DATA[selectedCourse.code] : null;
  const sections     = selectedCourse ? getSections(selectedCourse.code) : [];
  const courseColor  = marksMeta?.color  || "#1a78ff";
  const courseBg     = marksMeta?.bg     || "rgba(26,120,255,.08)";
  const courseBorder = marksMeta?.border || "rgba(26,120,255,.28)";
  const TOTAL_CR     = enrolled.reduce((s, c) => s + c.credits, 0);

  return (
    <>
      <canvas id="mrk-webgl" ref={webglRef} />
      <div id="mrk-app">

        {/* ── Sidebar ── */}
        <nav id="mrk-sidebar" className={collapse ? "collapse" : ""}>
          <div className="sb-top-bar" />
          <button className="sb-toggle" onClick={() => setCollapse(c => !c)}>
            <span /><span /><span />
          </button>
          <div className="sb-logo">
            <div className="logo-box">A</div>
            <div>
              <div className="logo-name">ARCH</div>
              <div className="logo-tagline">Student Portal</div>
            </div>
          </div>
          <div className="sb-user">
            <div className="uav">AB</div>
            <div>
              <div className="uname">Areeb Bucha</div>
              <div className="uid">21K-3210</div>
            </div>
          </div>
          {NAV.map(([sec, items]) => (
            <div key={sec}>
              <div className="nav-sec">{sec}</div>
              {items.map(([ic, label, path]) => (
                <div
                  key={label}
                  className={`ni${location.pathname === path ? " active" : ""}`}
                  onClick={() => navigate(path)}
                >
                  <div className="ni-ic">{ic}</div>{label}
                  {label === "Notices" && <span className="nbadge">3</span>}
                </div>
              ))}
            </div>
          ))}
          <div className="sb-foot">Spring 2025 · FAST-NUCES</div>
        </nav>

        {/* ── Main ── */}
        <div id="mrk-main">
          <div id="mrk-topbar">
            <div className="pg-title">Marks</div>
            <div className="tb-r"><div className="sem-chip">Spring 2025</div></div>
          </div>

          <div id="mrk-scroll">

            {/* ── Card 1 — Enrolled Courses ── */}
            <div className="mrk-card" id="mrk-card1">
              <div className="mrk-card-hd">
                <div className="mrk-card-title-wrap">
                  <div className="mrk-card-bar" />
                  <div>
                    <div className="mrk-card-title">Enrolled Courses</div>
                    <div className="mrk-card-sub">Spring 2025 · {enrolled.length} courses</div>
                  </div>
                </div>
              </div>

              {enrolled.length === 0 ? (
                <div className="mrk-card-body">
                  <span className="mrk-placeholder">// no courses enrolled — visit Registration</span>
                </div>
              ) : (
                <div className="course-track">
                  {enrolled.map(c => {
                    const meta   = MARKS_DATA[c.code];
                    const color  = meta?.color  || "#1a78ff";
                    const bg     = meta?.bg     || "rgba(26,120,255,.08)";
                    const border = meta?.border || "rgba(26,120,255,.28)";
                    const active = selectedCourse?.code === c.code;
                    const hasLab = meta && Object.keys(meta.sections).includes("Lab Work");
                    const tileId = c.code.replace(/[^A-Z0-9]/gi, "").slice(0, 6).toUpperCase();
                    return (
                      <div
                        key={c.id ?? c.code}
                        className={`course-tile${active ? " course-tile--active" : ""}`}
                        style={active ? { background: bg, borderColor: border } : {}}
                        onClick={() => handleCourseSelect(c)}
                      >
                        <div className="course-tile-strip" style={{ background: color }} />
                        <div className="course-tile-id"   style={{ color }}>{tileId}</div>
                        <div className="course-tile-name">{c.name}</div>
                        <div className="course-tile-foot">
                          <span className="course-tile-cr">{c.credits} cr</span>
                          {hasLab && <span className="course-tile-lab" style={{ color }}>LAB</span>}
                          <span className="course-tile-arrow" style={{ color }}>›</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="course-track-foot">
                Total <strong>{TOTAL_CR}</strong>
                <span className="cfoot-dot" />
                credit hours
                <span className="cfoot-dot" />
                {enrolled.length} courses enrolled
              </div>
            </div>

            {/* ── Cards 2 & 3 ── */}
            <div className="mrk-grid">

              {/* Card 2 — Raw Marks Accordion */}
              <div className="mrk-card">
                <div className="mrk-card-hd">
                  <div className="mrk-card-title-wrap">
                    <div className="mrk-card-bar" style={{ background: selectedCourse ? `linear-gradient(180deg,${courseColor},${courseColor}88)` : "linear-gradient(180deg,var(--blue),var(--blue2))" }} />
                    <div>
                      <div className="mrk-card-title">Raw Marks</div>
                      <div className="mrk-card-sub">{selectedCourse ? selectedCourse.name : "Select a course above"}</div>
                    </div>
                  </div>
                  {selectedCourse && sections.length > 0 && (
                    <div className="card2-total-badge" style={{ background: courseBg, borderColor: courseBorder, color: courseColor }}>
                      {sections.reduce((sum, sec) => {
                        const d = marksMeta.sections[sec];
                        return sum + (d ? d.entries.reduce((s, e) => s + e.marks, 0) : 0);
                      }, 0)}
                      <span>pts</span>
                    </div>
                  )}
                </div>

                {!selectedCourse ? (
                  <div className="mrk-card-body">
                    <span className="mrk-placeholder">// select a course to view marks</span>
                  </div>
                ) : sections.length === 0 ? (
                  <div className="mrk-card-body" style={{ flexDirection:"column", gap:8 }}>
                    <span style={{ fontSize:22 }}>📭</span>
                    <span className="mrk-placeholder">// no marks recorded yet for {selectedCourse.code}</span>
                    <span style={{ fontSize:10, color:"var(--dimmer)", opacity:.5, fontFamily:"'JetBrains Mono',monospace", letterSpacing:".05em" }}>
                      marks will appear here once uploaded by your instructor
                    </span>
                  </div>
                ) : (
                  <div className="marks-sections">
                    {sections.map(sec => {
                      const data     = marksMeta.sections[sec];
                      if (!data) return null;
                      const scored   = data.entries.reduce((s, e) => s + e.marks, 0);
                      const maxTotal = data.entries.reduce((s, e) => s + e.max,   0);
                      const pct      = Math.min(100, Math.round((scored / maxTotal) * 100));
                      const isOpen   = expandedSections[sec];
                      return (
                        <div className={`marks-sec${isOpen ? " marks-sec--open" : ""}`} key={sec}>
                          <div className="marks-sec-hd" onClick={() => toggleSection(sec)}>
                            <div className="marks-sec-left">
                              <span className="marks-sec-icon">{SECTION_ICONS[sec] || "◆"}</span>
                              <span className="marks-sec-name">{sec}</span>
                              <div className="marks-sec-pill">
                                <div className="marks-sec-pill-fill" style={{ width:`${pct}%`, background:courseColor }} />
                              </div>
                              <span className="marks-sec-pct" style={{ color:courseColor }}>{pct}%</span>
                            </div>
                            <div className="marks-sec-right">
                              <span className="marks-sec-score" style={{ color:courseColor }}>{scored}</span>
                              <span className="marks-sec-total">/{data.total}</span>
                              <span className={`marks-sec-chevron${isOpen ? " open" : ""}`}>›</span>
                            </div>
                          </div>
                          {isOpen && (
                            <div className="marks-sec-body">
                              <table className="marks-tbl">
                                <thead><tr><th>Item</th><th>Marks</th><th>Out of</th><th>Score</th></tr></thead>
                                <tbody>
                                  {data.entries.map(e => {
                                    const epct = (e.marks / e.max) * 100;
                                    return (
                                      <tr key={e.label}>
                                        <td className="tbl-label">{e.label}</td>
                                        <td style={{ color:courseColor, fontWeight:700 }}>{e.marks}</td>
                                        <td className="tbl-dim">{e.max}</td>
                                        <td>
                                          <div className="tbl-pct-wrap">
                                            <div className="tbl-pct-track">
                                              <div className="tbl-pct-bar" style={{ width:`${epct}%`, background:courseColor }} />
                                            </div>
                                            <span className="tbl-pct-num">{Math.round(epct)}%</span>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                                <tfoot>
                                  <tr>
                                    <td colSpan={4}>
                                      <div className="tbl-foot-row">
                                        <span className="tbl-foot-label">Class avg</span><span className="tbl-foot-val">{data.avg}</span>
                                        <span className="tbl-foot-sep">·</span>
                                        <span className="tbl-foot-label">High</span><span className="tbl-foot-val tbl-foot-max">{data.classMax}</span>
                                        <span className="tbl-foot-sep">·</span>
                                        <span className="tbl-foot-label">Low</span><span className="tbl-foot-val tbl-foot-min">{data.classMin}</span>
                                      </div>
                                    </td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Card 3 — Bar Chart */}
              <div className="mrk-card mrk-card--tall">
                <div className="mrk-card-hd">
                  <div className="mrk-card-title-wrap">
                    <div className="mrk-card-bar" style={{ background: selectedCourse ? `linear-gradient(180deg,${courseColor},${courseColor}55)` : "linear-gradient(180deg,#7c3aed,#a78bfa)" }} />
                    <div>
                      <div className="mrk-card-title">Performance Overview</div>
                      <div className="mrk-card-sub">{selectedCourse ? selectedCourse.name : "Select a course above"}</div>
                    </div>
                  </div>
                </div>

                {!selectedCourse ? (
                  <div className="mrk-card-body">
                    <span className="mrk-placeholder">// select a course to view chart</span>
                  </div>
                ) : sections.length === 0 ? (
                  <div className="mrk-card-body" style={{ flexDirection:"column", gap:8 }}>
                    <span style={{ fontSize:22 }}>📊</span>
                    <span className="mrk-placeholder">// chart will populate once marks are uploaded</span>
                  </div>
                ) : (
                  <div className="chart-wrap">
                    <div className="chart-legend">
                      <div className="leg-item"><span className="leg-swatch" style={{ background:courseColor }} /><span>Above avg</span></div>
                      <div className="leg-item"><span className="leg-swatch" style={{ background:`${courseColor}66` }} /><span>Avg → Min</span></div>
                      <div className="leg-item"><span className="leg-swatch leg-swatch--red" /><span>Below min</span></div>
                      <div className="leg-item leg-item--max"><span className="leg-line-swatch leg-max" /><span>Max</span></div>
                    </div>
                    <div className="chart-bars">
                      {sections.map(sec => {
                        const data = marksMeta.sections[sec];
                        if (!data) return null;
                        const scored = data.entries.reduce((s, e) => s + e.marks, 0);
                        const CAP    = 88;
                        const youPct = Math.min(CAP, (scored        / data.classMax) * CAP);
                        const avgPct = Math.min(CAP, (data.avg      / data.classMax) * CAP);
                        const minPct = Math.min(CAP, (data.classMin / data.classMax) * CAP);
                        const shortLabel = sec.replace(" Exam","").replace("Assignments","Assign.");
                        const col        = courseColor;
                        const avgInBar   = youPct > 0 ? Math.min(100, (avgPct / youPct) * 100) : 0;
                        const minInBar   = youPct > 0 ? Math.min(100, (minPct / youPct) * 100) : 0;
                        const barGradient = youPct > 0
                          ? `linear-gradient(to top, rgba(255,60,80,.35) 0%, rgba(255,60,80,.25) ${minInBar-.5}%, ${col}55 ${minInBar+.5}%, ${col}88 ${avgInBar-.5}%, ${col} ${avgInBar+.5}%, ${col} 100%)`
                          : col;
                        return (
                          <div className="chart-col" key={sec}>
                            <div className="chart-bar-area">
                              {[25,50,75].map(g => <div key={g} className="chart-grid-line" style={{ bottom:`${g*CAP/100}%` }} />)}
                              <div className="chart-marker chart-marker--max" style={{ bottom:`${CAP}%` }}>
                                <span className="marker-tip marker-tip--max">{data.classMax}</span>
                              </div>
                              <div className="chart-zone-tick chart-zone-tick--avg" style={{ bottom:`${avgPct}%` }}>
                                <span className="zone-tick-label">{data.avg}</span>
                              </div>
                              <div className="chart-zone-tick chart-zone-tick--min" style={{ bottom:`${minPct}%` }}>
                                <span className="zone-tick-label">{data.classMin}</span>
                              </div>
                              <div className="chart-bar-wrap">
                                <div className="chart-bar" style={{ height:`${youPct}%`, background:barGradient }}>
                                  <span className="chart-bar-val">{scored}</span>
                                </div>
                              </div>
                            </div>
                            <div className="chart-col-label">{shortLabel}</div>
                            <div className="chart-col-total" style={{ color:col }}>/{data.total}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Cards 4 & 5 — 75/25 split ── */}
            <div className="mrk-bottom-row">
              <GradeDistribution
                marksMeta={marksMeta}
                selectedCourse={selectedCourse}
                courseColor={courseColor}
              />
              <FinalGrade
                marksMeta={marksMeta}
                selectedCourse={selectedCourse}
                courseColor={courseColor}
              />
            </div>

          </div>
        </div>
      </div>
    </>
  );
}