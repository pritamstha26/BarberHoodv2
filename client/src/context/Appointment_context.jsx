import api from "../apis/api";
import React, { useContext, useEffect, useState, createContext } from "react";

const AppointmentContext = createContext();

// Custom hook to use the context
export function useAppointments() {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error(
      "useAppointments must be used within an AppointmentProvider",
    );
  }
  return context;
}
export default function AppointmentProvider({ children }) {
  const [list, setList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const restaurateursList = list.filter((user) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    return (
      user.role === "restaurateurs" &&
      fullName.includes(searchTerm.toLowerCase())
    );
  });
  const clientList = list.filter((user) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    return (
      user.role === "client" && fullName.includes(searchTerm.toLowerCase())
    );
  });

  // Function to fetch users - called manually when needed
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }
      const getData = await api.get("/users/all");
      setList(getData.data.data);
    } catch (err) {
      console.error(
        "Appointment_context: error fetching users:",
        err.message || err,
      );
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Fetch users when component mounts if token exists
  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    if (token) {
      fetchUsers();
    }
  }, []);

  const contextValue = {
    list,
    restaurateursList,
    clientList,
    setList,
    fetchUsers,
    loading,
    error,
    searchTerm,
    setSearchTerm,
  };
  return (
    <AppointmentContext.Provider value={contextValue}>
      {children}
    </AppointmentContext.Provider>
  );
}
