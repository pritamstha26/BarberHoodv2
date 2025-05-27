import Login from "../pages/Login";
import SignUp from "../pages/SignUp";

import NotFound from "../pages/NotFound";
import AdminLayout from "../Layout/AdminLayout";
import Dashboard from "../components/adminComponents/dashBoard";
import Appointments from "../components/adminComponents/Appointments";
import { Navigate } from "react-router-dom";
import BarberList from "../components/adminComponents/BarberList";
import ServiceList from "../components/adminComponents/Services";
import ClientPortal from "../components/client";
import BarberDashboard from "../components/barber";

//
const routes = [
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <Login /> },
  { path: "/sign-up", element: <SignUp /> },
  { path: "/client", element: <ClientPortal /> },
  { path: "/barber", element: <BarberDashboard /> },

  { path: "/*", element: <NotFound isAuthenticated="true" /> },

  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        path: "",
        element: <Dashboard />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "appointments",
        element: <Appointments />,
      },
      {
        path: "barber-list",
        element: <BarberList />,
      },
      {
        path: "services",
        element: <ServiceList />,
      },
    ],
  },
];

export default routes;
