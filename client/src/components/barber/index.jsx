import { use, useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Navbar,
  Nav,
  Card,
  Table,
  Button,
  Badge,
  Modal,
  Form,
  Alert,
  Spinner
} from 'react-bootstrap';
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaUserClock,
  FaCut,
  FaCog,
  FaSignOutAlt,
  FaCheck,
  FaTimes,
  FaEye,
  FaCalendar,
  FaPhoneAlt,
  FaEnvelope,
  FaUser
} from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import api from '../../apis/api';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Plus } from 'lucide-react';
import axios from 'axios';

export default function BarberDashboard() {
  const [activeTab, setActiveTab] = useState('appointments');
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('success');
  //
  const [barberInfo, setBarberInfo] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_number: ''
  });
  const [serviceDataForm, setServiceDataForm] = useState({
    name: '',
    price: '',
    duration: ''
  });

  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(!show);
  const handleService = (service) => {
    setSelectedService(service);
    setShow(true);
  };
  const getServices = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await api.get('/barber-services/all', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.status === 200) {
        setServices(response.data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };
  // Appointment functions now handled differently
  const handleUpdateAppointmentStatus = (appointmentId, newStatus) => {
    // This will be implemented to update appointment status
    console.log(`Updating appointment ${appointmentId} to ${newStatus}`);
    // In a real implementation, this would call the API to update the status
  };

  // Removed handleDenyRequest as it's no longer needed

  const showAlertMessage = (message, variant) => {
    setAlertMessage(message);
    setAlertVariant(variant);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  // Removed viewRequestDetails as it's no longer needed

  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };
  const handleAddService = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');

    try {
      const response = await axios.post(
        'http://localhost:6969/api/barber-services/', // Change to your backend URL
        serviceDataForm,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      alert('Service added successfully');
      setShow(false);
      location.reload();
    } catch (error) {
      console.error('Error adding service:', error.response?.data || error);
      alert('Failed to add service');
    }
  };

  const handleUpdateBarber = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const decode = jwtDecode(token);

      const updatedData = { ...formData };

      // Remove password field if it's empty or only whitespace
      if (!updatedData.password?.trim()) {
        delete updatedData.password;
      }

      const response = await api.put(`/users/${decode.id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.status === 200) {
        alert('successfully ');
        localStorage.removeItem('access_token');
        navigate('/login');
      }
    } catch (error) {
      console.error('An error occurred while updating the barber:', error);
    }
  };
  const handleUpdateService = async () => {
    const token = localStorage.getItem('access_token');
    const service = selectedService;
    await api.put(`/barber-services/${service.id}`, serviceDataForm, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    setShow(false);
    await getServices();
  };

  // Handle appointment confirmation
  const handleConfirmAppointment = async (appointmentId) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('access_token');

      const response = await api.put(
        `/appointments/${appointmentId}/confirm`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        showAlertMessage('Appointment confirmed successfully!', 'success');
        // Update appointments list
        await fetchAppointments();
      } else {
        showAlertMessage('Failed to confirm appointment', 'danger');
      }
    } catch (error) {
      console.error('Error confirming appointment:', error);
      showAlertMessage(`Error: ${error.response?.data?.message || error.message}`, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle appointment cancellation
  const handleCancelAppointment = async (appointmentId) => {
    try {
      if (!window.confirm('Are you sure you want to cancel this appointment?')) {
        return;
      }

      setIsLoading(true);
      const token = localStorage.getItem('access_token');

      const response = await api.put(
        `/appointments/${appointmentId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        showAlertMessage('Appointment cancelled successfully!', 'warning');
        // Update appointments list
        await fetchAppointments();
      } else {
        showAlertMessage('Failed to cancel appointment', 'danger');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      showAlertMessage(`Error: ${error.response?.data?.message || error.message}`, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle marking appointment as completed
  const handleCompleteAppointment = async (appointmentId) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('access_token');

      const response = await api.put(
        `/appointments/${appointmentId}/complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        showAlertMessage('Appointment marked as completed!', 'success');
        // Update appointments list
        await fetchAppointments();
      } else {
        showAlertMessage('Failed to complete appointment', 'danger');
      }
    } catch (error) {
      console.error('Error completing appointment:', error);
      showAlertMessage(`Error: ${error.response?.data?.message || error.message}`, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const decoded = jwtDecode(token);
      const barberId = decoded.id;

      const response = await api.get(`/appointments/barber/${barberId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setAppointments(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Removed fetchAllServiceRequests as it's no longer needed

  const fetchUserById = async () => {
    const token = localStorage.getItem('access_token');
    const decode = jwtDecode(token);
    const response = await api.get(`/users/${decode.id}`);
    if (response.status === 200) {
      setBarberInfo(response.data.data);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const handleServiceChange = (e) => {
    const { name, value } = e.target;
    setServiceDataForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const renderDashboard = () => (
    <div>
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center bg-primary text-white">
            <Card.Body>
              <h3>{appointments.length}</h3>
              <p>Total Appointments</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center bg-success text-white">
            <Card.Body>
              <h3>
                {
                  appointments.filter((a) => a.status === 'confirmed' || a.status === 'completed')
                    .length
                }
              </h3>
              <p>Confirmed/Completed</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center bg-warning text-white">
            <Card.Body>
              <h3>{appointments.filter((a) => a.status === 'pending').length}</h3>
              <p>Pending</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center bg-info text-white">
            <Card.Body>
              <h3>Rs.{appointments.reduce((total, app) => total + parseInt(app.price || 0), 0)}</h3>
              <p>Est. Revenue</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5>Today's Appointments</h5>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={fetchAppointments}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                Loading...
              </>
            ) : (
              <>
                <FaCalendarAlt className="me-1" /> Refresh
              </>
            )}
          </Button>
        </Card.Header>
        <Card.Body>
          <Table responsive striped>
            <thead>
              <tr>
                <th>Client</th>
                <th>Service</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length > 0 ? (
                appointments.slice(0, 5).map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.client_name}</td>
                    <td>{appointment.service_name}</td>
                    <td>
                      {new Date(appointment.date).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </td>
                    <td>
                      <Badge bg={getStatusVariant(appointment.status)}>{appointment.status}</Badge>
                    </td>
                    <td>{appointment.duration} min</td>
                    <td>Rs. {appointment.price}</td>
                    <td>
                      <Button
                        variant="success"
                        size="sm"
                        className="me-1"
                        disabled={appointment.status !== 'pending'}
                        onClick={() => handleConfirmAppointment(appointment.id)}
                      >
                        <FaCheck /> Confirm
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={
                          appointment.status === 'completed' || appointment.status === 'cancelled'
                        }
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        <FaTimes /> Cancel
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    {isLoading ? (
                      <div>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Loading appointments...
                      </div>
                    ) : (
                      'No appointments found. Your schedule is clear!'
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );

  const renderAppointments = () => (
    <div>
      <div className="mb-4">
        <h1 className="display-5 fw-bold text-dark mb-2">Appointments</h1>
        <p className="text-muted">Manage all your scheduled appointments and bookings.</p>
      </div>

      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <FaCalendarAlt className="me-2 text-primary" /> All Appointments
          </h5>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={fetchAppointments}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                Loading...
              </>
            ) : (
              <>
                <FaCalendarAlt className="me-1" /> Refresh
              </>
            )}
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading appointments...</p>
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length > 0 ? (
                  appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center">
                          <div className="bg-light rounded-circle p-2 me-2">
                            <FaUser className="text-primary" />
                          </div>
                          <div>
                            <div className="fw-medium">{appointment.client_name}</div>
                            <div className="small text-muted">ID: {appointment.client_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{appointment.service_name}</td>
                      <td className="px-4 py-3">
                        {new Date(appointment.date).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </td>
                      <td className="px-4 py-3">{appointment.duration} min</td>
                      <td className="px-4 py-3">Rs. {appointment.price}</td>
                      <td className="px-4 py-3">
                        <Badge bg={getStatusVariant(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {appointment.status === 'pending' && (
                          <Button
                            variant="success"
                            size="sm"
                            className="me-1 mb-1"
                            onClick={() => handleConfirmAppointment(appointment.id)}
                          >
                            <FaCheck className="me-1" /> Confirm
                          </Button>
                        )}
                        {appointment.status === 'confirmed' && (
                          <Button
                            variant="primary"
                            size="sm"
                            className="me-1 mb-1"
                            onClick={() => handleCompleteAppointment(appointment.id)}
                          >
                            <FaCheck className="me-1" /> Complete
                          </Button>
                        )}
                        {(appointment.status === 'pending' ||
                          appointment.status === 'confirmed') && (
                          <Button
                            variant="danger"
                            size="sm"
                            className="mb-1"
                            onClick={() => handleCancelAppointment(appointment.id)}
                          >
                            <FaTimes className="me-1" /> Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="my-4">
                        <FaCalendarAlt className="text-muted mb-3" style={{ fontSize: '2rem' }} />
                        <h5>No appointments found</h5>
                        <p className="text-muted">Your schedule is clear!</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );

  // Removed renderRequests function as it's no longer needed

  const renderServices = () => (
    <Card>
      <Card.Header>
        <div className="page-title d-flex justify-content-between align-items-center">
          <div>
            <h2>Services</h2>
            <p className="text-muted">Manage your service offerings</p>
          </div>
          <Button variant="primary" onClick={() => setShow(true)}>
            <Plus size={20} /> Add New Service
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <Row>
          {services?.map((service) => (
            <Col md={4} className="mb-3" key={service.id}>
              <Card className="h-100">
                <Card.Body className="text-center">
                  <FaCut className="mb-2" size={30} />
                  <Card.Title>{service?.name}</Card.Title>
                  <Card.Text>
                    <strong>Price:</strong> {service?.price}
                    <br />
                    <strong>Duration:</strong> {service?.duration}
                  </Card.Text>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleService(service)}
                  >
                    Edit Service
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Card.Body>
    </Card>
  );

  const renderSettings = () => (
    <Card>
      <Card.Header>
        <h5>Settings</h5>
      </Card.Header>
      <Card.Body>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>First name</Form.Label>
                <Form.Control
                  className="text-capitalize"
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Last name</Form.Label>
                <Form.Control
                  type="text"
                  name="last_name"
                  className="text-capitalize"
                  value={formData.last_name}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Contact Phone</Form.Label>
                <Form.Control
                  type="number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>{' '}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  placeholder="Enter your password"
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Button variant="primary" onClick={handleUpdateBarber}>
            Save Settings
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'appointments':
        return renderAppointments();
      case 'services':
        return renderServices();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };
  useEffect(() => {
    fetchUserById();
    getServices();
    fetchAppointments();
  }, []);
  useEffect(() => {
    if (barberInfo) {
      setFormData({
        first_name: barberInfo.first_name,
        last_name: barberInfo.last_name,
        email: barberInfo.email,
        password: '',
        phone_number: barberInfo.phone_number
      });
    }
  }, [barberInfo]);
  useEffect(() => {
    if (selectedService) {
      setServiceDataForm({
        name: selectedService.name || '',
        price: selectedService.price || '',

        duration: selectedService.duration || ''
      });
    }
  }, [selectedService]);
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Alert message */}
      {showAlert && (
        <div
          className={`position-fixed top-0 start-50 translate-middle-x p-3 mt-4 alert alert-${alertVariant} alert-dismissible fade show`}
          style={{ zIndex: 1050, maxWidth: '500px' }}
          role="alert"
        >
          {alertMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowAlert(false)}
            aria-label="Close"
          ></button>
        </div>
      )}
      {/* Sidebar */}
      <div className="bg-dark text-white" style={{ width: '250px', minHeight: '100vh' }}>
        <div className="p-3">
          <h4 className="mb-4">
            <FaCut className="me-2" />
            Barber Dashboard
          </h4>
          <Nav className="flex-column">
            <Nav.Link
              className={`text-white mb-2 ${activeTab === 'dashboard' ? 'bg-primary rounded' : ''}`}
              onClick={() => setActiveTab('dashboard')}
              style={{ cursor: 'pointer' }}
            >
              <FaTachometerAlt className="me-2" />
              Dashboard
            </Nav.Link>
            <Nav.Link
              className={`text-white mb-2 ${
                activeTab === 'appointments' ? 'bg-primary rounded' : ''
              }`}
              onClick={() => setActiveTab('appointments')}
              style={{ cursor: 'pointer' }}
            >
              <FaCalendarAlt className="me-2" />
              Appointments
              {appointments.filter((a) => a.status === 'pending').length > 0 && (
                <Badge bg="warning" className="ms-2">
                  {appointments.filter((a) => a.status === 'pending').length}
                </Badge>
              )}
            </Nav.Link>
            <Nav.Link
              className={`text-white mb-2 ${activeTab === 'services' ? 'bg-primary rounded' : ''}`}
              onClick={() => setActiveTab('services')}
              style={{ cursor: 'pointer' }}
            >
              <FaCut className="me-2" />
              Services
            </Nav.Link>
            <Nav.Link
              className={`text-white mb-2 ${activeTab === 'settings' ? 'bg-primary rounded' : ''}`}
              onClick={() => setActiveTab('settings')}
              style={{ cursor: 'pointer' }}
            >
              <FaCog className="me-2" />
              Settings
            </Nav.Link>
            <hr />
            <Nav.Link className="text-white" onClick={handleLogout} style={{ cursor: 'pointer' }}>
              <FaSignOutAlt className="me-2" />
              Logout
            </Nav.Link>
          </Nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1">
        <Navbar bg="light" expand="lg" className="border-bottom">
          <Container fluid>
            <Navbar.Brand>
              Welcome,
              <span className="fw-bold text-capitalize ms-1">
                {formData.first_name} {formData.last_name}
              </span>
              !
            </Navbar.Brand>
            {isLoading && (
              <div className="ms-auto me-3">
                <Spinner animation="border" size="sm" role="status" className="text-primary me-2" />
                <span className="small text-muted">Processing...</span>
              </div>
            )}
            <Navbar.Text className="ms-auto">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Navbar.Text>
          </Container>
        </Navbar>

        <Container fluid className="p-4">
          {showAlert && (
            <Alert variant={alertVariant} dismissible onClose={() => setShowAlert(false)}>
              {alertMessage}
            </Alert>
          )}
          {renderContent()}
        </Container>
      </div>

      {/* Service edit Modal */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Services</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="edit service price">
              <Form.Label className="fw-bold">Title</Form.Label>
              <Form.Control
                type="text"
                value={serviceDataForm.name || ''}
                name="name"
                onChange={handleServiceChange}
                autoFocus
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="edit service price">
              <Form.Label className="fw-bold">Price</Form.Label>
              <Form.Control
                type="number"
                value={serviceDataForm?.price || ''}
                onChange={handleServiceChange}
                name="price"
                autoFocus
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId=" edit service price">
              <Form.Label className="fw-bold">Duration</Form.Label>
              <Form.Control
                type="number"
                onChange={handleServiceChange}
                name="duration"
                autoFocus
                value={serviceDataForm?.duration || ''}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdateService}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
      {/* add services */}
      <Modal show={show} onHide={setShow}>
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
                    placeholder="Enter the title"
                    name="name"
                    onChange={handleServiceChange}
                    value={serviceDataForm.title}
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
                    onChange={handleServiceChange}
                    value={serviceDataForm.price}
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
                    value={serviceDataForm.duration}
                    onChange={handleServiceChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddService}>
            Add Service
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
