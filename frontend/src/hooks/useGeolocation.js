/**
 * useGeolocation — browser Geolocation API with manual fallback.
 * Returns { coords, error, loading, request, setManual }
 */

import { useState, useCallback } from "react";

export default function useGeolocation() {
  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const request = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by this browser.");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setCoords(c);
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Failed to get location.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const setManual = useCallback((lat, lng, addr = "") => {
    setCoords({ lat: parseFloat(lat), lng: parseFloat(lng) });
    setAddress(addr);
    setError(null);
  }, []);

  return { coords, address, error, loading, request, setManual };
}