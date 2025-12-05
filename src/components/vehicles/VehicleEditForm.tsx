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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Plus, X } from "lucide-react";
import { Vehicle } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { vehicleModels, vehicleStatuses } from "@/customHooks/globalVars";
import { userModuleService } from "@/customHooks/useApi";

interface VehicleEditFormData {
  vehicle_id: number;
  vehicle_type_id: number;
  registration_number: string;
  manufacturing_year: string;
  vehicle_model: string;
  chasis_number: string;
  vehicle_status: string;
  document_type: string;
  engine_number: string;
  document_file: File | null;
  effective_date: string;
  expiration_date: string;
  driver_name: string;
  created_by: string;
  updated_by: string;
}

interface VehicleEditFormProps {
  vehicle: Vehicle;
  onSubmit: (data: VehicleEditFormData) => void;
  //onSubmit: (data: Omit<Vehicle, "vehicle_type_id">) => void;
  onCancel: () => void;
  vt: any[]; 
  vm: any[];
  docsType: any[];
  drivers: any[];
}

export const VehicleEditForm: React.FC<VehicleEditFormProps> = ({
  vehicle,
  onSubmit,
  onCancel,
  vt, 
  vm,
  docsType,
  drivers
}) => {
  const [formData, setFormData] = useState<VehicleEditFormData>({
    vehicle_id: vehicle?.vehicle_id || 0,
    vehicle_type_id: vehicle?.vehicle_type_id || 0,
    registration_number: vehicle?.registration_number || "",
    manufacturing_year: vehicle?.manufacturing_year || "",
    vehicle_model: vehicle?.vehicle_model || "",
    chasis_number: vehicle?.chasis_number || "",
    engine_number: vehicle?.engine_number || "",
    vehicle_status: vehicle?.vehicle_status || "active",
    document_type: vehicle?.document_file || "",
    document_file: null,
    effective_date: vehicle?.effective_date || "",
    expiration_date: vehicle?.expiration_date || "",
    driver_name: vehicle?.driver_name || "",
    created_by: 'Admin',
    updated_by: 'Admin'
  });

  const fuelTypes = ["diesel", "petrol", "electric", "hybrid"];
  const documentTypes = [
    "Registration Certificate",
    "Insurance Policy",
    "Fitness Certificate",
    "Permit",
    "Tax Receipt",
    "Pollution Certificate",
  ];
  const serviceTypes = [
    "Regular Maintenance",
    "Oil Change",
    "Brake Service",
    "Engine Repair",
    "Tire Replacement",
    "AC Service",
    "Body Work",
    "Electrical Work",
  ];
  const { toast } = useToast();

  const handleInputChange = (field: keyof VehicleEditFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // const handleDocumentChange = (index: number, field: string, value: any) => {
  //   const updatedDocuments = [...formData.documents];
  //   updatedDocuments[index] = { ...updatedDocuments[index], [field]: value };
  //   setFormData((prev) => ({ ...prev, documents: updatedDocuments }));
  // };

  // const handleServiceChange = (index: number, field: string, value: any) => {
  //   const updatedServices = [...formData.serviceDetails];
  //   updatedServices[index] = { ...updatedServices[index], [field]: value };
  //   setFormData((prev) => ({ ...prev, serviceDetails: updatedServices }));
  // };

  // const addDocument = () => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     documents: [
  //       ...prev.documents,
  //       {
  //         type: "",
  //         file: null,
  //         effectiveDate: "",
  //         expirationDate: "",
  //       },
  //     ],
  //   }));
  // };

  // const removeDocument = (index: number) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     documents: prev.documents.filter((_, i) => i !== index),
  //   }));
  // };

  // const addServiceDetail = () => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     serviceDetails: [
  //       ...prev.serviceDetails,
  //       {
  //         date: "",
  //         type: "",
  //         description: "",
  //         cost: "",
  //         nextServiceDate: "",
  //       },
  //     ],
  //   }));
  // };

  // const removeServiceDetail = (index: number) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     serviceDetails: prev.serviceDetails.filter((_, i) => i !== index),
  //   }));
  // };

  // const handleFileChange = (
  //   index: number,
  //   event: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   const file = event.target.files?.[0] || null;
  //   handleDocumentChange(index, "file", file);
  // };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] || null;
      setFormData((prev) => ({
        ...prev,
        document_file: file,
      }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('edit vehicleee....',formData);    
    const isData = await userModuleService('editvehicle', 'POST', formData);
    if(typeof isData.message != "undefined"){
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
      onSubmit(formData);
    } else {
      toast({
        title: isData[0].status,
        description: isData[0].message,
        variant: "destructive",
      });
    } 
    //onSubmit(formData);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList>
              <TabsTrigger value="basic">Basic Details</TabsTrigger>
              {/* <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="service">Service Details</TabsTrigger> */}
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
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
                    value={String(formData.vehicle_type_id)}
                    onValueChange={(value) =>
                      handleInputChange("vehicle_type_id", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="0" value="0">Select Vehicle Type</SelectItem>
                      {vt.map((type) => (
                        <SelectItem key={type['vehicle_type_id']} value={type['vehicle_type_id']}>
                          {type['vehicle_type']}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p>Current Selected: </p>
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
                      {vm.map((model) => (
                        <SelectItem key={model['vehicle_model']} value={model['vehicle_model']}>
                          {model['vehicle_model']}
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
                          <SelectItem key={d['document_type_id']} value={d['document_type_id']}>
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
            </TabsContent>

            {/* <TabsContent value="documents" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Vehicle Documents</h3>
                <Button type="button" onClick={addDocument} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Document
                </Button>
              </div>

              {formData.documents.map((doc, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Document {index + 1}</h4>
                    {formData.documents.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Document Type</Label>
                      <Select
                        value={doc.type}
                        onValueChange={(value) =>
                          handleDocumentChange(index, "type", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          {documentTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Upload Document</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          onChange={(e) => handleFileChange(index, e)}
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          className="flex-1"
                        />
                        <Upload className="h-4 w-4 text-muted-foreground" />
                      </div>
                      {doc.file && (
                        <p className="text-sm text-green-600">
                          Selected: {doc.file.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Effective Date</Label>
                      <Input
                        type="date"
                        value={doc.effectiveDate}
                        onChange={(e) =>
                          handleDocumentChange(
                            index,
                            "effectiveDate",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Expiration Date</Label>
                      <Input
                        type="date"
                        value={doc.expirationDate}
                        onChange={(e) =>
                          handleDocumentChange(
                            index,
                            "expirationDate",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="service" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Service Details</h3>
                <Button
                  type="button"
                  onClick={addServiceDetail}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service Record
                </Button>
              </div>

              {formData.serviceDetails.map((service, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Service Record {index + 1}</h4>
                    {formData.serviceDetails.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeServiceDetail(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Service Date</Label>
                      <Input
                        type="date"
                        value={String(formData.service_date) || "01/01/2020"}
                        onChange={(e) =>
                          handleServiceChange(index, "date", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Service Type</Label>
                      <Select
                        value={String(formData.service_type) || "Servicing"}
                        onValueChange={(value) =>
                          handleServiceChange(index, "type", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Description</Label>
                      <Input
                        value={String(formData.service_description)}
                        onChange={(e) =>
                          handleServiceChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Service description"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Cost</Label>
                      <Input
                        value={service.cost}
                        onChange={(e) =>
                          handleServiceChange(index, "cost", e.target.value)
                        }
                        placeholder="Service cost"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Next Service Date</Label>
                      <Input
                        type="date"
                        value={String(formData.service_date)}
                        onChange={(e) =>
                          handleServiceChange(
                            index,
                            "nextServiceDate",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent> */}
          </Tabs>

          <div className="flex justify-end space-x-4 pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Update Vehicle</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
