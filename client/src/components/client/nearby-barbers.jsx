import React, { useState, useEffect } from 'react';
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
  Badge
} from 'react-bootstrap';
import { FaLocationArrow, FaMapMarkerAlt, FaUser, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import api from '../../apis/api';
import BarberProfile from './barber-profile';

const NearbyBarbers = () => {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(5);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [manualLocation, setManualLocation] = useState({ latitude: '', longitude: '' });
  const [locationMethod, setLocationMethod] = useState('auto');
  const [saveLocation, setSaveLocation] = useState(true);
  const [savedLocations, setSavedLocations] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [showBarberProfile, setShowBarberProfile] = useState(false);

  // Load user's location and saved locations on component mount
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
      const response = await api.get('/location/current');
      if (response.status === 200 && response.data.success) {
        const { latitude, longitude, location_name } = response.data.data;

        // Only set if both lat and long are available
        if (latitude && longitude) {
          setUserLocation({
            latitude,
            longitude,
            location_name
          });

          setManualLocation({
            latitude,
            longitude
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user location:', error);
      // We don't set an error state here because this is just initialization
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

        // Automatically search for barbers when location is detected
        fetchNearbyBarbers(latitude, longitude, searchRadius);
      },
      (error) => {
        setLoading(false);
        let errorMessage = 'Error detecting your location. ';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'You denied the request for location.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'The request to get your location timed out.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
        }

        setError(errorMessage);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // Save user's location to the backend
  const saveUserLocation = async (latitude, longitude, location_name = '') => {
    try {
      await api.put('/location/update', {
        latitude,
        longitude,
        location_name
      });
    } catch (error) {
      console.error('Error saving location:', error);
      // Non-blocking error
    }
  };

  // Handle manual location input
  const handleManualLocationChange = (e) => {
    const { name, value } = e.target;
    setManualLocation({
      ...manualLocation,
      [name]: value
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
      setError('Please enter valid latitude and longitude coordinates.');
      return;
    }

    // Update user location
    setUserLocation({ latitude, longitude });

    // Save location if checkbox is checked
    if (saveLocation) {
      saveUserLocation(latitude, longitude);
    }

    // Fetch nearby barbers
    fetchNearbyBarbers(latitude, longitude, searchRadius);
  };

  // Fetch nearby barbers from the API
  const fetchNearbyBarbers = async (latitude, longitude, maxDistance) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/location/nearby-barbers', {
        params: { latitude, longitude, maxDistance }
      });

      if (response.status === 200) {
        setBarbers(response.data.data);

        if (response.data.data.length === 0) {
          setError(
            `No barbers found within ${maxDistance} km of your location. Try increasing the search radius.`
          );
        }
      }
    } catch (error) {
      console.error('Error fetching nearby barbers:', error);
      setError('Failed to fetch nearby barbers. Please try again.');
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

  console.log({ barbers });

  return (
    <Container fluid className="p-4">
      <div className="mb-4">
        <h1 className="display-5 fw-bold text-dark mb-2">Find Nearby Barbers</h1>
        <p className="text-muted">
          Discover barbers close to your location and book your appointment
        </p>
      </div>

      {/* Location selection card */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Header className="bg-dark text-white">
          <h5 className="mb-0">Your Location</h5>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSearchSubmit}>
            <Row className="mb-3">
              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label>Location Method</Form.Label>
                  <div className="d-flex">
                    <Form.Check
                      type="radio"
                      id="auto-location"
                      label="Use my current location"
                      name="locationMethod"
                      value="auto"
                      checked={locationMethod === 'auto'}
                      onChange={() => setLocationMethod('auto')}
                      className="me-4"
                      disabled={!locationEnabled}
                    />
                    <Form.Check
                      type="radio"
                      id="manual-location"
                      label="Enter coordinates manually"
                      name="locationMethod"
                      value="manual"
                      checked={locationMethod === 'manual'}
                      onChange={() => setLocationMethod('manual')}
                    />
                  </div>
                </Form.Group>
              </Col>

              {locationMethod === 'auto' ? (
                <Col md={12} className="text-center">
                  <Button
                    variant="primary"
                    onClick={handleGetCurrentLocation}
                    disabled={loading || !locationEnabled}
                    className="mb-3 d-flex align-items-center justify-content-center mx-auto"
                  >
                    {loading ? (
                      <Spinner animation="border" size="sm" className="me-2" />
                    ) : (
                      <FaLocationArrow className="me-2" />
                    )}
                    Detect My Location
                  </Button>

                  {!locationEnabled && (
                    <Alert variant="warning">
                      Your browser does not support geolocation or it's disabled. Please enable
                      location services or enter coordinates manually.
                    </Alert>
                  )}
                </Col>
              ) : (
                <Col md={12}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Latitude</Form.Label>
                        <Form.Control
                          type="text"
                          name="latitude"
                          value={manualLocation.latitude}
                          onChange={handleManualLocationChange}
                          placeholder="e.g., 27.7172"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Longitude</Form.Label>
                        <Form.Control
                          type="text"
                          name="longitude"
                          value={manualLocation.longitude}
                          onChange={handleManualLocationChange}
                          placeholder="e.g., 85.3240"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Col>
              )}

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Search Radius (km)</Form.Label>
                  <Form.Control
                    type="number"
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(parseFloat(e.target.value))}
                    min="0.5"
                    max="50"
                    step="0.5"
                  />
                  <Form.Text className="text-muted">
                    Distance in kilometers to search for barbers
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Save Location</Form.Label>
                  <div>
                    <Form.Check
                      type="switch"
                      id="save-location"
                      label="Save my location for future searches"
                      checked={saveLocation}
                      onChange={(e) => setSaveLocation(e.target.checked)}
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-center">
              <Button variant="primary" type="submit" disabled={loading} className="px-4">
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Searching...
                  </>
                ) : (
                  <>
                    <FaMapMarkerAlt className="me-2" />
                    Find Nearby Barbers
                  </>
                )}
              </Button>
            </div>
          </Form>

          {userLocation && (
            <div className="mt-3">
              <Alert variant="info" className="d-flex align-items-center">
                <FaMapMarkerAlt className="me-2" />
                <div>
                  <strong>Current search location:</strong>{' '}
                  {userLocation.location_name
                    ? `${userLocation.location_name} (${userLocation.latitude.toFixed(
                        6
                      )}, ${userLocation.longitude.toFixed(6)})`
                    : `${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)}`}
                </div>
              </Alert>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Barbers list */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" variant="primary" />
          <p className="mt-2">Searching for nearby barbers...</p>
        </div>
      ) : barbers.length > 0 ? (
        <Row>
          <Col md={12}>
            <h3 className="mb-3">
              Found {barbers.length} barber{barbers.length !== 1 ? 's' : ''} nearby
            </h3>
          </Col>
          {barbers.map((barber) => (
            <Col md={4} key={barber.id} className="mb-4">
              <Card className="h-100 shadow-sm border-0 hover-card">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                      <FaUser className="text-primary fs-4" />
                    </div>
                    <div>
                      <h5 className="mb-0">{`${barber.dataValues.first_name} ${barber.dataValues.last_name}`}</h5>
                      <Badge bg="info" className="mt-1">
                        <FaMapMarkerAlt className="me-1" />
                        {getDistanceText(barber.distance)} away
                      </Badge>
                      {barber.location_name && (
                        <div className="text-muted small mt-1">{barber.location_name}</div>
                      )}
                    </div>
                  </div>

                  <ListGroup variant="flush" className="mb-3">
                    {barber.phone_number && (
                      <ListGroup.Item className="d-flex align-items-center px-0 py-2 border-0">
                        <FaPhoneAlt className="text-muted me-2" />
                        <span>{barber.phone_number}</span>
                      </ListGroup.Item>
                    )}
                    {barber.email && (
                      <ListGroup.Item className="d-flex align-items-center px-0 py-2 border-0">
                        <FaEnvelope className="text-muted me-2" />
                        <span>{barber.email}</span>
                      </ListGroup.Item>
                    )}
                  </ListGroup>

                  <div className="d-grid gap-2">
                    <Button
                      variant="outline-primary"
                      onClick={() => {
                        setSelectedBarber(barber.dataValues.id);
                        localStorage.setItem('selected_barber_id', barber.dataValues.id);
                        setShowBarberProfile(true);
                      }}
                    >
                      View Profile
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setSelectedBarber(barber.dataValues.id);
                        localStorage.setItem('selected_barber_id', barber.dataValues.id);
                        setShowBarberProfile(true);
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
          <FaMapMarkerAlt className="mb-3" style={{ fontSize: '2rem' }} />
          <h4>No barbers found</h4>
          <p className="text-muted">
            Try increasing your search radius or trying a different location.
          </p>
        </Alert>
      ) : null}

      {/* Barber Profile Modal */}
      {showBarberProfile && selectedBarber && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-white"
          style={{ zIndex: 1050, overflowY: 'auto' }}
        >
          <div className="d-flex justify-content-between p-3 border-bottom">
            <h4>Barber Profile</h4>
            <Button variant="outline-secondary" onClick={() => setShowBarberProfile(false)}>
              Back to Search
            </Button>
          </div>
          <BarberProfile barberId={selectedBarber} />
        </div>
      )}
    </Container>
  );
};

export default NearbyBarbers;
