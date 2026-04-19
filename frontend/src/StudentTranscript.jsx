import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import "./StudentTranscript.css";

// ── TRANSCRIPT DATA ───────────────────────────────────────────────────────────
const SEMESTERS = [
  {
    id: "fall22",
    name: "Fall 2022",
    label: "F-22",
    year: "1st Year",
    courses: [
      { code: "CS-1001", name: "Programming Fundamentals",          cr: 3, grade: "B+", points: 3.3 },
      { code: "CS-1002", name: "Discrete Structures",               cr: 3, grade: "B",  points: 3.0 },
      { code: "MT-1001", name: "Calculus & Analytic Geometry",      cr: 3, grade: "C+", points: 2.3 },
      { code: "EE-1001", name: "Applied Physics",                   cr: 3, grade: "B-", points: 2.7 },
      { code: "HU-1001", name: "Islamic Studies / Ethics",          cr: 2, grade: "A",  points: 4.0 },
      { code: "HU-1002", name: "Functional English",                cr: 2, grade: "B+", points: 3.3 },
    ],
    gpa: 2.81,
  },
  {
    id: "spr23",
    name: "Spring 2023",
    label: "S-23",
    year: "1st Year",
    courses: [
      { code: "CS-1003", name: "Object-Oriented Programming",       cr: 4, grade: "A-", points: 3.7 },
      { code: "CS-1004", name: "Digital Logic Design",              cr: 3, grade: "B+", points: 3.3 },
      { code: "MT-1002", name: "Linear Algebra",                    cr: 3, grade: "B",  points: 3.0 },
      { code: "EE-1002", name: "Workshop Practice",                 cr: 1, grade: "A",  points: 4.0 },
      { code: "HU-1003", name: "Communication Skills",              cr: 2, grade: "A-", points: 3.7 },
      { code: "HU-1004", name: "Pakistan Studies",                  cr: 2, grade: "B+", points: 3.3 },
    ],
    gpa: 3.12,
  },
  {
    id: "fall23",
    name: "Fall 2023",
    label: "F-23",
    year: "2nd Year",
    courses: [
      { code: "CS-2001", name: "Data Structures & Algorithms",      cr: 4, grade: "A",  points: 4.0 },
      { code: "CS-2002", name: "Computer Organization",             cr: 3, grade: "A-", points: 3.7 },
      { code: "CS-2003", name: "Numerical Methods",                 cr: 3, grade: "B+", points: 3.3 },
      { code: "MT-2001", name: "Probability & Statistics",          cr: 3, grade: "B+", points: 3.3 },
      { code: "HU-2001", name: "Professional Ethics",               cr: 2, grade: "A",  points: 4.0 },
    ],
    gpa: 3.29,
  },
  {
    id: "spr24",
    name: "Spring 2024",
    label: "S-24",
    year: "2nd Year",
    courses: [
      { code: "CS-2012", name: "Database Systems",                  cr: 4, grade: "A",  points: 4.0 },
      { code: "CS-2011", name: "Operating Systems",                 cr: 4, grade: "A-", points: 3.7 },
      { code: "CS-2010", name: "Computer Networks",                 cr: 3, grade: "B+", points: 3.3 },
      { code: "MT-2005", name: "Differential Equations",            cr: 3, grade: "B+", points: 3.3 },
      { code: "HU-2002", name: "Technical Report Writing",          cr: 2, grade: "A",  points: 4.0 },
    ],
    gpa: 3.54,
  },
  {
    id: "fall24",
    name: "Fall 2024",
    label: "F-24",
    year: "3rd Year",
    courses: [
      { code: "CS-3001", name: "Object Oriented Analysis & Design", cr: 3, grade: "A",  points: 4.0 },
      { code: "CS-3004", name: "Artificial Intelligence",           cr: 4, grade: "A-", points: 3.7 },
      { code: "CS-3012", name: "Computer Networks",                 cr: 3, grade: "A",  points: 4.0 },
      { code: "CS-3015", name: "Operating Systems",                 cr: 3, grade: "A",  points: 4.0 },
      { code: "MT-3001", name: "Linear Algebra",                    cr: 3, grade: "A-", points: 3.7 },
    ],
    gpa: 3.75,
  },
  {
    id: "spr25",
    name: "Spring 2025",
    label: "S-25",
    year: "3rd Year",
    courses: [
      { code: "CS-3005", name: "Web Programming",                   cr: 3, grade: "A",  points: 4.0 },
      { code: "CS-2012", name: "Database Systems",                  cr: 4, grade: "A",  points: 4.0 },
      { code: "MT-2005", name: "Probability & Statistics",          cr: 3, grade: "A-", points: 3.7 },
    ],
    gpa: 3.82,
    inProgress: true,
  },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────
function gpaClass(gpa) {
  if (gpa >= 3.5) return "gpa-excellent";
  if (gpa >= 3.0) return "gpa-good";
  if (gpa >= 2.0) return "gpa-average";
  return "gpa-poor";
}

function gradeClass(grade) {
  const g = grade[0];
  if (g === "A") return "grade-A";
  if (g === "B") return "grade-B";
  if (g === "C") return "grade-C";
  if (g === "D") return "grade-D";
  return "grade-F";
}

function accentClass(gpa) {
  if (gpa >= 3.5) return "green";
  if (gpa >= 3.0) return "";
  return "gold";
}

// ── TRANSCRIPT CARD ───────────────────────────────────────────────────────────
function TranscriptCard({ sem, position, onClick }) {
  const totalCr  = sem.courses.reduce((s, c) => s + c.cr, 0);
  const totalQP  = sem.courses.reduce((s, c) => s + c.cr * c.points, 0);

  return (
    <div
      className={`tr-sem-card pos-${position} ${gpaClass(sem.gpa)}`}
      onClick={position !== "center" ? onClick : undefined}
      style={{ cursor: position !== "center" ? "pointer" : "default" }}
    >
      <div className={`tr-card-accent ${accentClass(sem.gpa)}`} />

      <div className="tr-card-hd">
        <div>
          <div className="tr-card-sem-name">
            {sem.name}
            {sem.inProgress && (
              <span style={{
                marginLeft: 10, fontSize: 10, fontWeight: 800,
                padding: "2px 8px", borderRadius: 20,
                background: "rgba(26,120,255,.12)",
                color: "var(--blue)",
                letterSpacing: ".08em",
                textTransform: "uppercase",
                verticalAlign: "middle",
              }}>
                In Progress
              </span>
            )}
          </div>
          <div className="tr-card-sem-sub">{sem.year} · {sem.courses.length} courses</div>
        </div>

        <div className="tr-sem-gpa-ring">
          <div className="tr-sem-gpa-val">{sem.gpa.toFixed(2)}</div>
          <div className="tr-sem-gpa-lbl">GPA</div>
        </div>
      </div>

      <div className="tr-course-table">
        <table className="tr-table">
          <thead>
            <tr>
              <th style={{ width: "72px" }}>Code</th>
              <th style={{ textAlign: "left" }}>Course</th>
              <th style={{ width: "36px" }}>Cr</th>
              <th style={{ width: "52px" }}>Grade</th>
              <th style={{ width: "44px" }}>QP</th>
            </tr>
          </thead>
          <tbody>
            {sem.courses.map((c, i) => (
              <tr className="tr-course-row" key={i}>
                <td className="tr-td-code">{c.code}</td>
                <td className="tr-td-name">{c.name}</td>
                <td className="tr-td-cr">{c.cr}</td>
                <td>
                  <span className={`tr-grade ${gradeClass(c.grade)}`}>{c.grade}</span>
                </td>
                <td className="tr-td-qp">{(c.cr * c.points).toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="tr-card-foot">
        <div className="tr-foot-stat">
          <span className="tr-foot-label">Credits</span>
          <span className="tr-foot-value blue">{totalCr}</span>
        </div>
        <div className="tr-foot-stat">
          <span className="tr-foot-label">Quality Points</span>
          <span className="tr-foot-value">{totalQP.toFixed(1)}</span>
        </div>
        <div className="tr-foot-stat" style={{ marginLeft: "auto" }}>
          <span className="tr-foot-label">Sem GPA</span>
          <span className="tr-foot-value green">{sem.gpa.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

// ── NAV ───────────────────────────────────────────────────────────────────────
const NAV = [
  ["Overview",      [["⊞","Dashboard","/student/dashboard"],["◎","Academic","/student/academic"]]],
  ["Courses",       [["＋","Registration","/student/registration"],["◈","Transcript","/student/transcript"],["▦","Marks","/student/marks"],["✓","Attendance","/student/attendance"],["▤","Timetable","/student/timetable"]]],
  ["Communication", [["◉","Notices","/student/notices"]]],
  ["Account",       [["◌","Profile","/student/profile"]]],
];

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function StudentTranscript() {
  const navigate = useNavigate();
  const location = useLocation();
  const webglRef = useRef(null);

  const [collapse, setCollapse]   = useState(false);
  const [activeIdx, setActiveIdx] = useState(SEMESTERS.length - 1); // start on latest

  // ── Carousel navigation ──────────────────────────────────────────────────
  const prev = () => setActiveIdx(i => Math.max(0, i - 1));
  const next = () => setActiveIdx(i => Math.min(SEMESTERS.length - 1, i + 1));

  // Compute positions: center = activeIdx, left = activeIdx-1, right = activeIdx+1
  const getPos = (i) => {
    if (i === activeIdx)     return "center";
    if (i === activeIdx - 1) return "left";
    if (i === activeIdx + 1) return "right";
    return "hidden";
  };

  // ── Cumulative GPA ───────────────────────────────────────────────────────
  const completedSems = SEMESTERS.filter(s => !s.inProgress);
  const totalCrDone   = completedSems.reduce((s, sem) => s + sem.courses.reduce((a, c) => a + c.cr, 0), 0);
  const totalQPDone   = completedSems.reduce((s, sem) => s + sem.courses.reduce((a, c) => a + c.cr * c.points, 0), 0);
  const cgpa          = totalCrDone > 0 ? (totalQPDone / totalCrDone).toFixed(2) : "—";
  const allCr         = SEMESTERS.reduce((s, sem) => s + sem.courses.reduce((a, c) => a + c.cr, 0), 0);

  // ── Keyboard navigation ──────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── Three.js Background ──────────────────────────────────────────────────
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
    const rim = new THREE.PointLight(0x0055ff, 3, 40);
    rim.position.set(0, 6, 0); scene.add(rim);
    const objects = [];
    const mkIco = (x, y, z, r, color) => {
      const mesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(r, 1),
        new THREE.MeshPhongMaterial({ color, wireframe: true, transparent: true, opacity: 0.18, shininess: 120 })
      );
      mesh.position.set(x, y, z); scene.add(mesh);
      objects.push({ mesh, bob: Math.random()*0.008+0.004, phase: Math.random()*Math.PI*2, rx: (Math.random()-.5)*.018, ry: (Math.random()-.5)*.022 });
    };
    mkIco(-7,  2, -6, 2.4, 0x1a78ff);
    mkIco( 7, -1, -7, 3.0, 0x0055dd);
    mkIco(-2,  4, -9, 3.2, 0x2266ee);
    mkIco( 4,  3, -4, 1.6, 0x4499ff);
    mkIco(-5, -3, -5, 1.8, 0x0044bb);
    const COUNT = 200;
    const ptPos = new Float32Array(COUNT*3); const ptCol = new Float32Array(COUNT*3); const ptVel = [];
    for (let i=0;i<COUNT;i++){
      ptPos[i*3]=(Math.random()-.5)*34; ptPos[i*3+1]=(Math.random()-.5)*22; ptPos[i*3+2]=(Math.random()-.5)*18-6;
      ptVel.push({x:(Math.random()-.5)*.010,y:(Math.random()-.5)*.008});
      const p=Math.random();
      if(p<.4){ptCol[i*3]=.1;ptCol[i*3+1]=.4;ptCol[i*3+2]=1;}
      else if(p<.7){ptCol[i*3]=.4;ptCol[i*3+1]=.8;ptCol[i*3+2]=1;}
      else{ptCol[i*3]=.9;ptCol[i*3+1]=.95;ptCol[i*3+2]=1;}
    }
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute("position", new THREE.BufferAttribute(ptPos,3));
    ptGeo.setAttribute("color",    new THREE.BufferAttribute(ptCol,3));
    scene.add(new THREE.Points(ptGeo, new THREE.PointsMaterial({size:.055,transparent:true,opacity:.65,vertexColors:true})));
    const floor = new THREE.GridHelper(70,28,0x002288,0x002288);
    floor.position.y=-5.5; floor.material.transparent=true; floor.material.opacity=0.28; scene.add(floor);
    let nmx=0,nmy=0;
    const onMove=e=>{nmx=(e.clientX/W)*2-1;nmy=-(e.clientY/H)*2+1;};
    document.addEventListener("mousemove",onMove);
    let t=0,animId;
    const loop=()=>{
      animId=requestAnimationFrame(loop);t+=.012;
      objects.forEach(o=>{
        o.mesh.position.y+=Math.sin(t*o.bob*10+o.phase)*.012;
        o.mesh.rotation.x+=o.rx; o.mesh.rotation.y+=o.ry;
      });
      const p=ptGeo.attributes.position.array;
      for(let i=0;i<COUNT;i++){
        p[i*3]+=ptVel[i].x+nmx*.0018;p[i*3+1]+=ptVel[i].y+nmy*.0018;
        if(p[i*3]>17)p[i*3]=-17;if(p[i*3]<-17)p[i*3]=17;
        if(p[i*3+1]>11)p[i*3+1]=-11;if(p[i*3+1]<-11)p[i*3+1]=11;
      }
      ptGeo.attributes.position.needsUpdate=true;
      rim.position.x=Math.sin(t*.5)*12;rim.position.z=Math.cos(t*.35)*9;
      floor.position.z=((t*.8)%2.5)-1.25;
      camera.position.x+=(nmx*1.2-camera.position.x)*.018;
      camera.position.y+=(nmy*.8+3-camera.position.y)*.018;
      camera.lookAt(0,0,0);renderer.render(scene,camera);
    };
    loop();
    const onResize=()=>{W=window.innerWidth;H=window.innerHeight;renderer.setSize(W,H);camera.aspect=W/H;camera.updateProjectionMatrix();};
    window.addEventListener("resize",onResize);
    return()=>{cancelAnimationFrame(animId);document.removeEventListener("mousemove",onMove);window.removeEventListener("resize",onResize);};
  },[]);

  return (
    <>
      <canvas id="tr-webgl" ref={webglRef} />
      <div id="tr-app">

        {/* ── SIDEBAR ── */}
        <nav id="tr-sidebar" className={collapse ? "collapse" : ""}>
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

        {/* ── MAIN ── */}
        <div id="tr-main">
          <div id="tr-topbar">
            <div className="pg-title">Academic Transcript</div>
            <div className="tb-r">
              <div className="sem-chip">21K-3210 · BS-CS</div>
            </div>
          </div>

          <div id="tr-scroll">
            <div className="tr-stage">

              {/* Stats bar */}
              <div className="tr-stats-bar">
                <div className="tr-stat-item">
                  <div className="tr-stat-label">Cumulative GPA</div>
                  <div className="tr-stat-value green">{cgpa}</div>
                </div>
                <div className="tr-stat-item">
                  <div className="tr-stat-label">Credits Earned</div>
                  <div className="tr-stat-value blue">{totalCrDone}</div>
                </div>
                <div className="tr-stat-item">
                  <div className="tr-stat-label">Total Credits (incl. current)</div>
                  <div className="tr-stat-value">{allCr}</div>
                </div>
                <div className="tr-stat-item">
                  <div className="tr-stat-label">Semesters Completed</div>
                  <div className="tr-stat-value">{completedSems.length}</div>
                </div>
                <div className="tr-stat-item">
                  <div className="tr-stat-label">Program</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-main)", marginTop: 4 }}>BS Computer Science</div>
                </div>
              </div>

              {/* Semester pill navigator */}
              <div className="tr-nav">
                <span className="tr-nav-label">Semester</span>
                <div className="tr-pills">
                  {SEMESTERS.map((sem, i) => (
                    <button
                      key={sem.id}
                      className={`tr-pill${activeIdx === i ? " active" : ""}`}
                      onClick={() => setActiveIdx(i)}
                    >
                      {sem.label}
                    </button>
                  ))}
                </div>
                <div className="tr-nav-arrows">
                  <button className="tr-arrow" onClick={prev} disabled={activeIdx === 0}>‹</button>
                  <button className="tr-arrow" onClick={next} disabled={activeIdx === SEMESTERS.length - 1}>›</button>
                </div>
              </div>

              {/* Carousel viewport */}
              <div className="tr-viewport">
                <div className="tr-carousel">
                  {SEMESTERS.map((sem, i) => {
                    const pos = getPos(i);
                    if (pos === "hidden") return null;
                    return (
                      <TranscriptCard
                        key={sem.id}
                        sem={sem}
                        position={pos}
                        onClick={() => setActiveIdx(i)}
                      />
                    );
                  })}
                </div>

                {/* Click hint for side cards */}
                {(activeIdx > 0 || activeIdx < SEMESTERS.length - 1) && (
                  <div className="tr-hint">
                    ← → arrow keys or click side cards to navigate
                  </div>
                )}
              </div>

              {/* Dot indicator */}
              <div className="tr-dots">
                {SEMESTERS.map((_, i) => (
                  <div
                    key={i}
                    className={`tr-dot${activeIdx === i ? " active" : ""}`}
                    onClick={() => setActiveIdx(i)}
                  />
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}