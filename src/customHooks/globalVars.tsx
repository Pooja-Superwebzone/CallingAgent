

//import { fetchDataService } from "./useApi";

export const findVehicleName = (data, searchId) => {
  const row =  data.find((item) => item.vehicle_type_id == searchId);
  //console.log(row);
  return row.vehicle_type;
} 

export const vehicleModels = [
    "Ford Transit",
    "Mercedes Sprinter",
    "Volvo FH",
    "Scania R-Series",
    "Toyota Hiace",
    "Isuzu NPR",
    "Honda Civic",
    "Toyota Corolla",
];

export const documentTypes = [
  "Registration Certificate",
  "Insurance Policy",
  "Fitness Certificate",
  "Permit",
  "Tax Receipt",
  "Pollution Certificate",
];

export const vehicleStatuses = ["active", "maintenance", "inactive"];

export const drivers = [
    "John Smith",
    "Jane Doe",
    "Mike Johnson",
    "Sarah Wilson",
    "David Brown",
  ];