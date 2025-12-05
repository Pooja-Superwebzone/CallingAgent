import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Calendar,
    Plus,
    MapPin,
    Clock,
    Truck,
    Filter,
    Search,
    Edit,
    Trash2,
    ListOrdered,
    User2,
    CircleDollarSign,
    Fuel,
    Gauge,
    BadgeCheck,
} from "lucide-react";
import { mockAssignments, mockVehicles } from "@/data/mockData";
import { Assign2, Assignment } from "@/types";
import { AssignmentForm } from "@/components/assignments/AssignmentForm";
import { DeleteAssignmentDialog } from "@/components/assignments/DeleteAssignmentDialog";
import { fetchDataService } from "@/customHooks/useApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LogSheetForm } from "@/components/logsheet/LogSheetForm";

export const LogSheet: React.FC = () => {
    const [activeTab, setActiveTab] = useState("all");
    const [logsheets, setLogsheets] = useState<Assignment[]>(mockAssignments);
    const [formOpen, setFormOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedLogsheet, setSelectedLogsheet] = useState<Assign2 | null>(null);
    const [viewLogsheet, setViewLogsheet] = useState<any | null>(null);
    const [viewOpen, setViewOpen] = useState(false);
    // TEMP: Use static data for log sheet table

    // Comment out API and state logic for now
    // const [logsheet, setLogsheet] = useState<Assign2[]>([]);
    // useEffect(() => { GetTripData(); }, []);

    // Search, filter, and pagination states
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [selectedPriority, setSelectedPriority] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [vDrivers, setVDrivers] = useState<any[]>([]);

    const API_URL = "https://n8n.srv799538.hstgr.cloud/webhook/586caf97-2a5c-4d3e-97be-9f2cfc8b5794";
    const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo";
    const AUTH_KEY = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo";

    const GetLogSheets = async () => {
        const API_URL = "https://n8n.srv799538.hstgr.cloud/webhook/getalllogsheet";
        const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo";
        const AUTH_KEY = `Bearer ${API_KEY}`;

        try {
            const response = await fetch(API_URL, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    apikey: API_KEY,
                    Authorization: AUTH_KEY,
                    jwt_token: "9082c5f9b14d12773ec0ead79742d239cec142c3",
                    session_id: "1"
                }
            });

            const data = await response.json();

            if (Array.isArray(data) && data[0]?.status === "success") {
                const sheets = data[0].data || [];
                setLogsheets(sheets);
            } else {
                console.error("Invalid response:", data);
            }
        } catch (error) {
            console.error("Fetch LogSheet API error:", error);
        }
    };

    useEffect(() => {
        GetLogSheets();
    }, []);

    // Add a helper to get driver name for a logsheet
    const getDriverName = (logsheet: any) => {
        if (logsheet.vehicle_driver_id && Array.isArray(vDrivers)) {
            const driver = vDrivers.find(d => String(d.emp_id) === String(logsheet.vehicle_driver_id));
            if (driver) {
                return `${driver.first_name || ''} ${driver.last_name || ''}`.trim();
            }
        }
        return "-";
    };

    // Helper type guards
    const hasProp = (obj: any, prop: string) => Object.prototype.hasOwnProperty.call(obj, prop);

    const logsheetsToShow = logsheets.length > 0 ? logsheets : [];

    // Update filteredLogsheets to include search by driver name and filter by status and payment status
    const filteredLogsheets = logsheetsToShow.filter((logsheet) => {
        const search = searchTerm.toLowerCase();
        const driverName = getDriverName(logsheet).toLowerCase();
        // Use log_sheet_id if present, otherwise fallback to stage_name for static data
        let id = "";
        if (hasProp(logsheet, 'log_sheet_id')) id = String(logsheet['log_sheet_id']);
        else if (hasProp(logsheet, 'stage_name')) id = String(logsheet['stage_name']);

        // Filter by status
        const statusMatch = selectedStatus === "all" || (logsheet.status && String(logsheet.status).toLowerCase() === selectedStatus.toLowerCase());
        // Filter by payment status
        const paymentMatch = selectedPriority === "all" || (logsheet.driver_payment_status && String(logsheet.driver_payment_status).toLowerCase() === selectedPriority.toLowerCase());

        return (
            (id.toLowerCase().includes(search) || driverName.includes(search)) &&
            statusMatch &&
            paymentMatch
        );
    });

    const totalPages = Math.ceil(filteredLogsheets.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedLogsheets = filteredLogsheets.slice(startIndex, endIndex);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedStatus, selectedPriority]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const renderPaginationItems = () => {
        const items = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                items.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            href="#"
                            isActive={currentPage === i}
                            onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(i);
                            }}
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            }
        } else {
            items.push(
                <PaginationItem key={1}>
                    <PaginationLink
                        href="#"
                        isActive={currentPage === 1}
                        onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(1);
                        }}
                    >
                        1
                    </PaginationLink>
                </PaginationItem>
            );

            if (currentPage > 3) {
                items.push(
                    <PaginationItem key="ellipsis-start">
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                items.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            href="#"
                            isActive={currentPage === i}
                            onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(i);
                            }}
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            }

            if (currentPage < totalPages - 2) {
                items.push(
                    <PaginationItem key="ellipsis-end">
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }

            if (totalPages > 1) {
                items.push(
                    <PaginationItem key={totalPages}>
                        <PaginationLink
                            href="#"
                            isActive={currentPage === totalPages}
                            onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(totalPages);
                            }}
                        >
                            {totalPages}
                        </PaginationLink>
                    </PaginationItem>
                );
            }
        }

        return items;
    };

    const getVehicles = async () => {

        const vDriData = await fetchDataService("getvehicledriver", 'GET');
        if (vDriData[0].status == 'success') {
            console.log(vDriData[0].data)
            setVDrivers(vDriData[0].data);
        } else {
            setVDrivers([]);
        }
    };

    useEffect(() => {
        getVehicles();
    }, []);

    const openCount = logsheets.filter(l => l.status && String(l.status).toLowerCase() === 'open').length;
    const closedCount = logsheets.filter(l => l.status && String(l.status).toLowerCase() === 'closed').length;

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Log Sheet</h1>
                    <p className="text-muted-foreground">
                        Manage and track log sheet
                    </p>
                </div>
                <Button onClick={() => setFormOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Log Sheet
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-sm text-muted-foreground">Open</p>
                                <p className="text-2xl font-bold">{logsheets.filter(l => l.status && String(l.status).toLowerCase() === 'open').length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Clock className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="text-sm text-muted-foreground">Close</p>
                                <p className="text-2xl font-bold">{logsheets.filter(l => l.status && String(l.status).toLowerCase() === 'closed').length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsContent value={activeTab} className="mt-6 space-y-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col sm:flex-row gap-4 items-end">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                        <Input
                                            placeholder="Search log sheets by driver name..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="px-3 py-2 border border-input rounded-md bg-background"
                                >
                                    <option value="all">All Status</option>
                                    <option value="closed">Closed</option>
                                    <option value="open">Open</option>
                                </select>
                                <select
                                    value={selectedPriority}
                                    onChange={(e) => setSelectedPriority(e.target.value)}
                                    className="px-3 py-2 border border-input rounded-md bg-background"
                                >
                                    <option value="all">All</option>
                                    <option value="paid">Paid</option>
                                    <option value="pending">Pending</option>
                                </select>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="px-3 py-2 border border-input rounded-md bg-background"
                                >
                                    <option value={5}>5 per page</option>
                                    <option value={10}>10 per page</option>
                                    <option value={25}>25 per page</option>
                                    <option value={50}>50 per page</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>
                                    Log Sheet List ({filteredLogsheets.length} total, showing {paginatedLogsheets.length})
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="w-full">
                                <div className="">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Log Sheet Id</TableHead>
                                                <TableHead>Vehicle Driver Name</TableHead>
                                                <TableHead>Payment Amount</TableHead>
                                                <TableHead>Total Fuel Spent</TableHead>
                                                <TableHead>Mileage Calculation</TableHead>
                                                <TableHead>Initial Distance</TableHead>
                                                <TableHead>Total Distance</TableHead>
                                                <TableHead>Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedLogsheets.map((logsheet, idx) => {
                                                // Use unique variable names inside the map
                                                const rowLogSheetId = hasProp(logsheet, 'log_sheet_id') ? (logsheet as any)['log_sheet_id'] : hasProp(logsheet, 'stage_name') ? (logsheet as any)['stage_name'] : "-";
                                                const rowTotalAmount = hasProp(logsheet, 'total_amount') ? (logsheet as any)['total_amount'] : hasProp(logsheet, 'payment_amount') ? (logsheet as any)['payment_amount'] : "-";
                                                const rowTotalFuel = hasProp(logsheet, 'total_fuel_liters') ? (logsheet as any)['total_fuel_liters'] : hasProp(logsheet, 'total_fuel_spent') ? (logsheet as any)['total_fuel_spent'] : "-";
                                                const rowMileage = hasProp(logsheet, 'mileage') ? (logsheet as any)['mileage'] : hasProp(logsheet, 'mileage_calculation') ? (logsheet as any)['mileage_calculation'] : "-";
                                                const rowInitialKm = hasProp(logsheet, 'initial_km_reading') ? (logsheet as any)['initial_km_reading'] : hasProp(logsheet, 'initial_distance') ? (logsheet as any)['initial_distance'] : "-";
                                                const rowFinalKm = hasProp(logsheet, 'final_km_reading') ? (logsheet as any)['final_km_reading'] : hasProp(logsheet, 'total_distance') ? (logsheet as any)['total_distance'] : "-";
                                                return (
                                                    <TableRow
                                                        key={rowLogSheetId || idx}
                                                        onClick={() => {
                                                            if (hasProp(logsheet, 'log_sheet_id')) {
                                                                setViewLogsheet(logsheet);
                                                                setViewOpen(true);
                                                            }
                                                        }}
                                                        style={{ cursor: 'pointer' }}
                                                        className="hover:bg-blue-50"
                                                    >
                                                        <TableCell>{rowLogSheetId}</TableCell>
                                                        <TableCell>{getDriverName(logsheet)}</TableCell>
                                                        <TableCell>{rowTotalAmount}</TableCell>
                                                        <TableCell>{rowTotalFuel}</TableCell>
                                                        <TableCell>{rowMileage}</TableCell>
                                                        <TableCell>{rowInitialKm}</TableCell>
                                                        <TableCell>{rowFinalKm}</TableCell>
                                                        <TableCell>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedLogsheet(logsheet);
                                                                    setFormOpen(true);
                                                                }}
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>


                                    </Table>
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            <LogSheetForm
                open={formOpen}
                onOpenChange={(open) => {
                    setFormOpen(open);
                    if (!open) setSelectedLogsheet(null);
                }}
                onSuccess={() => {
                    GetLogSheets();
                    setSelectedLogsheet(null);
                }}
                drivers={vDrivers}
                selectedLogsheet={selectedLogsheet}
            />
            <LogSheetViewModal
                open={viewOpen}
                onOpenChange={setViewOpen}
                logsheet={viewLogsheet}
                vDrivers={vDrivers}
            />

        </div>
    );
};

export const LogSheetViewModal = ({ open, onOpenChange, logsheet, vDrivers }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    logsheet?: any;
    vDrivers?: any[];
  }) => {
    // Find driver name from vDrivers
    let driverName = '-';
    if (logsheet?.vehicle_driver_id && Array.isArray(vDrivers)) {
      const driver = vDrivers.find(d => String(d.emp_id) === String(logsheet.vehicle_driver_id));
      if (driver) {
        driverName = `${driver.first_name || ''} ${driver.last_name || ''}`.trim();
      }
    }
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              📝 Log Sheet Details
            </DialogTitle>
          </DialogHeader>
  
          <ScrollArea className="h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm text-gray-800">
              <DetailItem label="Log Sheet ID" value={logsheet?.log_sheet_id} icon={<ListOrdered />} />
              <DetailItem label="Driver Name" value={driverName} icon={<User2 />} />
              <DetailItem label="Payment Amount" value={`₹${logsheet?.total_amount || 0}`} icon={<CircleDollarSign />} />
              <DetailItem label="Total Fuel Spent (L)" value={logsheet?.total_fuel_liters} icon={<Fuel />} />
              <DetailItem label="Mileage (km/l)" value={logsheet?.mileage} icon={<Gauge />} />
              <DetailItem label="Initial KM" value={logsheet?.initial_km_reading} icon={<MapPin />} />
              <DetailItem label="Final KM" value={logsheet?.final_km_reading} icon={<MapPin />} />
              <DetailItem label="Status" value={logsheet?.status} icon={<BadgeCheck />} />
              <DetailItem label="Payment Status" value={logsheet?.driver_payment_status} icon={<BadgeCheck />} />
              {/* Add more fields as needed */}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  };

  const DetailItem = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: any;
    icon: React.ReactNode;
  }) => (
    <div className="flex items-start gap-3 bg-muted/30 p-3 rounded-md shadow-sm">
      <div className="mt-1 text-muted-foreground">{icon}</div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium break-words">{value ?? "-"}</div>
      </div>
    </div>
  );
