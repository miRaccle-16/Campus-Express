import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { api } from "../api.js";
import { useIdentity } from "../IdentityContext.jsx";

export default function VendorDetail({ showToast }) {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { name } = useIdentity();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [location, setLocation] = useState("");

  useEffect(() => {
    api.getVendors().then((vs) => setVendor(vs.find((v) => v.id === vendorId) || null));
    api.getProducts(vendorId).then((p) => setProducts(p.filter((x) => x.available)));
  }, [vendorId]);

  const addQty = (pid, d) => setCart((c) => ({ ...c, [pid]: Math.max(0, (c[pid] || 0) + d) }));
  const cartItems = Object.entries(cart).filter(([, q]) => q > 0);
  const itemsTotal = cartItems.reduce((sum, [pid, q]) => {
    const p = products.find((x) => x.id === pid);
    return sum + (p ? p.price * q : 0);
  }, 0);
  const deliveryFee = cartItems.length ? 400 : 0;

  const placeOrder = async () => {
    if (!name.trim()) return showToast("Enter your name up top first", true);
    if (!location.trim()) return showToast("Add a delivery location (hostel/hall)", true);
    if (!cartItems.length) return showToast("Your cart is empty", true);
    try {
      await api.createOrder({
        studentName: name.trim(),
        vendorId,
        items: cartItems.map(([productId, qty]) => ({ productId, qty })),
        deliveryLocation: location.trim(),
      });
      showToast('Order placed — track it under "My orders"');
      navigate("/orders");
    } catch (e) {
      showToast(e.message, true);
    }
  };

  if (!vendor) return <div className="empty">Loading vendor…</div>;

  return (
    <div>
      <Link to="/marketplace" className="muted" style={{ fontSize: 12, fontWeight: 600 }}>← All vendors</Link>
      <h1 className="h1">{vendor.name}</h1>
      <p className="lede">{vendor.description}</p>

      <div style={{ display: "grid", gap: 8, marginBottom: 24 }}>
        {products.length === 0 && <div className="empty">This vendor hasn't listed any items yet.</div>}
        {products.map((p) => (
          <div key={p.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
              <div className="mono muted" style={{ fontSize: 12 }}>₦{p.price.toLocaleString()}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button className="btn" style={{ border: "1px solid var(--line)", background: "var(--surface-2)", width: 28, height: 28, padding: 0 }} onClick={() => addQty(p.id, -1)}>−</button>
              <span style={{ width: 20, textAlign: "center", fontWeight: 600, fontSize: 14 }}>{cart[p.id] || 0}</span>
              <button className="btn btn-primary" style={{ width: 28, height: 28, padding: 0 }} onClick={() => addQty(p.id, 1)}>+</button>
            </div>
          </div>
        ))}
      </div>

      {cartItems.length > 0 && (
        <div className="card" style={{ background: "var(--ink)", color: "var(--paper)", position: "sticky", bottom: 16, border: "1px solid var(--line-soft)", boxShadow: "var(--glow-violet)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
            <ShoppingCart size={16} /> Your order
          </div>
          <input
            className="input"
            style={{ background: "var(--surface-2)", color: "var(--paper)", border: "1px solid var(--line-soft)", marginBottom: 10 }}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Deliver to: hostel / hall / block"
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)" }}>
            <span>Items</span><span>₦{itemsTotal.toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>
            <span>Delivery fee</span><span>₦{deliveryFee.toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, marginBottom: 12 }}>
            <span>Total</span><span>₦{(itemsTotal + deliveryFee).toLocaleString()}</span>
          </div>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={placeOrder}>
            Place order
          </button>
        </div>
      )}
    </div>
  );
}
