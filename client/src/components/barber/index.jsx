"use client";

import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Navbar,
  Nav,
  Card,
  Table,
  Button,
  Badge,
  Modal,
  Form,
  Alert,
} from "react-bootstrap";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaUserClock,
  FaCut,
  FaCog,
  FaSignOutAlt,
  FaCheck,
  FaTimes,
  FaEye,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

// Mock data
const mockAppointments = [
  {
    id: 1,
    clientName: "John Doe",
    service: "Mullet",
    date: "2024-01-15",
    time: "10:00 AM",
    status: "confirmed",
    phone: "+1234567890",
  },
  {
    id: 2,
    clientName: "Mike Smith",
    service: "Slope Cut",
    date: "2024-01-15",
    time: "2:00 PM",
    status: "confirmed",
    phone: "+1234567891",
  },
  {
    id: 3,
    clientName: "David Wilson",
    service: "Beard Trim",
    date: "2024-01-16",
    time: "11:00 AM",
    status: "pending",
    phone: "+1234567892",
  },
];

const mockRequests = [
  {
    id: 1,
    clientName: "Alex Johnson",
    service: "Fade Cut",
    requestedDate: "2024-01-17",
    requestedTime: "3:00 PM",
    phone: "+1234567893",
    message: "Need a fresh fade for a job interview",
  },
  {
    id: 2,
    clientName: "Chris Brown",
    service: "Mullet",
    requestedDate: "2024-01-18",
    requestedTime: "1:00 PM",
    phone: "+1234567894",
    message: "Regular customer, usual style",
  },
];

const serviceTypes = [
  { id: 1, name: "Mullet", price: "$25", duration: "45 min" },
  { id: 2, name: "Slope Cut", price: "$20", duration: "30 min" },
  { id: 3, name: "Fade Cut", price: "$22", duration: "35 min" },
  { id: 4, name: "Buzz Cut", price: "$15", duration: "20 min" },
  { id: 5, name: "Beard Trim", price: "$12", duration: "25 min" },
  { id: 6, name: "Full Service", price: "$35", duration: "60 min" },
];

