import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { gsap } from "gsap";
import "./StudentProfile.css";

// ── STUDENT DATA ──────────────────────────────────────────────────────────────
const initialStudentData = {
  name: "Areeb Bucha",
  initials: "AB",
  rollNo: "21K-3210",
  status: "Active",
  program: "BS Computer Science",
  batch: "Fall 2021",
  section: "Section A",
  semester: "7th Semester",
  campus: "Lahore",
  email: "21k-3210@lhr.nu.edu.pk",
  phone: "+92-300-1234567",
  cnic: "35202-1234567-1",
  cgpa: 3.62,
  creditsDone: 86,
  creditsTotal: 136,
  activeCourses: 5,
  avgAttendance: 78,
};

// ── MODALS ────────────────────────────────────────────────────────────────────

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
                <div className="id-row"><span className="id-lbl">Email</span><span className="id-val mono" style={{fontSize:10}}>{student.email}</span></div>
              </div>
            </div>
          </div>
          <div className="id-card-footer">
            <div className="id-barcode">
              {Array.from({length: 28}).map((_, i) => (
                <div key={i} className="id-bar" style={{height: `${12 + Math.sin(i * 1.7) * 8}px`, opacity: 0.7 + Math.random() * 0.3}} />
              ))}
            </div>
            <div className="id-validity">Valid: {student.batch} — {student.semester}</div>
            <div className="id-chip">
              <div className="id-chip-inner" />
            </div>
          </div>
          <div className="id-card-shine" />
          <div className="id-card-bg-pattern" />
        </div>
      </div>
    </div>
  );
}

function EditInfoModal({ student, onSave, onClose }) {
  const [draft, setDraft] = useState({ ...student });
  const fields = [
    { key: "name",    label: "Full Name",    icon: "👤" },
    { key: "phone",   label: "Phone",        icon: "📞" },
    { key: "email",   label: "Email",        icon: "✉️" },
    { key: "cnic",    label: "CNIC",         icon: "🪪" },
    { key: "section", label: "Section",      icon: "🏛️" },
  ];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box edit-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-header">
          <div className="modal-icon">✏️</div>
          <div>
            <div className="modal-title">Edit Profile</div>
            <div className="modal-sub">Update your personal information</div>
          </div>
        </div>
        <div className="edit-fields">
          {fields.map(({ key, label, icon }) => (
            <div className="edit-field" key={key}>
              <label className="edit-lbl"><span>{icon}</span> {label}</label>
              <input
                className="edit-input"
                value={draft[key] || ""}
                onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={() => { onSave(draft); onClose(); }}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function CampusTransferModal({ onClose }) {
  const campuses = ["Lahore", "Karachi", "Islamabad", "Peshawar", "Chiniot-Faisalabad"];
  const [selected, setSelected] = useState("");
  const [reason, setReason] = useState("");
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
      <div className="modal-box edit-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-header">
          <div className="modal-icon">🏛️</div>
          <div>
            <div className="modal-title">Campus Transfer</div>
            <div className="modal-sub">Request a transfer to another campus</div>
          </div>
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
                <div
                  key={c}
                  className={`campus-chip${selected === c ? " selected" : ""}`}
                  onClick={() => setSelected(c)}
                >{c}</div>
              ))}
            </div>
          </div>
          <div className="edit-field">
            <label className="edit-lbl">Reason for Transfer</label>
            <textarea
              className="edit-input edit-textarea"
              placeholder="Briefly describe your reason..."
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>
          <div className="modal-notice">⚠️ Transfer requests are processed once per semester. Ensure your current semester dues are cleared before applying.</div>
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button
            className="btn-save"
            onClick={() => selected && reason && setSubmitted(true)}
            style={{ opacity: selected && reason ? 1 : 0.4, cursor: selected && reason ? "pointer" : "not-allowed" }}
          >Submit Request</button>
        </div>
      </div>
    </div>
  );
}

