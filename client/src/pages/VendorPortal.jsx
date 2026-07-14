import React, { useEffect, useState } from "react";
import { Plus, MapPin } from "lucide-react";
import { api } from "../api.js";
import { useIdentity } from "../IdentityContext.jsx";
import { STATUS_FLOW } from "../components/RouteTimeline.jsx";

export default function VendorPortal({ showToast }) {
  const { name } = useIdentity();
  const [vendors, setVendors] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ vName: "", category: "Food", description: "" });
  const [pForm, setPForm] = useState({ pName: "", price: "" });

  useEffect(() => { api.getVendors().then(setVendors); }, []);

  const myVendor = vendors?.find((v) => v.createdBy === name.trim());

  useEffect(() => {
    if (!myVendor) return;
    api.getProducts(myVendor.id).then(setProducts);
    const load = () => api.getOrders({ vendorId: myVendor.id }).then(setOrders);
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [myVendor?.id]);

  const registerVendor = async () => {
    if (!name.trim()) return showToast("Enter your name up top first", true);
    if (!form.vName.trim()) return showToast("Give your stall a name", true);
    const vendor = await api.createVendor({
      name: form.vName.trim(),
      category: form.category,
      description: form.description.trim(),
      createdBy: name.trim(),
    });
    setVendors((v) => [...(v || []), vendor]);
    showToast("Vendor profile created");
  };

  const addProduct = async () => {
    if (!pForm.pName.trim() || !pForm.price) return showToast("Add a name and price", true);
    const product = await api.createProduct({ vendorId: myVendor.id, name: pForm.pName.trim(), price: Number(pForm.price) });
    setProducts((p) => [...p, product]);
    setPForm({ pName: "", price: "" });
    showToast("Item listed");
  };

  const toggleProduct = async (p) => {
    const updated = await api.updateProduct(p.id, { available: !p.available });
    setProducts((ps) => ps.map((x) => (x.id === p.id ? updated : x)));
  };

  const advance = async (order) => {
    const idx = STATUS_FLOW.findIndex((s) => s.key === order.status);
    const next = STATUS_FLOW[idx + 1];
    if (!next) return;
    const updated = await api.updateOrder(order.id, { status: next.key });
    setOrders((os) => os.map((o) => (o.id === order.id ? updated : o)));
  };

  if (!name.trim()) return <div className="empty">Enter your name up top to manage a vendor stall.</div>;
  if (vendors === null) return <div className="empty">Loading…</div>;

  if (!myVendor) {
    return (
      <div style={{ maxWidth: 380 }}>
        <h1 className="h1">List your stall</h1>
        <p className="lede">Reach every student on campus without depending on walk-in traffic.</p>
        <div style={{ display: "grid", gap: 8 }}>
          <input className="input" placeholder="Stall name" value={form.vName} onChange={(e) => setForm({ ...form, vName: e.target.value })} />
          <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {["Food", "Drinks", "Groceries", "Stationery", "Other"].map((c) => <option key={c}>{c}</option>)}
          </select>
          <textarea className="input" rows={2} placeholder="Short description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button className="btn btn-primary" onClick={registerVendor}>Create vendor profile</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="h1">{myVendor.name}</h1>
      <p className="lede">{myVendor.description}</p>

      <section style={{ marginBottom: 32 }}>
        <div className="h2"><Plus size={14} /> Add an item</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input className="input" style={{ flex: 1, minWidth: 140 }} placeholder="Item name" value={pForm.pName} onChange={(e) => setPForm({ ...pForm, pName: e.target.value })} />
          <input className="input" style={{ width: 110 }} type="number" placeholder="Price (₦)" value={pForm.price} onChange={(e) => setPForm({ ...pForm, price: e.target.value })} />
          <button className="btn btn-dark" onClick={addProduct}>List item</button>
        </div>
        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          {products.map((p) => (
            <div key={p.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name} <span className="mono muted" style={{ fontWeight: 400 }}>· ₦{p.price.toLocaleString()}</span></div>
              <button
                className="btn btn-pill"
                style={{
                  background: p.available ? "rgba(52,211,153,.14)" : "rgba(255,93,122,.14)",
                  color: p.available ? "var(--teal)" : "var(--coral)",
                  border: `1px solid ${p.available ? "rgba(52,211,153,.35)" : "rgba(255,93,122,.35)"}`,
                }}
                onClick={() => toggleProduct(p)}
              >
                {p.available ? "In stock" : "Out of stock"}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="h2">Incoming orders</div>
        {orders.length === 0 && <div className="empty">No orders yet.</div>}
        <div style={{ display: "grid", gap: 12 }}>
          {orders.map((o) => {
            const idx = STATUS_FLOW.findIndex((s) => s.key === o.status);
            const next = STATUS_FLOW[idx + 1];
            return (
              <div key={o.id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8 }}>
                  <span style={{ fontWeight: 600 }}>{o.studentName} · <MapPin size={11} style={{ display: "inline" }} /> {o.deliveryLocation}</span>
                  <span className="mono muted" style={{ fontSize: 12 }}>₦{o.total.toLocaleString()}</span>
                </div>
                <ul className="muted" style={{ fontSize: 12, margin: "0 0 8px", paddingLeft: 18 }}>
                  {o.items.map((it) => {
                    const p = products.find((x) => x.id === it.productId);
                    return <li key={it.productId}>{it.qty}× {p ? p.name : "item"}</li>;
                  })}
                </ul>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: o.status === "cancelled" ? "var(--coral)" : "var(--teal)" }}>
                    {o.status === "cancelled" ? "Cancelled" : STATUS_FLOW[idx]?.label}
                  </span>
                  {next && o.status !== "cancelled" && idx < 3 && (
                    <button className="btn btn-primary btn-pill" onClick={() => advance(o)}>
                      Mark "{next.label}" →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
