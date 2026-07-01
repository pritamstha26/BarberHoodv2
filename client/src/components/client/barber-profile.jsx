import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  ListGroup,
  Form,
  Modal,
  Alert,
  Tabs,
  Tab,
} from "react-bootstrap";
import {
  FaUser,
  FaCut,
  FaCalendarAlt,
  FaStar,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../apis/api";
import { jwtDecode } from "jwt-decode";

const BarberProfile = ({ barberId }) => {
  const [barber, setBarber] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000),
  ); // Tomorrow
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [debugInfo, setDebugInfo] = useState({
    lastRequest: null,
    lastResponse: null,
  });

  useEffect(() => {
    const fetchBarberData = async () => {
      try {
        setLoading(true);
        setError(null);

        const id = barberId || sessionStorage.getItem("selected_barber_id");

        if (!id) {
          throw new Error("No barber selected");
        }

        const barberResponse = await api.get(`/restaurateurs-services/${id}`);
        if (barberResponse.status === 200) {
          setBarber(barberResponse.data.data);
        }

        const servicesResponse = await api.get(`/restaurateurs-services/all`);
        if (servicesResponse.status === 200) {
          setServices(servicesResponse.data);
        }

        fetchAppointments(id);
      } catch (error) {
        console.error("Error fetching barber data:", error);
        setError(
          "Could not load restaurant information. Please try again later.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBarberData();
  }, [barberId]);

  const fetchAppointments = async (barberId) => {
    try {
      const tokenForFetch = sessionStorage.getItem("access_token");
      try {
        const response = await api.get(
          `/appointments/restaurateurs/${barberId}`,
          {
            headers: {
              Authorization: tokenForFetch
                ? `Bearer ${tokenForFetch}`
                : undefined,
            },
          },
        );
        setDebugInfo({
          lastRequest: { endpoint: `/appointments/restaurateurs/${barberId}` },
          lastResponse: response.data,
        });
        if (response.status === 200) {
          setAppointments(response.data.data || []);
        } else {
          console.warn(
            "Non-200 response fetching barber profile appointments:",
            response.status,
            response.data,
          );
          setAppointments([]);
        }
      } catch (err) {
        console.error(
          "Error fetching barber profile appointments:",
          err,
          err.response?.data,
        );
        setDebugInfo({
          lastRequest: { endpoint: `/appointments/restaurateurs/${barberId}` },
          lastResponse: err.response?.data || err.message,
        });
        throw err;
      }
    } catch (error) {
      console.error(
        "Error fetching appointments:",
        error,
        error.response?.data,
      );
    }
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const handleBookAppointment = async () => {
    if (!selectedService || !appointmentDate) return;

    try {
      setBookingInProgress(true);
      setBookingError(null);

      const token = sessionStorage.getItem("access_token");
      const decodedToken = jwtDecode(token);

      const appointmentData = {
        service_id: selectedService.id,
        date: appointmentDate,
        restaurateurs_id: barber.id,
        clientType: "regular",
      };

      const tokenForPost = sessionStorage.getItem("access_token");
      const response = await api.post("/appointments", appointmentData, {
        headers: {
          Authorization: tokenForPost ? `Bearer ${tokenForPost}` : undefined,
        },
      });

      if (response.status === 201) {
        setBookingSuccess(true);

        // Update appointments list
        fetchAppointments(barber.id);

        // Close modal after 3 seconds on success
        setTimeout(() => {
          setShowBookingModal(false);
          setBookingSuccess(false);
          setSelectedService(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      setBookingError(
        error.response?.data?.message ||
          "Failed to book appointment. Please try again.",
      );
    } finally {
      setBookingInProgress(false);
    }
  };

  const filterAvailableTime = (time) => {
    const selectedHour = time.getHours();
    // Only allow hours between 6 AM and 6 PM
    return selectedHour >= 6 && selectedHour < 18;
  };

  const isTimeSlotAvailable = (date) => {
    // Check if the time slot is already booked
    const timeSlotStart = new Date(date);
    const timeSlotEnd = new Date(date);

    if (selectedService) {
      timeSlotEnd.setMinutes(
        timeSlotEnd.getMinutes() + parseInt(selectedService.duration),
      );
    }

    // Check if this time slot overlaps with any existing appointment
    for (const appointment of appointments) {
      const appointmentStart = new Date(appointment.date);
      const appointmentEnd = new Date(appointmentStart);
      appointmentEnd.setMinutes(
        appointmentEnd.getMinutes() + parseInt(appointment.duration),
      );

      if (
        (timeSlotStart >= appointmentStart && timeSlotStart < appointmentEnd) ||
        (timeSlotEnd > appointmentStart && timeSlotEnd <= appointmentEnd) ||
        (timeSlotStart <= appointmentStart && timeSlotEnd >= appointmentEnd)
      ) {
        return false;
      }
    }

    return true;
  };

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "50vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!barber) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">
          No restaurant selected. Please select a restaurant from the nearby
          restaurants list.
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      <Row>
        <Col lg={4}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body className="text-center">
              <div className="mb-3">
                <div
                  className="mx-auto rounded-circle bg-primary d-flex align-items-center justify-content-center"
                  style={{ width: "100px", height: "100px" }}
                >
                  <FaUser
                    className="text-white"
                    style={{ fontSize: "2.5rem" }}
                  />
                </div>
              </div>

              <h3 className="mb-1">{`${barber.first_name} ${barber.last_name}`}</h3>
              <p className="text-muted mb-3">Restaurant</p>

              <div className="d-flex justify-content-center mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar key={star} className="text-warning mx-1" />
                ))}
              </div>

              <ListGroup variant="flush" className="text-start border-top pt-3">
                {barber.phone_number && (
                  <ListGroup.Item className="d-flex align-items-center px-0 py-2 border-0">
                    <FaPhoneAlt className="text-primary me-3" />
                    <span>{barber.phone_number}</span>
                  </ListGroup.Item>
                )}

                {barber.email && (
                  <ListGroup.Item className="d-flex align-items-center px-0 py-2 border-0">
                    <FaEnvelope className="text-primary me-3" />
                    <span>{barber.email}</span>
                  </ListGroup.Item>
                )}

                {barber.location && (
                  <ListGroup.Item className="d-flex align-items-center px-0 py-2 border-0">
                    <FaMapMarkerAlt className="text-primary me-3" />
                    <span>{barber.location}</span>
                  </ListGroup.Item>
                )}

                <ListGroup.Item className="d-flex align-items-center px-0 py-2 border-0">
                  <FaClock className="text-primary me-3" />
                  <span>Working hours: 9:00 AM - 6:00 PM</span>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Tabs defaultActiveKey="services" className="mb-4">
            <Tab eventKey="services" title="Services">
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Available Items</h5>
                </Card.Header>
                <Card.Body>
                  {services.length > 0 ? (
                    <ListGroup variant="flush">
                      {services.map((service) => (
                        <ListGroup.Item key={service.id} className="py-3 px-0">
                          <Row className="align-items-center">
                            <Col xs={8}>
                              <div className="d-flex align-items-center">
                                <div className="me-3 p-2 rounded-circle bg-primary bg-opacity-10">
                                  <FaCut className="text-primary" />
                                </div>
                                <div>
                                  <h6 className="mb-0">{service.name}</h6>
                                  <div className="d-flex mt-1">
                                    <Badge
                                      bg="light"
                                      text="dark"
                                      className="me-2"
                                    >
                                      <FaClock className="me-1" />{" "}
                                      {service.duration} min
                                    </Badge>
                                    <Badge bg="light" text="dark">
                                      Rs. {service.price}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </Col>
                            <Col xs={4} className="text-end">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleServiceSelect(service)}
                              >
                                <FaCalendarAlt className="me-1" /> Book Now
                              </Button>
                            </Col>
                          </Row>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <Alert variant="info">
                      No services available for this restaurant.
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Col>
      </Row>

      <Modal
        show={showBookingModal}
        onHide={() => {
          if (!bookingInProgress) {
            setShowBookingModal(false);
            setBookingSuccess(false);
            setBookingError(null);
          }
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Book Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {bookingSuccess ? (
            <Alert variant="success">
              <Alert.Heading>Appointment Booked!</Alert.Heading>
              <p>Your appointment has been successfully scheduled.</p>
            </Alert>
          ) : (
            <>
              {bookingError && <Alert variant="danger">{bookingError}</Alert>}

              {selectedService && (
                <div className="mb-4">
                  <h5>Service Details</h5>
                  <p className="mb-1">
                    <strong>Service:</strong> {selectedService.name}
                  </p>
                  <p className="mb-1">
                    <strong>Duration:</strong> {selectedService.duration}{" "}
                    minutes
                  </p>
                  <p className="mb-0">
                    <strong>Price:</strong> Rs. {selectedService.price}
                  </p>
                </div>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Select Date and Time</Form.Label>
                <div className="w-100">
                  <DatePicker
                    selected={appointmentDate}
                    onChange={(date) => setAppointmentDate(date)}
                    showTimeSelect
                    filterTime={filterAvailableTime}
                    timeIntervals={30}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    minDate={new Date()}
                    className="form-control"
                    placeholderText="Select date and time"
                  />
                </div>
                <Form.Text className="text-muted">
                  Available hours: 9:00 AM - 6:00 PM
                </Form.Text>
              </Form.Group>

              <div className="small text-muted mb-3">
                By booking this appointment, you agree to our cancellation
                policy. Please arrive 10 minutes before your scheduled time.
              </div>
            </>
          )}
        </Modal.Body>

        {!bookingSuccess && (
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                if (!bookingInProgress) {
                  setShowBookingModal(false);
                }
              }}
              disabled={bookingInProgress}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleBookAppointment}
              disabled={bookingInProgress}
            >
              {bookingInProgress ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Processing...
                </>
              ) : (
                "Confirm Booking"
              )}
            </Button>
          </Modal.Footer>
        )}
      </Modal>
    </Container>
  );
};

export default BarberProfile;
