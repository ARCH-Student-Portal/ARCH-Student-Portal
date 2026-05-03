import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Components/shared/Sidebar";
import { ADMIN_NAV } from "./config/AdminNav";
import StatsGrid from "./data/StatsGrid";
import ComposeModal from "./Components/Admin/ComposeModal";
import AnnCard from "./Components/Admin/AnnCard";
import { TYPE_META, AUDIENCES, EMPTY_FORM } from "./data/AdminAnnouncementsData";
import { getAnnouncementStats } from "./Utilities/announcementAdapter";
import AdminApi from "./config/adminApi";
import "./AdminAnnouncements.css";

// ── LOADING SKELETON ──────────────────────────────────────────────────────────
function AnnouncementSkeleton() {
  return (
    <div className="admin-isolated-card" style={{ padding: "28px 32px", marginBottom: 16, opacity: 0.6 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--shimmer, #e2e8f0)", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 20, width: "40%", borderRadius: 6, background: "var(--shimmer, #e2e8f0)", marginBottom: 10, animation: "pulse 1.5s ease-in-out infinite" }} />
          <div style={{ height: 14, width: "70%", borderRadius: 6, background: "var(--shimmer, #e2e8f0)", marginBottom: 8, animation: "pulse 1.5s ease-in-out infinite" }} />
          <div style={{ height: 14, width: "55%", borderRadius: 6, background: "var(--shimmer, #e2e8f0)", animation: "pulse 1.5s ease-in-out infinite" }} />
        </div>
      </div>
    </div>
  );
}

// ── TOAST NOTIFICATION ────────────────────────────────────────────────────────
function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg = type === "error" ? "#ef4444" : type === "warning" ? "#f59e0b" : "#22c55e";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      style={{
        position: "fixed", bottom: 32, right: 32, zIndex: 9999,
        background: bg, color: "#fff", borderRadius: 12,
        padding: "14px 24px", fontSize: 15, fontWeight: 600,
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        display: "flex", alignItems: "center", gap: 10, maxWidth: 380
      }}
    >
      <span>{type === "error" ? "❌" : type === "warning" ? "⚠️" : "✅"}</span>
      <span>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 18, marginLeft: 8, lineHeight: 1 }}>×</button>
    </motion.div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function AdminAnnouncements() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const webglRef  = useRef(null);

  const [collapse,       setCollapse]       = useState(false);
  const [announcements,  setAnnouncements]  = useState([]);
  const [compose,        setCompose]        = useState(null);
  const [search,         setSearch]         = useState("");
  const [typeFilter,     setTypeFilter]     = useState("All");
  const [audienceFilter, setAudienceFilter] = useState("All");
  const [showStats,      setShowStats]      = useState(false);

  // ── API state ──
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [toasts,     setToasts]     = useState([]);   // [{ id, message, type }]

  // ── Toast helpers ──
  const pushToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Fetch announcements on mount ──
  useEffect(() => {
    let cancelled = false;

    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const res = await AdminApi.getAnnouncements();

        if (cancelled) return;

        // Normalise: API may return { data: [...] } or [...] directly
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : [];

        if (res?.error || res?.message?.toLowerCase().includes("error")) {
          throw new Error(res.message || "Failed to load announcements");
        }

        setAnnouncements(list);
      } catch (err) {
        if (!cancelled) {
          console.error("[AdminAnnouncements] fetch error:", err);
          pushToast(err.message || "Could not load announcements. Please refresh.", "error");
          setAnnouncements([]); // keep UI functional
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setTimeout(() => setShowStats(true), 100);
        }
      }
    };

    fetchAnnouncements();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Filtered & sorted list ──
  const filtered = announcements.filter(a => {
    const q = search.toLowerCase();
    const matchSearch   = !q || a.title?.toLowerCase().includes(q) || a.body?.toLowerCase().includes(q) || a.from?.toLowerCase().includes(q);
    const matchType     = typeFilter === "All" || a.type === typeFilter;
    const matchAudience = audienceFilter === "All" || a.audience === audienceFilter;
    return matchSearch && matchType && matchAudience;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return  1;
    return 0;
  });

  const announcementStats = getAnnouncementStats(announcements);

  // ── Save handler (POST new only — API has no PUT/PATCH for announcements) ──
  const handleSave = async (form) => {
    setSaving(true);

    const now = new Date()
      .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      .replace(/ /g, " ");

    if (compose === "new") {
      // ── Optimistic insert ──
      const tempId  = `temp-${Date.now()}`;
      const optimistic = { ...form, id: tempId, date: now, _pending: true };
      setAnnouncements(prev => [optimistic, ...prev]);
      setCompose(null);

      try {
        const res = await AdminApi.postAnnouncement(form);

        if (res?.error || res?.message?.toLowerCase().includes("error")) {
          throw new Error(res.message || "Failed to post announcement");
        }

        // Replace temp with server record
        const serverRecord = res?.data ?? res;
        setAnnouncements(prev =>
          prev.map(a => a.id === tempId ? { ...optimistic, ...serverRecord, _pending: false } : a)
        );
        pushToast("Announcement posted successfully!");
      } catch (err) {
        console.error("[AdminAnnouncements] post error:", err);
        // Roll back optimistic insert
        setAnnouncements(prev => prev.filter(a => a.id !== tempId));
        pushToast(err.message || "Failed to post announcement. Please try again.", "error");
      }
    } else {
      // ── Local edit (no PATCH endpoint available) ──
      setAnnouncements(prev => prev.map(a => a.id === form.id ? { ...form } : a));
      setCompose(null);
      pushToast("Announcement updated locally.", "warning");
    }

    setSaving(false);
  };

  // ── Delete handler (local only — no DELETE endpoint for announcements) ──
  const handleDelete = (id) => {
    if (!window.confirm("Delete this announcement? This cannot be undone.")) return;
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    pushToast("Announcement removed.", "warning");
  };

  const handleTogglePin = (id) =>
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a));

  // ── Three.js background ──
  useEffect(() => {
    const canvas = webglRef.current;
    let W = window.innerWidth, H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H); renderer.setClearColor(0xf0f5ff, 1);
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
    camera.position.set(0, 3, 12);

    scene.add(new THREE.AmbientLight(0x0033aa, 0.6));
    const sun = new THREE.DirectionalLight(0x40a9ff, 1.2);
    sun.position.set(-6, 12, 8); scene.add(sun);

    const COUNT = 140;
    const ptPos = new Float32Array(COUNT * 3), ptCol = new Float32Array(COUNT * 3), ptVel = [];
    for (let i = 0; i < COUNT; i++) {
      ptPos[i*3]   = (Math.random() - .5) * 34;
      ptPos[i*3+1] = (Math.random() - .5) * 22;
      ptPos[i*3+2] = (Math.random() - .5) * 18 - 6;
      ptVel.push({ x: (Math.random() - .5) * .008, y: (Math.random() - .5) * .006 });
      ptCol[i*3] = .1; ptCol[i*3+1] = .5; ptCol[i*3+2] = 1;
    }
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute("position", new THREE.BufferAttribute(ptPos, 3));
    ptGeo.setAttribute("color",    new THREE.BufferAttribute(ptCol, 3));
    scene.add(new THREE.Points(ptGeo, new THREE.PointsMaterial({ size: .05, transparent: true, opacity: .6, vertexColors: true })));

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
        if (p[i*3]   >  17) p[i*3]   = -17;
        if (p[i*3]   < -17) p[i*3]   =  17;
        if (p[i*3+1] >  11) p[i*3+1] = -11;
        if (p[i*3+1] < -11) p[i*3+1] =  11;
      }
      ptGeo.attributes.position.needsUpdate = true;
      camera.position.x += (nmx * .8 - camera.position.x) * .015;
      camera.position.y += (nmy * .5 + 3 - camera.position.y) * .015;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    loop();

    const onResize = () => {
      W = window.innerWidth; H = window.innerHeight;
      renderer.setSize(W, H); camera.aspect = W / H; camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // ── Card entrance animations after filter change ──
  useEffect(() => {
    if (!loading) {
      document.querySelectorAll(".sc, .admin-isolated-card").forEach((el, i) => {
        gsap.fromTo(el, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .45, ease: "power2.out", delay: i * .06 });
      });
    }
    setTimeout(() => setShowStats(true), 100);
  }, [typeFilter, audienceFilter, loading]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="admin-ann-wrapper">
      <canvas id="adm-webgl" ref={webglRef} />

      {/* ── Toasts ── */}
      <AnimatePresence>
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </AnimatePresence>

      {/* ── Compose Modal ── */}
      <AnimatePresence>
        {compose && (
          <ComposeModal
            existing={compose === "new" ? null : compose}
            onClose={() => setCompose(null)}
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
          {/* ── Top Bar ── */}
          <div id="topbar" style={{ opacity: 1 }}>
            <div className="tb-glow" />
            <div className="pg-title"><span>Announcements</span></div>
            <div className="tb-r">
              <div className="sem-chip">
                {loading ? "Loading…" : `${announcements.length} total`}
              </div>
              <button
                className="adm-btn-primary"
                onClick={() => setCompose("new")}
                disabled={saving}
                style={{ fontSize: 18, padding: "10px 24px", marginLeft: 12, opacity: saving ? 0.7 : 1 }}
              >
                {saving ? "⏳ Posting…" : "📣 Post Announcement"}
              </button>
            </div>
          </div>

          <div id="scroll">
            {/* ── Stats Grid ── */}
            <StatsGrid showStats={showStats} cards={announcementStats} />

            {/* ── Filter Bar ── */}
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
                <select
                  className="adm-filter-select"
                  style={{ fontSize: 18, padding: "16px 20px" }}
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                >
                  <option value="All">All Types</option>
                  {Object.keys(TYPE_META).map(t => (
                    <option key={t} value={t}>{TYPE_META[t].icon} {TYPE_META[t].label}</option>
                  ))}
                </select>
                <select
                  className="adm-filter-select"
                  style={{ fontSize: 18, padding: "16px 20px" }}
                  value={audienceFilter}
                  onChange={e => setAudienceFilter(e.target.value)}
                >
                  <option value="All">All Audiences</option>
                  {AUDIENCES.map(a => <option key={a}>{a}</option>)}
                </select>
                <div className="adm-filter-count" style={{ fontSize: 18, padding: "16px 24px" }}>
                  {loading ? "…" : `${sorted.length} result${sorted.length !== 1 ? "s" : ""}`}
                </div>
              </div>
            </div>

            {/* ── Content Area ── */}
            {loading ? (
              // Loading skeletons
              <div>
                {[0, 1, 2].map(i => <AnnouncementSkeleton key={i} />)}
              </div>
            ) : sorted.length === 0 ? (
              // Empty state
              <div className="admin-isolated-card" style={{ textAlign: "center", padding: "100px 40px" }}>
                <div style={{ fontSize: 64, marginBottom: 24 }}>📭</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text-main)", marginBottom: 12 }}>
                  {announcements.length === 0 ? "No announcements yet" : "No results found"}
                </div>
                <div style={{ fontSize: 20, color: "var(--dimmer)", marginBottom: 32 }}>
                  {announcements.length === 0
                    ? "Post your first announcement to get started."
                    : "Nothing matches your filters. Try adjusting your search."}
                </div>
                <button
                  className="adm-btn-primary"
                  onClick={() => setCompose("new")}
                  style={{ fontSize: 20, padding: "16px 32px" }}
                >
                  📣 Post Announcement
                </button>
              </div>
            ) : (
              // Announcement cards
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