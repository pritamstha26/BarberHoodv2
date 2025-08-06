import { Edit2, Plus, Trash2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Table, Button, Badge, Modal, Form, InputGroup } from "react-bootstrap";

import "./admin-panel.css";
import { useAppointments } from "../../context/Appointment_context";
import api from "../../apis/api";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
export const ClientList = () => {
  const { list, clientList, setList } = useAppointments();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone_number: "",
    role: "client",
  });

  const handleAddClient = async () => {
    // Add barber logic would go here
    try {
      const token = localStorage.getItem("access_token");

      const addData = { ...formData };

      const response = await api.post(`/auth/register`, addData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 201) {
        alert("successfully updated");
        window.location.reload();
      }
    } catch (error) {
      console.error("An error occurred while adding the client:", error);
    }

    setShowAddModal(false);
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setShowEditModal(true);
  };

  const handleUpdateClient = async (client) => {
    try {
      const token = localStorage.getItem("access_token");

      const updatedData = { ...formData };

      // Remove password field if it's empty or only whitespace
      if (!updatedData.password?.trim()) {
        delete updatedData.password;
      }

      const response = await api.put(`/users/${client.id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        alert("successfully updated");

        window.location.reload();
      }
    } catch (error) {
      console.error("An error occurred while updating the client:", error);
    }
    setShowEditModal(false);
  };

  const filterClient = clientList.filter(
    (client) =>
      client.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.last_name.includes(searchTerm)
  );
  const handleDeleteClient = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("No token found, please login again.");
        return;
      }

      const response = await axios.delete(
        `http://localhost:5000/api/users/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        alert(response.data.message); // "User deleted successfully, related appointments cancelled"
        // Update your local list by filtering out deleted user
        setList((prevList) => prevList.filter((user) => user.id !== id));
      } else {
        alert(response.data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("An error occurred while deleting the user:", error);
      alert("Something went wrong while deleting the user.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const num = 1;
  useEffect(() => {
    if (selectedClient) {
      setFormData({
        first_name: selectedClient.first_name,
        last_name: selectedClient.last_name,
        email: selectedClient.email,
        password: "",
        phone_number: selectedClient.phone_number,
      });
    }
  }, [selectedClient]);
  return (
    <div className="barber-list p-3">
      <div className="page-title d-flex justify-content-between align-items-center">
        <div>
          <h2>Client List</h2>
          <p className="text-muted">Manage your clients</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <Plus size={20} /> Add New Client
        </Button>
      </div>
      <div className="mb-3">
        <InputGroup>
          <InputGroup.Text>
            <Search />
          </InputGroup.Text>
          <Form.Control
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      </div>
      <div className="table-container ">
        <Table responsive hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>

              <th>Email</th>
              <th>Phone no.</th>
              <th className="d-flex justify-content-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filterClient.map((client, num) => (
              <tr key={client.id}>
                <td className="py-3">{num + 1}</td>
                <td className="py-3">
                  {client.first_name} {client.last_name}
                </td>
                <td className="py-3">
                  <div>{client.email}</div>
                </td>

                <td className="py-3">{client.phone_number}</td>
                <td className="action-buttons d-flex justify-content-around py-3  ">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleEditClient(client)}
                  >
                    <Edit2 size={20} />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDeleteClient(client.id)}
                  >
                    <Trash2 size={20} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Add Client Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Client</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>First name</Form.Label>
              <Form.Control
                type="text"
                name="first_name"
                value={formData.first_name}
                placeholder="Enter first name"
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Last name</Form.Label>
              <Form.Control
                type="text"
                name="last_name"
                value={formData.last_name}
                placeholder="Enter last name"
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone number</Form.Label>
              <Form.Control
                type="number"
                name="phone_number"
                value={formData.phone_number}
                placeholder="Enter phone number"
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                placeholder="Enter email"
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="email"
                name="password"
                value={formData.password}
                placeholder="Enter password"
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddClient}>
            Add Client
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Client Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Client</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedClient && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>First name</Form.Label>
                <Form.Control
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Last name</Form.Label>
                <Form.Control
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Phone no.</Form.Label>
                <Form.Control
                  type="number"
                  name="phone_number"
                  placeholder="Phone no."
                  value={formData.phone_number}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="text"
                  name="password"
                  value={formData.password}
                  placeholder="Enter new password"
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => handleUpdateClient(selectedClient)}
          >
            Update Client
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ClientList;
