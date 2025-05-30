import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  ButtonGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Logo from "../components/Logo";

import { isAxiosError } from "axios";
import api from "../apis/api";
//
export default function LoginPage() {
  const [validated, setValidated] = useState(false);
  const [selectedRole, setSelectedRole] = useState("client");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const handleRoleChange = (role) => {
    setSelectedRole(role);
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

    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      // Handle form submission here
      console.log("Form submitted:", { ...formData, role: selectedRole });
    }

    setValidated(true);
    formData.role = selectedRole; // Add role to formData
    try {
      const response = await api.post(`/auth/login`, formData);
      if (response.status === 200) {
        localStorage.setItem("access_token", response.data.access_token);
        navigate(`/${selectedRole}`);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        alert(error.response.data.message);
      }
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <div className="   d-flex justify-content-between align-items-center">
                <Logo />

                <div className="">
                  <h2 className="fw-bold">Login</h2>
                  <p className="text-muted">
                    Please select your role and enter your credentials
                  </p>
                </div>
              </div>

              {/* Role Selection Buttons */}
              <div className="mb-4">
                <ButtonGroup className="w-100">
                  <Button
                    variant={
                      selectedRole === "admin" ? "primary" : "outline-primary"
                    }
                    onClick={() => handleRoleChange("admin")}
                    className="py-2"
                  >
                    Admin
                  </Button>
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

                <Form.Group className="mb-4" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide your password.
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="d-flex justify-content-end align-items-center mb-4">
                  <a href="#" className="text-decoration-none">
                    Forgot password?
                  </a>
                </div>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 py-2 mb-3"
                >
                  Login as{" "}
                  {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                </Button>

                <div className="text-center">
                  <p className="mb-0">
                    Don't have an account?{" "}
                    <a href="/sign-up" className="text-decoration-none">
                      Sign up
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