function BookCourtModal({ onClose }) {
  const courts = [
    { id: 1, name: "Basketball Court A", icon: "🏀", slots: ["08:00", "09:00", "11:00", "14:00", "16:00"] },
    { id: 2, name: "Tennis Court 1",     icon: "🎾", slots: ["07:00", "10:00", "12:00", "15:00", "17:00"] },
    { id: 3, name: "Badminton Hall",     icon: "🏸", slots: ["08:00", "09:00", "13:00", "15:00", "18:00"] },
    { id: 4, name: "Football Ground",   icon: "⚽", slots: ["07:00", "12:00", "16:00", "17:00"] },
  ];
  const [court, setCourt] = useState(null);
  const [slot, setSlot] = useState("");
  const [date, setDate] = useState("");
  const [submitted, setSubmitted] = useState(false);
  if (submitted) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box confirm-box" onClick={e => e.stopPropagation()}>
        <div className="confirm-icon">🏆</div>
        <div className="confirm-title">Court Booked!</div>
        <div className="confirm-sub"><strong>{court?.name}</strong> booked for {date} at {slot}. A confirmation has been sent to your university email.</div>
        <button className="btn-save" onClick={onClose}>Done</button>
      </div>
    </div>
  );
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box edit-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-header">
          <div className="modal-icon">🏟️</div>
          <div>
            <div className="modal-title">Book a Court</div>
            <div className="modal-sub">Reserve sports facilities on campus</div>
          </div>
        </div>
        <div className="edit-fields">
          <div className="edit-field">
            <label className="edit-lbl">Select Facility</label>
            <div className="court-grid">
              {courts.map(c => (
                <div
                  key={c.id}
                  className={`court-card${court?.id === c.id ? " selected" : ""}`}
                  onClick={() => { setCourt(c); setSlot(""); }}
                >
                  <div className="court-icon">{c.icon}</div>
                  <div className="court-name">{c.name}</div>
                </div>
              ))}
            </div>
          </div>
          {court && <>
            <div className="edit-field">
              <label className="edit-lbl">Date</label>
              <input type="date" className="edit-input" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="edit-field">
              <label className="edit-lbl">Available Slots</label>
              <div className="slot-grid">
                {court.slots.map(s => (
                  <div key={s} className={`slot-chip${slot === s ? " selected" : ""}`} onClick={() => setSlot(s)}>{s}</div>
                ))}
              </div>
            </div>
          </>}
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button
            className="btn-save"
            onClick={() => court && slot && date && setSubmitted(true)}
            style={{ opacity: court && slot && date ? 1 : 0.4, cursor: court && slot && date ? "pointer" : "not-allowed" }}
          >Confirm Booking</button>
        </div>
      </div>
    </div>
  );
}

