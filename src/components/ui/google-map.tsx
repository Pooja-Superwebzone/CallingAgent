import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import FallbackMap from './fallback-map';

interface Vehicle {
  id: string;
  registrationNumber: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  status: string;
}

interface GoogleMapProps {
  vehicles: Vehicle[];
  selectedVehicle?: string | null;
  onVehicleSelect?: (vehicleId: string) => void;
  height?: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ 
  vehicles, 
  selectedVehicle, 
  onVehicleSelect,
  height = "400px" 
}) => {
  // For development, immediately show fallback map
  // Set this to true when you have a real Google Maps API key
  const USE_GOOGLE_MAPS = false;
  
  if (!USE_GOOGLE_MAPS) {
    return (
      <FallbackMap 
        vehicles={vehicles}
        selectedVehicle={selectedVehicle}
        onVehicleSelect={onVehicleSelect}
        height={height}
      />
    );
  }

  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real API key should be used here
  const GOOGLE_MAPS_API_KEY = 'YOUR_REAL_API_KEY_HERE';

  useEffect(() => {
    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const loader = new Loader({
          apiKey: GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['places']
        });

        const google = await loader.load();
        
        if (!mapRef.current) return;

        // Default center (India)
        const defaultCenter = { lat: 20.5937, lng: 78.9629 };
        
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: 5,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        setMap(mapInstance);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load map. Please check your internet connection.');
        setIsLoading(false);
      }
    };

    initMap();
  }, []);

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    const newMarkers: google.maps.Marker[] = [];
    const bounds = new google.maps.LatLngBounds();

    vehicles.forEach(vehicle => {
      if (vehicle.location?.lat && vehicle.location?.lng) {
        const position = { 
          lat: vehicle.location.lat, 
          lng: vehicle.location.lng 
        };

        // Create custom marker icon based on vehicle status
        const getMarkerIcon = (status: string) => {
          const colors = {
            active: '#10B981', // green
            maintenance: '#F59E0B', // yellow
            inactive: '#6B7280' // gray
          };
          
          return {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: colors[status as keyof typeof colors] || '#6B7280',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
            scale: 8
          };
        };

        const marker = new google.maps.Marker({
          position,
          map,
          title: vehicle.registrationNumber,
          icon: getMarkerIcon(vehicle.status),
          animation: selectedVehicle === vehicle.id ? 
            google.maps.Animation.BOUNCE : undefined
        });

        // Create info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1F2937;">
                ${vehicle.registrationNumber}
              </h3>
              <p style="margin: 4px 0; color: #6B7280; font-size: 14px;">
                <strong>Status:</strong> 
                <span style="color: ${
                  vehicle.status === 'active' ? '#10B981' : 
                  vehicle.status === 'maintenance' ? '#F59E0B' : '#6B7280'
                };">${vehicle.status}</span>
              </p>
              <p style="margin: 4px 0; color: #6B7280; font-size: 14px;">
                <strong>Location:</strong> ${vehicle.location.address}
              </p>
            </div>
          `
        });

        // Add click listener to marker
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
          if (onVehicleSelect) {
            onVehicleSelect(vehicle.id);
          }
        });

        newMarkers.push(marker);
        bounds.extend(position);
      }
    });

    setMarkers(newMarkers);

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      map.fitBounds(bounds);
      // Add some padding
      const listener = google.maps.event.addListenerOnce(map, 'idle', () => {
        if (map.getZoom() && map.getZoom() > 15) {
          map.setZoom(15);
        }
      });
    }
  }, [map, vehicles, selectedVehicle, onVehicleSelect]);

  if (error) {
    return (
      <FallbackMap 
        vehicles={vehicles}
        selectedVehicle={selectedVehicle}
        onVehicleSelect={onVehicleSelect}
        height={height}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <div className="text-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      style={{ height }} 
      className="w-full rounded-lg overflow-hidden shadow-sm"
    />
  );
};

export default GoogleMap; 