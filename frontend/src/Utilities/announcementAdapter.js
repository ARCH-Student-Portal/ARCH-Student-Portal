import { TYPE_META } from "../data/AdminAnnouncementsData";

export function getAnnouncementMeta(type) {
  return TYPE_META[type] ?? TYPE_META.announcement;
}

export function getAnnouncementStats(announcements) {
  return [
    { cls: "sc-a", label: "Pinned",        value: announcements.filter(a => a.pinned).length,                special: "none" },
    { cls: "sc-b", label: "Announcements", value: announcements.filter(a => a.type === "announcement").length, special: "none" },
    { cls: "sc-c", label: "Exams",         value: announcements.filter(a => a.type === "exam").length,         special: "fire" },
    { cls: "sc-d", label: "Quizzes",       value: announcements.filter(a => a.type === "quiz").length,         special: "bubbles" },
  ];
}
