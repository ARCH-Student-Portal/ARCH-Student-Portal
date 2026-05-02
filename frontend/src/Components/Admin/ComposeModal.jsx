// src/components/admin/ComposeModal.jsx
// Move the ComposeModal function (lines 72–167) here verbatim.

import { useState } from "react";
import { TYPE_META, AUDIENCES, EMPTY_FORM } from "../../data/AdminAnnouncementsData";

export default function ComposeModal({ existing, onClose, onSave }) {
  const [form, setForm] = useState(existing ? { ...existing } : { ...EMPTY_FORM });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isEdit = !!existing;

  const canSave = form.title.trim() && form.body.trim() && form.from.trim();

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" style={{ width: "min(640px,92vw)", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div className="adm-modal-hd">
          <div className="adm-modal-title">{isEdit ? "Edit Announcement" : "Post Announcement"}</div>
          <button className="adm-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="adm-form-grid">
          {/* Type */}
          <div className="adm-form-group">
            <label className="adm-form-label">Type</label>
            <select className="adm-form-select" value={form.type} onChange={e => set("type", e.target.value)}>
              {Object.keys(TYPE_META).map(t => <option key={t} value={t}>{TYPE_META[t].icon} {TYPE_META[t].label}</option>)}
            </select>
          </div>
          {/* Audience */}
          <div className="adm-form-group">
            <label className="adm-form-label">Audience</label>
            <select className="adm-form-select" value={form.audience} onChange={e => set("audience", e.target.value)}>
              {AUDIENCES.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          {/* Title */}
          <div className="adm-form-group full">
            <label className="adm-form-label">Title</label>
            <input
              className="adm-form-input"
              value={form.title}
              onChange={e => set("title", e.target.value)}
              placeholder="Announcement headline…"
            />
          </div>
          {/* Body */}
          <div className="adm-form-group full">
            <label className="adm-form-label">Body</label>
            <textarea
              className="adm-form-input"
              rows={5}
              value={form.body}
              onChange={e => set("body", e.target.value)}
              placeholder="Full announcement text…"
              style={{ resize: "vertical", lineHeight: 1.6 }}
            />
          </div>
          {/* From */}
          <div className="adm-form-group">
            <label className="adm-form-label">Posted By</label>
            <input
              className="adm-form-input"
              value={form.from}
              onChange={e => set("from", e.target.value)}
              placeholder="Department / name"
            />
          </div>
          {/* Pin */}
          <div className="adm-form-group" style={{ justifyContent: "flex-end" }}>
            <label className="adm-form-label">Pin to top</label>
            <div
              onClick={() => set("pinned", !form.pinned)}
              style={{
                display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
                padding: "10px 14px", borderRadius: 10,
                border: `1px solid ${form.pinned ? "rgba(124,58,237,.4)" : "var(--border)"}`,
                background: form.pinned ? "rgba(124,58,237,.07)" : "#f8fafc",
                transition: "all .2s",
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: 5,
                border: `2px solid ${form.pinned ? "var(--purple)" : "#cbd5e1"}`,
                background: form.pinned ? "var(--purple)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 11, transition: "all .2s",
              }}>
                {form.pinned ? "✓" : ""}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: form.pinned ? "var(--purple)" : "var(--dimmer)" }}>
                📌 Pin announcement
              </span>
            </div>
          </div>
        </div>

        <div className="adm-modal-footer">
          <button className="adm-btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="adm-btn-primary"
            onClick={() => canSave && onSave(form)}
            style={{ opacity: canSave ? 1 : .5, cursor: canSave ? "pointer" : "not-allowed" }}
          >
            {isEdit ? "Save Changes" : "📣 Post Announcement"}
          </button>
        </div>
      </div>
    </div>
  );
}