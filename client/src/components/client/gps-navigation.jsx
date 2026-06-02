import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Alert,
  Spinner,
  ListGroup,
  Modal,
} from "react-bootstrap";
import {
  FiMapPin,
  FiNavigation,
  FiArrowRight,
  FiPhone,
  FiClock,
  FiMap,
  FiExternalLink,
  FiAlertCircle,
} from "react-icons/fi";
import { FaMapMarkerAlt, FaRoute, FaCompass } from "react-icons/fa";
import "./gps-navigation.css";

const GPSNavigation = ({ restaurant }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [navigationData, setNavigationData] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [navigationType, setNavigationType] = useState("driving"); // driving, walking, transit
  const [eta, setEta] = useState(null);
  const mapRef = useRef(null);

  // Request user's current location
  const requestUserLocation = () => {
    setLocationLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setUserLocation({ latitude, longitude, accuracy });
        calculateNavigationData(latitude, longitude);
        setLocationLoading(false);
      },
      (error) => {
        setLocationError(getLocationErrorMessage(error.code));
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  // Get error message for geolocation errors
  const getLocationErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 1:
        return "Permission denied. Please enable location access in your browser settings.";
      case 2:
        return "Position unavailable. Please try again.";
      case 3:
        return "Request timeout. Please try again.";
      default:
        return "Unable to get your location.";
    }
  };

  // Calculate ETA and distance
  const calculateNavigationData = (userLat, userLng) => {
    if (!restaurant?.latitude || !restaurant?.longitude) {
      setLocationError("Restaurant location not available");
      return;
    }

    const distance = calculateDistance(
      userLat,
      userLng,
      parseFloat(restaurant.latitude),
      parseFloat(restaurant.longitude),
    );

    // Calculate ETA based on navigation type
    const speeds = {
      driving: 40, // km/h
      walking: 5, // km/h
      transit: 25, // km/h (average)
    };

    const timeMinutes = Math.round((distance / speeds[navigationType]) * 60);
    const timeHours = Math.floor(timeMinutes / 60);
    const timeRemaining = timeMinutes % 60;

    setEta({
      distanceKm: distance.toFixed(2),
      timeMinutes,
      timeHours,
      timeRemaining,
      formattedTime:
        timeHours > 0 ? `${timeHours}h ${timeRemaining}m` : `${timeRemaining}m`,
    });

    setNavigationData({
      userLat,
      userLng,
      restaurantLat: parseFloat(restaurant.latitude),
      restaurantLng: parseFloat(restaurant.longitude),
      distance,
    });
  };

  // Haversine formula for distance calculation
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const toRadians = (degree) => (degree * Math.PI) / 180;
    const R = 6371; // Earth's radius in km

    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  };

  // Open Google Maps navigation
  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${restaurant.latitude},${restaurant.longitude}&travelmode=${navigationType}`;
    window.open(url, "_blank");
  };

  // Open Apple Maps (for iOS)
  const openAppleMaps = () => {
    const url = `maps://maps.apple.com/?daddr=${restaurant.latitude},${restaurant.longitude}&dirflg=d`;
    window.open(url, "_blank");
  };

  // Open Leaflet map
  const openLeafletMap = () => {
    setShowMap(true);
  };

  if (!restaurant) {
    return (
      <Alert variant="warning" className="mb-3">
        <FiAlertCircle className="me-2" />
        Restaurant information not available
      </Alert>
    );
  }

  return (
    <Card className="gps-navigation-card shadow-sm mb-3">
      <Card.Header className="gps-header">
        <div className="d-flex align-items-center gap-2">
          <FiMapPin size={24} className="text-primary" />
          <div>
            <h6 className="mb-0">📍 Navigation</h6>
            <small className="text-muted">{restaurant.location_name}</small>
          </div>
        </div>
      </Card.Header>

      <Card.Body>
        {/* Restaurant Address Info */}
        <div className="restaurant-location-info mb-3 p-3 bg-light rounded">
          <p className="mb-2 fw-bold">
            {restaurant.first_name} {restaurant.last_name}
          </p>
          <p className="mb-1 small text-muted">
            <FiMapPin size={14} className="me-1" />
            {restaurant.location_name}
          </p>
          <p className="mb-0 small text-muted">
            📍 {restaurant.latitude}, {restaurant.longitude}
          </p>
        </div>

        {/* Location Status */}
        {locationError && (
          <Alert variant="danger" className="mb-3">
            <FiAlertCircle className="me-2" />
            {locationError}
          </Alert>
        )}

        {userLocation && (
          <Alert variant="success" className="mb-3">
            ✅ Your location: {userLocation.latitude.toFixed(4)},
            {userLocation.longitude.toFixed(4)}
          </Alert>
        )}

        {/* Get Location Button */}
        {!userLocation && (
          <div className="mb-3">
            <Button
              variant="primary"
              className="w-100"
              onClick={requestUserLocation}
              disabled={locationLoading}
            >
              {locationLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Getting Location...
                </>
              ) : (
                <>
                  <FiNavigation className="me-2" />
                  📍 Enable My Location
                </>
              )}
            </Button>
          </div>
        )}

        {/* Navigation Options */}
        {userLocation && eta && (
          <>
            {/* ETA Card */}
            <div className="eta-card mb-3 p-3 border rounded bg-gradient">
              <Row className="align-items-center">
                <Col xs={6}>
                  <div className="eta-item">
                    <FiMap size={20} className="text-primary mb-2" />
                    <p className="small text-muted mb-1">Distance</p>
                    <h5 className="mb-0 text-primary fw-bold">
                      {eta.distanceKm} km
                    </h5>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="eta-item text-end">
                    <FaClock size={20} className="text-success mb-2" />
                    <p className="small text-muted mb-1">Estimated Time</p>
                    <h5 className="mb-0 text-success fw-bold">
                      {eta.formattedTime}
                    </h5>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Navigation Type Selection */}
            <div className="navigation-type-selector mb-3">
              <label className="form-label small text-muted fw-bold mb-2">
                Travel Mode
              </label>
              <div className="btn-group w-100" role="group">
                <input
                  type="radio"
                  className="btn-check"
                  name="navType"
                  id="driving"
                  value="driving"
                  checked={navigationType === "driving"}
                  onChange={(e) => {
                    setNavigationType(e.target.value);
                    if (userLocation) {
                      calculateNavigationData(
                        userLocation.latitude,
                        userLocation.longitude,
                      );
                    }
                  }}
                />
                <label
                  className="btn btn-outline-primary btn-sm"
                  htmlFor="driving"
                >
                  🚗 Driving
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="navType"
                  id="walking"
                  value="walking"
                  checked={navigationType === "walking"}
                  onChange={(e) => {
                    setNavigationType(e.target.value);
                    if (userLocation) {
                      calculateNavigationData(
                        userLocation.latitude,
                        userLocation.longitude,
                      );
                    }
                  }}
                />
                <label
                  className="btn btn-outline-primary btn-sm"
                  htmlFor="walking"
                >
                  🚶 Walking
                </label>

                <input
                  type="radio"
                  className="btn-check"
                  name="navType"
                  id="transit"
                  value="transit"
                  checked={navigationType === "transit"}
                  onChange={(e) => {
                    setNavigationType(e.target.value);
                    if (userLocation) {
                      calculateNavigationData(
                        userLocation.latitude,
                        userLocation.longitude,
                      );
                    }
                  }}
                />
                <label
                  className="btn btn-outline-primary btn-sm"
                  htmlFor="transit"
                >
                  🚌 Transit
                </label>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="navigation-buttons">
              <Row className="g-2">
                <Col xs={6}>
                  <Button
                    variant="primary"
                    className="w-100"
                    onClick={openGoogleMaps}
                    size="sm"
                  >
                    <FiExternalLink className="me-1" />
                    Google Maps
                  </Button>
                </Col>
                <Col xs={6}>
                  <Button
                    variant="info"
                    className="w-100"
                    onClick={openLeafletMap}
                    size="sm"
                  >
                    <FaRoute className="me-1" />
                    View Map
                  </Button>
                </Col>
              </Row>

              {/* Apple Maps for iOS */}
              {/iPhone|iPad|iPod/.test(navigator.userAgent) && (
                <Button
                  variant="light"
                  className="w-100 mt-2"
                  onClick={openAppleMaps}
                  size="sm"
                >
                  🍎 Apple Maps
                </Button>
              )}
            </div>

            {/* Contact Info */}
            {restaurant.phone_number && (
              <div className="contact-info mt-3 p-2 bg-light rounded">
                <a
                  href={`tel:${restaurant.phone_number}`}
                  className="text-decoration-none d-flex align-items-center gap-2 text-primary"
                >
                  <FiPhone size={16} />
                  <span>{restaurant.phone_number}</span>
                </a>
              </div>
            )}
          </>
        )}
      </Card.Body>

      {/* Map Modal */}
      {showMap && userLocation && (
        <GPSMapModal
          show={showMap}
          onHide={() => setShowMap(false)}
          userLat={userLocation.latitude}
          userLng={userLocation.longitude}
          restaurantLat={parseFloat(restaurant.latitude)}
          restaurantLng={parseFloat(restaurant.longitude)}
          restaurantName={`${restaurant.first_name} ${restaurant.last_name}`}
        />
      )}
    </Card>
  );
};

