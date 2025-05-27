import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App.jsx";
import { AppointmentProvider } from "./context/appointment_context.jsx";
//
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <AppointmentProvider>
        <App />
      </AppointmentProvider>
    </Router>
  </React.StrictMode>
);
