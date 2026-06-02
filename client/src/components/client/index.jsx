import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "./sidebar";
import Dashboard from "./dashboard";
import Settings from "./settings";
import NearByRestaurants from "./nearby-restaurants";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "settings":
        return <Settings />;
      case "nearby-restaurants":
        return <NearByRestaurants />;
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