function BookRoomModal({ onClose }) {
  const rooms = [
    { id: 1, name: "Study Room 101", icon: "📚", capacity: 6, floor: "Ground" },
    { id: 2, name: "Study Room 204", icon: "📚", capacity: 4, floor: "2nd" },
    { id: 3, name: "Discussion Pod A", icon: "💬", capacity: 8, floor: "Ground" },
    { id: 4, name: "Discussion Pod B", icon: "💬", capacity: 8, floor: "1st" },
    { id: 5, name: "Computer Lab 3", icon: "💻", capacity: 20, floor: "1st" },
    { id: 6, name: "Seminar Hall",    icon: "🎓", capacity: 40, floor: "3rd" },
  ];
  const [room, setRoom] = useState(null);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const slots = ["08:00 – 09:00", "09:00 – 10:00", "11:00 – 12:00", "13:00 – 14:00", "14:00 – 15:00", "16:00 – 17:00"];
  if (submitted) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box confirm-box" onClick={e => e.stopPropagation()}>
        <div className="confirm-icon">🗝️</div>
        <div className="confirm-title">Room Reserved!</div>
        <div className="confirm-sub"><strong>{room?.name}</strong> on {room?.floor} Floor reserved for {date}, {slot}. Check your email for the access code.</div>
        <button className="btn-save" onClick={onClose}>Done</button>
      </div>
    </div>
  );
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box edit-box wide-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-header">
          <div className="modal-icon">🏫</div>
          <div>
            <div className="modal-title">Book a Room</div>
            <div className="modal-sub">Reserve study rooms and facilities</div>
          </div>
        </div>
        <div className="edit-fields">
          <div className="edit-field">
            <label className="edit-lbl">Select Room</label>
            <div className="room-grid">
              {rooms.map(r => (
                <div key={r.id} className={`room-card${room?.id === r.id ? " selected" : ""}`} onClick={() => setRoom(r)}>
                  <div className="room-icon">{r.icon}</div>
                  <div className="room-name">{r.name}</div>
                  <div className="room-meta">{r.floor} Floor · Cap. {r.capacity}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="edit-row-2">
            <div className="edit-field">
              <label className="edit-lbl">Date</label>
              <input type="date" className="edit-input" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="edit-field">
              <label className="edit-lbl">Time Slot</label>
              <select className="edit-input" value={slot} onChange={e => setSlot(e.target.value)}>
                <option value="">Select slot…</option>
                {slots.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button
            className="btn-save"
            onClick={() => room && date && slot && setSubmitted(true)}
            style={{ opacity: room && date && slot ? 1 : 0.4, cursor: room && date && slot ? "pointer" : "not-allowed" }}
          >Reserve Room</button>
        </div>
      </div>
    </div>
  );
}

function FreezeSemesterModal({ onClose }) {
  const [reason, setReason] = useState("");
  const [agreed, setAgreed] = useState(false);
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
      <div className="modal-box edit-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-header">
          <div className="modal-icon">🧊</div>
          <div>
            <div className="modal-title">Freeze Semester</div>
            <div className="modal-sub">Temporarily suspend current enrollment</div>
          </div>
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
          <button
            className="btn-save danger-btn"
            onClick={() => reason && agreed && setSubmitted(true)}
            style={{ opacity: reason && agreed ? 1 : 0.4, cursor: reason && agreed ? "pointer" : "not-allowed" }}
          >Submit Freeze Request</button>
        </div>
      </div>
    </div>
  );
}

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

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────────
export default function StudentProfile() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const webglRef   = useRef(null);
  const introCanvasRef = useRef(null);
  const introRef   = useRef(null);
  const appRef     = useRef(null);
  const sidebarRef = useRef(null);
  const [collapse, setCollapse] = useState(false);

  const [student, setStudent] = useState(initialStudentData);
  const [saveFlash, setSaveFlash] = useState(false);

  // modal state
  const [modal, setModal] = useState(null); // "id" | "edit" | "transfer" | "court" | "room" | "freeze" | "logout"

  const openModal  = (name) => setModal(name);
  const closeModal = () => setModal(null);

  const handleSaveInfo = (updated) => {
    setStudent(updated);
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 2000);
  };

  // quick actions config
  const quickActions = [
    { id: "id",       icon: "🪪", label: "Digital ID",        sub: "View your student card",       color: "#1a78ff" },
    { id: "edit",     icon: "✏️", label: "Edit Info",         sub: "Update personal details",      color: "#40a9ff" },
    { id: "court",    icon: "🏟️", label: "Book Court",        sub: "Sports facility booking",      color: "#00c853" },
    { id: "room",     icon: "🏫", label: "Book Room",         sub: "Study rooms & labs",           color: "#7c4dff" },
    { id: "transfer", icon: "🏛️", label: "Campus Transfer",   sub: "Request campus change",        color: "#ff9800" },
    { id: "freeze",   icon: "🧊", label: "Freeze Semester",   sub: "Suspend enrollment",           color: "#00bcd4" },
  ];

  // ── INTRO ──
  useEffect(() => {
    const hasPlayed = sessionStorage.getItem("archIntroPlayed");
    if (hasPlayed) {
      introRef.current.style.display = "none";
      appRef.current.style.opacity = 1;
      sidebarRef.current.style.transform = "translateX(0)";
      document.querySelectorAll(".glass-card").forEach((el, i) => {
        gsap.to(el, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.4)", delay: i * 0.08 });
      });
      return;
    }
    const canvas = introCanvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const words = ["KNOWLEDGE","GRADES","CAMPUS","LECTURE","SEMESTER","THESIS","RESEARCH","LIBRARY","STUDENT","FACULTY","EXAM","DEGREE","ALUMNI","SCIENCE","ENGINEERING","FAST","NUCES","PORTAL"];
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      word: words[Math.floor(Math.random() * words.length)],
      opacity: Math.random() * 0.4 + 0.05, speed: Math.random() * 0.8 + 0.2,
      size: Math.floor(Math.random() * 10) + 10, flicker: Math.random() * 0.025 + 0.005,
      hue: Math.random() > 0.6 ? "255,255,255" : Math.random() > 0.5 ? "100,180,255" : "60,140,255",
    }));
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.5, opacity: Math.random() * 0.6 + 0.1, twinkle: Math.random() * 0.02,
    }));
    let animId;
    const draw = () => {
      ctx.fillStyle = "rgba(0,4,14,0.18)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => { s.opacity += s.twinkle * (Math.random() > 0.5 ? 1 : -1); s.opacity = Math.max(0.05, Math.min(0.8, s.opacity)); ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(180,210,255,${s.opacity})`; ctx.fill(); });
      particles.forEach(p => { p.y -= p.speed * 0.4; p.opacity += p.flicker * (Math.random() > 0.5 ? 1 : -1); p.opacity = Math.max(0.03, Math.min(0.55, p.opacity)); if (p.y < -30) { p.y = canvas.height + 20; p.x = Math.random() * canvas.width; p.word = words[Math.floor(Math.random() * words.length)]; } ctx.font = `${p.size}px 'Inter', sans-serif`; ctx.fillStyle = `rgba(${p.hue},${p.opacity})`; ctx.fillText(p.word, p.x, p.y); });
      animId = requestAnimationFrame(draw);
    };
    ctx.fillStyle = "#00040e"; ctx.fillRect(0, 0, canvas.width, canvas.height); draw();
    const afterIntro = () => {
      cancelAnimationFrame(animId); sessionStorage.setItem("archIntroPlayed", "true");
      gsap.set(introRef.current, { display: "none" });
      gsap.to(appRef.current, { opacity: 1, duration: 0.6 });
      gsap.to(sidebarRef.current, { x: 0, duration: 1.2, ease: "expo.out", delay: 0.05 });
      document.querySelectorAll(".glass-card").forEach((el, i) => { gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: "back.out(1.4)", delay: 0.8 + i * 0.1 }); });
    };
    const tl = gsap.timeline({ delay: 0.4, onComplete: afterIntro });
    tl.to("#prf-intro-line", { scaleX: 1, duration: 0.8, ease: "power3.out" }, 0)
      .to("#prf-intro-logo", { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }, 0.5)
      .to("#prf-intro-sub",  { opacity: 1, y: 0, duration: 0.5 }, 1.1)
      .to("#prf-intro-logo", { scale: 50, opacity: 0, duration: 0.7, ease: "power4.in" }, 2.4)
      .to("#prf-intro-sub",  { opacity: 0, duration: 0.3 }, 2.4)
      .to("#prf-intro-line", { opacity: 0, duration: 0.3 }, 2.4)
      .to("#prf-intro-flash",{ opacity: 1, duration: 0.08 }, 2.85)
      .to("#prf-intro-flash",{ opacity: 0, duration: 0.4 }, 2.93)
      .to(introRef.current,  { opacity: 0, duration: 0.35 }, 2.88);
    return () => cancelAnimationFrame(animId);
  }, []);

  // ── THREE.JS BG ──
  useEffect(() => {
    const canvas = webglRef.current;
    let W = window.innerWidth, H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); renderer.setClearColor(0xf4f8ff, 1);
    const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0xe9f2ff, 0.014);
    const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 200); camera.position.set(0, 2, 10);
    scene.add(new THREE.AmbientLight(0x0033aa, 0.8));
    const dirLight = new THREE.DirectionalLight(0x4488ff, 1.2); dirLight.position.set(5, 10, 5); scene.add(dirLight);
    const pointLight = new THREE.PointLight(0x0066ff, 2, 30); pointLight.position.set(0, 5, 0); scene.add(pointLight);
    const objects = [];
    const mkBook = (x, y, z, scale, color) => {
      const g = new THREE.Group();
      const pageMat = new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.18, shininess: 80, specular: 0x4488ff });
      const p1 = new THREE.Mesh(new THREE.BoxGeometry(1.2*scale,0.05*scale,0.9*scale), pageMat); p1.rotation.z = 0.3;
      const p2 = new THREE.Mesh(new THREE.BoxGeometry(1.2*scale,0.05*scale,0.9*scale), pageMat); p2.rotation.z = -0.3;
      g.add(p1); g.add(p2);
      const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.04*scale,0.04*scale,0.9*scale,8), new THREE.MeshPhongMaterial({ color: 0x88bbff, transparent: true, opacity: 0.4 }));
      spine.rotation.x = Math.PI / 2; g.add(spine); g.position.set(x, y, z); scene.add(g);
      objects.push({ mesh: g, speed: Math.random()*0.004+0.002, phase: Math.random()*Math.PI*2, rotSpeed: (Math.random()-0.5)*0.008 });
    };
    mkBook(-6, 3, -5, 1.8, 0x1155cc); mkBook(6, 1, -6, 2.2, 0x0066ff); mkBook(-3, -2, -4, 1.4, 0x2266dd); mkBook(4, 4, -8, 2.8, 0x0044aa);
    const COUNT = 200; const ptPos = new Float32Array(COUNT*3); const ptCol = new Float32Array(COUNT*3); const ptVel = [];
    for (let i = 0; i < COUNT; i++) {
      ptPos[i*3]=(Math.random()-0.5)*30; ptPos[i*3+1]=(Math.random()-0.5)*20; ptPos[i*3+2]=(Math.random()-0.5)*15-5;
      ptVel.push({ x:(Math.random()-0.5)*0.004, y:(Math.random()-0.5)*0.004 });
      const w = Math.random()>0.5; ptCol[i*3]=w?0.8:0.1; ptCol[i*3+1]=w?0.9:0.5; ptCol[i*3+2]=1.0;
    }
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute("position", new THREE.BufferAttribute(ptPos,3)); ptGeo.setAttribute("color", new THREE.BufferAttribute(ptCol,3));
    scene.add(new THREE.Points(ptGeo, new THREE.PointsMaterial({ size:0.06, transparent:true, opacity:0.7, vertexColors:true })));
    const grid = new THREE.GridHelper(60, 40, 0x001133, 0x001133); grid.position.y=-6; grid.material.transparent=true; grid.material.opacity=0.4; scene.add(grid);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(50,24,24), new THREE.MeshBasicMaterial({ color:0x000820, transparent:true, opacity:0.6, side:THREE.BackSide, wireframe:true })); scene.add(dome);
    let nmx=0, nmy=0; const onMove=(e)=>{nmx=(e.clientX/W)*2-1; nmy=-(e.clientY/H)*2+1;}; document.addEventListener("mousemove",onMove);
    let t=0, animId;
    const loop=()=>{ animId=requestAnimationFrame(loop); t+=0.008; objects.forEach(o=>{o.mesh.position.y+=Math.sin(t*o.speed*10+o.phase)*0.004; o.mesh.rotation.y+=o.rotSpeed;}); const p=ptGeo.attributes.position.array; for(let i=0;i<COUNT;i++){p[i*3]+=ptVel[i].x+nmx*0.0006; p[i*3+1]+=ptVel[i].y+nmy*0.0006; if(p[i*3]>15)p[i*3]=-15; if(p[i*3]<-15)p[i*3]=15; if(p[i*3+1]>10)p[i*3+1]=-10; if(p[i*3+1]<-10)p[i*3+1]=10;} ptGeo.attributes.position.needsUpdate=true; pointLight.position.x=Math.sin(t*0.5)*8; pointLight.position.z=Math.cos(t*0.3)*6; dome.rotation.y+=0.0003; camera.position.x+=(nmx*0.6-camera.position.x)*0.015; camera.position.y+=(nmy*0.4+2-camera.position.y)*0.015; camera.lookAt(0,0,0); renderer.render(scene,camera); };
    loop();
    const onResize=()=>{W=window.innerWidth;H=window.innerHeight;renderer.setSize(W,H);camera.aspect=W/H;camera.updateProjectionMatrix();};
    window.addEventListener("resize",onResize);
    return()=>{cancelAnimationFrame(animId);document.removeEventListener("mousemove",onMove);window.removeEventListener("resize",onResize);};
  }, []);

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
      {modal === "edit"     && <EditInfoModal student={student} onSave={handleSaveInfo} onClose={closeModal} />}
      {modal === "transfer" && <CampusTransferModal onClose={closeModal} />}
      {modal === "court"    && <BookCourtModal onClose={closeModal} />}
      {modal === "room"     && <BookRoomModal onClose={closeModal} />}
      {modal === "freeze"   && <FreezeSemesterModal onClose={closeModal} />}
      {modal === "logout"   && <LogoutModal onClose={closeModal} onLogout={() => { sessionStorage.clear(); navigate("/login"); }} />}

      {/* APP */}
      <div id="app" ref={appRef}>
        <nav id="sidebar" ref={sidebarRef} className={collapse ? "collapse" : ""}>
          <div className="sb-top-bar" />
          <button className="sb-toggle" onClick={() => setCollapse(c => !c)}>
            <span/><span/><span/>
          </button>
          <div className="sb-logo">
            <div className="logo-box">A</div>
            <div><div className="logo-name">ARCH</div><div className="logo-tagline">Student Portal</div></div>
          </div>
          <div className="sb-user active-profile" onClick={() => openModal("id")} style={{ cursor: "pointer" }} title="View Digital ID">
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
                <div className={`ni${location.pathname === path ? " active" : ""}`} key={label} onClick={() => navigate(path)} style={{ cursor: "pointer" }}>
                  <div className="ni-ic">{ic}</div>{label}
                  {label === "Notices" && <span className="nbadge">3</span>}
                </div>
              ))}
            </div>
          ))}
          <div className="sb-foot">Spring 2025 · FAST-NUCES</div>
        </nav>

        <div id="main">
          <div id="topbar">
            <div className="pg-title"><span>My Profile</span></div>
            <div className="tb-r">
              <div className="sem-chip">Spring 2025</div>
              {saveFlash && <div className="save-flash">✓ Saved</div>}
              <button className="logout-btn" onClick={() => openModal("logout")}>
                <span>⏻</span> Log Out
              </button>
            </div>
          </div>

          <div id="scroll">

            {/* ── PROFILE HEADER BANNER ── */}
            <div className="glass-card prf-banner-card">
              <div className="prf-banner-bg" />
              <div className="prf-banner-content">
                <div className="prf-avatar-wrap" onClick={() => openModal("id")} title="View Digital ID" style={{ cursor: "pointer" }}>
                  <div className="prf-avatar-ring" />
                  <div className="prf-avatar-inner">{student.initials}</div>
                  <div className="prf-avatar-badge">🪪</div>
                </div>
                <div className="prf-banner-info">
                  <div className="prf-name">{student.name}</div>
                  <div className="prf-roll">{student.rollNo} · {student.program}</div>
                  <div className="prf-banner-chips">
                    <span className="prf-chip active-chip">● Active</span>
                    <span className="prf-chip">{student.semester}</span>
                    <span className="prf-chip">{student.campus}</span>
                    <span className="prf-chip">{student.section}</span>
                  </div>
                </div>
                <button className="prf-edit-btn" onClick={() => openModal("edit")}>✏️ Edit Profile</button>
              </div>
            </div>

            {/* ── QUICK ACTIONS GRID ── */}
            <div className="glass-card">
              <div className="ch">
                <div className="ct"><div className="ctbar" />Quick Actions</div>
              </div>
              <div className="qa-grid">
                {quickActions.map(({ id, icon, label, sub, color }) => (
                  <div className="qa-card" key={id} onClick={() => openModal(id)} style={{ "--qa-color": color }}>
                    <div className="qa-icon-wrap">
                      <div className="qa-icon-bg" />
                      <div className="qa-icon">{icon}</div>
                    </div>
                    <div className="qa-label">{label}</div>
                    <div className="qa-sub">{sub}</div>
                    <div className="qa-arrow">→</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── PERSONAL INFO + ACADEMIC STATS ROW ── */}
            <div className="prf-2col">

              {/* Personal Details */}
              <div className="glass-card">
                <div className="ch">
                  <div className="ct"><div className="ctbar" />Personal Details</div>
                  <div className="ca" onClick={() => openModal("edit")}>Edit →</div>
                </div>
                <div className="prf-info-list">
                  {[
                    ["🎓", "Program",  student.program],
                    ["📅", "Batch",    student.batch],
                    ["📚", "Semester", student.semester],
                    ["🏛️", "Section",  student.section],
                    ["📍", "Campus",   student.campus],
                    ["✉️", "Email",    student.email],
                    ["📞", "Phone",    student.phone],
                    ["🪪", "CNIC",     student.cnic],
                  ].map(([icon, lbl, val]) => (
                    <div className="prf-info-row" key={lbl}>
                      <div className="prf-info-icon">{icon}</div>
                      <div>
                        <div className="prf-info-lbl">{lbl}</div>
                        <div className="prf-info-val">{val}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Academic Summary */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="glass-card">
                  <div className="ch">
                    <div className="ct"><div className="ctbar" />Academic Summary</div>
                  </div>
                  <div className="prf-stat-grid">
                    {[
                      { num: student.cgpa.toFixed(2), lbl: "CGPA",           color: "#1a78ff" },
                      { num: student.creditsDone,     lbl: "Credits Done",   color: "#00c853" },
                      { num: student.creditsTotal,    lbl: "Credits Total",  color: "#40a9ff" },
                      { num: `${student.avgAttendance}%`, lbl: "Avg Attendance", color: student.avgAttendance >= 75 ? "#00c853" : "#ff4d6a" },
                    ].map(({ num, lbl, color }) => (
                      <div className="prf-stat-item" key={lbl}>
                        <div className="prf-stat-num" style={{ color }}>{num}</div>
                        <div className="prf-stat-lbl">{lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Account Settings */}
                <div className="glass-card">
                  <div className="ch">
                    <div className="ct"><div className="ctbar" />Account</div>
                  </div>
                  <div className="account-list">
                    {[
                      { icon: "🪪", label: "View Digital ID Card",    action: () => openModal("id"),       accent: "#1a78ff" },
                      { icon: "✏️", label: "Edit Personal Info",      action: () => openModal("edit"),     accent: "#40a9ff" },
                      { icon: "🔒", label: "Change Password",         action: () => {},                    accent: "#7c4dff" },
                      { icon: "🔔", label: "Notification Settings",   action: () => {},                    accent: "#ff9800" },
                      { icon: "⏻",  label: "Log Out",                 action: () => openModal("logout"),   accent: "#ff4d6a", danger: true },
                    ].map(({ icon, label, action, accent, danger }) => (
                      <div
                        key={label}
                        className={`account-row${danger ? " danger-row" : ""}`}
                        onClick={action}
                        style={{ "--acc": accent }}
                      >
                        <div className="account-icon">{icon}</div>
                        <div className="account-label">{label}</div>
                        <div className="account-chevron">›</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}