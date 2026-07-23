import { useState } from "react";
import api from "../apis/api";

export function useLottery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const enterLottery = async (restaurantId, bookingDate, timeSlot, partySize, preferences = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/lottery/enter", {
        restaurantId,
        bookingDate,
        preferredTimeSlot: timeSlot,
        partySize,
        preferences,
      });

      return response.data;
    } catch (caughtError) {
      const message = caughtError.response?.data?.message || "Failed to enter lottery";
      setError(message);
      throw caughtError;
    } finally {
      setLoading(false);
    }
  };

  const getStatus = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/lottery/status");
      return response.data.entries || [];
    } catch (caughtError) {
      const message = caughtError.response?.data?.message || "Failed to load lottery status";
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getAlternatives = async (restaurantId, bookingDate, timeSlot, partySize) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/lottery/alternatives", {
        restaurantId,
        bookingDate,
        preferredTimeSlot: timeSlot,
        partySize,
      });

      return response.data;
    } catch (caughtError) {
      const message = caughtError.response?.data?.message || "Failed to load alternatives";
      setError(message);
      throw caughtError;
    } finally {
      setLoading(false);
    }
  };

  return {
    enterLottery,
    getStatus,
    getAlternatives,
    loading,
    error,
  };
}