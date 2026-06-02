import { Edit2, Plus, Trash2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Table, Button, Badge, Modal, Form, InputGroup } from "react-bootstrap";

import "./admin-panel.css";
import { useAppointments } from "../../context/Appointment_context";
import api from "../../apis/api";
export const BarberList = () => {
  const { list, restaurateursList, setList } = useAppointments();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone_number: "",
    role: "restaurateurs",
  });

  const handleAddBarber = async () => {
    // Add barber logic would go here
    try {
      const token = sessionStorage.getItem("access_token");

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
      console.error("An error occurred while adding the barber:", error);
    }

    setShowAddModal(false);
  };

  const handleEditBarber = (restaurateur) => {
    setSelectedBarber(restaurateur);
    setShowEditModal(true);
  };

  const handleUpdateBarber = async (rest) => {
    try {
      const token = sessionStorage.getItem("access_token");

      const updatedData = { ...formData };

      // Remove password field if it's empty or only whitespace
      if (!updatedData.password?.trim()) {
        delete updatedData.password;
      }

      const response = await api.put(`/users/${rest.id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        alert("successfully updated");

        window.location.reload();
      }
    } catch (error) {
      console.error(
        "An error occurred while updating the restaurateurs:",
        error,
      );
    }
    setShowEditModal(false);
  };

  const filterRestaurant = restaurateursList?.filter(
    (restaurateur) =>
      restaurateur.first_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      restaurateur.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurateur.last_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleDeleteBarber = async (r_id) => {
    if (!window.confirm("Are you sure you want to delete this restaurateur?"))
      return;

    try {
      const token = sessionStorage.getItem("access_token");

      const response = await api.delete(`/users/delete/${r_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setList((prevList) =>
          prevList.filter((restaurateur) => restaurateur.id !== r_id),
        );
        alert("Restaurateur deleted successfully");
      } else {
        alert("Failed to delete restaurateur");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data.message.includes("appointments")
      ) {
        alert("Cannot delete a restaurateur who has existing appointments.");
      } else {
        console.error(
          "An error occurred while deleting the restaurateur:",
          error,
        );
        alert("An unexpected error occurred while deleting the restaurateur.");
      }
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
    if (selectedBarber) {
      setFormData({
        first_name: selectedBarber.first_name,
        last_name: selectedBarber.last_name,
        email: selectedBarber.email,
        password: "",
        phone_number: selectedBarber.phone_number,
      });
    }
  }, [selectedBarber]);

  return (
    <div className="barber-list p-3">
      <div className="page-title d-flex justify-content-between align-items-center">
        <div>
          <h2>Restaurateur List</h2>
          <p className="text-muted">Manage your restaurateur</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <Plus size={20} /> Add New restaurateur
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
            {filterRestaurant?.map((restaurateur, num) => (
              <tr key={restaurateur.id}>
                <td className="py-3">{num + 1}</td>
                <td className="py-3">
                  {restaurateur.first_name} {restaurateur.last_name}
                </td>
                <td className="py-3">
                  <div>{restaurateur.email}</div>
                </td>

                <td className="py-3">{restaurateur.phone_number}</td>
                <td className="action-buttons d-flex justify-content-around py-3  ">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleEditBarber(restaurateur)}
                  >
                    <Edit2 size={20} />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDeleteBarber(restaurateur.id)}
                  >
                    <Trash2 size={20} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Add Barber Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New restaurateur</Modal.Title>
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
          <Button variant="primary" onClick={handleAddBarber}>
            Add restaurateur
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Barber Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit restaurateur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBarber && (
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
            onClick={() => handleUpdateBarber(selectedBarber)}
          >
            Update restaurateur
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BarberList;
