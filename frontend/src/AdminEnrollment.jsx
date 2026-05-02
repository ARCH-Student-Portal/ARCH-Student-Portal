import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import "./AdminEnrollment.css"; // 🔥 THE ONE AND ONLY CSS FILE

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

/* ── INLINE CONFIRM MODAL ─────────────────────────────────────────────────────────── */
function ConfirmModal({ action, student, course, onConfirm, onCancel }) {
  const isEnroll = action === "enroll";
  return (
    <div className="adm-modal-overlay" onClick={onCancel}>
      <div className="adm-modal" style={{ maxWidth: 500, padding: 40 }} onClick={e => e.stopPropagation()}>
        <div className="adm-modal-hd" style={{ marginBottom: 24 }}>
          <div className="adm-modal-title" style={{ fontSize: 28 }}>{isEnroll ? "Confirm Enrollment" : "Confirm Drop"}</div>
          <button className="adm-modal-close" onClick={onCancel} style={{ fontSize: 24 }}>✕</button>
        </div>
        <div style={{ fontSize: 18, color: "var(--dimmer)", lineHeight: 1.7 }}>
          {isEnroll
            ? <>Enroll <strong style={{ color: "var(--text-main)", fontWeight: 900 }}>{student.name}</strong> into <strong style={{ color: "var(--blue)", fontFamily: "'JetBrains Mono', monospace", fontWeight: 800 }}>{course.id}</strong> — {course.name}?</>
            : <>Drop <strong style={{ color: "var(--text-main)", fontWeight: 900 }}>{student.name}</strong> from <strong style={{ color: "var(--red)", fontFamily: "'JetBrains Mono', monospace", fontWeight: 800 }}>{course.id}</strong> — {course.name}?</>
          }
        </div>
        <div className="adm-modal-footer" style={{ marginTop: 40 }}>
          <button className="adm-btn-secondary" style={{ padding: "14px 28px", fontSize: 18 }} onClick={onCancel}>Cancel</button>
          <button
            className="adm-btn-primary"
            style={{
              padding: "14px 28px", fontSize: 18,
              ...( !isEnroll ? { background: "linear-gradient(135deg,#ff4d6a,#e11d48)", boxShadow: "0 4px 14px rgba(255,77,106,.3)" } : {} )
            }}
            onClick={onConfirm}
          >
            {isEnroll ? "Confirm Enroll" : "Drop Course"}
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

  useEffect(() => {
    document.querySelectorAll(".adm-card").forEach((el,i)=>{
      gsap.fromTo(el,{opacity:0,y:24},{opacity:1,y:0,duration:.45,ease:"power2.out",delay:i*.07});
    });
  }, [selectedStudent]);

  return (
    <div className="admin-enr-wrapper">
      {/* 🔥 CSS FLUID MESH BACKGROUND 🔥 */}
      <div className="mesh-bg">
        <div className="mesh-blob blob-1" />
        <div className="mesh-blob blob-2" />
        <div className="mesh-blob blob-3" />
      </div>

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

      <div id="app" style={{ opacity: 1, zIndex: 10, position: 'relative' }}>
        
        {/* ── INLINE SIDEBAR ── */}
        <nav id="sidebar" className={collapse ? "collapse" : ""} style={{ transform: "translateX(0)" }}>
          <div className="sb-top-bar" />
          <button className="sb-toggle" onClick={() => setCollapse(c => !c)}>
            <span /><span /><span />
          </button>
          <div className="sb-logo">
            <div className="logo-box">A</div>
            <div><div className="logo-name">ARCH</div><div className="logo-tagline">Admin Portal</div></div>
          </div>
          <div className="sb-user hov-target">
            <div className="uav">SA</div>
            <div><div className="uname">Super Admin</div><div className="uid">ADM-0001</div></div>
          </div>
          {NAV.map(([sec, items]) => (
            <div key={sec}>
              <div className="nav-sec">{sec}</div>
              {items.map(([ic, label, path]) => (
                <div key={label} className={`ni hov-target${location.pathname === path ? " active" : ""}`} onClick={() => navigate(path)}>
                  <div className="ni-ic">{ic}</div>{label}
                </div>
              ))}
            </div>
          ))}
          <div className="sb-foot">Spring 2025 · FAST-NUCES</div>
        </nav>

        {/* ── MAIN ── */}
        <div id="main">
          <div id="topbar" style={{ opacity: 1 }}>
            <div className="tb-glow" />
            <div className="pg-title"><span>Enrollment Management</span></div>
            <div className="tb-r">
              <div className="sem-chip">Spring 2025</div>
            </div>
          </div>

          <div id="scroll">

            {/* SUPERSIZED Two-column layout */}
            <div style={{ display: "grid", gridTemplateColumns: "440px 1fr", gap: 32, alignItems: "start" }}>

              {/* ── LEFT: Student Picker ── */}
              <div className="adm-card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "32px 32px 24px", borderBottom: "1px solid var(--border)" }}>
                  <div className="adm-card-title" style={{ marginBottom: 20, fontSize: 24, fontWeight: 900 }}>
                    <div className="adm-ctbar" />Select Student
                  </div>
                  <div className="adm-filter-search" style={{ maxWidth: "100%", padding: "16px 20px" }}>
                    <span style={{ color: "#94a3b8", fontSize: 20 }}>🔍</span>
                    <input
                      style={{ fontSize: 18 }}
                      placeholder="Search by name or roll no…"
                      value={studentSearch}
                      onChange={e => setStudentSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 300px)" }}>
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
                          padding: "20px 32px", cursor: "pointer",
                          borderBottom: "1px solid rgba(18,78,170,.06)",
                          background: isSelected ? "rgba(26,120,255,.07)" : "transparent",
                          borderLeft: isSelected ? "5px solid var(--blue)" : "5px solid transparent",
                          transition: "all .15s",
                        }}
                      >
                        <div style={{
                          width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                          background: isSelected ? "linear-gradient(135deg,var(--blue),var(--blue2))" : "linear-gradient(135deg,#e2e8f0,#cbd5e1)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 18, fontWeight: 800, color: isSelected ? "#fff" : "#475569",
                        }}>
                          {s.name.split(" ").map(n => n[0]).join("").slice(0,2)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 900, fontSize: 20, color: isSelected ? "var(--blue)" : "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                          <div style={{ fontSize: 16, color: "var(--dimmer)", fontFamily: "'JetBrains Mono',monospace", marginTop: 4 }}>{s.id} · {s.prog}</div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--blue)", fontFamily: "'JetBrains Mono',monospace" }}>{count} crs</div>
                          <div style={{ fontSize: 16, color: "var(--dimmer)", marginTop: 4, fontWeight: 700 }}>{creds} cr</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── RIGHT: Course Grid ── */}
              <div>
                {!selectedStudent ? (
                  <div className="adm-card" style={{ textAlign: "center", padding: "120px 40px" }}>
                    <div style={{ fontSize: 64, marginBottom: 32 }}>👈</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text-main)", marginBottom: 16 }}>Select a student</div>
                    <div style={{ fontSize: 18, color: "var(--dimmer)", lineHeight: 1.6 }}>Choose a student from the left panel to<br/>manage their course enrollments.</div>
                  </div>
                ) : (
                  <>
                    {/* Student header */}
                    <div className="adm-card" style={{ marginBottom: 32, padding: "32px 40px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                          <div style={{
                            width: 80, height: 80, borderRadius: 20, flexShrink: 0,
                            background: "linear-gradient(135deg,var(--blue),var(--blue2))",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 28, fontWeight: 900, color: "#fff",
                            boxShadow: "0 8px 24px rgba(26,120,255,.3)"
                          }}>
                            {selectedStudent.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                          </div>
                          <div>
                            <div style={{ fontSize: 32, fontWeight: 900, color: "var(--text-main)", marginBottom: 8, letterSpacing: "-0.02em" }}>{selectedStudent.name}</div>
                            <div style={{ fontSize: 18, color: "var(--dimmer)", fontFamily: "'JetBrains Mono',monospace" }}>
                              {selectedStudent.id} · {selectedStudent.prog} · Sem {selectedStudent.sem}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 16 }}>
                          {[
                            { label: "Enrolled", val: enrolledCount(selectedStudent.id), color: "var(--blue)" },
                            { label: "Credits",  val: totalCredits(selectedStudent.id),  color: "var(--dimmer)"   },
                          ].map(chip => (
                            <div key={chip.label} style={{
                              padding: "16px 28px", borderRadius: 24,
                              background: "#f8fafc", border: "2px solid var(--border)",
                              fontSize: 18, fontWeight: 800, color: "var(--text-main)",
                              display: "flex", alignItems: "center", gap: 12,
                            }}>
                              {chip.label}: <strong style={{ fontFamily: "'Bitcount Grid Double',monospace", color: chip.color, fontSize: 32, lineHeight: 1 }}>{chip.val}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Course search */}
                    <div className="adm-card" style={{ marginBottom: 32, padding: "20px 32px" }}>
                      <div className="adm-filter-search" style={{ maxWidth: "100%", padding: "16px 24px" }}>
                        <span style={{ color: "#94a3b8", fontSize: 24 }}>🔍</span>
                        <input
                          style={{ fontSize: 20 }}
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
                              <th style={{ textAlign: "center" }}>Cr</th>
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
                                <tr key={c.id} style={{ background: isEnrolled ? "rgba(26,120,255,.04)" : "transparent" }} className="adm-tr-hover">
                                  <td className="td-mono">{c.id}</td>
                                  <td>
                                    <div className="td-bold">{c.name}</div>
                                    {isEnrolled && (
                                      <div style={{ fontSize: 14, fontWeight: 900, color: "var(--blue)", letterSpacing: ".06em", textTransform: "uppercase", marginTop: 8 }}>
                                        ✓ Enrolled
                                      </div>
                                    )}
                                  </td>
                                  <td>
                                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, fontWeight: 800, padding: "8px 16px", borderRadius: 10, background: dc.bg, color: dc.text }}>
                                      {c.dept}
                                    </span>
                                  </td>
                                  <td style={{ fontFamily: "'Bitcount Grid Double',monospace", fontWeight: 700, color: "var(--blue)", textAlign: "center", fontSize: 28 }}>{c.credits}</td>
                                  <td className="td-dim">{c.instructor}</td>
                                  <td className="td-dim">{c.semester}</td>
                                  <td style={{ textAlign: 'right' }}>
                                    {isEnrolled ? (
                                      <button
                                        className="adm-btn-secondary"
                                        title="Drop course"
                                        onClick={() => handleAction("drop", selectedStudent, c)}
                                        style={{ color: "var(--red)", borderColor: "rgba(255,77,106,.3)", background: "rgba(255,77,106,.05)", padding: "12px 24px", fontSize: 16, fontWeight: 800 }}
                                      >
                                        Drop
                                      </button>
                                    ) : (
                                      <button
                                        className="adm-btn-primary"
                                        title="Enroll student"
                                        onClick={() => handleAction("enroll", selectedStudent, c)}
                                        style={{ padding: "12px 24px", fontSize: 16, fontWeight: 800, background: "linear-gradient(135deg, var(--blue), var(--blue2))" }}
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