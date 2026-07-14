import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Store, Bike, BarChart3, ShieldCheck } from "lucide-react";

const ROLES = [
  { to: "/marketplace", label: "I'm a student", desc: "Order from campus vendors and track delivery.", icon: GraduationCap, color: "var(--amber)" },
  { to: "/vendor", label: "I'm a vendor", desc: "List your stall, manage items and incoming orders.", icon: Store, color: "var(--teal)" },
  { to: "/rider", label: "I'm a rider", desc: "Claim ready orders and deliver across campus.", icon: Bike, color: "var(--coral)" },
  { to: "/overview", label: "Business overview", desc: "Live figures behind the marketplace.", icon: BarChart3, color: "var(--violet)" },
  { to: "/legal", label: "Legal & ethics", desc: "How the platform stays compliant.", icon: ShieldCheck, color: "var(--cyan)" },
];

export default function Landing() {
  return (
    <div className="landing-hero">
      <h1 className="h1" style={{ marginTop: 0, fontSize: 34 }}>Order without the walk.</h1>
      <p className="lede" style={{ fontSize: 15 }}>
        CampusExpress connects students, vendors and riders on one delivery route —
        pick where you're coming in from.
      </p>
      <div className="role-grid">
        {ROLES.map((r) => {
          const Icon = r.icon;
          return (
            <Link key={r.to} to={r.to} className="role-card">
              <div className="icon-badge" style={{ background: r.color, color: "#04040a", boxShadow: `0 0 18px ${r.color}` }}>
                <Icon size={18} />
              </div>
              <div style={{ fontWeight: 700 }}>{r.label}</div>
              <div className="muted" style={{ fontSize: 13 }}>{r.desc}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
