import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "./Components/shared/AdminSidebar";
import { ADMIN_NAV } from "./config/AdminNav";
import "./AdminPortal.css";
import "./AdminCourses.css";



const DEPTS    = ["All", "CS", "EE", "MT", "IS", "BBA"];
const TYPES    = ["All", "Core", "Elective", "Lab", "Seminar"];
const STATUSES = ["All", "active", "inactive", "draft"];

const INITIAL_COURSES = [
  { id: "CS-1001", name: "Programming Fundamentals",   dept: "CS",  credits: 3, type: "Core",     instructor: "Dr. Aisha Rauf",      capacity: 60, enrolled: 58, status: "active",   semester: "1st", description: "Introduction to programming using C++. Covers variables, control flow, functions, arrays, and basic OOP." },
  { id: "CS-2001", name: "Data Structures",             dept: "CS",  credits: 3, type: "Core",     instructor: "Dr. Farhan Siddiqui", capacity: 55, enrolled: 52, status: "active",   semester: "3rd", description: "Arrays, linked lists, stacks, queues, trees, heaps, and graphs. Emphasis on algorithmic complexity." },
  { id: "CS-2006", name: "Operating Systems",           dept: "CS",  credits: 3, type: "Core",     instructor: "Dr. Bilal Amin",      capacity: 50, enrolled: 48, status: "active",   semester: "5th", description: "Process management, memory, file systems, concurrency, and POSIX API. Practical labs in C." },
  { id: "CS-3004", name: "Software Design & Analysis",  dept: "CS",  credits: 3, type: "Core",     instructor: "Sir Asim Noor",       capacity: 45, enrolled: 44, status: "active",   semester: "5th", description: "UML, design patterns, SOLID principles, architectural styles, and system modeling." },
  { id: "CS-3010", name: "Database Systems",            dept: "CS",  credits: 3, type: "Core",     instructor: "Dr. Hina Anwar",      capacity: 55, enrolled: 50, status: "active",   semester: "5th", description: "Relational model, SQL, normalization, transactions, indexing, and stored procedures in SQL Server." },
  { id: "CS-3020", name: "Artificial Intelligence",     dept: "CS",  credits: 3, type: "Core",     instructor: "Dr. Kashif Shahzad",  capacity: 50, enrolled: 47, status: "active",   semester: "6th", description: "Search, constraint satisfaction, knowledge representation, planning, machine learning intro." },
  { id: "CS-4010", name: "Machine Learning",            dept: "CS",  credits: 3, type: "Elective", instructor: "Dr. Zainab Mirza",    capacity: 40, enrolled: 38, status: "active",   semester: "7th", description: "Supervised and unsupervised learning, neural networks, backpropagation, SVMs, and model evaluation." },
  { id: "CS-4050", name: "Deep Learning",               dept: "CS",  credits: 3, type: "Elective", instructor: "Dr. Kashif Shahzad",  capacity: 35, enrolled: 35, status: "active",   semester: "7th", description: "CNNs, RNNs, transformers, and large-scale training. PyTorch-based practical labs." },
  { id: "CS-1002", name: "Calculus & Analytical Geo.",  dept: "CS",  credits: 3, type: "Core",     instructor: "Sir Tahir Rashid",    capacity: 70, enrolled: 65, status: "active",   semester: "1st", description: "Limits, derivatives, integrals, multivariable calculus, and series." },
  { id: "EE-2001", name: "Circuit Analysis",            dept: "EE",  credits: 3, type: "Core",     instructor: "Dr. Shahid Baig",     capacity: 40, enrolled: 0,  status: "inactive", semester: "3rd", description: "DC/AC circuits, KVL/KCL, Thevenin/Norton, phasors, and frequency response." },
  { id: "EE-3010", name: "Signals & Systems",           dept: "EE",  credits: 3, type: "Core",     instructor: "Dr. Sana Tariq",      capacity: 40, enrolled: 38, status: "active",   semester: "5th", description: "Continuous and discrete-time signals, Fourier transforms, Laplace, Z-transforms, and filtering." },
  { id: "IS-2001", name: "Information Security",        dept: "IS",  credits: 3, type: "Core",     instructor: "Dr. Usman Qureshi",   capacity: 45, enrolled: 40, status: "active",   semester: "5th", description: "Cryptography, network security, authentication protocols, and secure system design." },
  { id: "CS-1003", name: "Programming Lab",             dept: "CS",  credits: 1, type: "Lab",      instructor: "Sir Ahsan Naeem",     capacity: 30, enrolled: 28, status: "active",   semester: "1st", description: "Hands-on C++ lab complementing Programming Fundamentals. Weekly graded tasks." },
  { id: "CS-4090", name: "Final Year Project I",        dept: "CS",  credits: 3, type: "Seminar",  instructor: "FYP Committee",       capacity: 80, enrolled: 12, status: "draft",    semester: "7th", description: "Proposal, literature review, and initial implementation phase of the capstone project." },
  { id: "BBA-1001", name: "Principles of Management",  dept: "BBA", credits: 3, type: "Core",     instructor: "Dr. Maha Saeed",      capacity: 60, enrolled: 55, status: "active",   semester: "1st", description: "Foundational management theories, organizational behavior, leadership, and decision-making." },
];

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
  const r = enrolled / capacity;
  if (r >= 1)    return { bar: "#ff4d6a", text: "#e11d48" };
  if (r >= 0.85) return { bar: "#ffab00", text: "#b45309" };
  return { bar: "#00c96e", text: "#047857" };
}

