import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import "./StudentMarks.css";

// ── COURSE DATA ───────────────────────────────────────────────────────────────
const COURSES = [
  { id: "OS",  name: "Operating Systems",          cr: 3, color: "#1a78ff", bg: "rgba(26,120,255,.08)",  border: "rgba(26,120,255,.28)", hasLab: true  },
  { id: "SDA", name: "Software Design & Analysis", cr: 3, color: "#7c3aed", bg: "rgba(124,58,237,.07)", border: "rgba(124,58,237,.26)", hasLab: false },
  { id: "AI",  name: "Artificial Intelligence",    cr: 3, color: "#0ea5e9", bg: "rgba(14,165,233,.07)",  border: "rgba(14,165,233,.26)", hasLab: false },
  { id: "DB",  name: "Database Systems",            cr: 3, color: "#f59e0b", bg: "rgba(245,158,11,.07)", border: "rgba(245,158,11,.28)", hasLab: true  },
  { id: "NET", name: "Computer Networks",           cr: 3, color: "#10b981", bg: "rgba(16,185,129,.07)", border: "rgba(16,185,129,.26)", hasLab: true  },
  { id: "HCI", name: "Human Computer Interaction",  cr: 2, color: "#ef4444", bg: "rgba(239,68,68,.07)",  border: "rgba(239,68,68,.26)",  hasLab: false },
];

const TOTAL_CR = COURSES.reduce((s, c) => s + c.cr, 0);

const getSections = (courseId) => {
  const course = COURSES.find(c => c.id === courseId);
  const base = ["Quizzes", "Assignments", "Mid Exam", "Final Exam", "Projects"];
  return course?.hasLab ? [...base, "Lab Work"] : base;
};

