# GPS Navigation System - Visual Guide

## 🗺️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER (Client)                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Restaurant Profile Page                       │   │
│  │  ┌─ Barber Info ─────────────────────────────────┐  │   │
│  │  │ Name, Phone, Services                         │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  │                                                      │   │
│  │  ┌─ GPS Navigation Component ──────────────────┐   │   │
│  │  │ 1. Request Location (Geolocation API)       │   │   │
│  │  │    └─► Browser Permission Prompt            │   │   │
│  │  │       └─► Latitude, Longitude               │   │   │
│  │  │                                              │   │   │
│  │  │ 2. Calculate Distance & ETA (Local Math)    │   │   │
│  │  │    └─► Haversine Formula                    │   │   │
│  │  │       └─► Display: "5.2 km, 15 min"        │   │   │
│  │  │                                              │   │   │
│  │  │ 3. Travel Mode Selection                    │   │   │
│  │  │    └─► 🚗 Driving (40 km/h)                │   │   │
│  │  │    └─► 🚶 Walking (5 km/h)                 │   │   │
│  │  │    └─► 🚌 Transit (25 km/h)                │   │   │
│  │  │                                              │   │   │
│  │  │ 4. Navigation Buttons                       │   │   │
│  │  │    └─► Google Maps (all devices)            │   │   │
│  │  │    └─► Apple Maps (iOS only)                │   │   │
│  │  │    └─► View Map (Leaflet)                   │   │   │
│  │  │                                              │   │   │
│  │  │ 5. Interactive Map Modal                    │   │   │
│  │  │    └─► Leaflet.js + OpenStreetMap           │   │   │
│  │  │       └─► Blue marker (user)                │   │   │
│  │  │       └─► Red marker (restaurant)           │   │   │
│  │  │       └─► Route line                        │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            ▼
        ┌──────────────────────────────────────┐
        │   Geolocation API (Browser)          │
        │   Returns: Latitude, Longitude       │
        └──────────────────────────────────────┘
                            ▼
        ┌──────────────────────────────────────┐
        │   External Navigation Services:      │
        │   • Google Maps                      │
        │   • Apple Maps                       │
        │   • OpenStreetMap + Leaflet          │
        └──────────────────────────────────────┘


DATABASE (Server-side - No access needed for navigation)
┌─────────────────────────────────────┐
│        Users (Restaurateurs)        │
├─────────────────────────────────────┤
│ id (INTEGER)                        │
│ first_name (STRING)                 │
│ last_name (STRING)                  │
│ latitude (DECIMAL 10,6) ◄── Used    │
│ longitude (DECIMAL 10,6) ◄── Used   │
│ location_name (STRING) ◄── Used     │
│ phone_number (BIGINT)               │
│ seat_capacity (INTEGER)             │
│ role = 'restaurateurs'              │
└─────────────────────────────────────┘
```

---

## 🔄 User Journey - GPS Navigation Flow

```
┌─────────────────────────────────────────────────────────────┐
│  START: User Opens Restaurant Profile                        │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
        ┌─────────────┐
        │ Sees GPS Card    NO ──► "Location unavailable"
        │ with address?  ◄───────► (Skip GPS feature)
        │            │ YES
        │            ▼
        │    Clicks "📍 Enable"
        │    My Location"
        │            │
        └────────────┼────────────────────────────────────────┐
                     ▼                                         │
          ┌─────────────────┐                                 │
          │ Browser asks for│                                 │
          │ permission?     │                                 │
          └─────────────────┘                                 │
          YES ▲         │ NO                                  │
             │          ▼                                     │
             │    User taps "Block"                           │
             │          │                                     │
             │          ▼                                     │
        User │    Shows error:                                │
        taps │    "Please enable                              │
       Allow │     location access"                           │
             │          │                                     │
             └──────────────┬─────────────────────────────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ Get User Location │
                  │ (Lat, Long, Acc) │
                  └──────────────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ Calculate Distance│
                  │ & ETA (Haversine)│
                  └──────────────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ Display:         │
                  │ • 5.2 km away    │
                  │ • 15 mins drive  │
                  │ • 25 mins walk   │
                  │ • 18 mins transit│
                  └──────────────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ User selects:    │
                  │ 🚗 🚶 or 🚌      │
                  └──────────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        ┌─────────┐  ┌────────┐  ┌──────────┐
        │ Google  │  │ Apple  │  │ View     │
        │ Maps    │  │ Maps   │  │ Map      │
        │ (NEW    │  │(iOS)   │  │(Leaflet) │
        │ TAB)    │  │        │  │(MODAL)   │
        └────┬────┘  └────┬───┘  └────┬─────┘
             │            │            │
             ▼            ▼            ▼
      Open in browser  Open native  Show full-screen
      with directions  Maps app     interactive map
             │            │            │
             └────────────┴────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │ Navigation Complete ✅   │
              │ User can reach location │
              └─────────────────────────┘
