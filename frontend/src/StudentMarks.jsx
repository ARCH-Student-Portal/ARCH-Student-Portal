import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as THREE from "three";
import { gsap } from "gsap";
import { AnimatePresence, motion } from "framer-motion";
import "./StudentMarks.css";
import { useCourses, MARKS_DATA } from "./CourseContext";
import Sidebar from "./Components/shared/Sidebar";
import { STUDENT_NAV } from "./config/studentNav";
import GradeDistribution from "./Components/Student/GradeDistributions";
import FinalGrade from "./Components/Student/FinalGrade";
import {
  SECTION_ICONS,
  GRADE_TIERS,
  getSectionKeys,
  computeOverallPct,
  getLetterGrade,
} from "./Utilities/GradeUtils";

const si = {
  "Quizzes":    "◈",
  "Assignments":"▦",
  "Mid Exam":   "◎",
  "Final Exam": "⊞",
  "Projects":   "◉",
  "Lab Work":   "⬡",
};

const gt = {
  A: { min: 90, label: "A", color: "#1a78ff", glow: "rgba(26,120,255,.22)"  },
  B: { min: 80, label: "B", color: "#10b981", glow: "rgba(16,185,129,.22)"  },
  C: { min: 70, label: "C", color: "#f59e0b", glow: "rgba(245,158,11,.22)"  },
  D: { min: 60, label: "D", color: "#f97316", glow: "rgba(249,115,22,.22)"  },
  F: { min: 0,  label: "F", color: "#ef4444", glow: "rgba(239,68,68,.22)"   },
};

const gv = {
  A: [
    { label: "A+", min: 97, desc: "Outstanding"  },
    { label: "A",  min: 93, desc: "Excellent"    },
    { label: "A−", min: 90, desc: "Very Good"    },
  ],
  B: [
    { label: "B+", min: 87, desc: "Good"         },
    { label: "B",  min: 83, desc: "Above Avg"    },
    { label: "B−", min: 80, desc: "Satisfactory" },
  ],
  C: [
    { label: "C+", min: 77, desc: "Average"      },
    { label: "C",  min: 73, desc: "Below Avg"    },
    { label: "C−", min: 70, desc: "Passing"      },
  ],
  D: [
    { label: "D+", min: 67, desc: "Weak"         },
    { label: "D",  min: 63, desc: "Poor"         },
    { label: "D−", min: 60, desc: "Borderline"   },
  ],
};

const go = ["A", "B", "C", "D", "F"];

function gs(c) {
  let d = MARKS_DATA[c];
  if (d) {
    return Object.keys(d.sections);
  } else {
    return [];
  }
}

function cs(md) {
  if (!md) {
    return null;
  }
  if (!md.sections) {
    return null;
  }
  let s = Object.values(md.sections);
  if (s.length === 0) {
    return null;
  }
  let tm = 0;
  let ts = 0;
  for (let i = 0; i < s.length; i++) {
    let sec = s[i];
    for (let j = 0; j < sec.entries.length; j++) {
      let en = sec.entries[j];
      ts = ts + en.marks;
    }
    tm = tm + sec.total;
  }
  if (tm === 0) {
    return null;
  } else {
    return Math.round((ts / tm) * 100);
  }
}

function glg(p) {
  if (p === null) {
    return null;
  }
  if (p === undefined) {
    return null;
  }
  if (p >= 97) {
    return "A+";
  }
  if (p >= 93) {
    return "A";
  }
  if (p >= 90) {
    return "A−";
  }
  if (p >= 87) {
    return "B+";
  }
  if (p >= 83) {
    return "B";
  }
  if (p >= 80) {
    return "B−";
  }
  if (p >= 77) {
    return "C+";
  }
  if (p >= 73) {
    return "C";
  }
  if (p >= 70) {
    return "C−";
  }
  if (p >= 67) {
    return "D+";
  }
  if (p >= 63) {
    return "D";
  }
  if (p >= 60) {
    return "D−";
  }
  return "F";
}

