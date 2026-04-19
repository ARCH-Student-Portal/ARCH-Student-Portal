import { createContext, useContext, useState } from "react";

// ── TIME SLOTS (shared reference so clashes are data-driven) ─────────────────
export const TIME_SLOTS = {
  A: "Mon/Wed 08:00 AM",
  B: "Mon/Wed 09:30 AM",
  C: "Mon/Wed 11:00 AM",
  D: "Mon/Wed 12:30 PM",
  E: "Mon/Wed 02:00 PM",
  F: "Tue/Thu 08:00 AM",
  G: "Tue/Thu 09:30 AM",
  H: "Tue/Thu 11:00 AM",
  I: "Tue/Thu 12:30 PM",
  J: "Tue/Thu 02:00 PM",
  K: "Fri 08:00 AM",
  L: "Fri 10:00 AM",
  M: "Fri 12:00 PM",
};

// ── DEFAULT ENROLLED ─────────────────────────────────────────────────────────
const DEFAULT_ENROLLED = [
  { id: "e1", code: "CS-3001", name: "Object Oriented Analysis & Design", prof: "Hamza Raheel", credits: 3, price: 45000, slot: "A", time: TIME_SLOTS["A"], mandatory: true  },
  { id: "e2", code: "CS-2012", name: "Database Systems",                  prof: "Dr. Ayesha",   credits: 4, price: 60000, slot: "F", time: TIME_SLOTS["F"], mandatory: true  },
  { id: "e3", code: "MT-2005", name: "Probability & Statistics",          prof: "Dr. Kamran",   credits: 3, price: 45000, slot: "C", time: TIME_SLOTS["C"], mandatory: false },
];

