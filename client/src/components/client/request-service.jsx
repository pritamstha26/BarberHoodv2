import React, { use, useEffect, useState } from "react";
import {
  Container,
  Card,
  Form,
  Row,
  Col,
  Button,
  Alert,
  ProgressBar,
  Modal,
  Spinner,
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaPaperPlane, FaUpload, FaTimes, FaSave } from "react-icons/fa";
import api from "../../apis/api";
import { jwtDecode } from "jwt-decode";

const RequestService = () => {
  const [formData, setFormData] = useState({
    service_type: "",
    title: "",
    description: "",
    price: "",
    deadline: new Date(Date.now() + 60 * 60 * 1000),
    prefer_contact_method: "email",
    duration: "",
    clientType: "regular",
  });
  const [apiData, setApiData] = useState([]);
  const [validated, setValidated] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    //adding the user_id to the formData
    const token = sessionStorage.getItem("access_token");
    const decoded = jwtDecode(token);

    formData.user_id = decoded.id;

    await addServiceRequest(formData);
  };

  const addServiceRequest = async (data) => {
    try {
      setIsLoading(true);
      const res = await api.post("/services", data);
      if (res.status == 201) {
        // Show success message
        setShowSuccess(true);

        // Check if an appointment was created
        if (res.data.appointment) {
          setAppointmentDetails({
            ...res.data.appointment,
            serviceName: data.service_type,
            serviceTitle: data.title,
          });
          setShowAppointmentModal(true);
        }

        setFormData({
          service_type: "",
          title: "",
          description: "",
          price: "",
          deadline: "",
          prefer_contact_method: "email",
          duration: "",
          clientType: "regular",
        });

        // Don't reload immediately to allow user to see appointment details
        if (!res.data.appointment) {
          setTimeout(() => {
            window.location.reload(); // Reload the page to reset the form
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Error submitting service request:", error);
      alert(
        "Error submitting service request: " +
          (error.response?.data?.error || error.message),
      );
    } finally {
      setIsLoading(false);
    }
  };
  const filterPassedTime = (time) => {
    const selectedHour = time.getHours();
    return selectedHour >= 8 && selectedHour < 20;
  };

  const date = new Date("2025-07-28T00:00:00.000Z");
  useEffect(() => {
    const response = async () => {
      try {
        const token = sessionStorage.getItem("access_token");
        if (!token) {
          console.error("No access token found");
          return;
        }
        const res = await api.get("/services/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.status === 200) {
          // Assuming the response contains an array of service types
          setApiData(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching API data:", error);
      }
    };
    response();
  }, []);

  const [data, setDatas] = useState([]);
  const apis = async () => {
    try {
      const token = sessionStorage.getItem("access_token");
      if (!token) {
        console.error("No access token found");
        return;
      }
      const res = await api.get("/restaurateurs-services/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 200) {
        // Assuming the response contains an array of service types
        setDatas(res.data);
      }
    } catch (error) {
      console.error("Error fetching API data:", error);
    }
  };
  useEffect(() => {
    apis();
  }, []);
  return (
    <Container fluid className="p-4">
      <div className="mb-4">
        <h1 className="display-5 fw-bold text-dark mb-2">Request Service</h1>
        <p className="text-muted">
          Submit a new service request and we'll get back to you soon.
        </p>
      </div>

      {showSuccess && (
        <Alert
          variant="success"
          className="mb-4"
          dismissible
          onClose={() => setShowSuccess(false)}
        >
          <Alert.Heading>Success!</Alert.Heading>
          Your service request has been submitted successfully. We'll contact
          you within 24 hours.
        </Alert>
      )}

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-primary text-white">
          <Card.Title className="mb-0 h5">
            <FaPaperPlane className="me-2" />
            New Service Request
          </Card.Title>
        </Card.Header>
        <Card.Body className="p-4">
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            {/* Service Type Dropdown */}
            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium">
                    Service Type <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="service_type"
                    value={formData.service_type}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData((prev) => ({ ...prev, service_type: value }));

                      const found = data.find((s) => s.name === value);
                      setSelectedService(found || null);

                      setFormData((prev) => ({
                        ...prev,
                        service_type: value,
                        price: found?.price || "",
                        duration: found?.duration || "",
                      }));
                    }}
                    required
                  >
                    <option value="">Select a service</option>
                    {data.map((service) => (
                      <option key={service.id} value={service.name}>
                        {service.name}
                      </option>
                    ))}
                  </Form.Select>

                  <Form.Control.Feedback type="invalid">
                    Please select a service type.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            {/* Title */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">
                Request Title <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Brief title for your service request"
              />
              <Form.Control.Feedback type="invalid">
                Please provide a request title.
              </Form.Control.Feedback>
            </Form.Group>

            {/* Description */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">
                Detailed Description <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Please provide detailed information about your requirements, goals, and any specific features you need..."
              />
              <Form.Text className="text-muted">
                Character count: {formData.description.length}/1000
              </Form.Text>
              <Form.Control.Feedback type="invalid">
                Please provide a detailed description.
              </Form.Control.Feedback>
            </Form.Group>

            {/* Budget and Deadline Row */}
            <Row className="g-3 mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-medium">Price(in Rs.)</Form.Label>
                  <Form.Control
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    disabled
                  ></Form.Control>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-medium">
                    Duration(in minutes)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    disabled
                  ></Form.Control>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Preferred Deadline</Form.Label>
                  <br />

                  <DatePicker
                    selected={
                      formData.deadline ? new Date(formData.deadline) : null
                    }
                    onChange={(date) =>
                      setFormData({ ...formData, deadline: date })
                    }
                    showTimeSelect
                    filterTime={filterPassedTime}
                    timeIntervals={15}
                    dateFormat="Pp"
                    minDate={new Date()}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Contact Method and Client Type */}
            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium">
                    Preferred Contact Method
                  </Form.Label>
                  <div className="d-flex gap-3 mt-2">
                    <Form.Check
                      type="radio"
                      name="prefer_contact_method"
                      value="email"
                      checked={formData.prefer_contact_method === "email"}
                      onChange={handleInputChange}
                      label="Email"
                      id="email"
                    />
                    <Form.Check
                      type="radio"
                      name="prefer_contact_method"
                      value="phone"
                      checked={formData.prefer_contact_method === "phone"}
                      onChange={handleInputChange}
                      label="Phone(Feature Coming Soon)"
                      id="phone"
                      disabled
                    />
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium">Client Type</Form.Label>
                  <Form.Select
                    name="clientType"
                    value={formData.clientType}
                    onChange={handleInputChange}
                  >
                    <option value="regular">Regular</option>
                    <option value="vip">VIP</option>
                    <option value="premium">Premium</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    VIP and Premium clients receive priority treatment
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            {/* Progress Indicator */}
            <div className="mb-4">
              <Form.Label className="fw-medium">Form Completion</Form.Label>
              <ProgressBar
                now={
                  (((formData.service_type ? 1 : 0) +
                    (formData.title ? 1 : 0) +
                    (formData.description ? 1 : 0)) /
                    3) *
                  100
                }
                variant={
                  (formData.service_type ? 1 : 0) +
                    (formData.title ? 1 : 0) +
                    (formData.description ? 1 : 0) ===
                  3
                    ? "success"
                    : "primary"
                }
              />
            </div>

            {/* Submit Buttons */}
            <div className="d-flex justify-content-end">
              <div className="d-flex gap-2">
                <Button
                  variant="primary"
                  type="submit"
                  className="d-flex align-items-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      Submit Request
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Appointment Details Modal */}
      <Modal
        show={showAppointmentModal}
        onHide={() => {
          setShowAppointmentModal(false);
          window.location.reload();
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Your Appointment is Confirmed!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {appointmentDetails && (
            <div>
              <p className="mb-1">
                <strong>Service:</strong> {appointmentDetails.serviceName}
              </p>
              <p className="mb-1">
                <strong>Title:</strong> {appointmentDetails.serviceTitle}
              </p>
              <p className="mb-1">
                <strong>Date & Time:</strong>{" "}
                {new Date(appointmentDetails.date).toLocaleString()}
              </p>
              <p className="mb-1">
                <strong>Restaurateur:</strong>{" "}
                {appointmentDetails.restaurateurName}
              </p>
              <p className="mb-1">
                <strong>Status:</strong>{" "}
                <span className="text-warning">Pending</span>
              </p>
              {appointmentDetails.estimatedStartTime && (
                <p className="mb-1">
                  <strong>Estimated Start Time:</strong>{" "}
                  {new Date(
                    appointmentDetails.estimatedStartTime,
                  ).toLocaleString()}
                </p>
              )}
              <hr />
              <p className="text-muted">
                Your appointment has been scheduled. You can view or manage your
                appointments from your dashboard.
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="success"
            onClick={() => {
              setShowAppointmentModal(false);
              window.location.reload();
            }}
          >
            Done
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RequestService;
