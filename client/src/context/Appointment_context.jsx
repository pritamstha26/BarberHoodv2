// import { createContext, useContext, useState } from "react";

// // Sample data
// const initialAppointments = [
//   {
//     id: "1",
//     clientName: "User1",
//     style: "Style1",
//     barberName: "Barber1",
//     contactNumber: "1111111111",
//     totalPrice: 35.0,
//     status: "Completed",
//   },
//   {
//     id: "2",
//     clientName: "User2",
//     style: "Style2",
//     barberName: "Barber2",
//     contactNumber: "222222222222",
//     totalPrice: 45.0,
//     status: "In Progress",
//   },
//   {
//     id: "3",
//     clientName: "User3",
//     style: "Style3",
//     barberName: "Barber3",
//     contactNumber: "333333333333",
//     totalPrice: 25.0,
//     status: "Scheduled",
//   },
//   {
//     id: "4",
//     clientName: "User4",
//     style: "Style4",
//     barberName: "Barber4",
//     contactNumber: "444444444444",
//     totalPrice: 50.0,
//     status: "Completed",
//   },
// ];

// // Create context
// const AppointmentContext = createContext();

// // Custom hook to use the context
// export function useAppointments() {
//   const context = useContext(AppointmentContext);
//   if (!context) {
//     throw new Error(
//       "useAppointments must be used within an AppointmentProvider"
//     );
//   }
//   return context;
// }

// // Provider component
// export function AppointmentProvider({ children }) {
//   const [appointments, setAppointments] = useState(initialAppointments);
//   const [searchTerm, setSearchTerm] = useState("");

//   // Filter appointments based on search term
//   const filteredAppointments = appointments.filter(
//     (appointment) =>
//       appointment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       appointment.barberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       appointment.style.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       appointment.id.includes(searchTerm)
//   );

//   // Calculate statistics
//   const stats = {
//     totalAppointments: filteredAppointments.length,
//     completedAppointments: filteredAppointments.filter(
//       (app) => app.status === "Completed"
//     ).length,
//     totalRevenue: filteredAppointments.reduce(
//       (sum, appointment) => sum + appointment.totalPrice,
//       0
//     ),
//     averagePrice:
//       filteredAppointments.length > 0
//         ? filteredAppointments.reduce(
//             (sum, appointment) => sum + appointment.totalPrice,
//             0
//           ) / filteredAppointments.length
//         : 0,
//   };

//   // Actions
//   const addAppointment = (newAppointment) => {
//     const id = (appointments.length + 1).toString().padStart(3, "0");
//     setAppointments((prev) => [...prev, { ...newAppointment, id }]);
//   };

//   const updateAppointment = (id, updatedData) => {
//     setAppointments((prev) =>
//       prev.map((appointment) =>
//         appointment.id === id ? { ...appointment, ...updatedData } : appointment
//       )
//     );
//   };

//   const deleteAppointment = (id) => {
//     setAppointments((prev) =>
//       prev.filter((appointment) => appointment.id !== id)
//     );
//   };

//   const contextValue = {
//     appointments,
//     filteredAppointments,
//     stats,
//     searchTerm,
//     setSearchTerm,
//     addAppointment,
//     updateAppointment,
//     deleteAppointment,
//   };

//   return (
//     <AppointmentContext.Provider value={contextValue}>
//       {children}
//     </AppointmentContext.Provider>
//   );
// }

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
// Sample data
const initialAppointments = [
  {
    id: "1",
    clientName: "User1",
    style: "Style1",
    barberName: "Barber1",
    contactNumber: "1111111111",
    totalPrice: 35.0,
    status: "Completed",
  },
  {
    id: "2",
    clientName: "User2",
    style: "Style2",
    barberName: "Barber2",
    contactNumber: "222222222222",
    totalPrice: 45.0,
    status: "In Progress",
  },
  {
    id: "3",
    clientName: "User3",
    style: "Style3",
    barberName: "Barber3",
    contactNumber: "333333333333",
    totalPrice: 25.0,
    status: "Scheduled",
  },
  {
    id: "4",
    clientName: "User4",
    style: "Style4",
    barberName: "Barber4",
    contactNumber: "444444444444",
    totalPrice: 50.0,
    status: "Completed",
  },
];

// Create context
const AppointmentContext = createContext();

// Custom hook to use the context
export function useAppointments() {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error(
      "useAppointments must be used within an AppointmentProvider"
    );
  }
  return context;
}

// Provider component
export function AppointmentProvider({ children }) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [searchTerm, setSearchTerm] = useState("");
  //
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const getAllServices = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/services"); // Update with your API URL
      const { data } = response.data; // API returns { data: [...] }
      // Map API response to frontend structure and assign default icons if needed
      return data.map((service) => ({
        id: service.service_id,
        name: service.name,
        price: service.price,
        duration: service.duration,
      }));
    } catch (error) {
      console.error("Error fetching services:", error.message);
      throw error;
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getAllServices();
        setServices(data);
        setServicesLoading(false);
      } catch (err) {
        // setServicesError("Failed to load services. Please try again later.");
        setServicesLoading(false);
      }
    };
    fetchServices();
  }, []);
  // Filter appointments based on search term
  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.barberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.style.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.id.includes(searchTerm)
  );

  // Calculate statistics
  const stats = {
    totalAppointments: filteredAppointments.length,
    completedAppointments: filteredAppointments.filter(
      (app) => app.status === "Completed"
    ).length,
    totalRevenue: filteredAppointments.reduce(
      (sum, appointment) => sum + appointment.totalPrice,
      0
    ),
    averagePrice:
      filteredAppointments.length > 0
        ? filteredAppointments.reduce(
            (sum, appointment) => sum + appointment.totalPrice,
            0
          ) / filteredAppointments.length
        : 0,
  };

  // Actions
  const addAppointment = (newAppointment) => {
    const id = (appointments.length + 1).toString().padStart(3, "0");
    setAppointments((prev) => [...prev, { ...newAppointment, id }]);
  };

  const updateAppointment = (id, updatedData) => {
    setAppointments((prev) =>
      prev.map((appointment) =>
        appointment.id === id ? { ...appointment, ...updatedData } : appointment
      )
    );
  };

  const deleteAppointment = (id) => {
    setAppointments((prev) =>
      prev.filter((appointment) => appointment.id !== id)
    );
  };

  const contextValue = {
    appointments,
    filteredAppointments,
    stats,
    searchTerm,
    setSearchTerm,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    setServices,
    services,
    servicesLoading,
    getAllServices,
  };

  return (
    <AppointmentContext.Provider value={contextValue}>
      {children}
    </AppointmentContext.Provider>
  );
}
