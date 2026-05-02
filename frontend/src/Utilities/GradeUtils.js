// src/utils/gradeUtils.js

// Icon map for assessment section types
export const SECTION_ICONS = {
  "Quizzes":    "◈",
  "Assignments":"▦",
  "Mid Exam":   "◎",
  "Final Exam": "⊞",
  "Projects":   "◉",
  "Lab Work":   "⬡",
};

// Grade boundary definitions
export const GRADE_TIERS = {
  A: { min: 90, label: "A", color: "#1a78ff", glow: "rgba(26,120,255,.22)" },
  B: { min: 80, label: "B", color: "#10b981", glow: "rgba(16,185,129,.22)" },
  C: { min: 70, label: "C", color: "#f59e0b", glow: "rgba(245,158,11,.22)" },
  D: { min: 60, label: "D", color: "#f97316", glow: "rgba(249,115,22,.22)" },
  F: { min: 0,  label: "F", color: "#ef4444", glow: "rgba(239,68,68,.22)"  },
};

export const GRADE_VARIANTS = {
  A: [{ label: "A+", min: 97, desc: "Outstanding" }, { label: "A",  min: 93, desc: "Excellent"    }, { label: "A−", min: 90, desc: "Very Good"    }],
  B: [{ label: "B+", min: 87, desc: "Good"        }, { label: "B",  min: 83, desc: "Above Avg"    }, { label: "B−", min: 80, desc: "Satisfactory" }],
  C: [{ label: "C+", min: 77, desc: "Average"     }, { label: "C",  min: 73, desc: "Below Avg"    }, { label: "C−", min: 70, desc: "Passing"      }],
  D: [{ label: "D+", min: 67, desc: "Weak"        }, { label: "D",  min: 63, desc: "Poor"         }, { label: "D−", min: 60, desc: "Borderline"   }],
};

export const GRADE_ORDER = ["A", "B", "C", "D", "F"];

// Returns all section keys for a course code, or []
export function getSectionKeys(courseCode, marksData) {
  const d = marksData[courseCode];
  return d ? Object.keys(d.sections) : [];
}

// Computes overall percentage from a marksMeta object, or null if no data
export function computeOverallPct(marksMeta) {
  if (!marksMeta?.sections) return null;
  const sections = Object.values(marksMeta.sections);
  if (!sections.length) return null;
  let totalMarks = 0, totalMax = 0;
  for (const sec of sections) {
    for (const entry of sec.entries) totalMarks += entry.marks;
    totalMax += sec.total;
  }
  return totalMax === 0 ? null : Math.round((totalMarks / totalMax) * 100);
}

// Maps a percentage to a letter grade string, or null
export function getLetterGrade(pct) {
  if (pct == null) return null;
  if (pct >= 97) return "A+";
  if (pct >= 93) return "A";
  if (pct >= 90) return "A−";
  if (pct >= 87) return "B+";
  if (pct >= 83) return "B";
  if (pct >= 80) return "B−";
  if (pct >= 77) return "C+";
  if (pct >= 73) return "C";
  if (pct >= 70) return "C−";
  if (pct >= 67) return "D+";
  if (pct >= 63) return "D";
  if (pct >= 60) return "D−";
  return "F";
}