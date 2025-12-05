import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Assign2, Assignment } from "@/types";
import { mockVehicles } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  trip_id: z.string().optional(),
  vehicle_driver_id: z.number().min(1, "Driver ID is required"),
  driver_name: z.string().optional(),
  current_status: z.string().min(1, "Current status is required"),
  priority: z.enum(["low", "medium", "high"]),
  stage_start_time: z.string().min(1, "Start date is required"),
  stage_end_time: z.string().min(1, "End date is required"),
  origin: z.string().min(1, "Route from is required"),
  destination: z.string().min(1, "Route to is required"),
  distance: z.string().min(1, "Distance is required"),
  stage_travel_time: z.string().min(1, "Estimated duration is required"),
  estimated_distance: z.string().optional(),

  // Optional fields
  route_detail_id: z.number().optional(),
  stage_name: z.string().optional(),
  assignment_version: z.number().optional(),
  created_by: z.string().optional(),
  created_time: z.string().optional(),
  updated_by: z.string().optional(),
  updated_time: z.string().optional(),
  deleted_flag: z.boolean().optional(),
  goods_type: z.string().optional(),
  total_amount: z.number().optional(),
  advance_amount: z.number().optional(),
  log_sheet_id: z.string().optional(),
  user_id: z.string().optional(),
  username: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AssignmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment?: Assign2;
  onSubmit: (data: Assign2) => void;
}

