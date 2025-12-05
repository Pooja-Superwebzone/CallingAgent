import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/ui/metric-card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { mockInventory } from '@/data/mockData';
import { InventoryItem, InventoryProductItem } from '@/types';
import { InventoryForm } from '@/components/inventory/InventoryForm';
import { VendorForm } from '@/components/inventory/VendorForm';
import { AssignInventoryForm } from '@/components/inventory/AssignInventoryForm';
import { CategoryForm } from '@/components/inventory/CategoryForm';
import { DeleteInventoryDialog } from '@/components/inventory/DeleteInventoryDialog';
import { 
  Package, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Package2,
  UserPlus,
  ClipboardList,
  FolderPlus
} from 'lucide-react';

export const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isVendorFormOpen, setIsVendorFormOpen] = useState(false);
  const [isAssignInventoryFormOpen, setIsAssignInventoryFormOpen] = useState(false);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);

  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inventories, setInventories] = useState<InventoryProductItem[]>([]);
  
  const { toast } = useToast();

  const filteredItems = inventories.filter(item => {
    const matchesSearch = item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.vehicle_status?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    const matchesStock = stockFilter === 'all' || 
                        (stockFilter === 'low' && String(item.product_quantity) <= (String(item.reorder_level )|| 10)) ||
                        (stockFilter === 'normal' && String(item.product_quantity)) > (String(item.reorder_level || 10));
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const totalItems = inventories.length;
  const lowStockItems = inventories.filter(item => String(item.product_quantity) <= String((item.reorder_level || 10))).length;
  const totalValue = inventories.reduce((sum, item) => sum + (Number(item.product_quantity) * Number(item.reorder_level)), 0);
  const categories = [...new Set(inventories.map(item => item.category))];


  const API_URL =
    "https://n8n.srv799538.hstgr.cloud/webhook/27c09934-199c-4a8a-96e1-970423263b10";
  const API_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo";
  const AUTH_KEY =
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo";
  
    const GetTripData = async () => {
    try {
      const response = await fetch(API_URL, {
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched data:", data);

      // ✅ If it's an array, and you want the first object:
      if (Array.isArray(data)) {
        setInventories(data); // ✅ correct
      } else if (data) {
        setInventories([data]); // ✅ wrap single object in array
      } 
      return data;
    } catch (error) {
      console.error("Fetch error:", error);
      return null;
    }
  };

  // console.log(inventories);
  
  useEffect(() => {
    GetTripData();
  }, []);


  const getStockStatus = (item: InventoryProductItem) => {
    if (String(item.product_quantity) <= String((item.reorder_level) || '10')) {
      return { label: 'Low Stock', variant: 'destructive' as const };
    }
    return { label: 'In Stock', variant: 'default' as const };
  };

  const handleCreateItem = async (data: any) => {
    setIsLoading(true);
    try {
      const newItem: InventoryProductItem = {
        id: Date.now().toString(),
        ...data,
        minStock: 10,
        lastUpdated: new Date().toISOString(),
      };
      
      setInventories(prev => [...prev, newItem]);
      setIsFormOpen(false);
      
      toast({
        title: 'Success',
        description: 'Inventory item created successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create inventory item.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditItem = async (data: any) => {
    if (!editingItem) return;
    
    setIsLoading(true);
    try {
      const updatedItem: InventoryProductItem = {
        ...editingItem,
        ...data,
        minStock: editingItem.minStock || 10,
        lastUpdated: new Date().toISOString(),
      };
      
      setInventories(prev => 
        prev.map(item => item.product_id === Number(editingItem.id) ? updatedItem : item)
      );
      setIsFormOpen(false);
      setEditingItem(null);
      
      toast({
        title: 'Success',
        description: 'Inventory item updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update inventory item.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deletingItem) return;
    
    setIsLoading(true);
    try {
      setInventories(prev => prev.filter(item => item.product_id !== Number(deletingItem.id)));
      setIsDeleteDialogOpen(false);
      setDeletingItem(null);
      
      toast({
        title: 'Success',
        description: 'Inventory item deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete inventory item.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVendor = async (data: any) => {
  try {
      const response = await fetch(
        "https://n8n.srv799538.hstgr.cloud/webhook-test/vendor",
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

      toast({
        title: data.vendor_name ? "Assignment Updated" : "Assignment Created",
        description: `Assignment "${data.contact_person_name}" has been ${
          data.vendor_id ? "updated" : "created"
        } successfully.`,
      });

    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting the assignment.",
        variant: "destructive",
      });
    }

  //    vendor_id integer not null,
  // company_name character varying(500) not null,
  // contact_person_name character varying(300) not null,
  // phone_number character varying(15) null
  // email_id character varying(100) null

    setIsLoading(true);
    try {
      console.log('Adding vendor:', data);
      
      toast({
        title: 'Success',
        description: 'Vendor added successfully.',
      });
      
      setIsVendorFormOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add vendor.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignInventory = async (data: any) => {
    setIsLoading(true);
    try {
      console.log('Assigning inventory:', data);
      
      toast({
        title: 'Success',
        description: 'Inventory assigned successfully.',
      });
      
      setIsAssignInventoryFormOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign inventory.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = async (data: any) => {
    setIsLoading(true);
    try {
      console.log('Creating category:', data);
      
      toast({
        title: 'Success',
        description: 'Category created successfully.',
      });
      
      setIsCategoryFormOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create category.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const openEditDialog = (item: InventoryProductItem) => {
    setEditingItem(item as any);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (item: InventoryProductItem) => {
    setDeletingItem(item as any);
    setIsDeleteDialogOpen(true);
  };

  const openAssignInventoryDialog = () => {
    setIsAssignInventoryFormOpen(true);
  };

  const openCategoryDialog = () => {
    setIsCategoryFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Track and manage your inventory items</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsVendorFormOpen(true)} variant="outline" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add Vendor
          </Button>
          <Button onClick={openAssignInventoryDialog} variant="outline" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Assign Inventory
          </Button>
          <Button onClick={openCategoryDialog} variant="outline" className="flex items-center gap-2">
            <FolderPlus className="h-4 w-4" />
            New Category
          </Button>
          <Button onClick={openCreateDialog} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Items"
          value={totalItems}
          icon={<Package className="h-4 w-4" />}
        />
        <MetricCard
          title="Low Stock Items"
          value={lowStockItems}
          icon={<AlertTriangle className="h-4 w-4" />}
          change={{ value: 12, type: 'increase' }}
        />
        <MetricCard
          title="Total Value"
          value={`₹${totalValue.toLocaleString()}`}
          icon={<DollarSign className="h-4 w-4" />}
          change={{ value: 8, type: 'increase' }}
        />
        <MetricCard
          title="Categories"
          value={categories.length}
          icon={<Package2 className="h-4 w-4" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="normal">Normal Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Part Number</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Cost per Unit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((item) => {
                  const status = getStockStatus(item);
                  return (
                    <TableRow key={item.product_id}>
                      <TableCell className="font-medium">{item.product_name}</TableCell>
                      <TableCell>{item.part_number}</TableCell>
                      <TableCell>{item.category_name}</TableCell>
                      <TableCell>{item.product_quantity}</TableCell>
                      <TableCell>{item.unit || 'N/A'}</TableCell>
                      <TableCell>{item.Location || 'N/A'}</TableCell>
                      <TableCell>{item.vendor_company_name || 'N/A'}</TableCell>
                      <TableCell>₹{item.reorder_level}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Items per page:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredItems.length)} of {filteredItems.length} items
              </span>
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Inventory Item' : 'Create New Inventory Item'}
            </DialogTitle>
          </DialogHeader>
          <InventoryForm
            item={editingItem}
            onSubmit={editingItem ? handleEditItem : handleCreateItem}
            onCancel={closeForm}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isVendorFormOpen} onOpenChange={setIsVendorFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Vendor</DialogTitle>
          </DialogHeader>
          <VendorForm
            onSubmit={handleAddVendor}
            onCancel={() => setIsVendorFormOpen(false)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAssignInventoryFormOpen} onOpenChange={setIsAssignInventoryFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign Inventory</DialogTitle>
          </DialogHeader>
          <AssignInventoryForm
            onSubmit={handleAssignInventory}
            onCancel={() => setIsAssignInventoryFormOpen(false)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isCategoryFormOpen} onOpenChange={setIsCategoryFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          <CategoryForm
            onSubmit={handleCreateCategory}
            onCancel={() => setIsCategoryFormOpen(false)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      <DeleteInventoryDialog
        item={deletingItem}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteItem}
        isLoading={isLoading}
      />
    </div>
  );
};
