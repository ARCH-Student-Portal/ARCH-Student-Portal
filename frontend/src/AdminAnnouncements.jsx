import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import "./AdminPortal.css";
import "./AdminAnnouncements.css";

const NAV = [
  ["Overview",   [["⊞", "Dashboard",       "/admin/dashboard"]]],
  ["Management", [["👥", "Student Records", "/admin/students"],
                  ["🎓", "Teachers",        "/admin/teachers"],
                  ["📚", "Course Catalog",  "/admin/courses"],
                  ["📋", "Enrollment",      "/admin/enrollment"],
                  ["📣", "Announcements",   "/admin/announcements"]]]
];

const TYPE_META = {
  announcement: { icon: "📣", label: "Announcement", color: "#7c3aed", bg: "rgba(124,58,237,.1)", border: "rgba(124,58,237,.3)" },
  exam:         { icon: "📝", label: "Exam",          color: "#ff4d6a", bg: "rgba(255,77,106,.1)", border: "rgba(255,77,106,.3)" },
  assignment:   { icon: "📋", label: "Assignment",    color: "#ff9800", bg: "rgba(255,152,0,.1)",  border: "rgba(255,152,0,.3)"  },
  quiz:         { icon: "✏️", label: "Quiz",          color: "#40a9ff", bg: "rgba(64,169,255,.1)", border: "rgba(64,169,255,.3)" },
};

const AUDIENCES = ["All Students", "BS-CS", "BS-EE", "BS-IS", "BS-MT", "BS-BBA", "Faculty", "1st Semester", "Final Year"];

const INITIAL_ANNOUNCEMENTS = [
  {
    id: "ann-1", type: "announcement", title: "Mid-Term 2 Hall Allocation Published",
    body: "Hall assignments for Mid 2 exams (Week 10) are now available on the LMS portal under 'Exam Schedule'. Students must carry their university ID cards. No entry will be permitted without a valid ID.",
    from: "Exam Office", audience: "All Students", date: "Mar 18, 2025", pinned: true,
  },
  {
    id: "ann-2", type: "announcement", title: "LMS Maintenance — Saturday 2–4 AM",
    body: "The LMS portal will be unavailable for scheduled maintenance this Saturday between 2:00 AM and 4:00 AM. Please plan all assignment submissions accordingly. No deadline extensions will be granted for this maintenance window.",
    from: "IT Department", audience: "All Students", date: "Mar 16, 2025", pinned: true,
  },
  {
    id: "ann-3", type: "exam", title: "OOAD Assignment 2 — Groups of 3 Only",
    body: "Reminder: Individual submissions for OOAD Assignment 2 will not be accepted. All groups must be registered on LMS before the submission date. Sequence and activity diagrams must be included.",
    from: "Dr. Hamza Raheel", audience: "BS-CS", date: "Mar 14, 2025", pinned: false,
  },
  {
    id: "ann-4", type: "announcement", title: "Spring 2025 Fee Challan Deadline",
    body: "The last date to submit Spring 2025 fee challans is March 20, 2025. Students with outstanding dues will have their LMS access suspended. Please visit the accounts office or pay online via the NUST payment portal.",
    from: "Accounts Office", audience: "All Students", date: "Mar 10, 2025", pinned: false,
  },
  {
    id: "ann-5", type: "quiz", title: "DSA Quiz 2 — Scope Clarification",
    body: "DSA Quiz 2 scheduled for Week 7 will cover Binary Search Trees, AVL Trees, and Introduction to Graph Traversal (BFS/DFS). The quiz will be 15 minutes, closed book, conducted in the lab.",
    from: "Dr. Farhan Siddiqui", audience: "BS-CS", date: "Mar 3, 2025", pinned: false,
  },
  {
    id: "ann-6", type: "announcement", title: "Faculty Research Seminar — AI in Education",
    body: "A university-wide research seminar on 'AI in Education' will be held on March 25, 2025 in Auditorium Block C at 2:00 PM. Attendance is optional but strongly encouraged for final-year students.",
    from: "Research Office", audience: "Faculty", date: "Mar 1, 2025", pinned: false,
  },
];

const EMPTY_FORM = { type: "announcement", title: "", body: "", from: "Admin Office", audience: "All Students" };

