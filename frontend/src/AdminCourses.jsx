import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedCounter from "./Utilities/AnimatedCounter";
import Sidebar from "./Components/shared/Sidebar";
import StatsGrid from "./data/StatsGrid";
import { ADMIN_NAV } from "./config/AdminNav";
import AdminApi from "./config/adminApi";
import "./AdminCourses.css"; // 🔥 100% ISOLATED CSS

const DEPTS    = ["All", "CS", "EE", "MT", "IS", "BBA"];
const TYPES    = ["All", "Core", "Elective", "Lab", "Seminar"];
const STATUSES = ["All", "active", "inactive", "draft"];

// Normalize API response shape to the shape the UI expects
function normalizeCourse(c) {
  return {
    id:          c.courseCode  ?? c.id          ?? "",
    name:        c.name        ?? c.title        ?? "",   // backend uses `name` not `title`
    dept:        c.department  ?? c.dept        ?? "CS",
    credits:     c.creditHours ?? c.credits     ?? 3,     // backend uses `creditHours`
    type:        c.type        ?? "Core",
    instructor:  c.instructor  ?? c.teacherName ?? "",
    capacity:    c.capacity    ?? 0,
    enrolled:    c.enrolled    ?? c.enrolledCount ?? 0,
    status:      c.status      ?? "active",
    semester:    c.semester    ?? "",
    description: c.description ?? "",
    fee:         c.fee         ?? 0,                      // preserve fee for CourseContext
    _id:         c._id         ?? c.id,
  };
}

const DEPT_META = {
  CS:  { grad: "linear-gradient(135deg, #1a78ff 0%, #0044cc 100%)", accent: "#1a78ff", light: "rgba(26,120,255,.08)",  tag: "rgba(26,120,255,.12)",  tagText: "#1a55cc", label: "Computer Science"   },
  EE:  { grad: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)", accent: "#7c3aed", light: "rgba(124,58,237,.08)", tag: "rgba(124,58,237,.12)", tagText: "#5b21b6", label: "Electrical Engg."   },
  IS:  { grad: "linear-gradient(135deg, #00c96e 0%, #059669 100%)", accent: "#00c96e", light: "rgba(0,201,110,.08)",  tag: "rgba(0,201,110,.12)",  tagText: "#047857", label: "Information Sys."    },
  MT:  { grad: "linear-gradient(135deg, #ffab00 0%, #d97706 100%)", accent: "#ffab00", light: "rgba(255,171,0,.08)",  tag: "rgba(255,171,0,.12)",  tagText: "#92400e", label: "Mathematics"         },
  BBA: { grad: "linear-gradient(135deg, #ff4d6a 0%, #be123c 100%)", accent: "#ff4d6a", light: "rgba(255,77,106,.08)", tag: "rgba(255,77,106,.12)", tagText: "#9f1239", label: "Business Admin."     },
};

const TYPE_META = {
  Core:     { icon: "◈", color: "#1a78ff", bg: "rgba(26,120,255,.1)"  },
  Elective: { icon: "◎", color: "#7c3aed", bg: "rgba(124,58,237,.1)" },
  Lab:      { icon: "⬡", color: "#00c96e", bg: "rgba(0,201,110,.1)"  },
  Seminar:  { icon: "◇", color: "#ffab00", bg: "rgba(255,171,0,.1)"  },
};

function fillColor(enrolled, capacity) {
  if (!capacity) return { bar: "#94a3b8", text: "#64748b" };
  const r = enrolled / capacity;
  if (r >= 1)    return { bar: "#ff4d6a", text: "#e11d48" };
  if (r >= 0.85) return { bar: "#ffab00", text: "#b45309" };
  return { bar: "#00c96e", text: "#047857" };
}

