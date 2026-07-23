import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Tabs, Tab, Alert } from "react-bootstrap";
import { FiSettings, FiArrowLeft } from "react-icons/fi";
import RestaurantCapacitySettings from "./restaurant-settings";
import RestaurantSettings from "./restaurant-settings";
import "./restaurant-settings-page.css";

export default function RestaurantSettingsPage() {
  const navigate = useNavigate();
  const [restaurateurId, setRestaurateurId] = useState(null);
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
              <Tabs defaultActiveKey="tables" className="mb-3">
                {/* Tables Tab */}
                <Tab eventKey="tables" title="🪑 Tables">
                  <div className="mt-4">
                    <RestaurantSettings
                      restaurateurId={restaurateurId}
                      onCapacityUpdate={handleCapacityUpdate}
                    />
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