/* ── COMPOSE MODAL ──────────────────────────────────────────────────────────── */
function ComposeModal({ existing, onClose, onSave }) {
  const [form, setForm] = useState(existing ? { ...existing } : { ...EMPTY_FORM });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isEdit = !!existing;

  const canSave = form.title.trim() && form.body.trim() && form.from.trim();

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" style={{ width: "min(640px,92vw)", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div className="adm-modal-hd">
          <div className="adm-modal-title">{isEdit ? "Edit Announcement" : "Post Announcement"}</div>
          <button className="adm-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="adm-form-grid">
          {/* Type */}
          <div className="adm-form-group">
            <label className="adm-form-label">Type</label>
            <select className="adm-form-select" value={form.type} onChange={e => set("type", e.target.value)}>
              {Object.keys(TYPE_META).map(t => <option key={t} value={t}>{TYPE_META[t].icon} {TYPE_META[t].label}</option>)}
            </select>
          </div>
          {/* Audience */}
          <div className="adm-form-group">
            <label className="adm-form-label">Audience</label>
            <select className="adm-form-select" value={form.audience} onChange={e => set("audience", e.target.value)}>
              {AUDIENCES.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          {/* Title */}
          <div className="adm-form-group full">
            <label className="adm-form-label">Title</label>
            <input
              className="adm-form-input"
              value={form.title}
              onChange={e => set("title", e.target.value)}
              placeholder="Announcement headline…"
            />
          </div>
          {/* Body */}
          <div className="adm-form-group full">
            <label className="adm-form-label">Body</label>
            <textarea
              className="adm-form-input"
              rows={5}
              value={form.body}
              onChange={e => set("body", e.target.value)}
              placeholder="Full announcement text…"
              style={{ resize: "vertical", lineHeight: 1.6 }}
            />
          </div>
          {/* From */}
          <div className="adm-form-group">
            <label className="adm-form-label">Posted By</label>
            <input
              className="adm-form-input"
              value={form.from}
              onChange={e => set("from", e.target.value)}
              placeholder="Department / name"
            />
          </div>
          {/* Pin */}
          <div className="adm-form-group" style={{ justifyContent: "flex-end" }}>
            <label className="adm-form-label">Pin to top</label>
            <div
              onClick={() => set("pinned", !form.pinned)}
              style={{
                display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
                padding: "10px 14px", borderRadius: 10,
                border: `1px solid ${form.pinned ? "rgba(124,58,237,.4)" : "var(--border)"}`,
                background: form.pinned ? "rgba(124,58,237,.07)" : "#f8fafc",
                transition: "all .2s",
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: 5,
                border: `2px solid ${form.pinned ? "var(--purple)" : "#cbd5e1"}`,
                background: form.pinned ? "var(--purple)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 11, transition: "all .2s",
              }}>
                {form.pinned ? "✓" : ""}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: form.pinned ? "var(--purple)" : "var(--dimmer)" }}>
                📌 Pin announcement
              </span>
            </div>
          </div>
        </div>

        <div className="adm-modal-footer">
          <button className="adm-btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="adm-btn-primary"
            onClick={() => canSave && onSave(form)}
            style={{ opacity: canSave ? 1 : .5, cursor: canSave ? "pointer" : "not-allowed" }}
          >
            {isEdit ? "Save Changes" : "📣 Post Announcement"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── ANNOUNCEMENT CARD ───────────────────────────────────────────────────────── */
function AnnCard({ ann, onEdit, onDelete, onTogglePin }) {
  const meta = TYPE_META[ann.type] ?? TYPE_META.announcement;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: .95 }}
      transition={{ duration: .28 }}
      className="adm-card"
      style={{ padding: 0, overflow: "hidden", marginBottom: 14 }}
    >
      {/* Colour stripe */}
      <div style={{ height: 3, background: meta.color, borderRadius: "18px 18px 0 0" }} />
      <div style={{ padding: "18px 22px" }}>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{
              padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 800,
              letterSpacing: ".06em", textTransform: "uppercase",
              color: meta.color, background: meta.bg, border: `1px solid ${meta.border}`,
            }}>
              {meta.icon} {meta.label}
            </span>
            <span style={{
              padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
              background: "rgba(26,120,255,.08)", color: "var(--blue)",
              border: "1px solid rgba(26,120,255,.2)",
            }}>
              {ann.audience}
            </span>
            {ann.pinned && (
              <span style={{
                padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                background: "rgba(124,58,237,.1)", color: "var(--purple)",
                border: "1px solid rgba(124,58,237,.25)",
              }}>
                📌 Pinned
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button
              className="adm-action-btn"
              title={ann.pinned ? "Unpin" : "Pin"}
              onClick={() => onTogglePin(ann.id)}
              style={{ color: ann.pinned ? "var(--purple)" : undefined }}
            >
              📌
            </button>
            <button className="adm-action-btn" title="Edit" onClick={() => onEdit(ann)}>✏️</button>
            <button className="adm-action-btn btn-delete" title="Delete" onClick={() => onDelete(ann.id)}>🗑️</button>
          </div>
        </div>

        {/* Title */}
        <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-main)", marginBottom: 8, lineHeight: 1.4 }}>
          {ann.title}
        </div>

        {/* Body */}
        <div style={{ fontSize: 13, color: "var(--dimmer)", lineHeight: 1.7, marginBottom: 14 }}>
          {ann.body}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "var(--dimmer)", opacity: .75 }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>🗓 {ann.date}</span>
          <span>· Posted by <strong style={{ color: "var(--text-main)", opacity: 1 }}>{ann.from}</strong></span>
        </div>
      </div>
    </motion.div>
  );
}

