import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Spinner,
  ListGroup,
  Badge,
} from "react-bootstrap";
import {
  FaLocationArrow,
  FaMapMarkerAlt,
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";
import api from "../../apis/api";
import BarberProfile from "./barber-profile";

const NearbyRestaurants = () => {
  const [restaurateurs, setRestaurateurs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(5);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [manualLocation, setManualLocation] = useState({
    latitude: "",
    longitude: "",
  });
  const [locationMethod, setLocationMethod] = useState("auto");
  const [saveLocation, setSaveLocation] = useState(true);
  // savedLocations intentionally not used yet
  const [selectedRestaurateur, setSelectedRestaurateur] = useState(null);
  const [showRestaurateurProfile, setShowRestaurateurProfile] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    lastRequest: null,
    lastResponse: null,
  });

  // Load user's location and saved locations on component mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Check if the browser supports geolocation
    if (navigator.geolocation) {
      setLocationEnabled(true);
    }

    // Load user's location from the backend
    fetchUserLocation();
  }, []);

  // Fetch user's saved location from the backend
  const fetchUserLocation = async () => {
    try {
      const token = sessionStorage.getItem("access_token");
      if (!token) return; // don't call backend when not authenticated

      const response = await api.get("/location/current");
      if (response.status === 200 && response.data.success) {
        const { latitude, longitude, location_name } = response.data.data;

        // Only set if both lat and long are available
        if (latitude && longitude) {
          setUserLocation({
            latitude,
            longitude,
            location_name,
          });

          setManualLocation({
            latitude,
            longitude,
          });
          // Automatically find nearest restaurant using saved location
          fetchNearestRestaurant(latitude, longitude);
        } else {
          // If user has no saved location, try to get current browser location
          console.log(
            "No saved location found, attempting to get browser location",
          );
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ latitude, longitude });
                setManualLocation({ latitude, longitude });
                fetchNearestRestaurant(latitude, longitude);
              },
              (error) => {
                console.error("Error getting browser location:", error);
                setError(
                  "Please enable location access to find the nearest restaurant.",
                );
              },
            );
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user location:", error);
      setError("Unable to load your location. Please try again.");
    }
  };

  // Handle automatic location detection
  const handleGetCurrentLocation = () => {
    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setManualLocation({ latitude, longitude });
        setLoading(false);

        // If save location is checked, save to backend
        if (saveLocation) {
          saveUserLocation(latitude, longitude);
        }

        // Automatically search for restaurateur when location is detected
        fetchNearbyRestaurateurs(latitude, longitude, searchRadius);
      },
      (error) => {
        setLoading(false);
        let errorMessage = "Error detecting your location. ";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "You denied the request for location.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage += "The request to get your location timed out.";
            break;
          default:
            errorMessage += "An unknown error occurred.";
        }

        setError(errorMessage);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  // Save user's location to the backend
  const saveUserLocation = async (latitude, longitude, location_name = "") => {
    try {
      await api.put("/location/update", {
        latitude,
        longitude,
        location_name,
      });
    } catch (error) {
      console.error("Error saving location:", error);
      // Non-blocking error
    }
  };

  // Handle manual location input
  const handleManualLocationChange = (e) => {
    const { name, value } = e.target;
    setManualLocation({
      ...manualLocation,
      [name]: value,
    });
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setError(null);

    // Validate coordinates
    const latitude = parseFloat(manualLocation.latitude);
    const longitude = parseFloat(manualLocation.longitude);

    if (isNaN(latitude) || isNaN(longitude)) {
      setError("Please enter valid latitude and longitude coordinates.");
      return;
    }

    // Update user location
    setUserLocation({ latitude, longitude });

    // Save location if checkbox is checked
    if (saveLocation) {
      saveUserLocation(latitude, longitude);
    }

    // Fetch nearby restaurateurs
    fetchNearbyRestaurateurs(latitude, longitude, searchRadius);
  };

  // Fetch the nearest restaurant automatically
  const fetchNearestRestaurant = async (latitude, longitude) => {
    setLoading(true);
    setError(null);

    try {
      // Search with a large radius to get all restaurants, then take the nearest one
      const params = {
        latitude,
        longitude,
        maxDistance: 100, // Large radius to get all restaurants
      };

      console.log("🔍 Finding nearest restaurant with params:", params);

      const response = await api.get("/location/nearby-restaurateurs", {
        params,
      });

      console.log("✅ API Response:", response.data);

      // Save debug info
      setDebugInfo({ lastRequest: params, lastResponse: response.data });

      if (response.status === 200) {
        const raw = response.data.data || [];
        console.log("📍 Raw data from API:", raw);

        if (raw.length === 0) {
          setError("No restaurants found in your area.");
          setRestaurateurs([]);
        } else {
          // Normalize entries to have a consistent shape for the UI
          const data = raw.map((item) => {
            // If Sequelize-like instance with dataValues
            const base = item.dataValues || item;
            return {
              id: base.id || base.user_id || base.restaurateur_id,
              first_name: base.first_name || base.name || base.username || "",
              last_name: base.last_name || "",
              phone_number:
                base.phone_number || base.phone || base.contact || "",
              email: base.email || base.contact_email || "",
              location_name:
                base.location_name || base.location || base.address || "",
              distance: base.distance || base.dist || 0,
              raw: base,
              dataValues: base,
            };
          });

          // Sort by distance and show all (closest first)
          data.sort((a, b) => a.distance - b.distance);

          console.log("🎯 Restaurants sorted by distance:", data);
          setRestaurateurs(data);

          if (data.length > 0) {
            const nearest = data[0];
            console.log(
              `✨ Nearest restaurant: ${nearest.first_name} at ${nearest.distance} km`,
            );
          }
        }
      }
    } catch (error) {
      console.error("❌ Error finding nearest restaurant:", error);
      const serverMessage =
        error.response?.data?.message || error.response?.data || null;
      setDebugInfo({
        lastRequest: { latitude, longitude },
        lastResponse: error.response?.data || error.message,
      });
      setError(
        serverMessage
          ? `Failed to find restaurants: ${JSON.stringify(serverMessage)}`
          : `Failed to find restaurants: ${error.message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch nearby restaurateurs from the API (kept for manual search if needed later)
  const fetchNearbyRestaurateurs = async (latitude, longitude, maxDistance) => {
    setLoading(true);
    setError(null);

    try {
      // Send multiple param names for compatibility with different backend implementations
      const params = {
        latitude,
        longitude,
        maxDistance,
        radius: maxDistance,
        max_distance: maxDistance,
      };

      console.log("🔍 Fetching nearby restaurateurs with params:", params);

      const response = await api.get("/location/nearby-restaurateurs", {
        params,
      });

      console.log("✅ API Response:", response.data);

      // Save debug info
      setDebugInfo({ lastRequest: params, lastResponse: response.data });

      if (response.status === 200) {
        const raw = response.data.data || [];
        console.log("📍 Raw data from API:", raw);
        // Normalize entries to have a consistent shape for the UI
        const data = raw.map((item) => {
          // If Sequelize-like instance with dataValues
          const base = item.dataValues || item;
          return {
            id: base.id || base.user_id || base.restaurateur_id,
            first_name: base.first_name || base.name || base.username || "",
            last_name: base.last_name || "",
            phone_number: base.phone_number || base.phone || base.contact || "",
            email: base.email || base.contact_email || "",
            location_name:
              base.location_name || base.location || base.address || "",
            distance: base.distance || base.dist || 0,
            raw: base,
            dataValues: base,
          };
        });
        console.log("🎯 Normalized data:", data);
        setRestaurateurs(data);

        if (data.length === 0) {
          setError(
            `No restaurateurs found within ${maxDistance} km of your location. Try increasing the search radius.`,
          );
        }
      }
    } catch (error) {
      console.error("❌ Error fetching nearby restaurateurs:", error);
      const serverMessage =
        error.response?.data?.message || error.response?.data || null;
      setDebugInfo({
        lastRequest: params,
        lastResponse: error.response?.data || error.message,
      });
      setError(
        serverMessage
          ? `Failed to fetch nearby restaurateurs: ${JSON.stringify(serverMessage)}`
          : `Failed to fetch nearby restaurateurs: ${error.message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  // Get distance text in a user-friendly format
  const getDistanceText = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    } else {
      return `${distance.toFixed(1)} km`;
    }
  };

  const showDebug =
    (typeof window !== "undefined" &&
      window.location &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1")) ||
    process.env.NODE_ENV !== "production";

  return (
    <Container fluid className="p-4">
      <div className="mb-4">
        <h1 className="display-5 fw-bold text-dark mb-2">
          Find Nearby Restaurant
        </h1>
        <p className="text-muted">
          Discover restaurant close to your location and book your appointment
        </p>
      </div>

      {/* Location Info Card */}
      {userLocation && (
        <Card className="mb-4 shadow-sm border-0">
          <Card.Header className="bg-info text-white">
            <h5 className="mb-0">📍 Your Location</h5>
          </Card.Header>
          <Card.Body>
            <Alert variant="info" className="d-flex align-items-center mb-0">
              <FaMapMarkerAlt className="me-2" />
              <div>
                <strong>Searching for nearby restaurants near:</strong> <br />
                {userLocation.location_name
                  ? `${userLocation.location_name} (${Number(userLocation.latitude).toFixed(6)}, ${Number(userLocation.longitude).toFixed(6)})`
                  : `${Number(userLocation.latitude).toFixed(6)}, ${Number(userLocation.longitude).toFixed(6)}`}
              </div>
            </Alert>
          </Card.Body>
        </Card>
      )}

      {error && !userLocation && <Alert variant="danger">{error}</Alert>}

      {/* Restaurateurs list */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" variant="primary" />
          <p className="mt-2">Searching for nearby restaurateurs...</p>
        </div>
      ) : restaurateurs.length > 0 ? (
        <Row>
          <Col md={12}>
            <h3 className="mb-3">
              Found {restaurateurs.length} restaurateur
              {restaurateurs.length !== 1 ? "s" : ""} nearby
            </h3>
          </Col>
          {restaurateurs.map((restaurateur) => (
            <Col md={4} key={restaurateur.id} className="mb-4">
              <Card className="h-100 shadow-sm border-0 hover-card">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                      <FaUser className="text-primary fs-4" />
                    </div>
                    <div>
                      <h5 className="mb-0">{`${restaurateur.first_name || restaurateur.dataValues?.first_name || ""} ${restaurateur.last_name || restaurateur.dataValues?.last_name || ""}`}</h5>
                      <Badge bg="info" className="mt-1">
                        <FaMapMarkerAlt className="me-1" />
                        {getDistanceText(
                          restaurateur.distance ||
                            restaurateur.dataValues?.distance ||
                            0,
                        )}{" "}
                        away
                      </Badge>
                      {(restaurateur.location_name ||
                        restaurateur.dataValues?.location_name) && (
                        <div className="text-muted small mt-1">
                          {restaurateur.location_name ||
                            restaurateur.dataValues?.location_name}
                        </div>
                      )}
                    </div>
                  </div>

                  <ListGroup variant="flush" className="mb-3">
                    {(restaurateur.phone_number ||
                      restaurateur.dataValues?.phone_number) && (
                      <ListGroup.Item className="d-flex align-items-center px-0 py-2 border-0">
                        <FaPhoneAlt className="text-muted me-2" />
                        <span>
                          {restaurateur.phone_number ||
                            restaurateur.dataValues?.phone_number}
                        </span>
                      </ListGroup.Item>
                    )}
                    {(restaurateur.email || restaurateur.dataValues?.email) && (
                      <ListGroup.Item className="d-flex align-items-center px-0 py-2 border-0">
                        <FaEnvelope className="text-muted me-2" />
                        <span>
                          {restaurateur.email || restaurateur.dataValues?.email}
                        </span>
                      </ListGroup.Item>
                    )}
                  </ListGroup>

                  <div className="d-grid gap-2">
                    <Button
                      variant="outline-primary"
                      onClick={() => {
                        const id =
                          restaurateur.id || restaurateur.dataValues?.id;
                        setSelectedRestaurateur(id);
                        sessionStorage.setItem("selected_restaurateur_id", id);
                        setShowRestaurateurProfile(true);
                      }}
                    >
                      View Profile
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => {
                        const id =
                          restaurateur.id || restaurateur.dataValues?.id;
                        setSelectedRestaurateur(id);
                        sessionStorage.setItem("selected_restaurateur_id", id);
                        setShowRestaurateurProfile(true);
                      }}
                    >
                      Book Appointment
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : userLocation ? (
        <Alert variant="light" className="text-center p-5 shadow-sm border-0">
          <FaMapMarkerAlt className="mb-3" style={{ fontSize: "2rem" }} />
          <h4>No restaurants found</h4>
          <p className="text-muted">
            Try increasing your search radius or trying a different location.
          </p>
        </Alert>
      ) : (
        <Alert variant="info" className="text-center p-5 shadow-sm border-0">
          <FaLocationArrow className="mb-3" style={{ fontSize: "2rem" }} />
          <h4>Get Started</h4>
          <p className="text-muted mb-3">
            Enable location access or enter coordinates above to find nearby
            restaurants.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={handleGetCurrentLocation}
            disabled={!locationEnabled || loading}
          >
            Use My Current Location
          </Button>
        </Alert>
      )}

      {/* Restaurateur Profile Modal */}
      {showRestaurateurProfile && selectedRestaurateur && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-white"
          style={{ zIndex: 1050, overflowY: "auto" }}
        >
          <div className="d-flex justify-content-between p-3 border-bottom">
            <h4>Restaurant Profile</h4>
            <Button
              variant="outline-secondary"
              onClick={() => setShowRestaurateurProfile(false)}
            >
              Back to Search
            </Button>
          </div>
          <BarberProfile barberId={selectedRestaurateur} />
        </div>
      )}

      {/* Debug panel (visible when running locally) */}
      {showDebug && (
        <Card className="mt-4 shadow-sm border-0">
          <Card.Header className="bg-secondary text-white">
            <h6 className="mb-0">Debug: Nearby Restaurateurs API</h6>
          </Card.Header>
          <Card.Body>
            <div style={{ maxHeight: 300, overflow: "auto" }}>
              <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default NearbyRestaurants;
