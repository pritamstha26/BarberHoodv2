import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
  Badge,
} from "react-bootstrap";
import {
  FaLocationArrow,
  FaMapMarkerAlt,
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import api from "../../apis/api";
import { reverseGeocode } from "../../utils/geocode";
import { useNavigate } from "react-router-dom";
import RestaurantProfile from "./restaurant-profile";

const RecenterMap = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);

  return null;
};

const NearbyRestaurants = () => {
  const navigate = useNavigate();
  const [restaurateurs, setRestaurateurs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(5);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [selectedRestaurateur, setSelectedRestaurateur] = useState(null);
  const [showRestaurateurProfile, setShowRestaurateurProfile] = useState(false);

  const getRestaurantPoint = (restaurateur) => {
    const latitude = Number(
      restaurateur.latitude || restaurateur.dataValues?.latitude,
    );
    const longitude = Number(
      restaurateur.longitude || restaurateur.dataValues?.longitude,
    );

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
    return [latitude, longitude];
  };

  const userMapCenter = userLocation
    ? [Number(userLocation.latitude), Number(userLocation.longitude)]
    : null;

  const mapCenter =
    userMapCenter ||
    restaurateurs.map(getRestaurantPoint).find(Boolean) || [27.7172, 85.324];

  useEffect(() => {
    if (navigator.geolocation) {
      setLocationEnabled(true);
    }
  }, []);

  // Load user's saved location from the backend on mount (silent)
  useEffect(() => {
    fetchUserLocation();
  }, []);

  const fetchUserLocation = async () => {
    try {
      const token = sessionStorage.getItem("access_token");
      if (!token) return;

      const response = await api.get("/location/current");
      if (response.status === 200 && response.data.success) {
        const { latitude, longitude, location_name } = response.data.data;

        if (latitude && longitude) {
          setUserLocation({ latitude, longitude, location_name });
          fetchNearbyRestaurateurs(latitude, longitude, searchRadius);
        } else if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setUserLocation({ latitude, longitude });
              fetchNearbyRestaurateurs(latitude, longitude, searchRadius);
            },
            () => {
              setError(
                "Location access was blocked or unavailable. Showing all available restaurants.",
              );
              fetchNearbyRestaurateurs(null, null, searchRadius);
            },
          );
        } else {
          setError(
            "Location access is unavailable in this browser. Showing all available restaurants.",
          );
          fetchNearbyRestaurateurs(null, null, searchRadius);
        }
      }
    } catch (err) {
      console.error("Error fetching user location:", err);
    }
  };

  const handleGetCurrentLocation = () => {
    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const location_name =
          (await reverseGeocode(latitude, longitude)) || "";

        setUserLocation({ latitude, longitude, location_name });

        const token = sessionStorage.getItem("access_token");
        if (token) {
          api.put(
            "/location/update",
            { latitude, longitude, location_name },
            { headers: { Authorization: `Bearer ${token}` } },
          ).catch(() => {});
        }

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

  const fetchNearbyRestaurateurs = async (latitude, longitude, maxDistance) => {
    setLoading(true);
    setError(null);

    try {
      const params = {};
      if (latitude && longitude) {
        params.latitude = latitude;
        params.longitude = longitude;
        params.maxDistance = maxDistance;
        params.radius = maxDistance;
        params.max_distance = maxDistance;
      }

      const response = await api.get("/location/nearby-restaurateurs", {
        params,
      });

      if (response.status === 200) {
        const raw = response.data.data || [];
        const data = raw.map((item) => {
          const base = item.dataValues || item;
          return {
            id: base.id || base.user_id || base.restaurateur_id,
            first_name: base.first_name || base.name || base.username || "",
            last_name: base.last_name || "",
            phone_number: base.phone_number || base.phone || base.contact || "",
            email: base.email || base.contact_email || "",
            location_name:
              base.location_name || base.location || base.address || "",
            latitude: base.latitude,
            longitude: base.longitude,
            distance: base.distance || base.dist || null,
            raw: base,
            dataValues: base,
          };
        });

        setRestaurateurs(data);

        if (data.length === 0) {
          setError(
            `No restaurants found. Try adjusting filters or enabling location access.`,
          );
        }
      }
    } catch (error) {
      console.error("Error fetching nearby restaurateurs:", error);
      const serverMessage =
        error.response?.data?.message || error.response?.data || null;
      setError(
        serverMessage
          ? `Failed to fetch nearby restaurateurs: ${JSON.stringify(serverMessage)}`
          : `Failed to fetch nearby restaurateurs: ${error.message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const getDistanceText = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    } else {
      return `${distance.toFixed(1)} km`;
    }
  };

  return (
    <Container fluid className="p-4">
      <div className="mb-4">
        <h1 className="display-5 fw-bold text-dark mb-2">
          Find Nearby Restaurant
        </h1>
        <p className="text-muted">
          Discover restaurants close to your location and book your appointment
        </p>
      </div>

      <Card className="mb-4 shadow-sm border-0">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <label className="fw-semibold" style={{ fontSize: "0.85rem" }}>
                Search radius
              </label>
              <select
                value={searchRadius}
                onChange={(event) => setSearchRadius(Number(event.target.value))}
                className="form-select"
              >
                <option value={2}>2 km</option>
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
              </select>
            </Col>
            <Col md={8}>
              <Button
                variant="primary"
                onClick={handleGetCurrentLocation}
                disabled={!locationEnabled || loading}
                className="px-4"
              >
                <FaLocationArrow className="me-2" />
                Use Current Location
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

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

      <Card className="mb-4 shadow-sm border-0 overflow-hidden">
        <div style={{ height: 360 }}>
          <MapContainer
            center={mapCenter}
            zoom={userLocation ? 13 : 12}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
          >
            <RecenterMap center={mapCenter} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {userMapCenter ? (
              <CircleMarker
                center={userMapCenter}
                radius={10}
                pathOptions={{
                  color: "#0d6efd",
                  fillColor: "#0d6efd",
                  fillOpacity: 0.85,
                }}
              >
                <Popup>Your location</Popup>
              </CircleMarker>
            ) : null}
            {restaurateurs.map((restaurateur) => {
              const point = getRestaurantPoint(restaurateur);
              if (!point) return null;

              const name = `${restaurateur.first_name || ""} ${
                restaurateur.last_name || ""
              }`.trim();

              return (
                <CircleMarker
                  key={restaurateur.id}
                  center={point}
                  radius={9}
                  pathOptions={{
                    color: "#198754",
                    fillColor: "#20c997",
                    fillOpacity: 0.9,
                  }}
                >
                  <Popup>
                    <strong>{name || "Restaurant"}</strong>
                    <br />
                    {getDistanceText(restaurateur.distance || 0)} away
                    <br />
                    <Button
                      size="sm"
                      className="mt-2"
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
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>
      </Card>

      {error && !userLocation && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" variant="dark" size="sm" />
          <p className="mt-3 text-muted small font-monospace">SCANNING AREA NETWORKS...</p>
        </div>
      ) : restaurateurs.length > 0 ? (
        <div className="v-block-card mt-4">
          <div className="v-block-header">
            <h2 className="v-block-heading">
              Discovered Nodes ({restaurateurs.length} active)
            </h2>
          </div>

          <div className="v-block-body p-3">
            <Row className="g-3">
              {restaurateurs.map((restaurateur) => {
                const id = restaurateur.id || restaurateur.dataValues?.id;
                const firstName =
                  restaurateur.first_name || restaurateur.dataValues?.first_name || "";
                const lastName =
                  restaurateur.last_name || restaurateur.dataValues?.last_name || "";
                const fullName = `${firstName} ${lastName}`.trim();

                const distance =
                  restaurateur.distance || restaurateur.dataValues?.distance || 0;
                const locationName =
                  restaurateur.location_name || restaurateur.dataValues?.location_name;
                const phoneNumber =
                  restaurateur.phone_number || restaurateur.dataValues?.phone_number;
                const email = restaurateur.email || restaurateur.dataValues?.email;

                return (
                  <Col md={4} key={restaurateur.id}>
                    <div className="v-metric-card d-flex flex-column h-100 justify-content-between border rounded-3 p-3 shadow-sm bg-white">
                      <div>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h4 className="v-cell-main m-0" style={{ fontSize: "1rem" }}>
                            {fullName || "system-unassigned"}
                          </h4>
                          <span className="v-pill v-status-success font-monospace" style={{ fontSize: "0.75rem" }}>
                            <span className="v-pill-dot"></span>
                            {getDistanceText(distance)}
                          </span>
                        </div>

                        {locationName && (
                          <div className="text-muted small font-monospace mb-3" style={{ fontSize: "0.78rem" }}>
                            {locationName}
                          </div>
                        )}

                        <div className="d-flex flex-wrap gap-2 mb-3">
                          <Badge bg="light" text="dark" className="border">
                            Seats {restaurateur.seat_capacity || 10}
                          </Badge>
                          <Badge bg="primary" className="text-white">
                            Occupancy {Math.round((restaurateur.occupancy_rate || 0) * 100)}%
                          </Badge>
                          <Badge bg="success">
                            Free {restaurateur.seats_remaining || 0}
                          </Badge>
                        </div>

                        <div className="border-top pt-2 mt-2 mb-3">
                          {phoneNumber && (
                            <div className="d-flex align-items-center text-muted small mb-1">
                              <FaPhoneAlt className="me-2 text-muted" style={{ fontSize: "0.75rem" }} />
                              <span className="font-monospace text-dark" style={{ fontSize: "0.8rem" }}>{phoneNumber}</span>
                            </div>
                          )}
                          {email && (
                            <div className="d-flex align-items-center text-muted small">
                              <FaEnvelope className="me-2 text-muted" style={{ fontSize: "0.75rem" }} />
                              <span className="font-monospace text-dark" style={{ fontSize: "0.8rem" }}>{email}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="d-flex gap-2 pt-2 border-top">
                        <button
                          className="v-action-btn flex-grow-1"
                          onClick={() => {
                            setSelectedRestaurateur(id);
                            sessionStorage.setItem("selected_restaurateur_id", id);
                            setShowRestaurateurProfile(true);
                          }}
                        >
                          View Profile
                        </button>
                        <button
                          className="v-btn-geist flex-grow-1 justify-content-center py-1 text-white bg-dark border-dark"
                          style={{ borderRadius: "4px", fontSize: "0.8rem" }}
                          onClick={() => {
                            const id =
                              restaurateur.id || restaurateur.dataValues?.id;
                            navigate(`/book/${id}`);
                          }}
                        >
                          Book Table
                        </button>
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </div>
        </div>
      ) : userLocation ? (
        <div className="v-empty-zone border rounded-3 bg-white mt-4">
          <FaMapMarkerAlt className="mb-3 text-muted" style={{ fontSize: "1.5rem" }} />
          <h4 className="v-block-heading fw-medium mb-1">No system nodes active</h4>
          <p className="text-muted small">Try optimizing your query parameters or expanding your search radius index.</p>
        </div>
      ) : (
        <div className="v-empty-zone border rounded-3 bg-white mt-4">
          <FaLocationArrow className="mb-3 text-muted" style={{ fontSize: "1.5rem" }} />
          <h4 className="v-block-heading fw-medium mb-1">Infrastructure Awaiting Context</h4>
          <p className="text-muted small mb-3">Provide system coordinate parameters or trigger network tracing mapping sequences.</p>
          <button
            className="v-btn-geist mx-auto"
            onClick={handleGetCurrentLocation}
            disabled={!locationEnabled || loading}
          >
            Locate Machine Position
          </button>
        </div>
      )}

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
          <RestaurantProfile restaurantId={selectedRestaurateur} />
        </div>
      )}
    </Container>
  );
};

export default NearbyRestaurants;
