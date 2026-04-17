import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { gsap } from "gsap";
import "./StudentProfile.css";

// ── STUDENT DATA ──────────────────────────────────────────────────────────────
const initialStudentData = {
  name:              "Areeb Bucha",
  initials:          "AB",
  rollNo:            "21K-3210",
  status:            "Active",
  program:           "BS Computer Science",
  batch:             "Fall 2021",
  section:           "Section A",
  semester:          "7th Semester",
  campus:            "Lahore",
  email:             "21k-3210@lhr.nu.edu.pk",
  phone:             "+92-300-1234567",
  cnic:              "35202-1234567-1",
  bio:               "CS student at FAST-NUCES Lahore. Interested in distributed systems and competitive programming.",
  linkedin:          "linkedin.com/in/areebbucha",
  github:            "github.com/areebbucha",
  emergencyName:     "Muhammad Bucha",
  emergencyRelation: "Father",
  emergencyPhone:    "+92-300-9876543",
};

// ── DIGITAL ID CARD MODAL ─────────────────────────────────────────────────────
function DigitalIDCard({ student, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box id-card-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="id-card">
          <div className="id-card-header">
            <div className="id-uni-logo">A</div>
            <div>
              <div className="id-uni-name">FAST National University</div>
              <div className="id-uni-sub">NUCES · Lahore Campus</div>
            </div>
            <div className="id-hologram" />
          </div>
          <div className="id-card-body">
            <div className="id-avatar-wrap">
              <div className="id-avatar-ring" />
              <div className="id-avatar">{student.initials}</div>
            </div>
            <div className="id-info">
              <div className="id-name">{student.name}</div>
              <div className="id-program">{student.program}</div>
              <div className="id-rows">
                <div className="id-row"><span className="id-lbl">Roll No.</span><span className="id-val mono">{student.rollNo}</span></div>
                <div className="id-row"><span className="id-lbl">Batch</span><span className="id-val">{student.batch}</span></div>
                <div className="id-row"><span className="id-lbl">Section</span><span className="id-val">{student.section}</span></div>
                <div className="id-row"><span className="id-lbl">Semester</span><span className="id-val">{student.semester}</span></div>
                <div className="id-row"><span className="id-lbl">Email</span><span className="id-val mono" style={{ fontSize: 10 }}>{student.email}</span></div>
              </div>
            </div>
          </div>
          <div className="id-card-footer">
            <div className="id-barcode">
              {Array.from({ length: 28 }).map((_, i) => (
                <div key={i} className="id-bar" style={{ height: `${12 + Math.sin(i * 1.7) * 8}px` }} />
              ))}
            </div>
            <div className="id-validity">Valid: {student.batch} — {student.semester}</div>
            <div className="id-chip"><div className="id-chip-inner" /></div>
          </div>
          <div className="id-card-shine" />
          <div className="id-card-bg-pattern" />
        </div>
      </div>
    </div>
  );
}

// ── CAMPUS TRANSFER MODAL ─────────────────────────────────────────────────────
function CampusTransferModal({ onClose }) {
  const campuses = ["Lahore", "Karachi", "Islamabad", "Peshawar", "Chiniot-Faisalabad"];
  const [selected, setSelected] = useState("");
  const [reason,   setReason]   = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box confirm-box" onClick={e => e.stopPropagation()}>
        <div className="confirm-icon">✅</div>
        <div className="confirm-title">Transfer Request Submitted</div>
        <div className="confirm-sub">Your campus transfer request to <strong>{selected}</strong> has been submitted. The academic office will contact you within 3–5 working days.</div>
        <button className="btn-save" onClick={onClose}>Done</button>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-header">
          <div className="modal-icon">🏛️</div>
          <div><div className="modal-title">Campus Transfer</div><div className="modal-sub">Request a transfer to another campus</div></div>
        </div>
        <div className="edit-fields">
          <div className="edit-field">
            <label className="edit-lbl">Current Campus</label>
            <div className="edit-readonly">Lahore</div>
          </div>
          <div className="edit-field">
            <label className="edit-lbl">Transfer To</label>
            <div className="campus-grid">
              {campuses.filter(c => c !== "Lahore").map(c => (
                <div key={c} className={`campus-chip${selected === c ? " selected" : ""}`} onClick={() => setSelected(c)}>{c}</div>
              ))}
            </div>
          </div>
          <div className="edit-field">
            <label className="edit-lbl">Reason for Transfer</label>
            <textarea className="edit-input edit-textarea" placeholder="Briefly describe your reason..." value={reason} onChange={e => setReason(e.target.value)} />
          </div>
          <div className="modal-notice">⚠️ Transfer requests are processed once per semester. Ensure your current semester dues are cleared before applying.</div>
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" style={{ opacity: selected && reason ? 1 : 0.4, cursor: selected && reason ? "pointer" : "not-allowed" }} onClick={() => selected && reason && setSubmitted(true)}>Submit Request</button>
        </div>
      </div>
    </div>
  );
}

