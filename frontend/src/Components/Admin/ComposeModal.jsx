import { useState } from "react";
import { AUDIENCES, EMPTY_FORM } from "../../data/AdminAnnouncementsData";

const SCOPE_OPTIONS = [
  { value: "university", label: "🏛 University-wide" },
  { value: "faculty",    label: "🎓 Faculty / Course" },
];
const CATEGORY_OPTIONS = [
  { value: "notice",   label: "📣 Notice"     },
  { value: "mid",      label: "📝 Mid Exam"   },
  { value: "final",    label: "📝 Final Exam" },
  { value: "activity", label: "📋 Activity"   },
];

export default function ComposeModal({ existing, onClose, onSave, saving }) {
  const [form, setForm] = useState(existing ? { ...existing } : { ...EMPTY_FORM });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isEdit = !!existing;
  const canSave = form.title.trim() && form.body.trim();

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div
        className="adm-modal"
        style={{ width: "min(900px, 95vw)", maxHeight: "90vh", overflowY: "auto", padding: "48px" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="adm-modal-hd" style={{ marginBottom: 32 }}>
          <div className="adm-modal-title" style={{ fontSize: 36 }}>
            {isEdit ? "Edit Announcement" : "Post Announcement"}
          </div>
          <button className="adm-modal-close" style={{ fontSize: 32 }} onClick={onClose}>✕</button>
        </div>

        <div className="adm-form-grid" style={{ gap: 24 }}>

          {/* Scope → schema `type` */}
          <div className="adm-form-group">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Scope</label>
            <select
              className="adm-form-select"
              style={{ fontSize: 20, padding: "18px" }}
              value={form.annType}
              onChange={e => set("annType", e.target.value)}
            >
              {SCOPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Category → schema `category` */}
          <div className="adm-form-group">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Category</label>
            <select
              className="adm-form-select"
              style={{ fontSize: 20, padding: "18px" }}
              value={form.category}
              onChange={e => set("category", e.target.value)}
            >
              {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Audience — display/filter only, not sent to backend */}
          <div className="adm-form-group">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Audience</label>
            <select
              className="adm-form-select"
              style={{ fontSize: 20, padding: "18px" }}
              value={form.audience}
              onChange={e => set("audience", e.target.value)}
            >
              {AUDIENCES.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>

          {/* Week Number */}
          <div className="adm-form-group">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Week (optional)</label>
            <select
              className="adm-form-select"
              style={{ fontSize: 20, padding: "18px" }}
              value={form.weekNumber ?? ""}
              onChange={e => set("weekNumber", e.target.value ? Number(e.target.value) : null)}
            >
              {Array.from({ length: 16 }, (_, i) => (
                <option key={i + 1} value={i + 1}>Week {i + 1}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="adm-form-group full">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Title</label>
            <input
              className="adm-form-input"
              style={{ fontSize: 24, padding: "20px", fontWeight: 800 }}
              value={form.title}
              onChange={e => set("title", e.target.value)}
              placeholder="Announcement headline…"
            />
          </div>

          {/* Body */}
          <div className="adm-form-group full">
            <label className="adm-form-label" style={{ fontSize: 18 }}>Body</label>
            <textarea
              className="adm-form-input"
              rows={6}
              value={form.body}
              onChange={e => set("body", e.target.value)}
              placeholder="Full announcement text…"
              style={{ resize: "vertical", lineHeight: 1.6, fontSize: 20, padding: "20px" }}
            />
          </div>

          {/* Pin */}
          <div className="adm-form-group" style={{ justifyContent: "flex-end" }}>
            <label className="adm-form-label" style={{ fontSize: 18 }}>Pin to top</label>
            <div
              onClick={() => set("pinned", !form.pinned)}
              style={{
                display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
                padding: "16px 20px", borderRadius: 14,
                border: `2px solid ${form.pinned ? "rgba(26,120,255,.4)" : "var(--border)"}`,
                background: form.pinned ? "rgba(26,120,255,.07)" : "#f8fafc",
                transition: "all .2s"
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                border: `2px solid ${form.pinned ? "var(--blue)" : "#cbd5e1"}`,
                background: form.pinned ? "var(--blue)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 16, transition: "all .2s", fontWeight: 900
              }}>
                {form.pinned ? "✓" : ""}
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: form.pinned ? "var(--blue)" : "var(--dimmer)" }}>
                📌 Pin announcement
              </span>
            </div>
          </div>

        </div>

        <div className="adm-modal-footer" style={{ marginTop: 48 }}>
          <button
            className="adm-btn-secondary"
            style={{ fontSize: 20, padding: "16px 32px" }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="adm-btn-primary"
            onClick={() => canSave && !saving && onSave(form)}
            style={{ opacity: canSave && !saving ? 1 : .5, cursor: canSave && !saving ? "pointer" : "not-allowed", fontSize: 20, padding: "16px 32px" }}
          >
            {saving ? "⏳ Posting…" : isEdit ? "Save Changes" : "📣 Post Announcement"}
          </button>
        </div>
      </div>
    </div>
  );
}