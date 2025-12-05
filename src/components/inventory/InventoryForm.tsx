import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { InventoryItem } from '@/types';

const inventorySchema = z.object({
   name: z.string().min(1, 'Item name is required'),
  partNumber: z.string().min(1, 'Part number is required'),
  category: z.string().min(1, 'Category is required'),
  quantity: z.number().min(0, 'Quantity must be non-negative'),
  unit: z.string().min(1, 'Unit is required'),
  location: z.string().min(1, 'Location is required'),
  supplier: z.string().min(1, 'Supplier is required'),
  cost: z.number().min(0, 'Cost must be non-negative'),
});

type InventoryFormData = z.infer<typeof inventorySchema>;

interface InventoryFormProps {
  item?: InventoryItem;
  onSubmit: (data: InventoryFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const InventoryForm: React.FC<InventoryFormProps> = ({
  item,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const form = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
       name: item?.name || '',
      partNumber: (item as any)?.partNumber || '',
      category: String(item?.category || ''),
      quantity: item?.quantity || 0,
      unit: item?.unit || '',
      location: item?.location || '',
      supplier: String(item?.supplier || ''),
      cost: item?.cost || 0,
    },
  });

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
    'ABC Electronics Ltd',
    'XYZ Auto Parts',
    'Global Tools Inc',
    'Safety First Supplies',
    'Office Solutions Co',
    'Industrial Equipment Ltd',
    'Premium Parts Supplier',
    'Local Hardware Store',
  ];

  const units = [
    'pieces',
    'kg',
    'liters',
    'meters',
    'boxes',
    'gallons',
    'tons',
    'units',
  ];

  const API_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo";

  const AUTH_KEY =
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo";

  const mockVendors = [
    { id: '1', name: 'AutoParts Express' },
    { id: '2', name: 'Vehicle Solutions Ltd' },
    { id: '3', name: 'Premium Parts Co' },
    { id: '4', name: 'Fleet Supply Hub' },
    { id: '5', name: 'Truck Components Inc' },
  ];

  const [partnum, setpartnum] = useState([]);
  const [catagor, setcatagor] = useState([]);

  const fetchDataSuppliernumber = async () => {
    try {
      const fallbackUrl =
        "https://n8n.srv799538.hstgr.cloud/webhook/7fcabbc0-2071-41ee-b949-dc8083086f7e";

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

  const fetchDataCatagory = async () => {
    try {
      const fallbackUrl =
        "https://n8n.srv799538.hstgr.cloud/webhook/578481f3-a817-434a-b301-c3c48f9addfc";

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
        setcatagor(data);
      }
    } catch (error) {
      console.error("Error fetching vehicle data:", error);
    }
  };

  const filteredvehicleNumberItems = partnum.filter(
    (item) =>
      typeof item.vendor_id  === "number" &&
      typeof item.company_name  === "string"
  );

  const filteredcatagorNumberItems = catagor.filter(
    (item) =>
      typeof item.category_id === "number" &&
      typeof item.category_name === "string"
  );

  useEffect(() => {
    fetchDataSuppliernumber();
    fetchDataCatagory();
  }, []);

  const handleSubmit = async (data: InventoryFormData) => {
    try {
      const response = await fetch(
        "https://n8n.srv799538.hstgr.cloud/webhook-test/insert-product",
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
    } catch (error) {
      console.error("Submit error:", error);
    }
    onSubmit(data);
    alert('success');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter item name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="partNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Part Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter part number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredcatagorNumberItems.map((category) => (
                      <SelectItem key={category.category_id} value={String(category.category_id)}>
                        {category.category_id}  {category.category_name}
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
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
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
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
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
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Enter location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="supplier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredvehicleNumberItems.map((supplier) => (
                      <SelectItem key={supplier.vendor_id } value={String(supplier.vendor_id)}>
                        {supplier.vendor_id }   {supplier.company_name }
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
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost per Unit (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : item ? 'Update Item' : 'Create Item'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
