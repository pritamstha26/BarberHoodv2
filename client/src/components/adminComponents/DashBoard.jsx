import { Row, Col, Card } from "react-bootstrap";

import "./admin-panel.css";
import { useEffect, useState } from "react";
const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    console.log("get appointment");
  };

  useEffect(() => {
    getAppointments();
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
                      <th>Barber</th>
                      <th>Service</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {appointments.map((data) => (
                      <tr key={data.id}>
                        <td>
                          {data.clientUser
                            ? `${data.clientUser.first_name} ${data.clientUser.last_name}`
                            : "Client Deleted"}
                        </td>
                        <td>
                          {data.barberUser ? (
                            `${data.barberUser.first_name} ${data.barberUser.last_name}`
                          ) : (
                            <span className="text-danger">
                              {" "}
                              Barber Not Available
                            </span>
                          )}
                        </td>
                        <td>
                          {data.service?.service_type || "Service Deleted"}
                        </td>
                        <td>{new Date(data.date).toLocaleString()}</td>
                        <td>
                          {/* <span className="badge bg-success">
                            {data.service?.status || "N/A"}
                          </span> */}
                          <StatusBadge status={data.service?.status} />
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
