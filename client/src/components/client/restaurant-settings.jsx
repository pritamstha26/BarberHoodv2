import React, { useState, useEffect } from "react";
import { Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import api from "../../apis/api";
import "./settings.css";

const RestaurantSettings = ({ restaurateurId, onCapacityUpdate }) => {
  const [capacity, setCapacity] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [originalCapacity, setOriginalCapacity] = useState(10);

  // Fetch current capacity on mount
  useEffect(() => {
    const fetchCapacity = async () => {
      try {
        setLoading(true);
        const response = await api.get(
          `/users/restaurateur/${restaurateurId}/capacity`,
        );
        if (response.data.success) {
          const currentCapacity = response.data.data.seat_capacity;
          setCapacity(currentCapacity);
          setOriginalCapacity(currentCapacity);
        }
      } catch (err) {
        console.error("Error fetching capacity:", err);
        setError("Failed to load current capacity");
      } finally {
        setLoading(false);
      }
    };

    if (restaurateurId) {
      fetchCapacity();
    }
  }, [restaurateurId]);

  const handleCapacityChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setCapacity(value);
    setError("");
    setSuccess("");
  };

  const handleSaveCapacity = async () => {
    try {
      // Validation
      if (capacity < 1) {
        setError("Capacity must be at least 1 table");
        return;
      }
      if (capacity > 1000) {
        setError("Capacity cannot exceed 1000 tables");
        return;
      }
      if (capacity === originalCapacity) {
        setError("Please change the capacity before saving");
        return;
      }

      setSaving(true);
      setError("");
      setSuccess("");

      const response = await api.put(
        `/users/restaurateur/${restaurateurId}/capacity`,
        {
          seat_capacity: capacity,
        },
      );

      if (response.data.success) {
        setOriginalCapacity(capacity);
        setSuccess(`Capacity successfully updated to ${capacity} tables`);
        if (onCapacityUpdate) {
          onCapacityUpdate(capacity);
        }
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      console.error("Error updating capacity:", err);
      setError(err.response?.data?.message || "Failed to update capacity");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setCapacity(originalCapacity);
    setError("");
    setSuccess("");
  };

  if (loading) {
    return (
      <Card className="settings-card">
        <Card.Body className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="settings-card">
      <Card.Header className="settings-header">
        <h5>Restaurant Table Capacity</h5>
        <p className="text-muted">
          Configure the number of tables available for reservations
        </p>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Number of Tables</Form.Label>
            <Form.Control
              type="number"
              min="1"
              max="1000"
              value={capacity}
              onChange={handleCapacityChange}
              placeholder="Enter number of tables"
              className="capacity-input"
            />
            <Form.Text className="d-block mt-2">
              Current: <strong>{originalCapacity} tables</strong>
            </Form.Text>
            <Form.Text className="d-block text-muted">
              This capacity directly affects:
              <ul className="mt-2 mb-0">
                <li>Maximum concurrent appointments</li>
                <li>Dynamic pricing surge calculation</li>
                <li>Seat availability for clients</li>
              </ul>
            </Form.Text>
          </Form.Group>

          <div className="d-flex gap-2">
            <Button
              variant="primary"
              onClick={handleSaveCapacity}
              disabled={saving || capacity === originalCapacity}
              className="capacity-save-btn"
            >
              {saving ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button
              variant="outline-secondary"
              onClick={handleReset}
              disabled={capacity === originalCapacity}
            >
              Reset
            </Button>
          </div>
        </Form>

        <Card className="mt-4 bg-light">
          <Card.Body>
            <h6 className="mb-3">How Capacity Affects Pricing</h6>
            <p className="small mb-0">
              When demand is high (over 60% of your tables are reserved), prices
              automatically increase to encourage optimal booking distribution.
              This prevents overbooking and ensures better service quality for
              clients.
            </p>
          </Card.Body>
        </Card>
      </Card.Body>
    </Card>
  );
};

export default RestaurantSettings;
