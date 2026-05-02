import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "./Components/shared/AdminSidebar";
import { ADMIN_NAV } from "./config/AdminNav";
import "./AdminPortal.css";
import "./AdminEnrollment.css"; // 🔥 FULLY ISOLATED.

const NAV = [
  ["Overview",   [["⊞", "Dashboard",       "/admin/dashboard"]]],
  ["Management", [["👥", "Student Records", "/admin/students"],
                  ["🎓", "Teachers",        "/admin/teachers"],
                  ["📚", "Course Catalog",  "/admin/courses"],
                  ["📋", "Enrollment",      "/admin/enrollment"],
                  ["📣", "Announcements",   "/admin/announcements"]]]
];

/* ── SEED DATA ─────────────────────────────────────────────────────────────── */
const ALL_STUDENTS = [
  { id: "24K-0001", name: "Ahmed Hassan",    prog: "BS-CS", sem: "1st" },
  { id: "24K-0002", name: "Sara Malik",      prog: "BS-CS", sem: "1st" },
  { id: "23K-1201", name: "Bilal Raza",      prog: "BS-EE", sem: "3rd" },
  { id: "22K-3210", name: "Areeb Bucha",     prog: "BS-CS", sem: "7th" },
  { id: "22K-2980", name: "Hira Baig",       prog: "BS-IS", sem: "5th" },
  { id: "21K-5002", name: "Omar Farooq",     prog: "BS-CS", sem: "7th" },
  { id: "22K-1100", name: "Fatima Siddiqui", prog: "BS-CS", sem: "5th" },
  { id: "21K-9001", name: "Shahzaib Khan",   prog: "BS-EE", sem: "7th" },
];

const ALL_COURSES = [
  { id: "CS-1001", name: "Programming Fundamentals",  dept: "CS",  credits: 3, capacity: 60, instructor: "Dr. Aisha Rauf",      semester: "1st" },
  { id: "CS-1002", name: "Calculus & Analytical Geo.", dept: "CS", credits: 3, capacity: 70, instructor: "Sir Tahir Rashid",    semester: "1st" },
  { id: "CS-1003", name: "Programming Lab",            dept: "CS", credits: 1, capacity: 30, instructor: "Sir Ahsan Naeem",     semester: "1st" },
  { id: "CS-2001", name: "Data Structures",            dept: "CS", credits: 3, capacity: 55, instructor: "Dr. Farhan Siddiqui", semester: "3rd" },
  { id: "CS-2006", name: "Operating Systems",          dept: "CS", credits: 3, capacity: 50, instructor: "Dr. Bilal Amin",      semester: "5th" },
  { id: "CS-3004", name: "Software Design & Analysis", dept: "CS", credits: 3, capacity: 45, instructor: "Sir Asim Noor",       semester: "5th" },
  { id: "CS-3010", name: "Database Systems",           dept: "CS", credits: 3, capacity: 55, instructor: "Dr. Hina Anwar",      semester: "5th" },
  { id: "CS-3020", name: "Artificial Intelligence",    dept: "CS", credits: 3, capacity: 50, instructor: "Dr. Kashif Shahzad",  semester: "6th" },
  { id: "CS-4010", name: "Machine Learning",           dept: "CS", credits: 3, capacity: 40, instructor: "Dr. Zainab Mirza",    semester: "7th" },
  { id: "EE-2001", name: "Circuit Analysis",           dept: "EE", credits: 3, capacity: 40, instructor: "Dr. Shahid Baig",     semester: "3rd" },
  { id: "EE-3010", name: "Signals & Systems",          dept: "EE", credits: 3, capacity: 40, instructor: "Dr. Sana Tariq",      semester: "5th" },
  { id: "IS-2001", name: "Information Security",       dept: "IS", credits: 3, capacity: 45, instructor: "Dr. Usman Qureshi",   semester: "5th" },
];

