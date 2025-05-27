import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Container } from "react-bootstrap";

export default function AdminLayout() {
  const navElements = [
    { id: 1, name: "Dashboard" },
    { id: 2, name: "Appointments" },
    { id: 3, name: "Barber-List" },
    { id: 4, name: "Settings" },
    { id: 5, name: "Clients" },
    { id: 6, name: "Services" },
    { id: 7, name: "Logout" },
  ];

  return (
    <Container fluid className="p-0">
      <div className="d-flex  vh-100 overflow-hidden">
        {/* Sidebar */}
        <div className="w-25  text-light py-3 p-0 overflow-auto bg-dark">
          <h4 className="px-3 fs-2 fw-bold">Admin Panel</h4>
          <nav className="nav flex-column ">
            {navElements.map((navItem) => (
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
            ))}
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
