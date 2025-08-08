import axios from 'axios';
import React, { useContext, useEffect, useState, createContext } from 'react';

const AppointmentContext = createContext();

// Custom hook to use the context
export function useAppointments() {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
}
export default function AppointmentProvider({ children }) {
  const [list, setList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const barberList = list.filter((user) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    return user.role === 'barber' && fullName.includes(searchTerm.toLowerCase());
  });
  const clientList = list.filter((user) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    return user.role === 'client' && fullName.includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    const apiData = async () => {
      try {
        const getData = await axios.get('http://localhost:6969/api/users/all');
        setList(getData.data.data);
      } catch (error) {
        console.log('An error occurred');
      }
    };
    apiData();
  }, []);

  const contextValue = {
    list,
    barberList,
    clientList,
    setList
  };
  return <AppointmentContext.Provider value={contextValue}>{children}</AppointmentContext.Provider>;
}
