import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { gsap } from "gsap";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import "./AdminAnnouncements.css"; // 🔥 THE ONE AND ONLY CSS FILE

// ── 1. CUSTOM SMOOTH COUNTER HOOK ──
function AnimatedCounter({ value, decimals = 0, suffix = "", prefix = "", duration = 1.2, delay = 0, useCommas = false }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    let num = Number(latest);
    if (isNaN(num)) num = 0;
    let formattedStr = num.toFixed(decimals);
    if (useCommas) formattedStr = parseFloat(formattedStr).toLocaleString('en-US');
    return prefix + formattedStr + suffix;
  });

  useEffect(() => {
    const safeValue = Number(value);
    const finalValue = isNaN(safeValue) ? 0 : safeValue;
    const controls = animate(count, finalValue, { duration, delay, ease: [0.34, 1.56, 0.64, 1] });
    return () => controls.stop();
  }, [value, duration, delay, count]);

  return <motion.span>{rounded}</motion.span>;
}

// ── 2. STATIC DATA ──
const NAV = [
  ["Overview",   [["⊞", "Dashboard",       "/admin/dashboard"]]],
  ["Management", [["👥", "Student Records", "/admin/students"],
                  ["🎓", "Teachers",        "/admin/teachers"],
                  ["📚", "Course Catalog",  "/admin/courses"],
                  ["📋", "Enrollment",      "/admin/enrollment"],
                  ["📣", "Announcements",   "/admin/announcements"]]]
];

const TYPE_META = {
  announcement: { icon: "📣", label: "Announcement", color: "#1a78ff", bg: "rgba(26,120,255,.1)", border: "rgba(26,120,255,.3)" },
  exam:         { icon: "📝", label: "Exam",          color: "#ff4d6a", bg: "rgba(255,77,106,.1)", border: "rgba(255,77,106,.3)" },
  assignment:   { icon: "📋", label: "Assignment",    color: "#ffab00", bg: "rgba(255,171,0,.1)",  border: "rgba(255,171,0,.3)"  },
  quiz:         { icon: "✏️", label: "Quiz",          color: "#00c853", bg: "rgba(0,200,83,.1)",   border: "rgba(0,200,83,.3)" },
};

const AUDIENCES = ["All Students", "BS-CS", "BS-EE", "BS-IS", "BS-MT", "BS-BBA", "Faculty", "1st Semester", "Final Year"];

const INITIAL_ANNOUNCEMENTS = [
  { id: "ann-1", type: "announcement", title: "Mid-Term 2 Hall Allocation Published", body: "Hall assignments for Mid 2 exams (Week 10) are now available on the LMS portal under 'Exam Schedule'. Students must carry their university ID cards. No entry will be permitted without a valid ID.", from: "Exam Office", audience: "All Students", date: "Mar 18, 2025", pinned: true },
  { id: "ann-2", type: "announcement", title: "LMS Maintenance — Saturday 2–4 AM", body: "The LMS portal will be unavailable for scheduled maintenance this Saturday between 2:00 AM and 4:00 AM. Please plan all assignment submissions accordingly. No deadline extensions will be granted for this maintenance window.", from: "IT Department", audience: "All Students", date: "Mar 16, 2025", pinned: true },
  { id: "ann-3", type: "exam", title: "OOAD Assignment 2 — Groups of 3 Only", body: "Reminder: Individual submissions for OOAD Assignment 2 will not be accepted. All groups must be registered on LMS before the submission date. Sequence and activity diagrams must be included.", from: "Dr. Hamza Raheel", audience: "BS-CS", date: "Mar 14, 2025", pinned: false },
  { id: "ann-4", type: "announcement", title: "Spring 2025 Fee Challan Deadline", body: "The last date to submit Spring 2025 fee challans is March 20, 2025. Students with outstanding dues will have their LMS access suspended. Please visit the accounts office or pay online via the NUST payment portal.", from: "Accounts Office", audience: "All Students", date: "Mar 10, 2025", pinned: false },
];

const EMPTY_FORM = { type: "announcement", title: "", body: "", from: "Admin Office", audience: "All Students", pinned: false };


