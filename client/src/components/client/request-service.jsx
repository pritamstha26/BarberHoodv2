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

const RequestService = () => {
  const [formData, setFormData] = useState({
    serviceType: "",
    priority: "Medium",
    title: "",
    description: "",
    budget: "",
    deadline: "",
    contactMethod: "email",
    urgency: "normal",
  });

  const [attachments, setAttachments] = useState([]);
  const [validated, setValidated] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const serviceTypes = [
    "Website Development",
    "Mobile App Development",
    "UI/UX Design",
    "SEO Optimization",
    "Database Management",
    "Cloud Services",
    "Technical Support",
    "Consulting",
    "Digital Marketing",
    "E-commerce Solutions",
    "API Development",
    "Other",
  ];

  const budgetRanges = [
    "Under $1,000",
    "$1,000 - $5,000",
    "$5,000 - $10,000",
    "$10,000 - $25,000",
    "$25,000 - $50,000",
    "$50,000+",
    "To be discussed",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    console.log("Form Data:", formData);
    console.log("Attachments:", attachments);

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);

    // Reset form
    setFormData({
      serviceType: "",
      priority: "Medium",
      title: "",
      description: "",
      budget: "",
      deadline: "",
      contactMethod: "email",
      urgency: "normal",
    });
    setAttachments([]);
    setValidated(false);
  };

  const handleSaveDraft = () => {
    alert("Draft saved successfully!");
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
                    name="serviceType"
                    value={formData.serviceType}
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

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium">Priority Level</Form.Label>
                  <Form.Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </Form.Select>
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
                  <Form.Label className="fw-medium">Budget Range</Form.Label>
                  <Form.Select
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                  >
                    <option value="">Select budget range</option>
                    {budgetRanges.map((range) => (
                      <option key={range} value={range}>
                        {range}
                      </option>
                    ))}
                  </Form.Select>
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
                      name="contactMethod"
                      value="email"
                      checked={formData.contactMethod === "email"}
                      onChange={handleInputChange}
                      label="Email"
                      id="email"
                    />
                    <Form.Check
                      type="radio"
                      name="contactMethod"
                      value="phone"
                      checked={formData.contactMethod === "phone"}
                      onChange={handleInputChange}
                      label="Phone"
                      id="phone"
                    />
                    <Form.Check
                      type="radio"
                      name="contactMethod"
                      value="video-call"
                      checked={formData.contactMethod === "video-call"}
                      onChange={handleInputChange}
                      label="Video Call"
                      id="video-call"
                    />
                  </div>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-medium">Urgency Level</Form.Label>
                  <Form.Select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleInputChange}
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="asap">ASAP</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* File Attachments */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-medium">Attachments</Form.Label>
              <div className="border border-2 border-dashed rounded p-4 text-center bg-light">
                <FaUpload className="text-muted mb-3" size={48} />
                <div className="mb-2">
                  <Form.Label
                    htmlFor="file-upload"
                    className="btn btn-outline-primary"
                  >
                    <FaUpload className="me-2" />
                    Choose Files
                  </Form.Label>
                  <div className="mt-2 text-muted">or drag and drop</div>
                </div>
                <p className="text-muted small mb-0">
                  Supported formats: PNG, JPG, PDF, DOC, DOCX (Max 10MB each)
                </p>
                <Form.Control
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="d-none"
                  accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                />
              </div>

              {/* Display uploaded files */}
              {attachments.length > 0 && (
                <div className="mt-3">
                  <h6 className="fw-medium mb-2">
                    Uploaded Files ({attachments.length})
                  </h6>
                  {attachments.map((file, index) => (
                    <Alert
                      key={index}
                      variant="info"
                      className="d-flex justify-content-between align-items-center mb-2 py-2"
                    >
                      <div className="d-flex align-items-center">
                        <FaUpload className="me-2 text-primary" />
                        <span>{file.name}</span>
                        <small className="text-muted ms-2">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </small>
                      </div>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                      >
                        <FaTimes />
                      </Button>
                    </Alert>
                  ))}
                </div>
              )}
            </Form.Group>

            {/* Progress Indicator */}
            <div className="mb-4">
              <Form.Label className="fw-medium">Form Completion</Form.Label>
              <ProgressBar
                now={
                  (((formData.serviceType ? 1 : 0) +
                    (formData.title ? 1 : 0) +
                    (formData.description ? 1 : 0)) /
                    3) *
                  100
                }
                variant={
                  (formData.serviceType ? 1 : 0) +
                    (formData.title ? 1 : 0) +
                    (formData.description ? 1 : 0) ===
                  3
                    ? "success"
                    : "primary"
                }
              />
            </div>

            {/* Submit Buttons */}
            <div className="d-flex justify-content-between">
              <Button
                variant="outline-secondary"
                onClick={handleSaveDraft}
                className="d-flex align-items-center gap-2"
              >
                <FaSave />
                Save as Draft
              </Button>

              <div className="d-flex gap-2">
                <Button variant="outline-primary">Preview</Button>
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
