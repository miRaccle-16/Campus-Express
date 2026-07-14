import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { api } from "../api.js";

export default function Marketplace() {
  const [vendors, setVendors] = useState(null);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    api.getVendors().then(async (v) => {
      setVendors(v);
      const entries = await Promise.all(
        v.map(async (vendor) => {
          const products = await api.getProducts(vendor.id);
          return [vendor.id, products.filter((p) => p.available).length];
        })
      );
      setCounts(Object.fromEntries(entries));
    });
  }, []);

  return (
    <div>
      <h1 className="h1">Browse vendors</h1>
      <p className="lede">Pick a vendor to see what's on the menu right now.</p>
      {vendors === null && <div className="empty">Loading vendors…</div>}
      {vendors && vendors.length === 0 && (
        <div className="empty">No vendors have joined yet. Head to the Vendor portal to add the first one.</div>
      )}
      <div className="grid-2">
        {vendors && vendors.map((v) => (
          <Link key={v.id} to={`/marketplace/${v.id}`} className="card" style={{ display: "block" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 700 }}>{v.name}</div>
              <span className="tag">{v.category}</span>
            </div>
            <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{v.description}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--teal)", marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
              {counts[v.id] ?? "…"} items available <ChevronRight size={12} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
