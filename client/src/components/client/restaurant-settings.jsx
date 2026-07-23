import React, { useState, useEffect } from "react";
import { Card, Form, Button, Alert, Spinner, Table, Modal } from "react-bootstrap";
import api from "../../apis/api";
import "./settings.css";

const RestaurantSettings = ({ restaurateurId, onCapacityUpdate }) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [formData, setFormData] = useState({ table_number: "", capacity: 1, is_active: true });

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tables/restaurant/${restaurateurId}`);
      if (response.data.success) {
        setTables(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching tables:", err);
      setError("Failed to load tables");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurateurId) {
      fetchTables();
    }
  }, [restaurateurId]);

  const handleAddTable = async () => {
    if (!formData.table_number || !formData.capacity) {
      setError("Table number and capacity are required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await api.post("/tables", {
        restaurateur_id: restaurateurId,
        table_number: formData.table_number,
        capacity: formData.capacity,
        is_active: formData.is_active,
      });

      console.log("[Tables] create response", response.status, response.data);

      if (response.data.success) {
        setSuccess(`Table ${formData.table_number} added successfully`);
        setShowAddModal(false);
        setFormData({ table_number: "", capacity: 1, is_active: true });
        fetchTables();
      } else {
        setError(response.data.message || "Failed to add table");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add table");
      console.error("[Tables] create error", err.response?.data || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditTable = async () => {
    if (!editingTable) return;

    setSaving(true);
    setError("");

    try {
      const response = await api.put(`/tables/${editingTable.id}`, {
        table_number: editingTable.table_number,
        capacity: editingTable.capacity,
        is_active: editingTable.is_active,
      });

      if (response.data.success) {
        setSuccess(`Table ${editingTable.table_number} updated successfully`);
        setEditingTable(null);
        fetchTables();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update table");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTable = async (tableId, tableNumber) => {
    if (!window.confirm(`Delete Table ${tableNumber}?`)) return;

    try {
      const response = await api.delete(`/tables/${tableId}`);
      if (response.data.success) {
        setSuccess(`Table ${tableNumber} deleted successfully`);
        fetchTables();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete table");
    }
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

  const totalCapacity = tables.reduce((sum, t) => sum + Number(t.capacity), 0);

  return (
    <Card className="settings-card">
      <Card.Header className="settings-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5>Restaurant Tables</h5>
            <p className="text-muted">
              Manage your tables and their capacities
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
            Add Table
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <div className="mb-3">
          <strong>Total Capacity: </strong>{tables.length > 0 ? `${totalCapacity} guests across ${tables.length} tables` : "No tables configured"}
        </div>

        {tables.length === 0 ? (
          <Alert variant="info">
            No tables configured yet. Click "Add Table" to create your first table.
          </Alert>
        ) : (
          <Table responsive>
            <thead>
              <tr>
                <th>Table #</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tables.map((table) => (
                <tr key={table.id}>
                  <td>{table.table_number}</td>
                  <td>{table.capacity}</td>
                  <td>
                    <span className={`badge ${table.is_active ? "bg-success" : "bg-secondary"}`}>
                      {table.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => setEditingTable(table)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteTable(table.id, table.table_number)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Add Table Modal */}
        <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Add Table</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Table Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. A1, B2, 1, 2, 3"
                value={formData.table_number}
                onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Capacity (guests)</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddTable} disabled={saving}>
              {saving ? "Saving..." : "Add Table"}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Edit Table Modal */}
        <Modal show={!!editingTable} onHide={() => setEditingTable(null)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Edit Table</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {editingTable && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Table Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={editingTable.table_number}
                    onChange={(e) => setEditingTable({ ...editingTable, table_number: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Capacity (guests)</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={editingTable.capacity}
                    onChange={(e) => setEditingTable({ ...editingTable, capacity: Number(e.target.value) })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Active"
                    checked={editingTable.is_active}
                    onChange={(e) => setEditingTable({ ...editingTable, is_active: e.target.checked })}
                  />
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setEditingTable(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleEditTable} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </Modal.Footer>
        </Modal>
      </Card.Body>
    </Card>
  );
};

export default RestaurantSettings;
