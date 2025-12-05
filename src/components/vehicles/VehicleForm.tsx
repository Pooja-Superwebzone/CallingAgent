import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Vehicle } from "@/types";
import { documentTypes, vehicleStatuses } from "@/customHooks/globalVars";
import { fetchDataService, userModuleService } from "@/customHooks/useApi";

interface VehicleFormData {
  vehicle_id: number;
  vehicle_type_id: number;
  vehicle_type: string;
  registration_number: string;
  manufacturing_year: string;
  vehicle_model: string;
  chasis_number: string;
  engine_number: string;
  vehicle_status: string;
  document_type: string;
  document_file: File | null;
  effective_date: string;
  expiration_date: string;
  driver_name: string;
  created_by: string;
  updated_by: string;
}

interface VehicleFormProps {
  onSubmit: (data: VehicleFormData) => void;
  onCancel: () => void;
  vt: any[];
  vm: any[];
  docsType: any[];
  drivers: any[];
}

export const VehicleForm: React.FC<VehicleFormProps> = ({
  onSubmit,
  onCancel,
  vt,
  vm,
  docsType,
  drivers
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<VehicleFormData>({
    vehicle_id: 0,
    vehicle_type_id: 0,
    vehicle_type: "",
    registration_number: "",
    manufacturing_year: "",
    vehicle_model: "",
    chasis_number: "",
    engine_number: "",
    vehicle_status: "active",
    document_type: "",
    document_file: null,
    effective_date: "",
    expiration_date: "",
    driver_name: "",
    created_by: 'Admin',
    updated_by: 'Admin',
  });
  

  const handleInputChange = (field: keyof VehicleFormData, value: any) => {
    if(field == 'vehicle_type_id'){
      console.log(vt, value);
      const rowData = vt.find((item)=>item.vehicle_type == value);
      value = rowData.vehicle_type_id;
      setFormData((prev) => ({
          ...prev,
          [field]: value,
      }));
      setFormData((prev) => ({
          ...prev,
          'vehicle_type': rowData.vehicle_type,
      }));
    }
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      document_file: file,
    }));
  };

  // const API_URL =
  //   "https://n8n.srv799538.hstgr.cloud/webhook/865ff5a1-5a1b-4953-98a2-9943ac985809";
  // const API_KEY =
  //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo";
  // const AUTH_KEY =
  //   "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo";

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);   
    const ep = "insertvehicle";
    const isData = await userModuleService(ep, 'POST', formData);
    console.log(isData);
    //return;
    if(typeof isData[0].status != "undefined" && isData[0].status == 'success'){
      toast({
        title: "Success",
        description: isData[0].message,
        variant: "success"
      });
      onSubmit(formData);
    } else {
      toast({
        title: 'Error',
        description: isData[0].message,
        variant: "destructive",
      });
    }  
    
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent>
        <form  onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vehicle ID */}
            {/* <div className="space-y-2">
              <Label htmlFor="vehicle_id">Vehicle ID</Label>
              <Input
                id="vehicle_id"
                value={formData.vehicle_id}
                onChange={(e) =>
                  handleInputChange("vehicle_id", e.target.value)
                }
                placeholder="Autogerated vehicle ID"
                disabled
              />
            </div> */}

            {/* Vehicle Type - Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="vehicle_type">Vehicle Type</Label>
              <Select
                value={String(formData.vehicle_type)}
                onValueChange={(value) =>
                  handleInputChange("vehicle_type_id", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="0" value="0">Select Vehicle Type </SelectItem>
                  {vt.map((type) => (
                    <SelectItem key={type['vehicle_type']} value={type['vehicle_type']}>
                      {type['vehicle_type']}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Registration Number */}
            <div className="space-y-2">
              <Label htmlFor="registration_number">Registration Number</Label>
              <Input
                id="registration_number"
                value={formData.registration_number}
                onChange={(e) =>
                  handleInputChange("registration_number", e.target.value)
                }
                placeholder="Enter registration number"
                required
              />
            </div>

            {/* Manufacturing Year */}
            <div className="space-y-2">
              <Label htmlFor="manufacturing_year">Manufacturing Year</Label>
              <Input
                id="manufacturing_year"
                type="number"
                value={formData.manufacturing_year}
                onChange={(e) =>
                  handleInputChange("manufacturing_year", e.target.value)
                }
                placeholder="Enter manufacturing year"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            {/* Vehicle Model - Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="vehicle_model">Vehicle Model</Label>
              <Select
                value={formData.vehicle_model}
                onValueChange={(value) =>
                  handleInputChange("vehicle_model", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle model" />
                </SelectTrigger>
                <SelectContent>
                  {vm.map((model: any) => (
                    <SelectItem key={model.vehicle_model} value={model.vehicle_model}>
                      {model.vehicle_model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Chassis Number */}
            <div className="space-y-2">
              <Label htmlFor="chasis_number">Chassis Number</Label>
              <Input
                id="chasis_number"
                value={formData.chasis_number}
                onChange={(e) =>
                  handleInputChange("chasis_number", e.target.value)
                }
                placeholder="Enter chassis number"
              />
            </div>

            {/* Engine Number */}
            <div className="space-y-2">
              <Label htmlFor="engine_number">Engine Number</Label>
              <Input
                id="engine_number"
                value={formData.engine_number}
                onChange={(e) =>
                  handleInputChange("engine_number", e.target.value)
                }
                placeholder="Enter engine number"
              />
            </div>

            {/* Vehicle Status - Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="vehicle_status">Vehicle Status</Label>
              <Select
                value={formData.vehicle_status}
                onValueChange={(value) =>
                  handleInputChange("vehicle_status", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle status" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Vehicle Document Type - Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="document_type">
                Vehicle Document Type
              </Label>
              <Select
                value={formData.document_type}
                onValueChange={(value) =>
                  handleInputChange("document_type", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {docsType.map((d) => (
                    <SelectItem key={d['document_name']} value={d['document_name']}>
                      {d['document_name']}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Driver Name - Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="driver_name">Driver Name</Label>
              <Select
                value={formData.driver_name}
                onValueChange={(value) =>
                  handleInputChange("driver_name", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select driver" />
                </SelectTrigger>
                <SelectContent>
                   {drivers.map((driver) => (
                      <SelectItem key={driver['emp_id']} value={driver['emp_id']}>
                        {driver['first_name']} {driver['last_name']}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Effective Date */}
            <div className="space-y-2">
              <Label htmlFor="effective_date">Effective Date</Label>
              <Input
                id="effective_date"
                type="date"
                value={formData.effective_date}
                onChange={(e) =>
                  handleInputChange("effective_date", e.target.value)
                }
              />
            </div>

            {/* Expiration Date */}
            <div className="space-y-2">
              <Label htmlFor="expiration_date">Expiration Date</Label>
              <Input
                id="expiration_date"
                type="date"
                value={formData.expiration_date}
                onChange={(e) =>
                  handleInputChange("expiration_date", e.target.value)
                }
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="document_upload">Upload Document</Label>
            <div className="flex items-center gap-4">
              <Input
                id="document_upload"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="flex-1"
              />
              <div className="flex items-center text-sm text-muted-foreground">
                <Upload className="h-4 w-4 mr-1" />
                {formData.document_file
                  ? formData.document_file.name
                  : "No file selected"}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 5MB)
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Add Vehicle</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
