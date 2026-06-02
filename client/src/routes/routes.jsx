import Login from "../pages/Login";
import SignUp from "../pages/SignUp";

import NotFound from "../pages/NotFound";
import AdminLayout from "../Layout/AdminLayout";
import Dashboard from "../components/adminComponents/DashBoard.jsx";
// import Appointments from "../components/adminComponents/Appointments";
import { Navigate } from "react-router-dom";
import BarberList from "../components/adminComponents/BarberList";
import ServiceList from "../components/adminComponents/Services";
import ClientPortal from "../components/client";
import BarberDashboard from "../components/barber";
import ProtectedRoute from "./ProtectedRoutes";
import Settings from "../components/client/settings";
import ClientList from "../components/adminComponents/ClientList";
import RestaurantSettingsPage from "../components/client/restaurant-settings-page";

//
const routes = [
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <Login /> },
  { path: "/sign-up", element: <SignUp /> },

  // Protected Routes wrapper
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/client", element: <ClientPortal /> },
      { path: "/restaurateurs", element: <BarberDashboard /> },
      { path: "/restaurant-settings", element: <RestaurantSettingsPage /> },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { path: "", element: <Dashboard /> },
      { path: "dashboard", element: <Dashboard /> },

      { path: "Restaurant-list", element: <BarberList /> },
      { path: "services", element: <ServiceList /> },
      { path: "settings", element: <Settings /> },
      { path: "clients", element: <ClientList /> },
    ],
  },

  { path: "/*", element: <NotFound isAuthenticated="true" /> },
];

export default routes;
