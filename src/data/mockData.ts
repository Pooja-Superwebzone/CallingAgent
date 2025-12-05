
import { Vehicle, Assignment, Expense, InventoryItem, Approval } from '@/types';

export const mockVehicles: any[] = [
  {
    id: 'v1',
    registrationNumber: 'TN01AB1234',
    type: 'truck',
    model: 'Tata LPT 1613',
    year: 2022,
    status: 'active',
    fuelType: 'diesel',
    capacity: '7.5 tons',
    location: {
      lat: 13.0827,
      lng: 80.2707,
      address: 'Chennai, Tamil Nadu'
    },
    lastService: '2024-05-15',
    nextService: '2024-08-15',
    mileage: 45000,
    assignedTo: 'driver1'
  },
  {
    id: 'v2',
    registrationNumber: 'TN02CD5678',
    type: 'van',
    model: 'Mahindra Bolero Pickup',
    year: 2023,
    status: 'maintenance',
    fuelType: 'diesel',
    capacity: '1.5 tons',
    location: {
      lat: 19.0760,
      lng: 72.8777,
      address: 'Mumbai, Maharashtra'
    },
    lastService: '2024-06-01',
    nextService: '2024-09-01',
    mileage: 25000
  },
  {
    id: 'v3',
    registrationNumber: 'TN03EF9012',
    type: 'car',
    model: 'Maruti Swift Dzire',
    year: 2021,
    status: 'active',
    fuelType: 'petrol',
    capacity: '4 passengers',
    location: {
      lat: 12.9716,
      lng: 77.5946,
      address: 'Bangalore, Karnataka'
    },
    lastService: '2024-04-20',
    nextService: '2024-07-20',
    mileage: 35000,
    assignedTo: 'driver2'
  },
  {
    id: 'v4',
    registrationNumber: 'DL01GH3456',
    type: 'truck',
    model: 'Ashok Leyland Dost',
    year: 2020,
    status: 'active',
    fuelType: 'diesel',
    capacity: '1.25 tons',
    location: {
      lat: 28.7041,
      lng: 77.1025,
      address: 'Delhi, NCR'
    },
    lastService: '2024-03-10',
    nextService: '2024-06-10',
    mileage: 55000,
    assignedTo: 'driver3'
  },
  {
    id: 'v5',
    registrationNumber: 'GJ01IJ7890',
    type: 'van',
    model: 'Tata Ace',
    year: 2022,
    status: 'inactive',
    fuelType: 'diesel',
    capacity: '1 ton',
    location: {
      lat: 23.0225,
      lng: 72.5714,
      address: 'Ahmedabad, Gujarat'
    },
    lastService: '2024-05-20',
    nextService: '2024-08-20',
    mileage: 30000
  },
  {
    id: 'v6',
    registrationNumber: 'MH01KL2345',
    type: 'car',
    model: 'Honda City',
    year: 2023,
    status: 'active',
    fuelType: 'petrol',
    capacity: '5 passengers',
    location: {
      lat: 18.5204,
      lng: 73.8567,
      address: 'Pune, Maharashtra'
    },
    lastService: '2024-04-15',
    nextService: '2024-07-15',
    mileage: 20000,
    assignedTo: 'driver4'
  },
  {
    id: 'v7',
    registrationNumber: 'TS01MN6789',
    type: 'truck',
    model: 'BharatBenz 1617R',
    year: 2021,
    status: 'active',
    fuelType: 'diesel',
    capacity: '16 tons',
    location: {
      lat: 17.3850,
      lng: 78.4867,
      address: 'Hyderabad, Telangana'
    },
    lastService: '2024-05-10',
    nextService: '2024-08-10',
    mileage: 65000,
    assignedTo: 'driver5'
  },
  {
    id: 'v8',
    registrationNumber: 'WB01OP0123',
    type: 'van',
    model: 'Force Traveller',
    year: 2022,
    status: 'active',
    fuelType: 'diesel',
    capacity: '13 passengers',
    location: {
      lat: 22.5726,
      lng: 88.3639,
      address: 'Kolkata, West Bengal'
    },
    lastService: '2024-04-25',
    nextService: '2024-07-25',
    mileage: 28000,
    assignedTo: 'driver6'
  },
  {
    id: 'v9',
    registrationNumber: 'RJ01QR4567',
    type: 'car',
    model: 'Hyundai i20',
    year: 2023,
    status: 'maintenance',
    fuelType: 'petrol',
    capacity: '5 passengers',
    location: {
      lat: 26.9124,
      lng: 75.7873,
      address: 'Jaipur, Rajasthan'
    },
    lastService: '2024-06-05',
    nextService: '2024-09-05',
    mileage: 15000
  }
];

