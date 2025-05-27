import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  ButtonGroup,
  Alert,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Logo from "../components/Logo";
import api from "../apis/apiInstance";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    number: "",
    address: "", // CHANGE 1: Kept for clients
  });
  const [selectedRole, setSelectedRole] = useState("client");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setError(null); // CHANGE 2: Clear error on role switch
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    // CHANGE 3: Enhanced validation
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      setError("Please fill in all required fields correctly.");
      return;
    }

    // CHANGE 4: Strict input validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = formData.email.trim();
    const trimmedNumber = formData.number.trim();
    const trimmedAddress = formData.address.trim();

    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      setValidated(true);
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setValidated(true);
      return;
    }
    if (!/^[0-9]{10,15}$/.test(trimmedNumber)) {
      setError("Phone number must be 10-15 digits.");
      setValidated(true);
      return;
    }
    if (selectedRole === "client" && !trimmedAddress) {
      setError("Address is required for clients.");
      setValidated(true);
      return;
    }

    setValidated(true);
    setError(null);

    try {
      // CHANGE 5: Role-specific payload
      const payload = {
        email: trimmedEmail,
        password: formData.password,
        number: trimmedNumber,
        ...(selectedRole === "client"
          ? { address: trimmedAddress }
          : { status: "free" }),
      };
      const endpoint =
        selectedRole === "barber" ? "/register/barber" : "/register/client";

      // CHANGE 6: Detailed payload logging
      console.log(
        `Sending payload to ${endpoint}:`,
        JSON.stringify(payload, null, 2)
      );

      // CHANGE 7: Send request
      const response = await api.post(endpoint, payload);
      console.log("Registration successful:", response.data);

      // CHANGE 8: Store token
      localStorage.setItem("token", response.data.token);

      // CHANGE 9: Navigate to login
      navigate("/login");
    } catch (err) {
      // CHANGE 10: Detailed error handling
      console.error("Full error:", JSON.stringify(err, null, 2));
      let errorMessage = "Registration failed. Please try again.";
      if (err.response) {
        console.log("Response data:", err.response.data);
        if (err.response.status === 400) {
          if (err.response.data.message.includes("All fields")) {
            errorMessage = `All fields (${
              selectedRole === "barber"
                ? "email, password, number"
                : "email, password, number, address"
            }) are required.`;
          } else if (err.response.data.message.includes("Email already")) {
            errorMessage = "This email is already registered.";
          } else if (err.response.data.message.includes("Invalid")) {
            errorMessage = err.response.data.message;
          } else {
            errorMessage = "Registration failed due to invalid data.";
          }
        } else if (err.response.status === 404) {
          errorMessage = `Endpoint ${endpoint} not found. Check server configuration.`;
        } else if (err.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (err.code === "ERR_NETWORK") {
        errorMessage =
          "Unable to connect to the server. Check if the server is running.";
      }
      setError(errorMessage);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center">
                <Logo />
                <div className="text-center mb-4">
                  <h2 className="fw-bold">Create an Account</h2>
                  <p className="text-muted">
                    Please fill in your information to sign up as a{" "}
                    {selectedRole}
                  </p>
                </div>
              </div>

              {/* CHANGE 11: Show errors */}
              {error && <Alert variant="danger">{error}</Alert>}

              <div className="mb-4">
                <ButtonGroup className="w-100">
                  <Button
                    variant={
                      selectedRole === "barber" ? "primary" : "outline-primary"
                    }
                    onClick={() => handleRoleChange("barber")}
                    className="py-2"
                  >
                    Barber
                  </Button>
                  <Button
                    variant={
                      selectedRole === "client" ? "primary" : "outline-primary"
                    }
                    onClick={() => handleRoleChange("client")}
                    className="py-2"
                  >
                    Client
                  </Button>
                </ButtonGroup>
              </div>

              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a valid email.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                  />
                  <Form.Control.Feedback type="invalid">
                    Password must be at least 8 characters.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="number">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel" // CHANGE 12: Use tel for phone input
                    name="number"
                    placeholder="Enter your phone number"
                    value={formData.number}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{10,15}"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a valid phone number (10-15 digits).
                  </Form.Control.Feedback>
                </Form.Group>

                {selectedRole === "client" && (
                  <Form.Group className="mb-4" controlId="address">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="address"
                      placeholder="Enter your address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      style={{ height: "100px" }}
                    />
                    <Form.Control.Feedback type="invalid">
                      Please provide your address.
                    </Form.Control.Feedback>
                  </Form.Group>
                )}

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 py-2 mb-3"
                >
                  Sign Up
                </Button>

                <div className="text-center">
                  <p className="mb-0">
                    Already have an account?{" "}
                    <a href="/login" className="text-decoration-none">
                      Log in
                    </a>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
