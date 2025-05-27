import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  InputGroup,
  Badge,
} from "react-bootstrap";
import {
  Search,
  Scissors,
  Clock,
  DollarSign,
  Edit,
  Eye,
  Plus,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { useAppointments } from "../../context/appointment_context";

const realApi = () => {};
//

export default function ServiceList() {
  const { getAllServices, appointments, services } = useAppointments();

  return (
    <div className="bg-light min-vh-100 py-3">
      <Container fluid>
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="fw-bold text-dark mb-2">Service Management</h1>
                <p className="lead text-muted">
                  Manage your services, pricing, and performance
                </p>
              </div>
            </div>
          </Col>
        </Row>

        {/* Summary Cards */}
        <Row className="mb-4">
          <Col lg={3} md={6} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Card.Title className="text-muted fs-6 fw-normal mb-1">
                      Total Services
                    </Card.Title>
                    <h4 className="fw-bold mb-0">{services.length}</h4>
                  </div>
                  <div className="text-primary">
                    <Scissors size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Card.Title className="text-muted fs-6 fw-normal mb-1">
                      Average Price
                    </Card.Title>
                    <h4 className="fw-bold mb-0">
                      Rs.
                      {(
                        services.reduce((sum, s) => sum + Number(s.price), 0) /
                        services.length
                      ).toFixed(2)}
                    </h4>
                    <small className="text-muted">Per service</small>
                  </div>
                  <div className="text-success">
                    <DollarSign size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Card.Title className="text-muted fs-6 fw-normal mb-1">
                      Total Service Cost
                    </Card.Title>
                    <h4 className="fw-bold mb-0">
                      {services
                        .reduce((sum, s) => sum + Number(s.price), 0)
                        .toFixed(2)}
                    </h4>
                  </div>
                  <div className="text-success">
                    <TrendingUp size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Card.Title className="text-muted fs-6 fw-normal mb-1">
                      Avg Duration
                    </Card.Title>
                    <h4 className="fw-bold mb-0">
                      {Math.round(
                        services.reduce(
                          (sum, s) => sum + Number(s.duration),
                          0
                        ) / services.length
                      )}{" "}
                      min
                    </h4>
                    <small className="text-muted">Per service</small>
                  </div>
                  <div className="text-info">
                    <Clock size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Search */}

        {/* Services Table */}
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                {/* <Card.Title className="mb-0">
                  All Services ({filteredServices.length})
                </Card.Title> */}
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "80px" }}>ID</th>
                        <th>Service Name</th>
                        <th>Duration</th>
                        <th>Price</th>

                        <th style={{ width: "120px" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services
                        .sort((a, b) => a.id - b.id)
                        .map((service) => {
                          return (
                            <tr key={service.id}>
                              <td className="fw-bold">{service.id}</td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <Scissors size={16} className="text-muted" />
                                  <span className="fw-medium">
                                    {service.name}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <Clock size={16} className="text-muted" />
                                  {service.duration} min
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  Rs. {service.price}
                                </div>
                              </td>
                              <td>
                                <div className="d-flex gap-1">
                                  <Button
                                    variant="outline-success"
                                    size="sm"
                                    title="View Details"
                                  >
                                    <Edit size={14} />
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    title="Edit Service"
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </Table>
                </div>

                {/* {filteredServices.length === 0 && (
                  <div className="text-center py-5">
                    <p className="text-muted mb-0">
                      No services found matching your search criteria.
                    </p>
                  </div>
                )} */}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
