import { motion } from "framer-motion";
import { getAnnouncementMeta } from "../../Utilities/announcementAdapter";

export default function AnnCard({ ann, onEdit, onDelete, onTogglePin }) {
  const meta = getAnnouncementMeta(ann.type);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: .95 }}
      transition={{ duration: .28 }}
      className="admin-isolated-card ann-card-hover"
      style={{ padding: 0, overflow: "hidden", marginBottom: 24, borderRadius: 24 }}
    >
      <div style={{ height: 6, background: meta.color, borderRadius: "24px 24px 0 0", width: "100%" }} />
      <div style={{ padding: "32px 40px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ padding: "6px 16px", borderRadius: 20, fontSize: 16, fontWeight: 900, letterSpacing: ".06em", textTransform: "uppercase", color: meta.color, background: meta.bg, border: `1px solid ${meta.border}` }}>
              {meta.icon} {meta.label}
            </span>
            <span style={{ padding: "6px 16px", borderRadius: 20, fontSize: 16, fontWeight: 800, background: "rgba(26,120,255,.08)", color: "var(--blue)", border: "1px solid rgba(26,120,255,.2)" }}>
              {ann.audience}
            </span>
            {ann.pinned && (
              <span style={{ padding: "6px 16px", borderRadius: 20, fontSize: 16, fontWeight: 800, background: "rgba(26,120,255,.1)", color: "var(--blue)", border: "1px solid rgba(26,120,255,.3)" }}>
                📌 Pinned
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            <button className="adm-action-btn" title={ann.pinned ? "Unpin" : "Pin"} onClick={() => onTogglePin(ann.id)} style={{ color: ann.pinned ? "var(--blue)" : undefined, fontSize: 20, width: 48, height: 48 }}>📌</button>
            <button className="adm-action-btn" title="Edit" onClick={() => onEdit(ann)} style={{ fontSize: 20, width: 48, height: 48 }}>✏️</button>
            <button className="adm-action-btn btn-delete" title="Delete" onClick={() => onDelete(ann.id)} style={{ fontSize: 20, width: 48, height: 48 }}>🗑️</button>
          </div>
        </div>

        <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text-main)", marginBottom: 16, lineHeight: 1.3 }}>{ann.title}</div>
        <div style={{ fontSize: 20, color: "var(--dimmer)", lineHeight: 1.7, marginBottom: 24 }}>{ann.body}</div>

        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 18, color: "var(--dimmer)", opacity: .8 }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>🗓 {ann.date}</span>
          <span style={{ fontWeight: 600 }}>· Posted by <strong style={{ color: "var(--text-main)", opacity: 1, fontWeight: 800 }}>{ann.from}</strong></span>
        </div>
      </div>
    </motion.div>
  );
}