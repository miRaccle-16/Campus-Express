const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getVendors: () => request("/vendors"),
  createVendor: (payload) => request("/vendors", { method: "POST", body: JSON.stringify(payload) }),

  getProducts: (vendorId) => request(`/products${vendorId ? `?vendorId=${vendorId}` : ""}`),
  createProduct: (payload) => request("/products", { method: "POST", body: JSON.stringify(payload) }),
  updateProduct: (id, payload) => request(`/products/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  getOrders: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/orders${qs ? `?${qs}` : ""}`);
  },
  createOrder: (payload) => request("/orders", { method: "POST", body: JSON.stringify(payload) }),
  updateOrder: (id, payload) => request(`/orders/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
};