export const mockAssignments: Assignment[] = [
  {
    id: 'a1',
    title: 'Delhi to Mumbai Freight',
    vehicleId: 'v1',
    driverId: 'driver1',
    status: 'active',
    startDate: '2024-06-10T06:00:00Z',
    endDate: '2024-06-12T18:00:00Z',
    route: {
      from: 'Delhi',
      to: 'Mumbai',
      distance: 1400,
      estimatedDuration: '24 hours'
    },
    priority: 'high',
    progress: '35',
    stages: [
      {
        id: 's1',
        name: 'Loading at Delhi',
        status: 'completed',
        startTime: '2024-06-10T06:00:00Z',
        endTime: '2024-06-10T08:00:00Z',
        location: 'Delhi Warehouse'
      },
      {
        id: 's2',
        name: 'Transit to Jaipur',
        status: 'completed',
        startTime: '2024-06-10T08:00:00Z',
        endTime: '2024-06-10T14:00:00Z',
        location: 'Jaipur Rest Stop'
      },
      {
        id: 's3',
        name: 'Transit to Ahmedabad',
        status: 'in-progress',
        startTime: '2024-06-10T15:00:00Z',
        location: 'En route to Ahmedabad'
      },
      {
        id: 's4',
        name: 'Unloading at Mumbai',
        status: 'pending',
        location: 'Mumbai Warehouse'
      }
    ],
    createdBy: 'manager1',
    createdAt: '2024-06-08T10:00:00Z'
  },
  {
    id: 'a2',
    title: 'Bangalore City Delivery',
    vehicleId: 'v3',
    driverId: 'driver2',
    status: 'completed',
    startDate: '2024-06-09T09:00:00Z',
    endDate: '2024-06-09T17:00:00Z',
    route: {
      from: 'Bangalore Warehouse',
      to: 'Multiple City Locations',
      distance: 150,
      estimatedDuration: '8 hours'
    },
    priority: 'medium',
    progress: "100",
    stages: [
      {
        id: 's5',
        name: 'Loading at Warehouse',
        status: 'completed',
        startTime: '2024-06-09T09:00:00Z',
        endTime: '2024-06-09T10:00:00Z',
        location: 'Bangalore Warehouse'
      },
      {
        id: 's6',
        name: 'Delivery Complete',
        status: 'completed',
        startTime: '2024-06-09T10:00:00Z',
        endTime: '2024-06-09T17:00:00Z',
        location: 'Various locations'
      }
    ],
    createdBy: 'manager1',
    createdAt: '2024-06-08T14:00:00Z'
  }
];

export const mockExpenses: Expense[] = [
  {
    id: 'e1',
    title: 'Fuel - Delhi Trip',
    amount: 8500,
    category: 'fuel',
    status: 'approved',
    date: '2024-06-10',
    vehicleId: 'v1',
    submittedBy: 'driver1',
    approvedBy: 'manager1',
    description: 'Fuel expense for Delhi to Mumbai freight assignment'
  },
  {
    id: 'e2',
    title: 'Vehicle Maintenance',
    amount: 12000,
    category: 'maintenance',
    status: 'pending',
    date: '2024-06-09',
    vehicleId: 'v2',
    submittedBy: 'driver3',
    description: 'Brake pad replacement and engine service'
  },
  {
    id: 'e3',
    title: 'Insurance Premium',
    amount: 25000,
    category: 'insurance',
    status: 'approved',
    date: '2024-06-08',
    submittedBy: 'manager1',
    approvedBy: 'owner1',
    description: 'Annual insurance premium for vehicle fleet'
  }
];

