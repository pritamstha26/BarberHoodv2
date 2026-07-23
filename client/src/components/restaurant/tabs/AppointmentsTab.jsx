import React from "react";
import { Card, Table, Button } from "react-bootstrap";
import { RefreshCw } from "lucide-react";

const SortIcon = ({ field, sortField, sortDir }) => {
  if (sortField !== field) return <span style={{ opacity: 0.3, marginLeft: 4 }}>⇅</span>;
  return <span style={{ marginLeft: 4 }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
};

export default function AppointmentsTab({ appointments, isLoading, onSync, sortField, sortDir, onSort, onUpdateStatus }) {
  const pendingAppointments = (appointments || [])
    .filter((app) => app.status === "pending")
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (sortField === "date") {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      } else if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal || "").toLowerCase();
      }
      if (aVal == null) aVal = "";
      if (bVal == null) bVal = "";
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <Card className="matte-card">
      <Card.Header className="matte-card-header">
        <h5 className="m-0 fw-bold header-title">Pending Requests</h5>
        <Button variant="none" className="sync-btn-custom" onClick={onSync} disabled={isLoading}>
          <RefreshCw size={13} className={`me-1 ${isLoading ? "spin-icon" : ""}`} /> Refresh
        </Button>
      </Card.Header>
      <Card.Body className="p-0">
        {pendingAppointments.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <p className="mb-0">No pending requests requiring action.</p>
          </div>
        ) : (
          <Table responsive className="mb-0 premium-table">
            <thead>
              <tr>
                <th className="ps-4" style={{ cursor: "pointer", userSelect: "none" }} onClick={() => onSort("client_name")}>
                  Client <SortIcon field="client_name" sortField={sortField} sortDir={sortDir} />
                </th>
                <th style={{ cursor: "pointer", userSelect: "none" }} onClick={() => onSort("service_name")}>
                  Service <SortIcon field="service_name" sortField={sortField} sortDir={sortDir} />
                </th>
                <th style={{ cursor: "pointer", userSelect: "none" }} onClick={() => onSort("date")}>
                  Date & Time <SortIcon field="date" sortField={sortField} sortDir={sortDir} />
                </th>
                <th style={{ cursor: "pointer", userSelect: "none" }} onClick={() => onSort("duration")}>
                  Duration <SortIcon field="duration" sortField={sortField} sortDir={sortDir} />
                </th>
                <th style={{ cursor: "pointer", userSelect: "none" }} onClick={() => onSort("price")}>
                  Price <SortIcon field="price" sortField={sortField} sortDir={sortDir} />
                </th>
                <th style={{ cursor: "pointer", userSelect: "none" }} onClick={() => onSort("status")}>
                  Status <SortIcon field="status" sortField={sortField} sortDir={sortDir} />
                </th>
                <th className="pe-4 text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingAppointments.map((app) => (
                <tr key={app.id}>
                  <td className="ps-4 fw-medium text-dark">{app.client_name}</td>
                  <td>{app.service_name}</td>
                  <td className="text-muted">{new Date(app.date).toLocaleString()}</td>
                  <td>{app.duration} mins</td>
                  <td className="fw-semibold text-dark">Rs. {app.price}</td>
                  <td><span className={`status-flag status-flag-${app.status}`}>{app.status.replace(/_/g, " ")}</span></td>
                  <td className="pe-4 text-end">
                    <Button variant="none" className="control-btn btn-confirm me-1" onClick={() => onUpdateStatus(app.id, "confirm", "Appointment confirmed!", "success")}>
                      ✓ Accept
                    </Button>
                    <Button variant="none" className="control-btn btn-cancel" onClick={() => { if(window.confirm("Reject this booking?")) onUpdateStatus(app.id, "cancel", "Appointment rejected", "warning") }}>
                      ✕ Reject
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
}
