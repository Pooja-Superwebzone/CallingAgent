import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const assignInventorySchema = z.object({
  product_id: z.string().min(1, "Vehicle number is required"),
  vendor_id: z.string().min(1, "Vehicle number is required"),
  vehicle_id: z.string().min(1, "Vehicle number is required"),
  // product_name: z.string().min(1, "Vehicle number is required"),
  // part_number: z.string().min(1, "Part number is required"),

  product_quantity: z.number().min(1, "Vehicle number is required"),
  // reorder_level: z.number().min(1, "Vehicle number is required"),

  created_by: z.string().min(1, "Vehicle number is required"),
  updated_by: z.string().min(1, "Vehicle number is required"),

  // registration_number: z.string().min(1, "Vehicle number is required"),
  // inventoryItem: z.string().min(1, "Inventory item is required"),
  dateOfUse: z.string().min(1, "Date of use is required"),
  reasonNotes: z.string().min(1, "Reason/Notes is required"),
});

type AssignInventoryFormData = z.infer<typeof assignInventorySchema>;

interface AssignInventoryFormProps {
  onSubmit: (data: AssignInventoryFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo";
const AUTH_KEY =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo";

// Mock data - in a real app, these would come from your backend
const mockVehicles = [
  { id: "1", number: "VH-001" },
  { id: "2", number: "VH-002" },
  { id: "3", number: "VH-003" },
  { id: "4", number: "TRK-001" },
  { id: "5", number: "TRK-002" },
];

const mockInventoryItems = [
  { id: "1", name: "Engine Oil Filter" },
  { id: "2", name: "Brake Pads" },
  { id: "3", name: "Air Filter" },
  { id: "4", name: "Spark Plugs" },
  { id: "5", name: "Transmission Fluid" },
];

const mockPartNumbers = [
  { id: "1", number: "PN-001" },
  { id: "2", number: "PN-002" },
  { id: "3", number: "PN-003" },
  { id: "4", number: "PN-004" },
  { id: "5", number: "PN-005" },
];

export const AssignInventoryForm: React.FC<AssignInventoryFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const form = useForm<AssignInventoryFormData>({
    resolver: zodResolver(assignInventorySchema),
    defaultValues: {
      // registration_number: "",
      // inventoryItem: "",
      vendor_id: '0',
      dateOfUse: "",
      reasonNotes: "",

      product_id: '0',
      // category_id: "10",
      vehicle_id: '0',
      // product_name: "",
      product_quantity: 0,
      // reorder_level: 0,
      created_by: "Admin",
      updated_by: "Admin",
    },
  });

  const [vehicles, setVehicles] = useState([]);
  const [vehicleNumber, setvehicleNumber] = useState([]);
  const [inventry, setinventry] = useState([]);
  const [partnum, setpartnum] = useState([]);

  const fetchData = async () => {
    try {
      const fallbackUrl =
        "https://n8n.srv799538.hstgr.cloud/webhook/5397517f-8d9a-493f-9365-ad74381b20b2";

      const response = await fetch(fallbackUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          apikey: API_KEY,
          Authorization: AUTH_KEY,
          "Content-Profile": "srtms",
          jwt_token: "9082c5f9b14d12773ec0ead79742d239cec142c3",
          session_id: "1",
        },
      });

      const data = await response.json();
      console.log("Fetched vehicle data:", data);
      if (Array.isArray(data)) {
        setVehicles(data);
      }
    } catch (error) {
      console.error("Error fetching vehicle data:", error);
    }
  };

   const fetchDatavehiclenumber = async () => {
    try {
      const fallbackUrl =
        "https://n8n.srv799538.hstgr.cloud/webhook/b141c63a-5dde-4f75-925a-79af5ed5180d";

      const response = await fetch(fallbackUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          apikey: API_KEY,
          Authorization: AUTH_KEY,
          "Content-Profile": "srtms",
          jwt_token: "9082c5f9b14d12773ec0ead79742d239cec142c3",
          session_id: "1",
        },
      });

      const data = await response.json();
      console.log("Fetched vehicle data:", data);
      if (Array.isArray(data)) {
        setvehicleNumber(data);
      }
    } catch (error) {
      console.error("Error fetching vehicle data:", error);
    }
  };

    const fetchDataInventry = async () => {
    try {
      const fallbackUrl =
        "https://n8n.srv799538.hstgr.cloud/webhook/e69a0b74-7a9a-4e8b-aa7d-4d55f003df3d";

      const response = await fetch(fallbackUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          apikey: API_KEY,
          Authorization: AUTH_KEY,
          "Content-Profile": "srtms",
          jwt_token: "9082c5f9b14d12773ec0ead79742d239cec142c3",
          session_id: "1",
        },
      });

      const data = await response.json();
      console.log("Fetched vehicle data:", data);
      if (Array.isArray(data)) {
        setinventry(data);
      }
    } catch (error) {
      console.error("Error fetching vehicle data:", error);
    }
  };

    const fetchDataPartnumber = async () => {
    try {
      const fallbackUrl =
        "https://n8n.srv799538.hstgr.cloud/webhook/d44fd63e-7d6c-4113-aed6-ead375cf9588";

      const response = await fetch(fallbackUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          apikey: API_KEY,
          Authorization: AUTH_KEY,
          "Content-Profile": "srtms",
          jwt_token: "9082c5f9b14d12773ec0ead79742d239cec142c3",
          session_id: "1",
        },
      });

      const data = await response.json();
      console.log("Fetched vehicle data:", data);
      if (Array.isArray(data)) {
        setpartnum(data);
      }
    } catch (error) {
      console.error("Error fetching vehicle data:", error);
    }
  };
  // console.log(vehicles);

  const filteredItems = vehicles.filter(
    (item) =>
      typeof item.vehicle_id === "number" &&
      typeof item.registration_number === "string"
  );

   const filteredvehicleNumberItems = partnum.filter(
    (item) =>
      typeof item.product_id === "number" &&
      typeof item.part_number === "string"
  );
  // console.log(filteredItems);

  useEffect(() => {
    fetchData();
    fetchDatavehiclenumber();
    fetchDataInventry();
    fetchDataPartnumber();
  }, []);

  const handleSubmit = async (data: AssignInventoryFormData) => {
    try {
      const response = await fetch(
        "https://n8n.srv799538.hstgr.cloud/webhook/product_usage_master",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: API_KEY,
            Authorization: AUTH_KEY,
            "Content-Profile": "srtms",
            jwt_token: "9082c5f9b14d12773ec0ead79742d239cec142c3",
            session_id: "1",
          },
          body: JSON.stringify(data),
        }
      );
      // console.log(response);

      if (!response.ok) throw new Error("Failed to submit assignment");
      // toast({
      //  "Assignment Updated" : "Assignment Created",
      //   description: `Assignment "${data.part_number}" has been ${
      //     data.vendor_id ? "updated" : "created"
      //   } successfully.`,
      // });
    } catch (error) {
      console.error("Submit error:", error);
      // toast({
      //   // title: "Submission Failed",
      //   description: "There was an error submitting the assignment.",
      //   variant: "destructive",
      // });
    }

    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="vehicle_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vehicle Number</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle number" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {vehicleNumber.map((vehicle) => (
                    <SelectItem key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                     {vehicle.vehicle_id}  {vehicle.registration_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="product_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inventory Item</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select inventory item" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {inventry.map((item) => (
                    <SelectItem key={item.product_id} value={item.product_id}>
                      {item.product_id}  {item.product_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vendor_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Part Number</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select part number" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredvehicleNumberItems.map((part) => (
                    <SelectItem key={part.product_id} value={part.part_number}>
                     {part.vendor_id} {part.part_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="product_quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  placeholder="Enter quantity"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateOfUse"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Use</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reasonNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason/Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter reason or notes for assignment" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Assigning...' : 'Assign Inventory'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
