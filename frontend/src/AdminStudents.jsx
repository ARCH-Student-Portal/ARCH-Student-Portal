import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Components/shared/Sidebar";
import { ADMIN_NAV } from "./config/AdminNav";
import { gsap } from "gsap";
import { AnimatePresence } from "framer-motion";
import useWebGLBackground from "./Utilities/UseWebGLBackground";
import StatsGrid from "./data/StatsGrid";
import AdminApi from "./config/adminApi";
import "./AdminStudents.css";

const DEPTS  = ["All", "CS", "EE", "MT", "IS", "BBA"];
const SEMS   = ["All", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
const STATUS = ["All", "active", "inactive", "pending"];

// Map backend doc → UI row
const mapStudent = (s) => ({
  _id:      s._id,
  id:       s.rollNumber,
  name:     s.name,
  prog:     s.program  || "—",
  dept:     s.department || "—",
  sem:      s.semester  || "—",
  email:    s.email,
  phone:    s.phone     || "—",
  status:   s.status    || "active",
  cgpa:     s.cgpa != null ? String(s.cgpa) : "—",
  enrolled: s.enrolledCredits ?? 0,
});

// Map UI form → backend payload
const mapToPayload = (form) => ({
  rollNumber:  form.id,
  name:        form.name,
  program:     form.prog,
  department:  form.dept,
  semester:    form.sem,
  email:       form.email,
  phone:       form.phone,
  status:      form.status,
});

// ── MODAL ──
function StudentModal({ student, onClose, onSave, saving }) {
  const [form, setForm] = useState(
    student
      ? { ...student }
      : { id: "", name: "", prog: "BS-CS", dept: "CS", sem: "1st", email: "", phone: "", status: "active", cgpa: "—", enrolled: 0 }
  );
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" style={{ width: "min(900px, 95vw)", maxHeight: "90vh", overflowY: "auto", padding: "48px" }} onClick={e => e.stopPropagation()}>
        <div className="adm-modal-hd" style={{ marginBottom: 32 }}>
          <div className="adm-modal-title" style={{ fontSize: 36 }}>{student ? "Edit Student" : "Add New Student"}</div>
          <button className="adm-modal-close" style={{ fontSize: 32 }} onClick={onClose}>✕</button>
        </div>
        <div className="adm-form-grid" style={{ gap: 24 }}>
          <div className="adm-form-group">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Roll Number</label>
            <input className="adm-form-input" style={{ fontSize: 24, padding: "20px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }} value={form.id} onChange={e => set("id", e.target.value)} placeholder="e.g. 24K-0001" />
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Full Name</label>
            <input className="adm-form-input" style={{ fontSize: 24, padding: "20px", fontWeight: 800 }} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Full name" />
          </div>
          <div className="adm-form-group full">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Email</label>
            <input className="adm-form-input" style={{ fontSize: 20, padding: "18px", fontFamily: "'JetBrains Mono', monospace" }} value={form.email} onChange={e => set("email", e.target.value)} placeholder="student@stu.nu.edu.pk" />
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Program</label>
            <select className="adm-form-select" style={{ fontSize: 20, padding: "18px" }} value={form.prog} onChange={e => set("prog", e.target.value)}>
              {["BS-CS","BS-EE","BS-IS","BS-MT","BS-BBA","MS-CS"].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Department</label>
            <select className="adm-form-select" style={{ fontSize: 20, padding: "18px" }} value={form.dept} onChange={e => set("dept", e.target.value)}>
              {["CS","EE","IS","MT","BBA"].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Semester</label>
            <select className="adm-form-select" style={{ fontSize: 20, padding: "18px" }} value={form.sem} onChange={e => set("sem", e.target.value)}>
              {SEMS.slice(1).map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Status</label>
            <select className="adm-form-select" style={{ fontSize: 20, padding: "18px", fontWeight: 800, color: form.status === "active" ? "var(--green)" : form.status === "inactive" ? "var(--red)" : "var(--amber)" }} value={form.status} onChange={e => set("status", e.target.value)}>
              {["active","inactive","pending"].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Phone</label>
            <input className="adm-form-input" style={{ fontSize: 20, padding: "18px", fontFamily: "'JetBrains Mono', monospace" }} value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+92-300-0000000" />
          </div>
        </div>
        <div className="adm-modal-footer" style={{ marginTop: 48 }}>
          <button className="adm-btn-secondary" style={{ fontSize: 20, padding: "16px 32px" }} onClick={onClose} disabled={saving}>Cancel</button>
          <button className="adm-btn-primary" style={{ fontSize: 20, padding: "16px 32px", opacity: saving ? 0.6 : 1 }} onClick={() => onSave(form)} disabled={saving}>
            {saving ? "Saving…" : student ? "Save Changes" : "➕ Add Student"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN ──
export default function AdminStudents() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const webglRef  = useRef(null);

  const [collapse,   setCollapse]   = useState(false);
  const [students,   setStudents]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [saving,     setSaving]     = useState(false);

  // pagination
  const [page,       setPage]       = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 10;

  const [search,     setSearch]     = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [semFilter,  setSemFilter]  = useState("All");
  const [statFilter, setStatFilter] = useState("All");
  const [modal,      setModal]      = useState(null);
  const [showStats,  setShowStats]  = useState(false);

  // ── FETCH ──
  const fetchStudents = useCallback(async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const res = await AdminApi.getStudents(p, PAGE_SIZE);
      if (res.students) {
        setStudents(res.students.map(mapStudent));
        setTotalCount(res.total ?? res.students.length);
      } else {
        setError(res.message || "Failed to load students");
      }
    } catch (e) {
      setError("Network error — backend down?");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchStudents(page); }, [page]);

  // ── FILTER (client-side on current page) ──
  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.id.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    const matchDept   = deptFilter === "All" || s.dept   === deptFilter;
    const matchSem    = semFilter  === "All" || s.sem    === semFilter;
    const matchStat   = statFilter === "All" || s.status === statFilter;
    return matchSearch && matchDept && matchSem && matchStat;
  });

  // ── SAVE (create / update) ──
  const handleSave = async (form) => {
    setSaving(true);
    try {
      const payload = mapToPayload(form);
      let res;
      if (modal === "add") {
        res = await AdminApi.createStudent(payload);
        if (res._id || res.student) {
          const created = mapStudent(res.student || res);
          setStudents(prev => [created, ...prev]);
          setTotalCount(c => c + 1);
        } else {
          alert(res.message || "Create failed");
          return;
        }
      } else {
        // modal holds the existing student row (has _id)
        res = await AdminApi.updateStudent(modal._id, payload);
        if (res._id || res.student) {
          const updated = mapStudent(res.student || res);
          setStudents(prev => prev.map(s => s._id === updated._id ? updated : s));
        } else {
          alert(res.message || "Update failed");
          return;
        }
      }
      setModal(null);
    } catch (e) {
      alert("Network error");
    } finally {
      setSaving(false);
    }
  };

  // ── DELETE ──
  const handleDelete = async (_id, rollNumber) => {
    if (!window.confirm(`Delete ${rollNumber}? Cannot be undone.`)) return;
    try {
      const res = await AdminApi.deleteStudent(_id);
      if (res.message?.toLowerCase().includes("deleted") || res.success) {
        setStudents(prev => prev.filter(s => s._id !== _id));
        setTotalCount(c => c - 1);
      } else {
        alert(res.message || "Delete failed");
      }
    } catch (e) {
      alert("Network error");
    }
  };

  useWebGLBackground(webglRef);

  useEffect(() => {
    document.querySelectorAll(".sc, .admin-isolated-card").forEach((el, i) => {
      gsap.fromTo(el, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", delay: i * 0.06 });
    });
    setTimeout(() => setShowStats(true), 100);
  }, [deptFilter, semFilter, statFilter]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="admin-stu-wrapper">
      <canvas id="adm-webgl" ref={webglRef} />

      <AnimatePresence>
        {modal && (
          <StudentModal
            student={modal === "add" ? null : modal}
            onClose={() => setModal(null)}
            onSave={handleSave}
            saving={saving}
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
            <div className="pg-title"><span>Student Records</span></div>
            <div className="tb-r">
              <div className="sem-chip">{totalCount} Total</div>
              <button className="adm-btn-primary" onClick={() => setModal("add")} style={{ fontSize: 18, padding: "10px 24px", marginLeft: 12 }}>
                ➕ Add Student
              </button>
            </div>
          </div>

          <div id="scroll">

            {/* ERROR BANNER */}
            {error && (
              <div style={{ background: "rgba(239,68,68,.15)", border: "1px solid var(--red)", borderRadius: 16, padding: "16px 24px", marginBottom: 24, color: "var(--red)", fontWeight: 700, fontSize: 18 }}>
                ⚠️ {error} — <button style={{ color: "var(--blue)", background: "none", border: "none", cursor: "pointer", fontWeight: 800 }} onClick={() => fetchStudents(page)}>Retry</button>
              </div>
            )}

            {/* STATS */}
            <StatsGrid
              showStats={showStats}
              cards={[
                { cls: "sc-a", label: "Total Enrolled",  value: totalCount,                                          special: "none"    },
                { cls: "sc-d", label: "Active Status",   value: students.filter(s => s.status === "active").length,  special: "bubbles" },
                { cls: "sc-b", label: "Pending Rev.",    value: students.filter(s => s.status === "pending").length, special: "none"    },
                { cls: "sc-c", label: "Inactive/Alum",  value: students.filter(s => s.status === "inactive").length, special: "fire"    },
              ]}
            />

            {/* FILTER BAR */}
            <div className="admin-isolated-card" style={{ marginBottom: 40, padding: "24px 32px" }}>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 20, width: "100%" }}>
                <div className="adm-filter-search" style={{ padding: "16px 20px", flex: 1, minWidth: 300 }}>
                  <span style={{ color: "#94a3b8", fontSize: 22 }}>🔍</span>
                  <input
                    style={{ fontSize: 20 }}
                    placeholder="Search by name, roll number, or email…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <select className="adm-filter-select" style={{ fontSize: 18, padding: "16px 20px" }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                  {DEPTS.map(d => <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>)}
                </select>
                <select className="adm-filter-select" style={{ fontSize: 18, padding: "16px 20px" }} value={semFilter} onChange={e => setSemFilter(e.target.value)}>
                  {SEMS.map(s => <option key={s} value={s}>{s === "All" ? "All Semesters" : `Sem ${s}`}</option>)}
                </select>
                <select className="adm-filter-select" style={{ fontSize: 18, padding: "16px 20px" }} value={statFilter} onChange={e => setStatFilter(e.target.value)}>
                  {STATUS.map(s => <option key={s} value={s}>{s === "All" ? "All Status" : s.toUpperCase()}</option>)}
                </select>
                <div className="adm-filter-count" style={{ fontSize: 18, padding: "16px 24px" }}>
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>

            {/* TABLE */}
            <div className="admin-isolated-card" style={{ padding: 0 }}>
              <div className="adm-table-wrap" style={{ borderRadius: 24 }}>
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Roll No.</th>
                      <th>Name</th>
                      <th>Program</th>
                      <th>Dept</th>
                      <th>Semester</th>
                      <th>CGPA</th>
                      <th>Enrolled Cr</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={9} style={{ textAlign: "center", padding: "80px", color: "var(--dimmer)", fontSize: 20, fontWeight: 800 }}>
                          ⏳ Loading students…
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={9} style={{ textAlign: "center", padding: "80px", color: "var(--dimmer)", opacity: .6, fontSize: 20, fontWeight: 800 }}>
                          📭 No students match the current filters.
                        </td>
                      </tr>
                    ) : filtered.map(s => (
                      <tr key={s._id} className="adm-tr-hover">
                        <td className="td-mono">{s.id}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <div style={{
                              width: 56, height: 56, borderRadius: 16,
                              background: "linear-gradient(135deg,var(--blue),var(--blue2))",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 20, fontWeight: 900, color: "#fff", flexShrink: 0,
                              boxShadow: "0 4px 12px rgba(26,120,255,.3)"
                            }}>
                              {s.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </div>
                            <div>
                              <div className="td-bold">{s.name}</div>
                              <div style={{ fontSize: 16, color: "var(--dimmer)", fontFamily: "'JetBrains Mono',monospace", marginTop: 4 }}>{s.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="td-dim">{s.prog}</td>
                        <td>
                          <span style={{
                            fontFamily: "'JetBrains Mono',monospace", fontSize: 16,
                            fontWeight: 900, padding: "8px 16px", borderRadius: 10,
                            background: "rgba(26,120,255,.08)", color: "var(--blue)", border: "1px solid rgba(26,120,255,.2)"
                          }}>
                            {s.dept}
                          </span>
                        </td>
                        <td className="td-dim">{s.sem}</td>
                        <td style={{ fontFamily: "'Bitcount Grid Double', monospace", fontSize: 28, fontWeight: 700, color: s.cgpa === "—" ? "var(--dimmer)" : "var(--blue)" }}>
                          {s.cgpa}
                        </td>
                        <td style={{ fontFamily: "'Bitcount Grid Double', monospace", fontSize: 28, fontWeight: 700, color: "var(--text-main)" }}>
                          {s.enrolled}
                        </td>
                        <td>
                          <span className={`adm-badge badge-${s.status}`}>{s.status}</span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            <button className="adm-action-btn" title="Edit" onClick={() => setModal(s)} style={{ width: 52, height: 52, fontSize: 22 }}>✏️</button>
                            <button className="adm-action-btn btn-delete" title="Delete" onClick={() => handleDelete(s._id, s.id)} style={{ width: 52, height: 52, fontSize: 22 }}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, padding: "24px 32px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
                  <button
                    className="adm-btn-secondary"
                    style={{ fontSize: 18, padding: "10px 24px" }}
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    ← Prev
                  </button>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 18, color: "var(--dimmer)" }}>
                    Page {page} / {totalPages}
                  </span>
                  <button
                    className="adm-btn-secondary"
                    style={{ fontSize: 18, padding: "10px 24px" }}
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}