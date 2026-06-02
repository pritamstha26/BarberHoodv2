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
  FaUserAlt,
  FaCalendar,
  FaList,
} from "react-icons/fa";
import { ImCross } from "react-icons/im";
import api from "../../apis/api";
import { Spinner } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";

const Dashboard = () => {
  const [allServiceRequests, setAllServiceRequests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [debugInfo, setDebugInfo] = useState({
    lastRequest: null,
    lastResponse: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState("success");

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <FaCheckCircle className="text-success me-2" />;
      case "confirmed":
        return <FaCheckCircle className="text-success me-2" />;
      case "Confirmed":
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
      case "accepted":
        return "success";
      case "confirmed":
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
    appointments: appointments.length,
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await api.put(`/services/${id}`, { status: newStatus });

      window.confirm("Are you sure you want to cancel the request?");
      if (response.status === 200) {
        setAllServiceRequests((prevRequests) =>
          prevRequests.map((request) =>
            request.id === id ? { ...request, status: newStatus } : request,
          ),
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

  const showAlertMessage = (message, variant) => {
    setAlertMessage(message);
    setAlertVariant(variant);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem("access_token");
      if (!token) return;

      const decoded = jwtDecode(token);
      const userId = decoded.id;
      console.log("Decoded token for appointments (client):", decoded);
      if (!userId) {
        console.error("No userId found in token, skipping appointments fetch");
        return;
      }

      // Call the canonical endpoint. If backend fails, surface its message.
      try {
        const response = await api.get(`/appointments/client/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDebugInfo({
          lastRequest: { endpoint: `/appointments/client/${userId}` },
          lastResponse: response.data,
        });
        if (response.status === 200) {
          setAppointments(response.data.data || []);
        } else {
          console.warn(
            "Non-200 response fetching appointments:",
            response.status,
            response.data,
          );
          setAppointments([]);
        }
      } catch (err) {
        console.error(
          "Error fetching appointments (single endpoint):",
          err,
          err.response?.data,
        );
        const serverMessage =
          err.response?.data?.message || err.response?.data || err.message;

        // Save initial failure info
        setDebugInfo({
          lastRequest: { endpoint: `/appointments/client/${userId}` },
          lastResponse: err.response?.data || err.message,
        });

        // If the error indicates Sequelize multiple associations, try safe fallbacks
        const assocErrorText =
          typeof serverMessage === "string"
            ? serverMessage
            : JSON.stringify(serverMessage || "");

        if (
          assocErrorText.includes(
            "associated to AppointmentModel multiple times",
          ) ||
          assocErrorText.includes("specify the alias")
        ) {
          // Try a short list of fallback endpoints that some backends expose
          const fallbacks = [
            `/appointments?client_id=${userId}`,
            `/appointments?user_id=${userId}`,
            `/appointments?client=${userId}`,
            `/appointments?user=${userId}`,
          ];

          let fallbackSuccess = false;
          for (const ep of fallbacks) {
            try {
              const r = await api.get(ep, {
                headers: { Authorization: `Bearer ${token}` },
              });
              setDebugInfo((d) => ({
                ...d,
                fallbackAttempt: { endpoint: ep, response: r.data },
              }));
              if (r.status === 200) {
                setAppointments(r.data.data || r.data || []);
                fallbackSuccess = true;
                break;
              }
            } catch (e2) {
              // continue trying next fallback
              setDebugInfo((d) => ({
                ...d,
                fallbackAttempt: {
                  endpoint: ep,
                  error: e2.response?.data || e2.message,
                },
              }));
            }
          }

          if (!fallbackSuccess) {
            showAlertMessage(
              `Server error fetching appointments: ${assocErrorText}. Backend needs association alias fix.`,
              "danger",
            );
            setAppointments([]);
          }
        } else {
          showAlertMessage(
            `Failed to load appointments: ${JSON.stringify(serverMessage)}`,
            "danger",
          );
        }
      }
    } catch (error) {
      console.error(
        "Error fetching appointments:",
        error,
        error.response?.data,
      );
      const serverMessage =
        error.response?.data?.message || error.response?.data || error.message;
      showAlertMessage(
        `Failed to load appointments: ${JSON.stringify(serverMessage)}`,
        "danger",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      if (
        !window.confirm("Are you sure you want to cancel this appointment?")
      ) {
        return;
      }

      setIsLoading(true);
      const token = sessionStorage.getItem("access_token");

      const response = await api.put(
        `/appointments/${appointmentId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 200) {
        showAlertMessage("Appointment cancelled successfully!", "warning");
        // Update appointments list
        await fetchAppointments();
      } else {
        showAlertMessage("Failed to cancel appointment", "danger");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      showAlertMessage(
        `Error: ${error.response?.data?.message || error.message}`,
        "danger",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const appointmentLength = allServiceRequests.length;
  useEffect(() => {
    fetchServiceRequests();
    fetchAppointments();
  }, []);
  return (
    <Container fluid className="p-4">
      <div className="mb-4">
        <h1 className="display-5 fw-bold text-dark mb-2">Dashboard</h1>
        <p className="text-muted">
          Welcome back! Here's an overview of your appointments and service
          requests.
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

        <Col md={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <Card.Text className="text-muted mb-1 small">
                    Appointments
                  </Card.Text>
                  <Card.Title className="display-6 fw-bold mb-0 text-info">
                    {stats.appointments}
                  </Card.Title>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <FaCalendar className="text-info fs-4" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Appointments Card */}
      {/* Alert message */}
      {showAlert && (
        <div
          className={`alert alert-${alertVariant} alert-dismissible fade show mb-4`}
          role="alert"
        >
          {alertMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowAlert(false)}
            aria-label="Close"
          ></button>
        </div>
      )}

      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
          <Card.Title className="mb-0 h5">
            <FaCalendar className="me-2 text-primary" /> Your Appointments
          </Card.Title>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => fetchAppointments()}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Loading...
              </>
            ) : (
              "Refresh"
            )}
          </Button>
        </Card.Header>
        <Card.Body>
          {appointments && appointments.length > 0 ? (
            <Row>
              {appointments.map((appointment) => (
                <Col md={4} key={appointment.id} className="mb-3">
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Header className="bg-light">
                      <h6 className="mb-0 text-primary">
                        {appointment.service_name}
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                          <FaUserAlt className="text-primary fs-4" />
                        </div>
                        <div>
                          <h5 className="mb-0">
                            {appointment.restaurateur_name ||
                              "No Restaurant Assigned"}
                          </h5>
                          <p className="text-muted small mb-0">
                            Your Restaurant
                          </p>
                        </div>
                      </div>
                      <div className="mb-2">
                        <strong>Date & Time:</strong>{" "}
                        {new Date(appointment.date).toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </div>
                      <div className="mb-2">
                        <strong>Duration:</strong> {appointment.duration}{" "}
                        minutes
                      </div>
                      <div className="mb-2">
                        <strong>Price:</strong> Rs. {appointment.price}
                      </div>
                      <div className="mb-2">
                        <strong>Status:</strong>{" "}
                        <Badge bg={getStatusVariant(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </Card.Body>
                    <Card.Footer className="bg-white border-top">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="w-100"
                        disabled={
                          appointment.status === "completed" ||
                          appointment.status === "cancelled"
                        }
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        Cancel Appointment
                      </Button>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Alert variant="info">
              You have no scheduled appointments. Visit the Nearby Restaurant
              section to book an appointment.
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Requests Table */}
    </Container>
  );
};

export default Dashboard;
