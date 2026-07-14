import React, { useEffect, useState } from "react";
import { api } from "../api.js";

export default function Overview() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      const [vendors, products, orders] = await Promise.all([
        api.getVendors(),
        api.getProducts(),
        api.getOrders(),
      ]);
      const delivered = orders.filter((o) => o.status === "delivered");
      const revenueDelivery = delivered.reduce((s, o) => s + (o.deliveryFee || 0), 0);
      const commission = delivered.reduce((s, o) => s + (o.itemsTotal || 0) * 0.07, 0);
      setStats({
        vendors: vendors.length,
        products: products.length,
        orders: orders.length,
        delivered: delivered.length,
        revenue: revenueDelivery + commission,
      });
    })();
  }, []);

  if (!stats) return <div className="empty">Crunching numbers…</div>;

  const cards = [
    { label: "Vendors onboarded", value: stats.vendors },
    { label: "Items listed", value: stats.products },
    { label: "Orders placed", value: stats.orders },
    { label: "Orders delivered", value: stats.delivered },
    { label: "Modeled revenue (fees + 7% commission)", value: `₦${Math.round(stats.revenue).toLocaleString()}` },
  ];

  return (
    <div>
      <h1 className="h1">Business overview</h1>
      <p className="lede">
        Live figures from the current market data — this is the same funnel the business plan models:
        delivery fees plus a commission on each vendor transaction.
      </p>
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {cards.map((c) => (
          <div key={c.label} className="card">
            <div style={{ fontSize: 24, fontWeight: 900 }}>{c.value}</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{ background: "var(--ink)", color: "var(--paper)", border: "1px solid var(--line-soft)", boxShadow: "var(--glow-cyan)" }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Pricing model</div>
        <ul style={{ fontSize: 12, color: "var(--muted)", margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
          <li>Short-distance delivery: ₦300 – ₦500</li>
          <li>Medium-distance delivery: ₦500 – ₦800</li>
          <li>Vendor commission: 5%–10% per transaction (modeled here at 7%)</li>
        </ul>
      </div>
    </div>
  );
}
