import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { gsap } from "gsap";
import Sidebar from "./Components/shared/Sidebar";
import { ADMIN_NAV } from "./config/AdminNav";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import AnimatedCounter from "./Utilities/AnimatedCounter";
import StatsGrid from "./data/StatsGrid";
import "./AdminTeachers.css"; // 🔥 100% ISOLATED CSS

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

// ── INLINE MODAL ──
function TeacherModal({ teacher, onClose, onSave }) {
  const [form, setForm] = useState(
    teacher
      ? { ...teacher }
      : { id: "", name: "", dept: "CS", designation: "Lecturer", email: "", phone: "", status: "active", courses: 0, experience: "", specialization: "" }
  );
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" style={{ width: "min(900px, 95vw)", maxHeight: "90vh", overflowY: "auto", padding: "48px" }} onClick={e => e.stopPropagation()}>
        <div className="adm-modal-hd" style={{ marginBottom: 32 }}>
          <div className="adm-modal-title" style={{ fontSize: 36 }}>{teacher ? "Edit Teacher" : "Add New Teacher"}</div>
          <button className="adm-modal-close" style={{ fontSize: 32 }} onClick={onClose}>✕</button>
        </div>
        <div className="adm-form-grid" style={{ gap: 24 }}>
          <div className="adm-form-group">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Faculty ID</label>
            <input className="adm-form-input" style={{ fontSize: 24, padding: "20px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }} value={form.id} onChange={e => set("id", e.target.value)} placeholder="e.g. FAC-011" />
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Full Name</label>
            <input className="adm-form-input" style={{ fontSize: 24, padding: "20px", fontWeight: 800 }} value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Dr. Ali Raza" />
          </div>
          <div className="adm-form-group full">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Email</label>
            <input className="adm-form-input" style={{ fontSize: 20, padding: "18px", fontFamily: "'JetBrains Mono', monospace" }} value={form.email} onChange={e => set("email", e.target.value)} placeholder="faculty@nu.edu.pk" />
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Department</label>
            <select className="adm-form-select" style={{ fontSize: 20, padding: "18px" }} value={form.dept} onChange={e => set("dept", e.target.value)}>
              {["CS","EE","IS","MT","BBA"].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Designation</label>
            <select className="adm-form-select" style={{ fontSize: 20, padding: "18px" }} value={form.designation} onChange={e => set("designation", e.target.value)}>
              {DESIGNATIONS.slice(1).map(d => <option key={d}>{d}</option>)}
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
          <div className="adm-form-group">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Experience</label>
            <input className="adm-form-input" style={{ fontSize: 20, padding: "18px" }} value={form.experience} onChange={e => set("experience", e.target.value)} placeholder="e.g. 5 yrs" />
          </div>
          <div className="adm-form-group full">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Specialization</label>
            <input className="adm-form-input" style={{ fontSize: 20, padding: "18px" }} value={form.specialization} onChange={e => set("specialization", e.target.value)} placeholder="e.g. Machine Learning" />
          </div>
        </div>
        <div className="adm-modal-footer" style={{ marginTop: 48 }}>
          <button className="adm-btn-secondary" style={{ fontSize: 20, padding: "16px 32px" }} onClick={onClose}>Cancel</button>
          <button className="adm-btn-primary" style={{ fontSize: 20, padding: "16px 32px" }} onClick={() => onSave(form)}>
            {teacher ? "Save Changes" : "➕ Add Teacher"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ──
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
  const [modal,      setModal]      = useState(null); 
  const [showStats,  setShowStats]  = useState(false);

  const filtered = teachers.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.id.toLowerCase().includes(q) || t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q) || t.specialization.toLowerCase().includes(q);
    const matchDept   = deptFilter === "All" || t.dept === deptFilter;
    const matchDesg   = desgFilter === "All" || t.designation === desgFilter;
    const matchStat   = statFilter === "All" || t.status === statFilter;
    return matchSearch && matchDept && matchDesg && matchStat;
  });

  const handleSave = (form) => {
    if (modal === "add") setTeachers(prev => [form, ...prev]);
    else setTeachers(prev => prev.map(t => t.id === form.id ? form : t));
    setModal(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this teacher record? This cannot be undone.")) {
      setTeachers(prev => prev.filter(t => t.id !== id));
    }
  };

  // Three.js Background (Unified Blue Theme)
  useEffect(() => {
    const canvas = webglRef.current;
    let W = window.innerWidth, H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H); renderer.setClearColor(0xf0f5ff, 1);
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
    camera.position.set(0, 3, 12);
    
    scene.add(new THREE.AmbientLight(0x0033aa, 0.6));
    const sun = new THREE.DirectionalLight(0x40a9ff, 1.2); sun.position.set(-6, 12, 8); scene.add(sun);
    
    const COUNT = 140;
    const ptPos = new Float32Array(COUNT*3); const ptCol = new Float32Array(COUNT*3); const ptVel = [];
    for (let i=0;i<COUNT;i++){
      ptPos[i*3]=(Math.random()-.5)*34; ptPos[i*3+1]=(Math.random()-.5)*22; ptPos[i*3+2]=(Math.random()-.5)*18-6;
      ptVel.push({x:(Math.random()-.5)*.008,y:(Math.random()-.5)*.006});
      ptCol[i*3]=.1; ptCol[i*3+1]=.5; ptCol[i*3+2]=1;
    }
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute("position", new THREE.BufferAttribute(ptPos,3));
    ptGeo.setAttribute("color",    new THREE.BufferAttribute(ptCol,3));
    scene.add(new THREE.Points(ptGeo, new THREE.PointsMaterial({size:.05,transparent:true,opacity:.6,vertexColors:true})));
    let nmx=0,nmy=0;
    const onMove=e=>{nmx=(e.clientX/W)*2-1;nmy=-(e.clientY/H)*2+1;};
    document.addEventListener("mousemove",onMove);
    let animId;
    const loop=()=>{
      animId=requestAnimationFrame(loop);
      const p=ptGeo.attributes.position.array;
      for(let i=0;i<COUNT;i++){
        p[i*3]+=ptVel[i].x+nmx*.001;p[i*3+1]+=ptVel[i].y+nmy*.001;
        if(p[i*3]>17)p[i*3]=-17;if(p[i*3]<-17)p[i*3]=17;
        if(p[i*3+1]>11)p[i*3+1]=-11;if(p[i*3+1]<-11)p[i*3+1]=11;
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
    document.querySelectorAll(".sc, .admin-isolated-card").forEach((el, i) => {
      gsap.fromTo(el, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", delay: i * 0.06 });
    });
    setTimeout(() => setShowStats(true), 100);
  }, [deptFilter, desgFilter, statFilter]); 

  // Designation Rank Color Helper (Unified Colors)
  const desgColor = (d) => {
    if (d === "Professor")           return { bg: "rgba(26,120,255,.12)", color: "var(--blue)"   };
    if (d === "Associate Professor") return { bg: "rgba(64,169,255,.12)", color: "var(--blue2)"  };
    if (d === "Assistant Professor") return { bg: "rgba(0,200,83,.12)",   color: "var(--green)"  };
    return                                  { bg: "rgba(255,171,0,.12)",  color: "var(--amber)"  };
  };

  return (
    <div className="admin-tch-wrapper">
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
            <div className="pg-title"><span>Teacher Records</span></div>
            <div className="tb-r">
              <div className="sem-chip">{teachers.length} Total</div>
              <button className="adm-btn-primary" onClick={() => setModal("add")} style={{ fontSize: 18, padding: "10px 24px", marginLeft: 12 }}>
                ➕ Add Teacher
              </button>
            </div>
          </div>

          <div id="scroll">

            {/* ── GODZILLA STATS GRID ── */}
            <StatsGrid
              showStats={showStats}
              cards={[
                { cls: "sc-a", label: "Total Faculty",  value: teachers.length,                                  special: "none"    },
                { cls: "sc-d", label: "Active Status",  value: teachers.filter(t=>t.status==="active").length,   special: "bubbles" },
                { cls: "sc-b", label: "Pending Rev.",   value: teachers.filter(t=>t.status==="pending").length,  special: "none"    },
                { cls: "sc-c", label: "Inactive/Leave", value: teachers.filter(t=>t.status==="inactive").length, special: "fire"    },
              ]}
            />

            {/* 🔥 HORIZONTAL FILTER BAR 🔥 */}
            <div className="admin-isolated-card" style={{ marginBottom: 40, padding: "24px 32px" }}>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 20, width: "100%" }}>
                <div className="adm-filter-search" style={{ padding: "16px 20px", flex: 1, minWidth: 300 }}>
                  <span style={{ color: "#94a3b8", fontSize: 22 }}>🔍</span>
                  <input
                    style={{ fontSize: 20 }}
                    placeholder="Search by name, ID, email, or specialization…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <select className="adm-filter-select" style={{ fontSize: 18, padding: "16px 20px" }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                  {DEPTS.map(d => <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>)}
                </select>
                <select className="adm-filter-select" style={{ fontSize: 18, padding: "16px 20px" }} value={desgFilter} onChange={e => setDesgFilter(e.target.value)}>
                  {DESIGNATIONS.map(d => <option key={d} value={d}>{d === "All" ? "All Designations" : d}</option>)}
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
                      <th>Faculty ID</th>
                      <th>Name</th>
                      <th>Dept</th>
                      <th>Designation</th>
                      <th>Specialization</th>
                      <th>Courses</th>
                      <th>Experience</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={9} style={{ textAlign: "center", padding: "80px", color: "var(--dimmer)", opacity: .6, fontSize: 20, fontWeight: 800 }}>
                          📭 No teachers match the current filters.
                        </td>
                      </tr>
                    ) : filtered.map(t => {
                      const dc = desgColor(t.designation);
                      return (
                        <tr key={t.id} className="adm-tr-hover">
                          <td className="td-mono">{t.id}</td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                              <div style={{
                                width: 56, height: 56, borderRadius: 16,
                                background: "linear-gradient(135deg,var(--blue),var(--blue2))",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 20, fontWeight: 900, color: "#fff", flexShrink: 0,
                                boxShadow: "0 4px 12px rgba(26,120,255,.3)"
                              }}>
                                {t.name.replace(/^(Dr\.|Ms\.|Mr\.)\s*/i, "").split(" ").map(n => n[0]).join("").slice(0, 2)}
                              </div>
                              <div>
                                <div className="td-bold">{t.name}</div>
                                <div style={{ fontSize: 16, color: "var(--dimmer)", fontFamily: "'JetBrains Mono',monospace", marginTop: 4 }}>{t.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{
                              fontFamily: "'JetBrains Mono',monospace", fontSize: 16,
                              fontWeight: 900, padding: "8px 16px", borderRadius: 10,
                              background: "rgba(26,120,255,.08)", color: "var(--blue)", border: "1px solid rgba(26,120,255,.2)"
                            }}>
                              {t.dept}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              fontFamily: "'Inter',sans-serif", fontSize: 15,
                              fontWeight: 800, padding: "8px 16px", borderRadius: 10,
                              background: dc.bg, color: dc.color, border: `1px solid ${dc.color}40`,
                              whiteSpace: "nowrap"
                            }}>
                              {t.designation}
                            </span>
                          </td>
                          <td className="td-dim" style={{ fontSize: 18 }}>{t.specialization}</td>
                          
                          {/* 2-FONT RULE: BITCOUNT FOR NUMBERS */}
                          <td style={{ fontFamily: "'Bitcount Grid Double', monospace", fontSize: 28, fontWeight: 700, color: t.courses === 0 ? "var(--dimmer)" : "var(--blue)", textAlign: "center" }}>
                            {t.courses}
                          </td>
                          <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 18, fontWeight: 700, color: "var(--text-main)" }}>
                            {t.experience || "—"}
                          </td>
                          
                          <td>
                            <span className={`adm-badge badge-${t.status}`}>{t.status}</span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                              <button className="adm-action-btn" title="Edit" onClick={() => setModal(t)} style={{ width: 52, height: 52, fontSize: 22 }}>✏️</button>
                              <button className="adm-action-btn btn-delete" title="Delete" onClick={() => handleDelete(t.id)} style={{ width: 52, height: 52, fontSize: 22 }}>🗑️</button>
                            </div>
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
    </div>
  );
}