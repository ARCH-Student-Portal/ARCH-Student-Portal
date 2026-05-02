// Create src/data/studentDashData.js

export const courses = [
  { color: "#1a78ff", name: "Object Oriented Analysis & Design", code: "CS-3001 · 3 Cr · Sec A", grade: "A",  gc: "g-a" },
  { color: "#40a9ff", name: "Data Structures & Algorithms",      code: "CS-2010 · 3 Cr · Sec B", grade: "B+", gc: "g-b" },
  { color: "#69c0ff", name: "Database Systems",                  code: "CS-2012 · 3 Cr · Sec A", grade: "A-", gc: "g-a" },
  { color: "#91d5ff", name: "Calculus & Analytical Geometry",    code: "MT-1001 · 3 Cr · Sec C", grade: "B",  gc: "g-b" },
  { color: "#ff4d6a", name: "Programming Fundamentals",          code: "CS-1001 · 3 Cr · Sec D", grade: "C+", gc: "g-c" },
];

export const notices = [
  { tag: "Urgent",     cls: "nt-urg", title: "Mid-Term Examination Schedule Published",  date: "2025-03-18",              fire: true  },
  { tag: "Faculty",    cls: "nt-fac", title: "OOAD Assignment 2 Deadline Extended",       date: "2025-03-16 · Hamza Raheel", fire: false },
  { tag: "University", cls: "nt-uni", title: "Campus Closure — Eid-ul-Fitr Holiday",      date: "2025-03-14",              fire: false },
];

export const attendances = [
  { pct: "88%", label: "OOAD",   good: true  },
  { pct: "72%", label: "DSA",    good: false },
  { pct: "92%", label: "DB Sys", good: true  },
];