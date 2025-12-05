import React from "react";
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

const vendorSchema = z.object({
  id: z.number().min(1, "Vendor number is required"),
  category_name: z.string().min(1, "Vendor name is required"),
  phone_number: z.string().min(1, "Contact number is required"),
  email_id: z.string().email("Valid email address is required"),
  created_by: z.string().min(1, "Address is required"),
  contact_person_name: z.string().min(1, "Materials/Products is required"),
  updated_by: z.string().min(1, "Materials/Products is required"),
});

type VendorFormData = z.infer<typeof vendorSchema>;

interface VendorFormProps {
  onSubmit: (data: VendorFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const VendorForm: React.FC<VendorFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const form = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      id: 8,
      category_name: "gt",
      phone_number: "",
      email_id: "",
      created_by: "admin",
      contact_person_name: "gthy",
      updated_by: "admin",
    },
  });
  const API_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo";
  const AUTH_KEY =
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo";

  const handleSubmit = async (data: VendorFormData) => {
    try {
      const response = await fetch(
        "https://n8n.srv799538.hstgr.cloud/webhook/vendor_add",
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
      console.log(response);

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
          name="category_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendor Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter vendor name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter contact number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact_person_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="updated_by"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Materials/Products</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter materials or products"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="created_by"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Materials/Products</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter materials or products"
                  {...field}
                />
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
            {isLoading ? "Adding..." : "Add Vendor"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
