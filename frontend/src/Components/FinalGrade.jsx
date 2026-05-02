// src/components/FinalGrade.jsx
// Move the entire FinalGrade function out of StudentMarks.jsx into this file.

import {
  GRADE_TIERS,
  computeOverallPct,
  getLetterGrade,
} from "../Utilities/GradeUtils";

export default function FinalGrade({ marksMeta, selectedCourse, courseColor }) {
  // ... paste the existing FinalGrade function body here verbatim,
  // replacing GRADE_TIERS → GRADE_TIERS, computeOverallPct → computeOverallPct, getLetterGrade → getLetterGrade
  let mm = marksMeta;
  let sc = selectedCourse;
  let cc = courseColor;

  let p = null;
  if (mm) {
    p = computeOverallPct(mm);
  }
  let lg = getLetterGrade(p);
  let bg = null;
  if (lg) {
    bg = lg[0];
  }
  let tc = cc;
  if (bg) {
    tc = GRADE_TIERS[bg].color;
  }
  let tgw = "rgba(26,120,255,.1)";
  if (bg) {
    tgw = GRADE_TIERS[bg].glow;
  }
  let hd = false;
  if (p !== null) {
    hd = true;
  }

  let barsty = { background: "linear-gradient(180deg,#a78bfa,#c4b5fd)" };
  if (sc) {
    barsty.background = "linear-gradient(180deg," + tc + "," + tc + "55)";
  }

  let sub = "Select a course";
  if (sc) {
    sub = "Current standing";
  }

  let bod = null;
  if (!sc) {
    bod = (
      <div className="fg-na">
        <span className="fg-na-symbol">—</span>
        <span className="fg-na-label">No course selected</span>
      </div>
    );
  } else {
    if (!hd) {
      bod = (
        <div className="fg-na">
          <span className="fg-na-symbol">N/A</span>
          <span className="fg-na-label">No marks yet</span>
        </div>
      );
    } else {
      let ge = "0.0";
      if (p >= 97) {
        ge = "4.0";
      } else if (p >= 93) {
        ge = "4.0";
      } else if (p >= 90) {
        ge = "3.7";
      } else if (p >= 87) {
        ge = "3.3";
      } else if (p >= 83) {
        ge = "3.0";
      } else if (p >= 80) {
        ge = "2.7";
      } else if (p >= 77) {
        ge = "2.3";
      } else if (p >= 73) {
        ge = "2.0";
      } else if (p >= 70) {
        ge = "1.7";
      } else if (p >= 67) {
        ge = "1.3";
      } else if (p >= 63) {
        ge = "1.0";
      } else if (p >= 60) {
        ge = "0.7";
      }

      bod = (
        <div className="fg-display">
          <div className="fg-ring" style={{ borderColor: tc + "44", boxShadow: "0 0 40px " + tgw }}>
            <div className="fg-ring-inner" style={{ background: tc + "0d" }}>
              <span className="fg-letter" style={{ color: tc }}>{lg}</span>
            </div>
          </div>
          <div className="fg-pct" style={{ color: tc }}>{p}%</div>
          <div className="fg-gpa-row">
            <span className="fg-gpa-label">GPA equiv.</span>
            <span className="fg-gpa-val" style={{ color: tc }}>{ge}</span>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="fg-card">
      <div className="mrk-card-hd">
        <div className="mrk-card-title-wrap">
          <div className="mrk-card-bar" style={barsty} />
          <div>
            <div className="mrk-card-title">Final Grade</div>
            <div className="mrk-card-sub">{sub}</div>
          </div>
        </div>
      </div>
      <div className="fg-body">
        {bod}
      </div>
    </div>
  );
}