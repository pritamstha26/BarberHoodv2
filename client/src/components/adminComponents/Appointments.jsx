import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Spinner,
} from "react-bootstrap";
import { Phone, Scissors, User, Eye, Pencil, Trash2 } from "lucide-react";
import { useAppointments } from "../../context/appointment_context";
// import { useAppointments } from "../../context/appointment_context";

//

export default function AppointmentTable() {
  const {
    filteredAppointments,
    updateAppointment,
    deleteAppointment,
    isLoading,
  } = useAppointments();

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return <Badge bg="success">{status}</Badge>;
      case "In Progress":
        return <Badge bg="primary">{status}</Badge>;
      case "Scheduled":
        return (
          <Badge bg="warning" text="dark">
            {status}
          </Badge>
        );
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const handleStatusChange = (id, newStatus) => {
    updateAppointment(id, { status: newStatus });
  };

  const handleDelete = (id) => {
    deleteAppointment(id);
  };

  return (
    <Container fluid>
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <Card.Title className="mb-0">
                Appointments ({filteredAppointments.length})
              </Card.Title>
              {isLoading && (
                <div className="d-flex align-items-center gap-2">
                  <Spinner animation="border" size="sm" />
                  <small className="text-muted">Updating...</small>
                </div>
              )}
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "80px" }}>ID</th>
                      <th>Client Name</th>
                      <th>Style</th>
                      <th>Barber Name</th>
                      <th>Contact Number</th>
                      <th>Total Price</th>
                      <th>Status</th>
                      <th style={{ width: "150px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td className="fw-bold">{appointment.id}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <User size={16} className="text-muted" />
                            {appointment.clientName}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <Scissors size={16} className="text-muted" />
                            {appointment.style}
                          </div>
                        </td>
                        <td className="fw-medium">{appointment.barberName}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <Phone size={16} className="text-muted" />
                            <a
                              href={`tel:${appointment.contactNumber}`}
                              className="text-decoration-none"
                              style={{ color: "#0d6efd" }}
                            >
                              {appointment.contactNumber}
                            </a>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-1">
                            <span className="fw-bold text-success">
                              Rs.{appointment.totalPrice.toFixed(2)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="dropdown">
                            <button
                              className="btn btn-link p-0 border-0 bg-transparent"
                              type="button"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              {getStatusBadge(appointment.status)}
                            </button>
                            <ul className="dropdown-menu">
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() =>
                                    handleStatusChange(
                                      appointment.id,
                                      "Scheduled"
                                    )
                                  }
                                >
                                  Scheduled
                                </button>
                              </li>
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() =>
                                    handleStatusChange(
                                      appointment.id,
                                      "In Progress"
                                    )
                                  }
                                >
                                  In Progress
                                </button>
                              </li>
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() =>
                                    handleStatusChange(
                                      appointment.id,
                                      "Completed"
                                    )
                                  }
                                >
                                  Completed
                                </button>
                              </li>
                            </ul>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              title="View Details"
                            >
                              <Eye size={14} />
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              title="Delete"
                              onClick={() => handleDelete(appointment.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {filteredAppointments.length === 0 && (
                <div className="text-center py-5">
                  <p className="text-muted mb-0">
                    {isLoading
                      ? "Loading appointments..."
                      : "No appointments found matching your search."}
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