// ── AVAILABLE COURSE POOL ────────────────────────────────────────────────────
const DEFAULT_AVAILABLE = [
  // CS Core
  { id: "a01", code: "CS-3005", name: "Web Programming",                  prof: "Usman Ali",      credits: 3, price: 45000, slot: "B", time: TIME_SLOTS["B"], seats: 42, maxSeats: 50, mandatory: false },
  { id: "a02", code: "CS-3004", name: "Artificial Intelligence",           prof: "Dr. Zafar",      credits: 4, price: 60000, slot: "G", time: TIME_SLOTS["G"], seats: 48, maxSeats: 50, mandatory: false },
  { id: "a03", code: "CS-3010", name: "Software Engineering",              prof: "Dr. Noman",      credits: 3, price: 45000, slot: "D", time: TIME_SLOTS["D"], seats: 35, maxSeats: 45, mandatory: false },
  { id: "a04", code: "CS-3012", name: "Computer Networks",                 prof: "Dr. Shahid",     credits: 3, price: 45000, slot: "H", time: TIME_SLOTS["H"], seats: 30, maxSeats: 45, mandatory: false },
  { id: "a05", code: "CS-3015", name: "Operating Systems",                 prof: "Dr. Imran",      credits: 3, price: 45000, slot: "E", time: TIME_SLOTS["E"], seats: 28, maxSeats: 40, mandatory: false },
  { id: "a06", code: "CS-4001", name: "Data Science",                      prof: "Dr. Fatima",     credits: 4, price: 60000, slot: "I", time: TIME_SLOTS["I"], seats: 10, maxSeats: 50, req: "CS-2012", mandatory: false },
  { id: "a07", code: "CS-4005", name: "Machine Learning",                  prof: "Dr. Raza",       credits: 4, price: 60000, slot: "J", time: TIME_SLOTS["J"], seats: 22, maxSeats: 35, req: "MT-2005", mandatory: false },
  { id: "a08", code: "CS-4010", name: "Deep Learning",                     prof: "Dr. Hassan",     credits: 3, price: 45000, slot: "K", time: TIME_SLOTS["K"], seats: 18, maxSeats: 30, req: "CS-4005", mandatory: false },
  { id: "a09", code: "CS-4015", name: "Computer Vision",                   prof: "Dr. Sadia",      credits: 3, price: 45000, slot: "L", time: TIME_SLOTS["L"], seats: 14, maxSeats: 30, req: "CS-4005", mandatory: false },
  { id: "a10", code: "CS-4020", name: "Natural Language Processing",       prof: "Dr. Bilal",      credits: 3, price: 45000, slot: "B", time: TIME_SLOTS["B"], seats: 20, maxSeats: 35, req: "CS-4005", mandatory: false },
  { id: "a11", code: "CS-3020", name: "Information Security",              prof: "Engr. Tariq",    credits: 3, price: 45000, slot: "C", time: TIME_SLOTS["C"], seats: 33, maxSeats: 45, mandatory: false },
  { id: "a12", code: "CS-3025", name: "Cloud Computing",                   prof: "Dr. Waseem",     credits: 3, price: 45000, slot: "G", time: TIME_SLOTS["G"], seats: 25, maxSeats: 40, mandatory: false },
  { id: "a13", code: "CS-3030", name: "Mobile Application Development",    prof: "Usman Ali",      credits: 3, price: 45000, slot: "D", time: TIME_SLOTS["D"], seats: 38, maxSeats: 45, mandatory: false },
  { id: "a14", code: "CS-3035", name: "Human Computer Interaction",        prof: "Ms. Amna",       credits: 3, price: 45000, slot: "M", time: TIME_SLOTS["M"], seats: 40, maxSeats: 50, mandatory: false },
  { id: "a15", code: "CS-4025", name: "Blockchain Technology",             prof: "Dr. Qasim",      credits: 3, price: 45000, slot: "H", time: TIME_SLOTS["H"], seats: 15, maxSeats: 30, mandatory: false },
  { id: "a16", code: "CS-4030", name: "DevOps & Agile Practices",          prof: "Engr. Salman",   credits: 3, price: 45000, slot: "E", time: TIME_SLOTS["E"], seats: 27, maxSeats: 40, mandatory: false },
  { id: "a17", code: "CS-4035", name: "Distributed Systems",               prof: "Dr. Shahid",     credits: 4, price: 60000, slot: "I", time: TIME_SLOTS["I"], seats: 12, maxSeats: 30, req: "CS-3012", mandatory: false },
  { id: "a18", code: "CS-3040", name: "Compiler Construction",             prof: "Dr. Noman",      credits: 3, price: 45000, slot: "A", time: TIME_SLOTS["A"], seats: 20, maxSeats: 35, mandatory: false },
  { id: "a19", code: "CS-3045", name: "Theory of Automata",                prof: "Dr. Kamil",      credits: 3, price: 45000, slot: "F", time: TIME_SLOTS["F"], seats: 31, maxSeats: 40, mandatory: false },
  { id: "a20", code: "CS-3050", name: "Design & Analysis of Algorithms",   prof: "Dr. Ayesha",     credits: 3, price: 45000, slot: "J", time: TIME_SLOTS["J"], seats: 29, maxSeats: 40, mandatory: false },

  // EE / Hardware
  { id: "a21", code: "EE-2003", name: "Digital Logic Design",              prof: "Engr. Bilal",    credits: 3, price: 45000, slot: "B", time: TIME_SLOTS["B"], seats: 15, maxSeats: 40, mandatory: false },
  { id: "a22", code: "EE-3001", name: "Microprocessor Systems",            prof: "Engr. Naeem",    credits: 3, price: 45000, slot: "L", time: TIME_SLOTS["L"], seats: 22, maxSeats: 35, mandatory: false },
  { id: "a23", code: "EE-3005", name: "Embedded Systems",                  prof: "Dr. Khalid",     credits: 4, price: 60000, slot: "K", time: TIME_SLOTS["K"], seats: 18, maxSeats: 30, req: "EE-2003", mandatory: false },

  // Math / Sciences
  { id: "a24", code: "MT-3001", name: "Linear Algebra",                    prof: "Dr. Sara",       credits: 3, price: 45000, slot: "G", time: TIME_SLOTS["G"], seats: 44, maxSeats: 50, mandatory: false },
  { id: "a25", code: "MT-3005", name: "Numerical Methods",                 prof: "Dr. Asif",       credits: 3, price: 45000, slot: "C", time: TIME_SLOTS["C"], seats: 36, maxSeats: 45, mandatory: false },
  { id: "a26", code: "MT-4001", name: "Discrete Mathematics",              prof: "Dr. Rehman",     credits: 3, price: 45000, slot: "M", time: TIME_SLOTS["M"], seats: 30, maxSeats: 45, mandatory: false },
  { id: "a27", code: "SS-2001", name: "Technical & Business Writing",      prof: "Ms. Hira",       credits: 2, price: 30000, slot: "L", time: TIME_SLOTS["L"], seats: 48, maxSeats: 60, mandatory: false },
  { id: "a28", code: "HU-3001", name: "Engineering Ethics & Management",   prof: "Mr. Farhan",     credits: 2, price: 30000, slot: "M", time: TIME_SLOTS["M"], seats: 50, maxSeats: 60, mandatory: false },

  // IS / Management
  { id: "a29", code: "IS-3001", name: "Enterprise Resource Planning",      prof: "Dr. Huma",       credits: 3, price: 45000, slot: "D", time: TIME_SLOTS["D"], seats: 20, maxSeats: 35, mandatory: false },
  { id: "a30", code: "IS-3005", name: "E-Commerce Systems",                prof: "Dr. Shafiq",     credits: 3, price: 45000, slot: "E", time: TIME_SLOTS["E"], seats: 25, maxSeats: 40, mandatory: false },
];

