import { useState } from "react";

// ── DATA ──────────────────────────────────────────────────────────────────────
const SECTIONS = {
  "CS-3001": {
    name: "Object Oriented Analysis & Design",
    code: "CS-3001 · Sec A",
    time: "Mon/Wed  13:00 – 14:30",
    students: [
      { id: "21K-3001", name: "Ali Khan" },
      { id: "21K-3045", name: "Sara Ahmed" },
      { id: "21K-3112", name: "Usman Tariq" },
      { id: "21K-3190", name: "Hira Malik" },
      { id: "21K-3204", name: "Zain Ul Abdin" },
      { id: "21K-3267", name: "Ayesha Noor" },
      { id: "21K-3311", name: "Hamza Sheikh" },
      { id: "21K-3398", name: "Mahnoor Fatima" },
    ],
    history: {
      "21K-3001": [{ date: "Apr 14", status: "P" }, { date: "Apr 16", status: "P" }, { date: "Apr 21", status: "P" }, { date: "Apr 23", status: "A" }],
      "21K-3045": [{ date: "Apr 14", status: "P" }, { date: "Apr 16", status: "A" }, { date: "Apr 21", status: "P" }, { date: "Apr 23", status: "P" }],
      "21K-3112": [{ date: "Apr 14", status: "A" }, { date: "Apr 16", status: "A" }, { date: "Apr 21", status: "P" }, { date: "Apr 23", status: "A" }],
      "21K-3190": [{ date: "Apr 14", status: "P" }, { date: "Apr 16", status: "P" }, { date: "Apr 21", status: "P" }, { date: "Apr 23", status: "P" }],
      "21K-3204": [{ date: "Apr 14", status: "P" }, { date: "Apr 16", status: "A" }, { date: "Apr 21", status: "A" }, { date: "Apr 23", status: "P" }],
      "21K-3267": [{ date: "Apr 14", status: "P" }, { date: "Apr 16", status: "P" }, { date: "Apr 21", status: "P" }, { date: "Apr 23", status: "P" }],
      "21K-3311": [{ date: "Apr 14", status: "A" }, { date: "Apr 16", status: "P" }, { date: "Apr 21", status: "A" }, { date: "Apr 23", status: "A" }],
      "21K-3398": [{ date: "Apr 14", status: "P" }, { date: "Apr 16", status: "P" }, { date: "Apr 21", status: "P" }, { date: "Apr 23", status: "P" }],
    },
  },
  "CS-2010": {
    name: "Data Structures & Algorithms",
    code: "CS-2010 · Sec B",
    time: "Tue/Thu  08:00 – 09:30",
    students: [
      { id: "22K-4011", name: "Bilal Hasan" },
      { id: "22K-4099", name: "Maha Syed" },
      { id: "22K-4150", name: "Omer Farooq" },
      { id: "22K-4212", name: "Laraib Qureshi" },
      { id: "22K-4305", name: "Ahmed Raza" },
      { id: "22K-4388", name: "Nimra Iqbal" },
    ],
    history: {
      "22K-4011": [{ date: "Apr 15", status: "P" }, { date: "Apr 17", status: "P" }, { date: "Apr 22", status: "A" }, { date: "Apr 24", status: "P" }],
      "22K-4099": [{ date: "Apr 15", status: "P" }, { date: "Apr 17", status: "P" }, { date: "Apr 22", status: "P" }, { date: "Apr 24", status: "P" }],
      "22K-4150": [{ date: "Apr 15", status: "A" }, { date: "Apr 17", status: "A" }, { date: "Apr 22", status: "P" }, { date: "Apr 24", status: "A" }],
      "22K-4212": [{ date: "Apr 15", status: "P" }, { date: "Apr 17", status: "P" }, { date: "Apr 22", status: "P" }, { date: "Apr 24", status: "P" }],
      "22K-4305": [{ date: "Apr 15", status: "P" }, { date: "Apr 17", status: "A" }, { date: "Apr 22", status: "A" }, { date: "Apr 24", status: "P" }],
      "22K-4388": [{ date: "Apr 15", status: "P" }, { date: "Apr 17", status: "P" }, { date: "Apr 22", status: "P" }, { date: "Apr 24", status: "A" }],
    },
  },
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
const today = new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
function initAttendance(students) { return Object.fromEntries(students.map((s) => [s.id, "P"])); }
function getColor(pct) { if (pct >= 75) return "green"; if (pct >= 60) return "amber"; return "red"; }
function calcPct(history, todayRecord) {
  const all = [...history, todayRecord];
  const present = all.filter((r) => r.status === "P").length;
  return all.length === 0 ? 0 : Math.round((present / all.length) * 100);
}
function initials(name) { return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(); }

const COLOR_MAP = {
  green: { text: "#00c853", bg: "rgba(0,200,83,.08)", border: "rgba(0,200,83,.25)", shadow: "rgba(0,200,83,0.3)" },
  amber: { text: "#ff9100", bg: "rgba(255,145,0,.08)", border: "rgba(255,145,0,.25)", shadow: "rgba(255,145,0,0.3)" },
  red:   { text: "#ff4d6a", bg: "rgba(255,77,106,.08)", border: "rgba(255,77,106,.25)", shadow: "rgba(255,77,106,0.3)" },
};

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function TeacherAttendance() {
  const [activeTab, setActiveTab] = useState("CS-3001");
  const [attendance, setAttendance] = useState(() => initAttendance(SECTIONS["CS-3001"].students));
  const [selected, setSelected] = useState(SECTIONS["CS-3001"].students[0].id);
  const [unsaved, setUnsaved] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const section = SECTIONS[activeTab];
  const history = section.history;

  const switchTab = (key) => {
    setActiveTab(key);
    setAttendance(initAttendance(SECTIONS[key].students));
    setSelected(SECTIONS[key].students[0].id);
    setUnsaved(false);
  };

  const toggle = (id, val) => {
    setAttendance((prev) => ({ ...prev, [id]: val }));
    setUnsaved(true);
  };

  const save = () => {
    setUnsaved(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2600);
  };

  const presentCount = Object.values(attendance).filter((v) => v === "P").length;
  const absentCount  = section.students.length - presentCount;

  const selStudent = section.students.find((s) => s.id === selected) || section.students[0];
  const selHistory = history[selStudent.id] || [];
  const todayEntry = { date: "Today", status: attendance[selStudent.id] || "P" };
  const selPct     = calcPct(selHistory, todayEntry);
  const selColor   = getColor(selPct);
  const C          = COLOR_MAP[selColor];

  const allEntries = [...selHistory, todayEntry];
  const pPresent   = allEntries.filter(r => r.status === "P").length;
  const pAbsent    = allEntries.filter(r => r.status === "A").length;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#f0f5ff", minHeight: "100vh", padding: "0" }}>

      {/* ── TOPBAR ── */}
      <div style={{
        background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(18,78,170,.1)",
        padding: "0 40px", height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 2px 20px rgba(0,0,0,.06)"
      }}>
        <div style={{ fontSize: "22px", fontWeight: 900, color: "#1a4eaa", letterSpacing: "-0.02em" }}>
          Mark Attendance
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {unsaved && (
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "6px 14px", background: "rgba(255,145,0,.1)",
              border: "2px solid rgba(255,145,0,.3)", borderRadius: "10px",
              fontSize: "13px", fontWeight: 900, color: "#ff9100", letterSpacing: "0.05em"
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff9100", display: "inline-block" }} />
              UNSAVED
            </div>
          )}
          <div style={{
            padding: "8px 18px", borderRadius: "20px",
            background: "rgba(26,78,170,.08)", border: "1px solid rgba(26,78,170,.15)",
            fontSize: "13px", fontWeight: 800, color: "#1a4eaa", letterSpacing: "0.05em"
          }}>Spring 2025</div>
          <div style={{ fontSize: "22px", cursor: "pointer" }}>🔔</div>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "460px 1fr", gap: "32px",
        padding: "32px 40px", maxWidth: "1400px", margin: "0 auto",
        alignItems: "start"
      }}>

        {/* ── LEFT PANEL ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Section info card */}
          <div style={{
            background: "rgba(255,255,255,.95)", borderRadius: "20px",
            border: "1px solid rgba(18,78,170,.15)", boxShadow: "0 8px 32px rgba(0,0,0,.08)",
            overflow: "hidden"
          }}>
            {/* Tabs */}
            <div style={{ padding: "20px 24px 0", display: "flex", gap: "8px" }}>
              {Object.keys(SECTIONS).map((k) => (
                <button key={k} onClick={() => switchTab(k)} style={{
                  padding: "8px 18px", borderRadius: "10px", border: "none",
                  fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 800,
                  cursor: "pointer", transition: "all 0.2s", letterSpacing: "0.02em",
                  background: activeTab === k ? "linear-gradient(135deg, #1a78ff, #0050cc)" : "rgba(18,78,170,.07)",
                  color: activeTab === k ? "#fff" : "#6b7fa8",
                  boxShadow: activeTab === k ? "0 4px 14px rgba(26,120,255,.35)" : "none",
                }}>
                  {k}
                </button>
              ))}
            </div>

            {/* Date row */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "16px 24px", borderBottom: "1px solid rgba(18,78,170,.08)", marginTop: "16px"
            }}>
              <span style={{ fontSize: "12px", fontWeight: 800, color: "#8a9bc0", letterSpacing: "0.1em", textTransform: "uppercase" }}>Session Date</span>
              <span style={{ fontSize: "16px", fontWeight: 900, color: "#1a2a4a" }}>{today}</span>
            </div>

            {/* Section code row */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 24px 20px"
            }}>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#8a9bc0", letterSpacing: "0.05em" }}>{section.code}</span>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#8a9bc0" }}>{section.time}</span>
            </div>
          </div>

          {/* Roster */}
          <div style={{
            background: "rgba(255,255,255,.95)", borderRadius: "20px",
            border: "1px solid rgba(18,78,170,.15)", boxShadow: "0 8px 32px rgba(0,0,0,.08)",
            overflow: "hidden"
          }}>
            <div style={{ padding: "8px 8px", maxHeight: "calc(100vh - 420px)", overflowY: "auto" }}>
              {section.students.map((s) => {
                const status = attendance[s.id];
                const isSelected = selected === s.id;
                return (
                  <div key={s.id} onClick={() => setSelected(s.id)} style={{
                    display: "flex", alignItems: "center", gap: "14px",
                    padding: "14px 16px", borderRadius: "14px",
                    background: isSelected ? "rgba(26,120,255,.07)" : "transparent",
                    border: `1px solid ${isSelected ? "rgba(26,120,255,.2)" : "transparent"}`,
                    cursor: "pointer", transition: "all 0.15s", marginBottom: "2px"
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "10px",
                      background: "rgba(26,120,255,.1)", color: "#1a78ff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "15px", fontWeight: 900, flexShrink: 0
                    }}>{initials(s.name)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "16px", fontWeight: 800, color: "#1a2a4a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                      <div style={{ fontSize: "13px", color: "#8a9bc0", fontWeight: 700, marginTop: "2px" }}>{s.id}</div>
                    </div>
                    <div style={{ display: "flex", borderRadius: "10px", overflow: "hidden", border: "2px solid rgba(18,78,170,.12)", flexShrink: 0 }}>
                      {["P", "A"].map((v) => {
                        const isActive = status === v;
                        const bg = isActive ? (v === "P" ? "#00c853" : "#ff4d6a") : "transparent";
                        return (
                          <button key={v} onClick={(e) => { e.stopPropagation(); toggle(s.id, v); }} style={{
                            padding: "8px 16px", border: "none",
                            fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 900,
                            cursor: "pointer", transition: "all 0.15s",
                            background: bg, color: isActive ? "#fff" : "#8a9bc0",
                            boxShadow: isActive ? `0 3px 10px ${v === "P" ? "rgba(0,200,83,0.3)" : "rgba(255,77,106,0.3)"}` : "none",
                          }}>{v}</button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary footer */}
            <div style={{
              padding: "18px 24px", borderTop: "1px solid rgba(18,78,170,.08)",
              display: "flex", alignItems: "center", gap: "20px",
              background: "rgba(18,78,170,.02)"
            }}>
              {[
                { num: presentCount, lbl: "Present", color: "#00c853" },
                { num: absentCount,  lbl: "Absent",  color: "#ff4d6a" },
                { num: section.students.length, lbl: "Total", color: "#1a2a4a" },
              ].map(({ num, lbl, color }, i) => (
                <div key={lbl} style={{ display: "flex", alignItems: "center", gap: i < 2 ? "20px" : "0" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                    <div style={{ fontSize: "28px", fontWeight: 900, color, lineHeight: 1 }}>{num}</div>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "#8a9bc0", textTransform: "uppercase", letterSpacing: "0.1em" }}>{lbl}</div>
                  </div>
                  {i < 2 && <div style={{ width: 1, height: 36, background: "rgba(18,78,170,.1)" }} />}
                </div>
              ))}
              <button onClick={save} disabled={!unsaved} style={{
                marginLeft: "auto", padding: "10px 22px",
                background: unsaved ? "linear-gradient(135deg, #1a78ff, #0050cc)" : "rgba(18,78,170,.07)",
                color: unsaved ? "#fff" : "#8a9bc0",
                border: "none", borderRadius: "10px",
                fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 800,
                cursor: unsaved ? "pointer" : "not-allowed",
                boxShadow: unsaved ? "0 6px 20px rgba(26,120,255,.3)" : "none",
                transition: "all 0.2s"
              }}>✓ Save</button>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* Student detail card */}
          <div style={{
            background: "rgba(255,255,255,.95)", borderRadius: "20px",
            border: "1px solid rgba(18,78,170,.15)", boxShadow: "0 8px 32px rgba(0,0,0,.08)",
            padding: "36px"
          }}>
            {/* Header row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
              <div>
                <div style={{ fontSize: "30px", fontWeight: 900, color: "#1a2a4a", letterSpacing: "-0.02em" }}>{selStudent.name}</div>
                <div style={{ fontSize: "16px", color: "#8a9bc0", fontWeight: 700, marginTop: "6px" }}>{selStudent.id} &nbsp;|&nbsp; {section.code}</div>
              </div>
              <div style={{ fontSize: "72px", fontWeight: 900, lineHeight: 1, color: C.text, textShadow: `0 4px 16px ${C.shadow}` }}>
                {selPct}<span style={{ fontSize: "48px" }}>%</span>
              </div>
            </div>

            {/* Bar */}
            <div style={{ height: 14, borderRadius: 7, background: "#e2e8f0", position: "relative", marginBottom: "10px" }}>
              <div style={{
                height: "100%", width: `${selPct}%`, borderRadius: 7,
                background: selColor === "green" ? "linear-gradient(90deg,#00c853,#00e676)" : selColor === "amber" ? "linear-gradient(90deg,#ff9100,#ffab00)" : "linear-gradient(90deg,#ff4d6a,#ff7a90)",
                boxShadow: `0 0 12px ${C.shadow}`, transition: "width 0.8s ease"
              }} />
              <div style={{ position: "absolute", top: -4, left: "75%", width: 3, height: 22, background: "#94a3b8", borderRadius: 2 }}>
                <span style={{ position: "absolute", top: 26, left: "50%", transform: "translateX(-50%)", fontSize: "12px", fontWeight: 800, color: "#94a3b8", whiteSpace: "nowrap" }}>75%</span>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px", marginBottom: "28px", fontSize: "14px", fontWeight: 800 }}>
              <span style={{ color: C.text }}>{selPct >= 75 ? "Attendance OK" : selPct >= 60 ? "At Risk" : "Below Threshold"}</span>
              <span style={{ color: "#94a3b8" }}>Minimum 75%</span>
            </div>

            {/* Stat pills */}
            <div style={{ display: "flex", gap: "16px" }}>
              {[
                { num: pPresent, lbl: "Present", color: "#00c853", bg: "rgba(0,200,83,.05)", border: "rgba(0,200,83,.2)" },
                { num: pAbsent,  lbl: "Absent",  color: "#ff4d6a", bg: "rgba(255,77,106,.05)", border: "rgba(255,77,106,.2)" },
                { num: allEntries.length, lbl: "Classes Held", color: "#1a78ff", bg: "rgba(26,120,255,.05)", border: "rgba(26,120,255,.2)" },
              ].map(({ num, lbl, color, bg, border }) => (
                <div key={lbl} style={{
                  flex: 1, padding: "20px 12px", borderRadius: "14px",
                  background: bg, border: `2px solid ${border}`,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "6px"
                }}>
                  <div style={{ fontSize: "40px", fontWeight: 900, color: "#1a2a4a", lineHeight: 1 }}>{num}</div>
                  <div style={{ fontSize: "12px", fontWeight: 800, color: "#8a9bc0", textTransform: "uppercase", letterSpacing: "0.1em" }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Attendance log */}
          <div style={{
            background: "rgba(255,255,255,.95)", borderRadius: "20px",
            border: "1px solid rgba(18,78,170,.15)", boxShadow: "0 8px 32px rgba(0,0,0,.08)",
            padding: "28px 32px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: 4, height: 20, background: "linear-gradient(180deg,#1a78ff,#0050cc)", borderRadius: 2 }} />
                <span style={{ fontSize: "17px", fontWeight: 900, color: "#1a2a4a" }}>Attendance Log</span>
              </div>
              <span style={{
                fontSize: "13px", fontWeight: 800, color: "#8a9bc0",
                background: "rgba(18,78,170,.06)", padding: "5px 14px", borderRadius: "20px"
              }}>{allEntries.length} sessions</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", maxHeight: "380px", overflowY: "auto" }}>
              {/* Today */}
              <LogRow date="Today" topic="Current Session" status={attendance[selStudent.id] || "P"} isFirst />
              {/* History reversed */}
              {[...selHistory].reverse().map((r, i) => (
                <LogRow key={i} date={r.date} topic={section.name} status={r.status} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div style={{
          position: "fixed", bottom: 32, right: 32,
          background: "rgba(255,255,255,.95)", backdropFilter: "blur(10px)",
          border: "2px solid rgba(0,200,83,.4)", borderRadius: "14px",
          padding: "16px 28px", display: "flex", alignItems: "center", gap: "14px",
          fontFamily: "'Inter', sans-serif", fontSize: "16px", fontWeight: 800, color: "#00c853",
          boxShadow: "0 16px 40px rgba(0,0,0,.15)", zIndex: 9999, pointerEvents: "none",
          animation: "slideUp 0.3s ease"
        }}>
          <div style={{
            width: 28, height: 28, background: "#00c853", color: "#fff",
            borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "16px", fontWeight: 900, boxShadow: "0 4px 12px rgba(0,200,83,.4)"
          }}>✓</div>
          Attendance saved for {section.code}
        </div>
      )}

      <style>{`@keyframes slideUp { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }`}</style>
    </div>
  );
}

function LogRow({ date, topic, status, isFirst }) {
  const isPresent = status === "P";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "16px",
      padding: "13px 16px", borderRadius: "10px", marginBottom: "3px",
      background: isPresent ? "transparent" : "rgba(255,77,106,.04)",
      borderBottom: "1px solid rgba(18,78,170,.06)",
      transition: "background 0.15s"
    }}>
      <div style={{
        width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
        background: isPresent ? "#00c853" : "#ff4d6a",
        boxShadow: `0 0 8px ${isPresent ? "rgba(0,200,83,.4)" : "rgba(255,77,106,.4)"}`
      }} />
      <div style={{ fontSize: "14px", fontWeight: 800, color: "#8a9bc0", minWidth: 60, flexShrink: 0 }}>{date}</div>
      <div style={{ flex: 1, fontSize: "15px", fontWeight: 700, color: "#1a2a4a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{topic}</div>
      <div style={{
        fontSize: "12px", fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase",
        padding: "5px 14px", borderRadius: "7px", flexShrink: 0,
        background: isPresent ? "rgba(0,200,83,.1)" : "rgba(255,77,106,.1)",
        color: isPresent ? "#00c853" : "#ff4d6a",
        border: `1px solid ${isPresent ? "rgba(0,200,83,.3)" : "rgba(255,77,106,.3)"}`
      }}>
        {isPresent ? "Present" : "Absent"}
      </div>
    </div>
  );
}