const INIT_ENROLLMENTS = {
  "24K-0001": new Set(["CS-1001","CS-1002","CS-1003"]),
  "24K-0002": new Set(["CS-1001","CS-1002"]),
  "23K-1201": new Set(["CS-2001","EE-2001"]),
  "22K-3210": new Set(["CS-4010","CS-3020"]),
  "22K-2980": new Set(["CS-2006","CS-3010","IS-2001"]),
  "21K-5002": new Set(["CS-3020","CS-4010"]),
  "22K-1100": new Set(["CS-3004","CS-3010","CS-2006"]),
  "21K-9001": new Set(["CS-3020","EE-3010"]),
};

const DEPT_COLOR = {
  CS:  { bg: "rgba(26,120,255,.1)",  text: "#1a55cc" },
  EE:  { bg: "rgba(124,58,237,.1)", text: "#5b21b6" },
  IS:  { bg: "rgba(0,201,110,.1)",  text: "#047857" },
  MT:  { bg: "rgba(255,171,0,.1)",  text: "#92400e" },
  BBA: { bg: "rgba(255,77,106,.1)", text: "#9f1239" },
};

/* ── CONFIRM MODAL ─────────────────────────────────────────────────────────── */
function ConfirmModal({ action, student, course, onConfirm, onCancel }) {
  const isEnroll = action === "enroll";
  return (
    <div className="adm-modal-overlay" onClick={onCancel}>
      <div className="adm-modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="adm-modal-hd">
          <div className="adm-modal-title" style={{ fontSize: 22 }}>{isEnroll ? "Confirm Enrollment" : "Confirm Drop"}</div>
          <button className="adm-modal-close" onClick={onCancel}>✕</button>
        </div>
        <div style={{ fontSize: 16, color: "var(--dimmer)", lineHeight: 1.7 }}>
          {isEnroll
            ? <>Enroll <strong style={{ color: "var(--text-main)" }}>{student.name}</strong> into <strong style={{ color: "var(--blue)" }}>{course.id}</strong> — {course.name}?</>
            : <>Drop <strong style={{ color: "var(--text-main)" }}>{student.name}</strong> from <strong style={{ color: "var(--red)" }}>{course.id}</strong> — {course.name}?</>
          }
        </div>
        <div className="adm-modal-footer">
          <button className="adm-btn-secondary" style={{ padding: "12px 24px", fontSize: 16 }} onClick={onCancel}>Cancel</button>
          <button
            className="adm-btn-primary"
            style={{
              padding: "12px 24px", fontSize: 16,
              ...( !isEnroll ? { background: "linear-gradient(135deg,#ff4d6a,#e11d48)", boxShadow: "0 4px 14px rgba(255,77,106,.3)" } : {} )
            }}
            onClick={onConfirm}
          >
            {isEnroll ? "Enroll" : "Drop Course"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN COMPONENT ─────────────────────────────────────────────────────────── */
export default function AdminEnrollment() {
  const navigate = useNavigate();
  const location = useLocation();
  const webglRef = useRef(null);

  const [collapse,      setCollapse]      = useState(false);
  const [enrollments,  setEnrollments]  = useState(() => {
    const copy = {};
    for (const [k, v] of Object.entries(INIT_ENROLLMENTS)) copy[k] = new Set(v);
    return copy;
  });

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSearch,   setStudentSearch]   = useState("");
  const [courseSearch,    setCourseSearch]      = useState("");
  const [confirm,         setConfirm]         = useState(null); 
  const [toast,           setToast]           = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const studentEnrolled = (studentId, courseId) => enrollments[studentId]?.has(courseId) ?? false;

  const handleAction = (action, student, course) => {
    setConfirm({ action, student, course });
  };

  const commitAction = () => {
    const { action, student, course } = confirm;
    setEnrollments(prev => {
      const next = { ...prev };
      const set  = new Set(next[student.id] ?? []);
      if (action === "enroll") set.add(course.id);
      else                     set.delete(course.id);
      next[student.id] = set;
      return next;
    });
    showToast(
      action === "enroll"
        ? `${student.name} enrolled in ${course.id}`
        : `${student.name} dropped from ${course.id}`,
      action === "enroll" ? "success" : "warn"
    );
    setConfirm(null);
  };

  const filteredStudents = ALL_STUDENTS.filter(s => {
    const q = studentSearch.toLowerCase();
    return !q || s.id.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
  });

  const filteredCourses = ALL_COURSES.filter(c => {
    const q = courseSearch.toLowerCase();
    return !q || c.id.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q);
  });

  const enrolledCount = (studentId) => enrollments[studentId]?.size ?? 0;
  const totalCredits  = (studentId) =>
    [...(enrollments[studentId] ?? [])].reduce((acc, cid) => {
      const c = ALL_COURSES.find(x => x.id === cid);
      return acc + (c?.credits ?? 0);
    }, 0);

  /* Three.js bg - Blue Unified Theme */
  useEffect(() => {
    const canvas = webglRef.current;
    let W = window.innerWidth, H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H); renderer.setClearColor(0xf0f5ff, 1);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
    camera.position.set(0, 3, 12);
    
    // Updated lights to pure ARCH Blue
    scene.add(new THREE.AmbientLight(0x0033aa, 0.6));
    const sun = new THREE.DirectionalLight(0x40a9ff, 1.2); sun.position.set(-6, 12, 8); scene.add(sun);
    
    const COUNT = 140;
    const ptPos = new Float32Array(COUNT * 3), ptCol = new Float32Array(COUNT * 3), ptVel = [];
    for (let i = 0; i < COUNT; i++) {
      ptPos[i*3]=(Math.random()-.5)*34; ptPos[i*3+1]=(Math.random()-.5)*22; ptPos[i*3+2]=(Math.random()-.5)*18-6;
      ptVel.push({ x:(Math.random()-.5)*.008, y:(Math.random()-.5)*.006 });
      
      // Blue particles
      ptCol[i*3]=.1; ptCol[i*3+1]=.5; ptCol[i*3+2]=1;
    }
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute("position", new THREE.BufferAttribute(ptPos,3));
    ptGeo.setAttribute("color",    new THREE.BufferAttribute(ptCol,3));
    scene.add(new THREE.Points(ptGeo, new THREE.PointsMaterial({size:.05,transparent:true,opacity:.6,vertexColors:true})));
    let nmx=0, nmy=0;
    const onMove=e=>{nmx=(e.clientX/W)*2-1;nmy=-(e.clientY/H)*2+1;};
    document.addEventListener("mousemove",onMove);
    let animId;
    const loop=()=>{ animId=requestAnimationFrame(loop);
      const p=ptGeo.attributes.position.array;
      for(let i=0;i<COUNT;i++){
        p[i*3]+=ptVel[i].x+nmx*.001; p[i*3+1]+=ptVel[i].y+nmy*.001;
        if(p[i*3]>17)p[i*3]=-17; if(p[i*3]<-17)p[i*3]=17;
        if(p[i*3+1]>11)p[i*3+1]=-11; if(p[i*3+1]<-11)p[i*3+1]=11;
      }
      ptGeo.attributes.position.needsUpdate=true;
      camera.position.x+=(nmx*.8-camera.position.x)*.015;
      camera.position.y+=(nmy*.5+3-camera.position.y)*.015;
      camera.lookAt(0,0,0); renderer.render(scene,camera);
    };
    loop();
    const onResize=()=>{W=window.innerWidth;H=window.innerHeight;renderer.setSize(W,H);camera.aspect=W/H;camera.updateProjectionMatrix();};
    window.addEventListener("resize",onResize);
    return()=>{cancelAnimationFrame(animId);document.removeEventListener("mousemove",onMove);window.removeEventListener("resize",onResize);};
  }, []);

  useEffect(() => {
    document.querySelectorAll(".adm-card").forEach((el,i)=>{
      gsap.fromTo(el,{opacity:0,y:24},{opacity:1,y:0,duration:.45,ease:"power2.out",delay:i*.07});
    });
  }, [selectedStudent]);

  return (
    <div className="admin-enr-wrapper">
      <canvas id="adm-webgl" ref={webglRef} />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{
              position: "fixed", top: 30, left: "50%", transform: "translateX(-50%)",
              zIndex: 500, padding: "16px 32px", borderRadius: 16,
              background: toast.type === "success" ? "rgba(0,201,110,.95)" : "rgba(255,171,0,.95)",
              color: "#fff", fontWeight: 800, fontSize: 16,
              boxShadow: "0 12px 32px rgba(0,0,0,.15)",
              backdropFilter: "blur(12px)", whiteSpace: "nowrap"
            }}
          >
            {toast.type === "success" ? "✓" : "⚠"} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirm && (
          <ConfirmModal
            action={confirm.action}
            student={confirm.student}
            course={confirm.course}
            onConfirm={commitAction}
            onCancel={() => setConfirm(null)}
          />
        )}
      </AnimatePresence>

      <div id="adm-app">
        {/* SIDEBAR */}
        <AdminSidebar
          sections={ADMIN_NAV}
          collapse={collapse}
          onToggle={() => setCollapse(c => !c)}
        />

        {/* MAIN */}
        <div id="adm-main">
          <div id="adm-topbar">
            <div className="adm-topbar-glow" />
            <div className="adm-pg-title">Enrollment Management</div>
            <div className="adm-tb-r">
              <div className="adm-sem-chip">Spring 2025</div>
            </div>
          </div>

          <div id="adm-scroll">

            {/* SUPERSIZED Two-column layout */}
            <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: 32, alignItems: "start" }}>

              {/* ── LEFT: Student Picker ── */}
              <div className="adm-card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "24px 28px", borderBottom: "1px solid var(--border)" }}>
                  <div className="adm-card-title" style={{ marginBottom: 16, fontSize: 20 }}>
                    <div className="adm-ctbar" />Select Student
                  </div>
                  <div className="adm-filter-search" style={{ maxWidth: "100%", padding: "12px 16px" }}>
                    <span style={{ color: "#94a3b8", fontSize: 18 }}>🔍</span>
                    <input
                      style={{ fontSize: 16 }}
                      placeholder="Search by name or roll no…"
                      value={studentSearch}
                      onChange={e => setStudentSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 280px)" }}>
                  {filteredStudents.map(s => {
                    const isSelected = selectedStudent?.id === s.id;
                    const count = enrolledCount(s.id);
                    const creds = totalCredits(s.id);
                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedStudent(s)}
                        style={{
                          display: "flex", alignItems: "center", gap: 16,
                          padding: "16px 24px", cursor: "pointer",
                          borderBottom: "1px solid rgba(18,78,170,.06)",
                          background: isSelected ? "rgba(26,120,255,.07)" : "transparent",
                          borderLeft: isSelected ? "4px solid var(--blue)" : "4px solid transparent",
                          transition: "all .15s",
                        }}
                      >
                        <div style={{
                          width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                          background: isSelected ? "linear-gradient(135deg,var(--blue),var(--blue2))" : "linear-gradient(135deg,#e2e8f0,#cbd5e1)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 16, fontWeight: 800, color: isSelected ? "#fff" : "#475569",
                        }}>
                          {s.name.split(" ").map(n => n[0]).join("").slice(0,2)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: 18, color: isSelected ? "var(--blue)" : "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                          <div style={{ fontSize: 14, color: "var(--dimmer)", fontFamily: "'JetBrains Mono',monospace", marginTop: 4 }}>{s.id} · {s.prog}</div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--blue)", fontFamily: "'JetBrains Mono',monospace" }}>{count} courses</div>
                          <div style={{ fontSize: 14, color: "var(--dimmer)", marginTop: 4 }}>{creds} cr</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── RIGHT: Course Grid ── */}
              <div>
                {!selectedStudent ? (
                  <div className="adm-card" style={{ textAlign: "center", padding: "100px 40px" }}>
                    <div style={{ fontSize: 56, marginBottom: 24 }}>👈</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-main)", marginBottom: 12 }}>Select a student</div>
                    <div style={{ fontSize: 16, color: "var(--dimmer)", lineHeight: 1.6 }}>Choose a student from the left panel to<br/>manage their course enrollments.</div>
                  </div>
                ) : (
                  <>
                    {/* Student header */}
                    <div className="adm-card" style={{ marginBottom: 24, padding: "24px 32px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                          <div style={{
                            width: 64, height: 64, borderRadius: 16, flexShrink: 0,
                            background: "linear-gradient(135deg,var(--blue),var(--blue2))",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 22, fontWeight: 800, color: "#fff",
                            boxShadow: "0 8px 24px rgba(26,120,255,.3)"
                          }}>
                            {selectedStudent.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                          </div>
                          <div>
                            <div style={{ fontSize: 26, fontWeight: 900, color: "var(--text-main)", marginBottom: 6 }}>{selectedStudent.name}</div>
                            <div style={{ fontSize: 16, color: "var(--dimmer)", fontFamily: "'JetBrains Mono',monospace" }}>
                              {selectedStudent.id} · {selectedStudent.prog} · Sem {selectedStudent.sem}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 12 }}>
                          {[
                            { label: "Enrolled", val: enrolledCount(selectedStudent.id), color: "var(--blue)" },
                            { label: "Credits",  val: totalCredits(selectedStudent.id),  color: "var(--dimmer)"   },
                          ].map(chip => (
                            <div key={chip.label} style={{
                              padding: "12px 24px", borderRadius: 24,
                              background: "#f8fafc", border: "1px solid var(--border)",
                              fontSize: 16, fontWeight: 800, color: "var(--text-main)",
                              display: "flex", alignItems: "center", gap: 10,
                            }}>
                              {chip.label}: <strong style={{ fontFamily: "'JetBrains Mono',monospace", color: chip.color, fontSize: 18 }}>{chip.val}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Course search */}
                    <div className="adm-card" style={{ marginBottom: 24, padding: "16px 24px" }}>
                      <div className="adm-filter-search" style={{ maxWidth: "100%", padding: "14px 20px" }}>
                        <span style={{ color: "#94a3b8", fontSize: 20 }}>🔍</span>
                        <input
                          style={{ fontSize: 18 }}
                          placeholder="Search courses by code, name, or instructor…"
                          value={courseSearch}
                          onChange={e => setCourseSearch(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Course table */}
                    <div className="adm-card" style={{ padding: 0, overflow: "hidden" }}>
                      <div className="adm-table-wrap" style={{ borderRadius: 24 }}>
                        <table className="adm-table">
                          <thead>
                            <tr>
                              <th>Course ID</th>
                              <th>Title</th>
                              <th>Dept</th>
                              <th>Cr</th>
                              <th>Instructor</th>
                              <th>Sem</th>
                              <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredCourses.map(c => {
                              const isEnrolled = studentEnrolled(selectedStudent.id, c.id);
                              const dc = DEPT_COLOR[c.dept] ?? DEPT_COLOR.CS;
                              return (
                                <tr key={c.id} style={{ background: isEnrolled ? "rgba(26,120,255,.04)" : "transparent" }}>
                                  <td className="td-mono">{c.id}</td>
                                  <td>
                                    <div className="td-bold">{c.name}</div>
                                    {isEnrolled && (
                                      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--blue)", letterSpacing: ".06em", textTransform: "uppercase", marginTop: 6 }}>
                                        ✓ Enrolled
                                      </div>
                                    )}
                                  </td>
                                  <td>
                                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, fontWeight: 800, padding: "6px 12px", borderRadius: 8, background: dc.bg, color: dc.text }}>
                                      {c.dept}
                                    </span>
                                  </td>
                                  <td style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, color: "var(--blue)", textAlign: "center", fontSize: 18 }}>{c.credits}</td>
                                  <td className="td-dim" style={{ fontSize: 16 }}>{c.instructor}</td>
                                  <td className="td-dim">{c.semester}</td>
                                  <td style={{ textAlign: 'right' }}>
                                    {isEnrolled ? (
                                      <button
                                        className="adm-btn-secondary"
                                        title="Drop course"
                                        onClick={() => handleAction("drop", selectedStudent, c)}
                                        style={{ color: "var(--red)", borderColor: "rgba(255,77,106,.3)", background: "rgba(255,77,106,.05)", padding: "10px 20px", fontSize: 15, fontWeight: 800 }}
                                      >
                                        Drop
                                      </button>
                                    ) : (
                                      <button
                                        className="adm-btn-primary"
                                        title="Enroll student"
                                        onClick={() => handleAction("enroll", selectedStudent, c)}
                                        style={{ padding: "10px 20px", fontSize: 15, fontWeight: 800, background: "linear-gradient(135deg, var(--blue), var(--blue2))" }}
                                      >
                                        Enroll
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}