// ── 3. INLINE COMPOSE MODAL ──
function ComposeModal({ existing, onClose, onSave }) {
  const [form, setForm] = useState(existing ? { ...existing } : { ...EMPTY_FORM });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isEdit = !!existing;
  const canSave = form.title.trim() && form.body.trim() && form.from.trim();

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" style={{ width: "min(900px, 95vw)", maxHeight: "90vh", overflowY: "auto", padding: "48px" }} onClick={e => e.stopPropagation()}>
        <div className="adm-modal-hd" style={{ marginBottom: 32 }}>
          <div className="adm-modal-title" style={{ fontSize: 36 }}>{isEdit ? "Edit Announcement" : "Post Announcement"}</div>
          <button className="adm-modal-close" style={{ fontSize: 32 }} onClick={onClose}>✕</button>
        </div>

        <div className="adm-form-grid" style={{ gap: 24 }}>
          <div className="adm-form-group">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Type</label>
            <select className="adm-form-select" style={{ fontSize: 20, padding: "18px" }} value={form.type} onChange={e => set("type", e.target.value)}>
              {Object.keys(TYPE_META).map(t => <option key={t} value={t}>{TYPE_META[t].icon} {TYPE_META[t].label}</option>)}
            </select>
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Audience</label>
            <select className="adm-form-select" style={{ fontSize: 20, padding: "18px" }} value={form.audience} onChange={e => set("audience", e.target.value)}>
              {AUDIENCES.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div className="adm-form-group full">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Title</label>
            <input className="adm-form-input" style={{ fontSize: 24, padding: "20px", fontWeight: 800 }} value={form.title} onChange={e => set("title", e.target.value)} placeholder="Announcement headline…" />
          </div>
          <div className="adm-form-group full">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Body</label>
            <textarea className="adm-form-input" rows={6} value={form.body} onChange={e => set("body", e.target.value)} placeholder="Full announcement text…" style={{ resize: "vertical", lineHeight: 1.6, fontSize: 20, padding: "20px" }} />
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Posted By</label>
            <input className="adm-form-input" style={{ fontSize: 20, padding: "18px" }} value={form.from} onChange={e => set("from", e.target.value)} placeholder="Department / name" />
          </div>
          <div className="adm-form-group" style={{ justifyContent: "flex-end" }}>
            <label className="adm-form-label" style={{ fontSize: 18 }}>Pin to top</label>
            <div onClick={() => set("pinned", !form.pinned)} style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer", padding: "16px 20px", borderRadius: 14, border: `2px solid ${form.pinned ? "rgba(26,120,255,.4)" : "var(--border)"}`, background: form.pinned ? "rgba(26,120,255,.07)" : "#f8fafc", transition: "all .2s" }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, border: `2px solid ${form.pinned ? "var(--blue)" : "#cbd5e1"}`, background: form.pinned ? "var(--blue)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, transition: "all .2s", fontWeight: 900 }}>
                {form.pinned ? "✓" : ""}
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: form.pinned ? "var(--blue)" : "var(--dimmer)" }}>📌 Pin announcement</span>
            </div>
          </div>
        </div>

        <div className="adm-modal-footer" style={{ marginTop: 48 }}>
          <button className="adm-btn-secondary" style={{ fontSize: 20, padding: "16px 32px" }} onClick={onClose}>Cancel</button>
          <button className="adm-btn-primary" onClick={() => canSave && onSave(form)} style={{ opacity: canSave ? 1 : .5, cursor: canSave ? "pointer" : "not-allowed", fontSize: 20, padding: "16px 32px" }}>
            {isEdit ? "Save Changes" : "📣 Post Announcement"}
          </button>
        </div>
      </div>
    </div>
  );
}


