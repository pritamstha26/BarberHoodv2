import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import NotFound from "../pages/NotFound";
import AdminLayout from "../Layout/AdminLayout";
import Dashboard from "../components/adminComponents/DashBoard.jsx";
// import Appointments from "../components/adminComponents/Appointments";
import { Navigate } from "react-router-dom";
import RestaurantList from "../components/adminComponents/RestaurantList";
import ServiceList from "../components/adminComponents/Services";
import TablesList from "../components/adminComponents/Tables";
import ClientList from "../components/adminComponents/ClientList";
import AdminBookings from "../components/adminComponents/Bookings";
import RestaurantSettingsPage from "../components/client/restaurant-settings-page";
import ProtectedRoute from "./ProtectedRoutes";
import ClientPortal from "../components/client";
import RestaurantDashboard from "../components/restaurant";
import Settings from "../components/client/settings";
import BookTable from "../pages/BookTable";
import AppointmentDetailPage from "../pages/AppointmentDetail";
import UnauthorizedHandler from "../components/UnauthorizedHandler";
import NearByRestaurants from "../components/client/nearby-restaurants";
import GPSNavigation from "../components/client/gps-navigation";
import ClientDashboard from "../components/client/dashboard";

//
const routes = [
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <Login /> },
  { path: "/sign-up", element: <SignUp /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/unauthorized", element: <UnauthorizedHandler /> },

  // Protected Routes wrapper
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "client",
        element: <ClientPortal />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <ClientDashboard /> },
          { path: "nearby-restaurants", element: <NearByRestaurants /> },
          { path: "gps-navigation", element: <GPSNavigation /> },
          { path: "settings", element: <Settings /> },
        ],
      },
      {
        path: "restaurateurs/:tab?",
        element: <RestaurantDashboard />,
      },
      { path: "restaurant-settings", element: <RestaurantSettingsPage /> },
      { path: "book/:restaurantId", element: <BookTable /> },
      { path: "appointments/:id", element: <AppointmentDetailPage /> },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { path: "", element: <Dashboard /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "bookings", element: <AdminBookings /> },
      { path: "restaurant-list", element: <RestaurantList /> },
      { path: "services", element: <ServiceList /> },
      { path: "tables", element: <TablesList /> },
      { path: "settings", element: <Settings /> },
      { path: "clients", element: <ClientList /> },
    ],
  },

  { path: "/*", element: <NotFound isAuthenticated="true" /> },
];

export default routes;
