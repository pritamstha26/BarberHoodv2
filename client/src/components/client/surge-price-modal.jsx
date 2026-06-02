import React from "react";
import { Modal, Button, Alert } from "react-bootstrap";
import "./surge-price-modal.css";

const SurgePriceConfirmationModal = ({
  show,
  onConfirm,
  onCancel,
  originalPrice,
  dynamicPrice,
  multiplier,
  utilization,
  restaurantName,
  serviceTitle,
}) => {
  const surge = Math.round((multiplier - 1) * 100);
  const priceDifference = (dynamicPrice - originalPrice).toFixed(2);

  return (
    <Modal show={show} onHide={onCancel} centered className="surge-modal">
      <Modal.Header closeButton className="surge-modal-header">
        <Modal.Title>
          <span className="badge bg-warning me-2">HIGH DEMAND</span>
          Price Confirmation
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="info" className="mb-3">
          <strong>
            Due to high demand at {restaurantName}, prices have been adjusted.
          </strong>
        </Alert>

        <div className="service-info mb-4">
          <h6 className="text-muted">Service</h6>
          <p className="fw-bold text-dark">{serviceTitle}</p>
        </div>

        <div className="price-comparison">
          <div className="price-row original-price">
            <span>Original Price:</span>
            <span className="price">${originalPrice.toFixed(2)}</span>
          </div>
          <div className="price-row surge-price">
            <span>
              Dynamic Price:
              <br />
              <small className="text-muted">({surge}% surge)</small>
            </span>
            <span className="price text-warning fw-bold">
              ${dynamicPrice.toFixed(2)}
            </span>
          </div>
          <div className="price-row price-increase">
            <span>Additional Cost:</span>
            <span className="price text-danger fw-bold">
              +${priceDifference}
            </span>
          </div>
        </div>

        <div className="demand-info mt-4 p-3 bg-light rounded">
          <h6 className="mb-2">Demand Information</h6>
          <div className="demand-stat">
            <span>Current Utilization:</span>
            <span className="fw-bold">
              {(utilization * 100).toFixed(0)}% of capacity
            </span>
          </div>
          <div className="demand-stat">
            <span>Price Multiplier:</span>
            <span className="fw-bold">{multiplier.toFixed(2)}x</span>
          </div>
          <p className="text-muted small mt-2 mb-0">
            When a restaurant is at 60% or higher capacity, dynamic pricing
            kicks in to optimize demand and ensure better service quality.
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-top-0">
        <Button variant="outline-secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="warning" onClick={onConfirm} className="fw-bold">
          Confirm Booking at ${dynamicPrice.toFixed(2)}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SurgePriceConfirmationModal;
