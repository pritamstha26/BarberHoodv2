import { Row, Col, Card } from "react-bootstrap";

import "./admin-panel.css";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../../apis/api";

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const POLL_INTERVAL_MS = 5000;
  const StatusBadge = ({ status }) => {
    let className = "badge ";

    switch (status) {
      case "pending":
        className += "bg-warning";
        break;

      case "completed":
        className += "bg-success";
        break;
      case "cancelled":
        className += "bg-danger";
        break;
      case "in_progress":
        className += "bg-secondary";
        break;
      default:
        className += "bg-light text-dark"; // default style
    }

    return <span className={className}>{status || "N/A"}</span>;
  };

  const getAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current restaurant/restaurateur ID from token
      const token = sessionStorage.getItem("access_token");
      if (!token) {
        setError("Not authenticated");
        return;
      }

      const decodedToken = jwtDecode(token);
      const restaurateurId = decodedToken.id;

      // Fetch appointments for this restaurateur
      const response = await api.get(`/appointments/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const rawData = response.data.data ?? response.data;
        const appointmentsData = Array.isArray(rawData)
          ? rawData.map((apt) => ({
              ...apt,
              client_name:
                apt.client?.first_name && apt.client?.last_name
                  ? `${apt.client.first_name} ${apt.client.last_name}`
                  : apt.client_name,
              restaurateur_name:
                apt.restaurateurs?.first_name && apt.restaurateurs?.last_name
                  ? `${apt.restaurateurs.first_name} ${apt.restaurateurs.last_name}`
                  : apt.restaurateur_name,
              service_name: apt.service?.name || apt.service_name,
              duration: apt.service?.duration || apt.duration,
              price: apt.service?.price || apt.price,
            }))
          : [];
        setAppointments(appointmentsData);
        console.log("Appointments loaded:", appointmentsData);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAppointments();
    const interval = setInterval(getAppointments, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard p-4">
      <div className="page-title">
        <h2>Dashboard</h2>
        <p className="text-muted">
          Welcome back,<span className="fw-bold"> Admin</span>
        </p>
      </div>

      <Row>
        <Col md={6} lg={3} className="mb-4">
          <Card className="dashboard-card">
            <Card.Body className="text-center">
              <div className="card-icon bg-warning text-white mx-auto">
                <i className="bi bi-calendar-check"></i>
              </div>
              <h2>{appointments.length}</h2>
              <p className="text-muted mb-0">Today's Appointments</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={12} className="mb-4">
          <Card className="dashboard-card">
            <Card.Body>
              <h5 className="card-title"> Appointments Details</h5>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Restaurant</th>
                      <th>Service</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {appointments.map((data) => (
                      <tr key={data.id}>
                        <td>{data.client_name || "Unknown Client"}</td>
                        <td>{data.restaurateur_name || "Restaurant"}</td>
                        <td>{data.service_name || "Service Deleted"}</td>
                        <td>{new Date(data.date).toLocaleString()}</td>
                        <td>
                          <StatusBadge status={data.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* <Col lg={4} className="mb-4">
          <Card className="dashboard-card">
            <Card.Body>
              <h5 className="card-title">Popular Services</h5>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Haircut</span>
                  <span>65%</span>
                </div>
                <div className="progress">
                  <div
                    className="progress-bar bg-primary"
                    role="progressbar"
                    style={{ width: "70%" }}
                    aria-valuenow="65"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Beard Trim</span>
                  <span>45%</span>
                </div>
                <div className="progress">
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{ width: "45%" }}
                    aria-valuenow="45"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Hair Styling</span>
                  <span>30%</span>
                </div>
                <div className="progress">
                  <div
                    className="progress-bar bg-warning"
                    role="progressbar"
                    style={{ width: "30%" }}
                    aria-valuenow="30"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Hot Towel Shave</span>
                  <span>25%</span>
                </div>
                <div className="progress">
                  <div
                    className="progress-bar bg-info"
                    role="progressbar"
                    style={{ width: "25%" }}
                    aria-valuenow="25"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Color Treatment</span>
                  <span>15%</span>
                </div>
                <div className="progress">
                  <div
                    className="progress-bar bg-danger"
                    role="progressbar"
                    style={{ width: "15%" }}
                    aria-valuenow="15"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col> */}
      </Row>
    </div>
  );
};

export default Dashboard;
