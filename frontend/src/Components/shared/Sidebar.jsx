// src/components/shared/Sidebar.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { forwardRef } from "react";

// Wrap the component function with forwardRef
const Sidebar = forwardRef(({ sections, logoLabel, userName, userId, collapse, onToggle, footerText }, ref) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    /* Attach the ref here */
    <nav 
      ref={ref} 
      id="sidebar" 
      className={collapse ? "collapse" : ""} 
      style={{ transform: "translateX(0)" }}
    >
      <div className="sb-top-bar" />
      <button className="sb-toggle" onClick={onToggle}>
        <span /><span /><span />
      </button>
      <div className="sb-logo">
        <div className="logo-box">A</div>
        <div>
          <div className="logo-name">ARCH</div>
          <div className="logo-tagline">{logoLabel}</div>
        </div>
      </div>
      <div className="sb-user">
        <div className="uav">{userName.split(" ").map(w => w[0]).join("").slice(0,2)}</div>
        <div>
          <div className="uname">{userName}</div>
          <div className="uid">{userId}</div>
        </div>
      </div>

      {sections.map(([sec, items]) => (
        <div key={sec}>
          <div className="nav-sec">{sec}</div>
          {items.map(([ic, label, path, badge]) => (
            <div
              key={label}
              className={`ni${location.pathname === path ? " active" : ""}`}
              onClick={() => navigate(path)}
            >
              <div className="ni-ic">{ic}</div>
              {label}
              {badge && <span className="nbadge">{badge}</span>}
            </div>
          ))}
        </div>
      ))}

      <div className="sb-foot">{footerText ?? "Spring 2025 · FAST-NUCES"}</div>
    </nav>
  );
});

export default Sidebar;