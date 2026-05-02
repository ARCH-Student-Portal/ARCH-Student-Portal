import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { gsap } from "gsap";
import AdminSidebar from "./Components/shared/AdminSidebar";
import { ADMIN_NAV } from "./config/AdminNav";
import { motion, AnimatePresence } from "framer-motion";
import "./AdminPortal.css";

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

function StudentModal({ student, onClose, onSave }) {
  const [form, setForm] = useState(
    student
      ? { ...student }
      : { id: "", name: "", prog: "BS-CS", dept: "CS", sem: "1st", email: "", phone: "", status: "active", cgpa: "—", enrolled: 0 }
  );
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={e => e.stopPropagation()}>
        <div className="adm-modal-hd">
          <div className="adm-modal-title">{student ? "Edit Student" : "Add New Student"}</div>
          <button className="adm-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="adm-form-grid">
          <div className="adm-form-group">
            <label className="adm-form-label">Roll Number</label>
            <input className="adm-form-input" value={form.id} onChange={e => set("id", e.target.value)} placeholder="e.g. 24K-0001" />
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label">Full Name</label>
            <input className="adm-form-input" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Full name" />
          </div>
          <div className="adm-form-group full">
            <label className="adm-form-label">Email</label>
            <input className="adm-form-input" value={form.email} onChange={e => set("email", e.target.value)} placeholder="student@stu.nu.edu.pk" />
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label">Program</label>
            <select className="adm-form-select" value={form.prog} onChange={e => set("prog", e.target.value)}>
              {["BS-CS","BS-EE","BS-IS","BS-MT","BS-BBA","MS-CS"].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label">Department</label>
            <select className="adm-form-select" value={form.dept} onChange={e => set("dept", e.target.value)}>
              {["CS","EE","IS","MT","BBA"].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label">Semester</label>
            <select className="adm-form-select" value={form.sem} onChange={e => set("sem", e.target.value)}>
              {SEMS.slice(1).map(s => <option key={s}>{s}</option>)}
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
        </div>
        <div className="adm-modal-footer">
          <button className="adm-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="adm-btn-primary" onClick={() => onSave(form)}>
            {student ? "Save Changes" : "Add Student"}
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const [modal,      setModal]      = useState(null); // null | "add" | student object

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.id.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    const matchDept   = deptFilter === "All" || s.dept === deptFilter;
    const matchSem    = semFilter  === "All" || s.sem  === semFilter;
    const matchStat   = statFilter === "All" || s.status === statFilter;
    return matchSearch && matchDept && matchSem && matchStat;
  });

  const handleSave = (form) => {
    if (modal === "add") {
      setStudents(prev => [form, ...prev]);
    } else {
      setStudents(prev => prev.map(s => s.id === form.id ? form : s));
    }
    setModal(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this student record? This cannot be undone.")) {
      setStudents(prev => prev.filter(s => s.id !== id));
    }
  };

  useEffect(() => {
    document.querySelectorAll(".adm-card").forEach((el, i) => {
      gsap.fromTo(el, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", delay: i * 0.08 });
    });
  }, []);

  // Minimal Three.js bg
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
    const ptPos = new Float32Array(COUNT*3); const ptCol = new Float32Array(COUNT*3); const ptVel = [];
    for (let i=0;i<COUNT;i++){
      ptPos[i*3]=(Math.random()-.5)*34; ptPos[i*3+1]=(Math.random()-.5)*22; ptPos[i*3+2]=(Math.random()-.5)*18-6;
      ptVel.push({x:(Math.random()-.5)*.008,y:(Math.random()-.5)*.006});
      ptCol[i*3]=.5;ptCol[i*3+1]=.3;ptCol[i*3+2]=1;
    }
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute("position", new THREE.BufferAttribute(ptPos,3));
    ptGeo.setAttribute("color",    new THREE.BufferAttribute(ptCol,3));
    scene.add(new THREE.Points(ptGeo, new THREE.PointsMaterial({size:.05,transparent:true,opacity:.5,vertexColors:true})));
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

  return (
    <>
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
            <div className="adm-pg-title">Student Records</div>
            <div className="adm-tb-r">
              <div className="adm-sem-chip">{students.length} total</div>
              <button className="adm-btn-primary" onClick={() => setModal("add")}>
                ➕ Add Student
              </button>
            </div>
          </div>

          <div id="adm-scroll">

            {/* Summary stat chips */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              {[
                { label: "Active",   val: students.filter(s=>s.status==="active").length,   color: "var(--green)"  },
                { label: "Inactive", val: students.filter(s=>s.status==="inactive").length, color: "var(--red)"    },
                { label: "Pending",  val: students.filter(s=>s.status==="pending").length,  color: "var(--amber)"  },
                { label: "Showing",  val: filtered.length,                                  color: "var(--purple)" },
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
                    placeholder="Search by name, roll number, or email…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <select className="adm-filter-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                  {DEPTS.map(d => <option key={d}>{d === "All" ? "All Departments" : d}</option>)}
                </select>
                <select className="adm-filter-select" value={semFilter} onChange={e => setSemFilter(e.target.value)}>
                  {SEMS.map(s => <option key={s}>{s === "All" ? "All Semesters" : `Sem ${s}`}</option>)}
                </select>
                <select className="adm-filter-select" value={statFilter} onChange={e => setStatFilter(e.target.value)}>
                  {STATUS.map(s => <option key={s}>{s === "All" ? "All Status" : s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
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
                      <th>Roll No.</th>
                      <th>Name</th>
                      <th>Program</th>
                      <th>Dept</th>
                      <th>Semester</th>
                      <th>CGPA</th>
                      <th>Enrolled Cr</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={9} style={{ textAlign: "center", padding: "40px", color: "var(--dimmer)", opacity: .5, fontFamily: "'JetBrains Mono',monospace", fontSize: 13 }}>
                          No students match the current filters
                        </td>
                      </tr>
                    ) : filtered.map(s => (
                      <tr key={s.id}>
                        <td className="td-mono">{s.id}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 30, height: 30, borderRadius: 8,
                              background: "linear-gradient(135deg,var(--purple),var(--purple2))",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0
                            }}>
                              {s.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                            </div>
                            <div>
                              <div className="td-bold">{s.name}</div>
                              <div style={{ fontSize: 11, color: "var(--dimmer)", fontFamily: "'JetBrains Mono',monospace" }}>{s.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="td-dim">{s.prog}</td>
                        <td>
                          <span style={{
                            fontFamily: "'JetBrains Mono',monospace", fontSize: 12,
                            fontWeight: 800, padding: "3px 8px", borderRadius: 6,
                            background: "rgba(26,120,255,.08)", color: "var(--blue)"
                          }}>
                            {s.dept}
                          </span>
                        </td>
                        <td className="td-dim">{s.sem}</td>
                        <td style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, color: s.cgpa === "—" ? "var(--dimmer)" : "var(--purple)" }}>
                          {s.cgpa}
                        </td>
                        <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700, color: "var(--text-main)" }}>
                          {s.enrolled}
                        </td>
                        <td>
                          <span className={`adm-badge badge-${s.status}`}>{s.status}</span>
                        </td>
                        <td>
                          <button className="adm-action-btn" title="Edit" onClick={() => setModal(s)}>✏️</button>
                          <button className="adm-action-btn btn-delete" title="Delete" onClick={() => handleDelete(s.id)}>🗑️</button>
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
    </>
  );
}