const MARKS_DATA = {
  OS: {
    Quizzes:     { total: 10, entries: [{ label:"Q1", marks:8, max:10 },{ label:"Q2", marks:7, max:10 },{ label:"Q3", marks:9, max:10 },{ label:"Q4", marks:6, max:10 }], avg:7.2, classMax:10, classMin:4 },
    Assignments: { total: 10, entries: [{ label:"A1", marks:9, max:10 },{ label:"A2", marks:8, max:10 },{ label:"A3", marks:7, max:10 }], avg:7.8, classMax:10, classMin:5 },
    "Mid Exam":  { total: 30, entries: [{ label:"Mid", marks:24, max:30 }], avg:21, classMax:29, classMin:10 },
    "Final Exam":{ total: 40, entries: [{ label:"Final", marks:33, max:40 }], avg:28, classMax:38, classMin:12 },
    Projects:    { total: 20, entries: [{ label:"P1", marks:17, max:20 }], avg:14, classMax:20, classMin:8 },
    "Lab Work":  { total: 50, entries: [{ label:"Lab 1", marks:9, max:10 },{ label:"Lab 2", marks:8, max:10 },{ label:"Lab 3", marks:10, max:10 },{ label:"Lab 4", marks:7, max:10 },{ label:"Lab 5", marks:9, max:10 }], avg:38, classMax:50, classMin:20 },
  },
  SDA: {
    Quizzes:     { total: 10, entries: [{ label:"Q1", marks:6, max:10 },{ label:"Q2", marks:8, max:10 },{ label:"Q3", marks:7, max:10 }], avg:6.5, classMax:10, classMin:3 },
    Assignments: { total: 10, entries: [{ label:"A1", marks:7, max:10 },{ label:"A2", marks:9, max:10 }], avg:7.0, classMax:10, classMin:4 },
    "Mid Exam":  { total: 30, entries: [{ label:"Mid", marks:20, max:30 }], avg:19, classMax:28, classMin:8 },
    "Final Exam":{ total: 40, entries: [{ label:"Final", marks:30, max:40 }], avg:25, classMax:37, classMin:10 },
    Projects:    { total: 25, entries: [{ label:"P1 — UML", marks:22, max:25 },{ label:"P2 — Patterns", marks:20, max:25 }], avg:18, classMax:25, classMin:9 },
  },
  AI: {
    Quizzes:     { total: 10, entries: [{ label:"Q1", marks:9, max:10 },{ label:"Q2", marks:9, max:10 },{ label:"Q3", marks:8, max:10 }], avg:7.5, classMax:10, classMin:5 },
    Assignments: { total: 10, entries: [{ label:"A1", marks:8, max:10 },{ label:"A2", marks:7, max:10 }], avg:7.2, classMax:10, classMin:4 },
    "Mid Exam":  { total: 30, entries: [{ label:"Mid", marks:26, max:30 }], avg:22, classMax:30, classMin:11 },
    "Final Exam":{ total: 40, entries: [{ label:"Final", marks:35, max:40 }], avg:27, classMax:39, classMin:14 },
    Projects:    { total: 30, entries: [{ label:"P1 — Search", marks:26, max:30 },{ label:"P2 — ML", marks:28, max:30 }], avg:22, classMax:30, classMin:10 },
  },
  DB: {
    Quizzes:     { total: 10, entries: [{ label:"Q1", marks:7, max:10 },{ label:"Q2", marks:6, max:10 },{ label:"Q3", marks:8, max:10 },{ label:"Q4", marks:7, max:10 }], avg:6.8, classMax:10, classMin:3 },
    Assignments: { total: 10, entries: [{ label:"A1", marks:9, max:10 },{ label:"A2", marks:7, max:10 },{ label:"A3", marks:8, max:10 }], avg:7.5, classMax:10, classMin:5 },
    "Mid Exam":  { total: 30, entries: [{ label:"Mid", marks:22, max:30 }], avg:20, classMax:28, classMin:9 },
    "Final Exam":{ total: 40, entries: [{ label:"Final", marks:31, max:40 }], avg:26, classMax:36, classMin:11 },
    Projects:    { total: 20, entries: [{ label:"P1 — Schema", marks:18, max:20 }], avg:14, classMax:20, classMin:7 },
    "Lab Work":  { total: 50, entries: [{ label:"Lab 1 — DDL", marks:10, max:10 },{ label:"Lab 2 — DML", marks:9, max:10 },{ label:"Lab 3 — Joins", marks:8, max:10 },{ label:"Lab 4 — SP", marks:9, max:10 },{ label:"Lab 5 — Idx", marks:7, max:10 }], avg:35, classMax:50, classMin:18 },
  },
  NET: {
    Quizzes:     { total: 10, entries: [{ label:"Q1", marks:8, max:10 },{ label:"Q2", marks:7, max:10 },{ label:"Q3", marks:6, max:10 }], avg:7.0, classMax:10, classMin:4 },
    Assignments: { total: 10, entries: [{ label:"A1", marks:6, max:10 },{ label:"A2", marks:8, max:10 }], avg:6.5, classMax:10, classMin:3 },
    "Mid Exam":  { total: 30, entries: [{ label:"Mid", marks:23, max:30 }], avg:21, classMax:29, classMin:10 },
    "Final Exam":{ total: 40, entries: [{ label:"Final", marks:29, max:40 }], avg:24, classMax:35, classMin:10 },
    Projects:    { total: 20, entries: [{ label:"P1 — Socket", marks:15, max:20 },{ label:"P2 — Routing", marks:16, max:20 }], avg:13, classMax:20, classMin:6 },
    "Lab Work":  { total: 50, entries: [{ label:"Lab 1 — Wireshark", marks:9, max:10 },{ label:"Lab 2 — Subnetting", marks:8, max:10 },{ label:"Lab 3 — TCP/IP", marks:7, max:10 },{ label:"Lab 4 — Routing", marks:9, max:10 },{ label:"Lab 5 — Firewall", marks:8, max:10 }], avg:36, classMax:49, classMin:19 },
  },
  HCI: {
    Quizzes:     { total: 10, entries: [{ label:"Q1", marks:9, max:10 },{ label:"Q2", marks:8, max:10 }], avg:7.8, classMax:10, classMin:5 },
    Assignments: { total: 10, entries: [{ label:"A1", marks:8, max:10 },{ label:"A2", marks:9, max:10 },{ label:"A3", marks:7, max:10 }], avg:7.3, classMax:10, classMin:4 },
    "Mid Exam":  { total: 30, entries: [{ label:"Mid", marks:25, max:30 }], avg:22, classMax:29, classMin:12 },
    "Final Exam":{ total: 40, entries: [{ label:"Final", marks:34, max:40 }], avg:28, classMax:38, classMin:13 },
    Projects:    { total: 30, entries: [{ label:"P1 — Wireframes", marks:26, max:30 },{ label:"P2 — Prototype", marks:28, max:30 }], avg:21, classMax:30, classMin:10 },
  },
};

