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
} from "lucide-react";
import { mockAssignments, mockVehicles } from "@/data/mockData";
import { Assign2, Assignment } from "@/types";
import { AssignmentForm } from "@/components/assignments/AssignmentForm";
import { DeleteAssignmentDialog } from "@/components/assignments/DeleteAssignmentDialog";

export const Assignments: React.FC = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assign2 | null>(null);
  const [assignment, setAssignment] = useState<Assign2[]>([]);

  // Search, filter, and pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const getStatusBadgeVariant = (status: Assign2["current_status"]) => {
    switch (status) {
      case "Completed":
        return "default";
      case "In Progress":
        return "secondary";
      case "Not Started":
        return "outline";
      case "Delayed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const API_URL = "https://n8n.srv799538.hstgr.cloud/webhook/586caf97-2a5c-4d3e-97be-9f2cfc8b5794";
  const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo";
  const AUTH_KEY = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZ3RodWlsZ2ttbm16Z2ZhanJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDMyMDc2MSwiZXhwIjoyMDY1ODk2NzYxfQ.Po3_8ZANmWfvKSgjjRtT8OwGdaPweHisTHqlyTovZKo";

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

      if (Array.isArray(data) && Array.isArray(data[0]?.data)) {
        setAssignment(data[0].data);
      } else if (Array.isArray(data)) {
        setAssignment(data);
      } else if (data) {
        setAssignment([data]);
      }
      console.log('assignment state:', assignment); // Add this line to debug
      return data;
    } catch (error) {
      console.error("Fetch error:", error);
      return null;
    }
  };

  useEffect(() => {
    GetTripData();
  }, []);

  const getPriorityBadgeVariant = (priority: Assignment["priority"]) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const filteredAssignments = assignment.filter((assign) => {
    console.log('assign:', searchTerm)
    const matchesSearch = 
      assign.Regestration_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assign.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assign.soucre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assign.destination?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || assign.current_status === selectedStatus;
    const matchesPriority = selectedPriority === "all" || assign.priority === selectedPriority;
    //const matchesTab = activeTab === "all" || assign.current_status === activeTab;
    // console.log('------->',matchesSearch);
    // console.log(matchesStatus);
    // console.log(matchesPriority);
    // console.log(matchesTab);
    return matchesSearch && matchesStatus && matchesPriority; // && matchesTab;
  });

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAssignments = filteredAssignments.slice(startIndex, endIndex);

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

  const handleCreateAssignment = (data: Assign2) => {
    setAssignment([...assignment, data]);
  };

  const handleUpdateAssignment = (data: Assign2) => {
    setAssignment(
      assignment.map((assignment) =>
        assignment.trip_id === data.trip_id ? data : assignment
      )
    );
  };

  const handleDeleteAssignment = (trip_id: number) => {
    setAssignment(assignment.filter((assignment) => Number(assignment.trip_id) !== trip_id));
  };

  const openEditForm = (assignment: Assign2) => {
    console.log("Opening edit form for", assignment);
    setSelectedAssignment(assignment);
    setFormOpen(true);
  };

  const openDeleteDialog = (assignment: Assign2) => {
    setSelectedAssignment(assignment);
    setDeleteDialogOpen(true);
  };

  const openCreateForm = () => {
    setSelectedAssignment(null);
    setFormOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
          <p className="text-muted-foreground">
            Manage and track vehicle assignments
          </p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          New Assignment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{assignment.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">
                  {assignment.filter((a) => a.current_status === "Delayed").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Truck className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {assignment.filter((a) => a.current_status === "In Progress").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {assignment.filter((a) => a.current_status === "Completed").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* <TabsList>
          <TabsTrigger value="all">All Assignments</TabsTrigger>
          <TabsTrigger value="Delayed">Active</TabsTrigger>
          <TabsTrigger value="In Progress">Pending</TabsTrigger>
          <TabsTrigger value="Not Started">Not Started</TabsTrigger>
          <TabsTrigger value="Completed">Completed</TabsTrigger>
        </TabsList> */}

        <TabsContent value={activeTab} className="mt-6 space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search assignments by reg num, driver name, or route..."
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
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Completed">Completed</option>
                </select>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
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
                  Assignment List ({filteredAssignments.length} total, showing {paginatedAssignments.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="w-full">
                <div className="">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Assignment</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Goods</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedAssignments.map((assignment) => {
                        return (
                          <TableRow key={assignment.trip_id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {assignment.stage_name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  ID: {assignment.vehicle_driver_id}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {assignment?.Regestration_number || "N/A"}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {assignment?.model || "Unknown"}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm">
                                  <span className="font-medium">
                                    {assignment.soucre}
                                  </span>
                                  <span className="mx-2">→</span>
                                  <span className="font-medium">
                                    {assignment.destination}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {assignment.distance}
                                  {" • "}
                                  {new Date(assignment.estimated_travel_time).toLocaleDateString()}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={getStatusBadgeVariant(assignment.current_status)}
                              >
                                {assignment.current_status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={getPriorityBadgeVariant(assignment.priority)}
                              >
                                {assignment.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <Progress
                                  value={Number(assignment.progress) || 0}
                                  className="w-20"
                                />
                                <div className="text-xs text-muted-foreground">
                                  {assignment.progress}%
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {assignment?.goods || "N/A"}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {new Date(assignment.stage_start_time).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditForm(assignment)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openDeleteDialog(assignment)}
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
              </ScrollArea>

              {totalPages > 1 && (
                <div className="p-4 border-t">
                  <div className="flex justify-between items-center mb-4 text-sm text-muted-foreground">
                    <div>
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredAssignments.length)} of {filteredAssignments.length} entries
                    </div>
                    <div>
                      Page {currentPage} of {totalPages}
                    </div>
                  </div>
                  
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) handlePageChange(currentPage - 1);
                          }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {renderPaginationItems()}
                      
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) handlePageChange(currentPage + 1);
                          }}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AssignmentForm
        key={selectedAssignment?.trip_id}
        open={formOpen}
        onOpenChange={setFormOpen}
        assignment={selectedAssignment}
        onSubmit={selectedAssignment ? handleUpdateAssignment : handleCreateAssignment}
      />

      <DeleteAssignmentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        assignment={selectedAssignment}
        onConfirm={handleDeleteAssignment}
      />
    </div>
  );
};
