import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Nav,
  Tab,
  Form,
  Row,
  Col,
  Button,
  Alert,
  ListGroup,
  Modal,
  Badge,
} from "react-bootstrap";
import { FaUser, FaLock, FaSave, FaKey } from "react-icons/fa";
import api from "../../apis/api";
import { useNavigate } from "react-router-dom";

//
const Settings = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Decode token and initialize state
  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    if (typeof token !== "string" || !token) {
      setError("No valid token found. Please log in.");
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        setError("Token expired. Please log in again.");
        sessionStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      const initialData = {
        first_name: decoded.first_name || "",
        last_name: decoded.last_name || "",
        email: decoded.email || "",
        phone_number: decoded.phone_number || "",
      };
      setUserData(initialData);
      setProfileData(initialData);
      setUserId(decoded.id);
    } catch (err) {
      setError("Invalid token. Please log in again.");
      sessionStorage.removeItem("access_token");
      navigate("/login");
    }
  }, [navigate]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    // Basic form validation
    if (!profileData.first_name || !profileData.email) {
      alert("First name and email are required.");
      return;
    }

    try {
      const response = await api.put(`/users/${userId}`, profileData);
      if (response.status === 200) {
        setUserData(profileData); // Update userData only on success
        setShowSuccess(true);

        setTimeout(() => {
          sessionStorage.removeItem("access_token");
          navigate("/login");
        }, 3000);
      }
    } catch (error) {
      alert(`Failed to update profile: ${error.message}`);
    }
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    // Add password change logic here
    setShowPasswordModal(false);
  };

  if (error) {
    return (
      <Container fluid className="p-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      <div className="mb-4">
        <h1 className="display-5 fw-bold text-dark mb-2">Settings</h1>
        <p className="text-muted">
          Manage your account settings and preferences.
        </p>
      </div>

      {showSuccess && (
        <Alert
          variant="success"
          className="mb-4"
          dismissible
          onClose={() => setShowSuccess(false)}
        >
          Settings updated successfully!
        </Alert>
      )}
      <Card className="border-0 shadow-sm">
        <Tab.Container defaultActiveKey="profile">
          <Card.Header className="bg-white">
            <Nav variant="tabs" className="card-header-tabs">
              <Nav.Item>
                <Nav.Link
                  eventKey="profile"
                  className="d-flex align-items-center gap-2"
                >
                  <FaUser />
                  <span>Profile</span>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  eventKey="security"
                  className="d-flex align-items-center gap-2"
                >
                  <FaLock />
                  <span>Security</span>
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>

          <Card.Body>
            <Tab.Content>
              {/* Profile Tab */}
              <Tab.Pane eventKey="profile">
                <div className="d-flex align-items-center mb-4">
                  <div
                    className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-3"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <FaUser className="text-white fs-2" />
                  </div>
                  <div>
                    <h4 className="mb-1 text-capitalize">
                      {userData.first_name} {userData.last_name}
                    </h4>
                    <Badge bg="success" className="mt-1">
                      Active Account
                    </Badge>
                  </div>
                </div>

                <Form onSubmit={handleSaveProfile}>
                  <Row className="g-3 mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-medium">
                          First Name
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="first_name"
                          value={profileData.first_name}
                          onChange={handleProfileChange}
                          required
                          className="text-capitalize"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-medium text-capitalize">
                          Last Name
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="last_name"
                          value={profileData.last_name}
                          onChange={handleProfileChange}
                          className="text-capitalize"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="g-3 mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-medium">
                          Email Address
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          required
                        />
                      </Form.Group>
                    </Col>{" "}
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-medium">Phone no.</Form.Label>
                        <Form.Control
                          type="text"
                          name="phone_number"
                          value={profileData.phone_number}
                          onChange={handleProfileChange}
                          required
                          className="text-capitalize"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-end">
                    <Button
                      variant="primary"
                      type="submit"
                      className="d-flex align-items-center gap-2"
                    >
                      <FaSave />
                      Save Changes
                    </Button>
                  </div>
                </Form>
              </Tab.Pane>

              <Tab.Pane eventKey="security">
                <ListGroup variant="flush" className="mb-4">
                  <ListGroup.Item
                    action
                    className="d-flex justify-content-between align-items-center bg-primary-subtle rounded rounded-3"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    <div className="d-flex align-items-center">
                      <FaKey className="me-3 text-primary" />
                      <div>
                        <h6 className="mb-1">Change Password</h6>
                        <small className="text-muted">
                          Update your account password
                        </small>
                      </div>
                    </div>
                  </ListGroup.Item>
                </ListGroup>
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Tab.Container>
      </Card>
      {/* Password Change Modal */}
      <Modal
        show={showPasswordModal}
        onHide={() => setShowPasswordModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlePasswordChange}>
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type="password"
                name="current_password"
                placeholder="Enter current password"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                name="new_password"
                placeholder="Enter new password"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                name="confirm_password"
                placeholder="Confirm new password"
                required
              />
            </Form.Group>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Update Password
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Settings;
