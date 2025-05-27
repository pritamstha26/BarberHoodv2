import { useState } from "react";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import { Scissors, User, DollarSign } from "lucide-react";

// Sample data for the barbershop dashboard

export default function BarbershopDashboard() {
  const [appointmentDetails, setAppointmentDetails] = useState([
    {
      id: "1",
      clientName: "User1",
      style: "style1",
      barberName: "barber1",
      contactNumber: "1111111111",
      totalPrice: 35.0,
      status: "Completed",
    },
    {
      id: "2",
      clientName: "User2",
      style: "style2",
      barberName: "barber2",
      contactNumber: "2222222",
      totalPrice: 45.0,
      status: "In Progress",
    },
    {
      id: "3",
      clientName: "User3",
      style: "style3",
      barberName: "barber3",
      contactNumber: "333333333333",
      totalPrice: 25.0,
      status: "Scheduled",
    },
    {
      id: "4",
      clientName: "User4",
      style: "style4",
      barberName: "barber4",
      contactNumber: "444444444444",
      totalPrice: 50.0,
      status: "Completed",
    },
  ]);

  // Calculate summary statistics
  const totalRevenue = appointmentDetails.reduce(
    (sum, appointment) => sum + appointment.totalPrice,
    0
  );
  const completedAppointments = appointmentDetails.filter(
    (app) => app.status === "Completed"
  ).length;
  const totalAppointments = appointmentDetails.length;

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
  const handleAppointmentDelete = (idToDelete) => {
    const updatedAppointments = appointmentDetails.filter(
      (prevAppointments) => prevAppointments.id !== idToDelete
    );
    setAppointmentDetails(updatedAppointments);
  };

  return (
    <div className="bg-light min-vh-100 py-3">
      <Container fluid>
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <h1 className=" fw-bold text-dark mb-2">Barbershop Dashboard</h1>
            <p className="lead text-muted">
              Manage your appointments and track your business
            </p>
          </Col>
        </Row>

        {/* Summary Cards */}
        <Row className="mb-4">
          <Col lg={3} md={6} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Card.Title className="text-muted fs-6 fw-normal mb-1">
                      Total Appointments
                    </Card.Title>
                    <h4 className="fw-bold mb-0">{totalAppointments}</h4>
                  </div>
                  <div className="text-muted">
                    <Scissors size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Card.Title className="text-muted fs-6 fw-normal mb-1">
                      Completed
                    </Card.Title>
                    <h4 className="fw-bold mb-0">{completedAppointments}</h4>
                    <small className="text-muted">Finished services</small>
                  </div>
                  <div className="text-muted">
                    <User size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Card.Title className="text-muted fs-6 fw-normal mb-1">
                      Total Revenue
                    </Card.Title>
                    <h4 className="fw-bold mb-0">
                      Rs.{totalRevenue.toFixed(2)}
                    </h4>
                  </div>
                  <div className="text-muted">
                    <DollarSign size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Card.Title className="text-muted fs-6 fw-normal mb-1">
                      Average Price
                    </Card.Title>
                    <h4 className="fw-bold mb-0">
                      Rs.
                      {totalAppointments > 0
                        ? (totalRevenue / totalAppointments).toFixed(2)
                        : "0.00"}
                    </h4>
                    <small className="text-muted">Per appointment</small>
                  </div>
                  <div className="text-muted">
                    <DollarSign size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Appointments Table */}
        {/* <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white">
                <Card.Title className="mb-0">Appointments</Card.Title>
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
                        <th style={{ width: "120px" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointmentDetails.map((appointment) => (
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
                          <td className="fw-medium">
                            {appointment.barberName}
                          </td>
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
                          <td>{getStatusBadge(appointment.status)}</td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button variant="outline-success" size="sm">
                                <Pencil size={14} />
                              </Button>
                              <Button
                                variant="outline-danger "
                                onClick={() =>
                                  handleAppointmentDelete(appointment.id)
                                }
                                size="sm"
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
              </Card.Body>
            </Card>
          </Col>
        </Row> */}
      </Container>
    </div>
  );
}
