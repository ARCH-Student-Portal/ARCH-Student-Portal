import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "./Components/shared/AdminSidebar";
import { ADMIN_NAV } from "./config/AdminNav";
import "./AdminPortal.css";

const INITIAL_TEACHERS = [
  { id: "FAC-001", name: "Dr. Imran Sheikh",     dept: "CS",  designation: "Associate Professor", email: "imran.sheikh@nu.edu.pk",   phone: "+92-300-1010101", status: "active",   courses: 3, experience: "12 yrs", specialization: "Machine Learning"       },
  { id: "FAC-002", name: "Ms. Ayesha Tariq",     dept: "CS",  designation: "Lecturer",            email: "ayesha.tariq@nu.edu.pk",   phone: "+92-301-2020202", status: "active",   courses: 4, experience: "5 yrs",  specialization: "Web Technologies"       },
  { id: "FAC-003", name: "Dr. Zafar Iqbal",      dept: "EE",  designation: "Professor",           email: "zafar.iqbal@nu.edu.pk",    phone: "+92-302-3030303", status: "active",   courses: 2, experience: "20 yrs", specialization: "Power Systems"          },
  { id: "FAC-004", name: "Mr. Hamza Nawaz",      dept: "CS",  designation: "Lecturer",            email: "hamza.nawaz@nu.edu.pk",    phone: "+92-303-4040404", status: "active",   courses: 3, experience: "3 yrs",  specialization: "Data Structures"        },
  { id: "FAC-005", name: "Dr. Sana Riaz",        dept: "IS",  designation: "Assistant Professor", email: "sana.riaz@nu.edu.pk",      phone: "+92-311-5050505", status: "active",   courses: 3, experience: "8 yrs",  specialization: "Information Security"   },
  { id: "FAC-006", name: "Mr. Bilal Chaudhry",   dept: "MT",  designation: "Lecturer",            email: "bilal.chaudhry@nu.edu.pk", phone: "+92-321-6060606", status: "inactive", courses: 0, experience: "6 yrs",  specialization: "Calculus & Linear Alg"  },
  { id: "FAC-007", name: "Dr. Huma Aslam",       dept: "CS",  designation: "Associate Professor", email: "huma.aslam@nu.edu.pk",     phone: "+92-333-7070707", status: "active",   courses: 2, experience: "10 yrs", specialization: "Computer Networks"      },
  { id: "FAC-008", name: "Ms. Rida Fatima",      dept: "BBA", designation: "Lecturer",            email: "rida.fatima@nu.edu.pk",    phone: "+92-345-8080808", status: "pending",  courses: 0, experience: "2 yrs",  specialization: "Business Communication" },
  { id: "FAC-009", name: "Dr. Usman Ghani",      dept: "EE",  designation: "Professor",           email: "usman.ghani@nu.edu.pk",    phone: "+92-300-9090909", status: "active",   courses: 3, experience: "17 yrs", specialization: "Digital Signal Proc."   },
  { id: "FAC-010", name: "Mr. Kamran Bashir",    dept: "CS",  designation: "Lecturer",            email: "kamran.bashir@nu.edu.pk",  phone: "+92-301-1234321", status: "active",   courses: 4, experience: "4 yrs",  specialization: "Operating Systems"      },
];

const DEPTS        = ["All", "CS", "EE", "MT", "IS", "BBA"];
const DESIGNATIONS = ["All", "Professor", "Associate Professor", "Assistant Professor", "Lecturer"];
const STATUS       = ["All", "active", "inactive", "pending"];

