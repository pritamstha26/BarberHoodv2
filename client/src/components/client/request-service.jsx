import React, { useState } from "react";
import {
  Container,
  Card,
  Form,
  Row,
  Col,
  Button,
  Alert,
  ProgressBar,
} from "react-bootstrap";
import { FaPaperPlane, FaUpload, FaTimes, FaSave } from "react-icons/fa";
import api from "../../apis/api";
import { jwtDecode } from "jwt-decode";

const RequestService = () => {
  const [formData, setFormData] = useState({
    service_type: "",
    title: "",
    description: "",
    price: "",
    deadline: "",
    prefer_contact_method: "email",
  });

  const [validated, setValidated] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const serviceTypes = [
    "MULLET Hair Services",
    "SLOPE Hair Services",
    "SHAVE",
    "THREADING",
    "FACE MASSAGE",
  ];

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
    const token = localStorage.getItem("access_token");
    const decoded = jwtDecode(token);
    formData.user_id = decoded.id;

    await addServiceRequest(formData);
  };

  const addServiceRequest = async (data) => {
    try {
      const res = await api.post("/services", data);
      if (res.status == 201) {
        // Show success message
        setShowSuccess(true);
        setFormData({
          service_type: "",
          title: "",
          description: "",
          price: "",
          deadline: "",
          prefer_contact_method: "email",
        });
        setTimeout(() => {
          window.location.reload(); // Reload the page to reset the form
        }, 2000);
      }
    } catch (error) {
      console.error("Error submitting service request:", error);
      // Handle error appropriately
    }
  };

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
            {/* Service Type and Priority Row */}
            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium">
                    Service Type <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="service_type"
                    value={formData.service_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a service</option>
                    {serviceTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
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
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium">Price</Form.Label>
                  <Form.Control
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                  ></Form.Control>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium">
                    Preferred Deadline
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Contact Method and Urgency */}
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
                      label="Phone"
                      id="phone"
                    />
                  </div>
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
                >
                  <FaPaperPlane />
                  Submit Request
                </Button>
              </div>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RequestService;
