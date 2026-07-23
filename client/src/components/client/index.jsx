import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./sidebar";

function ClientPortal() {
  const location = useLocation();
  const activeTab = location.pathname.replace("/client", "").replace(/^\//, "") || "dashboard";

  return (
    <div className="min-vh-100 bg-light">
      <div className="d-flex">
        <Sidebar activeTab={activeTab} />
        <main className="flex-fill" style={{ marginLeft: "350px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default ClientPortal;