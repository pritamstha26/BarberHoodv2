import React, { useState } from "react";
import { Card, Nav, Container, Row, Col } from "react-bootstrap";
import Logo from "../Logo";
import { useNavigate, useLocation } from "react-router-dom";

//

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeKey, setActiveKey] = useState(getInitialActiveKey());

  // Set initial active key based on current route
  function getInitialActiveKey() {
    if (location.pathname.includes("/admin")) return "#admin";
    if (location.pathname.includes("/barber")) return "#barber";

    return "#client"; // default
  }

  const handleSelect = (selectedKey) => {
    setActiveKey(selectedKey);

    // Navigate to appropriate route based on selection
    switch (selectedKey) {
      case "#admin":
        navigate("/login/admin");
        break;
      case "#barber":
        navigate("/login/barber");
        break;
      case "#client":
        navigate("/login/client");
        break;
      default:
        navigate("/login/client");
    }
  };
  return (
    <Card.Header className="p-3  bg-light">
      <Container>
        <Row className="">
          <Col xs={12} md={6} lg={12} className="mb-3 ">
            <div className="d-flex justify-content-center  ">
              <Logo />
            </div>
          </Col>
          {/* Navigation Column */}
          <Col lg={12} md={6}>
            <Nav
              variant="pills"
              activeKey={activeKey}
              className="justify-content-center "
              onSelect={handleSelect}
            >
              <Nav.Item>
                <Nav.Link eventKey="#client" className=" text-center">
                  Client
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="#admin" className=" text-center">
                  Admin
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="#barber" className=" text-center">
                  Barber
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
        </Row>
      </Container>
    </Card.Header>
  );
}
