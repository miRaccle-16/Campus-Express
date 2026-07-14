import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { IdentityProvider } from "./IdentityContext.jsx";
import TopNav from "./components/TopNav.jsx";
import Landing from "./pages/Landing.jsx";
import Marketplace from "./pages/Marketplace.jsx";
import VendorDetail from "./pages/VendorDetail.jsx";
import MyOrders from "./pages/MyOrders.jsx";
import VendorPortal from "./pages/VendorPortal.jsx";
import RiderPortal from "./pages/RiderPortal.jsx";
import Overview from "./pages/Overview.jsx";
import Legal from "./pages/Legal.jsx";

export default function App() {
  const [toast, setToast] = useState(null);
  const showToast = (msg, isError) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 2600);
  };

  return (
    <IdentityProvider>
      <TopNav />
      <main className="container">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/:vendorId" element={<VendorDetail showToast={showToast} />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/vendor" element={<VendorPortal showToast={showToast} />} />
          <Route path="/rider" element={<RiderPortal showToast={showToast} />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </main>
      {toast && <div className={`toast${toast.isError ? " error" : ""}`}>{toast.msg}</div>}
    </IdentityProvider>
  );
}
