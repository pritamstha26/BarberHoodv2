"use client";

import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Form,
  InputGroup,
} from "react-bootstrap";
import {
  User,
  Scissors,
  DollarSign,
  Search,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { useAppointments } from "../../context/appointment_context";

//

export default function BarberList() {
  const { appointments } = useAppointments();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Extract unique barbers from appointments
  const getUniqueBarbers = () => {
    const barberMap = new Map();

    appointments.forEach((appointment) => {
      const barberName = appointment.barberName;
      if (!barberMap.has(barberName)) {
        barberMap.set(barberName, {
          name: barberName,
          appointments: [],
          status: "Active", // Default status
        });
      }
      barberMap.get(barberName).appointments.push(appointment);
    });

    return Array.from(barberMap.values());
  };

  const barbers = getUniqueBarbers();

  // Filter barbers based on search and status
  const filteredBarbers = barbers.filter((barber) => {
    const matchesSearch = barber.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || barber.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get barber statistics
  const getBarberStats = (barberAppointments) => {
    const completed = barberAppointments.filter(
      (app) => app.status === "Completed"
    );
    const scheduled = barberAppointments.filter(
      (app) => app.status === "Scheduled"
    );
    const inProgress = barberAppointments.filter(
      (app) => app.status === "In Progress"
    );
    const totalRevenue = completed.reduce(
      (sum, app) => sum + app.totalPrice,
      0
    );

    return {
      total: barberAppointments.length,
      completed: completed.length,
      scheduled: scheduled.length,
      inProgress: inProgress.length,
      totalRevenue,
      averagePrice: completed.length > 0 ? totalRevenue / completed.length : 0,
      completionRate:
        barberAppointments.length > 0
          ? (completed.length / barberAppointments.length) * 100
          : 0,
    };
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return <Badge bg="success">{status}</Badge>;
      case "On Leave":
        return (
          <Badge bg="warning" text="dark">
            {status}
          </Badge>
        );
      case "Inactive":
        return <Badge bg="danger">{status}</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getPerformanceColor = (rate) => {
    if (rate >= 80) return "success";
    if (rate >= 60) return "warning";
    return "danger";
  };

  return (
    <div className="bg-light min-vh-100 py-3">
      <Container fluid>
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <h1 className="fw-bold text-dark mb-2">Barber Management</h1>
            <p className="lead text-muted">
              Manage your barber team and track their performance
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
                      Total Barbers
                    </Card.Title>
                    <h4 className="fw-bold mb-0">{barbers.length}</h4>
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
                      Active Barbers
                    </Card.Title>
                    <h4 className="fw-bold mb-0">
                      {barbers.filter((b) => b.status === "Active").length}
                    </h4>
                    <small className="text-muted">Currently working</small>
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
                      Total Revenue
                    </Card.Title>
                    <h4 className="fw-bold mb-0">
                      Rs.
                      {barbers
                        .reduce(
                          (sum, barber) =>
                            sum +
                            getBarberStats(barber.appointments).totalRevenue,
                          0
                        )
                        .toFixed(2)}
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
                      Avg Completion Rate
                    </Card.Title>
                    <h4 className="fw-bold mb-0">
                      {barbers.length > 0
                        ? (
                            barbers.reduce(
                              (sum, barber) =>
                                sum +
                                getBarberStats(barber.appointments)
                                  .completionRate,
                              0
                            ) / barbers.length
                          ).toFixed(1)
                        : 0}
                      %
                    </h4>
                  </div>
                  <div className="text-muted">
                    <TrendingUp size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Search and Filter */}
        <Row className="mb-4">
          <Col md={8}>
            <InputGroup>
              <InputGroup.Text>
                <Search size={16} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search barbers by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col md={4}>
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </Form.Select>
          </Col>
        </Row>

        {/* Barber Cards */}
        <Row>
          {filteredBarbers.map((barber, index) => {
            const stats = getBarberStats(barber.appointments);
            const recentServices = [
              ...new Set(barber.appointments.slice(-3).map((app) => app.style)),
            ];

            return (
              <Col lg={4} md={6} className="mb-4" key={index}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Header className="bg-white border-bottom">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center me-3"
                          style={{ width: "48px", height: "48px" }}
                        >
                          <span className="text-primary fw-bold">
                            {getInitials(barber.name)}
                          </span>
                        </div>
                        <div>
                          <h5 className="mb-1">{barber.name}</h5>
                          <small className="text-muted">
                            Barber #{index + 1}
                          </small>
                        </div>
                      </div>
                      {getStatusBadge(barber.status)}
                    </div>
                  </Card.Header>

                  <Card.Body>
                    {/* Performance Stats */}
                    <Row className="g-2 mb-3">
                      <Col xs={6}>
                        <div className="bg-light rounded p-2 text-center">
                          <div className="fw-bold">{stats.total}</div>
                          <small className="text-muted">Total</small>
                        </div>
                      </Col>
                      <Col xs={6}>
                        <div className="bg-success bg-opacity-10 rounded p-2 text-center">
                          <div className="fw-bold text-success">
                            {stats.completed}
                          </div>
                          <small className="text-success">Completed</small>
                        </div>
                      </Col>
                      <Col xs={6}>
                        <div className="bg-primary bg-opacity-10 rounded p-2 text-center">
                          <div className="fw-bold text-primary">
                            {stats.scheduled}
                          </div>
                          <small className="text-primary">Scheduled</small>
                        </div>
                      </Col>
                      <Col xs={6}>
                        <div className="bg-warning bg-opacity-10 rounded p-2 text-center">
                          <div className="fw-bold text-warning">
                            {stats.inProgress}
                          </div>
                          <small className="text-warning">In Progress</small>
                        </div>
                      </Col>
                    </Row>

                    {/* Revenue and Performance */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted">Total Revenue:</span>
                        <span className="fw-bold text-success">
                          Rs.{stats.totalRevenue.toFixed(2)}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted">Avg Price:</span>
                        <span className="fw-bold">
                          Rs.{stats.averagePrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted">Completion Rate:</span>
                        <Badge bg={getPerformanceColor(stats.completionRate)}>
                          {stats.completionRate.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>

                    {/* Recent Services */}
                    <div className="mb-3">
                      <h6 className="fw-bold mb-2">Recent Services:</h6>
                      <div className="d-flex flex-wrap gap-1">
                        {recentServices.map((style, idx) => (
                          <Badge
                            key={idx}
                            bg="light"
                            text="dark"
                            className="border"
                          >
                            {style}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-grid gap-2">
                      <Button variant="outline-primary" size="sm">
                        <Calendar size={14} className="me-1" />
                        View Schedule
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>

        {filteredBarbers.length === 0 && (
          <Row>
            <Col>
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center py-5">
                  <User size={48} className="text-muted mb-3" />
                  <h5 className="mb-2">No barbers found</h5>
                  <p className="text-muted">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "No barbers available"}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
}