// ── 4. INLINE ANNOUNCEMENT CARD ──
function AnnCard({ ann, onEdit, onDelete, onTogglePin }) {
  const meta = TYPE_META[ann.type] ?? TYPE_META.announcement;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: .95 }}
      transition={{ duration: .28 }}
      className="admin-isolated-card ann-card-hover"
      style={{ padding: 0, overflow: "hidden", marginBottom: 24, borderRadius: 24 }}
    >
      <div style={{ height: 6, background: meta.color, borderRadius: "24px 24px 0 0", width: "100%" }} />
      <div style={{ padding: "32px 40px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ padding: "6px 16px", borderRadius: 20, fontSize: 16, fontWeight: 900, letterSpacing: ".06em", textTransform: "uppercase", color: meta.color, background: meta.bg, border: `1px solid ${meta.border}` }}>
              {meta.icon} {meta.label}
            </span>
            <span style={{ padding: "6px 16px", borderRadius: 20, fontSize: 16, fontWeight: 800, background: "rgba(26,120,255,.08)", color: "var(--blue)", border: "1px solid rgba(26,120,255,.2)" }}>
              {ann.audience}
            </span>
            {ann.pinned && (
              <span style={{ padding: "6px 16px", borderRadius: 20, fontSize: 16, fontWeight: 800, background: "rgba(26,120,255,.1)", color: "var(--blue)", border: "1px solid rgba(26,120,255,.3)" }}>
                📌 Pinned
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            <button className="adm-action-btn" title={ann.pinned ? "Unpin" : "Pin"} onClick={() => onTogglePin(ann.id)} style={{ color: ann.pinned ? "var(--blue)" : undefined, fontSize: 20, width: 48, height: 48 }}>📌</button>
            <button className="adm-action-btn" title="Edit" onClick={() => onEdit(ann)} style={{ fontSize: 20, width: 48, height: 48 }}>✏️</button>
            <button className="adm-action-btn btn-delete" title="Delete" onClick={() => onDelete(ann.id)} style={{ fontSize: 20, width: 48, height: 48 }}>🗑️</button>
          </div>
        </div>

        <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text-main)", marginBottom: 16, lineHeight: 1.3 }}>{ann.title}</div>
        <div style={{ fontSize: 20, color: "var(--dimmer)", lineHeight: 1.7, marginBottom: 24 }}>{ann.body}</div>

        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 18, color: "var(--dimmer)", opacity: .8 }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>🗓 {ann.date}</span>
          <span style={{ fontWeight: 600 }}>· Posted by <strong style={{ color: "var(--text-main)", opacity: 1, fontWeight: 800 }}>{ann.from}</strong></span>
        </div>
      </div>
    </motion.div>
  );
}


