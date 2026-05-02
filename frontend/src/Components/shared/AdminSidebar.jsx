// src/components/shared/AdminSidebar.jsx
import { useNavigate, useLocation } from "react-router-dom";

export default function AdminSidebar({ sections, collapse, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav id="adm-sidebar" className={collapse ? "collapse" : ""}>
      <div className="adm-sb-top-bar" />
      <button className="adm-sb-toggle" onClick={onToggle}>
        <span /><span /><span />
      </button>
      <div className="adm-sb-logo">
        <div className="adm-logo-box">A</div>
        <div>
          <div className="adm-logo-name">ARCH</div>
          <div className="adm-logo-tagline">Admin Panel</div>
        </div>
      </div>
      <div className="adm-sb-user">
        <div className="adm-uav">SA</div>
        <div>
          <div className="adm-uname">Super Admin</div>
          <div className="adm-uid">ADM-0001</div>
        </div>
      </div>

      {sections.map(([sec, items]) => (
        <div key={sec}>
          <div className="adm-nav-sec">{sec}</div>
          {items.map(([ic, label, path]) => (
            <div
              key={label}
              className={`adm-ni${location.pathname === path ? " active" : ""}`}
              onClick={() => navigate(path)}
            >
              <div className="adm-ni-ic">{ic}</div>{label}
            </div>
          ))}
        </div>
      ))}

      <div className="adm-sb-foot">Spring 2025 · FAST-NUCES</div>
    </nav>
  );
}