// ── INLINE COURSE MODAL ──
function CourseModal({ course, onClose, onSave, saving, teachers = [], teachersLoading = false }) {
  const [form, setForm] = useState(
    course
    ? { ...course }
    : { id: "", name: "", dept: "CS", credits: 3, type: "Core", instructor: "", capacity: 50, enrolled: 0, status: "active", semester: "1st", description: "", fee: 0 }
  );
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" style={{ width: "min(900px, 95vw)", maxHeight: "90vh", overflowY: "auto", padding: "48px" }} onClick={e => e.stopPropagation()}>
        <div className="adm-modal-hd" style={{ marginBottom: 32 }}>
          <div className="adm-modal-title" style={{ fontSize: 36 }}>{course ? "Edit Course" : "Add New Course"}</div>
          <button className="adm-modal-close" style={{ fontSize: 32 }} onClick={onClose}>✕</button>
        </div>
        <div className="adm-form-grid" style={{ gap: 24 }}>
          <div className="adm-form-group">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Course ID</label>
            <input className="adm-form-input" style={{ fontSize: 24, padding: "20px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }} value={form.id} onChange={e => set("id", e.target.value)} placeholder="e.g. CS-4011" />
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Credits</label>
            <select className="adm-form-select" style={{ fontSize: 20, padding: "18px" }} value={form.credits} onChange={e => set("credits", Number(e.target.value))}>
              {[1,2,3,4].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="adm-form-group full">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Course Title</label>
            <input className="adm-form-input" style={{ fontSize: 24, padding: "20px", fontWeight: 800 }} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Full course name" />
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Department</label>
            <select className="adm-form-select" style={{ fontSize: 20, padding: "18px" }} value={form.dept} onChange={e => set("dept", e.target.value)}>
              {["CS","EE","IS","MT","BBA"].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Type</label>
            <select className="adm-form-select" style={{ fontSize: 20, padding: "18px" }} value={form.type} onChange={e => set("type", e.target.value)}>
              {["Core","Elective","Lab","Seminar"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="adm-form-group full">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Instructor</label>
            {teachersLoading ? (
              <div className="adm-form-input" style={{ fontSize: 18, padding: "18px", color: "var(--dimmer)", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ display: "inline-block" }}>⟳</span> Loading teachers…
              </div>
            ) : (
              <select
                className="adm-form-select"
                style={{ fontSize: 20, padding: "18px" }}
                value={form.instructor}
                onChange={e => set("instructor", e.target.value)}
              >
                <option value="">— Select instructor —</option>
                {teachers.map(t => (
                  <option key={t._id ?? t.id} value={t.name}>
                    {t.name}{t.department ? ` - ${t.department}` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Semester</label>
            <select className="adm-form-select" style={{ fontSize: 20, padding: "18px" }} value={form.semester} onChange={e => set("semester", e.target.value)}>
              {["1st","2nd","3rd","4th","5th","6th","7th","8th"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Capacity</label>
            <input className="adm-form-input" type="number" style={{ fontSize: 20, padding: "18px", fontFamily: "'JetBrains Mono', monospace" }} value={form.capacity} onChange={e => set("capacity", Number(e.target.value))} min={1} />
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Enrolled</label>
            <input className="adm-form-input" type="number" style={{ fontSize: 20, padding: "18px", fontFamily: "'JetBrains Mono', monospace" }} value={form.enrolled} onChange={e => set("enrolled", Number(e.target.value))} min={0} />
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Status</label>
            <select className="adm-form-select" style={{ fontSize: 20, padding: "18px", fontWeight: 800, color: form.status === "active" ? "var(--green)" : form.status === "inactive" ? "var(--red)" : "var(--amber)" }} value={form.status} onChange={e => set("status", e.target.value)}>
              {["active","inactive","draft"].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="adm-form-group full">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Description</label>
            <textarea className="adm-form-input" rows={4} style={{ resize: "vertical", lineHeight: 1.6, fontSize: 18, padding: "18px" }} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Brief course description..." />
          </div>
        </div>
        <div className="adm-modal-footer" style={{ marginTop: 48 }}>
          <button className="adm-btn-secondary" style={{ fontSize: 20, padding: "16px 32px" }} onClick={onClose} disabled={saving}>Cancel</button>
          <button className="adm-btn-primary" style={{ fontSize: 20, padding: "16px 32px", opacity: saving ? 0.7 : 1 }} onClick={() => onSave(form)} disabled={saving}>
            {saving ? "Saving…" : course ? "Save Changes" : "➕ Add Course"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── INLINE DETAIL SLIDE-OVER PANEL ──
function DetailPanel({ course, onClose, onEdit, onDelete }) {
  const dm = DEPT_META[course.dept] || DEPT_META.CS;
  const tm = TYPE_META[course.type] || TYPE_META.Core;
  const pct = Math.round((course.enrolled / course.capacity) * 100);
  const fc = fillColor(course.enrolled, course.capacity);

  useEffect(() => {
    setTimeout(() => {
      const bar = document.querySelector(".crs-detail-fill");
      if (bar) bar.style.width = `${Math.min(pct, 100)}%`;
    }, 120);
  }, [pct]);

  return (
    <motion.div
      className="crs-detail-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.aside
        className="crs-detail-panel"
        style={{ width: "min(600px, 88vw)" }} 
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 80, opacity: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
      >
        <div className="crs-detail-banner" style={{ background: dm.grad, padding: "40px" }}>
          <div className="crs-detail-banner-noise" />
          <button className="crs-detail-close" style={{ width: 40, height: 40, fontSize: 18, top: 24, right: 24 }} onClick={onClose}>✕</button>
          <div className="crs-detail-banner-icon" style={{ background: "rgba(255,255,255,.15)", width: 72, height: 72, borderRadius: 20, marginBottom: 24 }}>
            <span style={{ fontSize: 36 }}>{tm.icon}</span>
          </div>
          <div className="crs-detail-banner-id" style={{ fontSize: 16 }}>{course.id}</div>
          <div className="crs-detail-banner-name" style={{ fontSize: 32, marginBottom: 12 }}>{course.name}</div>
          <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
            <span className="crs-pill crs-pill-white" style={{ fontSize: 14, padding: "8px 16px" }}>{course.dept} · {dm.label}</span>
            <span className="crs-pill crs-pill-white" style={{ fontSize: 14, padding: "8px 16px" }}>{course.type}</span>
            <span className={`adm-badge badge-${course.status}`} style={{ background: "rgba(255,255,255,.18)", color: "#fff", border: "1px solid rgba(255,255,255,.3)", fontSize: 14, padding: "8px 16px" }}>{course.status}</span>
          </div>
        </div>

        <div className="crs-detail-body" style={{ padding: "32px 40px 40px", gap: 32 }}>

          {/* Stat row */}
          <div className="crs-detail-stat-row">
            {[
              { val: course.enrolled,   label: "Enrolled",  col: fc.text },
              { val: course.capacity,   label: "Capacity",  col: "var(--text-main)" },
              { val: `${pct}%`,         label: "Fill Rate", col: dm.accent },
              { val: `${course.credits} cr`, label: "Credits", col: "var(--blue)" },
            ].map((s, i) => (
              <div className="crs-detail-stat" key={i} style={{ padding: "24px 16px" }}>
                <div className="crs-detail-stat-val" style={{ color: s.col, fontSize: 32 }}>{s.val}</div>
                <div className="crs-detail-stat-label" style={{ fontSize: 12 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Fill bar */}
          <div className="crs-detail-fill-section">
            <div className="crs-detail-fill-header" style={{ fontSize: 14, marginBottom: 12 }}>
              <span>Enrollment</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", color: fc.text, fontWeight: 800 }}>{course.enrolled} / {course.capacity}</span>
            </div>
            <div className="crs-detail-track" style={{ height: 16, borderRadius: 8 }}>
              <div
                className="crs-detail-fill"
                style={{ width: 0, background: `linear-gradient(90deg, ${fc.bar}, ${fc.bar}dd)`, borderRadius: 8 }}
              />
              <div className="crs-detail-fill-glow" style={{ width: `${Math.min(pct,100)}%`, background: fc.bar, height: 32, borderRadius: 16 }} />
            </div>
          </div>

          {/* Info grid */}
          <div className="crs-info-grid" style={{ gap: 8 }}>
            {[
              { label: "Instructor", val: course.instructor, icon: "👤" },
              { label: "Semester",   val: `${course.semester} Semester`, icon: "📅" },
              { label: "Department", val: `${course.dept} — ${dm.label}`, icon: "🏛️" },
              { label: "Course Type",val: course.type, icon: "📌" },
            ].map((row, i) => (
              <div className="crs-info-row" key={i} style={{ padding: "16px 20px", borderRadius: 16 }}>
                <div className="crs-info-icon" style={{ background: dm.light, width: 44, height: 44, fontSize: 20 }}>{row.icon}</div>
                <div>
                  <div className="crs-info-label" style={{ fontSize: 13, marginBottom: 4 }}>{row.label}</div>
                  <div className="crs-info-val" style={{ fontSize: 18 }}>{row.val}</div>
                </div>
              </div>
            ))}
          </div>

          {course.description && (
            <div className="crs-desc-block">
              <div className="crs-desc-label" style={{ fontSize: 14, marginBottom: 12 }}>About this course</div>
              <p className="crs-desc-text" style={{ fontSize: 16, padding: "20px 24px", borderRadius: 16 }}>{course.description}</p>
            </div>
          )}

          <div className="crs-detail-actions" style={{ gap: 16, marginTop: 24 }}>
            <button className="adm-btn-primary crs-action-primary" style={{ padding: "16px 24px", fontSize: 18 }} onClick={() => onEdit(course)}>
              ✏️ Edit Course
            </button>
            <button className="crs-action-delete" style={{ padding: "16px 24px", fontSize: 18 }} onClick={() => onDelete(course.id)}>
              🗑️ Delete
            </button>
          </div>
        </div>
      </motion.aside>
    </motion.div>
  );
}

// ── MAIN COMPONENT ──
export default function AdminCourses() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapse,   setCollapse]   = useState(false);
  const [courses,    setCourses]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [teachers,   setTeachers]   = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [page,       setPage]       = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 50; // fetch up to 50 per page; increase if needed

  const [search,     setSearch]     = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statFilter, setStatFilter] = useState("All");
  const [viewMode,   setViewMode]   = useState("grid");
  const [modal,      setModal]      = useState(null);
  const [detail,     setDetail]     = useState(null);
  const [showStats,  setShowStats]  = useState(false);

  // ── FETCH ALL COURSES ──
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await AdminApi.getCourses(page, PAGE_SIZE);
      // Backend may return { courses, total } or { data, total } or a plain array
      const raw = res.courses ?? res.data ?? (Array.isArray(res) ? res : []);
      setCourses(raw.map(normalizeCourse));
      setTotalCount(res.total ?? res.totalCount ?? raw.length);
    } catch (err) {
      setError("Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  // ── FETCH TEACHERS FOR DROPDOWN ──
  useEffect(() => {
    let cancelled = false;
    setTeachersLoading(true);
    AdminApi.getTeachers()
      .then(res => {
        if (cancelled) return;
        const raw = res.teachers ?? res.data ?? (Array.isArray(res) ? res : []);
        setTeachers(raw.map(t => ({ _id: t._id ?? t.id, name: t.name ?? t.fullName ?? "", department: t.department ?? "" })));
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setTeachersLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = courses.filter(c => {
    const q = search.toLowerCase();
    const ms = !q || c.id.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q);
    return ms
      && (deptFilter === "All" || c.dept   === deptFilter)
      && (typeFilter === "All" || c.type   === typeFilter)
      && (statFilter === "All" || c.status === statFilter);
  });

  // ── CREATE / UPDATE ──
  const handleSave = async (form) => {
    setSaving(true);
    try {
      // Map UI shape → API shape
      const payload = {
        courseCode:  form.id,
        name:        form.name,        // was `title` — backend schema field is `name`
        department:  form.dept,
        creditHours: form.credits,     // was `credits` — backend schema field is `creditHours`
        fee:         form.fee ?? 0,
        instructor:  form.instructor,
        capacity:    form.capacity,
        status:      form.status,
        semester:    form.semester,
        description: form.description,
      };

      if (modal === "add") {
        const res = await AdminApi.createCourse(payload);
        const created = normalizeCourse({ ...form, ...(res.course ?? res.data ?? res) });
        setCourses(p => [created, ...p]);
        setTotalCount(t => t + 1);
      } else {
        const res = await AdminApi.updateCourse(form._id || form.id, payload);
        const raw = res.course ?? res.data ?? null;
        const updated = raw ? normalizeCourse({ ...form, ...raw }) : normalizeCourse(form);
        setCourses(p => p.map(c => (c._id === updated._id || c.id === updated.id) ? updated : c));
        if (detail?.id === form.id) setDetail(updated);
      }
      setModal(null);
    } catch (err) {
      alert("Failed to save course. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── DELETE ──
  const handleDelete = async (id) => {
    if (!window.confirm("Remove this course? This cannot be undone.")) return;
    const target = courses.find(c => c.id === id);
    const dbId = target?._id ?? id;
    try {
      await AdminApi.deleteCourse(dbId);
      setCourses(p => p.filter(c => c.id !== id));
      setTotalCount(t => t - 1);
      setDetail(null);
    } catch (err) {
      alert("Failed to delete course. Please try again.");
    }
  };

  useEffect(() => {
    document.querySelectorAll(".sc, .admin-isolated-card, .crs-card").forEach((el, i) => {
      gsap.fromTo(el, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", delay: i * 0.06 });
    });
    setTimeout(() => setShowStats(true), 100);
  }, [viewMode, deptFilter, typeFilter, statFilter]); 

  return (
    <div className="admin-crs-wrapper">
      
      {/* 🔥 THE FLUID MESH BACKGROUND (NO THREE.JS) 🔥 */}
      <div className="mesh-bg">
        <div className="mesh-blob blob-1" />
        <div className="mesh-blob blob-2" />
        <div className="mesh-blob blob-3" />
      </div>

      <AnimatePresence>
        {modal && <CourseModal course={modal==="add"?null:modal} onClose={()=>setModal(null)} onSave={handleSave} saving={saving} teachers={teachers} teachersLoading={teachersLoading} />}
      </AnimatePresence>
      <AnimatePresence>
        {detail && <DetailPanel course={detail} onClose={()=>setDetail(null)} onEdit={c=>{setDetail(null);setModal(c);}} onDelete={handleDelete} />}
      </AnimatePresence>

      <div id="app" style={{ opacity: 1, zIndex: 10, position: 'relative' }}>
        
        {/* INLINE SIDEBAR */}
        <Sidebar
          sections={ADMIN_NAV}
          logoLabel="Admin Portal"
          userName="Super Admin"
          userId="ADM-0001"
          collapse={collapse}
          onToggle={() => setCollapse(c => !c)}
        />

        {/* MAIN */}
        <div id="main">
          <div id="topbar" style={{ opacity: 1 }}>
            <div className="tb-glow" />
            <div className="pg-title"><span>Course Catalog</span></div>
            <div className="tb-r">
              <div className="sem-chip">{loading ? "…" : `${totalCount} total`}</div>
              
              <div className="crs-view-toggle" style={{ marginLeft: 16 }}>
                <button className={`crs-view-btn${viewMode==="grid"?" active":""}`} onClick={()=>setViewMode("grid")} title="Card view" style={{ padding: "12px 18px" }}>
                  <svg width="20" height="20" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="0" width="6" height="6" rx="1.5"/><rect x="8" y="0" width="6" height="6" rx="1.5"/><rect x="0" y="8" width="6" height="6" rx="1.5"/><rect x="8" y="8" width="6" height="6" rx="1.5"/></svg>
                </button>
                <button className={`crs-view-btn${viewMode==="list"?" active":""}`} onClick={()=>setViewMode("list")} title="List view" style={{ padding: "12px 18px" }}>
                  <svg width="20" height="20" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="0" width="14" height="2.5" rx="1.25"/><rect x="0" y="5.75" width="14" height="2.5" rx="1.25"/><rect x="0" y="11.5" width="14" height="2.5" rx="1.25"/></svg>
                </button>
              </div>

              <button className="adm-btn-primary" onClick={()=>setModal("add")} style={{ fontSize: 18, padding: "10px 24px", marginLeft: 16 }}>
                ➕ Add Course
              </button>
            </div>
          </div>

          <div id="scroll">

            {/* ── ERROR BANNER ── */}
            {error && (
              <div style={{ margin: "0 0 24px", padding: "20px 28px", borderRadius: 16, background: "rgba(255,77,106,.08)", border: "1.5px solid rgba(255,77,106,.25)", color: "#e11d48", fontWeight: 700, fontSize: 17, display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 22 }}>⚠️</span>
                {error}
                <button onClick={fetchCourses} style={{ marginLeft: "auto", background: "#e11d48", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 800, cursor: "pointer", fontSize: 16 }}>Retry</button>
              </div>
            )}

            {/* ── LOADING SKELETON ── */}
            {loading && (
              <div style={{ display: "flex", gap: 24, marginBottom: 40, flexWrap: "wrap" }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ flex: "1 1 200px", height: 130, borderRadius: 20, background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite", opacity: 0.7 }} />
                ))}
              </div>
            )}

            {/* ── GODZILLA STATS GRID ── */}
            <StatsGrid
              showStats={showStats}
              cards={[
                { cls: "sc-a", label: "Total Courses", value: courses.length,                                   special: "none"    },
                { cls: "sc-d", label: "Active Status", value: courses.filter(c=>c.status==="active").length,    special: "bubbles" },
                { cls: "sc-b", label: "Drafts",        value: courses.filter(c=>c.status==="draft").length,     special: "none"    },
                { cls: "sc-c", label: "Inactive",      value: courses.filter(c=>c.status==="inactive").length,  special: "fire"    },
              ]}
            />

            {/* 🔥 HORIZONTAL FILTER BAR 🔥 */}
            <div className="admin-isolated-card" style={{ marginBottom: 40, padding: "24px 32px" }}>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 20, width: "100%" }}>
                <div className="adm-filter-search" style={{ padding: "16px 20px", flex: 1, minWidth: 300 }}>
                  <span style={{ color: "#94a3b8", fontSize: 22 }}>🔍</span>
                  <input
                    style={{ fontSize: 20 }}
                    placeholder="Search by title, course ID, or instructor…"
                    value={search}
                    onChange={e=>setSearch(e.target.value)}
                  />
                  {search && <button className="crs-search-clear" style={{ fontSize: 20, cursor: "pointer" }} onClick={()=>setSearch("")}>✕</button>}
                </div>
                <select className="adm-filter-select" style={{ fontSize: 18, padding: "16px 20px" }} value={deptFilter} onChange={e=>setDeptFilter(e.target.value)}>
                  {DEPTS.map(d=><option key={d} value={d}>{d==="All"?"All Depts":d}</option>)}
                </select>
                <select className="adm-filter-select" style={{ fontSize: 18, padding: "16px 20px" }} value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}>
                  {TYPES.map(t=><option key={t} value={t}>{t==="All"?"All Types":t}</option>)}
                </select>
                <select className="adm-filter-select" style={{ fontSize: 18, padding: "16px 20px" }} value={statFilter} onChange={e=>setStatFilter(e.target.value)}>
                  {STATUSES.map(s=><option key={s} value={s}>{s==="All"?"All Status":s.toUpperCase()}</option>)}
                </select>
                <div className="adm-filter-count" style={{ fontSize: 18, padding: "16px 24px" }}>
                  {filtered.length} result{filtered.length!==1?"s":""}
                </div>
              </div>
            </div>

            {/* ══ GODZILLA 2-FONT GRID VIEW ══ */}
            {viewMode === "grid" && (
              <div className="admin-isolated-card" style={{ padding: 32, background: "transparent", border: "none", boxShadow: "none" }}>
                <div className="crs-grid">
                  {filtered.length === 0 ? (
                    <div className="crs-empty" style={{ padding: "80px", textAlign: "center", width: "100%", gridColumn: "1/-1" }}>
                      <div className="crs-empty-icon" style={{ fontSize: 64, opacity: 0.5, marginBottom: 24 }}>📭</div>
                      <div className="crs-empty-text" style={{ fontSize: 20, fontWeight: 800, color: "var(--dimmer)" }}>No courses match the current filters</div>
                    </div>
                  ) : filtered.map(c => {
                    const dm = DEPT_META[c.dept] || DEPT_META.CS;
                    const tm = TYPE_META[c.type] || TYPE_META.Core;
                    const fc = fillColor(c.enrolled, c.capacity);
                    return (
                      <div key={c.id} className={`crs-card${c.status!=="active"?" crs-card-muted":""}`} onClick={()=>setDetail(c)}>
                        <div className="crs-card-shimmer" />
                        <div className="crs-card-band" style={{ background: dm.grad, height: 80, padding: "16px 24px" }}>
                          <div className="crs-card-band-noise" />
                          <div className="crs-card-band-type" style={{ background: "rgba(255,255,255,.15)", color: "#fff", padding: "6px 14px", fontSize: 16 }}>
                            <span style={{ fontWeight: 800 }}>{tm.icon} {c.type}</span>
                          </div>
                          <div className={`crs-card-band-status adm-badge badge-${c.status}`} style={{ background: "rgba(255,255,255,.18)", color: "#fff", border: "1px solid rgba(255,255,255,.3)", fontSize: 14, padding: "6px 14px", fontWeight: 800, textTransform: 'uppercase' }}>
                            {c.status}
                          </div>
                        </div>
                        <div className="crs-card-body" style={{ padding: "32px", gap: 12 }}>
                          {/* FONT 1: JETBRAINS MONO */}
                          <div className="crs-card-id" style={{ fontSize: 18, fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, color: "var(--dimmer)" }}>{c.id}</div>
                          {/* FONT 2: INTER BLACK */}
                          <div className="crs-card-name" style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.2, color: "var(--text-main)" }}>{c.name}</div>
                          <div className="crs-card-instructor" style={{ fontSize: 18, marginTop: 4, marginBottom: 20, color: "var(--dimmer)", fontWeight: 600 }}>
                            {c.instructor}
                          </div>
                          <div className="crs-card-pills" style={{ gap: 12, marginBottom: 32 }}>
                            <span className="crs-card-pill" style={{ background: dm.light, color: dm.accent, fontSize: 15, padding: "8px 16px", borderRadius: 10, fontWeight: 800 }}>🏛️ {c.dept}</span>
                            <span className="crs-card-pill" style={{ background: "rgba(26,120,255,.08)", color: "var(--blue)", fontSize: 15, padding: "8px 16px", borderRadius: 10, fontWeight: 800 }}>⚡ {c.credits} cr</span>
                            <span className="crs-card-pill" style={{ background: "#f1f5f9", color: "var(--dimmer)", fontSize: 15, padding: "8px 16px", borderRadius: 10, fontWeight: 800 }}>📅 Sem {c.semester}</span>
                          </div>
                          
                          {/* FONT RULE 1 & 2 TOGETHER */}
                          <div className="crs-card-fill-wrap" style={{ marginTop: "auto", display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 18, color: "var(--dimmer)", fontWeight: 600 }}>Enrollment</span>
                            <span style={{ fontFamily: "'Bitcount Grid Double', monospace", color: fc.text, fontWeight: 700, fontSize: 28 }}>{c.enrolled}/{c.capacity}</span>
                          </div>
                        </div>
                        <div className="crs-card-footer" style={{ padding: "20px 32px", gap: 16 }}>
                          <button className="crs-card-btn crs-card-btn-edit" style={{ fontSize: 18, padding: "12px 24px" }} onClick={e=>{e.stopPropagation();setModal(c);}}>✏️ Edit</button>
                          <button className="crs-card-btn crs-card-btn-del" style={{ fontSize: 18, padding: "12px 24px" }} onClick={e=>{e.stopPropagation();handleDelete(c.id);}}>🗑️</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ══ LIST VIEW (SUPERSIZED) ══ */}
            {viewMode === "list" && (
              <div className="admin-isolated-card" style={{ padding: 0 }}>
                <div className="adm-table-wrap" style={{ borderRadius: 24 }}>
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>Course ID</th>
                        <th>Title</th>
                        <th>Dept</th>
                        <th>Type</th>
                        <th>Cr</th>
                        <th>Instructor</th>
                        <th>Sem</th>
                        <th style={{ minWidth: 160 }}>Enrollment</th>
                        <th>Status</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr><td colSpan={10} style={{ textAlign:"center",padding:"80px",color:"var(--dimmer)",opacity:.6,fontFamily:"'JetBrains Mono',monospace",fontSize:20,fontWeight:800 }}>📭 No courses match current filters</td></tr>
                      ) : filtered.map(c => {
                        const dm = DEPT_META[c.dept] || DEPT_META.CS;
                        const tm = TYPE_META[c.type] || TYPE_META.Core;
                        const pct = Math.round((c.enrolled/c.capacity)*100);
                        const fc = fillColor(c.enrolled,c.capacity);
                        return (
                          <tr key={c.id} className="crs-list-row adm-tr-hover" onClick={()=>setDetail(c)}>
                            <td className="td-mono">{c.id}</td>
                            <td>
                              <div style={{ display:"flex",alignItems:"center",gap:16 }}>
                                <div className="crs-list-icon" style={{ background: dm.grad, width: 44, height: 44, borderRadius: 12 }}>
                                  <span style={{ color:"#fff",fontSize:20,fontWeight:800 }}>{tm.icon}</span>
                                </div>
                                <span className="td-bold">{c.name}</span>
                              </div>
                            </td>
                            <td>
                              <span className="crs-dept-tag" style={{ background: dm.tag, color: dm.tagText, fontSize: 15, padding: "6px 12px", borderRadius: 8 }}>{c.dept}</span>
                            </td>
                            <td className="td-dim" style={{ fontSize: 16 }}>{c.type}</td>
                            <td style={{ fontFamily:"'Bitcount Grid Double',monospace",fontWeight:700,color:"var(--blue)",textAlign:"center",fontSize:28 }}>{c.credits}</td>
                            <td className="td-dim" style={{ fontSize: 16 }}>{c.instructor}</td>
                            <td className="td-dim" style={{ fontSize: 16 }}>{c.semester}</td>
                            <td>
                              <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                                <div className="adm-dept-bar-track" style={{ flex:1,height:8,minWidth:60,borderRadius:4,background:"#f1f5f9" }}>
                                  <div style={{ height:"100%",borderRadius:4,width:`${Math.min(pct,100)}%`,background:fc.bar }} />
                                </div>
                                <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:15,fontWeight:800,color:fc.text,whiteSpace:"nowrap" }}>{c.enrolled}/{c.capacity}</span>
                              </div>
                            </td>
                            <td><span className={`adm-badge badge-${c.status}`}>{c.status}</span></td>
                            <td onClick={e=>e.stopPropagation()} style={{ textAlign: "right" }}>
                              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                <button className="adm-action-btn" onClick={()=>setModal(c)} style={{ width: 44, height: 44, fontSize: 18 }}>✏️</button>
                                <button className="adm-action-btn btn-delete" onClick={()=>handleDelete(c.id)} style={{ width: 44, height: 44, fontSize: 18 }}>🗑️</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}