// ── 5. MAIN COMPONENT ────────────────────────────────────────────────────────
export default function AdminAnnouncements() {
  const navigate = useNavigate();
  const location = useLocation();
  const webglRef = useRef(null);

  const [collapse,       setCollapse]       = useState(false);
  const [announcements,  setAnnouncements]  = useState(INITIAL_ANNOUNCEMENTS);
  const [compose,        setCompose]        = useState(null); 
  const [search,         setSearch]         = useState("");
  const [typeFilter,     setTypeFilter]     = useState("All");
  const [audienceFilter, setAudienceFilter] = useState("All");
  const [showStats,      setShowStats]      = useState(false);

  const filtered = announcements.filter(a => {
    const q = search.toLowerCase();
    const matchSearch   = !q || a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q) || a.from.toLowerCase().includes(q);
    const matchType     = typeFilter === "All" || a.type === typeFilter;
    const matchAudience = audienceFilter === "All" || a.audience === audienceFilter;
    return matchSearch && matchType && matchAudience;
  });

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

  const handleTogglePin = (id) => setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a));

  /* Three.js bg - Blue Unified Theme */
  useEffect(() => {
    const canvas = webglRef.current;
    let W = window.innerWidth, H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H); renderer.setClearColor(0xf0f5ff, 1);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
    camera.position.set(0, 3, 12);
    
    scene.add(new THREE.AmbientLight(0x0033aa, 0.6));
    const sun = new THREE.DirectionalLight(0x40a9ff, 1.2); sun.position.set(-6, 12, 8); scene.add(sun);
    
    const COUNT = 140;
    const ptPos = new Float32Array(COUNT*3), ptCol = new Float32Array(COUNT*3), ptVel = [];
    for (let i=0;i<COUNT;i++){
      ptPos[i*3]=(Math.random()-.5)*34;ptPos[i*3+1]=(Math.random()-.5)*22;ptPos[i*3+2]=(Math.random()-.5)*18-6;
      ptVel.push({x:(Math.random()-.5)*.008,y:(Math.random()-.5)*.006});
      ptCol[i*3]=.1; ptCol[i*3+1]=.5; ptCol[i*3+2]=1;
    }
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute("position",new THREE.BufferAttribute(ptPos,3));
    ptGeo.setAttribute("color",   new THREE.BufferAttribute(ptCol,3));
    scene.add(new THREE.Points(ptGeo,new THREE.PointsMaterial({size:.05,transparent:true,opacity:.6,vertexColors:true})));
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
    document.querySelectorAll(".sc, .admin-isolated-card").forEach((el,i)=>{
      gsap.fromTo(el,{opacity:0,y:24},{opacity:1,y:0,duration:.45,ease:"power2.out",delay:i*.06});
    });
    setTimeout(() => setShowStats(true), 100);
  }, [typeFilter, audienceFilter]); 

  return (
    <div className="admin-ann-wrapper">
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

      <div id="app" style={{ opacity: 1, zIndex: 10, position: 'relative' }}>
        
        {/* 🔥 INLINE SIDEBAR 🔥 */}
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

        {/* MAIN */}
        <div id="main">
          <div id="topbar" style={{ opacity: 1 }}>
            <div className="tb-glow" />
            <div className="pg-title"><span>Announcements</span></div>
            <div className="tb-r">
              <div className="sem-chip">{announcements.length} total</div>
              <button className="adm-btn-primary" onClick={() => setCompose("new")} style={{ fontSize: 18, padding: "10px 24px", marginLeft: 12 }}>
                📣 Post Announcement
              </button>
            </div>
          </div>

          <div id="scroll">
            {/* ── GODZILLA STATS GRID ── */}
            <div className="sgrid">
              {[
                { id:"sc1", cls:"sc-a", label:"Pinned",        val: announcements.filter(a=>a.pinned).length,             did:"d1", special:"none" },
                { id:"sc2", cls:"sc-b", label:"Announcements", val: announcements.filter(a=>a.type==="announcement").length, did:"d2", special:"none" },
                { id:"sc3", cls:"sc-c", label:"Exams",         val: announcements.filter(a=>a.type==="exam").length,       did:"d3", special:"fire" },
                { id:"sc4", cls:"sc-d", label:"Quizzes",       val: announcements.filter(a=>a.type==="quiz").length,       did:"d4", special:"bubbles" },
              ].map((c) => (
                <div className={`sc ${c.cls} hov-target`} id={c.id} key={c.id}>
                  <div className="sc-blob" /><div className="sc-deco" />
                  <div className="sc-label">{c.label}</div>
                  <div className="sc-val">
                    {showStats ? <AnimatedCounter value={c.val} useCommas={false} suffix="" /> : "0"}
                  </div>
                  
                  {c.special === "bubbles" && (
                    <div className="bubbles">
                      {[0,1,2,3,4,5,6].map(i => (
                        <span key={i} className="bubble" style={{ left:`${5+i*13}%`, animationDelay:`${i*0.3}s`, animationDuration:`${2+i*0.22}s`, width:`${6+i%3*2}px`, height:`${6+i%3*2}px` }} />
                      ))}
                    </div>
                  )}
                  {c.special === "fire" && (
                    <div className="card-fire">
                      {[0,1,2,3,4].map(i => (
                        <div key={i} className={`cflame cf${i+1}`} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Filter bar - ANTI SQUASH CLASS APPLIED */}
            <div className="admin-isolated-card" style={{ marginBottom: 40, padding: "24px 32px" }}>
              <div className="adm-filter-bar" style={{ marginBottom: 0, gap: 20 }}>
                <div className="adm-filter-search" style={{ padding: "16px 20px", flex: 1, maxWidth: 600 }}>
                  <span style={{ color: "#94a3b8", fontSize: 22 }}>🔍</span>
                  <input
                    style={{ fontSize: 20 }}
                    placeholder="Search by title, body, or sender…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <select className="adm-filter-select" style={{ fontSize: 18, padding: "16px 20px" }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                  <option value="All">All Types</option>
                  {Object.keys(TYPE_META).map(t => <option key={t} value={t}>{TYPE_META[t].icon} {TYPE_META[t].label}</option>)}
                </select>
                <select className="adm-filter-select" style={{ fontSize: 18, padding: "16px 20px" }} value={audienceFilter} onChange={e => setAudienceFilter(e.target.value)}>
                  <option value="All">All Audiences</option>
                  {AUDIENCES.map(a => <option key={a}>{a}</option>)}
                </select>
                <div className="adm-filter-count" style={{ fontSize: 18, padding: "16px 24px" }}>
                  {sorted.length} result{sorted.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>

            {/* Announcement list */}
            {sorted.length === 0 ? (
              <div className="admin-isolated-card" style={{ textAlign: "center", padding: "100px 40px" }}>
                <div style={{ fontSize: 64, marginBottom: 24 }}>📭</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text-main)", marginBottom: 12 }}>No announcements</div>
                <div style={{ fontSize: 20, color: "var(--dimmer)", marginBottom: 32 }}>Nothing matches your filters. Post a new announcement above.</div>
                <button className="adm-btn-primary" onClick={() => setCompose("new")} style={{ fontSize: 20, padding: "16px 32px" }}>
                  📣 Post Announcement
                </button>
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
    </div>
  );
}