// import { jwtDecode } from "jwt-decode";
// import React, { useEffect, useState } from "react";
// import {
//   Container,
//   Card,
//   Nav,
//   Tab,
//   Form,
//   Row,
//   Col,
//   Button,
//   Alert,
//   ListGroup,
//   Modal,
//   Badge,
// } from "react-bootstrap";
// import { FaUser, FaLock, FaSave, FaKey } from "react-icons/fa";
// import api from "../../apis/api";
// import { useNavigate } from "react-router-dom";

// //
// const Settings = () => {
//   const navigate = useNavigate();
//   const [userData, setUserData] = useState({
//     first_name: "",
//     last_name: "",
//     email: "",
//   });
//   const [profileData, setProfileData] = useState({
//     first_name: "",
//     last_name: "",
//     email: "",
//     phone_number: "",
//   });
//   const [showPasswordModal, setShowPasswordModal] = useState(false);
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [error, setError] = useState(null);
//   const [userId, setUserId] = useState(null);

//   // Decode token and initialize state
//   useEffect(() => {
//     const token = sessionStorage.getItem("access_token");
//     if (typeof token !== "string" || !token) {
//       setError("No valid token found. Please log in.");
//       navigate("/login");
//       return;
//     }

//     try {
//       const decoded = jwtDecode(token);
//       if (decoded.exp * 1000 < Date.now()) {
//         setError("Token expired. Please log in again.");
//         sessionStorage.removeItem("access_token");
//         navigate("/login");
//         return;
//       }

//       const initialData = {
//         first_name: decoded.first_name || "",
//         last_name: decoded.last_name || "",
//         email: decoded.email || "",
//         phone_number: decoded.phone_number || "",
//       };
//       setUserData(initialData);
//       setProfileData(initialData);
//       setUserId(decoded.id);
//     } catch {
//       setError("Invalid token. Please log in again.");
//       sessionStorage.removeItem("access_token");
//       navigate("/login");
//     }
//   }, [navigate]);

//   const handleProfileChange = (e) => {
//     const { name, value } = e.target;
//     setProfileData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSaveProfile = async (e) => {
//     e.preventDefault();

//     // Basic form validation
//     if (!profileData.first_name || !profileData.email) {
//       alert("First name and email are required.");
//       return;
//     }

//     try {
//       const response = await api.put(`/users/${userId}`, profileData);
//       if (response.status === 200) {
//         setUserData(profileData); // Update userData only on success
//         setShowSuccess(true);

//         setTimeout(() => {
//           sessionStorage.removeItem("access_token");
//           navigate("/login");
//         }, 3000);
//       }
//     } catch (error) {
//       alert(`Failed to update profile: ${error.message}`);
//     }
//     setTimeout(() => setShowSuccess(false), 3000);
//   };

//   const handlePasswordChange = async (e) => {
//     e.preventDefault();
//     // Add password change logic here
//     setShowPasswordModal(false);
//   };

//   if (error) {
//     return (
//       <Container fluid className="p-4">
//         <Alert variant="danger">{error}</Alert>
//       </Container>
//     );
//   }

//   return (
//     <Container fluid className="p-4">
//       <div className="mb-4">
//         <h1 className="display-5 fw-bold text-dark mb-2">Settings</h1>
//         <p className="text-muted">
//           Manage your account settings and preferences.
//         </p>
//       </div>

//       {showSuccess && (
//         <Alert
//           variant="success"
//           className="mb-4"
//           dismissible
//           onClose={() => setShowSuccess(false)}
//         >
//           Settings updated successfully!
//         </Alert>
//       )}
//       <Card className="border-0 shadow-sm">
//         <Tab.Container defaultActiveKey="profile">
//           <Card.Header className="bg-white">
//             <Nav variant="tabs" className="card-header-tabs">
//               <Nav.Item>
//                 <Nav.Link
//                   eventKey="profile"
//                   className="d-flex align-items-center gap-2"
//                 >
//                   <FaUser />
//                   <span>Profile</span>
//                 </Nav.Link>
//               </Nav.Item>
//               <Nav.Item>
//                 <Nav.Link
//                   eventKey="security"
//                   className="d-flex align-items-center gap-2"
//                 >
//                   <FaLock />
//                   <span>Security</span>
//                 </Nav.Link>
//               </Nav.Item>
//             </Nav>
//           </Card.Header>