export default function BarberDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [appointments, setAppointments] = useState(mockAppointments);
  const [requests, setRequests] = useState(mockRequests);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState("success");

  const handleApproveRequest = (requestId) => {
    const request = requests.find((r) => r.id === requestId);
    if (request) {
      const newAppointment = {
        id: appointments.length + 1,
        clientName: request.clientName,
        service: request.service,
        date: request.requestedDate,
        time: request.requestedTime,
        status: "confirmed",
        phone: request.phone,
      };
      setAppointments([...appointments, newAppointment]);
      setRequests(requests.filter((r) => r.id !== requestId));
      showAlertMessage(
        "Request approved and appointment scheduled!",
        "success"
      );
    }
  };

  const handleDenyRequest = (requestId) => {
    setRequests(requests.filter((r) => r.id !== requestId));
    showAlertMessage("Request denied and removed.", "warning");
  };

  const showAlertMessage = (message, variant) => {
    setAlertMessage(message);
    setAlertVariant(variant);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const viewRequestDetails = (request) => {
    setSelectedRequest(request);
    setShowRequestModal(true);
  };

  const renderDashboard = () => (
    <div>
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center bg-primary text-white">
            <Card.Body>
              <h3>{appointments.length}</h3>
              <p>Total Appointments</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center bg-success text-white">
            <Card.Body>
              <h3>
                {appointments.filter((a) => a.status === "confirmed").length}
              </h3>
              <p>Confirmed</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center bg-warning text-white">
            <Card.Body>
              <h3>{requests.length}</h3>
              <p>Pending Requests</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center bg-info text-white">
            <Card.Body>
              <h3>${appointments.length * 22}</h3>
              <p>Est. Revenue</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <h5>Today's Appointments</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive striped>
            <thead>
              <tr>
                <th>Client</th>
                <th>Service</th>
                <th>Time</th>
                <th>Status</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {appointments.slice(0, 5).map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.clientName}</td>
                  <td>{appointment.service}</td>
                  <td>{appointment.time}</td>
                  <td>
                    <Badge
                      bg={
                        appointment.status === "confirmed"
                          ? "success"
                          : "warning"
                      }
                    >
                      {appointment.status}
                    </Badge>
                  </td>
                  <td>{appointment.phone}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );

  const renderAppointments = () => (
    <Card>
      <Card.Header>
        <h5>All Appointments</h5>
      </Card.Header>
      <Card.Body>
        <Table responsive striped hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Client Name</th>
              <th>Service</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>{appointment.id}</td>
                <td>{appointment.clientName}</td>
                <td>{appointment.service}</td>
                <td>{appointment.date}</td>
                <td>{appointment.time}</td>
                <td>
                  <Badge
                    bg={
                      appointment.status === "confirmed" ? "success" : "warning"
                    }
                  >
                    {appointment.status}
                  </Badge>
                </td>
                <td>{appointment.phone}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );

  const renderRequests = () => (
    <Card>
      <Card.Header>
        <h5>Client Requests</h5>
      </Card.Header>
      <Card.Body>
        <Table responsive striped hover>
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Service</th>
              <th>Requested Date</th>
              <th>Requested Time</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id}>
                <td>{request.clientName}</td>
                <td>{request.service}</td>
                <td>{request.requestedDate}</td>
                <td>{request.requestedTime}</td>
                <td>{request.phone}</td>
                <td>
                  <Button
                    variant="outline-info"
                    size="sm"
                    className="me-2"
                    onClick={() => viewRequestDetails(request)}
                  >
                    <FaEye />
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    className="me-2"
                    onClick={() => handleApproveRequest(request.id)}
                  >
                    <FaCheck />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDenyRequest(request.id)}
                  >
                    <FaTimes />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {requests.length === 0 && (
          <div className="text-center text-muted py-4">
            <p>No pending requests</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );

  const renderServices = () => (
    <Card>
      <Card.Header>
        <h5>Service Types</h5>
      </Card.Header>
      <Card.Body>
        <Row>
          {serviceTypes.map((service) => (
            <Col md={4} className="mb-3" key={service.id}>
              <Card className="h-100">
                <Card.Body className="text-center">
                  <FaCut className="mb-2" size={30} />
                  <Card.Title>{service.name}</Card.Title>
                  <Card.Text>
                    <strong>Price:</strong> {service.price}
                    <br />
                    <strong>Duration:</strong> {service.duration}
                  </Card.Text>
                  <Button variant="outline-primary" size="sm">
                    Edit Service
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Card.Body>
    </Card>
  );

  const renderSettings = () => (
    <Card>
      <Card.Header>
        <h5>Settings</h5>
      </Card.Header>
      <Card.Body>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Barber Shop Name</Form.Label>
                <Form.Control type="text" defaultValue="Mike's Barber Shop" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Contact Phone</Form.Label>
                <Form.Control type="tel" defaultValue="+1234567890" />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Opening Time</Form.Label>
                <Form.Control type="time" defaultValue="09:00" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Closing Time</Form.Label>
                <Form.Control type="time" defaultValue="18:00" />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Address</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              defaultValue="123 Main Street, City, State 12345"
            />
          </Form.Group>
          <Button variant="primary">Save Settings</Button>
        </Form>
      </Card.Body>
    </Card>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "appointments":
        return renderAppointments();
      case "requests":
        return renderRequests();
      case "services":
        return renderServices();
      case "settings":
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <div
        className="bg-dark text-white"
        style={{ width: "250px", minHeight: "100vh" }}
      >
        <div className="p-3">
          <h4 className="mb-4">
            <FaCut className="me-2" />
            Barber Dashboard
          </h4>
          <Nav className="flex-column">
            <Nav.Link
              className={`text-white mb-2 ${
                activeTab === "dashboard" ? "bg-primary rounded" : ""
              }`}
              onClick={() => setActiveTab("dashboard")}
              style={{ cursor: "pointer" }}
            >
              <FaTachometerAlt className="me-2" />
              Dashboard
            </Nav.Link>
            <Nav.Link
              className={`text-white mb-2 ${
                activeTab === "appointments" ? "bg-primary rounded" : ""
              }`}
              onClick={() => setActiveTab("appointments")}
              style={{ cursor: "pointer" }}
            >
              <FaCalendarAlt className="me-2" />
              Appointments
            </Nav.Link>
            <Nav.Link
              className={`text-white mb-2 ${
                activeTab === "requests" ? "bg-primary rounded" : ""
              }`}
              onClick={() => setActiveTab("requests")}
              style={{ cursor: "pointer" }}
            >
              <FaUserClock className="me-2" />
              Client Requests
              {requests.length > 0 && (
                <Badge bg="danger" className="ms-2">
                  {requests.length}
                </Badge>
              )}
            </Nav.Link>
            <Nav.Link
              className={`text-white mb-2 ${
                activeTab === "services" ? "bg-primary rounded" : ""
              }`}
              onClick={() => setActiveTab("services")}
              style={{ cursor: "pointer" }}
            >
              <FaCut className="me-2" />
              Services
            </Nav.Link>
            <Nav.Link
              className={`text-white mb-2 ${
                activeTab === "settings" ? "bg-primary rounded" : ""
              }`}
              onClick={() => setActiveTab("settings")}
              style={{ cursor: "pointer" }}
            >
              <FaCog className="me-2" />
              Settings
            </Nav.Link>
            <hr />
            <Nav.Link
              className="text-white"
              onClick={() => alert("Logging out...")}
              style={{ cursor: "pointer" }}
            >
              <FaSignOutAlt className="me-2" />
              Logout
            </Nav.Link>
          </Nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1">
        <Navbar bg="light" expand="lg" className="border-bottom">
          <Container fluid>
            <Navbar.Brand>Welcome, Mike!</Navbar.Brand>
            <Navbar.Text className="ms-auto">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Navbar.Text>
          </Container>
        </Navbar>

        <Container fluid className="p-4">
          {showAlert && (
            <Alert
              variant={alertVariant}
              dismissible
              onClose={() => setShowAlert(false)}
            >
              {alertMessage}
            </Alert>
          )}
          {renderContent()}
        </Container>
      </div>

      {/* Request Details Modal */}
      <Modal show={showRequestModal} onHide={() => setShowRequestModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <div>
              <p>
                <strong>Client:</strong> {selectedRequest.clientName}
              </p>
              <p>
                <strong>Service:</strong> {selectedRequest.service}
              </p>
              <p>
                <strong>Requested Date:</strong> {selectedRequest.requestedDate}
              </p>
              <p>
                <strong>Requested Time:</strong> {selectedRequest.requestedTime}
              </p>
              <p>
                <strong>Phone:</strong> {selectedRequest.phone}
              </p>
              <p>
                <strong>Message:</strong> {selectedRequest.message}
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowRequestModal(false)}
          >
            Close
          </Button>
          {selectedRequest && (
            <>
              <Button
                variant="success"
                onClick={() => {
                  handleApproveRequest(selectedRequest.id);
                  setShowRequestModal(false);
                }}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  handleDenyRequest(selectedRequest.id);
                  setShowRequestModal(false);
                }}
              >
                Deny
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
