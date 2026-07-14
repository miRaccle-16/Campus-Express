import React, { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { api } from "../api.js";
import { useIdentity } from "../IdentityContext.jsx";
import RouteTimeline from "../components/RouteTimeline.jsx";

export default function MyOrders() {
  const { name } = useIdentity();
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    api.getVendors().then(setVendors);
  }, []);

  useEffect(() => {
    if (!name.trim()) return setOrders([]);
    let cancelled = false;
    const load = () => api.getOrders({ studentName: name.trim() }).then((o) => !cancelled && setOrders(o));
    load();
    const id = setInterval(load, 5000); // poll so status updates from vendor/rider show up live
    return () => { cancelled = true; clearInterval(id); };
  }, [name]);

  return (
    <div>
      <h1 className="h1">My orders</h1>
      {!name.trim() && <div className="empty">Enter your name up top to see your orders.</div>}
      {name.trim() && orders.length === 0 && <div className="empty">No orders yet — go browse a vendor.</div>}
      <div style={{ display: "grid", gap: 12 }}>
        {orders.map((o) => {
          const v = vendors.find((x) => x.id === o.vendorId);
          return (
            <div key={o.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{v ? v.name : "Vendor"}</div>
                  <div className="muted" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                    <MapPin size={12} /> {o.deliveryLocation}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="mono muted" style={{ fontSize: 11 }}>{o.id}</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>₦{o.total.toLocaleString()}</div>
                </div>
              </div>
              <RouteTimeline status={o.status} />
              {o.riderName && <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>Rider: {o.riderName}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