function TeacherModal({ teacher, onClose, onSave }) {
  const [form, setForm] = useState(
    teacher
      ? { ...teacher }
      : { id: "", name: "", dept: "CS", designation: "Lecturer", email: "", phone: "", status: "active", courses: 0, experience: "", specialization: "" }
  );
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={e => e.stopPropagation()}>
        <div className="adm-modal-hd">
          <div className="adm-modal-title">{teacher ? "Edit Teacher" : "Add New Teacher"}</div>
          <button className="adm-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="adm-form-grid">
          <div className="adm-form-group">
            <label className="adm-form-label">Faculty ID</label>
            <input className="adm-form-input" value={form.id} onChange={e => set("id", e.target.value)} placeholder="e.g. FAC-011" />
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label">Full Name</label>
            <input className="adm-form-input" value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Dr. Ali Raza" />
          </div>
          <div className="adm-form-group full">
            <label className="adm-form-label">Email</label>
            <input className="adm-form-input" value={form.email} onChange={e => set("email", e.target.value)} placeholder="faculty@nu.edu.pk" />
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label">Department</label>
            <select className="adm-form-select" value={form.dept} onChange={e => set("dept", e.target.value)}>
              {["CS","EE","IS","MT","BBA"].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label">Designation</label>
            <select className="adm-form-select" value={form.designation} onChange={e => set("designation", e.target.value)}>
              {DESIGNATIONS.slice(1).map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label">Status</label>
            <select className="adm-form-select" value={form.status} onChange={e => set("status", e.target.value)}>
              {["active","inactive","pending"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label">Phone</label>
            <input className="adm-form-input" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+92-300-0000000" />
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label">Experience</label>
            <input className="adm-form-input" value={form.experience} onChange={e => set("experience", e.target.value)} placeholder="e.g. 5 yrs" />
          </div>
          <div className="adm-form-group full">
            <label className="adm-form-label">Specialization</label>
            <input className="adm-form-input" value={form.specialization} onChange={e => set("specialization", e.target.value)} placeholder="e.g. Machine Learning" />
          </div>
        </div>
        <div className="adm-modal-footer">
          <button className="adm-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="adm-btn-primary" onClick={() => onSave(form)}>
            {teacher ? "Save Changes" : "Add Teacher"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminTeachers() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const webglRef  = useRef(null);

  const [collapse,   setCollapse]   = useState(false);
  const [teachers,   setTeachers]   = useState(INITIAL_TEACHERS);
  const [search,     setSearch]     = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [desgFilter, setDesgFilter] = useState("All");
  const [statFilter, setStatFilter] = useState("All");
  const [modal,      setModal]      = useState(null); // null | "add" | teacher object

  const filtered = teachers.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.id.toLowerCase().includes(q) || t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q) || t.specialization.toLowerCase().includes(q);
    const matchDept   = deptFilter === "All" || t.dept === deptFilter;
    const matchDesg   = desgFilter === "All" || t.designation === desgFilter;
    const matchStat   = statFilter === "All" || t.status === statFilter;
    return matchSearch && matchDept && matchDesg && matchStat;
  });

  const handleSave = (form) => {
    if (modal === "add") {
      setTeachers(prev => [form, ...prev]);
    } else {
      setTeachers(prev => prev.map(t => t.id === form.id ? form : t));
    }
    setModal(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this teacher record? This cannot be undone.")) {
      setTeachers(prev => prev.filter(t => t.id !== id));
    }
  };

  useEffect(() => {
    document.querySelectorAll(".adm-card").forEach((el, i) => {
      gsap.fromTo(el, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", delay: i * 0.08 });
    });
  }, []);

  // Three.js background — same as AdminStudents
  useEffect(() => {
    const canvas = webglRef.current;
    let W = window.innerWidth, H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H); renderer.setClearColor(0xf0f5ff, 1);
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
    camera.position.set(0, 3, 12);
    scene.add(new THREE.AmbientLight(0x4400aa, 0.6));
    const sun = new THREE.DirectionalLight(0x9966ff, 1.2); sun.position.set(-6, 12, 8); scene.add(sun);
    const COUNT = 140;
    const ptPos = new Float32Array(COUNT * 3);
    const ptCol = new Float32Array(COUNT * 3);
    const ptVel = [];
    for (let i = 0; i < COUNT; i++) {
      ptPos[i*3]   = (Math.random() - .5) * 34;
      ptPos[i*3+1] = (Math.random() - .5) * 22;
      ptPos[i*3+2] = (Math.random() - .5) * 18 - 6;
      ptVel.push({ x: (Math.random() - .5) * .008, y: (Math.random() - .5) * .006 });
      ptCol[i*3] = .5; ptCol[i*3+1] = .3; ptCol[i*3+2] = 1;
    }
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute("position", new THREE.BufferAttribute(ptPos, 3));
    ptGeo.setAttribute("color",    new THREE.BufferAttribute(ptCol, 3));
    scene.add(new THREE.Points(ptGeo, new THREE.PointsMaterial({ size: .05, transparent: true, opacity: .5, vertexColors: true })));
    let nmx = 0, nmy = 0;
    const onMove = e => { nmx = (e.clientX / W) * 2 - 1; nmy = -(e.clientY / H) * 2 + 1; };
    document.addEventListener("mousemove", onMove);
    let animId;
    const loop = () => {
      animId = requestAnimationFrame(loop);
      const p = ptGeo.attributes.position.array;
      for (let i = 0; i < COUNT; i++) {
        p[i*3]   += ptVel[i].x + nmx * .001;
        p[i*3+1] += ptVel[i].y + nmy * .001;
        if (p[i*3]   >  17) p[i*3]   = -17; if (p[i*3]   < -17) p[i*3]   = 17;
        if (p[i*3+1] >  11) p[i*3+1] = -11; if (p[i*3+1] < -11) p[i*3+1] = 11;
      }
      ptGeo.attributes.position.needsUpdate = true;
      camera.position.x += (nmx * .8   - camera.position.x) * .015;
      camera.position.y += (nmy * .5+3  - camera.position.y) * .015;
      camera.lookAt(0, 0, 0); renderer.render(scene, camera);
    };
    loop();
    const onResize = () => { W = window.innerWidth; H = window.innerHeight; renderer.setSize(W, H); camera.aspect = W / H; camera.updateProjectionMatrix(); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); document.removeEventListener("mousemove", onMove); window.removeEventListener("resize", onResize); };
  }, []);

  // Designation rank colour helper
  const desgColor = (d) => {
    if (d === "Professor")           return { bg: "rgba(124,58,237,.1)",  color: "var(--purple)" };
    if (d === "Associate Professor") return { bg: "rgba(26,120,255,.1)",  color: "var(--blue)"   };
    if (d === "Assistant Professor") return { bg: "rgba(0,201,110,.1)",   color: "#059669"       };
    return                                  { bg: "rgba(255,171,0,.1)",   color: "#b45309"       };
  };

  return (
    <>
      <canvas id="adm-webgl" ref={webglRef} />

      <AnimatePresence>
        {modal && (
          <TeacherModal
            teacher={modal === "add" ? null : modal}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      <div id="adm-app">
        {/* ── SIDEBAR ── */}
        <AdminSidebar
          sections={ADMIN_NAV}
          collapse={collapse}
          onToggle={() => setCollapse(c => !c)}
        />

        {/* ── MAIN ── */}
        <div id="adm-main">
          <div id="adm-topbar">
            <div className="adm-topbar-glow" />
            <div className="adm-pg-title">Teacher Records</div>
            <div className="adm-tb-r">
              <div className="adm-sem-chip">{teachers.length} total</div>
              <button className="adm-btn-primary" onClick={() => setModal("add")}>
                ➕ Add Teacher
              </button>
            </div>
          </div>

          <div id="adm-scroll">

            {/* Summary stat chips */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              {[
                { label: "Active",      val: teachers.filter(t => t.status === "active").length,   color: "var(--green)"  },
                { label: "Inactive",    val: teachers.filter(t => t.status === "inactive").length, color: "var(--red)"    },
                { label: "Pending",     val: teachers.filter(t => t.status === "pending").length,  color: "var(--amber)"  },
                { label: "Showing",     val: filtered.length,                                      color: "var(--purple)" },
              ].map(chip => (
                <div key={chip.label} style={{
                  padding: "8px 18px", borderRadius: 20,
                  background: "#ffffff", border: "1px solid rgba(18,78,170,.14)",
                  fontSize: 13, fontWeight: 700, color: "var(--text-main)",
                  display: "flex", alignItems: "center", gap: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,.04)"
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: chip.color, display: "inline-block" }} />
                  {chip.label}: <strong style={{ fontFamily: "'JetBrains Mono',monospace", color: chip.color }}>{chip.val}</strong>
                </div>
              ))}
            </div>

            {/* Filter bar */}
            <div className="adm-card" style={{ marginBottom: 20, padding: "16px 22px" }}>
              <div className="adm-filter-bar" style={{ marginBottom: 0 }}>
                <div className="adm-filter-search">
                  <span style={{ color: "#94a3b8" }}>🔍</span>
                  <input
                    placeholder="Search by name, ID, email, or specialization…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <select className="adm-filter-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                  {DEPTS.map(d => <option key={d}>{d === "All" ? "All Departments" : d}</option>)}
                </select>
                <select className="adm-filter-select" value={desgFilter} onChange={e => setDesgFilter(e.target.value)}>
                  {DESIGNATIONS.map(d => <option key={d}>{d === "All" ? "All Designations" : d}</option>)}
                </select>
                <select className="adm-filter-select" value={statFilter} onChange={e => setStatFilter(e.target.value)}>
                  {STATUS.map(s => <option key={s}>{s === "All" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
                <div className="adm-filter-count">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</div>
              </div>
            </div>

            {/* Table */}
            <div className="adm-card">
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Faculty ID</th>
                      <th>Name</th>
                      <th>Dept</th>
                      <th>Designation</th>
                      <th>Specialization</th>
                      <th>Courses</th>
                      <th>Experience</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={9} style={{ textAlign: "center", padding: "40px", color: "var(--dimmer)", opacity: .5, fontFamily: "'JetBrains Mono',monospace", fontSize: 13 }}>
                          No teachers match the current filters
                        </td>
                      </tr>
                    ) : filtered.map(t => {
                      const dc = desgColor(t.designation);
                      return (
                        <tr key={t.id}>
                          <td className="td-mono">{t.id}</td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{
                                width: 30, height: 30, borderRadius: 8,
                                background: "linear-gradient(135deg,var(--blue),var(--blue2))",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0
                              }}>
                                {t.name.replace(/^(Dr\.|Ms\.|Mr\.)\s*/i, "").split(" ").map(n => n[0]).join("").slice(0, 2)}
                              </div>
                              <div>
                                <div className="td-bold">{t.name}</div>
                                <div style={{ fontSize: 11, color: "var(--dimmer)", fontFamily: "'JetBrains Mono',monospace" }}>{t.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{
                              fontFamily: "'JetBrains Mono',monospace", fontSize: 12,
                              fontWeight: 800, padding: "3px 8px", borderRadius: 6,
                              background: "rgba(26,120,255,.08)", color: "var(--blue)"
                            }}>
                              {t.dept}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              fontFamily: "'Inter',sans-serif", fontSize: 11,
                              fontWeight: 700, padding: "3px 9px", borderRadius: 6,
                              background: dc.bg, color: dc.color,
                              whiteSpace: "nowrap"
                            }}>
                              {t.designation}
                            </span>
                          </td>
                          <td className="td-dim" style={{ fontSize: 12 }}>{t.specialization}</td>
                          <td style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, color: t.courses === 0 ? "var(--dimmer)" : "var(--purple)", fontSize: 13 }}>
                            {t.courses}
                          </td>
                          <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "var(--dimmer)" }}>
                            {t.experience || "—"}
                          </td>
                          <td>
                            <span className={`adm-badge badge-${t.status}`}>{t.status}</span>
                          </td>
                          <td>
                            <button className="adm-action-btn" title="Edit" onClick={() => setModal(t)}>✏️</button>
                            <button className="adm-action-btn btn-delete" title="Delete" onClick={() => handleDelete(t.id)}>🗑️</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}