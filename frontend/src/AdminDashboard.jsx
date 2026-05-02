import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import AdminSidebar from "./Components/shared/AdminSidebar";
import { ADMIN_NAV } from "./config/AdminNav";
import { gsap } from "gsap";
import "./AdminPortal.css";

const STATS = [
  { val: "2,847", label: "Total Students",  delta: "↑ 142 this semester",  cls: "delta-blue",   icon: "👥", variant: "stat-blue"   },
  { val: "89",    label: "Active Courses",  delta: "↑ 6 new this term",     cls: "delta-purple", icon: "📚", variant: "stat-purple" },
  { val: "124",   label: "Faculty Members", delta: "Stable",                cls: "delta-green",  icon: "🏛️", variant: "stat-green"  },
  { val: "94%",   label: "Avg Attendance",  delta: "↓ 2% vs last semester", cls: "delta-warn",   icon: "✓",  variant: "stat-amber"  },
];

const DEPT_DATA = [
  { name: "CS",  count: 1240, max: 1240, color: "#1a78ff" },
  { name: "EE",  count:  480, max: 1240, color: "#7c3aed" },
  { name: "MT",  count:  310, max: 1240, color: "#00c96e" },
  { name: "BBA", count:  520, max: 1240, color: "#ffab00" },
  { name: "IS",  count:  297, max: 1240, color: "#ff4d6a" },
];

const ACTIVITY = [
  { icon: "👤", cls: "act-blue",   title: "New student registered — Rida Fatima (CS)",   time: "2 mins ago" },
  { icon: "📚", cls: "act-purple", title: "Course CS-4050 (Deep Learning) was added",     time: "18 mins ago" },
  { icon: "✏️",  cls: "act-green",  title: "Marks uploaded for DB Systems — Sec A",        time: "45 mins ago" },
  { icon: "⚠️",  cls: "act-amber",  title: "Enrollment clash flagged — 3 students, AI course", time: "1 hr ago" },
  { icon: "🗑️",  cls: "act-red",    title: "Course EE-2001 deactivated by Dr. Shahid",    time: "3 hrs ago" },
  { icon: "👤", cls: "act-blue",   title: "Student 22K-5901 profile updated",              time: "5 hrs ago" },
];

const QUICK = [
  { icon: "➕", label: "Add New Student" },
  { icon: "📖", label: "Add New Course" },
  { icon: "📣", label: "Broadcast Notice" },
  { icon: "📥", label: "Import CSV" },
];