//           <Card.Body>
//             <Tab.Content>
//               {/* Profile Tab */}
//               <Tab.Pane eventKey="profile">
//                 <div className="d-flex align-items-center mb-4">
//                   <div
//                     className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-3"
//                     style={{ width: "80px", height: "80px" }}
//                   >
//                     <FaUser className="text-white fs-2" />
//                   </div>
//                   <div>
//                     <h4 className="mb-1 text-capitalize">
//                       {userData.first_name} {userData.last_name}
//                     </h4>
//                     <Badge bg="success" className="mt-1">
//                       Active Account
//                     </Badge>
//                   </div>
//                 </div>

//                 <Form onSubmit={handleSaveProfile}>
//                   <Row className="g-3 mb-3">
//                     <Col md={6}>
//                       <Form.Group>
//                         <Form.Label className="fw-medium">
//                           First Name
//                         </Form.Label>
//                         <Form.Control
//                           type="text"
//                           name="first_name"
//                           value={profileData.first_name}
//                           onChange={handleProfileChange}
//                           required
//                           className="text-capitalize"
//                         />
//                       </Form.Group>
//                     </Col>
//                     <Col md={6}>
//                       <Form.Group>
//                         <Form.Label className="fw-medium text-capitalize">
//                           Last Name
//                         </Form.Label>
//                         <Form.Control
//                           type="text"
//                           name="last_name"
//                           value={profileData.last_name}
//                           onChange={handleProfileChange}
//                           className="text-capitalize"
//                         />
//                       </Form.Group>
//                     </Col>
//                   </Row>

//                   <Row className="g-3 mb-3">
//                     <Col md={6}>
//                       <Form.Group>
//                         <Form.Label className="fw-medium">
//                           Email Address
//                         </Form.Label>
//                         <Form.Control
//                           type="email"
//                           name="email"
//                           value={profileData.email}
//                           onChange={handleProfileChange}
//                           required
//                         />
//                       </Form.Group>
//                     </Col>{" "}
//                     <Col md={6}>
//                       <Form.Group>
//                         <Form.Label className="fw-medium">Phone no.</Form.Label>
//                         <Form.Control
//                           type="text"
//                           name="phone_number"
//                           value={profileData.phone_number}
//                           onChange={handleProfileChange}
//                           required
//                           className="text-capitalize"
//                         />
//                       </Form.Group>
//                     </Col>
//                   </Row>

//                   <div className="d-flex justify-content-end">
//                     <Button
//                       variant="primary"
//                       type="submit"
//                       className="d-flex align-items-center gap-2"
//                     >
//                       <FaSave />
//                       Save Changes
//                     </Button>
//                   </div>
//                 </Form>
//               </Tab.Pane>

//               <Tab.Pane eventKey="security">
//                 <ListGroup variant="flush" className="mb-4">
//                   <ListGroup.Item
//                     action
//                     className="d-flex justify-content-between align-items-center bg-primary-subtle rounded rounded-3"
//                     onClick={() => setShowPasswordModal(true)}
//                   >
//                     <div className="d-flex align-items-center">
//                       <FaKey className="me-3 text-primary" />
//                       <div>
//                         <h6 className="mb-1">Change Password</h6>
//                         <small className="text-muted">
//                           Update your account password
//                         </small>
//                       </div>
//                     </div>
//                   </ListGroup.Item>
//                 </ListGroup>
//               </Tab.Pane>
//             </Tab.Content>
//           </Card.Body>
//         </Tab.Container>
//       </Card>
//       {/* Password Change Modal */}
//       <Modal
//         show={showPasswordModal}
//         onHide={() => setShowPasswordModal(false)}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Change Password</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form onSubmit={handlePasswordChange}>
//             <Form.Group className="mb-3">
//               <Form.Label>Current Password</Form.Label>
//               <Form.Control
//                 type="password"
//                 name="current_password"
//                 placeholder="Enter current password"
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>New Password</Form.Label>
//               <Form.Control
//                 type="password"
//                 name="new_password"
//                 placeholder="Enter new password"
//                 required
//               />
//             </Form.Group>
//             <Form.Group className="mb-3">
//               <Form.Label>Confirm New Password</Form.Label>
//               <Form.Control
//                 type="password"
//                 name="confirm_password"
//                 placeholder="Confirm new password"
//                 required
//               />
//             </Form.Group>
//             <Modal.Footer>
//               <Button
//                 variant="secondary"
//                 onClick={() => setShowPasswordModal(false)}
//               >
//                 Cancel
//               </Button>
//               <Button variant="primary" type="submit">
//                 Update Password
//               </Button>
//             </Modal.Footer>
//           </Form>
//         </Modal.Body>
//       </Modal>
//     </Container>
//   );
// };