export const AssignmentForm: React.FC<AssignmentFormProps> = ({
  open,
  onOpenChange,
  assignment,
  onSubmit,
}) => {

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicle_driver_id: assignment?.vehicle_driver_id || 0,
      // driver_name: assignment?.driver_name || "",
      current_status: assignment?.current_status || "",
      // priority: assignment?.priority || "medium",
      stage_start_time: assignment?.stage_start_time?.split("T")[0] || "",
      stage_end_time: assignment?.stage_end_time?.split("T")[0] || "",
      origin: assignment?.origin || "",
      destination: assignment?.destination || "",
      // distance: assignment?.distance?.toString() || "",
      stage_travel_time: assignment?.stage_end_time || "",
      estimated_distance: assignment?.estimated_distance || "434 KM",
      stage_name: assignment?.stage_name || "Loading Dock A",
      assignment_version: 1,
      created_by: "admin",
      created_time: new Date().toISOString(),
      updated_by: "admin_user",
      updated_time: new Date().toISOString(),
      deleted_flag: false,
      goods_type: assignment?.goods_type || "Electronics",
      total_amount: assignment?.total_amount || 15000.5,
      advance_amount: assignment?.advance_amount || 5000,
      log_sheet_id: assignment?.log_sheet_id || "fc77ba20-6dd4-4f52-881e-097175c3780dd",
      user_id: assignment?.user_id || "11",
      username: assignment?.username || "Admin",
    },
  });

  // Auto-populate driver and route details when vehicle is selected
  const selectedVehicleId = form.watch("vehicle_id");
  const routeFrom = form.watch("origin");
  const routeTo = form.watch("destination");
  const driver_name = form.watch("driver_name");

  const [vehicles, setVehicles] = useState([]);
  const API_URL =
    "https://n8n.srv799538.hstgr.cloud/webhook/865ff5a1-5a1b-4953-98a2-9943ac985809";
  const API_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo";
  const AUTH_KEY =
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo";

  const fetchData = async () => {
    if (selectedVehicleId === undefined || selectedVehicleId === "undefined") {
      try {
        const fallbackUrl =
          "https://n8n.srv799538.hstgr.cloud/webhook/586caf97-2a5c-4d3e-97be-9f2cfc8b5794";

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
        console.log("Fallback data:", data);

        if (Array.isArray(data)) {
          setVehicles(data);
        }
      } catch (error) {
        console.error("Error fetching fallback vehicle list:", error);
      }
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await fetch(
        "https://n8n.srv799538.hstgr.cloud/webhook/vehiclemanagement",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            apikey: API_KEY,
            Authorization: AUTH_KEY,
            jwt_token: "9082c5f9b14d12773ec0ead79742d239cec142c3",
            session_id: "1",
          },
        }
      );

      const json = await response.json();
      const result = Array.isArray(json) ? json[0] : json;

      if (result?.status === "success" && Array.isArray(result.data)) {
        setVehicles(result.data);
      } else {
        console.error("Invalid vehicle API response", result);
      }
    } catch (error) {
      console.error("Failed to fetch vehicles", error);
    }

  };



  useEffect(() => {
    const from = form.watch("origin");
    const to = form.watch("destination");

    if (from && to) {
      const simulatedDistance = Math.floor(Math.random() * 500) + 50;
      const simulatedDuration = `${Math.floor(simulatedDistance / 60)}h ${simulatedDistance % 60
        }m`;

      form.setValue("distance", simulatedDistance.toString());
      form.setValue("estimated_distance", `${simulatedDistance} KM`);
      form.setValue("stage_travel_time", simulatedDuration);
    }
  }, [form.watch("origin"), form.watch("destination")]);

  const handleCreate = async (data: FormData) => {
    const payload = { ...data };
    delete payload.trip_id;
    delete payload.vehicle_id;
    delete payload.distance;
    delete payload.priority;
    delete payload.stage_travel_time;
    delete payload.log_sheet_id;

    try {
      const response = await fetch("https://n8n.srv799538.hstgr.cloud/webhook/inserttripassignmnt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: API_KEY,
          Authorization: AUTH_KEY,
          jwt_token: "9082c5f9b14d12773ec0ead79742d239cec142c3",
          session_id: "1",
          "Accept-Profile": "srtms",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Create failed");

      onSubmit(payload);
      toast({ title: "Assignment Created" });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Create error", error);
      toast({
        title: "Creation Failed",
        description: "Could not create the assignment.",
        variant: "destructive",
      });
    }
  };


  const handleUpdate = async (data: FormData) => {
    const payload = { ...data };
    delete payload.distance;
    delete payload.priority;
    delete payload.stage_travel_time;
    delete payload.log_sheet_id;

    try {
      const response = await fetch("https://n8n.srv799538.hstgr.cloud/webhook/updatetripassigned", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: API_KEY,
          Authorization: AUTH_KEY,
          jwt_token: "9082c5f9b14d12773ec0ead79742d239cec142c3",
          session_id: "1",
          "Accept-Profile": "srtms",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Update failed");

      onSubmit(payload);
      toast({ title: "Assignment Updated" });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Update error", error);
      toast({
        title: "Update Failed",
        description: "Could not update the assignment.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (data: FormData) => {
    if (assignment) {
      await handleUpdate({ ...data, trip_id: assignment.trip_id });
    } else {
      await handleCreate(data);
    }
  };



  // Add a function to fetch assignment data for a selected vehicle
  const fetchAssignmentDataForVehicle = async (vehicleId: string) => {
    try {
      const response = await fetch(
        `https://n8n.srv799538.hstgr.cloud/webhook/865ff5a1-5a1b-4953-98a2-9943ac985809?trip_id=${vehicleId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            apikey: API_KEY,
            Authorization: AUTH_KEY,
            jwt_token: "9082c5f9b14d12773ec0ead79742d239cec142c3",
            session_id: "1",
          },
        }
      );
      const data = await response.json();
      // Handle new nested structure: data[0].data[0].body[0]
      let assignment;
      if (
        Array.isArray(data) &&
        data[0]?.status === "success" &&
        Array.isArray(data[0].data) &&
        data[0].data.length > 0 &&
        Array.isArray(data[0].data[0].body) &&
        data[0].data[0].body.length > 0
      ) {
        assignment = data[0].data[0].body[0];
      } else if (
        Array.isArray(data) &&
        data[0]?.status === "success" &&
        data[0].data?.length > 0
      ) {
        // fallback to previous structure
        assignment = data[0].data[0];
      }
      if (assignment) {
        form.setValue("vehicle_id", assignment.trip_id?.toString() || "");
        form.setValue("vehicle_driver_id", assignment.vehicle_driver_id || 0);
        form.setValue("driver_name", assignment.driver_name || "");
        form.setValue("current_status", assignment.current_status || "");
        form.setValue("priority", assignment.priority || "medium");
        form.setValue("stage_start_time", assignment.stage_start_time?.split("T")[0] || "");
        form.setValue("stage_end_time", assignment.stage_end_time?.split("T")[0] || "");
        form.setValue("origin", assignment.origin || "");
        form.setValue("destination", assignment.destination || "");
        form.setValue("distance", assignment.estimated_distance?.replace(" km", "") || "");
        form.setValue("stage_travel_time", assignment.stage_end_time || "");
        // Add any other fields as needed
      }
    } catch (error) {
      console.error("Failed to fetch assignment data for vehicle", error);
    }
  };

  // Call the API to fetch assignment data when editing (when dialog opens with assignment)
  React.useEffect(() => {
    if (open && assignment && assignment.trip_id) {
      fetchAssignmentDataForVehicle(assignment.trip_id.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, assignment]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {assignment ? "Edit Assignment" : "Create New Assignment"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="trip_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Vehicle</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);

                        const selectedVehicle = vehicles.find(
                          (v) => v.vehicle_id?.toString() === value
                        );

                        if (selectedVehicle) {
                          form.setValue("vehicle_driver_id", selectedVehicle.driver_id || 0);
                          form.setValue("driver_name", selectedVehicle.driver_name || "");
                        }

                      }}
                      onOpenChange={(isOpen) => {
                        if (isOpen && vehicles.length === 0) {
                          fetchVehicles();
                        }
                      }}
                    >



                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a vehicle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vehicles.map((v, index) => {
                          if (!v || typeof v.vehicle_id === "undefined") return null;

                          const id = v.vehicle_id.toString();
                          const reg = v.registration_number || "Unknown Reg.";
                          const model = v.vehicle_model || "Unknown Model";
                          const type = v.vehicle_type_name || "Unknown Type";
                          const driver = v.driver_name || "No Driver";

                          return (
                            <SelectItem key={id} value={id}>
                              {`${reg} - ${model} - ${type} - ${driver}`}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>


                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />



              <FormField
                control={form.control}
                name="vehicle_driver_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Driver ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Driver ID will auto-populate"
                        {...field}
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="driver_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Driver Name (Optional Override)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter driver name to override"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="current_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="deactive">Deactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stage_start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stage_end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="origin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Route From</FormLabel>
                      <FormControl>
                        <Input placeholder="Starting location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Route To</FormLabel>
                      <FormControl>
                        <Input placeholder="Destination" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="distance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distance (km) - Auto-populated</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Auto-calculated"
                          {...field}
                          readOnly
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stage_travel_time"
                  render={({ field }) => {
                    const rawValue = field.value;
                    var displayValue = rawValue;

                    if (!isNaN(Number(rawValue))) {
                      const minutes = Number(rawValue);
                      const hours = Math.floor(minutes / 60);
                      const remainingMinutes = minutes % 60;
                      displayValue = `${hours}h ${remainingMinutes}m`;
                    }

                    return (
                      <FormItem>
                        <FormLabel>Estimated Duration - Auto-populated</FormLabel>
                        <FormControl>
                          <Input
                            value={displayValue}
                            readOnly
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>


              <FormField
                control={form.control}
                name="goods_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goods Transported</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the goods being transported"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {assignment ? "Update Assignment" : "Create Assignment"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
