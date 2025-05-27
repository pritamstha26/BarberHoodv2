import { useNavigate, useLocation } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
//
export default function NotFoundPage({ isAuthenticated }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoBack = () => {
    // If user is not logged in, redirect to login page
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: location.pathname, // Save current location to return after login
          message: "Please log in to continue",
        },
        replace: true,
      });
      return;
    }

    // For logged-in users, proceed with normal back navigation
    if (location.key !== "default") {
      navigate(-1); // Go back in history
    } else {
      // navigate("/dashboard"); // Fallback for logged-in users
      navigate("/login"); // for demo only --------
    }
  };

  // Usage example:
  // <SmartBackButton isAuthenticated={userLoggedIn} />
  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <Row className="text-center">
        <Col>
          <h1 className="mt-3">404 - Page Not Found</h1>
          <p className="lead text-muted mb-4">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button variant="primary" size="lg" onClick={handleGoBack}>
            Go to Homepage
          </Button>
        </Col>
      </Row>
    </Container>
  );
}
