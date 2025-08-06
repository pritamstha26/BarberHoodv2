import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "./sidebar";
import Dashboard from "./dashboard";
import RequestService from "./request-service";
import Settings from "./settings";

function App() {
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
    <div className="min-vh-100 bg-light">
      <div className="d-flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-fill" style={{ marginLeft: "350px" }}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