export const mockInventory: InventoryItem[] = [
  {
    id: 'i1',
    name: 'Engine Oil - 20W40',
    category: 1,
    quantity: 25,
    minStock: 10,
    unit: 'liters',
    location: 'Main Warehouse',
    lastUpdated: '2024-06-08T10:00:00Z',
    supplier: 1,
    cost: 450,
    product_id: 1,
    category_id: 1,
    vendor_id: 1,
    product_name: 'Engine Oil - 20W40',
    product_quantity: '25',
    reorder_level: 10,
    product_status: 'active',
    created_by: 'admin',
    updated_by: 'admin'
  },
  {
    id: 'i2',
    name: 'Brake Pads',
    category: 2,
    quantity: 8,
    minStock: 15,
    unit: 'sets',
    location: 'Service Center',
    lastUpdated: '2024-06-07T15:30:00Z',
    supplier: 2,
    cost: 2500,
    product_id: 2,
    category_id: 2,
    vendor_id: 2,
    product_name: 'Brake Pads',
    product_quantity: '8',
    reorder_level: 15,
    product_status: 'active',
    created_by: 'admin',
    updated_by: 'admin'
  },
  {
    id: 'i3',
    name: 'Diesel Fuel',
    category: 3,
    quantity: 500,
    minStock: 200,
    unit: 'liters',
    location: 'Fuel Station',
    lastUpdated: '2024-06-10T08:00:00Z',
    supplier: 3,
    cost: 85,
    product_id: 3,
    category_id: 3,
    vendor_id: 3,
    product_name: 'Diesel Fuel',
    product_quantity: '500',
    reorder_level: 200,
    product_status: 'active',
    created_by: 'admin',
    updated_by: 'admin'
  }
];

export const mockApprovals: Approval[] = [
  {
    id: 'ap1',
    type: 'expense',
    title: 'Vehicle Maintenance - TN02CD5678',
    amount: 12000,
    status: 'pending',
    priority: 'medium',
    submittedBy: 'driver3',
    submittedAt: '2024-06-09T14:30:00Z',
    description: 'Brake pad replacement and engine service for van',
    relatedId: 'e2'
  },
  {
    id: 'ap2',
    type: 'assignment',
    title: 'Emergency Delivery to Pune',
    status: 'pending',
    priority: 'high',
    submittedBy: 'manager1',
    submittedAt: '2024-06-10T11:00:00Z',
    description: 'Urgent medical supplies delivery',
    relatedId: 'a3'
  },
  {
    id: 'ap3',
    type: 'vehicle_maintenance',
    title: 'Scheduled Service - TN01AB1234',
    amount: 15000,
    status: 'pending',
    priority: 'low',
    submittedBy: 'incharge1',
    submittedAt: '2024-06-08T16:45:00Z',
    description: 'Quarterly maintenance service',
    relatedId: 'v1'
  }
];

export const mockDrivers = [
  { id: 'd1', name: 'Ravi Kumar' },
  { id: 'd2', name: 'Sunil Sharma' },
  { id: 'd3', name: 'Amit Singh' },
  { id: 'd4', name: 'Priya Patel' },
];

export const mockLogSheets = [
  { id: 'ls1', description: 'Log Sheet 1 - Mumbai Route', date: '2024-06-01', driverId: 'd1' },
  { id: 'ls2', description: 'Log Sheet 2 - Pune Route', date: '2024-06-02', driverId: 'd2' },
  { id: 'ls3', description: 'Log Sheet 3 - Delhi Route', date: '2024-06-03', driverId: 'd3' },
  { id: 'ls4', description: 'Log Sheet 4 - Bangalore Route', date: '2024-06-04', driverId: 'd4' },
];

export const mockDriverPayments = [
  { id: 'p1', driverId: 'd1', driverName: 'Ravi Kumar', logSheetId: 'ls1', amount: 3500, date: '2024-06-05', status: 'Paid', notes: 'On time' },
  { id: 'p2', driverId: 'd2', driverName: 'Sunil Sharma', logSheetId: 'ls2', amount: 3200, date: '2024-06-06', status: 'Pending', notes: 'Awaiting approval' },
  { id: 'p3', driverId: 'd3', driverName: 'Amit Singh', logSheetId: 'ls3', amount: 4000, date: '2024-06-07', status: 'Paid', notes: 'Bonus included' },
  { id: 'p4', driverId: 'd4', driverName: 'Priya Patel', logSheetId: 'ls4', amount: 3100, date: '2024-06-08', status: 'Paid', notes: 'Late submission' },
];