// Map Modal Component using Leaflet
const GPSMapModal = ({
  show,
  onHide,
  userLat,
  userLng,
  restaurantLat,
  restaurantLng,
  restaurantName,
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!show || !mapContainer.current) return;

    // Dynamically load Leaflet
    if (!window.L) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      script.onload = initializeMap;
      document.body.appendChild(script);
    } else {
      initializeMap();
    }

    function initializeMap() {
      if (map.current) {
        map.current.remove();
      }

      map.current = window.L.map(mapContainer.current).setView(
        [userLat, userLng],
        14,
      );

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map.current);

      // Add user marker
      const userMarker = window.L.marker([userLat, userLng], {
        icon: window.L.icon({
          iconUrl:
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
          iconSize: [25, 41],
          popupAnchor: [1, -34],
        }),
      })
        .addTo(map.current)
        .bindPopup("📍 Your Location");

      // Add restaurant marker
      const restaurantMarker = window.L.marker([restaurantLat, restaurantLng], {
        icon: window.L.icon({
          iconUrl:
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
          iconSize: [25, 41],
          popupAnchor: [1, -34],
        }),
      })
        .addTo(map.current)
        .bindPopup(`🍽️ ${restaurantName}`);

      // Draw line between points
      const line = window.L.polyline(
        [
          [userLat, userLng],
          [restaurantLat, restaurantLng],
        ],
        {
          color: "blue",
          weight: 2,
          opacity: 0.7,
          dashArray: "5, 5",
        },
      ).addTo(map.current);

      // Fit bounds
      const bounds = window.L.latLngBounds([
        [userLat, userLng],
        [restaurantLat, restaurantLng],
      ]);
      map.current.fitBounds(bounds, { padding: [50, 50] });

      markersRef.current = [userMarker, restaurantMarker];
    }

    return () => {
      // Cleanup on unmount
    };
  }, [show, userLat, userLng, restaurantLat, restaurantLng]);

  return (
    <Modal show={show} onHide={onHide} fullscreen>
      <Modal.Header closeButton>
        <Modal.Title>📍 Navigation Map</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <div
          ref={mapContainer}
          style={{ width: "100%", height: "calc(100vh - 100px)" }}
        />
      </Modal.Body>
    </Modal>
  );
};

export default GPSNavigation;