const nv = [
  ["Overview",      [["⊞","Dashboard","/student/dashboard"],["◎","Academic","/student/academic"]]],
  ["Courses",       [["＋","Registration","/student/registration"],["◈","Transcript","/student/transcript"],["▦","Marks","/student/marks"],["✓","Attendance","/student/attendance"],["▤","Timetable","/student/timetable"]]],
  ["Communication", [["◉","Notices","/student/notices"]]],
  ["Account",       [["◌","Profile","/student/profile"]]],
];

export default function StudentMarks() {
  const n = useNavigate();
  const l = useLocation();
  const wr = useRef(null);
  const icr = useRef(null);
  const ir = useRef(null);
  const ar = useRef(null);
  const sr = useRef(null);
  const tr = useRef(null);
  const sidebarRef = useRef(null); 

  const { enrolled } = useCourses();

  const [collapse, setCollapse] = useState(false);
  const [sc, ssc] = useState(null);
  const [es, ses] = useState({});
  const [at, sat] = useState("raw");

  useEffect(() => {
    if (sc) {
      let fnd = false;
      for (let i = 0; i < enrolled.length; i++) {
        if (enrolled[i].code === sc.code) {
          fnd = true;
        }
      }
      if (!fnd) {
        ssc(null);
        ses({});
      }
    }
  }, [enrolled, sc]);

  function ts(s) {
    ses(function(p) {
      let cur = false;
      if (p[s]) {
        cur = true;
      }
      return { ...p, [s]: !cur };
    });
  }

  function hcs(co) {
    let act = false;
    if (sc) {
      if (sc.code === co.code) {
        act = true;
      }
    }
    if (act) {
      ssc(null);
    } else {
      ssc(co);
    }
    ses({});
  }

  useEffect(() => {
    let hpi = sessionStorage.getItem("archIntroPlayed");
    if (hpi) {
      if (ir.current) { ir.current.style.display = "none"; }
      if (ar.current) { ar.current.style.opacity = 1; }
      if (sr.current) { sr.current.style.transform = "translateX(0)"; }
      if (tr.current) { tr.current.style.opacity = 1; }
      if (wr.current) {
        wr.current.style.opacity = 0;
        wr.current.style.display = "none";
      }
      return; 
    }

    let cvs = icr.current;
    let ctx = cvs.getContext("2d");
    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;

    let wds = ["MARKS","GRADES","EVALUATION","QUIZZES","ASSIGNMENTS","EXAMS"];
    let pts = [];
    for (let i = 0; i < 60; i++) {
      let rh = "60,140,255";
      if (Math.random() > 0.6) {
        rh = "255,255,255";
      }
      pts.push({
        x: Math.random() * cvs.width,
        y: Math.random() * cvs.height,
        word: wds[Math.floor(Math.random() * wds.length)],
        opacity: Math.random() * 0.4 + 0.05,
        speed: Math.random() * 0.8 + 0.2,
        size: Math.floor(Math.random() * 10) + 10,
        flicker: Math.random() * 0.025 + 0.005,
        hue: rh,
      });
    }

    let aid;
    function drw() {
      ctx.fillStyle = "rgba(0,4,14,0.18)";
      ctx.fillRect(0, 0, cvs.width, cvs.height);
      for (let i = 0; i < pts.length; i++) {
        let p = pts[i];
        p.y = p.y - p.speed * 0.4;
        let d = -1;
        if (Math.random() > 0.5) {
          d = 1;
        }
        p.opacity = p.opacity + p.flicker * d;
        if (p.opacity < 0.03) { p.opacity = 0.03; }
        if (p.opacity > 0.55) { p.opacity = 0.55; }
        if (p.y < -30) {
          p.y = cvs.height + 20;
          p.x = Math.random() * cvs.width;
        }
        ctx.font = p.size + "px 'Inter', sans-serif";
        ctx.fillStyle = "rgba(" + p.hue + "," + p.opacity + ")";
        ctx.fillText(p.word, p.x, p.y);
      }
      aid = requestAnimationFrame(drw);
    }
    drw();

    function aft() {
      cancelAnimationFrame(aid);
      sessionStorage.setItem("archIntroPlayed", "true"); 

      gsap.set(ir.current, { display: "none" });
      gsap.to(ar.current, { opacity: 1, duration: 0.6 });
      gsap.to(sr.current, { x: 0, duration: 1.2, ease: "expo.out" });
      gsap.to(tr.current, { opacity: 1, duration: 0.7 });
      
      gsap.to(wr.current, { opacity: 0, duration: 2.5, ease: "power2.inOut", delay: 0.5 });
      setTimeout(() => {
        if (wr.current) { wr.current.style.display = "none"; }
      }, 3000);
    }

    let tl = gsap.timeline({ delay: 0.2, onComplete: aft });
    tl.to("#intro-line", { scaleX: 1, duration: 0.8, ease: "power3.out" })
      .to("#intro-logo", { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }, 0.5)
      .to("#intro-sub", { opacity: 1, y: 0, duration: 0.5 }, 1.1)
      .to("#intro-logo", { scale: 50, opacity: 0, duration: 0.7, ease: "power4.in" }, 2.4)
      .to("#intro-sub", { opacity: 0, duration: 0.3 }, 2.4)
      .to("#intro-line", { opacity: 0, duration: 0.3 }, 2.4)
      .to("#intro-flash", { opacity: 1, duration: 0.08 }, 2.85)
      .to("#intro-flash", { opacity: 0, duration: 0.4 }, 2.93)
      .to(ir.current, { opacity: 0, duration: 0.35 }, 2.88);

    return () => cancelAnimationFrame(aid);
  }, []);

  useEffect(() => {
    let hpi = sessionStorage.getItem("archIntroPlayed");
    if (hpi) {
      return;
    }

    let cvs = wr.current;
    if (!cvs) {
      return;
    }
    let W = window.innerWidth;
    let H = window.innerHeight;
    let ren = new THREE.WebGLRenderer({ canvas: cvs, alpha: true, antialias: true });
    ren.setSize(W, H);
    ren.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    ren.setClearColor(0xf0f5ff, 1);
    let scn  = new THREE.Scene();
    scn.fog    = new THREE.FogExp2(0xdeeaff, 0.018);
    let cam = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
    cam.position.set(0, 3, 12);
    scn.add(new THREE.AmbientLight(0x1144cc, 0.6));
    let sun = new THREE.DirectionalLight(0x6699ff, 1.4);
    sun.position.set(-6, 12, 8); 
    scn.add(sun);
    let rl  = new THREE.PointLight(0x0055ff, 3, 40);
    rl.position.set(0, 6, 0); 
    scn.add(rl);
    let fl = new THREE.PointLight(0x88ccff, 1.5, 25);
    fl.position.set(-8, -2, 5); 
    scn.add(fl);
    
    let objs = [];
    function mki(x, y, z, r, clr, opc = 0.22) {
      let mat = new THREE.MeshPhongMaterial({ color: clr, wireframe: true, transparent: true, opacity: opc, shininess: 120 });
      let geo = new THREE.IcosahedronGeometry(r, 1);
      let msh = new THREE.Mesh(geo, mat);
      msh.position.set(x, y, z); 
      scn.add(msh);
      objs.push({ mesh: msh, bs: Math.random()*.008+.004, bp: Math.random()*Math.PI*2, rx: (Math.random()-.5)*.018, ry: (Math.random()-.5)*.022, rz: (Math.random()-.5)*.014 });
    }
    mki(-7,2,-6,2.2,0x1a78ff,0.20); 
    mki(7,-1,-7,2.8,0x0055dd,0.16);
    mki(-2,4,-9,3.4,0x2266ee,0.13); 
    mki(4,3,-4,1.6,0x4499ff,0.24);
    mki(-5,-3,-5,1.8,0x0044bb,0.18);
    
    function mkr(x, y, z, r, clr) {
      let geo = new THREE.TorusGeometry(r, 0.04, 6, 60);
      let mat = new THREE.MeshPhongMaterial({ color: clr, transparent: true, opacity: 0.28, shininess: 180 });
      let msh = new THREE.Mesh(geo, mat);
      msh.rotation.x = Math.random() * Math.PI; 
      msh.position.set(x, y, z); 
      scn.add(msh);
      objs.push({ mesh: msh, bs: .007, bp: Math.random()*Math.PI*2, rx: (Math.random()-.5)*.016, ry: (Math.random()-.5)*.018, rz: 0 });
    }
    mkr(-6,4,-7,2.0,0x4499ff); 
    mkr(3,-1,-5,1.5,0x1166dd);
    
    let cnt = 200;
    let ptp = new Float32Array(cnt * 3);
    let ptc = new Float32Array(cnt * 3);
    let ptv = [];
    for (let i = 0; i < cnt; i++) {
      ptp[i*3]=(Math.random()-.5)*34; 
      ptp[i*3+1]=(Math.random()-.5)*22; 
      ptp[i*3+2]=(Math.random()-.5)*18-6;
      ptv.push({ x:(Math.random()-.5)*.010, y:(Math.random()-.5)*.008 });
      let pck = Math.random();
      if (pck < .4) { 
        ptc[i*3]=.1; ptc[i*3+1]=.4; ptc[i*3+2]=1.0; 
      } else if (pck < .7) { 
        ptc[i*3]=.4; ptc[i*3+1]=.8; ptc[i*3+2]=1.0; 
      } else { 
        ptc[i*3]=.9; ptc[i*3+1]=.95; ptc[i*3+2]=1.0; 
      }
    }
    let ptg = new THREE.BufferGeometry();
    ptg.setAttribute("position", new THREE.BufferAttribute(ptp, 3));
    ptg.setAttribute("color", new THREE.BufferAttribute(ptc, 3));
    let pmat = new THREE.PointsMaterial({ size:.055, transparent:true, opacity:.65, vertexColors:true });
    scn.add(new THREE.Points(ptg, pmat));
    
    let flr = new THREE.GridHelper(70, 28, 0x002288, 0x002288);
    flr.position.y = -5.5; 
    flr.material.transparent = true; 
    flr.material.opacity = 0.30;
    scn.add(flr);
    
    let nmx = 0;
    let nmy = 0;
    function omv(e) { 
      nmx=(e.clientX/W)*2-1; 
      nmy=-(e.clientY/H)*2+1; 
    }
    document.addEventListener("mousemove", omv);
    
    let t = 0;
    let aid;
    function lp() {
      aid = requestAnimationFrame(lp); 
      t = t + .012;
      for (let i = 0; i < objs.length; i++) {
        let o = objs[i];
        o.mesh.position.y = o.mesh.position.y + Math.sin(t*o.bs*10+o.bp)*.012;
        o.mesh.rotation.x = o.mesh.rotation.x + o.rx; 
        o.mesh.rotation.y = o.mesh.rotation.y + o.ry;
        if (o.rz) {
          o.mesh.rotation.z = o.mesh.rotation.z + o.rz;
        }
      }
      let arr = ptg.attributes.position.array;
      for (let i = 0; i < cnt; i++) {
        arr[i*3] = arr[i*3] + ptv[i].x+nmx*.0018; 
        arr[i*3+1] = arr[i*3+1] + ptv[i].y+nmy*.0018;
        if(arr[i*3]>17) { arr[i*3]=-17; }
        if(arr[i*3]<-17) { arr[i*3]=17; }
        if(arr[i*3+1]>11) { arr[i*3+1]=-11; }
        if(arr[i*3+1]<-11) { arr[i*3+1]=11; }
      }
      ptg.attributes.position.needsUpdate = true;
      rl.position.x = Math.sin(t*.5)*12; 
      rl.position.z = Math.cos(t*.35)*9;
      flr.position.z = ((t*.8)%2.5)-1.25;
      cam.position.x = cam.position.x + (nmx*1.2-cam.position.x)*.018;
      cam.position.y = cam.position.y + (nmy*.8+3-cam.position.y)*.018;
      cam.lookAt(0,0,0); 
      ren.render(scn,cam);
    }
    lp();
    
    function orz() { 
      W=window.innerWidth; 
      H=window.innerHeight; 
      ren.setSize(W,H); 
      cam.aspect=W/H; 
      cam.updateProjectionMatrix(); 
    }
    window.addEventListener("resize", orz);
    return () => { 
      cancelAnimationFrame(aid); 
      document.removeEventListener("mousemove", omv); 
      window.removeEventListener("resize", orz); 
    };
  }, []);

  let mm = null;
  if (sc) {
    mm = MARKS_DATA[sc.code];
  }
  let secs = [];
  if (sc) {
    secs = gs(sc.code);
  }
  let cc = "#1a78ff";
  if (mm) {
    if (mm.color) {
      cc = mm.color;
    }
  }
  let bgc = "rgba(26,120,255,.08)";
  if (mm) {
    if (mm.bg) {
      bgc = mm.bg;
    }
  }
  let bor = "rgba(26,120,255,.28)";
  if (mm) {
    if (mm.border) {
      bor = mm.border;
    }
  }
  let tcr = 0;
  for (let i = 0; i < enrolled.length; i++) {
    tcr = tcr + enrolled[i].credits;
  }

  let sidepts = [];
  for (let i = 0; i < nv.length; i++) {
    let s = nv[i][0];
    let it = nv[i][1];
    let dits = [];
    for (let j = 0; j < it.length; j++) {
      let i1 = it[j][0];
      let l1 = it[j][1];
      let p1 = it[j][2];
      let cls1 = "ni";
      if (l.pathname === p1) {
        cls1 = cls1 + " active";
      }
      let bdg1 = null;
      if (l1 === "Notices") {
        bdg1 = <span className="nbadge">3</span>;
      }
      dits.push(
        <div key={l1} className={cls1} onClick={() => n(p1)}>
          <div className="ni-ic">{i1}</div>
          {l1}
          {bdg1}
        </div>
      );
    }
    sidepts.push(
      <div key={s}>
        <div className="nav-sec">{s}</div>
        {dits}
      </div>
    );
  }

  let cbody = null;
  if (enrolled.length === 0) {
    cbody = (
      <div className="mrk-card-body">
        <span className="mrk-placeholder">{"// no courses enrolled — visit Registration"}</span>
      </div>
    );
  } else {
    let trk = [];
    for (let i = 0; i < enrolled.length; i++) {
      let crs = enrolled[i];
      let mtd = MARKS_DATA[crs.code];
      let clr = "#1a78ff";
      let bgi = "rgba(26,120,255,.08)";
      let brd = "rgba(26,120,255,.28)";
      if (mtd) {
        if (mtd.color) { clr = mtd.color; }
        if (mtd.bg) { bgi = mtd.bg; }
        if (mtd.border) { brd = mtd.border; }
      }
      let actv = false;
      if (sc) {
        if (sc.code === crs.code) {
          actv = true;
        }
      }
      let hlab = false;
      if (mtd) {
        let keys = Object.keys(mtd.sections);
        if (keys.includes("Lab Work")) {
          hlab = true;
        }
      }
      let tid = crs.code.replace(/[^A-Z0-9]/gi, "").slice(0, 6).toUpperCase();
      let ccls = "course-tile";
      if (actv) {
        ccls = ccls + " course-tile--active";
      }
      let csty = {};
      if (actv) {
        csty.background = bgi;
        csty.borderColor = brd;
      }

      let lb = null;
      if (hlab) {
        lb = <span className="course-tile-lab" style={{ color: clr }}>LAB</span>;
      }

      trk.push(
        <div key={crs.code} className={ccls} style={csty} onClick={() => hcs(crs)}>
          <div className="course-tile-strip" style={{ background: clr }} />
          <div className="course-tile-id" style={{ color: clr }}>{tid}</div>
          <div className="course-tile-name">{crs.name}</div>
          <div className="course-tile-foot">
            <span className="course-tile-cr">{crs.credits} cr</span>
            {lb}
            <span className="course-tile-arrow" style={{ color: clr }}>›</span>
          </div>
        </div>
      );
    }
    cbody = (
      <div className="course-track">
        {trk}
      </div>
    );
  }

  let rcls = "marks-tab";
  if (at === 'raw') {
    rcls = rcls + " active";
  }
  let pcls = "marks-tab";
  if (at === 'perf') {
    pcls = pcls + " active";
  }
  let dcls = "marks-tab";
  if (at === 'dist') {
    dcls = dcls + " active";
  }

  let bdg2 = null;
  if (sc) {
    if (secs.length > 0) {
      let tot = 0;
      for (let i = 0; i < secs.length; i++) {
        let secdata = mm.sections[secs[i]];
        if (secdata) {
          let st = 0;
          for (let j = 0; j < secdata.entries.length; j++) {
            st = st + secdata.entries[j].marks;
          }
          tot = tot + st;
        }
      }
      bdg2 = (
        <div className="card2-total-badge" style={{ background: bgc, borderColor: bor, color: cc }}>
          {tot}
          <span>pts</span>
        </div>
      );
    }
  }

  let rbod = null;
  if (!sc) {
    rbod = (
      <div className="mrk-card-body">
        <span className="mrk-placeholder">{"// select a course to view marks"}</span>
      </div>
    );
  } else {
    if (secs.length === 0) {
      rbod = (
        <div className="mrk-card-body" style={{ flexDirection:"column", gap:16 }}>
          <span style={{ fontSize:42 }}>📭</span>
          <span className="mrk-placeholder">{"// no marks recorded yet for "} {sc.code}</span>
        </div>
      );
    } else {
      let msecs = [];
      for (let i = 0; i < secs.length; i++) {
        let scn = secs[i];
        let dta = mm.sections[scn];
        if (dta) {
          let s1 = 0;
          for (let k = 0; k < dta.entries.length; k++) {
            s1 = s1 + dta.entries[k].marks;
          }
          let mt1 = 0;
          for (let k = 0; k < dta.entries.length; k++) {
            mt1 = mt1 + dta.entries[k].max;
          }
          let pct1 = Math.round((s1 / mt1) * 100);
          if (pct1 > 100) {
            pct1 = 100;
          }
          let iso = false;
          if (es[scn]) {
            iso = true;
          }
          let scls = "marks-sec";
          if (iso) {
            scls = scls + " marks-sec--open";
          }
          let icn = "◆";
          if (si[scn]) {
            icn = si[scn];
          }
          let ccls = "marks-sec-chevron";
          if (iso) {
            ccls = ccls + " open";
          }
          
          let tbd = null;
          if (iso) {
            let trs = [];
            for (let j = 0; j < dta.entries.length; j++) {
              let en = dta.entries[j];
              let epc = (en.marks / en.max) * 100;
              trs.push(
                <tr key={en.label}>
                  <td className="tbl-label">{en.label}</td>
                  <td style={{ color: cc, fontWeight: 900 }}>{en.marks}</td>
                  <td className="tbl-dim">{en.max}</td>
                  <td>
                    <div className="tbl-pct-wrap">
                      <div className="tbl-pct-track">
                        <div className="tbl-pct-bar" style={{ width: epc + "%", background: cc }} />
                      </div>
                      <span className="tbl-pct-num">{Math.round(epc)}%</span>
                    </div>
                  </td>
                </tr>
              );
            }
            tbd = (
              <div className="marks-sec-body">
                <table className="marks-tbl">
                  <thead><tr><th>Item</th><th>Marks</th><th>Out of</th><th>Score</th></tr></thead>
                  <tbody>{trs}</tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4}>
                        <div className="tbl-foot-row">
                          <span className="tbl-foot-label">Class avg</span><span className="tbl-foot-val">{dta.avg}</span>
                          <span className="tbl-foot-sep">·</span>
                          <span className="tbl-foot-label">High</span><span className="tbl-foot-val tbl-foot-max">{dta.classMax}</span>
                          <span className="tbl-foot-sep">·</span>
                          <span className="tbl-foot-label">Low</span><span className="tbl-foot-val tbl-foot-min">{dta.classMin}</span>
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            );
          }

          msecs.push(
            <div className={scls} key={scn}>
              <div className="marks-sec-hd" onClick={() => ts(scn)}>
                <div className="marks-sec-left">
                  <span className="marks-sec-icon">{icn}</span>
                  <span className="marks-sec-name">{scn}</span>
                  <div className="marks-sec-pill">
                    <div className="marks-sec-pill-fill" style={{ width: pct1 + "%", background: cc }} />
                  </div>
                  <span className="marks-sec-pct" style={{ color: cc }}>{pct1}%</span>
                </div>
                <div className="marks-sec-right">
                  <span className="marks-sec-score" style={{ color: cc }}>{s1}</span>
                  <span className="marks-sec-total">/{dta.total}</span>
                  <span className={ccls}>›</span>
                </div>
              </div>
              {tbd}
            </div>
          );
        }
      }
      rbod = <div className="marks-sections">{msecs}</div>;
    }
  }

  let pbod = null;
  if (!sc) {
    pbod = (
      <div className="mrk-card-body">
        <span className="mrk-placeholder">{"// select a course to view chart"}</span>
      </div>
    );
  } else {
    if (secs.length === 0) {
      pbod = (
        <div className="mrk-card-body" style={{ flexDirection:"column", gap:16 }}>
          <span style={{ fontSize:42 }}>📊</span>
          <span className="mrk-placeholder">{"// chart will populate once marks are uploaded"}</span>
        </div>
      );
    } else {
      let ccols = [];
      for (let i = 0; i < secs.length; i++) {
        let scn2 = secs[i];
        let dta2 = mm.sections[scn2];
        if (dta2) {
          let s2 = 0;
          for (let k = 0; k < dta2.entries.length; k++) {
            s2 = s2 + dta2.entries[k].marks;
          }
          let cp = 88;
          let yp = (s2 / dta2.classMax) * cp;
          if (yp > cp) { yp = cp; }
          let ap = (dta2.avg / dta2.classMax) * cp;
          if (ap > cp) { ap = cp; }
          let mp = (dta2.classMin / dta2.classMax) * cp;
          if (mp > cp) { mp = cp; }
          let slb = scn2.replace(" Exam","").replace("Assignments","Assign.");
          
          let aib = 0;
          if (yp > 0) {
            aib = (ap / yp) * 100;
            if (aib > 100) { aib = 100; }
          }
          let mib = 0;
          if (yp > 0) {
            mib = (mp / yp) * 100;
            if (mib > 100) { mib = 100; }
          }
          let bgr = cc;
          if (yp > 0) {
            let p1 = mib - .5;
            let p2 = mib + .5;
            let p3 = aib - .5;
            let p4 = aib + .5;
            bgr = "linear-gradient(to top, rgba(255,60,80,.35) 0%, rgba(255,60,80,.25) " + p1 + "%, " + cc + "55 " + p2 + "%, " + cc + "88 " + p3 + "%, " + cc + " " + p4 + "%, " + cc + " 100%)";
          }

          let gls = [];
          let gs = [25, 50, 75];
          for (let gidx = 0; gidx < gs.length; gidx++) {
            let g = gs[gidx];
            gls.push(<div key={g} className="chart-grid-line" style={{ bottom: (g * cp / 100) + "%" }} />);
          }

          ccols.push(
            <div className="chart-col" key={scn2}>
              <div className="chart-bar-area">
                {gls}
                <div className="chart-marker chart-marker--max" style={{ bottom: cp + "%" }}>
                  <span className="marker-tip marker-tip--max">{dta2.classMax}</span>
                </div>
                <div className="chart-zone-tick chart-zone-tick--avg" style={{ bottom: ap + "%" }}>
                  <span className="zone-tick-label">{dta2.avg}</span>
                </div>
                <div className="chart-zone-tick chart-zone-tick--min" style={{ bottom: mp + "%" }}>
                  <span className="zone-tick-label">{dta2.classMin}</span>
                </div>
                <div className="chart-bar-wrap">
                  <div className="chart-bar" style={{ height: yp + "%", background: bgr }}>
                    <span className="chart-bar-val">{s2}</span>
                  </div>
                </div>
              </div>
              <div className="chart-col-label">{slb}</div>
              <div className="chart-col-total" style={{ color: cc }}>/{dta2.total}</div>
            </div>
          );
        }
      }

      pbod = (
        <div className="chart-wrap">
          <div className="chart-legend">
            <div className="leg-item"><span className="leg-swatch" style={{ background: cc }} /><span>Above avg</span></div>
            <div className="leg-item"><span className="leg-swatch" style={{ background: cc + "66" }} /><span>Avg → Min</span></div>
            <div className="leg-item"><span className="leg-swatch leg-swatch--red" /><span>Below min</span></div>
            <div className="leg-item leg-item--max"><span className="leg-line-swatch leg-max" /><span>Max</span></div>
          </div>
          <div className="chart-bars">
            {ccols}
          </div>
        </div>
      );
    }
  }

  let t1c = null;
  if (at === 'raw') {
    let hb2 = "linear-gradient(180deg,var(--blue),var(--blue2))";
    if (sc) {
      hb2 = "linear-gradient(180deg," + cc + "," + cc + "88)";
    }
    let sttl = "Select a course above";
    if (sc) {
      sttl = sc.name;
    }
    t1c = (
      <motion.div key="raw" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
        <div className="mrk-card mrk-card--fullwidth">
          <div className="mrk-card-hd">
            <div className="mrk-card-title-wrap">
              <div className="mrk-card-bar" style={{ background: hb2 }} />
              <div>
                <div className="mrk-card-title">Raw Marks</div>
                <div className="mrk-card-sub">{sttl}</div>
              </div>
            </div>
            {bdg2}
          </div>
          {rbod}
        </div>
      </motion.div>
    );
  }

  let t2c = null;
  if (at === 'perf') {
    let hb3 = "linear-gradient(180deg,#7c3aed,#a78bfa)";
    if (sc) {
      hb3 = "linear-gradient(180deg," + cc + "," + cc + "55)";
    }
    let stt2 = "Select a course above";
    if (sc) {
      stt2 = sc.name;
    }
    t2c = (
      <motion.div key="perf" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
        <div className="mrk-card mrk-card--tall mrk-card--fullwidth">
          <div className="mrk-card-hd">
            <div className="mrk-card-title-wrap">
              <div className="mrk-card-bar" style={{ background: hb3 }} />
              <div>
                <div className="mrk-card-title">Performance Overview</div>
                <div className="mrk-card-sub">{stt2}</div>
              </div>
            </div>
          </div>
          {pbod}
        </div>
      </motion.div>
    );
  }

  let t3c = null;
  if (at === 'dist') {
    t3c = (
      <motion.div key="dist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
        <div className="mrk-bottom-row">
          <GradeDistribution marksMeta={mm} selectedCourse={sc} courseColor={cc} />
          <FinalGrade marksMeta={mm} selectedCourse={sc} courseColor={cc} />
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <div className="mesh-bg">
        <div className="mesh-blob blob-1" />
        <div className="mesh-blob blob-2" />
        <div className="mesh-blob blob-3" />
      </div>

      <canvas id="mrk-webgl" ref={wr} />

      <div id="intro" ref={ir}>
        <canvas id="intro-canvas" ref={icr} />
        <div id="intro-line" />
        <div id="intro-logo">ARCH</div>
        <div id="intro-sub">Academic Marks</div>
        <div id="intro-flash" />
      </div>

      <div id="mrk-app" ref={ar}>

        <Sidebar
          ref={sidebarRef}  // <--- ADD THIS LINE
          sections={STUDENT_NAV}
          logoLabel="Student Portal"
          userName="Areeb Bucha"
          userId="21K-3210"
          collapse={collapse}
          onToggle={() => setCollapse(c => !c)}
        />

        <div id="mrk-main">
          <div id="mrk-topbar" ref={tr}>
            <div className="tb-glow" />
            <div className="pg-title"><span>Marks</span></div>
            <div className="tb-r">
              <div className="sem-chip">SPRING 2025</div>
              <div className="nb-btn hov-target">
                🔔
                <div className="nb-pip" />
              </div>
            </div>
          </div>

          <div id="mrk-scroll">

            <div className="mrk-card" id="mrk-card1">
              <div className="mrk-card-hd">
                <div className="mrk-card-title-wrap">
                  <div className="mrk-card-bar" />
                  <div>
                    <div className="mrk-card-title">Enrolled Courses</div>
                    <div className="mrk-card-sub">Spring 2025 · {enrolled.length} courses</div>
                  </div>
                </div>
              </div>
              {cbody}
              <div className="course-track-foot">
                Total <strong>{tcr}</strong>
                <span className="cfoot-dot" />
                credit hours
                <span className="cfoot-dot" />
                {enrolled.length} courses enrolled
              </div>
            </div>

            <div className="marks-tab-container">
              <button className={rcls} onClick={() => sat('raw')}>
                Raw Marks
              </button>
              <button className={pcls} onClick={() => sat('perf')}>
                Performance Overview
              </button>
              <button className={dcls} onClick={() => sat('dist')}>
                Grade Distribution
              </button>
            </div>

            <div className="marks-tab-content">
              <AnimatePresence mode="wait">
                {t1c}
                {t2c}
                {t3c}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}