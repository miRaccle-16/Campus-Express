import React from "react";
import { NavLink } from "react-router-dom";
import { GraduationCap, Store, Bike, BarChart3, ShieldCheck, Package } from "lucide-react";
import { useIdentity } from "../IdentityContext.jsx";

const TABS = [
  { to: "/marketplace", label: "Marketplace", icon: GraduationCap },
  { to: "/orders", label: "My orders", icon: Package },
  { to: "/vendor", label: "Vendor portal", icon: Store },
  { to: "/rider", label: "Rider portal", icon: Bike },
  { to: "/overview", label: "Business overview", icon: BarChart3 },
  { to: "/legal", label: "Legal & ethics", icon: ShieldCheck },
];

export default function TopNav() {
  const { name, setName } = useIdentity();
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a href="/" className="brand">
          <div className="brand-mark">CX</div>
          <div>
            <div className="brand-name">CampusExpress</div>
            <div className="brand-sub">Rivers State University · Route Board</div>
          </div>
        </a>
        <input
          className="name-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
      </div>
      <nav className="nav">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              <Icon size={14} /> {t.label}
            </NavLink>
          );
        })}
      </nav>
    </header>
  );
}
