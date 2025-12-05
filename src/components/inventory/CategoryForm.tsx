
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const categorySchema = z.object({
  category_id: z.number().min(1, 'Category id is required'),
  vendorName: z.string().min(1, 'Category name is required'),
  // restockThreshold: z.string().min(1, 'Restock threshold is required').transform(Number),
  restockThreshold: z.string().min(1, 'Restock threshold is required'),
  created_by: z.string().min(1, 'Vendor name is required'),
  updated_by: z.string().min(1, 'Vendor name is required'),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  onSubmit: (data: CategoryFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// Mock vendor data - in a real app, these would come from your backend
const mockVendors = [
  { id: '1', name: 'AutoParts Express' },
  { id: '2', name: 'Vehicle Solutions Ltd' },
  { id: '3', name: 'Premium Parts Co' },
  { id: '4', name: 'Fleet Supply Hub' },
  { id: '5', name: 'Truck Components Inc' },
];

const categories = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Tools' },
  { id: 3, name: 'Safety Equipment' },
  { id: 4, name: 'Office Supplies' },
  { id: 5, name: 'Vehicle Parts' },
  { id: 6, name: 'Fuel' },
  { id: 7, name: 'Maintenance' },
  { id: 8, name: 'Other' },
];


  const suppliers = [
     { id: 1, name:  'ABC Electronics Ltd' },
  { id: 2, name:  'XYZ Auto Parts' },
  { id: 3, name: 'Global Tools Inc'},
  { id: 4, name: 'Office Supplies' },
  { id: 5, name:  'Office Solutions Co', },
  { id: 6, name:  'Industrial Equipment Ltd' },
  { id: 7, name:  'Premium Parts Supplier' },
  { id: 8, name: 'Other' },
  ];


const API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo";
const AUTH_KEY =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo";


export const CategoryForm: React.FC<CategoryFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      category_id: 8,
      vendorName: '',
      restockThreshold: '',
      created_by: 'Admin',
      updated_by: 'Admin',
    },
  });

  const handleSubmit = async (data: CategoryFormData) => {
       try {
      const response = await fetch(
        "https://n8n.srv799538.hstgr.cloud/webhook/Category",
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
          name="vendorName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter category name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="restockThreshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Restock Threshold</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Enter minimum stock level" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vendorName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendor Name</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mockVendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.name}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
