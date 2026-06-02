import React, { useState } from "react";
import { Modal, Table, Alert, Row, Col } from "react-bootstrap";
import { FiInfo } from "react-icons/fi";
import "./pricing-breakdown.css";

export default function PricingBreakdownModal({
  show,
  onHide,
  service,
  demandInfo,
  originalPrice,
  dynamicPrice,
}) {
  if (!service) return null;

  const surgeAmount = Math.round(dynamicPrice - originalPrice);
  const surgePercent = ((surgeAmount / originalPrice) * 100).toFixed(0);
  const utilization = demandInfo?.utilization || 0;
  const multiplier = demandInfo?.multiplier || 1;

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="pricing-modal-header">
        <Modal.Title className="d-flex align-items-center gap-2">
          <FiInfo size={24} />
          💰 Pricing Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pricing-modal-body">
        <h6 className="mb-3 text-primary fw-bold">{service.name}</h6>

        {/* Pricing Breakdown Table */}
        <Table className="pricing-table mb-3" bordered>
          <tbody>
            <tr>
              <td className="label-cell">
                <strong>Base Price:</strong>
              </td>
              <td className="value-cell">
                <strong>Rs{originalPrice}</strong>
              </td>
            </tr>

            {multiplier > 1 && (
              <>
                <tr className="demand-row">
                  <td className="label-cell">
                    <strong>Restaurant Utilization:</strong>
                  </td>
                  <td className="value-cell">
                    <span className="utilization-badge">
                      {(utilization * 100).toFixed(0)}% capacity
                    </span>
                  </td>
                </tr>

                <tr className="surge-row">
                  <td className="label-cell">
                    <strong>Surge Multiplier:</strong>
                  </td>
                  <td className="value-cell text-warning">
                    <span className="multiplier-badge">
                      ×{multiplier.toFixed(2)}
                    </span>
                  </td>
                </tr>

                <tr className="surge-amount-row">
                  <td className="label-cell">
                    <strong>Surge Charge:</strong>
                  </td>
                  <td className="value-cell text-warning">
                    <strong>
                      +₹{surgeAmount} ({surgePercent}%)
                    </strong>
                  </td>
                </tr>

                <tr className="total-row">
                  <td className="label-cell">
                    <strong className="text-success">Total Amount:</strong>
                  </td>
                  <td className="value-cell">
                    <strong className="text-success fs-5">
                      ₹{dynamicPrice.toFixed(0)}
                    </strong>
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </Table>

        {/* Demand Visualization */}
        {multiplier > 1 && (
          <div className="demand-visualization mb-3">
            <Row className="align-items-center">
              <Col xs={8}>
                <small className="text-muted d-block mb-2">
                  Current Demand Level
                </small>
                <div className="progress" style={{ height: "24px" }}>
                  <div
                    className="progress-bar bg-warning"
                    style={{
                      width: `${Math.min(utilization * 100, 100)}%`,
                    }}
                    role="progressbar"
                  >
                    <small className="text-dark fw-bold">
                      {(utilization * 100).toFixed(0)}%
                    </small>
                  </div>
                </div>
              </Col>
              <Col xs={4} className="text-end">
                <div className="capacity-labels">
                  <small className="d-block text-muted">Normal</small>
                  <small className="d-block text-danger fw-bold">
                    {utilization >= 0.8 ? "🔴 Full" : "🟡 High"}
                  </small>
                </div>
              </Col>
            </Row>
          </div>
        )}

        {/* Explanation Cards */}
        <div className="explanation-section">
          <h6 className="mb-2 text-secondary">
            <strong>Why is the price changing?</strong>
          </h6>

          {multiplier > 1 ? (
            <>
              <Alert variant="warning" className="small mb-2">
                <strong>📈 High Demand:</strong> This restaurant is at{" "}
                {(utilization * 100).toFixed(0)}% capacity. Prices increase
                automatically to manage demand.
              </Alert>

              <div className="pricing-factors">
                <div className="factor-item">
                  <span className="factor-icon">📊</span>
                  <div>
                    <strong>Surge Pricing Activated</strong>
                    <p className="small text-muted mb-0">
                      Restaurant exceeds 60% capacity threshold
                    </p>
                  </div>
                </div>

                <div className="factor-item">
                  <span className="factor-icon">⏰</span>
                  <div>
                    <strong>Peak Hour Premium</strong>
                    <p className="small text-muted mb-0">
                      {multiplier.toFixed(2)}x multiplier applies to all
                      services
                    </p>
                  </div>
                </div>

                <div className="factor-item">
                  <span className="factor-icon">💡</span>
                  <div>
                    <strong>Dynamic Equilibrium</strong>
                    <p className="small text-muted mb-0">
                      Higher prices help balance customer demand
                    </p>
                  </div>
                </div>
              </div>

              <Alert variant="info" className="small mt-3 mb-0">
                <strong>💡 Tip:</strong> Try booking at a different time for
                lower prices, or accept the surge price for guaranteed
                availability.
              </Alert>
            </>
          ) : (
            <Alert variant="success" className="small">
              ✅ <strong>No surge pricing:</strong> Restaurant is operating
              normally. You're getting the regular price!
            </Alert>
          )}
        </div>

        {/* Service Info */}
        <div className="service-info mt-3 p-2 bg-light rounded">
          <small className="text-muted">
            <strong>Service Duration:</strong> {service.duration} minutes
          </small>
        </div>
      </Modal.Body>
    </Modal>
  );
}
