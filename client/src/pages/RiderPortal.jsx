import React, { useEffect, useState } from "react";
import { Package, Truck } from "lucide-react";
import { api } from "../api.js";
import { useIdentity } from "../IdentityContext.jsx";

export default function RiderPortal({ showToast }) {
  const { name } = useIdentity();
  const [vendors, setVendors] = useState([]);
  const [available, setAvailable] = useState([]);
  const [mine, setMine] = useState([]);

  useEffect(() => { api.getVendors().then(setVendors); }, []);

  useEffect(() => {
    const load = () => {
      api.getOrders({ status: "ready_for_pickup" }).then(setAvailable);
      if (name.trim()) api.getOrders({ riderName: name.trim(), status: "picked_up" }).then(setMine);
    };
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [name]);

  const claim = async (order) => {
    if (!name.trim()) return showToast("Enter your name up top first", true);
    await api.updateOrder(order.id, { status: "picked_up", riderName: name.trim() });
    setAvailable((a) => a.filter((o) => o.id !== order.id));
    showToast("Order claimed — deliver it and mark complete");
  };

  const complete = async (order) => {
    await api.updateOrder(order.id, { status: "delivered" });
    setMine((m) => m.filter((o) => o.id !== order.id));
  };

  return (
    <div>
      <h1 className="h1">Rider queue</h1>
      <p className="lede">Short campus hops, claimed on your terms.</p>

      <section style={{ marginBottom: 32 }}>
        <div className="h2"><Package size={14} /> Ready for pickup</div>
        {available.length === 0 && <div className="empty">Nothing waiting right now.</div>}
        <div style={{ display: "grid", gap: 8 }}>
          {available.map((o) => {
            const v = vendors.find((x) => x.id === o.vendorId);
            return (
              <div key={o.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12 }}>
                <div style={{ fontSize: 14 }}>
                  <div style={{ fontWeight: 600 }}>{v ? v.name : "Vendor"} → {o.deliveryLocation}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{o.items.length} item(s) · ₦{o.deliveryFee.toLocaleString()} fee</div>
                </div>
                <button className="btn btn-teal btn-pill" onClick={() => claim(o)}>Claim</button>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="h2"><Truck size={14} /> My deliveries in progress</div>
        {mine.length === 0 && <div className="empty">Nothing in progress.</div>}
        <div style={{ display: "grid", gap: 8 }}>
          {mine.map((o) => (
            <div key={o.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{o.deliveryLocation}</div>
              <button className="btn btn-primary btn-pill" onClick={() => complete(o)}>Mark delivered</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
