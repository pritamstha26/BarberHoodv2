import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Tabs, Tab, Alert } from "react-bootstrap";
import { FiSettings, FiArrowLeft } from "react-icons/fi";
import RestaurantCapacitySettings from "./restaurant-settings";
import "./restaurant-settings-page.css";

export default function RestaurantSettingsPage() {
  const navigate = useNavigate();
  const [restaurateurId, setRestaurateurId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [capacityUpdated, setCapacityUpdated] = useState(false);

  useEffect(() => {
    const userId = sessionStorage.getItem("user_id");
    const role = sessionStorage.getItem("role");

    if (!userId) {
      navigate("/login");
      return;
    }

    if (role !== "restaurateurs") {
      navigate("/client");
      return;
    }

    setRestaurateurId(parseInt(userId));
    setUserRole(role);
  }, [navigate]);

  const handleCapacityUpdate = (newCapacity) => {
    setCapacityUpdated(true);
    setTimeout(() => setCapacityUpdated(false), 3000);
  };

  if (!restaurateurId) {
    return (
      <Container className="mt-5">
        <div className="text-center">
          <p className="text-muted">Loading...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="restaurant-settings-page py-4">
      <button
        className="btn btn-link text-muted mb-3 p-0"
        onClick={() => navigate("/restaurateurs")}
        title="Back to dashboard"
      >
        <FiArrowLeft className="me-2" />
        Back to Dashboard
      </button>

      <Row className="mb-4">
        <Col>
          <h2 className="d-flex align-items-center gap-2">
            <FiSettings size={32} className="text-primary" />
            Restaurant Management
          </h2>
          <p className="text-muted">
            Configure your restaurant settings and capacity
          </p>
        </Col>
      </Row>

      {capacityUpdated && (
        <Alert variant="success" dismissible>
          ✅ Capacity updated successfully! Changes take effect immediately.
        </Alert>
      )}

      <Row>
        <Col lg={10} className="mx-auto">
          <Card className="shadow-lg border-0">
            <Card.Header className="bg-primary text-white border-0">
              <h5 className="mb-0">Settings</h5>
            </Card.Header>
            <Card.Body>
              <Tabs defaultActiveKey="capacity" className="mb-3">
                {/* Capacity Tab */}
                <Tab eventKey="capacity" title="📊 Table Capacity">
                  <div className="mt-4">
                    <RestaurantCapacitySettings
                      restaurateurId={restaurateurId}
                      onCapacityUpdate={handleCapacityUpdate}
                    />
                  </div>
                </Tab>

                {/* Info Tab */}
                <Tab eventKey="info" title="ℹ️ How It Works">
                  <div className="mt-4">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="info-card">
                          <h6 className="text-primary fw-bold">
                            📈 Dynamic Pricing
                          </h6>
                          <p className="small text-muted">
                            Your table capacity directly affects dynamic surge
                            pricing. When you're at capacity:
                          </p>
                          <ul className="small text-muted">
                            <li>Utilization increases</li>
                            <li>Price multiplier increases</li>
                            <li>Customers see higher prices</li>
                            <li>Helps balance demand</li>
                          </ul>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-card">
                          <h6 className="text-success fw-bold">
                            💡 Tips for Success
                          </h6>
                          <ul className="small text-muted">
                            <li>Set capacity to actual number of tables</li>
                            <li>
                              Higher capacity = lower prices = more bookings
                            </li>
                            <li>
                              Lower capacity = higher prices = higher revenue
                            </li>
                            <li>
                              Adjust based on your business hours and staff
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-light rounded">
                      <h6 className="text-dark fw-bold">
                        🎯 Example Scenarios
                      </h6>
                      <table className="table table-sm mb-0">
                        <thead>
                          <tr>
                            <th>Capacity</th>
                            <th>Active Bookings</th>
                            <th>Utilization</th>
                            <th>Price Multiplier</th>
                          </tr>
                        </thead>
                        <tbody className="small">
                          <tr>
                            <td>10 tables</td>
                            <td>4</td>
                            <td>40%</td>
                            <td>1.0x (no surge)</td>
                          </tr>
                          <tr>
                            <td>10 tables</td>
                            <td>7</td>
                            <td>70%</td>
                            <td>1.33x (+33%)</td>
                          </tr>
                          <tr>
                            <td>10 tables</td>
                            <td>10</td>
                            <td>100%</td>
                            <td>1.5x (+50%)</td>
                          </tr>
                          <tr>
                            <td>20 tables</td>
                            <td>10</td>
                            <td>50%</td>
                            <td>1.0x (no surge)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Tab>

                {/* FAQ Tab */}
                <Tab eventKey="faq" title="❓ FAQ">
                  <div className="mt-4">
                    <div className="faq-item mb-3">
                      <h6 className="text-dark fw-bold">
                        What is table capacity?
                      </h6>
                      <p className="small text-muted">
                        Table capacity is the maximum number of concurrent
                        reservations your restaurant can handle at any given
                        time.
                      </p>
                    </div>

                    <div className="faq-item mb-3">
                      <h6 className="text-dark fw-bold">
                        How does it affect pricing?
                      </h6>
                      <p className="small text-muted">
                        When your restaurant reaches 60% capacity, dynamic surge
                        pricing kicks in. The closer you get to 100%, the higher
                        the prices go (up to +50% maximum).
                      </p>
                    </div>

                    <div className="faq-item mb-3">
                      <h6 className="text-dark fw-bold">
                        When should I increase capacity?
                      </h6>
                      <p className="small text-muted">
                        If you consistently have bookings you can't fulfill or
                        if you add more tables to your restaurant, increase your
                        capacity setting.
                      </p>
                    </div>

                    <div className="faq-item mb-3">
                      <h6 className="text-dark fw-bold">
                        When should I decrease capacity?
                      </h6>
                      <p className="small text-muted">
                        If you want to limit bookings or increase prices during
                        peak hours, you can temporarily reduce capacity. Note:
                        Customers may book elsewhere.
                      </p>
                    </div>

                    <div className="faq-item">
                      <h6 className="text-dark fw-bold">
                        Is capacity permanent?
                      </h6>
                      <p className="small text-muted">
                        No! You can adjust it anytime. Changes take effect
                        immediately and will be reflected in pricing
                        calculations for new bookings.
                      </p>
                    </div>
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
