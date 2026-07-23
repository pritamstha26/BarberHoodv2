import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import { Plus } from "lucide-react";

export default function ServicesTab({ services, onAdd, onEdit }) {
  return (
    <Card className="matte-card">
      <Card.Header className="matte-card-header">
        <h5 className="m-0 fw-bold header-title">Catalog Pricing Tiers</h5>
        <button type="button" className="btn-add-service" onClick={onAdd}>
          <Plus size={15} className="me-1" /> Provision Service
        </button>
      </Card.Header>
      <Card.Body className="p-4">
        <Row className="g-4">
          {services.map((service) => (
            <Col md={4} key={service.id}>
              <Card className="premium-service-card">
                <Card.Body className="d-flex flex-column justify-content-between h-100 p-4">
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="service-title-text m-0">{service.name}</h6>
                      <span className="service-price-tag">Rs. {service.price}</span>
                    </div>
                    <p className="service-duration-text mb-4">Allocation Window: {service.duration} mins</p>
                  </div>
                  <button type="button" className="btn-edit-service-trigger w-100" onClick={() => onEdit(service)}>Modify Config</button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Card.Body>
    </Card>
  );
}