// export default Settings;

import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import {
  Container,
  Tab,
  Form,
  Row,
  Col,
  Spinner,
  Nav
} from "react-bootstrap";
import { FaUser, FaLock, FaSave, FaKey, FaArrowRight } from "react-icons/fa";
import api from "../../apis/api";
import { useNavigate } from "react-router-dom";
import "./dashboard.css"; 

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
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState("success");
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Decode token and initialize state
  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    if (typeof token !== "string" || !token) {
      setError("No valid verification token mapped. Re-routing to login.");
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        setError("Token expired. Session tearing down.");
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
    } catch {
      setError("Malformed structural token profile.");
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
    if (!profileData.first_name || !profileData.email) {
      alert("Missing structural constraints: first_name and email required.");
      return;
    }

    try {
      setIsSaving(true);
      const response = await api.put(`/users/${userId}`, profileData);
      if (response.status === 200) {
        setUserData(profileData);
        setAlertMessage("State mutation successful. Environment re-initializing in 3s...");
        setAlertVariant("success");
        setShowSuccess(true);

        setTimeout(() => {
          sessionStorage.removeItem("access_token");
          navigate("/login");
        }, 3000);
      }
    } catch (error) {
      alert(`Profile update rejected: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const current_password = formData.get("current_password");
    const new_password = formData.get("new_password");
    const confirm_password = formData.get("confirm_password");

    if (new_password !== confirm_password) {
      alert("Verification mismatch: Target passphrase inputs do not align.");
      return;
    }

    try {
      setIsSaving(true);
      const token = sessionStorage.getItem("access_token");
      
      const response = await api.put(
        `/users/${userId}/change-password`, 
        { current_password, new_password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setShowPasswordModal(false);
        setAlertMessage("Credential rotation successful. Session tearing down, re-routing...");
        setAlertVariant("success");
        setShowSuccess(true);

        setTimeout(() => {
          sessionStorage.removeItem("access_token");
          navigate("/login");
        }, 2500);
      }
    } catch (error) {
      const serverMessage = error.response?.data?.message || error.message;
      alert(`Credential mutation rejected: ${JSON.stringify(serverMessage)}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return (
      <div className="v-dashboard-root p-4">
        <div className="v-banner v-banner-danger max-width-1240 mx-auto">
          <span className="v-banner-text font-monospace">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="v-dashboard-root">
      {/* Scope Subheader Nav */}
      <div className="v-nav-scope">
        <div className="v-scope-container">
          <div className="v-scope-switcher">
            <span className="v-org">Account System</span>
            <span className="v-slash">/</span>
            <span className="v-project">Preferences & Security</span>
          </div>
        </div>
      </div>

      <Container fluid className="v-main-layout">
        {showSuccess && (
          <div className={`v-banner v-banner-${alertVariant} mb-4`}>
            <span className="v-banner-text">{alertMessage}</span>
            <button className="v-banner-close" onClick={() => setShowSuccess(false)}>×</button>
          </div>
        )}

        <Tab.Container defaultActiveKey="profile">
          {/* Geist Navigation Tabs Wrapper */}
          <div className="v-tabs-navigation">
            <div className="v-tab-list">
              <Nav variant="pills" className="gap-1">
                <Nav.Item>
                  <Nav.Link eventKey="profile" className="v-tab-trigger">
                    Profile Matrix
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="security" className="v-tab-trigger">
                    Security & Keys
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </div>
          </div>

          {/* Core Settings Workspace Block */}
          <div className="v-block-card mt-3">
            <div className="v-block-body p-4">
              <Tab.Content>
                
                {/* Profile Pane */}
                <Tab.Pane eventKey="profile">
                  <div className="d-flex align-items-center mb-4 pb-4 border-bottom">
                    <div className="v-avatar-node me-3">
                      <FaUser className="text-muted" style={{ fontSize: "1.25rem" }} />
                    </div>
                    <div>
                      <h4 className="v-cell-main m-0 text-capitalize" style={{ fontSize: "1.1rem" }}>
                        {userData.first_name} {userData.last_name}
                      </h4>
                      <span className="v-pill v-status-success font-monospace mt-1" style={{ fontSize: "0.72rem" }}>
                        <span className="v-pill-dot"></span>
                        Active Instance Node
                      </span>
                    </div>
                  </div>

                  <Form onSubmit={handleSaveProfile}>
                    <Row className="g-3 mb-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="v-input-label">FIRST NAME</Form.Label>
                          <Form.Control
                            type="text"
                            name="first_name"
                            value={profileData.first_name}
                            onChange={handleProfileChange}
                            required
                            className="v-input-geist text-capitalize"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="v-input-label">LAST NAME</Form.Label>
                          <Form.Control
                            type="text"
                            name="last_name"
                            value={profileData.last_name}
                            onChange={handleProfileChange}
                            className="v-input-geist text-capitalize"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className="g-3 mb-4">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="v-input-label">EMAIL ENDPOINT</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleProfileChange}
                            required
                            className="v-input-geist"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="v-input-label">PHONE PARAMETER</Form.Label>
                          <Form.Control
                            type="text"
                            name="phone_number"
                            value={profileData.phone_number}
                            onChange={handleProfileChange}
                            required
                            className="v-input-geist"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="d-flex justify-content-end pt-3 border-top">
                      <button
                        className="v-btn-geist bg-dark text-white border-dark px-4"
                        type="submit"
                        disabled={isSaving}
                      >
                        {isSaving ? <Spinner size="sm" animation="border" variant="light" /> : <FaSave />}
                        <span className="ms-2">Save Parameters</span>
                      </button>
                    </div>
                  </Form>
                </Tab.Pane>

                {/* Security Pane */}
                <Tab.Pane eventKey="security">
                  <div className="v-setting-row" onClick={() => setShowPasswordModal(true)}>
                    <div className="d-flex align-items-center">
                      <div className="v-icon-wrap me-3">
                        <FaKey className="text-muted" style={{ fontSize: "0.9rem" }} />
                      </div>
                      <div>
                        <h6 className="v-cell-main m-0" style={{ fontSize: "0.9rem" }}>Account Password</h6>
                        <p className="text-muted small m-0 font-monospace" style={{ fontSize: "0.78rem" }}>
                          Cycle system credentials and access keys.
                        </p>
                      </div>
                    </div>
                    <FaArrowRight className="text-muted small" style={{ fontSize: "0.75rem" }} />
                  </div>
                </Tab.Pane>

              </Tab.Content>
            </div>
          </div>
        </Tab.Container>
      </Container>

      {/* Vercel-style Overlay Modal Framework */}
      {showPasswordModal && (
        <div className="v-modal-overlay">
          <div className="v-modal-wrapper">
            <div className="v-modal-header">
              <h3 className="v-block-heading" style={{ fontSize: "1rem" }}>Rotate Credentials</h3>
              <button className="v-banner-close" onClick={() => setShowPasswordModal(false)}>×</button>
            </div>
            <Form onSubmit={handlePasswordChange}>
              <div className="v-modal-body p-4">
                <Form.Group className="mb-3">
                  <Form.Label className="v-input-label">CURRENT ACCESS KEY</Form.Label>
                  <Form.Control
                    type="password"
                    name="current_password"
                    required
                    className="v-input-geist"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="v-input-label">NEW ACCESS KEY</Form.Label>
                  <Form.Control
                    type="password"
                    name="new_password"
                    required
                    className="v-input-geist"
                  />
                </Form.Group>
                <Form.Group className="mb-0">
                  <Form.Label className="v-input-label">CONFIRM TARGET PHRASE</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirm_password"
                    required
                    className="v-input-geist"
                  />
                </Form.Group>
              </div>
              <div className="v-modal-footer">
                <button
                  type="button"
                  className="v-action-btn bg-white px-3"
                  onClick={() => setShowPasswordModal(false)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button type="submit" className="v-btn-geist bg-dark text-white border-dark px-3" disabled={isSaving}>
                  {isSaving ? <Spinner size="sm" animation="border" variant="light" /> : "Commit Mutation"}
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;