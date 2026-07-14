import React from "react";

const LEGAL = [
  ["Contract law", "Clear terms of service define what students, vendors and riders can expect from each other."],
  ["Electronic Transactions", "Orders and payments made through the app carry the same legal weight as an in-person agreement."],
  ["NDPR (data protection)", "Names, phone numbers and hostel locations are collected only for delivery and kept confidential."],
  ["Cybercrime Act (2015)", "Authentication and monitoring guard against fraud, hacking and identity theft on the platform."],
  ["Consumer protection", "Pricing and product details are shown up front, with a clear path to complain and get a fix."],
  ["IP, copyright & trademark", "The CampusExpress name, logo and app content are original or properly licensed."],
];
const ETHICS = [
  ["Privacy", "Order and location data is never shared beyond what's needed to deliver the order."],
  ["Transparency", "Delivery fees and commissions are shown before checkout — no surprise charges."],
  ["Fair treatment", "Vendors and riders are onboarded and paid on the same terms, without favoritism."],
  ["Honest advertising", "No inflated delivery-time or availability claims on vendor listings."],
];
const RISKS = [
  ["Delivery delays", "The route timeline gives every party visibility into where an order actually is."],
  ["Fraud / fake orders", "Orders are tied to a named student, and vendor confirmation is required before preparing."],
  ["Technical failure", "Persisted order state on the server means no order silently disappears mid-delivery."],
];

function Group({ title, rows, color }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <div className="h2">{title}</div>
      <div style={{ display: "grid", gap: 8 }}>
        {rows.map(([h, body]) => (
          <div key={h} className="card" style={{ display: "flex", gap: 12, padding: 12 }}>
            <div style={{ width: 4, borderRadius: 999, background: color, flexShrink: 0, boxShadow: `0 0 10px ${color}` }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{h}</div>
              <div className="muted" style={{ fontSize: 12 }}>{body}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Legal() {
  return (
    <div>
      <h1 className="h1">Legal & ethical framework</h1>
      <p className="lede">How the law, cyber-risk and ethics sections of the business plan show up in this build.</p>
      <Group title="Legal compliance" rows={LEGAL} color="var(--amber)" />
      <Group title="Ethical commitments" rows={ETHICS} color="var(--teal)" />
      <Group title="Risk mitigation" rows={RISKS} color="var(--coral)" />
    </div>
  );
}