// ── FREEZE SEMESTER MODAL ─────────────────────────────────────────────────────
function FreezeSemesterModal({ onClose }) {
  const [reason,    setReason]    = useState("");
  const [agreed,    setAgreed]    = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const reasons = ["Medical / Health Issues", "Financial Hardship", "Family Emergency", "Academic Preparation", "Other"];

  if (submitted) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box confirm-box" onClick={e => e.stopPropagation()}>
        <div className="confirm-icon">🧊</div>
        <div className="confirm-title">Freeze Request Submitted</div>
        <div className="confirm-sub">Your semester freeze request has been forwarded to the Academic Affairs Office. You will receive a decision via email within 5–7 working days.</div>
        <button className="btn-save" onClick={onClose}>Done</button>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-header">
          <div className="modal-icon">🧊</div>
          <div><div className="modal-title">Freeze Semester</div><div className="modal-sub">Temporarily suspend current enrollment</div></div>
        </div>
        <div className="edit-fields">
          <div className="freeze-info-card">
            <div className="freeze-info-row"><span>📅</span><span>Current Semester</span><strong>Spring 2025 (7th)</strong></div>
            <div className="freeze-info-row"><span>⏳</span><span>Freeze Duration</span><strong>1 Semester Max</strong></div>
            <div className="freeze-info-row"><span>📋</span><span>Policy</span><strong>Max 2 freezes in degree</strong></div>
          </div>
          <div className="edit-field">
            <label className="edit-lbl">Reason</label>
            <div className="reason-grid">
              {reasons.map(r => (
                <div key={r} className={`reason-chip${reason === r ? " selected" : ""}`} onClick={() => setReason(r)}>{r}</div>
              ))}
            </div>
          </div>
          <div className="modal-notice danger">⚠️ Freezing will cancel all current course registrations. Hostel and transport allocations may be affected. This action requires Dean's approval.</div>
          <label className="agree-row">
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
            <span>I understand the implications and confirm this request</span>
          </label>
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save danger-btn" style={{ opacity: reason && agreed ? 1 : 0.4, cursor: reason && agreed ? "pointer" : "not-allowed" }} onClick={() => reason && agreed && setSubmitted(true)}>Submit Freeze Request</button>
        </div>
      </div>
    </div>
  );
}

// ── CHANGE PASSWORD MODAL ─────────────────────────────────────────────────────
function ChangePasswordModal({ onClose }) {
  const [current,   setCurrent]   = useState("");
  const [next,      setNext]      = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [err,       setErr]       = useState("");

  const strength = next.length === 0 ? 0 : next.length < 6 ? 1 : next.length < 10 ? 2 : /[A-Z]/.test(next) && /[0-9]/.test(next) && /[^A-Za-z0-9]/.test(next) ? 4 : 3;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#ff4d6a", "#ffab00", "#40a9ff", "#00c853"][strength];

  if (submitted) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box confirm-box" onClick={e => e.stopPropagation()}>
        <div className="confirm-icon">🔒</div>
        <div className="confirm-title">Password Updated</div>
        <div className="confirm-sub">Your password has been changed successfully. Use your new password on next login.</div>
        <button className="btn-save" onClick={onClose}>Done</button>
      </div>
    </div>
  );

  const handleSubmit = () => {
    if (!current)          { setErr("Enter your current password."); return; }
    if (next.length < 8)   { setErr("New password must be at least 8 characters."); return; }
    if (next !== confirm)  { setErr("Passwords do not match."); return; }
    setErr(""); setSubmitted(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-header">
          <div className="modal-icon">🔒</div>
          <div><div className="modal-title">Change Password</div><div className="modal-sub">Update your account password</div></div>
        </div>
        <div className="edit-fields">
          <div className="edit-field">
            <label className="edit-lbl">Current Password</label>
            <input type="password" className="edit-input" placeholder="••••••••" value={current} onChange={e => setCurrent(e.target.value)} />
          </div>
          <div className="edit-field">
            <label className="edit-lbl">New Password</label>
            <input type="password" className="edit-input" placeholder="••••••••" value={next} onChange={e => setNext(e.target.value)} />
            {next.length > 0 && (
              <div className="pw-strength-wrap">
                <div className="pw-strength-bar">
                  {[1, 2, 3, 4].map(i => <div key={i} className="pw-seg" style={{ background: i <= strength ? strengthColor : "rgba(18,78,170,.1)" }} />)}
                </div>
                <span style={{ fontSize: 11, color: strengthColor, fontWeight: 700 }}>{strengthLabel}</span>
              </div>
            )}
          </div>
          <div className="edit-field">
            <label className="edit-lbl">Confirm New Password</label>
            <input type="password" className="edit-input" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} />
          </div>
          {err && <div className="pw-err">⚠️ {err}</div>}
          <div className="pw-rules">
            <div className={`pw-rule${next.length >= 8      ? " ok" : ""}`}>✓ At least 8 characters</div>
            <div className={`pw-rule${/[A-Z]/.test(next)    ? " ok" : ""}`}>✓ One uppercase letter</div>
            <div className={`pw-rule${/[0-9]/.test(next)    ? " ok" : ""}`}>✓ One number</div>
            <div className={`pw-rule${/[^A-Za-z0-9]/.test(next) ? " ok" : ""}`}>✓ One special character</div>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleSubmit}>Update Password</button>
        </div>
      </div>
    </div>
  );
}

