import { useState, useEffect } from "react";
import { Container, Spinner, Alert, Button, Form, Row, Col } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import api from "../apis/api";
import { FaChair, FaUsers, FaCalendarAlt, FaCheckCircle } from "react-icons/fa";
import "../components/client/dashboard.css";

export default function BookTablePage() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [tables, setTables] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingDate, setBookingDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [bookingTime, setBookingTime] = useState("19:00");
  const [partySize, setPartySize] = useState(1);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const restaurantResponse = await api.get(`/restaurateurs-services/${restaurantId}`);
        if (restaurantResponse.status === 200) {
          setRestaurant(restaurantResponse.data.data);
        }

        const tablesResponse = await api.get(`/tables/restaurant/${restaurantId}`);
        if (tablesResponse.status === 200) {
          setTables(tablesResponse.data.data || []);
        }

        const servicesResponse = await api.get("/restaurateurs-services/all");
        if (servicesResponse.status === 200) {
          const all = servicesResponse.data || [];
          const filtered = Array.isArray(all) ? all.filter((s) => String(s.restaurateur_id || s.restaurateurId) === String(restaurantId)) : [];
          setServices(filtered);
        }
      } catch (err) {
        setError("Failed to load restaurant, tables, or menu.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [restaurantId]);

  const handleBookTable = async () => {
    if (!selectedTable || !restaurant) return;

    setBookingInProgress(true);
    setError(null);
    setSuccess(false);

    try {
      const token = sessionStorage.getItem("access_token");
      if (!token) {
        setError("Please log in to book a table.");
        setBookingInProgress(false);
        return;
      }

      const [hours, minutes] = bookingTime.split(":").map((v) => Number(v));
      const appointmentDate = new Date(bookingDate);
      appointmentDate.setHours(hours, minutes, 0, 0);

      const serviceId = selectedService?.id || selectedTable.id;

      const response = await api.post(
        "/appointments",
        {
          service_id: serviceId,
          date: appointmentDate.toISOString(),
          restaurateurs_id: restaurant.id,
          party_size: partySize,
          table_id: selectedTable.id,
          clientType: "regular",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        setSuccess(true);
        setSelectedTable(null);
        setSelectedService(null);
        setPartySize(1);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book table. Please try again.");
      console.error(err);
    } finally {
      setBookingInProgress(false);
    }
  };

  const getDateLabel = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const renderTableCard = (table) => {
    const isSelected = selectedTable?.id === table.id;
    return (
      <div
        key={table.id}
        className={`s-vis-card p-4 border rounded-3 ${isSelected ? "border-primary" : ""}`}
        style={{ cursor: "pointer" }}
        onClick={() => {
          setSelectedTable(table);
          setPartySize(1);
          setError(null);
        }}
      >
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 className="m-0">Table {table.table_number}</h5>
            <small className="text-muted">Max {table.capacity} guests</small>
          </div>
          <span className={`badge ${table.is_active ? "bg-success" : "bg-secondary"}`}>
            {table.is_active ? "Available" : "Unavailable"}
          </span>
        </div>

        <div className="d-flex align-items-center gap-3 text-muted">
          <FaChair />
          <span className="small">{table.capacity} seats</span>
        </div>

        {isSelected && (
          <div className="mt-3 pt-3 border-top">
            <div className="d-flex align-items-center gap-2 mb-2">
              <FaCalendarAlt />
              <span className="small">{getDateLabel(bookingDate)}</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <FaUsers />
              <span className="small">{partySize} guest{partySize === 1 ? "" : "s"}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSeatPills = () => {
    if (!selectedTable) return null;
    const items = Array.from({ length: selectedTable.capacity });
    const filled = Math.min(partySize, selectedTable.capacity);

    return (
      <div className="d-flex flex-wrap gap-2 mt-2">
        {items.map((_, i) => (
          <span
            key={i}
            className="badge rounded-pill"
            style={{
              background: i < filled ? "#198754" : "#e9ecef",
              color: i < filled ? "#fff" : "#495057",
              padding: "0.5rem 0.75rem",
            }}
          >
            <FaUsers style={{ fontSize: "0.75rem" }} />
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="dark" size="sm" />
        <p className="mt-3 text-muted small font-monospace">LOADING BOOKING CONTEXT...</p>
      </div>
    );
  }

  if (error && !restaurant) {
    return (
      <div className="p-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
      </div>
    );
  }

  return (
    <div className="s-vis-dashboard">
      <Container className="s-vis-main py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="s-vis-title m-0">Book a Table</h1>
          <Button variant="outline-secondary" onClick={() => navigate(-1)}>Back</Button>
        </div>

        {restaurant && (
          <div className="mb-4">
            <h2 className="fw-semibold">{restaurant.first_name} {restaurant.last_name}</h2>
            <p className="text-muted">Choose an available table, time, and menu items.</p>
          </div>
        )}

        {success && (
          <Alert variant="success" className="mb-4">
            <Alert.Heading className="d-flex align-items-center gap-2">
              <FaCheckCircle /> Booking Confirmed!
            </Alert.Heading>
            <p>Your table has been successfully booked.</p>
          </Alert>
        )}

        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

        {!success && (
          <div className="row g-4">
            <div className="col-md-7">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-semibold m-0">Select Table</h4>
                <small className="text-muted">{tables.length} configured</small>
              </div>

              {tables.length === 0 ? (
                <Alert variant="info">No tables configured for this restaurant.</Alert>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {tables.map((table) => renderTableCard(table))}
                </div>
              )}
            </div>

            <div className="col-md-5">
              <div className="s-vis-card p-4">
                <h4 className="fw-semibold mb-3">Booking Details</h4>

                {selectedTable ? (
                  <>
                    <div className="mb-3">
                      <strong>Selected Table:</strong> Table {selectedTable.table_number}
                      <div className="text-muted small">Capacity: {selectedTable.capacity} guests</div>
                    </div>

                    <Form.Group className="mb-3">
                      <Form.Label>Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={bookingDate.toISOString().split("T")[0]}
                        onChange={(e) => setBookingDate(new Date(e.target.value))}
                        min={new Date(Date.now()).toISOString().split("T")[0]}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Time</Form.Label>
                      <Form.Control
                        type="time"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Food / Service</Form.Label>
                      <Form.Select
                        value={selectedService?.id || ""}
                        onChange={(e) => {
                          const service = services.find((s) => String(s.id) === String(e.target.value));
                          setSelectedService(service || null);
                        }}
                      >
                        <option value="">Select a service</option>
                        {services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name} - Rs. {service.price} ({service.duration} mins)
                          </option>
                        ))}
                      </Form.Select>
                      {services.length === 0 && (
                        <Form.Text className="text-muted">No services configured for this restaurant.</Form.Text>
                      )}
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Party Size</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        max={selectedTable.capacity}
                        value={partySize}
                        onChange={(e) => setPartySize(Number(e.target.value))}
                      />
                      {renderSeatPills()}
                      {partySize > selectedTable.capacity && (
                        <Form.Text className="text-danger">
                          Party size exceeds table capacity of {selectedTable.capacity}
                        </Form.Text>
                      )}
                    </Form.Group>

                    <Button
                      variant="primary"
                      className="w-100"
                      onClick={handleBookTable}
                      disabled={bookingInProgress || partySize > selectedTable.capacity || !selectedTable.is_active}
                    >
                      {bookingInProgress ? "Booking..." : "Confirm Booking"}
                    </Button>
                  </>
                ) : (
                  <Alert variant="info">Please select a table to continue.</Alert>
                )}
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}