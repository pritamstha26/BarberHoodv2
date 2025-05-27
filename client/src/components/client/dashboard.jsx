import React, { useState } from "react";
import { Container, Row, Col, Card, Table, Badge } from "react-bootstrap";
import {
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
} from "react-icons/fa";

const Dashboard = () => {
  const [requests] = useState([
    {
      id: "REQ-001",
      service: "Website Development",
      status: "In Progress",
      priority: "High",
      dateRequested: "2024-01-15",
      estimatedCompletion: "2024-02-15",
      description: "Custom e-commerce website with payment integration",
    },
    {
      id: "REQ-002",
      service: "Mobile App Design",
      status: "Completed",
      priority: "Medium",
      dateRequested: "2024-01-10",
      estimatedCompletion: "2024-01-25",
      description: "UI/UX design for iOS and Android mobile application",
    },
    {
      id: "REQ-003",
      service: "SEO Optimization",
      status: "Pending",
      priority: "Low",
      dateRequested: "2024-01-20",
      estimatedCompletion: "2024-02-05",
      description: "Search engine optimization for existing website",
    },
    {
      id: "REQ-004",
      service: "Database Migration",
      status: "Cancelled",
      priority: "High",
      dateRequested: "2024-01-12",
      estimatedCompletion: "2024-01-30",
      description: "Migration from MySQL to PostgreSQL database",
    },
    {
      id: "REQ-005",
      service: "Cloud Migration",
      status: "In Progress",
      priority: "Medium",
      dateRequested: "2024-01-18",
      estimatedCompletion: "2024-02-20",
      description: "Migration of services to AWS cloud infrastructure",
    },
  ]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <FaCheckCircle className="text-success me-2" />;
      case "In Progress":
        return <FaClock className="text-primary me-2" />;
      case "Pending":
        return <FaExclamationCircle className="text-warning me-2" />;
      case "Cancelled":
        return <FaTimesCircle className="text-danger me-2" />;
      default:
        return <FaClock className="text-secondary me-2" />;
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "Completed":
        return "success";
      case "In Progress":
        return "primary";
      case "Pending":
        return "warning";
      case "Cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case "High":
        return "danger";
      case "Medium":
        return "warning";
      case "Low":
        return "success";
      default:
        return "secondary";
    }
  };

  const stats = {
    total: requests.length,
    completed: requests.filter((r) => r.status === "Completed").length,
    inProgress: requests.filter((r) => r.status === "In Progress").length,
    pending: requests.filter((r) => r.status === "Pending").length,
  };

  return (
    <Container fluid className="p-4">
      <div className="mb-4">
        <h1 className="display-5 fw-bold text-dark mb-2">Dashboard</h1>
        <p className="text-muted">
          Welcome back! Here's an overview of your service requests.
        </p>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <Card.Text className="text-muted mb-1 small">
                    Total Requests
                  </Card.Text>
                  <Card.Title className="display-6 fw-bold mb-0">
                    {stats.total}
                  </Card.Title>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <FaCalendarAlt className="text-primary fs-4" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <Card.Text className="text-muted mb-1 small">
                    Completed
                  </Card.Text>
                  <Card.Title className="display-6 fw-bold mb-0 text-success">
                    {stats.completed}
                  </Card.Title>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <FaCheckCircle className="text-success fs-4" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <Card.Text className="text-muted mb-1 small">
                    In Progress
                  </Card.Text>
                  <Card.Title className="display-6 fw-bold mb-0 text-primary">
                    {stats.inProgress}
                  </Card.Title>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <FaClock className="text-primary fs-4" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <Card.Text className="text-muted mb-1 small">
                    Pending
                  </Card.Text>
                  <Card.Title className="display-6 fw-bold mb-0 text-warning">
                    {stats.pending}
                  </Card.Title>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <FaExclamationCircle className="text-warning fs-4" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Requests Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <Card.Title className="mb-0 h5">Recent Service Requests</Card.Title>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th className="px-4 py-3">Request ID</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Date Requested</th>
                <th className="px-4 py-3">Est. Completion</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td className="px-4 py-3">
                    <div className="d-flex align-items-center">
                      {getStatusIcon(request.status)}
                      <span className="fw-medium">{request.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="fw-medium">{request.service}</div>
                      <small className="text-muted">
                        {request.description}
                      </small>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge bg={getStatusVariant(request.status)}>
                      {request.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      bg={getPriorityVariant(request.priority)}
                      className="text-white"
                    >
                      {request.priority}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{request.dateRequested}</td>
                  <td className="px-4 py-3">{request.estimatedCompletion}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Dashboard;
