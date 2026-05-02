import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { gsap } from "gsap";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import "./AdminPortal.css";
import "./AdminAnnouncements.css";
import AnnCard from "./Components/Admin/AnnCard";
import ComposeModal from "./Components/Admin/ComposeModal";
import {
  TYPE_META,
  AUDIENCES,
  EMPTY_FORM,
  INITIAL_ANNOUNCEMENTS,
} from "./data/AdminAnnouncementsData";

// ── CUSTOM SMOOTH COUNTER HOOK ──
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

const NAV = [
  ["Overview",   [["⊞", "Dashboard",       "/admin/dashboard"]]],
  ["Management", [["👥", "Student Records", "/admin/students"],
                  ["🎓", "Teachers",        "/admin/teachers"],
                  ["📚", "Course Catalog",  "/admin/courses"],
                  ["📋", "Enrollment",      "/admin/enrollment"],
                  ["📣", "Announcements",   "/admin/announcements"]]]
];

/* ── COMPOSE MODAL ──────────────────────────────────────────────────────────── */


/* ── ANNOUNCEMENT CARD ───────────────────────────────────────────────────────── */

/* ── MAIN COMPONENT ─────────────────────────────────────────────────────────── */
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

  /* Three.js bg */
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
    document.querySelectorAll(".sc, .adm-card").forEach((el,i)=>{
      gsap.fromTo(el,{opacity:0,y:24},{opacity:1,y:0,duration:.45,ease:"power2.out",delay:i*.06});
    });
    setTimeout(() => setShowStats(true), 100);
  }, []);

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
        {/* 🔥 EXACT MATCH TO DASHBOARD: SIDEBAR 🔥 */}
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

        {/* 🔥 EXACT MATCH TO DASHBOARD: MAIN & TOPBAR 🔥 */}
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
            {/* ── GODZILLA STATS GRID (SGRID) ── */}
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

            {/* Filter bar */}
            <div className="adm-card" style={{ marginBottom: 40, padding: "24px 32px" }}>
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
              <div className="adm-card" style={{ textAlign: "center", padding: "100px 40px" }}>
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