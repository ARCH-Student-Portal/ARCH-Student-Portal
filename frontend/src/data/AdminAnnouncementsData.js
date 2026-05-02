// src/data/AdminAnnouncementsData.js
// Move these four constants out of AdminAnnouncements.jsx:


export const TYPE_META = {
  announcement: { icon: "📣", label: "Announcement", color: "#7c3aed", bg: "rgba(124,58,237,.1)", border: "rgba(124,58,237,.3)" },
  exam:         { icon: "📝", label: "Exam",          color: "#ff4d6a", bg: "rgba(255,77,106,.1)", border: "rgba(255,77,106,.3)" },
  assignment:   { icon: "📋", label: "Assignment",    color: "#ff9800", bg: "rgba(255,152,0,.1)",  border: "rgba(255,152,0,.3)"  },
  quiz:         { icon: "✏️", label: "Quiz",          color: "#40a9ff", bg: "rgba(64,169,255,.1)", border: "rgba(64,169,255,.3)" },
};

export const AUDIENCES = ["All Students", "BS-CS", "BS-EE", "BS-IS", "BS-MT", "BS-BBA", "Faculty", "1st Semester", "Final Year"];

export const INITIAL_ANNOUNCEMENTS = [
  {
    id: "ann-1", type: "announcement", title: "Mid-Term 2 Hall Allocation Published",
    body: "Hall assignments for Mid 2 exams (Week 10) are now available on the LMS portal under 'Exam Schedule'. Students must carry their university ID cards. No entry will be permitted without a valid ID.",
    from: "Exam Office", audience: "All Students", date: "Mar 18, 2025", pinned: true,
  },
  {
    id: "ann-2", type: "announcement", title: "LMS Maintenance — Saturday 2–4 AM",
    body: "The LMS portal will be unavailable for scheduled maintenance this Saturday between 2:00 AM and 4:00 AM. Please plan all assignment submissions accordingly. No deadline extensions will be granted for this maintenance window.",
    from: "IT Department", audience: "All Students", date: "Mar 16, 2025", pinned: true,
  },
  {
    id: "ann-3", type: "exam", title: "OOAD Assignment 2 — Groups of 3 Only",
    body: "Reminder: Individual submissions for OOAD Assignment 2 will not be accepted. All groups must be registered on LMS before the submission date. Sequence and activity diagrams must be included.",
    from: "Dr. Hamza Raheel", audience: "BS-CS", date: "Mar 14, 2025", pinned: false,
  },
  {
    id: "ann-4", type: "announcement", title: "Spring 2025 Fee Challan Deadline",
    body: "The last date to submit Spring 2025 fee challans is March 20, 2025. Students with outstanding dues will have their LMS access suspended. Please visit the accounts office or pay online via the NUST payment portal.",
    from: "Accounts Office", audience: "All Students", date: "Mar 10, 2025", pinned: false,
  },
  {
    id: "ann-5", type: "quiz", title: "DSA Quiz 2 — Scope Clarification",
    body: "DSA Quiz 2 scheduled for Week 7 will cover Binary Search Trees, AVL Trees, and Introduction to Graph Traversal (BFS/DFS). The quiz will be 15 minutes, closed book, conducted in the lab.",
    from: "Dr. Farhan Siddiqui", audience: "BS-CS", date: "Mar 3, 2025", pinned: false,
  },
  {
    id: "ann-6", type: "announcement", title: "Faculty Research Seminar — AI in Education",
    body: "A university-wide research seminar on 'AI in Education' will be held on March 25, 2025 in Auditorium Block C at 2:00 PM. Attendance is optional but strongly encouraged for final-year students.",
    from: "Research Office", audience: "Faculty", date: "Mar 1, 2025", pinned: false,
  },
];

export const EMPTY_FORM = { type: "announcement", title: "", body: "", from: "Admin Office", audience: "All Students" };
