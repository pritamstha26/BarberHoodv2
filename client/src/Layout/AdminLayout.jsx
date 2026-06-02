import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";

export default function AdminLayout() {
  const navElements = [
    { id: 1, name: "Dashboard" },
    { id: 2, name: "Clients" },
    { id: 3, name: "Restaurant-List" },
    { id: 4, name: "Services" },
    { id: 5, name: "Settings" },
    { id: 6, name: "Logout" },
  ];
  const navigate = useNavigate();
  return (
    <Container fluid className="p-0">
      <div className="d-flex  vh-100 overflow-hidden">
        {/* Sidebar */}
        <div className="w-25  text-light py-3 p-0 overflow-auto bg-dark">
          <h4 className="px-3 fs-2 fw-bold">Admin Panel</h4>
          <nav className="nav flex-column ">
            {navElements.map((navItem) =>
              navItem.name === "Logout" ? (
                <span
                  key={navItem.id}
                  className="nav-link text-light"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    sessionStorage.removeItem("access_token"); // Clear token
                    navigate("/login"); // Redirect to login page
                  }}
                >
                  {navItem.name}
                </span>
              ) : (
                <NavLink
                  key={navItem.id}
                  to={`/admin/${navItem.name.toLowerCase()}`}
                  className={({ isActive }) =>
                    `nav-link ${
                      isActive ? "fw-bold bg-primary text-light" : "text-light"
                    }`
                  }
                >
                  {navItem.name}
                </NavLink>
              ),
            )}
          </nav>
        </div>

        {/* Main Content */}
        <div className="p-0 w-75  overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </Container>
  );
}
