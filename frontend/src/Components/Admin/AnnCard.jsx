import { motion } from "framer-motion";
import { TYPE_META } from "../../data/AdminAnnouncementsData"; // see Step 3

export default function AnnCard({ ann, onEdit, onDelete, onTogglePin }) {
  const meta = TYPE_META[ann.type] ?? TYPE_META.announcement;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: .95 }}
      transition={{ duration: .28 }}
      className="adm-card"
      style={{ padding: 0, overflow: "hidden", marginBottom: 14 }}
    >
      {/* Colour stripe */}
      <div style={{ height: 3, background: meta.color, borderRadius: "18px 18px 0 0" }} />
      <div style={{ padding: "18px 22px" }}>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{
              padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 800,
              letterSpacing: ".06em", textTransform: "uppercase",
              color: meta.color, background: meta.bg, border: `1px solid ${meta.border}`,
            }}>
              {meta.icon} {meta.label}
            </span>
            <span style={{
              padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
              background: "rgba(26,120,255,.08)", color: "var(--blue)",
              border: "1px solid rgba(26,120,255,.2)",
            }}>
              {ann.audience}
            </span>
            {ann.pinned && (
              <span style={{
                padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                background: "rgba(124,58,237,.1)", color: "var(--purple)",
                border: "1px solid rgba(124,58,237,.25)",
              }}>
                📌 Pinned
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button
              className="adm-action-btn"
              title={ann.pinned ? "Unpin" : "Pin"}
              onClick={() => onTogglePin(ann.id)}
              style={{ color: ann.pinned ? "var(--purple)" : undefined }}
            >
              📌
            </button>
            <button className="adm-action-btn" title="Edit" onClick={() => onEdit(ann)}>✏️</button>
            <button className="adm-action-btn btn-delete" title="Delete" onClick={() => onDelete(ann.id)}>🗑️</button>
          </div>
        </div>

        {/* Title */}
        <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-main)", marginBottom: 8, lineHeight: 1.4 }}>
          {ann.title}
        </div>

        {/* Body */}
        <div style={{ fontSize: 13, color: "var(--dimmer)", lineHeight: 1.7, marginBottom: 14 }}>
          {ann.body}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "var(--dimmer)", opacity: .75 }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>🗓 {ann.date}</span>
          <span>· Posted by <strong style={{ color: "var(--text-main)", opacity: 1 }}>{ann.from}</strong></span>
        </div>
      </div>
    </motion.div>
  );
}