export default function StudentMarks() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const webglRef  = useRef(null);
  const [collapse,        setCollapse]        = useState(false);
  const [selectedCourse,  setSelectedCourse]  = useState(null);
  const [expandedSections,setExpandedSections]= useState({});

  const toggleSection = (sec) =>
    setExpandedSections(p => ({ ...p, [sec]: !p[sec] }));

  // ── THREE.JS BG ──────────────────────────────────────────────────────────────
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
    mkIco(-7, 2, -6, 2.2, 0x1a78ff, 0.20); mkIco(7, -1, -7, 2.8, 0x0055dd, 0.16);
    mkIco(-2, 4, -9, 3.4, 0x2266ee, 0.13); mkIco(4, 3, -4, 1.6, 0x4499ff, 0.24);
    mkIco(-5, -3, -5, 1.8, 0x0044bb, 0.18);

    const mkRing = (x, y, z, r, color) => {
      const mesh = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.04, 6, 60),
        new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.28, shininess: 180 })
      );
      mesh.rotation.x = Math.random() * Math.PI; mesh.position.set(x, y, z); scene.add(mesh);
      objects.push({ mesh, bobSpeed: .007, bobPhase: Math.random()*Math.PI*2, rotX: (Math.random()-.5)*.016, rotY: (Math.random()-.5)*.018, rotZ: 0 });
    };
    mkRing(-6, 4, -7, 2.0, 0x4499ff); mkRing(3, -1, -5, 1.5, 0x1166dd);

    const COUNT = 200;
    const ptPos = new Float32Array(COUNT * 3);
    const ptCol = new Float32Array(COUNT * 3);
    const ptVel = [];
    for (let i = 0; i < COUNT; i++) {
      ptPos[i*3]=(Math.random()-.5)*34; ptPos[i*3+1]=(Math.random()-.5)*22; ptPos[i*3+2]=(Math.random()-.5)*18-6;
      ptVel.push({ x:(Math.random()-.5)*.010, y:(Math.random()-.5)*.008 });
      const pick = Math.random();
      if (pick<.4)      { ptCol[i*3]=.1; ptCol[i*3+1]=.4;  ptCol[i*3+2]=1.0; }
      else if (pick<.7) { ptCol[i*3]=.4; ptCol[i*3+1]=.8;  ptCol[i*3+2]=1.0; }
      else              { ptCol[i*3]=.9; ptCol[i*3+1]=.95; ptCol[i*3+2]=1.0; }
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
      for (let i=0;i<COUNT;i++) {
        p[i*3]+=ptVel[i].x+nmx*.0018; p[i*3+1]+=ptVel[i].y+nmy*.0018;
        if(p[i*3]>17)p[i*3]=-17; if(p[i*3]<-17)p[i*3]=17;
        if(p[i*3+1]>11)p[i*3+1]=-11; if(p[i*3+1]<-11)p[i*3+1]=11;
      }
      ptGeo.attributes.position.needsUpdate = true;
      rimLight.position.x=Math.sin(t*.5)*12; rimLight.position.z=Math.cos(t*.35)*9;
      floor1.position.z=((t*.8)%2.5)-1.25;
      camera.position.x+=(nmx*1.2-camera.position.x)*.018;
      camera.position.y+=(nmy*.8+3-camera.position.y)*.018;
      camera.lookAt(0,0,0); renderer.render(scene,camera);
    };
    loop();

    const onResize = () => { W=window.innerWidth;H=window.innerHeight;renderer.setSize(W,H);camera.aspect=W/H;camera.updateProjectionMatrix(); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); document.removeEventListener("mousemove",onMove); window.removeEventListener("resize",onResize); };
  }, []);

  const NAV = [
    ["Overview",      [["⊞","Dashboard","/student/dashboard"],["◎","Academic","/student/academic"]]],
    ["Courses",       [["＋","Registration","/student/registration"],["◈","Grades","/student/grades"],["▦","Marks","/student/marks"],["✓","Attendance","/student/attendance"],["▤","Timetable","/student/timetable"]]],
    ["Communication", [["◉","Notices","/student/notices"]]],
    ["Account",       [["◌","Profile","/student/profile"]]],
  ];

  // When course changes, reset expanded sections
  const handleCourseSelect = (course) => {
    const active = selectedCourse?.id === course.id;
    setSelectedCourse(active ? null : course);
    setExpandedSections({});
  };

  const sections     = selectedCourse ? getSections(selectedCourse.id) : [];
  const courseData   = selectedCourse ? MARKS_DATA[selectedCourse.id] : null;

  // Section icon map
  const SECTION_ICONS = {
    "Quizzes":    "◈",
    "Assignments":"▦",
    "Mid Exam":   "◎",
    "Final Exam": "⊞",
    "Projects":   "◉",
    "Lab Work":   "⬡",
  };

  return (
    <>
      <canvas id="mrk-webgl" ref={webglRef} />

      <div id="mrk-app">
        {/* ── SIDEBAR ── */}
        <nav id="mrk-sidebar" className={collapse ? "collapse" : ""}>
          <div className="sb-top-bar" />
          <button className="sb-toggle" onClick={() => setCollapse(c => !c)}>
            <span /><span /><span />
          </button>
          <div className="sb-logo">
            <div className="logo-box">A</div>
            <div><div className="logo-name">ARCH</div><div className="logo-tagline">Student Portal</div></div>
          </div>
          <div className="sb-user">
            <div className="uav">AB</div>
            <div><div className="uname">Areeb Bucha</div><div className="uid">21K-3210</div></div>
          </div>
          {NAV.map(([sec, items]) => (
            <div key={sec}>
              <div className="nav-sec">{sec}</div>
              {items.map(([ic, label, path]) => (
                <div className={`ni${location.pathname === path ? " active" : ""}`} key={label} onClick={() => navigate(path)}>
                  <div className="ni-ic">{ic}</div>{label}
                  {label === "Notices" && <span className="nbadge">3</span>}
                </div>
              ))}
            </div>
          ))}
          <div className="sb-foot">Spring 2025 · FAST-NUCES</div>
        </nav>

        {/* ── MAIN ── */}
        <div id="mrk-main">
          <div id="mrk-topbar">
            <div className="pg-title">Marks</div>
            <div className="tb-r"><div className="sem-chip">Spring 2025</div></div>
          </div>

          <div id="mrk-scroll">

            {/* ── CARD 1 — Enrolled Courses ── */}
            <div className="mrk-card" id="mrk-card1">
              <div className="mrk-card-hd">
                <div className="mrk-card-title-wrap">
                  <div className="mrk-card-bar" />
                  <div>
                    <div className="mrk-card-title">Enrolled Courses</div>
                    <div className="mrk-card-sub">Spring 2025 · {COURSES.length} courses</div>
                  </div>
                </div>
              </div>

              <div className="course-track">
                {COURSES.map(c => {
                  const active = selectedCourse?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      className={`course-tile${active ? " course-tile--active" : ""}`}
                      style={active ? { background: c.bg, borderColor: c.border } : {}}
                      onClick={() => handleCourseSelect(c)}
                    >
                      <div className="course-tile-strip" style={{ background: c.color }} />
                      <div className="course-tile-id" style={{ color: c.color }}>{c.id}</div>
                      <div className="course-tile-name">{c.name}</div>
                      <div className="course-tile-foot">
                        <span className="course-tile-cr">{c.cr} cr</span>
                        {c.hasLab && <span className="course-tile-lab" style={{ color: c.color }}>LAB</span>}
                        <span className="course-tile-arrow" style={{ color: c.color }}>›</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="course-track-foot">
                Total <strong>{TOTAL_CR}</strong>
                <span className="cfoot-dot" />
                credit hours
                <span className="cfoot-dot" />
                {COURSES.length} courses enrolled
              </div>
            </div>

            {/* ── CARDS 2 & 3 ── */}
            <div className="mrk-grid">

              {/* ── CARD 2 — Raw Marks Accordion ── */}
              <div className="mrk-card mrk-card--tall">
                <div className="mrk-card-hd">
                  <div className="mrk-card-title-wrap">
                    <div className="mrk-card-bar" style={{ background: selectedCourse ? `linear-gradient(180deg,${selectedCourse.color},${selectedCourse.color}88)` : "linear-gradient(180deg,var(--blue),var(--blue2))" }} />
                    <div>
                      <div className="mrk-card-title">Raw Marks</div>
                      <div className="mrk-card-sub">
                        {selectedCourse ? selectedCourse.name : "Select a course above"}
                      </div>
                    </div>
                  </div>
                  {selectedCourse && (
                    <div className="card2-total-badge" style={{ background: selectedCourse.bg, borderColor: selectedCourse.border, color: selectedCourse.color }}>
                      {sections.reduce((sum, sec) => {
                        const d = courseData[sec];
                        return sum + (d ? d.entries.reduce((s,e) => s + e.marks, 0) : 0);
                      }, 0)}
                      <span>pts</span>
                    </div>
                  )}
                </div>

                {!selectedCourse ? (
                  <div className="mrk-card-body">
                    <span className="mrk-placeholder">// select a course to view marks</span>
                  </div>
                ) : (
                  <div className="marks-sections">
                    {sections.map(sec => {
                      const data = courseData[sec];
                      if (!data) return null;
                      const scored   = data.entries.reduce((s, e) => s + e.marks, 0);
                      const maxTotal = data.entries.reduce((s, e) => s + e.max, 0);
                      const pct      = Math.min(100, Math.round((scored / maxTotal) * 100));
                      const isOpen = expandedSections[sec];
                      return (
                        <div className={`marks-sec${isOpen ? " marks-sec--open" : ""}`} key={sec}>
                          <div
                            className="marks-sec-hd"
                            onClick={() => toggleSection(sec)}
                          >
                            <div className="marks-sec-left">
                              <span className="marks-sec-icon">{SECTION_ICONS[sec] || "◆"}</span>
                              <span className="marks-sec-name">{sec}</span>
                              {/* mini progress pill */}
                              <div className="marks-sec-pill">
                                <div
                                  className="marks-sec-pill-fill"
                                  style={{ width: `${pct}%`, background: selectedCourse.color }}
                                />
                              </div>
                              <span className="marks-sec-pct" style={{ color: selectedCourse.color }}>{pct}%</span>
                            </div>
                            <div className="marks-sec-right">
                              <span className="marks-sec-score" style={{ color: selectedCourse.color }}>{scored}</span>
                              <span className="marks-sec-total">/{data.total}</span>
                              <span className={`marks-sec-chevron${isOpen ? " open" : ""}`}>›</span>
                            </div>
                          </div>

                          {isOpen && (
                            <div className="marks-sec-body">
                              <table className="marks-tbl">
                                <thead>
                                  <tr>
                                    <th>Item</th>
                                    <th>Marks</th>
                                    <th>Out of</th>
                                    <th>Score</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {data.entries.map(e => {
                                    const epct = (e.marks / e.max) * 100;
                                    return (
                                      <tr key={e.label}>
                                        <td className="tbl-label">{e.label}</td>
                                        <td style={{ color: selectedCourse.color, fontWeight: 700 }}>{e.marks}</td>
                                        <td className="tbl-dim">{e.max}</td>
                                        <td>
                                          <div className="tbl-pct-wrap">
                                            <div className="tbl-pct-track">
                                              <div
                                                className="tbl-pct-bar"
                                                style={{ width: `${epct}%`, background: selectedCourse.color }}
                                              />
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
                                        <span className="tbl-foot-label">Class avg</span>
                                        <span className="tbl-foot-val">{data.avg}</span>
                                        <span className="tbl-foot-sep">·</span>
                                        <span className="tbl-foot-label">High</span>
                                        <span className="tbl-foot-val tbl-foot-max">{data.classMax}</span>
                                        <span className="tbl-foot-sep">·</span>
                                        <span className="tbl-foot-label">Low</span>
                                        <span className="tbl-foot-val tbl-foot-min">{data.classMin}</span>
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

              {/* ── CARD 3 — Bar Chart ── */}
              <div className="mrk-card mrk-card--tall">
                <div className="mrk-card-hd">
                  <div className="mrk-card-title-wrap">
                    <div className="mrk-card-bar" style={{ background: selectedCourse ? `linear-gradient(180deg,${selectedCourse.color},${selectedCourse.color}55)` : "linear-gradient(180deg,#7c3aed,#a78bfa)" }} />
                    <div>
                      <div className="mrk-card-title">Performance Overview</div>
                      <div className="mrk-card-sub">
                        {selectedCourse ? selectedCourse.name : "Select a course above"}
                      </div>
                    </div>
                  </div>
                </div>

                {!selectedCourse ? (
                  <div className="mrk-card-body">
                    <span className="mrk-placeholder">// select a course to view chart</span>
                  </div>
                ) : (
                  <div className="chart-wrap">
                    {/* Legend */}
                    <div className="chart-legend">
                      <div className="leg-item">
                        <span className="leg-swatch" style={{ background: selectedCourse.color }} />
                        <span>Above avg</span>
                      </div>
                      <div className="leg-item">
                        <span className="leg-swatch" style={{ background: `${selectedCourse.color}66` }} />
                        <span>Avg → Min</span>
                      </div>
                      <div className="leg-item">
                        <span className="leg-swatch leg-swatch--red" />
                        <span>Below min</span>
                      </div>
                      <div className="leg-item leg-item--max">
                        <span className="leg-line-swatch leg-max" />
                        <span>Max</span>
                      </div>
                    </div>

                    {/* Chart */}
                    <div className="chart-bars">
                      {sections.map(sec => {
                        const data = courseData[sec];
                        if (!data) return null;
                        const scored  = data.entries.reduce((s, e) => s + e.marks, 0);
                        // scale to classMax so the top of every column = classMax
                        const scale   = data.classMax;
                        const youPct  = Math.min(100, (scored        / scale) * 100);
                        const avgPct  = Math.min(100, (data.avg      / scale) * 100);
                        const minPct  = Math.min(100, (data.classMin / scale) * 100);
                        const shortLabel = sec.replace(" Exam","").replace("Assignments","Assign.");
                        const col = selectedCourse.color;

                        // Build a CSS gradient that changes zone colours within the bar.
                        // Zones (bottom → top): below-min (red tint), min→avg (muted), avg→you (full color)
                        // The gradient is expressed as % of the BAR HEIGHT (youPct%), not the full column.
                        // We remap avgPct and minPct relative to youPct so the stops sit correctly.
                        const avgInBar = youPct > 0 ? Math.min(100, (avgPct / youPct) * 100) : 0;
                        const minInBar = youPct > 0 ? Math.min(100, (minPct / youPct) * 100) : 0;

                        // gradient goes bottom→top (0%=bottom, 100%=top of bar)
                        // below min   : col at 15% opacity
                        // min → avg   : col at 45% opacity
                        // avg → top   : col full opacity
                        const barGradient = youPct > 0
                          ? `linear-gradient(to top,
                              rgba(255,60,80,.35) 0%,
                              rgba(255,60,80,.25) ${minInBar - 0.5}%,
                              ${col}55 ${minInBar + 0.5}%,
                              ${col}88 ${avgInBar - 0.5}%,
                              ${col} ${avgInBar + 0.5}%,
                              ${col} 100%)`
                          : col;

                        return (
                          <div className="chart-col" key={sec}>
                            <div className="chart-bar-area">
                              {/* faint grid lines */}
                              {[25,50,75].map(g => (
                                <div key={g} className="chart-grid-line" style={{ bottom:`${g}%` }} />
                              ))}
                              {/* max line at very top — always visible */}
                              <div className="chart-marker chart-marker--max" style={{ bottom:"98%" }}>
                                <span className="marker-tip marker-tip--max">{data.classMax}</span>
                              </div>
                              {/* avg tick on the right edge */}
                              <div className="chart-zone-tick chart-zone-tick--avg" style={{ bottom:`${avgPct}%` }}>
                                <span className="zone-tick-label">{data.avg}</span>
                              </div>
                              {/* min tick on the right edge */}
                              <div className="chart-zone-tick chart-zone-tick--min" style={{ bottom:`${minPct}%` }}>
                                <span className="zone-tick-label">{data.classMin}</span>
                              </div>
                              {/* your bar with zone gradient */}
                              <div className="chart-bar-wrap">
                                <div
                                  className="chart-bar"
                                  style={{ height:`${youPct}%`, background: barGradient }}
                                >
                                  <span className="chart-bar-val">{scored}</span>
                                </div>
                              </div>
                            </div>
                            <div className="chart-col-label">{shortLabel}</div>
                            <div className="chart-col-total" style={{ color: col }}>/{data.total}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── CARD 4 ── */}
            <div className="mrk-card">
              <div className="mrk-card-hd">
                <div className="mrk-card-title-wrap">
                  <div className="mrk-card-bar" style={{ background: "linear-gradient(180deg,#40a9ff,#91d5ff)" }} />
                  <div>
                    <div className="mrk-card-title">Card 4</div>
                    <div className="mrk-card-sub">Full width · bottom</div>
                  </div>
                </div>
              </div>
              <div className="mrk-card-body">
                <span className="mrk-placeholder">// coming soon</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}