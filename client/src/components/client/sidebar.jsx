import React from "react";
import { Nav, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaHome, FaCog, FaSignOutAlt, FaFileAlt, FaUser } from "react-icons/fa";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: FaHome },
    { id: "request-service", label: "Request Service", icon: FaFileAlt },
    { id: "settings", label: "Settings", icon: FaCog },
  ];

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const sidebarStyle = {
    width: "250px",
    height: "100vh",
    position: "fixed",
    left: 0,
    top: 0,
    zIndex: 1000,
    backgroundColor: "#ffffff",
    boxShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)",
  };

  return (
    <div style={sidebarStyle}>
      {/* Header */}
      <div className="p-4 border-bottom">
        <div className="d-flex align-items-center">
          <div
            className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-3"
            style={{ width: "40px", height: "40px" }}
          >
            <FaUser className="text-white" />
          </div>
          <div>
            <h6 className="mb-0 fw-bold text-dark">John Doe</h6>
            <small className="text-muted">Client</small>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <Nav className="flex-column mt-3 px-3">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Nav.Item key={item.id} className="mb-2">
              <Button
                variant={activeTab === item.id ? "primary" : "outline-light"}
                className={`w-100 d-flex align-items-center text-start p-3 border-0 ${
                  activeTab === item.id ? "" : "text-dark"
                }`}
                style={{
                  borderLeft:
                    activeTab === item.id ? "4px solid #0d6efd" : "none",
                  borderRadius: "8px",
                  backgroundColor:
                    activeTab === item.id ? "#0d6efd" : "transparent",
                }}
                onClick={() => setActiveTab(item.id)}
              >
                <IconComponent className="me-3" />
                <span className="fw-medium">{item.label}</span>
              </Button>
            </Nav.Item>
          );
        })}
      </Nav>

      {/* Logout Button */}
      <div className="position-absolute bottom-0 start-0 end-0 p-3">
        <Button
          variant="outline-danger"
          className="w-100 d-flex align-items-center justify-content-center"
          onClick={handleLogout}
        >
          <FaSignOutAlt className="me-2" />
          <span className="fw-medium">Logout</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
