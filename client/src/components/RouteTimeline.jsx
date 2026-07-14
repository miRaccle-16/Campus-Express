import React from "react";
import { Package, Check, Clock, Store, Bike, Home as HomeIcon, AlertTriangle } from "lucide-react";

export const STATUS_FLOW = [
  { key: "placed", label: "Order placed", icon: Package },
  { key: "confirmed", label: "Vendor confirmed", icon: Check },
  { key: "preparing", label: "Preparing", icon: Clock },
  { key: "ready_for_pickup", label: "Ready for rider", icon: Store },
  { key: "picked_up", label: "On the way", icon: Bike },
  { key: "delivered", label: "Delivered", icon: HomeIcon },
];

export default function RouteTimeline({ status }) {
  if (status === "cancelled") {
    return (
      <div className="cancelled-flag">
        <AlertTriangle size={16} /> Order cancelled
      </div>
    );
  }
  const idx = STATUS_FLOW.findIndex((s) => s.key === status);
  return (
    <div className="timeline">
      {STATUS_FLOW.map((s, i) => {
        const Icon = s.icon;
        const reached = i <= idx;
        const current = i === idx;
        return (
          <React.Fragment key={s.key}>
            <div className="timeline-step">
              <div className={`timeline-dot${reached ? " reached" : ""}${current ? " current" : ""}`}>
                <Icon size={14} />
              </div>
              <div className={`timeline-label${reached ? " reached" : ""}`}>{s.label}</div>
            </div>
            {i < STATUS_FLOW.length - 1 && (
              <div className={`timeline-connector${i < idx ? " done" : ""}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
