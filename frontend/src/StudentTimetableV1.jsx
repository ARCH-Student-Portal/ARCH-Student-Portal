import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import * as THREE from "three";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion"; 
import "./StudentDashV1.css"; 
import "./StudentTimetableV1.css"; 

export default function StudentTimetableV1() {
  const navigate = useNavigate();
  const location = useLocation();
  const webglRef = useRef(null);
  const appRef = useRef(null);
  const sidebarRef = useRef(null);
  const [collapse, setCollapse] = useState(false);

  // --- MOCK ACADEMIC DATA ---
  const schedule = [
    { id: 1, day: "Mon", name: "Operating Systems", code: "CS-3001", type: "theory", timeStr: "08:30 AM - 11:30 AM", room: "CS-Lab 2", prof: "Dr. Ayesha", profInit: "DA", att: "88%", credits: 3 },
    { id: 4, day: "Tue", name: "Database Systems", code: "CS-2012", type: "theory", timeStr: "10:00 AM - 11:30 AM", room: "Room 101", prof: "Dr. Zafar", profInit: "DZ", att: "92%", credits: 3 },
    { id: 5, day: "Tue", name: "Database Lab", code: "CS-2012L", type: "lab", timeStr: "11:30 AM - 02:30 PM", room: "Lab 4", prof: "Engr. Bilal", profInit: "EB", att: "100%", credits: 1 },
    { id: 6, day: "Wed", name: "Probability & Stats", code: "MT-2005", type: "theory", timeStr: "11:30 AM - 02:30 PM", room: "MT-201", prof: "Dr. Kamran", profInit: "DK", att: "85%", credits: 3 },
    { id: 7, day: "Thu", name: "Web Programming", code: "CS-3005", type: "theory", timeStr: "01:00 PM - 02:30 PM", room: "Room 105", prof: "Usman Ali", profInit: "UA", att: "78%", credits: 3 },
  ];

  // --- STATE MANAGEMENT ---
  const currentDayStr = new Date().toLocaleDateString('en-US', { weekday: 'short' });
  const validDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const initialDay = validDays.includes(currentDayStr) ? currentDayStr : "Mon";
  
  // Auto-select the first class of the initial day so the panel is never empty
  const initialFiltered = schedule.filter(c => c.day === initialDay).sort((a,b) => a.timeStr.localeCompare(b.timeStr));
  
  const [activeDay, setActiveDay] = useState(initialDay);
  const [selectedClass, setSelectedClass] = useState(initialFiltered.length > 0 ? initialFiltered[0] : null);

  const filteredSchedule = schedule.filter(c => c.day === activeDay).sort((a,b) => a.timeStr.localeCompare(b.timeStr));

  // Handler for changing days: Auto-selects the first class of the newly selected day
  const handleDayChange = (day) => {
    setActiveDay(day);
    const dayClasses = schedule.filter(c => c.day === day).sort((a,b) => a.timeStr.localeCompare(b.timeStr));
    setSelectedClass(dayClasses.length > 0 ? dayClasses[0] : null);
  };

  // --- 3D BACKGROUND ---
  useEffect(() => {
    const canvas = webglRef.current;
    let W = window.innerWidth, H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H); renderer.setClearColor(0xf4f8ff, 1);
    const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 200); camera.position.set(0, 2, 10);
    scene.add(new THREE.AmbientLight(0x0033aa, 0.8));
    let nmx = 0, nmy = 0; const onMove = (e) => { nmx = (e.clientX / W) * 2 - 1; nmy = -(e.clientY / H) * 2 + 1; }; document.addEventListener("mousemove", onMove);
    let animId;
    const loop = () => {
      animId = requestAnimationFrame(loop); camera.position.x += (nmx * 0.6 - camera.position.x) * 0.015; camera.position.y += (nmy * 0.4 + 2 - camera.position.y) * 0.015; camera.lookAt(0, 0, 0); renderer.render(scene, camera);
    };
    loop(); return () => { cancelAnimationFrame(animId); document.removeEventListener("mousemove", onMove); };
  }, []);

  return (
    <>
      <div id="cur-ring" /><div id="cur-dot" /><div className="scanlines" /><div className="vignette" />
      <canvas id="webgl" ref={webglRef} />

      <div id="app" ref={appRef} style={{opacity: 1}}>
        <nav id="sidebar" ref={sidebarRef} className={collapse ? "collapse" : ""} style={{transform: 'translateX(0)'}}>
          <div className="sb-top-bar" /><button className="sb-toggle" onClick={() => setCollapse(c => !c)}><span/><span/><span/></button> 
          <div className="sb-logo"><div className="logo-box">A</div><div><div className="logo-name">ARCH</div><div className="logo-tagline">Student Portal</div></div></div>
          <div className="sb-user"><div className="uav">AB</div><div><div className="uname">Areeb Bucha</div><div className="uid">21K-3210</div></div></div>
          {[
            ["Overview", [["⊞","Dashboard","/student/dashboard"],["◎","Academic","/student/academic"]]],
            ["Courses",[["＋","Registration","/student/registration"],["◈","Transcript","/student/transcript"],["▦","Marks","/student/marks"],["✓","Attendance","/student/attendance"],["▤","Timetable","/student/timetable"]]],
            ["Communication",[["◉","Notices","/student/notices"]]],
            ["Account",[["◌","Profile","/student/profile"]]],
          ].map(([sec, items]) => (
            <div key={sec}>
              <div className="nav-sec">{sec}</div>
              {items.map(([ic, label, path]) => (
                <div className={`ni ${location.pathname === path ? " active" : ""}`} key={label} onClick={() => navigate(path)} style={{cursor: 'pointer'}}><div className="ni-ic">{ic}</div>{label}</div>
              ))}
            </div>
          ))}
        </nav>

        <div id="main">
          <div id="topbar"><div className="pg-title"><span>Weekly Timetable</span></div><div className="tb-r"><div className="sem-chip">Spring 2025</div></div></div>

          <div id="scroll">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="tt-layout">
              
              {/* MAIN LIST AREA */}
              <div className="tt-main">
                <div className="tt-header">
                  <h2 className="ct"><div className="ctbar"/>Class Schedule</h2>
                  <div className="day-navigator">
                    {validDays.map(day => (
                      <button key={day} onClick={() => handleDayChange(day)} className={`day-tab ${activeDay === day ? 'active' : ''}`}>
                        {day === currentDayStr ? `${day} (Today)` : day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="tt-body">
                  <AnimatePresence mode="wait">
                    <motion.div key={activeDay} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                      
                      {filteredSchedule.length === 0 ? (
                        <div style={{textAlign: 'center', padding: '60px', color: 'var(--dimmer)', fontWeight: 600}}>
                          No classes scheduled for {activeDay}. Enjoy the day off!
                        </div>
                      ) : (
                        filteredSchedule.map(course => (
                          <div className="timeline-row" key={course.id}>
                            
                            {/* TIME COLUMN */}
                            <div className="time-col">
                              {course.timeStr.split(" - ")[0].split(" ")[0]}
                              <span className="time-ampm">{course.timeStr.split(" - ")[0].split(" ")[1]}</span>
                            </div>

                            <div className="cards-col">
                              <div className={`class-card ${selectedClass?.id === course.id ? 'active' : ''}`} onClick={() => setSelectedClass(course)}>
                                <div className={`card-accent acc-${course.type}`} />
                                <div className="card-main">
                                  <div className="card-code">{course.code} • {course.type === 'lab' ? 'Laboratory' : 'Theory'}</div>
                                  <h3>{course.name}</h3>
                                  <div className="card-meta">
                                    <div className="meta-item">📍 {course.room}</div>
                                    <div className="meta-item">👨‍🏫 {course.prof}</div>
                                  </div>
                                </div>
                                {course.id === 5 && currentDayStr === "Tue" && <div className="indicator-now">LIVE NOW</div>}
                              </div>
                            </div>
                          </div>
                        ))
                      )}

                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* SLIDE-OUT COMMAND PANEL */}
              <AnimatePresence>
                {selectedClass && (
                  <motion.div className="side-panel" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 50, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                    <div className="sp-header">
                      <div className="sp-tag">{selectedClass.code}</div>
                      <div className="sp-title">{selectedClass.name}</div>
                    </div>

                    <div className="sp-prof-box">
                      <div className="sp-avatar">{selectedClass.profInit}</div>
                      <div>
                        <div style={{fontSize: '11px', fontWeight: 700, color: 'var(--dimmer)', textTransform: 'uppercase'}}>Course Instructor</div>
                        <div style={{fontSize: '15px', fontWeight: 800, color: 'var(--text-main)'}}>{selectedClass.prof}</div>
                      </div>
                    </div>

                    <div className="sp-data-grid">
                      <div className="sp-data-box">
                        <div className="sp-label">Location</div>
                        <div className="sp-val mono">{selectedClass.room}</div>
                      </div>
                      
                      {/* --- UPDATED TIMING BOX --- */}
                      <div className="sp-data-box">
                        <div className="sp-label">Timing</div>
                        <div className="sp-val" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '16px', letterSpacing: '-0.03em', lineHeight: '1.4' }}>
                          <div style={{ color: 'var(--text-main)' }}>{selectedClass.timeStr.split(" - ")[0]}</div>
                          <div style={{ color: 'var(--dimmer)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>TO</span> 
                            {selectedClass.timeStr.split(" - ")[1]}
                          </div>
                        </div>
                      </div>

                      <div className="sp-data-box">
                        <div className="sp-label">Credits</div>
                        <div className="sp-val">{selectedClass.credits} Hours</div>
                      </div>
                      <div className="sp-data-box">
                        <div className="sp-label">Attendance</div>
                        <div className="sp-val success">{selectedClass.att}</div>
                      </div>
                    </div>

                    <button className="btn-contact">Message Instructor</button>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}