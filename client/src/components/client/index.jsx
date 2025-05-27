"use client";

import { useState } from "react";
import Sidebar from "./sidebar";
import Dashboard from "./dashboard";
import RequestService from "./request-service";
import Settings from "./settings";

// import { Home, Settings, LogOut, FileText, User } from "lucide-react";
export default function ClientPortal() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "request-service":
        return <RequestService />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-6">{renderContent()}</main>
      </div>
    </div>
  );
}