/* ── MAIN COMPONENT ─────────────────────────────────────────────────────────── */
export default function AdminAnnouncements() {
  const navigate = useNavigate();
  const location = useLocation();
  const webglRef = useRef(null);

  const [collapse,       setCollapse]       = useState(false);
  const [announcements,  setAnnouncements]  = useState(INITIAL_ANNOUNCEMENTS);
  const [compose,        setCompose]        = useState(null); // null | "new" | ann object
  const [search,         setSearch]         = useState("");
  const [typeFilter,     setTypeFilter]     = useState("All");
  const [audienceFilter, setAudienceFilter] = useState("All");

  const filtered = announcements.filter(a => {
    const q = search.toLowerCase();
    const matchSearch   = !q || a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q) || a.from.toLowerCase().includes(q);
    const matchType     = typeFilter === "All" || a.type === typeFilter;
    const matchAudience = audienceFilter === "All" || a.audience === audienceFilter;
    return matchSearch && matchType && matchAudience;
  });

  // Pinned first, then by recency (id order)
  const sorted = [...filtered].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return  1;
    return 0;
  });

  const handleSave = (form) => {
    const now = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, " ");
    if (compose === "new") {
      const id = `ann-${Date.now()}`;
      setAnnouncements(prev => [{ ...form, id, date: now }, ...prev]);
    } else {
      setAnnouncements(prev => prev.map(a => a.id === form.id ? { ...form } : a));
    }
    setCompose(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this announcement? This cannot be undone.")) {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleTogglePin = (id) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a));
  };

  /* Three.js bg */
  useEffect(() => {
    const canvas = webglRef.current;
    let W = window.innerWidth, H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H); renderer.setClearColor(0xf0f5ff, 1);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
    camera.position.set(0, 3, 12);
    scene.add(new THREE.AmbientLight(0x4400aa, 0.6));
    const sun = new THREE.DirectionalLight(0x9966ff, 1.2); sun.position.set(-6, 12, 8); scene.add(sun);
    const COUNT = 140;
    const ptPos = new Float32Array(COUNT*3), ptCol = new Float32Array(COUNT*3), ptVel = [];
    for (let i=0;i<COUNT;i++){
      ptPos[i*3]=(Math.random()-.5)*34;ptPos[i*3+1]=(Math.random()-.5)*22;ptPos[i*3+2]=(Math.random()-.5)*18-6;
      ptVel.push({x:(Math.random()-.5)*.008,y:(Math.random()-.5)*.006});
      ptCol[i*3]=.5;ptCol[i*3+1]=.3;ptCol[i*3+2]=1;
    }
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute("position",new THREE.BufferAttribute(ptPos,3));
    ptGeo.setAttribute("color",   new THREE.BufferAttribute(ptCol,3));
    scene.add(new THREE.Points(ptGeo,new THREE.PointsMaterial({size:.05,transparent:true,opacity:.5,vertexColors:true})));
    let nmx=0,nmy=0;
    const onMove=e=>{nmx=(e.clientX/W)*2-1;nmy=-(e.clientY/H)*2+1;};
    document.addEventListener("mousemove",onMove);
    let animId;
    const loop=()=>{animId=requestAnimationFrame(loop);
      const p=ptGeo.attributes.position.array;
      for(let i=0;i<COUNT;i++){p[i*3]+=ptVel[i].x+nmx*.001;p[i*3+1]+=ptVel[i].y+nmy*.001;
        if(p[i*3]>17)p[i*3]=-17;if(p[i*3]<-17)p[i*3]=17;if(p[i*3+1]>11)p[i*3+1]=-11;if(p[i*3+1]<-11)p[i*3+1]=11;}
      ptGeo.attributes.position.needsUpdate=true;
      camera.position.x+=(nmx*.8-camera.position.x)*.015;camera.position.y+=(nmy*.5+3-camera.position.y)*.015;
      camera.lookAt(0,0,0);renderer.render(scene,camera);};
    loop();
    const onResize=()=>{W=window.innerWidth;H=window.innerHeight;renderer.setSize(W,H);camera.aspect=W/H;camera.updateProjectionMatrix();};
    window.addEventListener("resize",onResize);
    return()=>{cancelAnimationFrame(animId);document.removeEventListener("mousemove",onMove);window.removeEventListener("resize",onResize);};
  }, []);

  useEffect(() => {
    document.querySelectorAll(".adm-card").forEach((el,i)=>{
      gsap.fromTo(el,{opacity:0,y:24},{opacity:1,y:0,duration:.45,ease:"power2.out",delay:i*.06});
    });
  }, []);

  return (
    <>
      <canvas id="adm-webgl" ref={webglRef} />

      <AnimatePresence>
        {compose && (
          <ComposeModal
            existing={compose === "new" ? null : compose}
            onClose={() => setCompose(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      <div id="adm-app">
        {/* SIDEBAR */}
        <nav id="adm-sidebar" className={collapse ? "collapse" : ""}>
          <div className="adm-sb-top-bar" />
          <button className="adm-sb-toggle" onClick={() => setCollapse(c => !c)}>
            <span /><span /><span />
          </button>
          <div className="adm-sb-logo">
            <div className="adm-logo-box">A</div>
            <div><div className="adm-logo-name">ARCH</div><div className="adm-logo-tagline">Admin Panel</div></div>
          </div>
          <div className="adm-sb-user">
            <div className="adm-uav">SA</div>
            <div><div className="adm-uname">Super Admin</div><div className="adm-uid">ADM-0001</div></div>
          </div>
          {NAV.map(([sec, items]) => (
            <div key={sec}>
              <div className="adm-nav-sec">{sec}</div>
              {items.map(([ic, label, path]) => (
                <div key={label} className={`adm-ni${location.pathname === path ? " active" : ""}`} onClick={() => navigate(path)}>
                  <div className="adm-ni-ic">{ic}</div>{label}
                </div>
              ))}
            </div>
          ))}
          <div className="adm-sb-foot">Spring 2025 · FAST-NUCES</div>
        </nav>

        {/* MAIN */}
        <div id="adm-main">
          <div id="adm-topbar">
            <div className="adm-topbar-glow" />
            <div className="adm-pg-title">Announcements</div>
            <div className="adm-tb-r">
              <div className="adm-sem-chip">{announcements.length} total</div>
              <button className="adm-btn-primary" onClick={() => setCompose("new")}>
                📣 Post Announcement
              </button>
            </div>
          </div>

          <div id="adm-scroll">

            {/* Stat chips */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              {[
                { label: "Pinned",        val: announcements.filter(a=>a.pinned).length,             color: "var(--purple)" },
                { label: "Announcements", val: announcements.filter(a=>a.type==="announcement").length, color: "var(--blue)"   },
                { label: "Exams",         val: announcements.filter(a=>a.type==="exam").length,       color: "var(--red)"    },
                { label: "Quizzes",       val: announcements.filter(a=>a.type==="quiz").length,       color: "#40a9ff"       },
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
                    placeholder="Search by title, body, or sender…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <select className="adm-filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                  <option value="All">All Types</option>
                  {Object.keys(TYPE_META).map(t => <option key={t} value={t}>{TYPE_META[t].icon} {TYPE_META[t].label}</option>)}
                </select>
                <select className="adm-filter-select" value={audienceFilter} onChange={e => setAudienceFilter(e.target.value)}>
                  <option value="All">All Audiences</option>
                  {AUDIENCES.map(a => <option key={a}>{a}</option>)}
                </select>
                <div className="adm-filter-count">{sorted.length} result{sorted.length !== 1 ? "s" : ""}</div>
              </div>
            </div>

            {/* Announcement list */}
            {sorted.length === 0 ? (
              <div className="adm-card" style={{ textAlign: "center", padding: "64px 32px" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📭</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-main)", marginBottom: 8 }}>No announcements</div>
                <div style={{ fontSize: 13, color: "var(--dimmer)", marginBottom: 20 }}>Nothing matches your filters. Post a new announcement above.</div>
                <button className="adm-btn-primary" onClick={() => setCompose("new")}>📣 Post Announcement</button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {sorted.map(ann => (
                  <AnnCard
                    key={ann.id}
                    ann={ann}
                    onEdit={a => setCompose(a)}
                    onDelete={handleDelete}
                    onTogglePin={handleTogglePin}
                  />
                ))}
              </AnimatePresence>
            )}

          </div>
        </div>
      </div>
    </>
  );
}