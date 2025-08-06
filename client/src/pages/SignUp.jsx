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
import api from "../apis/api";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
    first_name: "",
    last_name: "",
    phone_number: "",
  });
  const [selectedRole, setSelectedRole] = useState("client");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setError(null); // Clear error on role switch
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

    //  Enhanced validation
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      setError("Please fill in all required fields correctly.");
      return;
    }

    //  input validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = formData.email.trim();

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

    setValidated(true);
    setError(null);
    formData.role = selectedRole;
    registerUser(formData);
  };

  const registerUser = async (data) => {
    try {
      const response = await api.post("/auth/register", data);
      if (response.status === 201) {
        localStorage.setItem("access_token", response.data.access_token);
        //  Redirect on successful signup
        navigate("/login");
      }
    } catch (err) {
      //  Handle API errors
      if (err.response && err.response.data) {
        setError(
          err.response.data.message || "An error occurred. Please try again."
        );
      } else {
        setError("Network error. Please check your connection.");
      }
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
                <Form.Group className="mb-3" controlId="firstName">
                  <Form.Label>First name</Form.Label>
                  <Form.Control
                    type="text"
                    name="first_name"
                    placeholder="Enter your first name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a first name.
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="lastName">
                  <Form.Label>Last name</Form.Label>
                  <Form.Control
                    type="text"
                    name="last_name"
                    placeholder="Enter your last name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a valid last name.
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="lastName">
                  <Form.Label>Contact no.</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone_number"
                    placeholder="Enter your phone number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a valid phone number.
                  </Form.Control.Feedback>
                </Form.Group>
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
