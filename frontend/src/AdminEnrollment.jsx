import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import Sidebar from "./Components/shared/Sidebar";
import { ADMIN_NAV } from "./config/AdminNav";
import { motion, AnimatePresence } from "framer-motion";
import AdminApi from "./config/adminApi";
import "./AdminEnrollment.css";

const DEPT_COLOR = {
  CS:  { bg: "rgba(26,120,255,.1)",  text: "#1a55cc" },
  EE:  { bg: "rgba(124,58,237,.1)", text: "#5b21b6" },
  IS:  { bg: "rgba(0,201,110,.1)",  text: "#047857" },
  MT:  { bg: "rgba(255,171,0,.1)",  text: "#92400e" },
  BBA: { bg: "rgba(255,77,106,.1)", text: "#9f1239" },
};

/* ── CONFIRM MODAL ─────────────────────────────────────────────────────────── */
function ConfirmModal({ action, student, course, onConfirm, onCancel, loading }) {
  const isEnroll = action === "enroll";
  return (
    <div className="adm-modal-overlay" onClick={onCancel}>
      <div className="adm-modal" style={{ maxWidth: 500, padding: 40 }} onClick={e => e.stopPropagation()}>
        <div className="adm-modal-hd" style={{ marginBottom: 24 }}>
          <div className="adm-modal-title" style={{ fontSize: 28 }}>
            {isEnroll ? "Confirm Enrollment" : "Confirm Drop"}
          </div>
          <button className="adm-modal-close" onClick={onCancel} style={{ fontSize: 24 }}>✕</button>
        </div>
        <div style={{ fontSize: 18, color: "var(--dimmer)", lineHeight: 1.7 }}>
          {isEnroll
            ? <>Enroll <strong style={{ color: "var(--text-main)", fontWeight: 900 }}>{student.name}</strong> into{" "}
                <strong style={{ color: "var(--blue)", fontFamily: "'JetBrains Mono', monospace", fontWeight: 800 }}>{course.code}</strong> — {course.name}?</>
            : <>Drop <strong style={{ color: "var(--text-main)", fontWeight: 900 }}>{student.name}</strong> from{" "}
                <strong style={{ color: "var(--red)", fontFamily: "'JetBrains Mono', monospace", fontWeight: 800 }}>{course.code}</strong> — {course.name}?</>
          }
        </div>
        <div className="adm-modal-footer" style={{ marginTop: 40 }}>
          <button className="adm-btn-secondary" style={{ padding: "14px 28px", fontSize: 18 }} onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button
            className="adm-btn-primary"
            style={{
              padding: "14px 28px", fontSize: 18,
              ...(!isEnroll ? { background: "linear-gradient(135deg,#ff4d6a,#e11d48)", boxShadow: "0 4px 14px rgba(255,77,106,.3)" } : {}),
              opacity: loading ? 0.7 : 1,
            }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Please wait…" : isEnroll ? "Confirm Enroll" : "Drop Course"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── SKELETON ROW ──────────────────────────────────────────────────────────── */
function SkeletonRows({ count = 6, cols = 7 }) {
  return Array.from({ length: count }).map((_, i) => (
    <tr key={i}>
      {Array.from({ length: cols }).map((_, j) => (
        <td key={j}>
          <div style={{
            height: 18, borderRadius: 6,
            background: "linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s infinite",
            width: j === 1 ? "80%" : j === 4 ? "70%" : "60%",
          }} />
        </td>
      ))}
    </tr>
  ));
}

/* ── MAIN COMPONENT ─────────────────────────────────────────────────────────── */
export default function AdminEnrollment() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [collapse, setCollapse] = useState(false);

  // ── Remote data
  const [students,     setStudents]     = useState([]);
  const [courses,      setCourses]      = useState([]);
  const [loadingInit,  setLoadingInit]  = useState(true);
  const [initError,    setInitError]    = useState(null);

  // ── Per-student enrollment state
  // enrolledCourseIds: studentId → Set<courseId>
  // enrollmentIdMap:   studentId → { courseId → enrollmentRecordId }
  const [enrolledCourseIds, setEnrolledCourseIds] = useState({});
  const [enrollmentIdMap,   setEnrollmentIdMap]   = useState({});
  const [loadingStudent,    setLoadingStudent]     = useState(false);

  // ── UI state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSearch,   setStudentSearch]   = useState("");
  const [courseSearch,    setCourseSearch]    = useState("");
  const [confirm,         setConfirm]         = useState(null);
  const [actionLoading,   setActionLoading]   = useState(false);
  const [toast,           setToast]           = useState(null);

  /* ── Initial load: students + courses ──────────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        setLoadingInit(true);
        const [studRes, courseRes] = await Promise.all([
          AdminApi.getStudents(1, 100),
          AdminApi.getCourses(1, 100),
        ]);

        // Normalise — adjust field names to match your actual API response shape
        setStudents(studRes.data ?? studRes.students ?? studRes ?? []);
        setCourses(courseRes.data ?? courseRes.courses ?? courseRes ?? []);
      } catch (err) {
        setInitError("Failed to load data. Please refresh.");
      } finally {
        setLoadingInit(false);
      }
    })();
  }, []);

  /* ── Load enrollments when a student is selected ───────────────────────── */
  const loadStudentEnrollments = useCallback(async (student) => {
    setSelectedStudent(student);
    setLoadingStudent(true);
    try {
      const res = await AdminApi.getStudent(student.id);
      // Expect res.enrollments = [{ id, courseId }, ...]
      // Adjust field names (courseId / course_id / course.id) as needed
      const enrollments = res.enrollments ?? res.data?.enrollments ?? [];

      const courseIdSet = new Set();
      const idMap = {};
      enrollments.forEach(e => {
        const cid = e.courseId ?? e.course_id ?? e.course?.id;
        if (cid) {
          courseIdSet.add(String(cid));
          idMap[String(cid)] = e.id; // enrollment record ID for drops
        }
      });

      setEnrolledCourseIds(prev => ({ ...prev, [student.id]: courseIdSet }));
      setEnrollmentIdMap(prev => ({ ...prev, [student.id]: idMap }));
    } catch {
      showToast("Could not load student enrollments.", "warn");
    } finally {
      setLoadingStudent(false);
    }
  }, []);

  /* ── Helpers ────────────────────────────────────────────────────────────── */
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const studentEnrolled = (studentId, courseId) =>
    enrolledCourseIds[studentId]?.has(String(courseId)) ?? false;

  const enrolledCount = (studentId) =>
    enrolledCourseIds[studentId]?.size ?? 0;

  const totalCredits = (studentId) =>
    [...(enrolledCourseIds[studentId] ?? [])].reduce((acc, cid) => {
      const c = courses.find(x => String(x.id) === String(cid));
      return acc + (c?.credits ?? 0);
    }, 0);

  /* ── Enroll / Drop ──────────────────────────────────────────────────────── */
  const handleAction = (action, student, course) => setConfirm({ action, student, course });

  const commitAction = async () => {
    const { action, student, course } = confirm;
    setActionLoading(true);
    try {
      if (action === "enroll") {
        const res = await AdminApi.enrollStudent({
          studentId: student.id,
          courseId:  course.id,
        });
        // The API should return the new enrollment record with its ID
        const newEnrollmentId = res.id ?? res.enrollment?.id ?? res.data?.id;

        setEnrolledCourseIds(prev => {
          const next = { ...prev };
          next[student.id] = new Set([...(next[student.id] ?? []), String(course.id)]);
          return next;
        });
        setEnrollmentIdMap(prev => {
          const next = { ...prev };
          next[student.id] = { ...(next[student.id] ?? {}), [String(course.id)]: newEnrollmentId };
          return next;
        });
        showToast(`${student.name} enrolled in ${course.code ?? course.id}`, "success");

      } else {
        // Drop: need the enrollment record ID
        const enrollmentId = enrollmentIdMap[student.id]?.[String(course.id)];
        if (!enrollmentId) {
          showToast("Enrollment record not found.", "warn");
          setActionLoading(false);
          setConfirm(null);
          return;
        }
        await AdminApi.dropEnrollment(enrollmentId);

        setEnrolledCourseIds(prev => {
          const next = { ...prev };
          const set  = new Set(next[student.id] ?? []);
          set.delete(String(course.id));
          next[student.id] = set;
          return next;
        });
        setEnrollmentIdMap(prev => {
          const next = { ...prev };
          const map  = { ...(next[student.id] ?? {}) };
          delete map[String(course.id)];
          next[student.id] = map;
          return next;
        });
        showToast(`${student.name} dropped from ${course.code ?? course.id}`, "warn");
      }
    } catch (err) {
      showToast(err?.message ?? "Action failed. Please try again.", "warn");
    } finally {
      setActionLoading(false);
      setConfirm(null);
    }
  };

  /* ── Filter ─────────────────────────────────────────────────────────────── */
  const filteredStudents = students.filter(s => {
    const q = studentSearch.toLowerCase();
    return !q
      || String(s.id).toLowerCase().includes(q)
      || (s.name ?? `${s.firstName} ${s.lastName}`).toLowerCase().includes(q);
  });

  const filteredCourses = courses.filter(c => {
    const q = courseSearch.toLowerCase();
    return !q
      || String(c.id).toLowerCase().includes(q)
      || (c.name ?? c.title ?? "").toLowerCase().includes(q)
      || (c.code ?? "").toLowerCase().includes(q)
      || (c.instructor ?? c.teacher ?? "").toLowerCase().includes(q);
  });

  /* ── GSAP card animations ───────────────────────────────────────────────── */
  useEffect(() => {
    document.querySelectorAll(".adm-card").forEach((el, i) => {
      gsap.fromTo(el, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", delay: i * 0.07 });
    });
  }, [selectedStudent]);

  /* ── Derived helpers for display ────────────────────────────────────────── */
  const studentName = (s) => s.name ?? `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim();
  const studentInitials = (s) => studentName(s).split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const courseName = (c) => c.name ?? c.title ?? "—";
  const courseCode = (c) => c.code ?? String(c.id);
  const courseDept = (c) => c.dept ?? c.department ?? "CS";
  const courseInstructor = (c) => c.instructor ?? c.teacher ?? "—";
  const courseSemester = (c) => c.semester ?? c.sem ?? "—";

  /* ────────────────────────────────────────────────────────────────────────── */
  return (
    <div className="admin-enr-wrapper">
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

      {/* Mesh background */}
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
              backdropFilter: "blur(12px)", whiteSpace: "nowrap",
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
            student={{ ...confirm.student, name: studentName(confirm.student) }}
            course={{ ...confirm.course, code: courseCode(confirm.course), name: courseName(confirm.course) }}
            onConfirm={commitAction}
            onCancel={() => !actionLoading && setConfirm(null)}
            loading={actionLoading}
          />
        )}
      </AnimatePresence>

      <div id="app" style={{ opacity: 1, zIndex: 10, position: "relative" }}>

        <Sidebar
          sections={ADMIN_NAV}
          logoLabel="Admin Portal"
          userName="Super Admin"
          userId="ADM-0001"
          collapse={collapse}
          onToggle={() => setCollapse(c => !c)}
        />

        <div id="main">
          <div id="topbar" style={{ opacity: 1 }}>
            <div className="tb-glow" />
            <div className="pg-title"><span>Enrollment Management</span></div>
            <div className="tb-r">
              <div className="sem-chip">Spring 2025</div>
            </div>
          </div>

          <div id="scroll">

            {/* Global error */}
            {initError && (
              <div style={{ padding: "24px 32px", marginBottom: 24, borderRadius: 16, background: "rgba(255,77,106,.08)", border: "1px solid rgba(255,77,106,.3)", color: "#e11d48", fontWeight: 700, fontSize: 17 }}>
                ⚠ {initError}
              </div>
            )}

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
                  {loadingInit
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} style={{ padding: "20px 32px", borderBottom: "1px solid rgba(18,78,170,.06)", display: "flex", gap: 16, alignItems: "center" }}>
                          <div style={{ width: 52, height: 52, borderRadius: 16, background: "#e2e8f0", flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ height: 18, borderRadius: 6, background: "#e2e8f0", width: "60%", marginBottom: 8 }} />
                            <div style={{ height: 14, borderRadius: 6, background: "#f1f5f9", width: "40%" }} />
                          </div>
                        </div>
                      ))
                    : filteredStudents.map(s => {
                        const isSelected = selectedStudent?.id === s.id;
                        const count = enrolledCount(s.id);
                        const creds = totalCredits(s.id);
                        return (
                          <div
                            key={s.id}
                            onClick={() => loadStudentEnrollments(s)}
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
                              background: isSelected
                                ? "linear-gradient(135deg,var(--blue),var(--blue2))"
                                : "linear-gradient(135deg,#e2e8f0,#cbd5e1)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 18, fontWeight: 800, color: isSelected ? "#fff" : "#475569",
                            }}>
                              {studentInitials(s)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 900, fontSize: 20, color: isSelected ? "var(--blue)" : "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {studentName(s)}
                              </div>
                              <div style={{ fontSize: 16, color: "var(--dimmer)", fontFamily: "'JetBrains Mono',monospace", marginTop: 4 }}>
                                {s.id} · {s.prog ?? s.program ?? "—"}
                              </div>
                            </div>
                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--blue)", fontFamily: "'JetBrains Mono',monospace" }}>{count} crs</div>
                              <div style={{ fontSize: 16, color: "var(--dimmer)", marginTop: 4, fontWeight: 700 }}>{creds} cr</div>
                            </div>
                          </div>
                        );
                      })
                  }
                </div>
              </div>

              {/* ── RIGHT: Course Grid ── */}
              <div>
                {!selectedStudent ? (
                  <div className="adm-card" style={{ textAlign: "center", padding: "120px 40px" }}>
                    <div style={{ fontSize: 64, marginBottom: 32 }}>👈</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text-main)", marginBottom: 16 }}>Select a student</div>
                    <div style={{ fontSize: 18, color: "var(--dimmer)", lineHeight: 1.6 }}>
                      Choose a student from the left panel to<br />manage their course enrollments.
                    </div>
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
                            boxShadow: "0 8px 24px rgba(26,120,255,.3)",
                          }}>
                            {studentInitials(selectedStudent)}
                          </div>
                          <div>
                            <div style={{ fontSize: 32, fontWeight: 900, color: "var(--text-main)", marginBottom: 8, letterSpacing: "-0.02em" }}>
                              {studentName(selectedStudent)}
                            </div>
                            <div style={{ fontSize: 18, color: "var(--dimmer)", fontFamily: "'JetBrains Mono',monospace" }}>
                              {selectedStudent.id} · {selectedStudent.prog ?? selectedStudent.program ?? "—"} · Sem {selectedStudent.sem ?? selectedStudent.semester ?? "—"}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 16 }}>
                          {loadingStudent
                            ? <div style={{ padding: "16px 28px", borderRadius: 24, background: "#f8fafc", border: "2px solid var(--border)", fontSize: 18, color: "var(--dimmer)" }}>Loading…</div>
                            : [
                                { label: "Enrolled", val: enrolledCount(selectedStudent.id), color: "var(--blue)" },
                                { label: "Credits",  val: totalCredits(selectedStudent.id),  color: "var(--dimmer)" },
                              ].map(chip => (
                                <div key={chip.label} style={{
                                  padding: "16px 28px", borderRadius: 24,
                                  background: "#f8fafc", border: "2px solid var(--border)",
                                  fontSize: 18, fontWeight: 800, color: "var(--text-main)",
                                  display: "flex", alignItems: "center", gap: 12,
                                }}>
                                  {chip.label}: <strong style={{ fontFamily: "'Bitcount Grid Double',monospace", color: chip.color, fontSize: 32, lineHeight: 1 }}>{chip.val}</strong>
                                </div>
                              ))
                          }
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
                              <th style={{ textAlign: "right" }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loadingInit || loadingStudent
                              ? <SkeletonRows count={8} cols={7} />
                              : filteredCourses.map(c => {
                                  const isEnrolled = studentEnrolled(selectedStudent.id, c.id);
                                  const dc = DEPT_COLOR[courseDept(c)] ?? DEPT_COLOR.CS;
                                  return (
                                    <tr key={c.id} style={{ background: isEnrolled ? "rgba(26,120,255,.04)" : "transparent" }} className="adm-tr-hover">
                                      <td className="td-mono">{courseCode(c)}</td>
                                      <td>
                                        <div className="td-bold">{courseName(c)}</div>
                                        {isEnrolled && (
                                          <div style={{ fontSize: 14, fontWeight: 900, color: "var(--blue)", letterSpacing: ".06em", textTransform: "uppercase", marginTop: 8 }}>
                                            ✓ Enrolled
                                          </div>
                                        )}
                                      </td>
                                      <td>
                                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, fontWeight: 800, padding: "8px 16px", borderRadius: 10, background: dc.bg, color: dc.text }}>
                                          {courseDept(c)}
                                        </span>
                                      </td>
                                      <td style={{ fontFamily: "'Bitcount Grid Double',monospace", fontWeight: 700, color: "var(--blue)", textAlign: "center", fontSize: 28 }}>
                                        {c.credits}
                                      </td>
                                      <td className="td-dim">{courseInstructor(c)}</td>
                                      <td className="td-dim">{courseSemester(c)}</td>
                                      <td style={{ textAlign: "right" }}>
                                        {isEnrolled ? (
                                          <button
                                            className="adm-btn-secondary"
                                            onClick={() => handleAction("drop", selectedStudent, c)}
                                            style={{ color: "var(--red)", borderColor: "rgba(255,77,106,.3)", background: "rgba(255,77,106,.05)", padding: "12px 24px", fontSize: 16, fontWeight: 800 }}
                                          >
                                            Drop
                                          </button>
                                        ) : (
                                          <button
                                            className="adm-btn-primary"
                                            onClick={() => handleAction("enroll", selectedStudent, c)}
                                            style={{ padding: "12px 24px", fontSize: 16, fontWeight: 800, background: "linear-gradient(135deg, var(--blue), var(--blue2))" }}
                                          >
                                            Enroll
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })
                            }
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