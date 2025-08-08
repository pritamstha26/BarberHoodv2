import { Edit2, Plus, Trash2, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Table, Button, Badge, Modal, Form, InputGroup } from 'react-bootstrap';

import './admin-panel.css';
import { useAppointments } from '../../context/Appointment_context';
import api from '../../apis/api';
import axios from 'axios';
export const BarberList = () => {
  const { list, barberList, setList } = useAppointments();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_number: '',
    role: 'barber'
  });

  const handleAddBarber = async () => {
    // Add barber logic would go here
    try {
      const token = localStorage.getItem('access_token');

      const addData = { ...formData };

      const response = await api.post(`/auth/register`, addData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.status === 201) {
        alert('successfully updated');
        window.location.reload();
      }
    } catch (error) {
      console.error('An error occurred while adding the barber:', error);
    }

    setShowAddModal(false);
  };

  const handleEditBarber = (barber) => {
    setSelectedBarber(barber);
    setShowEditModal(true);
  };

  const handleUpdateBarber = async (barb) => {
    try {
      const token = localStorage.getItem('access_token');

      const updatedData = { ...formData };

      // Remove password field if it's empty or only whitespace
      if (!updatedData.password?.trim()) {
        delete updatedData.password;
      }

      const response = await api.put(`/users/${barb.id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.status === 200) {
        alert('successfully updated');

        window.location.reload();
      }
    } catch (error) {
      console.error('An error occurred while updating the barber:', error);
    }
    setShowEditModal(false);
  };

  const filterBarber = barberList.filter(
    (barber) =>
      barber.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      barber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      barber.last_name.includes(searchTerm)
  );

  const handleDeleteBarber = async (b_id) => {
    if (!window.confirm('Are you sure you want to delete this barber?')) return;

    try {
      const token = localStorage.getItem('access_token');

      const response = await axios.delete(`http://localhost:6969/api/users/delete/${b_id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        // Remove barber from list after successful deletion
        setList((prevList) => prevList.filter((barber) => barber.id !== b_id));
        alert('Barber deleted successfully');
      } else {
        alert('Failed to delete barber');
      }
    } catch (error) {
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data.message.includes('appointments')
      ) {
        alert('Cannot delete a barber who has existing appointments.');
      } else {
        console.error('An error occurred while deleting the barber:', error);
        alert('An unexpected error occurred while deleting the barber.');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const num = 1;
  useEffect(() => {
    if (selectedBarber) {
      setFormData({
        first_name: selectedBarber.first_name,
        last_name: selectedBarber.last_name,
        email: selectedBarber.email,
        password: '',
        phone_number: selectedBarber.phone_number
      });
    }
  }, [selectedBarber]);

  return (
    <div className="barber-list p-3">
      <div className="page-title d-flex justify-content-between align-items-center">
        <div>
          <h2>Barber List</h2>
          <p className="text-muted">Manage your barbers</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <Plus size={20} /> Add New Barber
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
            {filterBarber.map((barber, num) => (
              <tr key={barber.id}>
                <td className="py-3">{num + 1}</td>
                <td className="py-3">
                  {barber.first_name} {barber.last_name}
                </td>
                <td className="py-3">
                  <div>{barber.email}</div>
                </td>

                <td className="py-3">{barber.phone_number}</td>
                <td className="action-buttons d-flex justify-content-around py-3  ">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleEditBarber(barber)}
                  >
                    <Edit2 size={20} />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDeleteBarber(barber.id)}
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
          <Modal.Title>Add New Barber</Modal.Title>
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
            Add Barber
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Barber Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Barber</Modal.Title>
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
          <Button variant="primary" onClick={() => handleUpdateBarber(selectedBarber)}>
            Update Barber
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BarberList;