```

---

## 📱 Component Structure

```
GPSNavigation
├── State
│   ├── userLocation (lat, lng, accuracy)
│   ├── locationLoading (boolean)
│   ├── locationError (string)
│   ├── navigationData (distances)
│   ├── eta (time, distance)
│   ├── navigationType (driving/walking/transit)
│   └── showMap (boolean)
│
├── Functions
│   ├── requestUserLocation()
│   ├── calculateNavigationData()
│   ├── calculateDistance()
│   ├── openGoogleMaps()
│   ├── openAppleMaps()
│   └── openLeafletMap()
│
├── JSX Sections
│   ├── Card Header
│   │   └── Restaurant name + location
│   │
│   ├── Restaurant Location Info
│   │   └── Address, coordinates
│   │
│   ├── Status Alerts
│   │   ├── Error messages
│   │   └── Success (location found)
│   │
│   ├── Location Button
│   │   └── "Enable My Location" (with loading state)
│   │
│   ├── ETA Display (if enabled)
│   │   ├── Distance (km)
│   │   └── Time (formatted)
│   │
│   ├── Travel Mode Selector
│   │   ├── 🚗 Driving
│   │   ├── 🚶 Walking
│   │   └── 🚌 Transit
│   │
│   ├── Navigation Buttons
│   │   ├── Google Maps
│   │   ├── Apple Maps (iOS only)
│   │   └── View Map
│   │
│   └── Contact Info
│       └── Phone call button
│
└── Sub-component
    └── GPSMapModal
        ├── Full-screen Leaflet map
        ├── User marker (blue)
        ├── Restaurant marker (red)
        └── Route line
```

---

## 🧮 Distance & ETA Calculation

```
INPUT:
  User Location:     27.7172°N, 85.3240°E
  Restaurant:        27.7282°N, 85.3140°E
  Travel Mode:       Driving

STEP 1: Apply Haversine Formula
  ┌────────────────────────────────────┐
  │ a = sin²(Δlat/2) + cos(lat1)       │
  │     × cos(lat2) × sin²(Δlong/2)    │
  │ c = 2 × atan2(√a, √(1−a))          │
  │ d = R × c (R = 6371 km)            │
  └────────────────────────────────────┘

STEP 2: Calculate Distance
  Distance = 1.24 km

STEP 3: Apply Speed for Mode
  Driving: 40 km/h (city average)
  Time = (1.24 / 40) × 60 = 1.86 minutes
  ≈ 2 minutes

STEP 4: Format Output
  Distance: "1.24 km"
  Time: "2 mins"
  Display: "1.24 km • 2 mins"

OUTPUT: ✅ Show to user
```

---

## 🗺️ Map Modal - Visual Layout

```
┌────────────────────────────────────────────────────┐
│ ✕  📍 Navigation Map                               │
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │                                              │ │
│  │          🗺️ OpenStreetMap Tiles              │ │
│  │                                              │ │
│  │        ┌─────────────────────────────┐       │ │
│  │        │                             │       │ │
│  │        │     🔵 User Location        │       │ │
│  │        │                             │       │ │
│  │        │        ╱╱╱╱╱                │       │ │
│  │        │       ╱ Route ╱             │       │ │
│  │        │      ╱╱╱╱╱╱╱╱              │       │ │
│  │        │                             │       │ │
│  │        │            🔴 Restaurant    │       │ │
│  │        │                             │       │ │
│  │        └─────────────────────────────┘       │ │
│  │                                              │ │
│  │  [+] [-] Controls                            │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
└────────────────────────────────────────────────────┘