// ── LOGOUT MODAL ──────────────────────────────────────────────────────────────
function LogoutModal({ onClose, onLogout }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box confirm-box" onClick={e => e.stopPropagation()}>
        <div className="confirm-icon">👋</div>
        <div className="confirm-title">Log Out?</div>
        <div className="confirm-sub">You'll be signed out of the ARCH Student Portal. Any unsaved changes will be lost.</div>
        <div className="modal-actions" style={{ justifyContent: "center", gap: 12, marginTop: 8 }}>
          <button className="btn-cancel" onClick={onClose}>Stay Logged In</button>
          <button className="btn-save danger-btn" onClick={onLogout}>Log Out</button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function StudentProfile() {
  const navigate       = useNavigate();
  const location       = useLocation();
  const webglRef       = useRef(null);
  const introCanvasRef = useRef(null);
  const introRef       = useRef(null);
  const appRef         = useRef(null);
  const sidebarRef     = useRef(null);

  const [collapse,   setCollapse]   = useState(false);
  const [student,    setStudent]    = useState(initialStudentData);
  const [saveFlash,  setSaveFlash]  = useState(false);
  const [activeTab,  setActiveTab]  = useState("personal");
  const [editDraft,  setEditDraft]  = useState({ ...initialStudentData });
  const [editDirty,  setEditDirty]  = useState(false);
  const [modal,      setModal]      = useState(null);

  // notification toggles
  const [notifs, setNotifs] = useState({
    gradeRelease:    true,
    attendanceAlert: true,
    noticeBoard:     true,
    examSchedule:    true,
    feeReminder:     false,
    resultCard:      true,
    emailDigest:     false,
    smsAlerts:       false,
  });

  // privacy toggles
  const [privacy, setPrivacy] = useState({
    showEmail:    false,
    showPhone:    false,
    showLinkedIn: true,
    showGithub:   true,
  });

  const openModal  = (n) => setModal(n);
  const closeModal = ()  => setModal(null);

  const handleFieldChange = (key, val) => {
    setEditDraft(d => ({ ...d, [key]: val }));
    setEditDirty(true);
  };

  const handleSave = () => {
    setStudent({ ...editDraft });
    setEditDirty(false);
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 2000);
  };

  const handleDiscard = () => {
    setEditDraft({ ...student });
    setEditDirty(false);
  };

  const toggleNotif   = (k) => setNotifs(n  => ({ ...n,  [k]: !n[k]  }));
  const togglePrivacy = (k) => setPrivacy(p => ({ ...p,  [k]: !p[k]  }));

  // ── INTRO ANIMATION ──
  useEffect(() => {
    const hasPlayed = sessionStorage.getItem("archIntroPlayed");
    if (hasPlayed) {
      introRef.current.style.display = "none";
      appRef.current.style.opacity = "1";
      sidebarRef.current.style.transform = "translateX(0)";
      document.querySelectorAll(".glass-card").forEach((el, i) => {
        gsap.to(el, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.4)", delay: i * 0.08 });
      });
      return;
    }
    const canvas = introCanvasRef.current;
    const ctx    = canvas.getContext("2d");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const words = ["KNOWLEDGE","GRADES","CAMPUS","LECTURE","SEMESTER","THESIS","RESEARCH","LIBRARY","STUDENT","FACULTY","EXAM","DEGREE","ALUMNI","SCIENCE","ENGINEERING","FAST","NUCES","PORTAL"];
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      word:    words[Math.floor(Math.random() * words.length)],
      opacity: Math.random() * 0.4 + 0.05,
      speed:   Math.random() * 0.8 + 0.2,
      size:    Math.floor(Math.random() * 10) + 10,
      flicker: Math.random() * 0.025 + 0.005,
      hue:     Math.random() > 0.6 ? "255,255,255" : Math.random() > 0.5 ? "100,180,255" : "60,140,255",
    }));
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.5, opacity: Math.random() * 0.6 + 0.1, twinkle: Math.random() * 0.02,
    }));
    let animId;
    const draw = () => {
      ctx.fillStyle = "rgba(0,4,14,0.18)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        s.opacity += s.twinkle * (Math.random() > 0.5 ? 1 : -1);
        s.opacity = Math.max(0.05, Math.min(0.8, s.opacity));
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,210,255,${s.opacity})`; ctx.fill();
      });
      particles.forEach(p => {
        p.y -= p.speed * 0.4;
        p.opacity += p.flicker * (Math.random() > 0.5 ? 1 : -1);
        p.opacity = Math.max(0.03, Math.min(0.55, p.opacity));
        if (p.y < -30) { p.y = canvas.height + 20; p.x = Math.random() * canvas.width; p.word = words[Math.floor(Math.random() * words.length)]; }
        ctx.font = `${p.size}px 'Inter', sans-serif`;
        ctx.fillStyle = `rgba(${p.hue},${p.opacity})`;
        ctx.fillText(p.word, p.x, p.y);
      });
      animId = requestAnimationFrame(draw);
    };
    ctx.fillStyle = "#00040e"; ctx.fillRect(0, 0, canvas.width, canvas.height); draw();
    const afterIntro = () => {
      cancelAnimationFrame(animId);
      sessionStorage.setItem("archIntroPlayed", "true");
      gsap.set(introRef.current, { display: "none" });
      gsap.to(appRef.current,    { opacity: 1, duration: 0.6 });
      gsap.to(sidebarRef.current,{ x: 0, duration: 1.2, ease: "expo.out", delay: 0.05 });
      document.querySelectorAll(".glass-card").forEach((el, i) => {
        gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: "back.out(1.4)", delay: 0.8 + i * 0.1 });
      });
    };
    const tl = gsap.timeline({ delay: 0.4, onComplete: afterIntro });
    tl.to("#prf-intro-line",  { scaleX: 1,   duration: 0.8, ease: "power3.out"  }, 0)
      .to("#prf-intro-logo",  { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }, 0.5)
      .to("#prf-intro-sub",   { opacity: 1, y: 0, duration: 0.5 }, 1.1)
      .to("#prf-intro-logo",  { scale: 50, opacity: 0, duration: 0.7, ease: "power4.in" }, 2.4)
      .to("#prf-intro-sub",   { opacity: 0, duration: 0.3 }, 2.4)
      .to("#prf-intro-line",  { opacity: 0, duration: 0.3 }, 2.4)
      .to("#prf-intro-flash", { opacity: 1, duration: 0.08 }, 2.85)
      .to("#prf-intro-flash", { opacity: 0, duration: 0.4  }, 2.93)
      .to(introRef.current,   { opacity: 0, duration: 0.35 }, 2.88);
    return () => cancelAnimationFrame(animId);
  }, []);

  // ── THREE.JS BACKGROUND ──
  useEffect(() => {
    const canvas = webglRef.current;
    let W = window.innerWidth, H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xf4f8ff, 1);
    const scene  = new THREE.Scene(); scene.fog = new THREE.FogExp2(0xe9f2ff, 0.014);
    const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 200); camera.position.set(0, 2, 10);
    scene.add(new THREE.AmbientLight(0x0033aa, 0.8));
    const dirLight = new THREE.DirectionalLight(0x4488ff, 1.2); dirLight.position.set(5, 10, 5); scene.add(dirLight);
    const pointLight = new THREE.PointLight(0x0066ff, 2, 30); pointLight.position.set(0, 5, 0); scene.add(pointLight);
    const objects = [];
    const mkBook = (x, y, z, s, color) => {
      const g = new THREE.Group();
      const mat = new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.18, shininess: 80, specular: 0x4488ff });
      const p1 = new THREE.Mesh(new THREE.BoxGeometry(1.2*s, 0.05*s, 0.9*s), mat); p1.rotation.z = 0.3;
      const p2 = new THREE.Mesh(new THREE.BoxGeometry(1.2*s, 0.05*s, 0.9*s), mat); p2.rotation.z = -0.3;
      g.add(p1); g.add(p2);
      const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.04*s, 0.04*s, 0.9*s, 8), new THREE.MeshPhongMaterial({ color: 0x88bbff, transparent: true, opacity: 0.4 }));
      spine.rotation.x = Math.PI / 2; g.add(spine); g.position.set(x, y, z); scene.add(g);
      objects.push({ mesh: g, speed: Math.random()*0.004+0.002, phase: Math.random()*Math.PI*2, rotSpeed: (Math.random()-0.5)*0.008 });
    };
    mkBook(-6, 3, -5, 1.8, 0x1155cc); mkBook(6, 1, -6, 2.2, 0x0066ff);
    mkBook(-3,-2, -4, 1.4, 0x2266dd); mkBook(4, 4, -8, 2.8, 0x0044aa);
    const COUNT = 200, ptPos = new Float32Array(COUNT*3), ptCol = new Float32Array(COUNT*3), ptVel = [];
    for (let i = 0; i < COUNT; i++) {
      ptPos[i*3]  =(Math.random()-0.5)*30; ptPos[i*3+1]=(Math.random()-0.5)*20; ptPos[i*3+2]=(Math.random()-0.5)*15-5;
      ptVel.push({ x:(Math.random()-0.5)*0.004, y:(Math.random()-0.5)*0.004 });
      const w = Math.random()>0.5; ptCol[i*3]=w?0.8:0.1; ptCol[i*3+1]=w?0.9:0.5; ptCol[i*3+2]=1.0;
    }
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute("position", new THREE.BufferAttribute(ptPos, 3));
    ptGeo.setAttribute("color",    new THREE.BufferAttribute(ptCol, 3));
    scene.add(new THREE.Points(ptGeo, new THREE.PointsMaterial({ size: 0.06, transparent: true, opacity: 0.7, vertexColors: true })));
    const grid = new THREE.GridHelper(60, 40, 0x001133, 0x001133); grid.position.y=-6; grid.material.transparent=true; grid.material.opacity=0.4; scene.add(grid);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(50,24,24), new THREE.MeshBasicMaterial({ color:0x000820, transparent:true, opacity:0.6, side:THREE.BackSide, wireframe:true })); scene.add(dome);
    let nmx=0, nmy=0;
    const onMove = (e) => { nmx=(e.clientX/W)*2-1; nmy=-(e.clientY/H)*2+1; };
    document.addEventListener("mousemove", onMove);
    let t=0, animId;
    const loop = () => {
      animId = requestAnimationFrame(loop); t += 0.008;
      objects.forEach(o => { o.mesh.position.y += Math.sin(t*o.speed*10+o.phase)*0.004; o.mesh.rotation.y += o.rotSpeed; });
      const p = ptGeo.attributes.position.array;
      for (let i=0; i<COUNT; i++) {
        p[i*3]   += ptVel[i].x + nmx*0.0006; p[i*3+1] += ptVel[i].y + nmy*0.0006;
        if (p[i*3]>15) p[i*3]=-15; if (p[i*3]<-15) p[i*3]=15;
        if (p[i*3+1]>10) p[i*3+1]=-10; if (p[i*3+1]<-10) p[i*3+1]=10;
      }
      ptGeo.attributes.position.needsUpdate = true;
      pointLight.position.x = Math.sin(t*0.5)*8; pointLight.position.z = Math.cos(t*0.3)*6;
      dome.rotation.y += 0.0003;
      camera.position.x += (nmx*0.6 - camera.position.x)*0.015;
      camera.position.y += (nmy*0.4+2 - camera.position.y)*0.015;
      camera.lookAt(0,0,0); renderer.render(scene,camera);
    };
    loop();
    const onResize = () => { W=window.innerWidth; H=window.innerHeight; renderer.setSize(W,H); camera.aspect=W/H; camera.updateProjectionMatrix(); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); document.removeEventListener("mousemove",onMove); window.removeEventListener("resize",onResize); };
  }, []);

  // ── TABS CONFIG ──
  const tabs = [
    { id: "personal",   icon: "👤", label: "Personal Info"     },
    { id: "contact",    icon: "📞", label: "Contact & Social"  },
    { id: "emergency",  icon: "🚨", label: "Emergency Contact" },
    { id: "security",   icon: "🔒", label: "Security"          },
    { id: "notifs",     icon: "🔔", label: "Notifications"     },
    { id: "privacy",    icon: "🛡️", label: "Privacy"           },
    { id: "enrollment", icon: "🎓", label: "Enrollment"        },
  ];

  return (
    <>
      <canvas id="prf-webgl" ref={webglRef} />

      {/* INTRO */}
      <div id="prf-intro" ref={introRef}>
        <canvas id="prf-intro-canvas" ref={introCanvasRef} />
        <div id="prf-intro-line" />
        <div id="prf-intro-logo">ARCH</div>
        <div id="prf-intro-sub">Student Portal</div>
        <div id="prf-intro-flash" />
      </div>

      {/* MODALS */}
      {modal === "id"       && <DigitalIDCard student={student} onClose={closeModal} />}
      {modal === "transfer" && <CampusTransferModal onClose={closeModal} />}
      {modal === "freeze"   && <FreezeSemesterModal onClose={closeModal} />}
      {modal === "password" && <ChangePasswordModal onClose={closeModal} />}
      {modal === "logout"   && <LogoutModal onClose={closeModal} onLogout={() => { sessionStorage.clear(); navigate("/login"); }} />}

      {/* APP */}
      <div id="app" ref={appRef}>

        {/* ── SIDEBAR ── */}
        <nav id="sidebar" ref={sidebarRef} className={collapse ? "collapse" : ""}>
          <div className="sb-top-bar" />
          <button className="sb-toggle" onClick={() => setCollapse(c => !c)}>
            <span /><span /><span />
          </button>
          <div className="sb-logo">
            <div className="logo-box">A</div>
            <div><div className="logo-name">ARCH</div><div className="logo-tagline">Student Portal</div></div>
          </div>
          <div className="sb-user active-profile" onClick={() => openModal("id")} title="View Digital ID">
            <div className="uav">AB</div>
            <div><div className="uname">{student.name}</div><div className="uid">{student.rollNo}</div></div>
          </div>
          {[
            ["Overview",      [["⊞","Dashboard","/student/dashboard"],["◎","Academic","/student/academic"]]],
            ["Courses",       [["＋","Registration","/student/registration"],["◈","Grades","/student/grades"],["▦","Marks","/student/marks"],["✓","Attendance","/student/attendance"],["▤","Timetable","/student/timetable"]]],
            ["Communication", [["◉","Notices","/student/notices"]]],
            ["Account",       [["◌","Profile","/student/profile"]]],
          ].map(([sec, items]) => (
            <div key={sec}>
              <div className="nav-sec">{sec}</div>
              {items.map(([ic, label, path]) => (
                <div key={label} className={`ni${location.pathname === path ? " active" : ""}`} onClick={() => navigate(path)}>
                  <div className="ni-ic">{ic}</div>{label}
                  {label === "Notices" && <span className="nbadge">3</span>}
                </div>
              ))}
            </div>
          ))}
          <div className="sb-foot">Spring 2025 · FAST-NUCES</div>
        </nav>

        {/* ── MAIN ── */}
        <div id="main">
          <div id="topbar">
            <div className="pg-title"><span>My Profile</span></div>
            <div className="tb-r">
              <div className="sem-chip">Spring 2025</div>
              {saveFlash  && <div className="save-flash">✓ Saved</div>}
              {editDirty  && <div className="unsaved-chip">● Unsaved changes</div>}
              <button className="logout-btn" onClick={() => openModal("logout")}>⏻ Log Out</button>
            </div>
          </div>

          <div id="scroll">

            {/* ── BANNER ── */}
            <div className="glass-card prf-banner-card">
              <div className="prf-banner-bg" />
              <div className="prf-banner-content">
                <div className="prf-avatar-section">
                  <div className="prf-avatar-wrap" onClick={() => openModal("id")} title="View Digital ID" style={{ cursor: "pointer" }}>
                    <div className="prf-avatar-ring" />
                    <div className="prf-avatar-inner">{student.initials}</div>
                    <div className="prf-avatar-badge">🪪</div>
                  </div>
                  <button className="avatar-change-btn">Change Photo</button>
                </div>
                <div className="prf-banner-info">
                  <div className="prf-name">{student.name}</div>
                  <div className="prf-roll">{student.rollNo} · {student.program}</div>
                  <div className="prf-bio-text">
                    {student.bio || <span style={{ opacity: 0.4, fontStyle: "italic" }}>No bio set — click Edit to add one</span>}
                  </div>
                  <div className="prf-banner-chips">
                    <span className="prf-chip active-chip">● Active</span>
                    <span className="prf-chip">{student.semester}</span>
                    <span className="prf-chip">{student.campus}</span>
                    <span className="prf-chip">{student.section}</span>
                    <span className="prf-chip">{student.batch}</span>
                  </div>
                </div>
                <div className="prf-banner-actions">
                  <button className="prf-id-btn" onClick={() => openModal("id")}>🪪 Digital ID</button>
                </div>
              </div>
            </div>

            {/* ── TABBED EDITOR ── */}
            <div className="prf-editor-layout">

              {/* Tab Nav */}
              <div className="glass-card prf-tab-nav">
                {tabs.map(t => (
                  <div
                    key={t.id}
                    className={`prf-tab-item${activeTab === t.id ? " active" : ""}`}
                    onClick={() => setActiveTab(t.id)}
                  >
                    <span className="tab-icon">{t.icon}</span>
                    <span className="tab-label">{t.label}</span>
                    {activeTab === t.id && <div className="tab-indicator" />}
                  </div>
                ))}
              </div>

              {/* Tab Panels */}
              <div className="prf-tab-content">

                {/* PERSONAL INFO */}
                {activeTab === "personal" && (
                  <div className="glass-card tab-panel">
                    <div className="ch">
                      <div className="ct"><div className="ctbar" />Personal Information</div>
                      <div className="panel-badge">Editable</div>
                    </div>
                    <div className="editor-grid-2">
                      <div className="editor-field">
                        <label className="editor-lbl">Full Name</label>
                        <input className="editor-input" value={editDraft.name} onChange={e => handleFieldChange("name", e.target.value)} />
                      </div>
                      <div className="editor-field">
                        <label className="editor-lbl">CNIC</label>
                        <input className="editor-input" value={editDraft.cnic} onChange={e => handleFieldChange("cnic", e.target.value)} />
                      </div>
                    </div>
                    <div className="editor-field full-width" style={{ marginTop: 14 }}>
                      <label className="editor-lbl">Bio / About Me</label>
                      <textarea className="editor-input editor-textarea" value={editDraft.bio} onChange={e => handleFieldChange("bio", e.target.value)} placeholder="Write a short bio..." />
                    </div>
                    <div className="readonly-section">
                      <div className="readonly-section-title">🔐 Academic Info (Read-only — contact Registrar to change)</div>
                      <div className="readonly-grid">
                        {[["Program", student.program],["Roll No.", student.rollNo],["Batch", student.batch],["Semester", student.semester],["Section", student.section],["Campus", student.campus]].map(([lbl, val]) => (
                          <div className="readonly-item" key={lbl}>
                            <div className="readonly-lbl">{lbl}</div>
                            <div className="readonly-val">{val}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="panel-save-row">
                      <button className="btn-discard" onClick={handleDiscard} disabled={!editDirty}>Discard</button>
                      <button className="btn-save-panel" onClick={handleSave} disabled={!editDirty}>Save Changes</button>
                    </div>
                  </div>
                )}

                {/* CONTACT & SOCIAL */}
                {activeTab === "contact" && (
                  <div className="glass-card tab-panel">
                    <div className="ch">
                      <div className="ct"><div className="ctbar" />Contact & Social</div>
                      <div className="panel-badge">Editable</div>
                    </div>
                    <div className="editor-section-title">📬 Contact Details</div>
                    <div className="editor-grid-2">
                      <div className="editor-field">
                        <label className="editor-lbl">Phone Number</label>
                        <input className="editor-input" value={editDraft.phone} onChange={e => handleFieldChange("phone", e.target.value)} />
                      </div>
                      <div className="editor-field">
                        <label className="editor-lbl">University Email</label>
                        <div className="editor-readonly-input">{student.email} <span className="lock-badge">🔐</span></div>
                      </div>
                    </div>
                    <div className="editor-section-title" style={{ marginTop: 22 }}>🌐 Social / Professional</div>
                    <div className="editor-grid-2">
                      <div className="editor-field">
                        <label className="editor-lbl">LinkedIn</label>
                        <div className="editor-input-prefixed">
                          <span className="input-prefix">🔗</span>
                          <input className="editor-input-inner" value={editDraft.linkedin} onChange={e => handleFieldChange("linkedin", e.target.value)} placeholder="linkedin.com/in/yourname" />
                        </div>
                      </div>
                      <div className="editor-field">
                        <label className="editor-lbl">GitHub</label>
                        <div className="editor-input-prefixed">
                          <span className="input-prefix">⌨</span>
                          <input className="editor-input-inner" value={editDraft.github} onChange={e => handleFieldChange("github", e.target.value)} placeholder="github.com/yourname" />
                        </div>
                      </div>
                    </div>
                    <div className="panel-save-row">
                      <button className="btn-discard" onClick={handleDiscard} disabled={!editDirty}>Discard</button>
                      <button className="btn-save-panel" onClick={handleSave} disabled={!editDirty}>Save Changes</button>
                    </div>
                  </div>
                )}

                {/* EMERGENCY CONTACT */}
                {activeTab === "emergency" && (
                  <div className="glass-card tab-panel">
                    <div className="ch">
                      <div className="ct"><div className="ctbar" />Emergency Contact</div>
                      <div className="panel-badge">Editable</div>
                    </div>
                    <div className="emergency-notice">
                      🚨 This information is used by the university in case of an emergency. Please keep it up to date.
                    </div>
                    <div className="editor-grid-2" style={{ marginTop: 18 }}>
                      <div className="editor-field">
                        <label className="editor-lbl">Contact Name</label>
                        <input className="editor-input" value={editDraft.emergencyName} onChange={e => handleFieldChange("emergencyName", e.target.value)} />
                      </div>
                      <div className="editor-field">
                        <label className="editor-lbl">Relation</label>
                        <select className="editor-input" value={editDraft.emergencyRelation} onChange={e => handleFieldChange("emergencyRelation", e.target.value)}>
                          {["Father","Mother","Guardian","Sibling","Spouse","Other"].map(r => <option key={r}>{r}</option>)}
                        </select>
                      </div>
                      <div className="editor-field">
                        <label className="editor-lbl">Phone Number</label>
                        <input className="editor-input" value={editDraft.emergencyPhone} onChange={e => handleFieldChange("emergencyPhone", e.target.value)} />
                      </div>
                    </div>
                    <div className="panel-save-row">
                      <button className="btn-discard" onClick={handleDiscard} disabled={!editDirty}>Discard</button>
                      <button className="btn-save-panel" onClick={handleSave} disabled={!editDirty}>Save Changes</button>
                    </div>
                  </div>
                )}

                {/* SECURITY */}
                {activeTab === "security" && (
                  <div className="glass-card tab-panel">
                    <div className="ch">
                      <div className="ct"><div className="ctbar" />Security</div>
                    </div>
                    <div className="security-items">
                      <div className="security-item">
                        <div className="security-item-left">
                          <div className="security-icon">🔒</div>
                          <div>
                            <div className="security-title">Password</div>
                            <div className="security-sub">Last changed 3 months ago</div>
                          </div>
                        </div>
                        <button className="sec-action-btn" onClick={() => openModal("password")}>Change</button>
                      </div>
                      <div className="security-item">
                        <div className="security-item-left">
                          <div className="security-icon">📱</div>
                          <div>
                            <div className="security-title">Two-Factor Authentication</div>
                            <div className="security-sub">Extra security via SMS code</div>
                          </div>
                        </div>
                        <div className="sec-toggle-wrap">
                          <span className="sec-off-label">Off</span>
                          <div className="sec-toggle"><div className="sec-toggle-knob" /></div>
                        </div>
                      </div>
                      <div className="security-item">
                        <div className="security-item-left">
                          <div className="security-icon">💻</div>
                          <div>
                            <div className="security-title">Active Sessions</div>
                            <div className="security-sub">2 devices currently signed in</div>
                          </div>
                        </div>
                        <button className="sec-action-btn danger">Revoke All</button>
                      </div>
                    </div>
                    <div className="session-list">
                      <div className="session-list-title">Current Sessions</div>
                      {[
                        { device: "Chrome on Windows", location: "Lahore, PK", time: "Now · Current session", current: true  },
                        { device: "Safari on iPhone",  location: "Lahore, PK", time: "2 hours ago",           current: false },
                      ].map((s, i) => (
                        <div className="session-item" key={i}>
                          <div className="session-dot" style={{ background: s.current ? "#00c853" : "#40a9ff" }} />
                          <div className="session-info">
                            <div className="session-device">{s.device}</div>
                            <div className="session-meta">{s.location} · {s.time}</div>
                          </div>
                          {s.current  ? <span className="current-badge">This device</span>
                                      : <button className="sec-action-btn danger small">Revoke</button>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* NOTIFICATIONS */}
                {activeTab === "notifs" && (
                  <div className="glass-card tab-panel">
                    <div className="ch">
                      <div className="ct"><div className="ctbar" />Notification Preferences</div>
                    </div>
                    {[
                      {
                        title: "📚 Academic",
                        items: [
                          { key: "gradeRelease",    label: "Grade Released",    sub: "When a teacher publishes grades"         },
                          { key: "attendanceAlert", label: "Attendance Alert",  sub: "When attendance drops below 75%"        },
                          { key: "examSchedule",    label: "Exam Schedule",     sub: "Mid-term and final schedule updates"     },
                          { key: "resultCard",      label: "Result Card Ready", sub: "When semester result card is available" },
                        ],
                      },
                      {
                        title: "🏛️ University",
                        items: [
                          { key: "noticeBoard", label: "Notice Board",  sub: "New announcements from administration" },
                          { key: "feeReminder", label: "Fee Reminders", sub: "Payment due date alerts"               },
                        ],
                      },
                      {
                        title: "📡 Delivery Channels",
                        items: [
                          { key: "emailDigest", label: "Email Digest", sub: "Daily summary to your university email" },
                          { key: "smsAlerts",   label: "SMS Alerts",   sub: "Critical alerts via SMS to your number" },
                        ],
                      },
                    ].map(({ title, items }) => (
                      <div key={title}>
                        <div className="notif-section-title" style={{ marginTop: title.includes("Academic") ? 0 : 22 }}>{title}</div>
                        <div className="toggle-list">
                          {items.map(({ key, label, sub }) => (
                            <div className="toggle-row" key={key}>
                              <div className="toggle-row-left">
                                <div className="toggle-label">{label}</div>
                                <div className="toggle-sub">{sub}</div>
                              </div>
                              <div className={`prf-toggle${notifs[key] ? " on" : ""}`} onClick={() => toggleNotif(key)}>
                                <div className="prf-toggle-knob" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* PRIVACY */}
                {activeTab === "privacy" && (
                  <div className="glass-card tab-panel">
                    <div className="ch">
                      <div className="ct"><div className="ctbar" />Privacy Settings</div>
                    </div>
                    <div className="privacy-notice">
                      🛡️ Control what information is visible to other students and faculty on the university directory.
                    </div>
                    <div className="toggle-list" style={{ marginTop: 18 }}>
                      {[
                        { key: "showEmail",    label: "Show Email Address",    sub: "Visible on student directory"   },
                        { key: "showPhone",    label: "Show Phone Number",     sub: "Visible on student directory"   },
                        { key: "showLinkedIn", label: "Show LinkedIn Profile", sub: "Visible on your public profile" },
                        { key: "showGithub",   label: "Show GitHub Profile",   sub: "Visible on your public profile" },
                      ].map(({ key, label, sub }) => (
                        <div className="toggle-row" key={key}>
                          <div className="toggle-row-left">
                            <div className="toggle-label">{label}</div>
                            <div className="toggle-sub">{sub}</div>
                          </div>
                          <div className={`prf-toggle${privacy[key] ? " on" : ""}`} onClick={() => togglePrivacy(key)}>
                            <div className="prf-toggle-knob" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="privacy-data-section">
                      <div className="privacy-data-title">📁 Data & Account</div>
                      <div className="privacy-data-list">
                        <div className="privacy-data-row">
                          <div>
                            <div className="privacy-data-lbl">Download My Data</div>
                            <div className="privacy-data-sub">Get a copy of your academic records and profile data</div>
                          </div>
                          <button className="sec-action-btn">Request</button>
                        </div>
                        <div className="privacy-data-row">
                          <div>
                            <div className="privacy-data-lbl">Data Retention Policy</div>
                            <div className="privacy-data-sub">How FAST-NUCES stores and uses your data</div>
                          </div>
                          <button className="sec-action-btn">View Policy</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ENROLLMENT */}
                {activeTab === "enrollment" && (
                  <div className="glass-card tab-panel">
                    <div className="ch">
                      <div className="ct"><div className="ctbar" />Enrollment Management</div>
                    </div>
                    <div className="enrollment-status-card">
                      <div className="enroll-status-row">
                        <div className="enroll-icon">🎓</div>
                        <div>
                          <div className="enroll-status-title">Enrollment Status</div>
                          <div className="enroll-status-val active-status">● Active — Spring 2025</div>
                        </div>
                        <div className="enroll-meta-col">
                          <div className="enroll-meta-item"><span>Program</span><strong>{student.program}</strong></div>
                          <div className="enroll-meta-item"><span>Semester</span><strong>{student.semester}</strong></div>
                          <div className="enroll-meta-item"><span>Section</span><strong>{student.section}</strong></div>
                        </div>
                      </div>
                    </div>
                    <div className="enrollment-actions-title">Administrative Requests</div>
                    <div className="enrollment-action-list">
                      {[
                        { icon:"🏛️", title:"Campus Transfer",    sub:"Request a transfer to another NUCES campus",           color:"#ff9800", action:()=>openModal("transfer"), danger:false },
                        { icon:"🧊", title:"Freeze Semester",     sub:"Temporarily suspend your current enrollment",          color:"#00bcd4", action:()=>openModal("freeze"),   danger:false },
                        { icon:"📄", title:"Section Change",      sub:"Request a section reassignment within your program",   color:"#7c4dff", action:()=>{},                   danger:false },
                        { icon:"📋", title:"Program Withdrawal",  sub:"Initiate a formal withdrawal from the program",        color:"#e91e63", action:()=>{},                   danger:true  },
                      ].map(({ icon, title, sub, color, action, danger }) => (
                        <div className="enrollment-action-item" key={title} onClick={action}>
                          <div className="enroll-action-icon" style={{ "--eac": color }}>{icon}</div>
                          <div className="enroll-action-info">
                            <div className="enroll-action-title">{title}</div>
                            <div className="enroll-action-sub">{sub}</div>
                          </div>
                          <div className={`enroll-action-arrow${danger ? " danger-arrow" : ""}`}>›</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>{/* end prf-tab-content */}
            </div>{/* end prf-editor-layout */}

          </div>{/* end scroll */}
        </div>{/* end main */}
      </div>{/* end app */}
    </>
  );
}