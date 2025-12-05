import React from 'react';

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

interface FallbackMapProps {
  vehicles: Vehicle[];
  selectedVehicle?: string | null;
  onVehicleSelect?: (vehicleId: string) => void;
  height?: string;
}

const FallbackMap: React.FC<FallbackMapProps> = ({ 
  vehicles, 
  selectedVehicle, 
  onVehicleSelect,
  height = "400px" 
}) => {
  // Simple India map coordinates (approximate)
  const mapBounds = {
    minLat: 6.0,
    maxLat: 37.0,
    minLng: 68.0,
    maxLng: 97.0
  };

  const mapToSVG = (lat: number, lng: number) => {
    const x = ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100;
    const y = 100 - ((lat - mapBounds.minLat) / (mapBounds.maxLat - mapBounds.minLat)) * 100;
    return { x, y };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'maintenance': return '#F59E0B';
      case 'inactive': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const vehiclesWithLocation = vehicles.filter(v => v.location?.lat && v.location?.lng);

  return (
    <div 
      style={{ height }} 
      className="w-full rounded-lg overflow-hidden shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200"
    >
      <div className="relative w-full h-full">
        {/* Map Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-blue-300">
            <div className="text-6xl mb-2">🗺️</div>
            <div className="text-sm">India Map View</div>
          </div>
        </div>

        {/* Vehicle Markers */}
        {vehiclesWithLocation.map((vehicle) => {
          const position = mapToSVG(vehicle.location!.lat, vehicle.location!.lng);
          const isSelected = selectedVehicle === vehicle.id;
          
          return (
            <div
              key={vehicle.id}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                zIndex: isSelected ? 10 : 5
              }}
              onClick={() => onVehicleSelect?.(vehicle.id)}
            >
              {/* Marker */}
              <div
                className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                  isSelected ? 'animate-pulse' : ''
                }`}
                style={{ backgroundColor: getStatusColor(vehicle.status) }}
              />
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-white rounded shadow-lg text-xs whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
                <div className="font-semibold">{vehicle.registrationNumber}</div>
                <div className="text-gray-600">{vehicle.location!.address}</div>
                <div className="text-gray-500 capitalize">{vehicle.status}</div>
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="text-xs font-semibold mb-2">Vehicle Status</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs">Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-xs">Maintenance</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span className="text-xs">Inactive</span>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        {selectedVehicle && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs">
            <div className="text-sm font-semibold mb-2">Selected Vehicle</div>
            {vehiclesWithLocation
              .filter(v => v.id === selectedVehicle)
              .map(vehicle => (
                <div key={vehicle.id} className="space-y-1">
                  <div className="font-medium">{vehicle.registrationNumber}</div>
                  <div className="text-xs text-gray-600">{vehicle.location!.address}</div>
                  <div className="text-xs">
                    <span className="capitalize">{vehicle.status}</span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FallbackMap; 