export default function AdminDashboard() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const webglRef  = useRef(null);
  const appRef    = useRef(null);
  const [collapse, setCollapse] = useState(false);

  // Animate stat values on mount
  useEffect(() => {
    document.querySelectorAll(".adm-card, .adm-stat-card").forEach((el, i) => {
      gsap.fromTo(el,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.4)", delay: i * 0.07 }
      );
    });
    // Animate dept bars after mount
    setTimeout(() => {
      document.querySelectorAll(".adm-dept-bar-fill").forEach(el => {
        el.style.width = el.dataset.width;
      });
    }, 400);
  }, []);

  // Three.js background
  useEffect(() => {
    const canvas = webglRef.current;
    let W = window.innerWidth, H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setClearColor(0xf0f5ff, 1);
    const scene  = new THREE.Scene();
    scene.fog    = new THREE.FogExp2(0xe8e0ff, 0.02);
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
    camera.position.set(0, 3, 12);
    scene.add(new THREE.AmbientLight(0x4400aa, 0.7));
    const sun = new THREE.DirectionalLight(0x9966ff, 1.4);
    sun.position.set(-6, 12, 8); scene.add(sun);
    const rim = new THREE.PointLight(0x6600ff, 3, 40);
    rim.position.set(0, 6, 0); scene.add(rim);
    const objects = [];
    const mkIco = (x, y, z, r, color) => {
      const mesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(r, 1),
        new THREE.MeshPhongMaterial({ color, wireframe: true, transparent: true, opacity: 0.2 })
      );
      mesh.position.set(x, y, z); scene.add(mesh);
      objects.push({ mesh, bob: Math.random()*0.008+0.004, phase: Math.random()*Math.PI*2, rx: (Math.random()-.5)*.018, ry: (Math.random()-.5)*.022 });
    };
    mkIco(-7, 2, -6, 2.4, 0x7c3aed); mkIco(7, -1, -7, 3.0, 0x4c1d95);
    mkIco(-2, 4, -9, 3.2, 0x6d28d9); mkIco(4, 3, -4, 1.6, 0xa78bfa);
    mkIco(-5,-3, -5, 1.8, 0x5b21b6);
    const COUNT = 180;
    const ptPos = new Float32Array(COUNT*3); const ptCol = new Float32Array(COUNT*3); const ptVel = [];
    for (let i=0;i<COUNT;i++){
      ptPos[i*3]=(Math.random()-.5)*34; ptPos[i*3+1]=(Math.random()-.5)*22; ptPos[i*3+2]=(Math.random()-.5)*18-6;
      ptVel.push({x:(Math.random()-.5)*.010,y:(Math.random()-.5)*.008});
      const p=Math.random();
      if(p<.4){ptCol[i*3]=.4;ptCol[i*3+1]=.2;ptCol[i*3+2]=1;}
      else if(p<.7){ptCol[i*3]=.6;ptCol[i*3+1]=.4;ptCol[i*3+2]=1;}
      else{ptCol[i*3]=.9;ptCol[i*3+1]=.9;ptCol[i*3+2]=1;}
    }
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute("position", new THREE.BufferAttribute(ptPos,3));
    ptGeo.setAttribute("color",    new THREE.BufferAttribute(ptCol,3));
    scene.add(new THREE.Points(ptGeo, new THREE.PointsMaterial({size:.055,transparent:true,opacity:.65,vertexColors:true})));
    const floor = new THREE.GridHelper(70,28,0x330066,0x330066);
    floor.position.y=-5.5; floor.material.transparent=true; floor.material.opacity=0.25; scene.add(floor);
    let nmx=0,nmy=0;
    const onMove=e=>{nmx=(e.clientX/W)*2-1;nmy=-(e.clientY/H)*2+1;};
    document.addEventListener("mousemove",onMove);
    let t=0,animId;
    const loop=()=>{
      animId=requestAnimationFrame(loop);t+=.012;
      objects.forEach(o=>{
        o.mesh.position.y+=Math.sin(t*o.bob*10+o.phase)*.012;
        o.mesh.rotation.x+=o.rx; o.mesh.rotation.y+=o.ry;
      });
      const p=ptGeo.attributes.position.array;
      for(let i=0;i<COUNT;i++){
        p[i*3]+=ptVel[i].x+nmx*.0018;p[i*3+1]+=ptVel[i].y+nmy*.0018;
        if(p[i*3]>17)p[i*3]=-17;if(p[i*3]<-17)p[i*3]=17;
        if(p[i*3+1]>11)p[i*3+1]=-11;if(p[i*3+1]<-11)p[i*3+1]=11;
      }
      ptGeo.attributes.position.needsUpdate=true;
      rim.position.x=Math.sin(t*.5)*12;rim.position.z=Math.cos(t*.35)*9;
      floor.position.z=((t*.8)%2.5)-1.25;
      camera.position.x+=(nmx*1.2-camera.position.x)*.018;
      camera.position.y+=(nmy*.8+3-camera.position.y)*.018;
      camera.lookAt(0,0,0);renderer.render(scene,camera);
    };
    loop();
    const onResize=()=>{W=window.innerWidth;H=window.innerHeight;renderer.setSize(W,H);camera.aspect=W/H;camera.updateProjectionMatrix();};
    window.addEventListener("resize",onResize);
    return()=>{cancelAnimationFrame(animId);document.removeEventListener("mousemove",onMove);window.removeEventListener("resize",onResize);};
  }, []);

  return (
    <>
      <canvas id="adm-webgl" ref={webglRef} />
      <div id="adm-app" ref={appRef}>

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
            <div className="adm-pg-title">Admin Dashboard</div>
            <div className="adm-tb-r">
              <div className="adm-sem-chip">Spring 2025</div>
            </div>
          </div>

          <div id="adm-scroll">

            {/* Stat cards */}
            <div className="adm-stats-grid">
              {STATS.map((s, i) => (
                <div className={`adm-stat-card ${s.variant}`} key={i}>
                  <div className="adm-stat-accent" />
                  <div className="adm-stat-icon">{s.icon}</div>
                  <div className="adm-stat-val">{s.val}</div>
                  <div className="adm-stat-label">{s.label}</div>
                  <div className={`adm-stat-delta ${s.cls}`}>{s.delta}</div>
                </div>
              ))}
            </div>

            {/* Main grid */}
            <div className="adm-dash-grid">

              {/* LEFT column */}
              <div className="adm-dash-left">

                {/* Department Distribution */}
                <div className="adm-card">
                  <div className="adm-card-hd">
                    <div className="adm-card-title"><div className="adm-ctbar" />Enrollment by Department</div>
                    <div style={{ fontSize: 12, color: "var(--dimmer)", fontFamily: "'JetBrains Mono',monospace" }}>
                      Total: 2,847 students
                    </div>
                  </div>
                  <div className="adm-dept-list">
                    {DEPT_DATA.map(d => (
                      <div className="adm-dept-row" key={d.name}>
                        <div className="adm-dept-name">{d.name}</div>
                        <div className="adm-dept-bar-track">
                          <div
                            className="adm-dept-bar-fill"
                            data-width={`${(d.count / d.max) * 100}%`}
                            style={{ width: 0, background: d.color }}
                          />
                        </div>
                        <div className="adm-dept-count">{d.count.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Records table */}
                <div className="adm-card">
                  <div className="adm-card-hd">
                    <div className="adm-card-title"><div className="adm-ctbar" />Recently Added Students</div>
                    <button className="adm-btn-secondary" style={{ padding: "7px 14px", fontSize: 12 }} onClick={() => navigate("/admin/students")}>
                      View All →
                    </button>
                  </div>
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>Roll No.</th>
                          <th>Name</th>
                          <th>Program</th>
                          <th>Semester</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { roll: "24K-0421", name: "Rida Fatima",    prog: "BS-CS", sem: "1st", status: "active" },
                          { roll: "24K-0418", name: "Kamran Bashir",  prog: "BS-CS", sem: "1st", status: "active" },
                          { roll: "22K-1892", name: "Hira Noor",      prog: "BS-IS", sem: "5th", status: "active" },
                          { roll: "23K-0771", name: "Zaid Siddiqui",  prog: "BS-EE", sem: "3rd", status: "pending" },
                        ].map((r, i) => (
                          <tr key={i}>
                            <td className="td-mono">{r.roll}</td>
                            <td className="td-bold">{r.name}</td>
                            <td className="td-dim">{r.prog}</td>
                            <td className="td-dim">{r.sem}</td>
                            <td>
                              <span className={`adm-badge badge-${r.status}`}>
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* RIGHT column */}
              <div className="adm-dash-right">

                {/* Quick Actions */}
                <div className="adm-card">
                  <div className="adm-card-hd">
                    <div className="adm-card-title"><div className="adm-ctbar" />Quick Actions</div>
                  </div>
                  <div className="adm-quick-grid">
                    {QUICK.map((q, i) => (
                      <button
                        className="adm-quick-btn"
                        key={i}
                        onClick={() => {
                          if (q.label === "Add New Student") navigate("/admin/students");
                          if (q.label === "Add New Course")  navigate("/admin/courses");
                        }}
                      >
                        <div className="adm-quick-icon">{q.icon}</div>
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation shortcuts */}
                <div className="adm-card">
                  <div className="adm-card-hd">
                    <div className="adm-card-title"><div className="adm-ctbar" />Management Modules</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <button className="adm-btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => navigate("/admin/students")}>
                      👥 Student Records
                    </button>
                    <button className="adm-btn-secondary" style={{ width: "100%", justifyContent: "center" }} onClick={() => navigate("/admin/courses")}>
                      📚 Course Catalog
                    </button>
                  </div>
                </div>

                {/* Activity Feed */}
                <div className="adm-card">
                  <div className="adm-card-hd">
                    <div className="adm-card-title"><div className="adm-ctbar" />Recent Activity</div>
                  </div>
                  <div className="adm-activity-list">
                    {ACTIVITY.map((a, i) => (
                      <div className="adm-activity-item" key={i}>
                        <div className={`adm-activity-dot ${a.cls}`}>{a.icon}</div>
                        <div>
                          <div className="adm-act-title">{a.title}</div>
                          <div className="adm-act-time">{a.time}</div>
                        </div>
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