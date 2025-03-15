import { useEffect, useRef } from 'react';
import L from 'leaflet';

export function useMap(containerId, position, options = {}) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map(`map-${containerId}`).setView(position, options.zoom || 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);
      markerRef.current = L.marker(position).addTo(mapRef.current);
    } else {
      mapRef.current.setView(position, options.zoom || 13);
      markerRef.current.setLatLng(position);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [containerId, position, options.zoom]);

  return { mapRef, markerRef };
}