Legend:
🔵 = User Current Location (Blue Marker)
🔴 = Restaurant Target (Red Marker)
╱╱╱ = Route Line (Polyline)
🗺️ = OpenStreetMap (Free tiles)
```

---

## 🔀 Decision Tree - Navigation Provider Selection

```
User clicks navigation button
            │
            ▼
        Is iOS?
       /       \
     YES       NO
     │          │
     ▼          ▼
  Show      Is Android?
  Apple     /         \
  Maps    YES          NO
  Option  │            │
  +Google │            ▼
  Maps    ▼         Show Google
          Show      Maps Only
          Google    (Web browser)
          Maps +
          Android
          default
          Maps
          option

(View Map always available on all platforms)
```

---

## ⚙️ Technical Stack

```
┌─────────────────────────────────────────┐
│          FRONTEND (React)                │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  gps-navigation.jsx              │  │
│  │  - Main component                │  │
│  │  - State management              │  │
│  │  - Event handlers                │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  gps-navigation.css              │  │
│  │  - Styling                       │  │
│  │  - Responsive design             │  │
│  │  - Animations                    │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Libraries                       │  │
│  │  - React Bootstrap (UI)          │  │
│  │  - React Icons (SVG icons)       │  │
│  │  - Leaflet.js (maps)             │  │
│  │  - Browser Geolocation API       │  │
│  └──────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│          BACKEND (Node.js)               │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  gpsNavigation.js                │  │
│  │  - calculateETA()                │  │
│  │  - calculateBearing()            │  │
│  │  - formatCoordinates()           │  │
│  │  - generateMapURLs()             │  │
│  │  (Optional - for API endpoints)  │  │
│  └──────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│          EXTERNAL SERVICES              │
├─────────────────────────────────────────┤
│                                         │
│  Google Maps API                        │
│  ├── Direction API (optional)           │
│  └── Geocoding API (optional)           │
│                                         │
│  Apple Maps API                         │
│  ├── Available natively on iOS          │
│  └── maps:// protocol handler           │
│                                         │
│  OpenStreetMap + Leaflet.js             │
│  ├── Free tile server                   │
│  └── No API key required                │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📊 Feature Comparison Matrix

```
┌──────────────────┬──────────┬───────┬─────────────┐
│ Feature          │ Google   │ Apple │ OSM+Leaflet │
├──────────────────┼──────────┼───────┼─────────────┤
│ Desktop Support  │    ✅    │  ❌   │      ✅     │
│ iOS Support      │    ✅    │  ✅   │      ✅     │
│ Android Support  │    ✅    │  ❌   │      ✅     │
│ Real-time Traffic│    ✅    │  ✅   │      ❌     │
│ API Key Required │    ✅    │  ❌   │      ❌     │
│ Cost             │   $$$    │  Free │     Free    │
│ Turn-by-turn     │    ✅    │  ✅   │      ❌     │
│ Voice Navigation │    ✅    │  ✅   │      ❌     │
│ Native Feel      │    ✅    │  ✅   │      ✅     │
└──────────────────┴──────────┴───────┴─────────────┘
```

---

## 🚀 Performance Flow

```
Time: 0-500ms
  │ Request location permission
  └─► Show browser permission dialog

Time: 500-2000ms
  │ Wait for user response
  └─► Receive geolocation coordinates

Time: 2000-2100ms
  │ Calculate distance (local)
  └─► Calculate ETA (local)

Time: 2100-2200ms
  │ Render distance/ETA display
  └─► Show navigation options

Time: 2200ms (LOADED ✅)
  │ User can click navigation buttons

Time: 2200-5000ms (If user clicks map)
  │ Load Leaflet library (CDN)
  └─► Render interactive map
```

---

## 🔄 State Management Flow

```
Initial State
   │
   ├─ userLocation: null
   ├─ locationLoading: false
   ├─ locationError: null
   ├─ navigationData: null
   ├─ eta: null
   ├─ navigationType: 'driving'
   └─ showMap: false

        │
        ▼ (User clicks "Enable Location")

   ├─ locationLoading: true
   │
        │
        ▼ (Permission granted)

   ├─ userLocation: { lat, lng, accuracy }
   ├─ locationLoading: false
   ├─ navigationData: { userLat, userLng, restLat, restLng, distance }
   ├─ eta: { distanceKm, timeMinutes, formattedTime }
   │
        │
        ▼ (User changes travel mode)

   ├─ navigationType: 'walking' (or 'transit')
   ├─ eta: { NEW VALUES based on speed }
   │
        │
        ▼ (User clicks "View Map")

   └─ showMap: true
      └─► GPSMapModal opens
```

---

**This visual guide helps understand the GPS Navigation system architecture and user flow!**
