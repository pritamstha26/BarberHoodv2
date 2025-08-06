import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Alert,
} from "react-bootstrap";
import {
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import { ImCross } from "react-icons/im";
import api from "../../apis/api";

const Dashboard = () => {
  const [allServiceRequests, setAllServiceRequests] = useState([]);

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
      case "completed":
        return "success";
      case "in_progress":
        return "primary";
      case "pending":
        return "warning";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  const stats = {
    total: allServiceRequests.length,
    completed: allServiceRequests.filter((r) => r.status === "completed")
      .length,
    terminated: allServiceRequests.filter((r) => r.status === "cancelled")
      .length,
    pending: allServiceRequests.filter((r) => r.status === "pending").length,
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await api.put(`/services/${id}`, { status: newStatus });

      window.confirm("Are you sure you want to cancel the request?");
      if (response.status === 200) {
        setAllServiceRequests((prevRequests) =>
          prevRequests.map((request) =>
            request.id === id ? { ...request, status: newStatus } : request
          )
        );
      } else {
        console.error("Failed to update status:", response.data);
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status");
    }
  };

  const fetchServiceRequests = async () => {
    try {
      const response = await api.get("/services");
      if (response.status === 200) {
        setAllServiceRequests(response.data);
      }
    } catch (error) {
      console.error("Error fetching service requests:", error);
    }
  };

  const appointmentLength = allServiceRequests.length;
  useEffect(() => {
    fetchServiceRequests();
  }, []);
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
                    Terminated
                  </Card.Text>
                  <Card.Title className="display-6 fw-bold mb-0 text-primary">
                    {stats.terminated}
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
                <th className="px-4 py-3">SN</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Service Type</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Deadline </th>
                <th className="px-4 py-3">Contact Method</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {allServiceRequests.map((request, appointmentLength) => (
                <tr key={request.id}>
                  <td className="px-4 py-3">
                    <div className="d-flex align-items-center">
                      <span className="fw-medium">{appointmentLength + 1}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge bg={getStatusVariant(request.status)}>
                      {request.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="fw-medium">{request.title}</div>
                      <small className="text-muted">
                        {request.description}
                      </small>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge bg={getStatusVariant("")}>
                      {request.service_type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{request.price}</td>
                  <td className="px-4 py-3">
                    {new Date(request.deadline).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </td>
                  <td className="px-4 py-3">{request.prefer_contact_method}</td>
                  <td className="px-4 py-3">
                    <Button
                      className={`${
                        request.status === "cancelled" ||
                        request.status === "completed"
                          ? " bg-secondary-subtle btn-outline-dark "
                          : " bg-white btn-outline-danger "
                      }`}
                      onClick={() =>
                        handleStatusChange(request.id, "cancelled")
                      }
                      disabled={
                        request.status === "cancelled" ||
                        request.status === "completed"
                      }
                    >
                      <ImCross
                        color={
                          request.status === "cancelled" ||
                          request.status === "completed"
                            ? "black"
                            : "red"
                        }
                      />
                    </Button>
                  </td>
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
