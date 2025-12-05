
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GoogleMap from '@/components/ui/google-map';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Fuel, 
  AlertTriangle,
  RefreshCw,
  Filter,
  Maximize
} from 'lucide-react';
import { mockVehicles, mockAssignments } from '@/data/mockData';

export const Tracking: React.FC = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getActiveAssignment = (vehicleId: string) => {
    return mockAssignments.find(a => a.vehicleId === vehicleId && a.status === 'active');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">GPS Tracking</h1>
          <p className="text-muted-foreground">
            Real-time vehicle location and fleet monitoring
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm text-muted-foreground">Online</p>
                <p className="text-2xl font-bold">
                  {mockVehicles.filter(v => v.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="text-sm text-muted-foreground">In Service</p>
                <p className="text-2xl font-bold">
                  {mockVehicles.filter(v => v.status === 'maintenance').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <div>
                <p className="text-sm text-muted-foreground">Offline</p>
                <p className="text-2xl font-bold">
                  {mockVehicles.filter(v => v.status === 'inactive').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Alerts</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Live Map View</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {mockVehicles.filter(v => v.location?.lat && v.location?.lng).length} vehicles tracked
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Maximize className="mr-2 h-4 w-4" />
                    Fullscreen
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <GoogleMap 
                vehicles={mockVehicles}
                selectedVehicle={selectedVehicle}
                onVehicleSelect={setSelectedVehicle}
                height="400px"
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockVehicles.map((vehicle) => {
                const assignment = getActiveAssignment(vehicle.id);
                return (
                  <div 
                    key={vehicle.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedVehicle === vehicle.id ? 'bg-accent' : 'hover:bg-accent/50'
                    }`}
                    onClick={() => setSelectedVehicle(vehicle.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{vehicle.registrationNumber}</div>
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(vehicle.status)}`}></div>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {vehicle.location?.address || 'Location unavailable'}
                      </div>
                      {assignment && (
                        <div className="flex items-center">
                          <Navigation className="h-3 w-3 mr-1" />
                          {assignment.route.from} → {assignment.route.to}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Last update: 2 mins ago
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="alerts" className="w-full">
        <TabsList>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="geofences">Geofences</TabsTrigger>
          <TabsTrigger value="routes">Route History</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <div>
                    <div className="font-medium text-red-800">Speed Violation</div>
                    <div className="text-sm text-red-600">
                      Vehicle MH-12-AB-1234 exceeded speed limit on Mumbai-Pune Highway
                    </div>
                    <div className="text-xs text-red-500 mt-1">2 minutes ago</div>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded">
                <div className="flex items-center">
                  <Fuel className="h-5 w-5 text-yellow-600 mr-2" />
                  <div>
                    <div className="font-medium text-yellow-800">Low Fuel Alert</div>
                    <div className="text-sm text-yellow-600">
                      Vehicle GJ-01-CD-5678 fuel level below 15%
                    </div>
                    <div className="text-xs text-yellow-500 mt-1">15 minutes ago</div>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-orange-600 mr-2" />
                  <div>
                    <div className="font-medium text-orange-800">Geofence Violation</div>
                    <div className="text-sm text-orange-600">
                      Vehicle RJ-14-EF-9012 exited authorized zone
                    </div>
                    <div className="text-xs text-orange-500 mt-1">1 hour ago</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geofences" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Geofence Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Geofence management interface</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Create and manage geographical boundaries for vehicle monitoring
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Route History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Navigation className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Route history and replay</p>
                <p className="text-sm text-muted-foreground mt-2">
                  View historical routes and trip analytics
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
