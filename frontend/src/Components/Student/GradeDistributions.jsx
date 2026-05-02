// src/components/GradeDistribution.jsx
// Move the entire GradeDistribution function out of StudentMarks.jsx into this file.

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  GRADE_TIERS, GRADE_VARIANTS, GRADE_ORDER,
  computeOverallPct, getLetterGrade,
} from "../../Utilities/GradeUtils";

export default function GradeDistribution({ marksMeta, selectedCourse, courseColor }) {
  // ... paste the existing GradeDistribution function body here verbatim,
  // replacing the old imports (GRADE_TIERS, GRADE_VARIANTS, GRADE_ORDER, computeOverallPct, getLetterGrade) with the named imports above:
  //   GRADE_TIERS  → GRADE_TIERS
  //   GRADE_VARIANTS  → GRADE_VARIANTS
  //   GRADE_ORDER  → GRADE_ORDER
  //   computeOverallPct  → computeOverallPct
  //   getLetterGrade → getLetterGrade

  let mm = marksMeta;
  let sc = selectedCourse;
  let cc = courseColor;

  const [pu, spu] = useState(null);
  let p = null;
  if (mm) {
    p = computeOverallPct(mm);
  }
  let lg = getLetterGrade(p);

  function cp() {
    spu(null);
  }

  let sub = "Select a course above";
  if (sc) {
    sub = sc.name;
  }

  let barsty = { background: "linear-gradient(180deg,#10b981,#34d399)" };
  if (sc) {
    barsty.background = "linear-gradient(180deg," + cc + "," + cc + "55)";
  }

  let pill = null;
  if (p !== null) {
    let t = "F";
    if (lg) {
      t = lg[0];
    }
    let st = {
      background: GRADE_TIERS[t].glow,
      borderColor: GRADE_TIERS[t].color,
      color: GRADE_TIERS[t].color
    };
    pill = (
      <div className="gd-score-pill" style={st}>
        {p}%
      </div>
    );
  }

  let bod = null;
  if (!sc) {
    bod = (
      <div className="mrk-card-body">
        <span className="mrk-placeholder">{"// select a course to view grades"}</span>
      </div>
    );
  } else {
    if (p === null) {
      bod = (
        <div className="mrk-card-body" style={{ flexDirection: "column", gap: 12 }}>
          <span style={{ fontSize: 32 }}>📋</span>
          <span className="mrk-placeholder">{"// no marks uploaded yet"}</span>
        </div>
      );
    } else {
      let tz = [];
      for (let i = 0; i < GRADE_ORDER.length; i++) {
        let g = GRADE_ORDER[i];
        let t = GRADE_TIERS[g];
        let nxt = GRADE_ORDER[i + 1];
        let nxm = 0;
        if (nxt) {
          nxm = GRADE_TIERS[nxt].min;
        }
        let w = t.min - nxm;
        let br = "none";
        if (i < 4) {
          br = "1px solid " + t.color + "44";
        }
        tz.push(
          <div key={g} className="gd-zone" style={{ width: w + "%", background: t.color + "22", borderRight: br }} />
        );
      }

      let tl = "F";
      if (lg) {
        tl = lg[0];
      }
      
      let ts = [];
      for (let i = 0; i < GRADE_ORDER.length; i++) {
        let g = GRADE_ORDER[i];
        let t = GRADE_TIERS[g];
        let isf = false;
        if (g === "F") {
          isf = true;
        }
        let isc = false;
        if (lg) {
          if (lg.startsWith(g)) {
            isc = true;
          }
        }
        let ach = false;
        if (p >= t.min) {
          ach = true;
        }
        let pn = t.min - p;
        if (pn < 0) {
          pn = 0;
        }

        let cls = "gd-tile";
        if (isc) {
          cls = cls + " gd-tile--current";
        }
        if (ach) {
          cls = cls + " gd-tile--achieved";
        }
        if (!isf) {
          cls = cls + " gd-tile--clickable";
        }

        let sty = { "--tile-color": t.color, "--tile-glow": t.glow };
        if (isc) {
          sty.borderColor = t.color;
          sty.background = t.color + "11";
        }

        let hint = null;
        if (!isf) {
          hint = <div className="gd-tile-hint">tap for variants</div>;
        }

        let badg = null;
        if (isc) {
          badg = <div className="gd-tile-badge" style={{ background: t.color }}>Current</div>;
        } else {
          if (pn > 0) {
            badg = <div className="gd-tile-gap">+{pn}% needed</div>;
          } else {
            badg = <div className="gd-tile-gap gd-tile-gap--achieved">✓ achieved</div>;
          }
        }

        let txt = "≥ " + t.min;
        if (isf) {
          txt = "< 60";
        }

        function hc() {
          if (!isf) {
            spu(g);
          }
        }

        ts.push(
          <div key={g} className={cls} style={sty} onClick={hc}>
            <div className="gd-tile-letter" style={{ color: t.color }}>{g}</div>
            <div className="gd-tile-min" style={{ color: t.color }}>
              {txt}
              <span className="gd-tile-unit">%</span>
            </div>
            {badg}
            {hint}
          </div>
        );
      }

      let vars = [];
      if (pu) {
        let vlist = GRADE_VARIANTS[pu];
        for (let i = 0; i < vlist.length; i++) {
          let v = vlist[i];
          let del = v.min - p;
          let cols = ["#1a78ff", "#10b981", "#f59e0b"];
          let col = cols[i];
          let ach = false;
          if (p >= v.min) {
            ach = true;
          }
          let vcls = "gd-variant";
          if (ach) {
            vcls = vcls + " gd-variant--achieved";
          }
          let w = (p / v.min) * 100;
          if (w > 100) {
            w = 100;
          }

          let rtxt = null;
          if (ach) {
            rtxt = <span className="gd-variant-ok">✓ Achieved — ≥ {v.min}%</span>;
          } else {
            rtxt = <span style={{ color: col }}>Need {del}% more · ≥ {v.min}%</span>;
          }

          vars.push(
            <div key={v.label} className={vcls} style={{ "--vc": col }}>
              <div className="gd-variant-label" style={{ color: col }}>{v.label}</div>
              <div className="gd-variant-desc">{v.desc}</div>
              <div className="gd-variant-bar-track">
                <div className="gd-variant-bar" style={{ width: w + "%", background: col }} />
              </div>
              <div className="gd-variant-req">
                {rtxt}
              </div>
            </div>
          );
        }
      }

      let pup = null;
      if (pu) {
        let pc = GRADE_TIERS[pu].color;
        pup = (
          <>
            <motion.div className="gd-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={cp} />
            <motion.div className="gd-popup" initial={{ opacity: 0, scale: 0.88, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.88, y: 12 }} transition={{ type: "spring", stiffness: 340, damping: 26 }}>
              <div className="gd-popup-hd">
                <span className="gd-popup-letter" style={{ color: pc }}>Grade {pu}</span>
                <button className="gd-popup-close" onClick={cp}>✕</button>
              </div>
              <div className="gd-popup-sub">
                Your score: <strong style={{ color: pc }}>{p}%</strong>
              </div>
              <div className="gd-popup-variants">
                {vars}
              </div>
            </motion.div>
          </>
        );
      }

      bod = (
        <div className="gd-body">
          <div className="gd-progress-wrap">
            <div className="gd-progress-track">
              {tz}
              <div className="gd-needle" style={{ left: p + "%", background: GRADE_TIERS[tl].color }}>
                <div className="gd-needle-tip" style={{ borderTopColor: GRADE_TIERS[tl].color }} />
              </div>
            </div>
            <div className="gd-progress-labels">
              <span>0</span><span>60</span><span>70</span><span>80</span><span>90</span><span>100</span>
            </div>
          </div>
          <div className="gd-tiles">
            {ts}
          </div>
          <AnimatePresence>
            {pup}
          </AnimatePresence>
        </div>
      );
    }
  }

  return (
    <div className="gd-card">
      <div className="mrk-card-hd">
        <div className="mrk-card-title-wrap">
          <div className="mrk-card-bar" style={barsty} />
          <div>
            <div className="mrk-card-title">Grade Distribution</div>
            <div className="mrk-card-sub">{sub}</div>
          </div>
        </div>
        {pill}
      </div>
      {bod}
    </div>
  );
}