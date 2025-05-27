import React, { useState } from "react";
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
import {
  FaUser,
  FaLock,
  FaBell,
  FaGlobe,
  FaSave,
  FaEdit,
  //   FaShield,
  FaHistory,
  FaKey,
} from "react-icons/fa";

const Settings = () => {
  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    company: "Acme Corporation",
    jobTitle: "Project Manager",
    address: "123 Main St",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "United States",
    bio: "Experienced project manager with 10+ years in technology sector.",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    weeklyReports: true,
    marketingEmails: false,
    securityAlerts: true,
    projectUpdates: true,
  });

  const [preferences, setPreferences] = useState({
    language: "en",
    timezone: "EST",
    dateFormat: "MM/DD/YYYY",
    theme: "light",
    currency: "USD",
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handlePreferencesChange = (e) => {
    const { name, value } = e.target;
    setPreferences((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const loginHistory = [
    {
      date: "2024-01-27",
      time: "10:30 AM",
      location: "New York, NY",
      device: "Chrome on Windows",
    },
    {
      date: "2024-01-26",
      time: "2:15 PM",
      location: "New York, NY",
      device: "Safari on iPhone",
    },
    {
      date: "2024-01-25",
      time: "9:45 AM",
      location: "New York, NY",
      device: "Chrome on Windows",
    },
  ];

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
                  eventKey="notifications"
                  className="d-flex align-items-center gap-2"
                >
                  <FaBell />
                  <span>Notifications</span>
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
              <Nav.Item>
                <Nav.Link
                  eventKey="preferences"
                  className="d-flex align-items-center gap-2"
                >
                  <FaGlobe />
                  <span>Preferences</span>
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
                    <h4 className="mb-1">
                      {profileData.firstName} {profileData.lastName}
                    </h4>
                    <p className="text-muted mb-0">
                      {profileData.jobTitle} at {profileData.company}
                    </p>
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
                          name="firstName"
                          value={profileData.firstName}
                          onChange={handleProfileChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-medium">Last Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="lastName"
                          value={profileData.lastName}
                          onChange={handleProfileChange}
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
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-medium">
                          Phone Number
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="g-3 mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-medium">Company</Form.Label>
                        <Form.Control
                          type="text"
                          name="company"
                          value={profileData.company}
                          onChange={handleProfileChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-medium">Job Title</Form.Label>
                        <Form.Control
                          type="text"
                          name="jobTitle"
                          value={profileData.jobTitle}
                          onChange={handleProfileChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Bio</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="bio"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      placeholder="Tell us about yourself..."
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Address</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={profileData.address}
                      onChange={handleProfileChange}
                    />
                  </Form.Group>

                  <Row className="g-3 mb-4">
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="fw-medium">City</Form.Label>
                        <Form.Control
                          type="text"
                          name="city"
                          value={profileData.city}
                          onChange={handleProfileChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="fw-medium">State</Form.Label>
                        <Form.Control
                          type="text"
                          name="state"
                          value={profileData.state}
                          onChange={handleProfileChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="fw-medium">ZIP Code</Form.Label>
                        <Form.Control
                          type="text"
                          name="zipCode"
                          value={profileData.zipCode}
                          onChange={handleProfileChange}
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

              {/* Notifications Tab */}
              <Tab.Pane eventKey="notifications">
                <Form onSubmit={handleSaveNotifications}>
                  <h5 className="mb-4">Notification Preferences</h5>
                  <div className="mb-4">
                    {Object.entries(notificationSettings).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="d-flex justify-content-between align-items-center py-3 border-bottom"
                        >
                          <div>
                            <h6 className="mb-1">
                              {key
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                            </h6>
                            <small className="text-muted">
                              {key === "emailNotifications" &&
                                "Receive notifications via email"}
                              {key === "smsNotifications" &&
                                "Receive notifications via SMS"}
                              {key === "pushNotifications" &&
                                "Receive push notifications in browser"}
                              {key === "weeklyReports" &&
                                "Receive weekly summary reports"}
                              {key === "marketingEmails" &&
                                "Receive promotional and marketing emails"}
                              {key === "securityAlerts" &&
                                "Receive security and login alerts"}
                              {key === "projectUpdates" &&
                                "Receive updates about your projects"}
                            </small>
                          </div>
                          <Form.Check
                            type="switch"
                            name={key}
                            checked={value}
                            onChange={handleNotificationChange}
                            size="lg"
                          />
                        </div>
                      )
                    )}
                  </div>

                  <Alert variant="info">
                    <Alert.Heading className="h6">
                      <FaBell className="me-2" />
                      Notification Tips
                    </Alert.Heading>
                    <ul className="mb-0">
                      <li>
                        Security alerts cannot be disabled for account safety
                      </li>
                      <li>
                        You can customize notification frequency in advanced
                        settings
                      </li>
                      <li>Email notifications include unsubscribe links</li>
                    </ul>
                  </Alert>

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

              {/* Security Tab */}
              <Tab.Pane eventKey="security">
                <Alert
                  variant="warning"
                  className="d-flex align-items-center mb-4"
                >
                  {/* <FaShield className="me-2" /> */}
                  <div>
                    <Alert.Heading className="h6 mb-1">
                      Security Settings
                    </Alert.Heading>
                    <p className="mb-0">
                      Manage your password and security preferences. For
                      enhanced security, we recommend enabling two-factor
                      authentication.
                    </p>
                  </div>
                </Alert>

                <ListGroup variant="flush" className="mb-4">
                  <ListGroup.Item
                    action
                    className="d-flex justify-content-between align-items-center"
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
                    <span className="text-primary">→</span>
                  </ListGroup.Item>

                  <ListGroup.Item
                    action
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div className="d-flex align-items-center">
                      {/* <FaShield className="me-3 text-success" /> */}
                      <div>
                        <h6 className="mb-1">Two-Factor Authentication</h6>
                        <small className="text-muted">
                          Add an extra layer of security to your account
                        </small>
                      </div>
                    </div>
                    <Badge bg="success">Enabled</Badge>
                  </ListGroup.Item>

                  <ListGroup.Item
                    action
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div className="d-flex align-items-center">
                      <FaHistory className="me-3 text-info" />
                      <div>
                        <h6 className="mb-1">Login History</h6>
                        <small className="text-muted">
                          View recent login activity
                        </small>
                      </div>
                    </div>
                    <span className="text-primary">→</span>
                  </ListGroup.Item>
                </ListGroup>

                <Card className="bg-light">
                  <Card.Header>
                    <Card.Title className="h6 mb-0">
                      Recent Login Activity
                    </Card.Title>
                  </Card.Header>
                  <Card.Body>
                    {loginHistory.map((login, index) => (
                      <div
                        key={index}
                        className="d-flex justify-content-between align-items-center py-2 border-bottom"
                      >
                        <div>
                          <div className="fw-medium">
                            {login.date} at {login.time}
                          </div>
                          <small className="text-muted">
                            {login.device} • {login.location}
                          </small>
                        </div>
                        <Badge bg="success">Success</Badge>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Preferences Tab */}
              <Tab.Pane eventKey="preferences">
                <Form onSubmit={handleSavePreferences}>
                  <h5 className="mb-4">General Preferences</h5>
                  <Row className="g-3 mb-4">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-medium">Language</Form.Label>
                        <Form.Select
                          name="language"
                          value={preferences.language}
                          onChange={handlePreferencesChange}
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="it">Italian</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-medium">Timezone</Form.Label>
                        <Form.Select
                          name="timezone"
                          value={preferences.timezone}
                          onChange={handlePreferencesChange}
                        >
                          <option value="EST">Eastern Time (EST)</option>
                          <option value="CST">Central Time (CST)</option>
                          <option value="MST">Mountain Time (MST)</option>
                          <option value="PST">Pacific Time (PST)</option>
                          <option value="UTC">UTC</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="g-3 mb-4">
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="fw-medium">
                          Date Format
                        </Form.Label>
                        <Form.Select
                          name="dateFormat"
                          value={preferences.dateFormat}
                          onChange={handlePreferencesChange}
                        >
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="fw-medium">Theme</Form.Label>
                        <Form.Select
                          name="theme"
                          value={preferences.theme}
                          onChange={handlePreferencesChange}
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="auto">Auto</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="fw-medium">Currency</Form.Label>
                        <Form.Select
                          name="currency"
                          value={preferences.currency}
                          onChange={handlePreferencesChange}
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="CAD">CAD ($)</option>
                        </Form.Select>
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
                      Save Preferences
                    </Button>
                  </div>
                </Form>
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
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter current password"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control type="password" placeholder="Enter new password" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm new password"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowPasswordModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setShowPasswordModal(false)}>
            Update Password
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Settings;
