import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Grid,
  List,
  Plus,
  MapPin,
  Calendar,
  Fuel,
  Settings,
  AlertTriangle,
  Trash2,
  Wrench,
  FileText,
  Edit,
} from "lucide-react";
import { mockVehicles } from "@/data/mockData";
import { Vehicle } from "@/types";
import { AddVehicleDialog } from "@/components/vehicles/AddVehicleDialog";
import { VehicleEditDialog } from "@/components/vehicles/VehicleEditDialog";
import { fetchDataService, userModuleService } from "@/customHooks/useApi";
import { useToast } from "@/hooks/use-toast";
import { findVehicleName } from "@/customHooks/globalVars";

export const Vehicles: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [ vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [ vehicleModels, setVehicleModels] = useState<any[]>([]);
  const [ vdocTypes, setVDocTypes] = useState<any[]>([]);
  const [ vDrivers, setVDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getVehicles = async () => {
    setLoading(true);
  
    try {
      const vtData = await fetchDataService("getvehicletype", 'GET');
      setVehicleTypes(vtData[0]?.status === 'success' ? vtData[0].data : []);
      
      const vmData = await fetchDataService("getvehiclemodel", 'GET');
      setVehicleModels(vmData[0]?.status === 'success' ? vmData[0].data : []);
  
      const vdtData = await fetchDataService("getdocumenttype", 'GET');
      setVDocTypes(vdtData[0]?.status === 'success' ? vdtData[0].data : []);
  
      const vDriData = await fetchDataService("getvehicledriver", 'GET');
      setVDrivers(vDriData[0]?.status === 'success' ? vDriData[0].data : []);
  
      const data = await fetchDataService("vehiclemanagement", 'GET');
      if (data[0]?.status === 'success') {
        setVehicles(data[0].data);
      } else {
        toast({
          title: "Error",
          description: data[0].message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getVehicles();
  }, []);

  const dataRefresh = () =>{
    console.log('fetch data again....')
    getVehicles();
  }

  const handleDeleteVehicle = async (vehicle_id: number) => {
      //setUsers(users.filter((user) => user.emp_id !== emp_id));
      //console.log(emp_id);
      const delEP = "deletevehicle ";
      const isData = await userModuleService(delEP, 'Delete', {vehicle_id});
      console.log(isData);
      if(typeof isData.message != "undefined" && typeof isData.status == "undefined"){
        toast({   
          title: 'Error',
          description: isData.message,
          variant: "destructive",
        });
        return;
      }
      if(typeof isData[0].status != "undefined" && isData[0].status == 'success'){
        toast({
          title: "Success",
          description: isData[0].message,
          variant: "success"
        });
        getVehicles();
      } else {
        toast({
          title: 'Error',
          description: isData[0].message,
          variant: "destructive",
        });
      }    
  };
  // Helper function to check if documents are expiring (within 30 days)
 const isDocumentExpiring = (vehicle: Vehicle) => {
  if (!vehicle.nextService) return false;

  const serviceDate = new Date(vehicle.nextService);
  const today = new Date();
  const thirtyDaysFromNow = new Date(
    today.getTime() + 30 * 24 * 60 * 60 * 1000
  );

  // Utility to format as ddmmyyyy
  const formatToDDMMYYYY = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
    const year = date.getFullYear();
    return `${day}${month}${year}`; // e.g., "12092024"
  };

  const formattedServiceDate = formatToDDMMYYYY(serviceDate);
  const formattedThirtyDaysFromNow = formatToDDMMYYYY(thirtyDaysFromNow);

  console.log("Service Date:", formattedServiceDate);
  console.log("30 Days From Now:", formattedThirtyDaysFromNow);

  return formattedServiceDate <= formattedThirtyDaysFromNow;
};


  function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
  // Helper function to check if service is due (within 30 days)
 const isServiceDue = (vehicle: Vehicle) => {
  if (!vehicle.service_date) return false;

  const serviceDate = stripTime(new Date(vehicle.service_date));
  const today = stripTime(new Date());
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  return serviceDate <= thirtyDaysFromNow;
};

// Filtering the vehicles
const vehiclesDueForService = vehicles.filter(isServiceDue);

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.registration_number
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      vehicle.vehicle_model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || vehicle.vehicle_status === statusFilter;
    const matchesType =
      typeFilter === "all" || vehicle.service_type === typeFilter;

    let matchesTab = true;
    if (activeTab === "expiring") {
      matchesTab = isDocumentExpiring(vehicle);
    } else if (activeTab === "service-due") {
      matchesTab = isServiceDue(vehicle);
    }

    return matchesSearch && matchesStatus && matchesType && matchesTab;
  });

  const expiringCount = vehicles.filter(isDocumentExpiring).length;
  const serviceDueCount = vehicles.filter(isServiceDue).length;

  // Pagination calculations
  const totalItems = filteredVehicles.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, activeTab]);

  const handleEditVehicle = (vehicle: Vehicle) => {
    console.log('edit...', vehicle);
    //setShowEditDialog(true);
    //return;
    setSelectedVehicle(vehicle);
    setShowEditDialog(true);
  };

  const getStatusBadge = (status: Vehicle["vehicle_status"]) => {
    const variants = {
      active: "active",
      maintenance: "secondary",
      inactive: "outline",
    } as const;

    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {vehicle.registrationNumber}
              {isDocumentExpiring(vehicle) && (
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              )}
              {isServiceDue(vehicle) && (
                <Wrench className="h-4 w-4 text-red-500" />
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{vehicle.model}</p>
          </div>
          {getStatusBadge(vehicle.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Type:</span>
            <p className="font-medium capitalize">{vehicle.type}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Year:</span>
            <p className="font-medium">{vehicle.year}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Capacity:</span>
            <p className="font-medium">{vehicle.capacity}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Mileage:</span>
            <p className="font-medium">
              {vehicle.mileage?.toLocaleString()} km
            </p>
          </div>
        </div>

        {/* {vehicle.location && ( */}
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            {vehicle.location.address}
            {/* Hyderabad */}
          </div>
        {/* )} */}

        <div className="flex items-center justify-between text-sm">
          <div
            className={`flex items-center ${
              isServiceDue(vehicle) ? "text-red-600" : "text-muted-foreground"
            }`}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Next service: {vehicle.nextService}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Fuel className="h-4 w-4 mr-1" />
            {vehicle.fuelType}
           
             {/* Diesel */}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            View Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditVehicle(vehicle)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const VehicleTable = () => (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4 font-medium">Registration</th>
              
              {/* <th className="text-left p-4 font-medium">Assigned On</th> */}
              
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Model</th>
              <th className="text-left p-4 font-medium">Type</th>
              <th className="text-left p-4 font-medium">Year</th>
              {/* <th className="text-left p-4 font-medium">Fuel Type</th>
              {<th className="text-left p-4 font-medium">Capacity</th>}
              <th className="text-left p-4 font-medium">Location</th>
              <th className="text-left p-4 font-medium">Next Service</th>
              <th className="text-left p-4 font-medium">Mileage</th> */}
              <th className="text-left p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedVehicles.map((vehicle) => (
              <tr
                key={vehicle.vehicle_id}
                className="border-t hover:bg-muted/50"
              >
                <td className="p-4 font-medium flex items-center gap-2">
                  {vehicle.registration_number}
                  {/* {isDocumentExpiring(vehicle) && (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  )}
                  {isServiceDue(vehicle) && (
                    <Wrench className="h-4 w-4 text-red-500" />
                  )} */}
                </td>
                {/* <td className="p-4 capitalize">{vehicle.assigned_on}</td> */}
                <td className="p-4">
                  {getStatusBadge(vehicle.vehicle_status)}
                </td>
                <td className="p-4">
                  {vehicle.vehicle_model}
                </td>
                <td className="p-4">
                  {/* { findVehicleName(vehicleTypes, vehicle.vehicle_type_id) } */}
                  { vehicle.vehicle_type_name}
                </td>
                <td className="p-4">
                  {vehicle.manufacturing_year}
                </td>
                {/* <td className="p-4 capitalize">{vehicle.license_type}</td> */}
                {/* <td className="p-4">{vehicle.capacity}</td> */}
                {/* <td className="p-4">100 T</td> */}
                {/* <td className="p-4 text-sm">
                  {vehicle.location?.address || "Hyderabad"}
                </td>
                <td
                  className={`p-4 text-sm ${
                    isServiceDue(vehicle) ? "text-red-600 font-medium" : ""
                  }`}
                >
                  {vehicle.service_date}
                </td> */}
                {/* <td className="p-4">{vehicle.mileage?.toLocaleString() || "4"} km</td> */}
                <td className="p-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditVehicle(vehicle)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteVehicle(vehicle.vehicle_id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="text-muted-foreground text-lg">Loading vehicles...</div>
      </div>
    );
  } else {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Vehicle Management</h1>
          <p className="text-muted-foreground">
            Manage your fleet vehicles and track their status
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            {/* <TabsList>
              <TabsTrigger value="all">All Vehicles</TabsTrigger>
              <TabsTrigger value="expiring" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Expiring Documents
                {expiringCount > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {expiringCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="service-due"
                className="flex items-center gap-2"
              >
                <Wrench className="h-4 w-4" />
                Service Due
                {serviceDueCount > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {serviceDueCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList> */}

            <TabsContent value="all" className="space-y-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search vehicles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="Under Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {vehicleTypes?.map((type) => (
                      <SelectItem key={type.vehicle_type_id} value={type.vehicle_type}>
                        {type.vehicle_type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div> */}
              </div>

              {/* Pagination */}
              {filteredVehicles.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} vehicles
                    </span>
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={(value) => {
                        setItemsPerPage(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">per page</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNumber}
                            variant={currentPage === pageNumber ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNumber)}
                            className="w-10"
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedVehicles.map((vehicle) => (
                    <VehicleCard key={vehicle.vehicle_id} vehicle={vehicle} />
                  ))}
                </div>
              ) : (
                <VehicleTable />
              )}

              {filteredVehicles.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No vehicles found matching your criteria.
                </div>
              )}
            </TabsContent>

            <TabsContent value="expiring" className="space-y-6">
              <div className="flex items-center gap-2 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <h3 className="font-medium text-orange-800">
                    Documents Expiring Soon
                  </h3>
                  <p className="text-sm text-orange-600">
                    {expiringCount} vehicle
                    {expiringCount !== 1 ? "s have" : " has"} documents expiring
                    within 30 days
                  </p>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search expiring vehicles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Showing {filteredVehicles.length} vehicles with expiring
                documents
              </div>

              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVehicles.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </div>
              ) : (
                <VehicleTable />
              )}
            </TabsContent>

            <TabsContent value="service-due" className="space-y-6">
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <Wrench className="h-5 w-5 text-red-600" />
                <div>
                  <h3 className="font-medium text-red-800">Service Due Soon</h3>
                  <p className="text-sm text-red-600">
                    {serviceDueCount} vehicle
                    {serviceDueCount !== 1 ? "s have" : " has"} service due
                    within 30 days
                  </p>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search vehicles with service due..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Showing {filteredVehicles.length} vehicles with service due
              </div>

              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVehicles.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </div>
              ) : (
                <VehicleTable />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AddVehicleDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
        vt={vehicleTypes} 
        vm={vehicleModels} 
        docsType={vdocTypes}
        drivers={vDrivers}
      />

      <VehicleEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        vehicle={selectedVehicle}
        dataRefresh={dataRefresh}
        vt={vehicleTypes}
        vm={vehicleModels}
        docsType={vdocTypes}
        drivers={vDrivers}
      />
    </div>
  );}
};