// ── MARKS DATA ───────────────────────────────────────────────────────────────
export const MARKS_DATA = {
  // ── Enrolled by default — full marks ────────────────────────────────────
  "CS-3001": {
    color: "#7c3aed", bg: "rgba(124,58,237,.07)", border: "rgba(124,58,237,.26)",
    sections: {
      Quizzes:      { total: 10, entries: [{ label:"Q1", marks:8,  max:10 },{ label:"Q2", marks:7,  max:10 }], avg:6.5, classMax:10, classMin:3  },
      Assignments:  { total: 10, entries: [{ label:"A1", marks:9,  max:10 }],                                  avg:7.0, classMax:10, classMin:4  },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:22, max:30 }],                               avg:19,  classMax:28, classMin:8  },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:31, max:40 }],                               avg:25,  classMax:37, classMin:10 },
      Projects:     { total: 25, entries: [{ label:"P1 — UML", marks:22, max:25 }],                            avg:18,  classMax:25, classMin:9  },
    },
  },
  "CS-2012": {
    color: "#f59e0b", bg: "rgba(245,158,11,.07)", border: "rgba(245,158,11,.28)",
    sections: {
      Quizzes:      { total: 10, entries: [{ label:"Q1", marks:7,  max:10 },{ label:"Q2", marks:6,  max:10 }], avg:6.8, classMax:10, classMin:3  },
      Assignments:  { total: 10, entries: [{ label:"A1", marks:9,  max:10 },{ label:"A2", marks:7,  max:10 }], avg:7.5, classMax:10, classMin:5  },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:22, max:30 }],                               avg:20,  classMax:28, classMin:9  },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:31, max:40 }],                               avg:26,  classMax:36, classMin:11 },
      Projects:     { total: 20, entries: [{ label:"P1 — Schema", marks:18, max:20 }],                         avg:14,  classMax:20, classMin:7  },
      "Lab Work":   { total: 50, entries: [{ label:"Lab 1", marks:10, max:10 },{ label:"Lab 2", marks:9, max:10 },{ label:"Lab 3", marks:8, max:10 }], avg:35, classMax:50, classMin:18 },
    },
  },
  "MT-2005": {
    color: "#0ea5e9", bg: "rgba(14,165,233,.07)", border: "rgba(14,165,233,.26)",
    sections: {
      Quizzes:      { total: 10, entries: [{ label:"Q1", marks:9,  max:10 },{ label:"Q2", marks:8,  max:10 }], avg:7.5, classMax:10, classMin:5  },
      Assignments:  { total: 10, entries: [{ label:"A1", marks:8,  max:10 }],                                  avg:7.2, classMax:10, classMin:4  },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:26, max:30 }],                               avg:22,  classMax:30, classMin:11 },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:35, max:40 }],                               avg:27,  classMax:39, classMin:14 },
      Projects:     { total: 30, entries: [{ label:"P1", marks:26, max:30 }],                                  avg:22,  classMax:30, classMin:10 },
    },
  },

  // ── CS Core ──────────────────────────────────────────────────────────────
  "CS-3005": {
    color: "#10b981", bg: "rgba(16,185,129,.07)", border: "rgba(16,185,129,.26)",
    sections: {
      Quizzes:      { total: 10, entries: [{ label:"Q1", marks:7, max:10 },{ label:"Q2", marks:8, max:10 }], avg:6.8, classMax:10, classMin:2 },
      Assignments:  { total: 10, entries: [{ label:"A1", marks:9, max:10 },{ label:"A2", marks:8, max:10 }], avg:7.5, classMax:10, classMin:4 },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:20, max:30 }],                             avg:18,  classMax:27, classMin:7  },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:29, max:40 }],                             avg:24,  classMax:36, classMin:9  },
      Projects:     { total: 20, entries: [{ label:"P1 — Portfolio Site", marks:17, max:20 }],               avg:14,  classMax:20, classMin:6  },
    },
  },
  "CS-3004": {
    color: "#1a78ff", bg: "rgba(26,120,255,.08)", border: "rgba(26,120,255,.28)",
    sections: {
      Quizzes:      { total: 10, entries: [{ label:"Q1", marks:6, max:10 },{ label:"Q2", marks:7, max:10 }], avg:6.2, classMax:10, classMin:2 },
      Assignments:  { total: 10, entries: [{ label:"A1", marks:8, max:10 }],                                  avg:7.0, classMax:10, classMin:3 },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:21, max:30 }],                              avg:17,  classMax:26, classMin:6  },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:30, max:40 }],                              avg:23,  classMax:35, classMin:8  },
      Projects:     { total: 30, entries: [{ label:"P1 — Search Agent", marks:24, max:30 }],                  avg:19,  classMax:28, classMin:8  },
    },
  },
  "CS-3010": {
    color: "#f97316", bg: "rgba(249,115,22,.07)", border: "rgba(249,115,22,.26)",
    sections: {
      Quizzes:      { total: 10, entries: [{ label:"Q1", marks:8, max:10 },{ label:"Q2", marks:7, max:10 }], avg:6.5, classMax:10, classMin:3 },
      Assignments:  { total: 10, entries: [{ label:"A1", marks:7, max:10 },{ label:"A2", marks:9, max:10 }], avg:7.2, classMax:10, classMin:4 },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:23, max:30 }],                              avg:19,  classMax:27, classMin:8  },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:32, max:40 }],                              avg:25,  classMax:37, classMin:10 },
      Projects:     { total: 25, entries: [{ label:"P1 — SRS Doc", marks:20, max:25 }],                       avg:17,  classMax:24, classMin:7  },
    },
  },
  "CS-3012": {
    color: "#06b6d4", bg: "rgba(6,182,212,.07)", border: "rgba(6,182,212,.26)",
    sections: {
      Quizzes:      { total: 10, entries: [{ label:"Q1", marks:7, max:10 },{ label:"Q2", marks:6, max:10 }], avg:6.0, classMax:10, classMin:2 },
      Assignments:  { total: 10, entries: [{ label:"A1", marks:8, max:10 }],                                  avg:6.8, classMax:10, classMin:3 },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:19, max:30 }],                              avg:16,  classMax:25, classMin:5  },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:27, max:40 }],                              avg:22,  classMax:34, classMin:8  },
      "Lab Work":   { total: 30, entries: [{ label:"Lab 1", marks:9, max:10 },{ label:"Lab 2", marks:8, max:10 },{ label:"Lab 3", marks:7, max:10 }], avg:22, classMax:30, classMin:10 },
    },
  },
  "CS-3015": {
    color: "#84cc16", bg: "rgba(132,204,22,.07)", border: "rgba(132,204,22,.26)",
    sections: {
      Quizzes:      { total: 10, entries: [{ label:"Q1", marks:9, max:10 },{ label:"Q2", marks:7, max:10 }], avg:7.0, classMax:10, classMin:3 },
      Assignments:  { total: 10, entries: [{ label:"A1", marks:8, max:10 },{ label:"A2", marks:7, max:10 }], avg:7.3, classMax:10, classMin:4 },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:24, max:30 }],                              avg:20,  classMax:28, classMin:9  },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:33, max:40 }],                              avg:26,  classMax:37, classMin:11 },
      "Lab Work":   { total: 40, entries: [{ label:"Lab 1", marks:9, max:10 },{ label:"Lab 2", marks:10, max:10 },{ label:"Lab 3", marks:8, max:10 },{ label:"Lab 4", marks:9, max:10 }], avg:30, classMax:40, classMin:14 },
    },
  },
  "CS-4001": {
    color: "#8b5cf6", bg: "rgba(139,92,246,.07)", border: "rgba(139,92,246,.26)",
    sections: {
      Quizzes:      { total: 10, entries: [{ label:"Q1", marks:6, max:10 },{ label:"Q2", marks:7, max:10 }], avg:6.0, classMax:10, classMin:2 },
      Assignments:  { total: 10, entries: [{ label:"A1", marks:8, max:10 },{ label:"A2", marks:7, max:10 }], avg:7.0, classMax:10, classMin:3 },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:20, max:30 }],                              avg:17,  classMax:26, classMin:6  },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:29, max:40 }],                              avg:23,  classMax:35, classMin:9  },
      Projects:     { total: 30, entries: [{ label:"P1 — EDA Report", marks:25, max:30 }],                    avg:20,  classMax:29, classMin:9  },
    },
  },
  "CS-4005": {
    color: "#ec4899", bg: "rgba(236,72,153,.07)", border: "rgba(236,72,153,.26)",
    sections: {
      Quizzes:      { total: 10, entries: [{ label:"Q1", marks:7, max:10 },{ label:"Q2", marks:8, max:10 }], avg:6.5, classMax:10, classMin:3 },
      Assignments:  { total: 10, entries: [{ label:"A1", marks:9, max:10 }],                                  avg:7.5, classMax:10, classMin:4 },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:22, max:30 }],                              avg:18,  classMax:27, classMin:7  },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:31, max:40 }],                              avg:24,  classMax:36, classMin:10 },
      Projects:     { total: 30, entries: [{ label:"P1 — Regression Model", marks:26, max:30 }],              avg:21,  classMax:29, classMin:9  },
    },
  },
  "CS-4010": {
    color: "#f43f5e", bg: "rgba(244,63,94,.07)", border: "rgba(244,63,94,.26)",
    sections: {
      Quizzes:      { total: 10, entries: [{ label:"Q1", marks:6, max:10 },{ label:"Q2", marks:7, max:10 }], avg:5.8, classMax:10, classMin:2 },
      Assignments:  { total: 10, entries: [{ label:"A1", marks:8, max:10 }],                                  avg:6.5, classMax:10, classMin:3 },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:19, max:30 }],                              avg:16,  classMax:24, classMin:5  },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:28, max:40 }],                              avg:22,  classMax:33, classMin:8  },
      Projects:     { total: 30, entries: [{ label:"P1 — CNN Classifier", marks:24, max:30 }],                avg:19,  classMax:28, classMin:8  },
    },
  },
  "CS-4015": {
    color: "#a855f7", bg: "rgba(168,85,247,.07)", border: "rgba(168,85,247,.26)",
    sections: {
      Quizzes:      { total: 10, entries: [{ label:"Q1", marks:7, max:10 },{ label:"Q2", marks:6, max:10 }], avg:6.0, classMax:10, classMin:2 },
      Assignments:  { total: 10, entries: [{ label:"A1", marks:8, max:10 }],                                  avg:6.8, classMax:10, classMin:3 },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:20, max:30 }],                              avg:16,  classMax:25, classMin:5  },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:29, max:40 }],                              avg:22,  classMax:34, classMin:8  },
      Projects:     { total: 30, entries: [{ label:"P1 — Object Detector", marks:25, max:30 }],               avg:20,  classMax:28, classMin:7  },
    },
  },
  "CS-4020": {
    color: "#14b8a6", bg: "rgba(20,184,166,.07)", border: "rgba(20,184,166,.26)",
    sections: {
      Quizzes:      { total: 10, entries: [{ label:"Q1", marks:8, max:10 },{ label:"Q2", marks:7, max:10 }], avg:6.5, classMax:10, classMin:3 },
      Assignments:  { total: 10, entries: [{ label:"A1", marks:9, max:10 }],                                  avg:7.2, classMax:10, classMin:4 },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:22, max:30 }],                              avg:18,  classMax:27, classMin:7  },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:31, max:40 }],                              avg:24,  classMax:36, classMin:9  },
      Projects:     { total: 30, entries: [{ label:"P1 — Sentiment Analyzer", marks:27, max:30 }],            avg:21,  classMax:29, classMin:8  },
    },
  },
  "CS-3020": {
    color: "#ef4444", bg: "rgba(239,68,68,.07)", border: "rgba(239,68,68,.26)",
    sections: {
      Quizzes:      { total: 10, entries: [{ label:"Q1", marks:7, max:10 },{ label:"Q2", marks:8, max:10 }], avg:6.8, classMax:10, classMin:3 },
      Assignments:  { total: 10, entries: [{ label:"A1", marks:9, max:10 },{ label:"A2", marks:8, max:10 }], avg:7.5, classMax:10, classMin:4 },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:23, max:30 }],                              avg:19,  classMax:27, classMin:8  },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:31, max:40 }],                              avg:25,  classMax:36, classMin:10 },
      Projects:     { total: 20, entries: [{ label:"P1 — Pen Test Report", marks:16, max:20 }],               avg:13,  classMax:19, classMin:5  },
    },
  },
  "CS-3025": {
    color: "#3b82f6", bg: "rgba(59,130,246,.07)", border: "rgba(59,130,246,.26)",
    sections: {
      Quizzes:      { total: 10, entries: [{ label:"Q1", marks:8, max:10 },{ label:"Q2", marks:7, max:10 }], avg:6.5, classMax:10, classMin:2 },
      Assignments:  { total: 10, entries: [{ label:"A1", marks:8, max:10 }],                                  avg:7.0, classMax:10, classMin:3 },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:21, max:30 }],                              avg:17,  classMax:26, classMin:6  },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:30, max:40 }],                              avg:23,  classMax:35, classMin:9  },
      Projects:     { total: 25, entries: [{ label:"P1 — AWS Deployment", marks:21, max:25 }],                avg:17,  classMax:24, classMin:6  },
    },
  },
  "CS-3030": {
    color: "#22c55e", bg: "rgba(34,197,94,.07)", border: "rgba(34,197,94,.26)",
    sections: {
      Quizzes:      { total: 10, entries: [{ label:"Q1", marks:9, max:10 },{ label:"Q2", marks:8, max:10 }], avg:7.2, classMax:10, classMin:4 },
      Assignments:  { total: 10, entries: [{ label:"A1", marks:8, max:10 },{ label:"A2", marks:9, max:10 }], avg:7.8, classMax:10, classMin:5 },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:24, max:30 }],                              avg:20,  classMax:28, classMin:9  },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:33, max:40 }],                              avg:26,  classMax:37, classMin:11 },
      Projects:     { total: 30, entries: [{ label:"P1 — Flutter App", marks:26, max:30 }],                   avg:21,  classMax:29, classMin:9  },
    },
  },
  "CS-3035": {
    color: "#f59e0b", bg: "rgba(245,158,11,.07)", border: "rgba(245,158,11,.26)",
    sections: {
      Quizzes:      { total: 10, entries: [{ label:"Q1", marks:7, max:10 },{ label:"Q2", marks:8, max:10 }], avg:6.5, classMax:10, classMin:3 },
      Assignments:  { total: 10, entries: [{ label:"A1", marks:9, max:10 }],                                  avg:7.0, classMax:10, classMin:4 },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:22, max:30 }],                              avg:18,  classMax:27, classMin:7  },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:30, max:40 }],                              avg:24,  classMax:35, classMin:9  },
      Projects:     { total: 20, entries: [{ label:"P1 — Usability Study", marks:17, max:20 }],               avg:14,  classMax:19, classMin:6  },
    },
  },
  "CS-4025": {
    color: "#6366f1", bg: "rgba(99,102,241,.07)", border: "rgba(99,102,241,.26)",
    sections: {
      Quizzes:      { total: 10, entries: [{ label:"Q1", marks:6, max:10 },{ label:"Q2", marks:7, max:10 }], avg:5.5, classMax:10, classMin:2 },
      Assignments:  { total: 10, entries: [{ label:"A1", marks:7, max:10 }],                                  avg:6.5, classMax:10, classMin:3 },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:18, max:30 }],                              avg:15,  classMax:24, classMin:5  },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:27, max:40 }],                              avg:21,  classMax:33, classMin:8  },
      Projects:     { total: 30, entries: [{ label:"P1 — Smart Contract", marks:24, max:30 }],                avg:18,  classMax:28, classMin:7  },
    },
  },
  "CS-4030": {
    color: "#0ea5e9", bg: "rgba(14,165,233,.07)", border: "rgba(14,165,233,.26)",
    sections: {
      Quizzes:      { total: 10, entries: [{ label:"Q1", marks:8, max:10 },{ label:"Q2", marks:7, max:10 }], avg:6.8, classMax:10, classMin:3 },
      Assignments:  { total: 10, entries: [{ label:"A1", marks:9, max:10 },{ label:"A2", marks:8, max:10 }], avg:7.5, classMax:10, classMin:4 },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:22, max:30 }],                              avg:18,  classMax:27, classMin:7  },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:31, max:40 }],                              avg:25,  classMax:36, classMin:10 },
      Projects:     { total: 20, entries: [{ label:"P1 — CI/CD Pipeline", marks:18, max:20 }],                avg:14,  classMax:20, classMin:6  },
    },
  },
  "CS-4035": {
    color: "#d946ef", bg: "rgba(217,70,239,.07)", border: "rgba(217,70,239,.26)",
    sections: {
      Quizzes:      { total: 10, entries: [{ label:"Q1", marks:7, max:10 },{ label:"Q2", marks:6, max:10 }], avg:5.8, classMax:10, classMin:2 },
      Assignments:  { total: 10, entries: [{ label:"A1", marks:8, max:10 }],                                  avg:6.5, classMax:10, classMin:3 },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:19, max:30 }],                              avg:15,  classMax:24, classMin:5  },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:28, max:40 }],                              avg:21,  classMax:33, classMin:7  },
      Projects:     { total: 30, entries: [{ label:"P1 — Distributed KV Store", marks:25, max:30 }],          avg:19,  classMax:28, classMin:8  },
    },
  },
  "CS-3040": {
    color: "#fb923c", bg: "rgba(251,146,60,.07)", border: "rgba(251,146,60,.26)",
    sections: {
      Quizzes:      { total: 10, entries: [{ label:"Q1", marks:7, max:10 },{ label:"Q2", marks:8, max:10 }], avg:6.2, classMax:10, classMin:2 },
      Assignments:  { total: 10, entries: [{ label:"A1", marks:8, max:10 },{ label:"A2", marks:7, max:10 }], avg:7.0, classMax:10, classMin:3 },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:20, max:30 }],                              avg:16,  classMax:25, classMin:5  },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:28, max:40 }],                              avg:22,  classMax:34, classMin:8  },
      Projects:     { total: 25, entries: [{ label:"P1 — Mini Compiler", marks:21, max:25 }],                 avg:17,  classMax:23, classMin:7  },
    },
  },
  "CS-3045": {
    color: "#4ade80", bg: "rgba(74,222,128,.07)", border: "rgba(74,222,128,.26)",
    sections: {
      Quizzes:      { total: 10, entries: [{ label:"Q1", marks:8, max:10 },{ label:"Q2", marks:7, max:10 }], avg:6.5, classMax:10, classMin:3 },
      Assignments:  { total: 10, entries: [{ label:"A1", marks:7, max:10 }],                                  avg:6.8, classMax:10, classMin:3 },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:21, max:30 }],                              avg:17,  classMax:26, classMin:6  },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:29, max:40 }],                              avg:22,  classMax:35, classMin:8  },
      Projects:     { total: 20, entries: [{ label:"P1 — DFA/NFA Simulator", marks:17, max:20 }],             avg:13,  classMax:19, classMin:5  },
    },
  },
  "CS-3050": {
    color: "#38bdf8", bg: "rgba(56,189,248,.07)", border: "rgba(56,189,248,.26)",
    sections: {
      Quizzes:      { total: 10, entries: [{ label:"Q1", marks:9, max:10 },{ label:"Q2", marks:8, max:10 }], avg:7.0, classMax:10, classMin:3 },
      Assignments:  { total: 10, entries: [{ label:"A1", marks:8, max:10 },{ label:"A2", marks:9, max:10 }], avg:7.5, classMax:10, classMin:4 },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:24, max:30 }],                              avg:20,  classMax:28, classMin:9  },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:33, max:40 }],                              avg:26,  classMax:37, classMin:11 },
      Projects:     { total: 20, entries: [{ label:"P1 — Algorithm Analysis", marks:17, max:20 }],            avg:14,  classMax:19, classMin:6  },
    },
  },

  // ── EE / Hardware ─────────────────────────────────────────────────────────
  "EE-2003": {
    color: "#ef4444", bg: "rgba(239,68,68,.07)", border: "rgba(239,68,68,.26)",
    sections: {
      Quizzes:      { total: 10, entries: [{ label:"Q1", marks:7, max:10 },{ label:"Q2", marks:6, max:10 }], avg:6.0, classMax:10, classMin:2 },
      Assignments:  { total: 10, entries: [{ label:"A1", marks:8, max:10 }],                                  avg:6.8, classMax:10, classMin:3 },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:19, max:30 }],                              avg:16,  classMax:25, classMin:5  },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:27, max:40 }],                              avg:21,  classMax:33, classMin:7  },
      "Lab Work":   { total: 30, entries: [{ label:"Lab 1", marks:8, max:10 },{ label:"Lab 2", marks:9, max:10 },{ label:"Lab 3", marks:7, max:10 }], avg:20, classMax:30, classMin:9 },
    },
  },
  "EE-3001": {
    color: "#f97316", bg: "rgba(249,115,22,.07)", border: "rgba(249,115,22,.26)",
    sections: {
      Quizzes:      { total: 10, entries: [{ label:"Q1", marks:7, max:10 },{ label:"Q2", marks:8, max:10 }], avg:6.5, classMax:10, classMin:3 },
      Assignments:  { total: 10, entries: [{ label:"A1", marks:8, max:10 }],                                  avg:7.0, classMax:10, classMin:3 },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:20, max:30 }],                              avg:17,  classMax:26, classMin:6  },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:28, max:40 }],                              avg:22,  classMax:34, classMin:8  },
      "Lab Work":   { total: 30, entries: [{ label:"Lab 1", marks:9, max:10 },{ label:"Lab 2", marks:8, max:10 },{ label:"Lab 3", marks:9, max:10 }], avg:23, classMax:30, classMin:11 },
    },
  },
  "EE-3005": {
    color: "#eab308", bg: "rgba(234,179,8,.07)", border: "rgba(234,179,8,.26)",
    sections: {
      Quizzes:      { total: 10, entries: [{ label:"Q1", marks:6, max:10 },{ label:"Q2", marks:7, max:10 }], avg:5.8, classMax:10, classMin:2 },
      Assignments:  { total: 10, entries: [{ label:"A1", marks:8, max:10 }],                                  avg:6.5, classMax:10, classMin:3 },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:18, max:30 }],                              avg:15,  classMax:24, classMin:5  },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:26, max:40 }],                              avg:20,  classMax:32, classMin:7  },
      "Lab Work":   { total: 40, entries: [{ label:"Lab 1", marks:9, max:10 },{ label:"Lab 2", marks:8, max:10 },{ label:"Lab 3", marks:7, max:10 },{ label:"Lab 4", marks:9, max:10 }], avg:28, classMax:40, classMin:12 },
    },
  },

  // ── Math / Sciences ───────────────────────────────────────────────────────
  "MT-3001": {
    color: "#06b6d4", bg: "rgba(6,182,212,.07)", border: "rgba(6,182,212,.26)",
    sections: {
      Quizzes:      { total: 10, entries: [{ label:"Q1", marks:9, max:10 },{ label:"Q2", marks:8, max:10 }], avg:7.5, classMax:10, classMin:5 },
      Assignments:  { total: 10, entries: [{ label:"A1", marks:8, max:10 },{ label:"A2", marks:9, max:10 }], avg:7.8, classMax:10, classMin:5 },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:25, max:30 }],                              avg:21,  classMax:29, classMin:10 },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:34, max:40 }],                              avg:27,  classMax:38, classMin:12 },
    },
  },
  "MT-3005": {
    color: "#8b5cf6", bg: "rgba(139,92,246,.07)", border: "rgba(139,92,246,.26)",
    sections: {
      Quizzes:      { total: 10, entries: [{ label:"Q1", marks:7, max:10 },{ label:"Q2", marks:8, max:10 }], avg:6.5, classMax:10, classMin:3 },
      Assignments:  { total: 10, entries: [{ label:"A1", marks:8, max:10 }],                                  avg:7.0, classMax:10, classMin:3 },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:21, max:30 }],                              avg:17,  classMax:27, classMin:6  },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:29, max:40 }],                              avg:23,  classMax:35, classMin:9  },
    },
  },
  "MT-4001": {
    color: "#10b981", bg: "rgba(16,185,129,.07)", border: "rgba(16,185,129,.26)",
    sections: {
      Quizzes:      { total: 10, entries: [{ label:"Q1", marks:8, max:10 },{ label:"Q2", marks:9, max:10 }], avg:7.2, classMax:10, classMin:4 },
      Assignments:  { total: 10, entries: [{ label:"A1", marks:9, max:10 },{ label:"A2", marks:8, max:10 }], avg:7.5, classMax:10, classMin:4 },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:24, max:30 }],                              avg:20,  classMax:28, classMin:9  },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:32, max:40 }],                              avg:25,  classMax:37, classMin:11 },
    },
  },

  // ── SS / HU / IS ──────────────────────────────────────────────────────────
  "SS-2001": {
    color: "#f472b6", bg: "rgba(244,114,182,.07)", border: "rgba(244,114,182,.26)",
    sections: {
      Assignments:  { total: 10, entries: [{ label:"A1", marks:9, max:10 },{ label:"A2", marks:8, max:10 }], avg:7.8, classMax:10, classMin:5 },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:24, max:30 }],                              avg:21,  classMax:28, classMin:10 },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:33, max:40 }],                              avg:27,  classMax:37, classMin:13 },
      Projects:     { total: 20, entries: [{ label:"P1 — Technical Report", marks:18, max:20 }],              avg:15,  classMax:20, classMin:7  },
    },
  },
  "HU-3001": {
    color: "#a78bfa", bg: "rgba(167,139,250,.07)", border: "rgba(167,139,250,.26)",
    sections: {
      Assignments:  { total: 10, entries: [{ label:"A1", marks:8, max:10 }],                                  avg:7.0, classMax:10, classMin:4 },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:22, max:30 }],                              avg:19,  classMax:27, classMin:9  },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:31, max:40 }],                              avg:25,  classMax:36, classMin:11 },
      Projects:     { total: 20, entries: [{ label:"P1 — Case Study", marks:16, max:20 }],                    avg:14,  classMax:19, classMin:6  },
    },
  },
  "IS-3001": {
    color: "#34d399", bg: "rgba(52,211,153,.07)", border: "rgba(52,211,153,.26)",
    sections: {
      Quizzes:      { total: 10, entries: [{ label:"Q1", marks:7, max:10 },{ label:"Q2", marks:8, max:10 }], avg:6.5, classMax:10, classMin:3 },
      Assignments:  { total: 10, entries: [{ label:"A1", marks:8, max:10 }],                                  avg:7.0, classMax:10, classMin:3 },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:21, max:30 }],                              avg:17,  classMax:26, classMin:6  },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:29, max:40 }],                              avg:23,  classMax:34, classMin:9  },
      Projects:     { total: 25, entries: [{ label:"P1 — ERP Implementation", marks:20, max:25 }],            avg:16,  classMax:23, classMin:7  },
    },
  },
  "IS-3005": {
    color: "#60a5fa", bg: "rgba(96,165,250,.07)", border: "rgba(96,165,250,.26)",
    sections: {
      Quizzes:      { total: 10, entries: [{ label:"Q1", marks:8, max:10 },{ label:"Q2", marks:7, max:10 }], avg:6.8, classMax:10, classMin:3 },
      Assignments:  { total: 10, entries: [{ label:"A1", marks:9, max:10 },{ label:"A2", marks:8, max:10 }], avg:7.5, classMax:10, classMin:4 },
      "Mid Exam":   { total: 30, entries: [{ label:"Mid",   marks:22, max:30 }],                              avg:18,  classMax:27, classMin:7  },
      "Final Exam": { total: 40, entries: [{ label:"Final", marks:30, max:40 }],                              avg:24,  classMax:35, classMin:9  },
      Projects:     { total: 20, entries: [{ label:"P1 — E-Store Prototype", marks:17, max:20 }],             avg:14,  classMax:19, classMin:6  },
    },
  },
};

// ── Context ──────────────────────────────────────────────────────────────────
const CourseContext = createContext(null);

export function CourseProvider({ children }) {
  const [enrolled,      setEnrolled]      = useState(DEFAULT_ENROLLED);
  const [availablePool, setAvailablePool] = useState(DEFAULT_AVAILABLE);

  const confirmRegistration = (nextEnrolled, nextAvailable) => {
    setEnrolled(nextEnrolled);
    setAvailablePool(nextAvailable);
  };

  return (
    <CourseContext.Provider value={{ enrolled, availablePool, confirmRegistration }}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error("useCourses must be used inside <CourseProvider>");
  return ctx;
}