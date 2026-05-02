import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
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