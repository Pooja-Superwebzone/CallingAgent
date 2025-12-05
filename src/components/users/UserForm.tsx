import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchDataService, userModuleService } from "@/customHooks/useApi";
import { useToast } from "@/hooks/use-toast";

interface UserFormProps {
  user?: User;
  onSubmit: (userData: Omit<User, "emp_id">) => void;
  onCancel: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({
  user,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    emp_id:0,
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email_id: user?.email_id || "",
    role_id: user?.role_id || "",
    aadhaar_number: user?.aadhaar_number || "",
    phone_number: user?.phone_number || "",
    joining_date: user?.joining_date || "",
    updated_by: "admin",
    created_by: "admin",
    deleted_flag: false,
    documents: user?.documents || "",
    document_url: user?.document_url || "",
    document_effective_date: user?.document_effective_date || "",
    document_expiration_date: user?.document_expiration_date || ""
  });

  //profile_image: user?.profile_picture_name || "",
  // // chat_id: user?.chat_id || "",
  //   documents: user?.profile_picture_name || "License",
  //   document_effective_date: user?.effective_date || "",
  //   document_expiration_date: user?.expiration_date || "",
  //   document_url: user?.document_name_path || "",

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [rolemast, setrolemast] = useState([]);
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First Name is required";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last Name is required";
    }

    if (!formData.email_id.trim()) {
      newErrors.email_id = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_id)) {
      newErrors.email_id = "Please enter a valid email address";
    }

    if (!formData.role_id) {
      newErrors.role_id = "Role is required";
    }

    if (!formData.aadhaar_number.trim()) {
      newErrors.aadhaar_number = "Aadhaar number is required";
    } else if (!/^\d{12}$/.test(formData.aadhaar_number)) {
      newErrors.aadhaar_number = "Aadhaar number must be 12 digits";
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    } else if (!/^\+?[\d\s-()]{10,15}$/.test(formData.phone_number)) {
      newErrors.phone_number = "Please enter a valid phone number";
    }

    if (!formData.joining_date.trim()) {
      newErrors.joining_date = "Joining date is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const API_KEY =
  //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo";
  // const AUTH_KEY =
  //   "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo";
  const API_EP = "8abc4fa6-9b21-4637-9630-3e459e953f0b";

  const getRoles = async () => {
    const data = await fetchDataService(API_EP, 'GET');
    //console.log("Roles data:", data[0]);
    if(data[0].status == 'success' ){
      setrolemast(data[0].data);
    } else {
      toast({
          title: "Error",
          description: data[0].message,
          variant: "destructive",
      });
    }
  };
  useEffect(() => {
    getRoles();
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();    
    let ep = "8373b2b2-92b5-4a9d-b23a-e7c25f61fb8b"; // Insert user
    let method = "POST";
    formData.emp_id = 0;
    if(typeof user != "undefined"){
      ep = "07f4ab97-b62a-48e3-85e2-64585e610846"; // update user
      method = 'PATCH';
      formData.emp_id = user.emp_id;
    }
    //console.log(formData);
    //console.log(user);
    //return;
    if (validateForm()) {     
      //console.log('validated.....');
      const isData = await userModuleService(ep, method, formData);
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
        onSubmit(formData as unknown as Omit<User, "emp_id">);
      } else {
        toast({
          title: isData[0].status,
          description: isData[0].message,
          variant: "destructive",
        });
      }      
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (allowedTypes.includes(file.type)) {
        setUploadedFile(file);
        console.log("File uploaded:", file.name);
      } else {
        alert("Please upload a valid document file (PDF, DOC, DOCX, JPG, PNG)");
        e.target.value = "";
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-h-[80vh] overflow-y-auto"
    >
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
           {/* <div className="space-y-2">
            <Label htmlFor="emp_id">Employee ID</Label>
            <Input
              id="emp_id"
              value={formData.emp_id}
              onChange={(e) => handleChange("emp_id", e.target.value)}
              placeholder="EMployee ID" disabled
            />
            {errors.emp_name && (
              <p className="text-sm text-destructive">{errors.emp_name}</p>
            )}
          </div> */}

          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => handleChange("first_name", e.target.value)}
              placeholder="Enter full name"
            />
            {errors.first_name && (
              <p className="text-sm text-destructive">{errors.first_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => handleChange("last_name", e.target.value)}
              placeholder="Enter full name"
            />
            {errors.last_name && (
              <p className="text-sm text-destructive">{errors.last_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email_id">Email Address</Label>
            <Input
              id="email_id"
              type="email"
              value={formData.email_id}
              onChange={(e) => handleChange("email_id", e.target.value)}
              placeholder="Enter email address"
            />
            {errors.email_id && (
              <p className="text-sm text-destructive">{errors.email_id}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role_id">Role</Label>
            <Select
              value={String(formData.role_id)}
              onValueChange={(value) => handleChange("role_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {rolemast.map((role) => (
                  <SelectItem
                    key={role.role_id}
                    value={String(role.role_id)}
                  >
                    {role.role_id} {role.role_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="aadhaar_number">Aadhaar Number</Label>
            <Input
              id="aadhaar_number"
              value={formData.aadhaar_number}
              onChange={(e) => handleChange("aadhaar_number", e.target.value)}
              placeholder="Enter 12-digit Aadhaar number"
              maxLength={12}
            />
            {errors.aadhaar_number && (
              <p className="text-sm text-destructive">
                {errors.aadhaar_number}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              value={formData.phone_number}
              onChange={(e) => handleChange("phone_number", e.target.value)}
              placeholder="Enter phone number"
            />
            {errors.phone_number && (
              <p className="text-sm text-destructive">{errors.phone_number}</p>
            )}
          </div>
            <p>{formData.joining_date}</p>
          <div className="space-y-2">
            <Label htmlFor="joining_date">Joining Date</Label>
            <Input
              id="joining_date"
              type="date"
              value={formData.joining_date}
              onChange={(e) => handleChange("joining_date", e.target.value)}
            />
            {errors.joining_date && (
              <p className="text-sm text-destructive">{errors.joining_date}</p>
            )}
          </div>

          {/* {formData.emp_role === "Driver" && (
            <div className="space-y-2">
              <Label htmlFor="chat_id">Chat ID</Label>
              <Input
                id="chat_id"
                value={formData.chat_id}
                onChange={(e) => handleChange("chat_id", e.target.value)}
                placeholder="Enter chat ID"
              />
            </div>
          )} */}

          {/* <div className="space-y-2">
            <Label htmlFor="profile_image">Profile Image URL</Label>
            <Input
              id="profile_image"
              value={formData.profile_image}
              onChange={(e) => handleChange("profile_image", e.target.value)}
              placeholder="Enter profile image URL"
            />
          </div> */}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="documents">Document Type</Label>
                <Select
                  value={formData.documents}
                  onValueChange={(value) => handleChange("documents", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="License">License</SelectItem>
                    <SelectItem value="Passport">Passport</SelectItem>
                    <SelectItem value="ID Card">ID Card</SelectItem>
                    <SelectItem value="PAN Card">PAN Card</SelectItem>
                    <SelectItem value="Voter ID">Voter ID</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document_upload">Upload Document</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="document_upload"
                    type="file"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="flex-1"
                  />
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Upload className="w-4 h-4 mr-1" />
                    Upload
                  </div>
                </div>
                {(uploadedFile || formData.document_url) && (
                  <p className="text-sm text-green-600">
                    Current file:{" "}
                    {uploadedFile ? uploadedFile.name : formData.document_url}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="document_effective_date"
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Effective Date
                  </Label>
                  <Input
                    id="document_effective_date"
                    type="date"
                    value={formData.document_effective_date}
                    onChange={(e) =>
                      handleChange("document_effective_date", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="document_expiration_date"
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Expiration Date
                  </Label>
                  <Input
                    id="document_expiration_date"
                    type="date"
                    value={formData.document_expiration_date}
                    onChange={(e) =>
                      handleChange("document_expiration_date", e.target.value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{user ? "Update User" : "Create User"}</Button>
      </div>
    </form>
  );
};