/* ── COURSE MODAL ── */
function CourseModal({ course, onClose, onSave }) {
  const [form, setForm] = useState(
    course
      ? { ...course }
      : { id: "", name: "", dept: "CS", credits: 3, type: "Core", instructor: "", capacity: 50, enrolled: 0, status: "active", semester: "1st", description: "" }
  );
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal crs-modal" onClick={e => e.stopPropagation()}>
        <div className="adm-modal-hd">
          <div className="adm-modal-title">{course ? "Edit Course" : "Add New Course"}</div>
          <button className="adm-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="adm-form-grid">
          <div className="adm-form-group">
            <label className="adm-form-label">Course ID</label>
            <input className="adm-form-input" value={form.id} onChange={e => set("id", e.target.value)} placeholder="e.g. CS-4011" />
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label">Credits</label>
            <select className="adm-form-select" value={form.credits} onChange={e => set("credits", Number(e.target.value))}>
              {[1,2,3,4].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="adm-form-group full">
            <label className="adm-form-label">Course Title</label>
            <input className="adm-form-input" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Full course name" />
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label">Department</label>
            <select className="adm-form-select" value={form.dept} onChange={e => set("dept", e.target.value)}>
              {["CS","EE","IS","MT","BBA"].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label">Type</label>
            <select className="adm-form-select" value={form.type} onChange={e => set("type", e.target.value)}>
              {["Core","Elective","Lab","Seminar"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="adm-form-group full">
            <label className="adm-form-label">Instructor</label>
            <input className="adm-form-input" value={form.instructor} onChange={e => set("instructor", e.target.value)} placeholder="Faculty name" />
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label">Semester</label>
            <select className="adm-form-select" value={form.semester} onChange={e => set("semester", e.target.value)}>
              {["1st","2nd","3rd","4th","5th","6th","7th","8th"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label">Capacity</label>
            <input className="adm-form-input" type="number" value={form.capacity} onChange={e => set("capacity", Number(e.target.value))} min={1} />
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label">Enrolled</label>
            <input className="adm-form-input" type="number" value={form.enrolled} onChange={e => set("enrolled", Number(e.target.value))} min={0} />
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label">Status</label>
            <select className="adm-form-select" value={form.status} onChange={e => set("status", e.target.value)}>
              {["active","inactive","draft"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="adm-form-group full">
            <label className="adm-form-label">Description</label>
            <textarea className="adm-form-input" rows={3} style={{ resize: "vertical", lineHeight: 1.6 }} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Brief course description..." />
          </div>
        </div>
        <div className="adm-modal-footer">
          <button className="adm-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="adm-btn-primary" onClick={() => onSave(form)}>
            {course ? "Save Changes" : "Add Course"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── DETAIL PANEL ── */
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
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 80, opacity: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
      >
        {/* Gradient header band */}
        <div className="crs-detail-banner" style={{ background: dm.grad }}>
          <div className="crs-detail-banner-noise" />
          <button className="crs-detail-close" onClick={onClose}>✕</button>
          <div className="crs-detail-banner-icon" style={{ background: "rgba(255,255,255,.15)" }}>
            <span style={{ fontSize: 28 }}>{tm.icon}</span>
          </div>
          <div className="crs-detail-banner-id">{course.id}</div>
          <div className="crs-detail-banner-name">{course.name}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <span className="crs-pill crs-pill-white">{course.dept} · {dm.label}</span>
            <span className="crs-pill crs-pill-white">{course.type}</span>
            <span className={`adm-badge badge-${course.status}`} style={{ background: "rgba(255,255,255,.18)", color: "#fff", border: "1px solid rgba(255,255,255,.3)", fontSize: 10 }}>{course.status}</span>
          </div>
        </div>

        {/* Body */}
        <div className="crs-detail-body">

          {/* Stat row */}
          <div className="crs-detail-stat-row">
            {[
              { val: course.enrolled,   label: "Enrolled",  col: fc.text },
              { val: course.capacity,   label: "Capacity",  col: "var(--text-main)" },
              { val: `${pct}%`,         label: "Fill Rate", col: dm.accent },
              { val: `${course.credits} cr`, label: "Credits", col: "var(--purple)" },
            ].map((s, i) => (
              <div className="crs-detail-stat" key={i}>
                <div className="crs-detail-stat-val" style={{ color: s.col }}>{s.val}</div>
                <div className="crs-detail-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Fill bar */}
          <div className="crs-detail-fill-section">
            <div className="crs-detail-fill-header">
              <span>Enrollment</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", color: fc.text, fontWeight: 800 }}>{course.enrolled} / {course.capacity}</span>
            </div>
            <div className="crs-detail-track">
              <div
                className="crs-detail-fill"
                style={{ width: 0, background: `linear-gradient(90deg, ${fc.bar}, ${fc.bar}dd)` }}
              />
              {/* Glow */}
              <div className="crs-detail-fill-glow" style={{ width: `${Math.min(pct,100)}%`, background: fc.bar }} />
            </div>
          </div>

          {/* Info grid */}
          <div className="crs-info-grid">
            {[
              { label: "Instructor", val: course.instructor, icon: "👤" },
              { label: "Semester",   val: `${course.semester} Semester`, icon: "📅" },
              { label: "Department", val: `${course.dept} — ${dm.label}`, icon: "🏛️" },
              { label: "Course Type",val: course.type, icon: "📌" },
            ].map((row, i) => (
              <div className="crs-info-row" key={i}>
                <div className="crs-info-icon" style={{ background: dm.light }}>{row.icon}</div>
                <div>
                  <div className="crs-info-label">{row.label}</div>
                  <div className="crs-info-val">{row.val}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          {course.description && (
            <div className="crs-desc-block">
              <div className="crs-desc-label">About this course</div>
              <p className="crs-desc-text">{course.description}</p>
            </div>
          )}

          {/* Actions */}
          <div className="crs-detail-actions">
            <button className="adm-btn-primary crs-action-primary" onClick={() => onEdit(course)}>
              ✏️ Edit Course
            </button>
            <button className="crs-action-delete" onClick={() => onDelete(course.id)}>
              🗑️ Delete
            </button>
          </div>
        </div>
      </motion.aside>
    </motion.div>
  );
}

/* ══════════════════════════════════
   MAIN PAGE
══════════════════════════════════ */
export default function AdminCourses() {
  const navigate = useNavigate();
  const location = useLocation();
  const webglRef = useRef(null);

  const [collapse,   setCollapse]   = useState(false);
  const [courses,    setCourses]    = useState(INITIAL_COURSES);
  const [search,     setSearch]     = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statFilter, setStatFilter] = useState("All");
  const [viewMode,   setViewMode]   = useState("grid");
  const [modal,      setModal]      = useState(null);
  const [detail,     setDetail]     = useState(null);

  const filtered = courses.filter(c => {
    const q = search.toLowerCase();
    const ms = !q || c.id.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q);
    return ms
      && (deptFilter === "All" || c.dept   === deptFilter)
      && (typeFilter === "All" || c.type   === typeFilter)
      && (statFilter === "All" || c.status === statFilter);
  });

  const handleSave = (form) => {
    if (modal === "add") {
      setCourses(p => [form, ...p]);
    } else {
      setCourses(p => p.map(c => c.id === form.id ? form : c));
      if (detail?.id === form.id) setDetail(form);
    }
    setModal(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Remove this course? This cannot be undone.")) {
      setCourses(p => p.filter(c => c.id !== id));
      setDetail(null);
    }
  };

  useEffect(() => {
    gsap.fromTo(".crs-summary-chip", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: "power2.out" });
    gsap.fromTo(".crs-filter-bar",   { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, delay: 0.22, ease: "power2.out" });
  }, []);

  useEffect(() => {
    gsap.fromTo(".crs-card", { opacity: 0, y: 28, scale: .97 }, { opacity: 1, y: 0, scale: 1, duration: 0.42, stagger: 0.055, ease: "power3.out", delay: 0.1 });
  }, [viewMode, deptFilter, typeFilter, statFilter]);

  // Three.js bg (same as dashboard)
  useEffect(() => {
    const canvas = webglRef.current;
    let W = window.innerWidth, H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H); renderer.setClearColor(0xf0f5ff, 1);
    const scene = new THREE.Scene();
    scene.fog   = new THREE.FogExp2(0xe8e0ff, 0.02);
    const cam   = new THREE.PerspectiveCamera(60, W/H, .1, 200);
    cam.position.set(0, 3, 12);
    scene.add(new THREE.AmbientLight(0x4400aa, .7));
    const sun = new THREE.DirectionalLight(0x9966ff, 1.4);
    sun.position.set(-6,12,8); scene.add(sun);
    const rim = new THREE.PointLight(0x6600ff, 3, 40);
    rim.position.set(0,6,0); scene.add(rim);
    const objs = [];
    const mkIco = (x,y,z,r,color) => {
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r,1), new THREE.MeshPhongMaterial({color,wireframe:true,transparent:true,opacity:.18}));
      m.position.set(x,y,z); scene.add(m);
      objs.push({mesh:m,bob:Math.random()*.008+.004,phase:Math.random()*Math.PI*2,rx:(Math.random()-.5)*.016,ry:(Math.random()-.5)*.02});
    };
    mkIco(-7,2,-6,2.2,0x1a78ff); mkIco(7,-1,-7,2.8,0x7c3aed); mkIco(-2,4,-9,3.0,0x40a9ff); mkIco(4,3,-4,1.5,0xa78bfa);
    const N=140, pp=new Float32Array(N*3), pc=new Float32Array(N*3), pv=[];
    for(let i=0;i<N;i++){
      pp[i*3]=(Math.random()-.5)*34;pp[i*3+1]=(Math.random()-.5)*22;pp[i*3+2]=(Math.random()-.5)*18-6;
      pv.push({x:(Math.random()-.5)*.01,y:(Math.random()-.5)*.008});
      const p=Math.random();
      if(p<.45){pc[i*3]=.1;pc[i*3+1]=.47;pc[i*3+2]=1;}
      else if(p<.75){pc[i*3]=.49;pc[i*3+1]=.23;pc[i*3+2]=.93;}
      else{pc[i*3]=.9;pc[i*3+1]=.9;pc[i*3+2]=1;}
    }
    const geo=new THREE.BufferGeometry();
    geo.setAttribute("position",new THREE.BufferAttribute(pp,3));
    geo.setAttribute("color",new THREE.BufferAttribute(pc,3));
    scene.add(new THREE.Points(geo,new THREE.PointsMaterial({size:.055,transparent:true,opacity:.6,vertexColors:true})));
    const floor=new THREE.GridHelper(70,28,0x330066,0x330066);
    floor.position.y=-5.5;floor.material.transparent=true;floor.material.opacity=.22;scene.add(floor);
    let nx=0,ny=0;
    const onM=e=>{nx=(e.clientX/W)*2-1;ny=-(e.clientY/H)*2+1;};
    document.addEventListener("mousemove",onM);
    let t=0,aid;
    const loop=()=>{
      aid=requestAnimationFrame(loop);t+=.012;
      objs.forEach(o=>{o.mesh.position.y+=Math.sin(t*o.bob*10+o.phase)*.012;o.mesh.rotation.x+=o.rx;o.mesh.rotation.y+=o.ry;});
      const pa=geo.attributes.position.array;
      for(let i=0;i<N;i++){pa[i*3]+=pv[i].x+nx*.0018;pa[i*3+1]+=pv[i].y+ny*.0018;if(pa[i*3]>17)pa[i*3]=-17;if(pa[i*3]<-17)pa[i*3]=17;if(pa[i*3+1]>11)pa[i*3+1]=-11;if(pa[i*3+1]<-11)pa[i*3+1]=11;}
      geo.attributes.position.needsUpdate=true;
      rim.position.x=Math.sin(t*.5)*12;rim.position.z=Math.cos(t*.35)*9;
      floor.position.z=((t*.8)%2.5)-1.25;
      cam.position.x+=(nx*1.2-cam.position.x)*.018;cam.position.y+=(ny*.8+3-cam.position.y)*.018;
      cam.lookAt(0,0,0);renderer.render(scene,cam);
    };
    loop();
    const onR=()=>{W=window.innerWidth;H=window.innerHeight;renderer.setSize(W,H);cam.aspect=W/H;cam.updateProjectionMatrix();};
    window.addEventListener("resize",onR);
    return()=>{cancelAnimationFrame(aid);document.removeEventListener("mousemove",onM);window.removeEventListener("resize",onR);};
  },[]);

  const active  = courses.filter(c=>c.status==="active").length;
  const draft   = courses.filter(c=>c.status==="draft").length;
  const inactive= courses.filter(c=>c.status==="inactive").length;
  const avgFill = Math.round(courses.reduce((a,c)=>a+(c.enrolled/c.capacity),0)/courses.length*100);

  return (
    <>
      <canvas id="adm-webgl" ref={webglRef} />
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
            <div className="adm-pg-title">Course Catalog</div>
            <div className="adm-tb-r">
              <div className="adm-sem-chip">{courses.length} courses</div>
              {/* View toggle */}
              <div className="crs-view-toggle">
                <button className={`crs-view-btn${viewMode==="grid"?" active":""}`} onClick={()=>setViewMode("grid")} title="Card view">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="0" width="6" height="6" rx="1.5"/><rect x="8" y="0" width="6" height="6" rx="1.5"/><rect x="0" y="8" width="6" height="6" rx="1.5"/><rect x="8" y="8" width="6" height="6" rx="1.5"/></svg>
                </button>
                <button className={`crs-view-btn${viewMode==="list"?" active":""}`} onClick={()=>setViewMode("list")} title="List view">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="0" width="14" height="2.5" rx="1.25"/><rect x="0" y="5.75" width="14" height="2.5" rx="1.25"/><rect x="0" y="11.5" width="14" height="2.5" rx="1.25"/></svg>
                </button>
              </div>
              <button className="adm-btn-primary" onClick={()=>setModal("add")}>
                ➕ Add Course
              </button>
            </div>
          </div>

          <div id="adm-scroll">

            {/* ── SUMMARY CHIPS ── */}
            <div className="crs-summary-row">
              {[
                { label: "Active",   val: active,   col: "#00c96e", bg: "rgba(0,201,110,.08)",  border: "rgba(0,201,110,.2)"  },
                { label: "Draft",    val: draft,    col: "#ffab00", bg: "rgba(255,171,0,.08)",  border: "rgba(255,171,0,.2)"  },
                { label: "Inactive", val: inactive, col: "#ff4d6a", bg: "rgba(255,77,106,.08)", border: "rgba(255,77,106,.2)" },
                { label: "Avg Fill", val: `${avgFill}%`, col: "#7c3aed", bg: "rgba(124,58,237,.08)", border: "rgba(124,58,237,.2)" },
                { label: "Showing",  val: filtered.length, col: "#1a78ff", bg: "rgba(26,120,255,.08)", border: "rgba(26,120,255,.2)" },
              ].map(c=>(
                <div className="crs-summary-chip" key={c.label} style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                  <span className="crs-chip-dot" style={{ background: c.col }} />
                  <span className="crs-chip-label">{c.label}</span>
                  <span className="crs-chip-val" style={{ color: c.col }}>{c.val}</span>
                </div>
              ))}
            </div>

            {/* ── FILTER BAR ── */}
            <div className="crs-filter-bar">
              <div className="crs-search-wrap">
                <svg className="crs-search-icon" width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke="#94a3b8" strokeWidth="2"/><path d="M14 14l4 4" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/></svg>
                <input
                  className="crs-search-input"
                  placeholder="Search by title, course ID, or instructor…"
                  value={search}
                  onChange={e=>setSearch(e.target.value)}
                />
                {search && <button className="crs-search-clear" onClick={()=>setSearch("")}>✕</button>}
              </div>
              <div className="crs-filter-selects">
                {[
                  { val: deptFilter, set: setDeptFilter, opts: DEPTS, fmt: d => d==="All"?"All Depts":d },
                  { val: typeFilter, set: setTypeFilter, opts: TYPES, fmt: t => t==="All"?"All Types":t },
                  { val: statFilter, set: setStatFilter, opts: STATUSES, fmt: s => s==="All"?"All Status":s[0].toUpperCase()+s.slice(1) },
                ].map((f,i)=>(
                  <select key={i} className="crs-select" value={f.val} onChange={e=>f.set(e.target.value)}>
                    {f.opts.map(o=><option key={o} value={o}>{f.fmt(o)}</option>)}
                  </select>
                ))}
                <div className="crs-count-chip">{filtered.length} result{filtered.length!==1?"s":""}</div>
              </div>
            </div>

            {/* ══ GRID VIEW ══ */}
            {viewMode === "grid" && (
              <div className="crs-grid">
                {filtered.length === 0 ? (
                  <div className="crs-empty">
                    <div className="crs-empty-icon">📭</div>
                    <div className="crs-empty-text">No courses match the current filters</div>
                  </div>
                ) : filtered.map(c => {
                  const dm = DEPT_META[c.dept] || DEPT_META.CS;
                  const tm = TYPE_META[c.type] || TYPE_META.Core;
                  const pct = Math.round((c.enrolled/c.capacity)*100);
                  const fc = fillColor(c.enrolled, c.capacity);
                  return (
                    <div
                      key={c.id}
                      className={`crs-card${c.status!=="active"?" crs-card-muted":""}`}
                      onClick={()=>setDetail(c)}
                    >
                      {/* Shimmer overlay */}
                      <div className="crs-card-shimmer" />

                      {/* Top gradient band */}
                      <div className="crs-card-band" style={{ background: dm.grad }}>
                        <div className="crs-card-band-noise" />
                        <div className="crs-card-band-type" style={{ background: "rgba(255,255,255,.15)", color: "#fff" }}>
                          <span style={{ fontSize: 12, fontWeight: 800 }}>{tm.icon} {c.type}</span>
                        </div>
                        <div className={`crs-card-band-status adm-badge badge-${c.status}`} style={{ background: "rgba(255,255,255,.18)", color: "#fff", border: "1px solid rgba(255,255,255,.3)", fontSize: 10 }}>
                          {c.status}
                        </div>
                      </div>

                      {/* Card body */}
                      <div className="crs-card-body">
                        <div className="crs-card-id">{c.id}</div>
                        <div className="crs-card-name">{c.name}</div>
                        <div className="crs-card-instructor">
                          <span className="crs-card-instructor-dot" style={{ background: dm.accent }} />
                          {c.instructor}
                        </div>

                        {/* Meta pills */}
                        <div className="crs-card-pills">
                          <span className="crs-card-pill" style={{ background: dm.tag, color: dm.tagText }}>🏛️ {c.dept}</span>
                          <span className="crs-card-pill" style={{ background: "rgba(124,58,237,.1)", color: "#5b21b6" }}>⚡ {c.credits} cr</span>
                          <span className="crs-card-pill" style={{ background: "#f1f5f9", color: "var(--dimmer)" }}>📅 Sem {c.semester}</span>
                        </div>

                        {/* Enrollment bar */}
                        <div className="crs-card-fill-wrap">
                          <div className="crs-card-fill-header">
                            <span>Enrollment</span>
                            <span style={{ fontFamily: "'JetBrains Mono',monospace", color: fc.text, fontWeight: 800, fontSize: 11 }}>{c.enrolled}/{c.capacity}</span>
                          </div>
                          <div className="crs-card-track">
                            <div className="crs-card-fill" style={{ width: `${Math.min(pct,100)}%`, background: fc.bar }} />
                          </div>
                        </div>
                      </div>

                      {/* Footer actions */}
                      <div className="crs-card-footer">
                        <button className="crs-card-btn crs-card-btn-edit"
                          onClick={e=>{e.stopPropagation();setModal(c);}}>
                          ✏️ Edit
                        </button>
                        <button className="crs-card-btn crs-card-btn-del"
                          onClick={e=>{e.stopPropagation();handleDelete(c.id);}}>
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ══ LIST VIEW ══ */}
            {viewMode === "list" && (
              <div className="adm-card" style={{ padding: 0, overflow: "hidden" }}>
                <div className="adm-table-wrap" style={{ borderRadius: 18 }}>
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
                        <th style={{ minWidth: 140 }}>Enrollment</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr><td colSpan={10} style={{ textAlign:"center",padding:"48px",color:"var(--dimmer)",opacity:.45,fontFamily:"'JetBrains Mono',monospace",fontSize:13 }}>No courses match current filters</td></tr>
                      ) : filtered.map(c => {
                        const dm = DEPT_META[c.dept] || DEPT_META.CS;
                        const tm = TYPE_META[c.type] || TYPE_META.Core;
                        const pct = Math.round((c.enrolled/c.capacity)*100);
                        const fc = fillColor(c.enrolled,c.capacity);
                        return (
                          <tr key={c.id} className="crs-list-row" onClick={()=>setDetail(c)}>
                            <td><span className="td-mono">{c.id}</span></td>
                            <td>
                              <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                                <div className="crs-list-icon" style={{ background: dm.grad }}>
                                  <span style={{ color:"#fff",fontSize:13,fontWeight:800 }}>{tm.icon}</span>
                                </div>
                                <span className="td-bold">{c.name}</span>
                              </div>
                            </td>
                            <td>
                              <span className="crs-dept-tag" style={{ background: dm.tag, color: dm.tagText }}>{c.dept}</span>
                            </td>
                            <td className="td-dim">{c.type}</td>
                            <td style={{ fontFamily:"'JetBrains Mono',monospace",fontWeight:800,color:"var(--purple)",textAlign:"center" }}>{c.credits}</td>
                            <td className="td-dim" style={{ fontSize:12 }}>{c.instructor}</td>
                            <td className="td-dim">{c.semester}</td>
                            <td>
                              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                                <div className="adm-dept-bar-track" style={{ flex:1,height:5,minWidth:50 }}>
                                  <div style={{ height:"100%",borderRadius:4,width:`${Math.min(pct,100)}%`,background:fc.bar }} />
                                </div>
                                <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,color:fc.text,whiteSpace:"nowrap" }}>{c.enrolled}/{c.capacity}</span>
                              </div>
                            </td>
                            <td><span className={`adm-badge badge-${c.status}`}>{c.status}</span></td>
                            <td onClick={e=>e.stopPropagation()}>
                              <button className="adm-action-btn" onClick={()=>setModal(c)}>✏️</button>
                              <button className="adm-action-btn btn-delete" onClick={()=>handleDelete(c.id)}>🗑️</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>{/* /adm-scroll */}
        </div>{/* /adm-main */}
      </div>{/* /adm-app */}

      <AnimatePresence>
        {modal && <CourseModal course={modal==="add"?null:modal} onClose={()=>setModal(null)} onSave={handleSave} />}
      </AnimatePresence>
      <AnimatePresence>
        {detail && <DetailPanel course={detail} onClose={()=>setDetail(null)} onEdit={c=>{setDetail(null);setModal(c);}} onDelete={handleDelete} />}
      </AnimatePresence>
    </>
  );
}