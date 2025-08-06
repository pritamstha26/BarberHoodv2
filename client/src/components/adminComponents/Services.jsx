import { useEffect, useState } from "react";
import { Card, Table, Button, Modal, Form, Row, Col } from "react-bootstrap";
import "./admin-panel.css";
import { Edit2, Plus, Trash2, Search } from "lucide-react";
import api from "../../apis/api";
import axios from "axios";

const Services = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedService, setSelectedService] = useState(null);
  const [data, setData] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleAddService = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");

    try {
      await axios.post("http://localhost:5000/api/barber-services/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Service added successfully");
      setShowAddModal(false);
      location.reload();
    } catch (error) {
      console.error("Error adding service:", error.response?.data || error);
      alert("Failed to add service");
    }
  };

  const handleEditService = async (service) => {
    setShowEditModal(true);
    setSelectedService(service);
  };

  const handleUpdateService = async () => {
    const token = localStorage.getItem("access_token");
    const service = selectedService;

    await api.put(`/barber-services/${service.id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setShowEditModal(false);
    await getData();
    alert("Service updated successfully");
  };

  const handleDeleteService = async (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      const token = localStorage.getItem("access_token");
      const response = await api.delete(`/barber-services/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      alert("Service deleted successfully");
      location.reload();
    }
  };
  const getData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await api.get("/barber-services/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = response.data;
      setData(result);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };
  useEffect(() => {
    getData();
  }, []);
  useEffect(() => {
    if (selectedService) {
      setFormData({
        name: selectedService.name || "",
        price: selectedService.price || "",
        duration: selectedService.duration || "",
      });
    }
  }, [selectedService]);
  let num = 1;
  console.log(data);
  return (
    <div className="services p-3">
      <div className="page-title d-flex justify-content-between align-items-center">
        <div>
          <h2>Services</h2>
          <p className="text-muted">Manage your service offerings</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <Plus size={20} /> Add New Service
        </Button>
      </div>

      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="dashboard-card">
            <Card.Body className="text-center">
              <div className="card-icon bg-primary text-white mx-auto">
                <i className="bi bi-scissors"></i>
              </div>
              <h2>{data.length}</h2>
              <p className="text-muted mb-0">Total Services</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <div className="table-container">
        <Table responsive hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Service</th>

              <th>Price</th>
              <th>Duration</th>

              <th className="d-flex justify-content-around ">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((service, num) => (
              <tr key={service.id}>
                <td>{num + 1}</td>
                <td>{service.name}</td>

                <td>Rs.{service.price}</td>
                <td>{service.duration} mins</td>

                <td className="action-buttons d-flex justify-content-around">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleEditService(service)}
                  >
                    <Edit2 size={20} />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    <Trash2 size={20} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Add Service Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Service</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Title </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter the name"
                    name="name"
                    onChange={handleChange}
                    value={formData.name}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Price (Rs)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter price"
                    name="price"
                    onChange={handleChange}
                    value={formData.price}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Duration (in minutes)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddService}>
            Add Service
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Service Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Service</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedService && (
            <Form>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.name || ""}
                      onChange={handleChange}
                      name="name"
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Duration (in minutes)</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.duration}
                      name="duration"
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Price (Rs)</Form.Label>
                    <Form.Control
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateService}>
            Update Service
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Services;
