import { useState, useEffect } from "react";
import { Container, Spinner, Alert, Badge, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import api from "../apis/api";

export default function AppointmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelInProgress, setCancelInProgress] = useState(false);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = sessionStorage.getItem("access_token");
        const response = await api.get(`/appointments/${id}`, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        });
        if (response.status === 200) {
          const data = response.data?.data || response.data;
          setAppointment(data);
        } else {
          setError("Appointment not found");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load appointment");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAppointment();
    }
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      setCancelInProgress(true);
      const token = sessionStorage.getItem("access_token");
      const response = await api.put(
        `/appointments/${id}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        alert("Appointment cancelled successfully");
        navigate("/client");
      } else {
        alert(response.data?.message || "Failed to cancel appointment");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error cancelling appointment");
    } finally {
      setCancelInProgress(false);
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
      case "no_show":
        return "danger";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
        <Spinner animation="border" variant="secondary" />
      </Container>
    );
  }

  if (error || !appointment) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error || "Appointment not found"}</Alert>
        <Button variant="secondary" onClick={() => navigate("/client")}>Back to Dashboard</Button>
      </Container>
    );
  }

  const canCancel = appointment.status !== "cancelled" && appointment.status !== "completed" && appointment.status !== "no_show";

  return (
    <Container className="py-5" style={{ maxWidth: "800px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Appointment Details</h2>
        <Button variant="secondary" onClick={() => navigate("/client")}>Back to Dashboard</Button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="mb-3">
            <strong>Service:</strong> {appointment.service_name || appointment.service?.name || "N/A"}
          </div>
          <div className="mb-3">
            <strong>Provider:</strong> {appointment.restaurateur_name || appointment.restaurateurs?.first_name && appointment.restaurateurs?.last_name ? `${appointment.restaurateurs.first_name} ${appointment.restaurateurs.last_name}` : "N/A"}
          </div>
          <div className="mb-3">
            <strong>Date & Time:</strong> {new Date(appointment.date).toLocaleString()}
          </div>
          <div className="mb-3">
            <strong>Duration:</strong> {appointment.duration || appointment.service?.duration || "N/A"} mins
          </div>
          <div className="mb-3">
            <strong>Price:</strong> Rs. {appointment.price || appointment.booked_price || "N/A"}
          </div>
          <div className="mb-4">
            <strong>Status:</strong> <Badge bg={getStatusVariant(appointment.status)}>{appointment.status.replace(/_/g, " ")}</Badge>
          </div>

          {canCancel && (
            <Button variant="outline-danger" onClick={handleCancel} disabled={cancelInProgress}>
              {cancelInProgress ? "Cancelling..." : "Cancel Appointment"}
            </Button>
          )}
        </div>
      </div>
    </Container>
  );
}
