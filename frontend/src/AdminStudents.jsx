import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import Sidebar from "./Components/shared/Sidebar";
import { ADMIN_NAV } from "./config/AdminNav";
import { gsap } from "gsap";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import AnimatedCounter from "./Utilities/AnimatedCounter";
import useWebGLBackground from "./Utilities/UseWebGLBackground";
import StatsGrid from "./data/StatsGrid";
import "./AdminStudents.css"; 

const INITIAL_STUDENTS = [
  { id: "24K-0001", name: "Ahmed Hassan",    prog: "BS-CS", dept: "CS",  sem: "1st", email: "24k-0001@stu.nu.edu.pk", phone: "+92-300-1111111", status: "active",   cgpa: "—",   enrolled: 3  },
  { id: "24K-0002", name: "Sara Malik",      prog: "BS-CS", dept: "CS",  sem: "1st", email: "24k-0002@stu.nu.edu.pk", phone: "+92-301-2222222", status: "active",   cgpa: "—",   enrolled: 3  },
  { id: "23K-1201", name: "Bilal Raza",      prog: "BS-EE", dept: "EE",  sem: "3rd", email: "23k-1201@stu.nu.edu.pk", phone: "+92-303-3333333", status: "active",   cgpa: "3.24",enrolled: 5  },
  { id: "22K-3210", name: "Areeb Bucha",     prog: "BS-CS", dept: "CS",  sem: "7th", email: "22k-3210@stu.nu.edu.pk", phone: "+92-300-1234567", status: "active",   cgpa: "3.82",enrolled: 5  },
  { id: "22K-2980", name: "Hira Baig",       prog: "BS-IS", dept: "IS",  sem: "5th", email: "22k-2980@stu.nu.edu.pk", phone: "+92-302-4444444", status: "active",   cgpa: "3.56",enrolled: 4  },
  { id: "21K-5002", name: "Omar Farooq",     prog: "BS-CS", dept: "CS",  sem: "7th", email: "21k-5002@stu.nu.edu.pk", phone: "+92-333-5555555", status: "active",   cgpa: "3.10",enrolled: 4  },
  { id: "20K-7710", name: "Nadia Khalid",    prog: "BS-MT", dept: "MT",  sem: "8th", email: "20k-7710@stu.nu.edu.pk", phone: "+92-311-6666666", status: "inactive", cgpa: "2.88",enrolled: 0  },
  { id: "23K-0451", name: "Zubair Ahmed",    prog: "BS-CS", dept: "CS",  sem: "3rd", email: "23k-0451@stu.nu.edu.pk", phone: "+92-345-7777777", status: "pending",  cgpa: "—",   enrolled: 0  },
  { id: "22K-1100", name: "Fatima Siddiqui", prog: "BS-CS", dept: "CS",  sem: "5th", email: "22k-1100@stu.nu.edu.pk", phone: "+92-300-8888888", status: "active",   cgpa: "3.67",enrolled: 5  },
  { id: "21K-9001", name: "Shahzaib Khan",   prog: "BS-EE", dept: "EE",  sem: "7th", email: "21k-9001@stu.nu.edu.pk", phone: "+92-321-9999999", status: "active",   cgpa: "2.95",enrolled: 3  },
];

const DEPTS  = ["All", "CS", "EE", "MT", "IS", "BBA"];
const SEMS   = ["All", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
const STATUS = ["All", "active", "inactive", "pending"];

// ── INLINE MODAL ──
function StudentModal({ student, onClose, onSave }) {
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
          <button className="adm-btn-secondary" style={{ fontSize: 20, padding: "16px 32px" }} onClick={onClose}>Cancel</button>
          <button className="adm-btn-primary" style={{ fontSize: 20, padding: "16px 32px" }} onClick={() => onSave(form)}>
            {student ? "Save Changes" : "➕ Add Student"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ──
export default function AdminStudents() {
  const navigate = useNavigate();
  const location = useLocation();
  const webglRef = useRef(null);

  const [collapse,   setCollapse]   = useState(false);
  const [students,   setStudents]   = useState(INITIAL_STUDENTS);
  const [search,     setSearch]     = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [semFilter,  setSemFilter]  = useState("All");
  const [statFilter, setStatFilter] = useState("All");
  const [modal,      setModal]      = useState(null); 
  const [showStats,  setShowStats]  = useState(false);

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.id.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    const matchDept   = deptFilter === "All" || s.dept === deptFilter;
    const matchSem    = semFilter  === "All" || s.sem  === semFilter;
    const matchStat   = statFilter === "All" || s.status === statFilter;
    return matchSearch && matchDept && matchSem && matchStat;
  });

  const handleSave = (form) => {
    if (modal === "add") setStudents(prev => [form, ...prev]);
    else setStudents(prev => prev.map(s => s.id === form.id ? form : s));
    setModal(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this student record? This cannot be undone.")) {
      setStudents(prev => prev.filter(s => s.id !== id));
    }
  };

  // Three.js Background (Unified Blue Theme)
  useWebGLBackground(webglRef);

  useEffect(() => {
    document.querySelectorAll(".sc, .admin-isolated-card").forEach((el, i) => {
      gsap.fromTo(el, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", delay: i * 0.06 });
    });
    setTimeout(() => setShowStats(true), 100);
  }, [deptFilter, semFilter, statFilter]); 

  return (
    <div className="admin-stu-wrapper">
      <canvas id="adm-webgl" ref={webglRef} />

      <AnimatePresence>
        {modal && (
          <StudentModal
            student={modal === "add" ? null : modal}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
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
            <div className="pg-title"><span>Student Records</span></div>
            <div className="tb-r">
              <div className="sem-chip">{students.length} Total</div>
              <button className="adm-btn-primary" onClick={() => setModal("add")} style={{ fontSize: 18, padding: "10px 24px", marginLeft: 12 }}>
                ➕ Add Student
              </button>
            </div>
          </div>

          <div id="scroll">

            {/* ── GODZILLA STATS GRID ── */}
            <StatsGrid
              showStats={showStats}
              cards={[
                { cls: "sc-a", label: "Total Enrolled", value: students.length,                                  special: "none"    },
                { cls: "sc-d", label: "Active Status",  value: students.filter(s=>s.status==="active").length,   special: "bubbles" },
                { cls: "sc-b", label: "Pending Rev.",   value: students.filter(s=>s.status==="pending").length,  special: "none"    },
                { cls: "sc-c", label: "Inactive/Alum",  value: students.filter(s=>s.status==="inactive").length, special: "fire"    },
              ]}
            />

            {/* 🔥 FIXED: HORIZONTAL FILTER BAR 🔥 */}
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

            {/* Table - ANTI SQUASH & GODZILLA SCALED */}
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
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={9} style={{ textAlign: "center", padding: "80px", color: "var(--dimmer)", opacity: .6, fontSize: 20, fontWeight: 800 }}>
                          📭 No students match the current filters.
                        </td>
                      </tr>
                    ) : filtered.map(s => (
                      <tr key={s.id} className="adm-tr-hover">
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
                              {s.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
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
                        
                        {/* 2-FONT RULE: BITCOUNT FOR NUMBERS */}
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
                            <button className="adm-action-btn btn-delete" title="Delete" onClick={() => handleDelete(s.id)} style={{ width: 52, height: 52, fontSize: 22 }}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}