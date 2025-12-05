
export interface vehicle {
  id: string;
  regestration_number: string;
}

export interface User {
  emp_id: number;
  email_id: string;
  first_name: string;
  last_name: string;
  role_id: number;
  role_name: string;
  profile_picture_name: string;
  aadhaar_number?: string;
  phone_number?: string;
  joining_date?: string;
  chat_id?: string;
  documents?: string;
  document_url?: string;
  document_effective_date?: string;
  document_expiration_date?: string;
  effective_date?: string;
  expiration_date?: string;
  document_name_path?: string;
  created_by?: string;
  updated_by?: string;
  // Add aliases for compatibility
  emp_name?: string;
  emp_role?: string;
  emp_email?: string;
  profile_image?: string;
}

export interface Vehicle {
  filter(arg0: (vehicle: any) => boolean): unknown;
  id: string;
  registrationNumber: string;
  type: "truck" | "van" | "car" | "bus";
  model: string;
  year: number;
  status: "active" | "maintenance" | "inactive";
  fuelType: "diesel" | "petrol" | "electric" | "hybrid";
  capacity: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  lastService?: string;
  nextService?: string;
  mileage: number;
  assignedTo?: string;

  //db tables
  document_file:string;
  vehicle_id:number;
  vehicle_type_id:number;
  registration_number:string;
  manufacturing_year:string;
  vehicle_model:string;
  chasis_number:string;
  first_name:string;
  engine_number:string;
  last_name:string;
  phone_number:string;
  email_id:string;
  department_name:string;
  joining_date:string;
  license_number:string;
  license_type:string;
  assigned_on:string;
  vehicle_driver_id:string;
  vehicle_status:string;
  service_type:string;
  service_date:string;
  service_description:string;
  document_type:string;
  document_effective_date:string;
  effective_date:string;
  document_expiration_date:string;
  expiration_date:string;
  vehicle_type_name:string;
  driver_name:string;
}

export interface Assignment {
  id: string;
  title: string;
  vehicleId: string;
  driverId: string;
  status: "pending" | "active" | "completed" | "cancelled";
  startDate: string;
  endDate: string;
  route: {
    from: string;
    to: string;
    distance: number;
    estimatedDuration: string;
  };
  priority: "low" | "medium" | "high";
  progress: string;
  stages: AssignmentStage[];
  createdBy: string;
  createdAt: string;
}

export interface Assign2 {
  trip_id: number;
  vehicle_driver_id: number;
  stage_name: string;
  driver_name: string;
  stage_start_time: string;
  stage_travel_time: string;
  current_status: string;
  status:  "active";
  estimated_distance: string;
  estimated_travel_time: string;
  soucre: string;
  destination: string;
  Regestration_number: string;
  goods: string;
  model: string;
  priority: "low";
  progress: string;
  distance:string
  title?: string;
  stages?: [];
  createdAt?: string;
  createdBy?: string;
}

export interface AssignmentStage {
  id: string;
  name: string;
  status: "pending" | "in-progress" | "completed";
  startTime?: string;
  endTime?: string;
  location: string;
  notes?: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: "fuel" | "maintenance" | "insurance" | "other";
  status: "pending" | "approved" | "rejected";
  date: string;
  vehicleId?: string;
  receiptUrl?: string;
  submittedBy: string;
  approvedBy?: string;
  description: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  partNumber?: string;
  category: number;
  quantity: number;
  minStock: number;
  unit: string;
  location: string;
  lastUpdated: string;
  supplier?: number;
  cost: number;

   product_id : number;
    category_id : number;
    vendor_id : number;
    product_name : string;
    product_quantity: string;
    reorder_level: number;
    product_status : string;
    created_by: string;
    updated_by : string;
}

export interface InventoryProductItem {
  product_id: number;
  category_id: string;
  vendor_id: string;
  category: string;
  product_name: string;
  part_number: string;
  product_quantity: string;
  reorder_level: number;
  product_status: string;
  created_time: string;
  timestamp: string;
  updated_by: string;
  created_by: string;
  updated_time: number;
  category_name:string,
  usage_id:number,
  vehicle_id:number,
  registration_number:number,
  vehicle_model:string,
  vehicle_status:string,
  service_date:string,
  service_description:string,
  service_receipt_image:string,
  product_image_id:string,
  deleted_flag:string,
  unit?: string;
  Location?: string;
  vendor_company_name?: string;
}

export interface Approval {
  id: string;
  type: "expense" | "assignment" | "vehicle_maintenance";
  title: string;
  amount?: number;
  status: "pending" | "approved" | "rejected";
  priority: "low" | "medium" | "high";
  submittedBy: string;
  submittedAt: string;
  description: string;
  relatedId: string;
}
