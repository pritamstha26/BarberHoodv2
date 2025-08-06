import { use, useEffect, useState } from "react";
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
import api from "../../apis/api";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Plus } from "lucide-react";
import axios from "axios";

export default function BarberDashboard() {
  const [activeTab, setActiveTab] = useState("requests");
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState("success");
  //
  const [barberInfo, setBarberInfo] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone_number: "",
  });
  const [serviceDataForm, setServiceDataForm] = useState({
    name: "",
    price: "",
    duration: "",
  });

  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(!show);
  const handleService = (service) => {
    setSelectedService(service);
    setShow(true);
  };
  const getServices = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await api.get("/barber-services/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        setServices(response.data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };
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

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };
  const handleAddService = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/barber-services/", // Change to your backend URL
        serviceDataForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Service added successfully");
      setShow(false);
      location.reload();
    } catch (error) {
      console.error("Error adding service:", error.response?.data || error);
      alert("Failed to add service");
    }
  };

  const handleUpdateBarber = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const decode = jwtDecode(token);

      const updatedData = { ...formData };

      // Remove password field if it's empty or only whitespace
      if (!updatedData.password?.trim()) {
        delete updatedData.password;
      }

      const response = await api.put(`/users/${decode.id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        alert("successfully ");
        localStorage.removeItem("access_token");
        navigate("/login");
      }
    } catch (error) {
      console.error("An error occurred while updating the barber:", error);
    }
  };
  const handleUpdateService = async () => {
    const token = localStorage.getItem("access_token");
    const service = selectedService;
    await api.put(`/barber-services/${service.id}`, serviceDataForm, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setShow(false);
    await getServices();
  };

  const fetchAllServiceRequests = async () => {
    // Simulate fetching data from an API
    try {
      const token = localStorage.getItem("access_token");
      // const response = await api.get(`/appointments/all`, {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // });
      // if (response.status === 200) {
      //   // setRequests(response.data);
      //   console.log("data fetched", response.data);
      // }
    } catch (error) {
      console.error("Error fetching service requests:", error);
    }
  };

  const fetchUserById = async () => {
    const token = localStorage.getItem("access_token");
    const decode = jwtDecode(token);
    const response = await api.get(`/users/${decode.id}`);
    if (response.status === 200) {
      setBarberInfo(response.data.data);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleServiceChange = (e) => {
    const { name, value } = e.target;
    setServiceDataForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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
              <h3>Rs.{appointments.length * 22}</h3>
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
          {appointments.length > 0 ? (
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
          ) : (
            <tbody key={appointments.id}>
              <tr>
                <td>No appointments</td>
              </tr>
            </tbody>
          )}
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
              <th>Status</th>
              <th>Service Type</th>
              <th>prefer_contact_method</th>
              <th>Deadline</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id}>
                <td>
                  {request.user.first_name} {request.user.last_name}
                </td>
                <td>
                  <Badge bg={getStatusVariant(request.status)}>
                    {request.status}
                  </Badge>
                </td>
                <td>{request.service_type}</td>
                <td>{request.prefer_contact_method}</td>
                <td>{request.deadline}</td>
                <td>{request.price}</td>
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
        <div className="page-title d-flex justify-content-between align-items-center">
          <div>
            <h2>Services</h2>
            <p className="text-muted">Manage your service offerings</p>
          </div>
          <Button variant="primary" onClick={() => setShow(true)}>
            <Plus size={20} /> Add New Service
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <Row>
          {services?.map((service) => (
            <Col md={4} className="mb-3" key={service.id}>
              <Card className="h-100">
                <Card.Body className="text-center">
                  <FaCut className="mb-2" size={30} />
                  <Card.Title>{service?.name}</Card.Title>
                  <Card.Text>
                    <strong>Price:</strong> {service?.price}
                    <br />
                    <strong>Duration:</strong> {service?.duration}
                  </Card.Text>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleService(service)}
                  >
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
                <Form.Label>First name</Form.Label>
                <Form.Control
                  className="text-capitalize"
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Last name</Form.Label>
                <Form.Control
                  type="text"
                  name="last_name"
                  className="text-capitalize"
                  value={formData.last_name}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Contact Phone</Form.Label>
                <Form.Control
                  type="number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>{" "}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  placeholder="Enter your password"
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Button variant="primary" onClick={handleUpdateBarber}>
            Save Settings
          </Button>
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
  useEffect(() => {
    fetchAllServiceRequests();
    fetchUserById();
    getServices();
  }, []);
  useEffect(() => {
    if (barberInfo) {
      setFormData({
        first_name: barberInfo.first_name,
        last_name: barberInfo.last_name,
        email: barberInfo.email,
        password: "",
        phone_number: barberInfo.phone_number,
      });
    }
  }, [barberInfo]);
  useEffect(() => {
    if (selectedService) {
      setServiceDataForm({
        name: selectedService.name || "",
        price: selectedService.price || "",

        duration: selectedService.duration || "",
      });
    }
  }, [selectedService]);
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
              onClick={handleLogout}
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
            <Navbar.Brand>
              Welcome,
              <span className="fw-bold text-capitalize">
                {formData.first_name} {formData.last_name}
              </span>
              !
            </Navbar.Brand>
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
                <strong>Client:</strong> {selectedRequest.user.first_name}{" "}
                {selectedRequest.user.last_name}
              </p>
              <p>
                <strong>Service:</strong> {selectedRequest.service_type}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <Badge bg={getStatusVariant(selectedRequest.status)}>
                  {selectedRequest.status}
                </Badge>
              </p>
              <p>
                <strong>Deadline:</strong> {selectedRequest.deadline}
              </p>
              <p>
                <strong>Email:</strong> {selectedRequest.user.email}
              </p>
              <p>
                <strong>Description:</strong> {selectedRequest.description}
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
      {/* Service edit Modal */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Services</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="edit service price">
              <Form.Label className="fw-bold">Title</Form.Label>
              <Form.Control
                type="text"
                value={serviceDataForm.name || ""}
                name="name"
                onChange={handleServiceChange}
                autoFocus
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="edit service price">
              <Form.Label className="fw-bold">Price</Form.Label>
              <Form.Control
                type="number"
                value={serviceDataForm?.price || ""}
                onChange={handleServiceChange}
                name="price"
                autoFocus
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId=" edit service price">
              <Form.Label className="fw-bold">Duration</Form.Label>
              <Form.Control
                type="number"
                onChange={handleServiceChange}
                name="duration"
                autoFocus
                value={serviceDataForm?.duration || ""}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdateService}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
      {/* add services */}
      <Modal show={show} onHide={setShow}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Service</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Title </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter the title"
                    name="name"
                    onChange={handleServiceChange}
                    value={serviceDataForm.title}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Price (Rs)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter price"
                    name="price"
                    onChange={handleServiceChange}
                    value={serviceDataForm.price}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Duration (in minutes)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter duration"
                    name="duration"
                    value={serviceDataForm.duration}
                    onChange={handleServiceChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddService}>
            Add Service
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
