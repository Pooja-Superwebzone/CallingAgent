
import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

// Mock data for employee attendance
const mockAttendanceData = [
  {
    employeeId: '1001',
    employeeName: 'John Doe',
    date: '21/05/2025',
    loginTime: '08:30:00',
    logoutTime: '17:30:00'
  },
  {
    employeeId: '1002',
    employeeName: 'Jane Smith',
    date: '21/05/2025',
    loginTime: '08:15:00',
    logoutTime: '17:00:00'
  },
  {
    employeeId: '1003',
    employeeName: 'Michael Johnson',
    date: '21/05/2025',
    loginTime: '09:00:00',
    logoutTime: '18:00:00'
  },
  {
    employeeId: '1001',
    employeeName: 'John Doe',
    date: '20/05/2025',
    loginTime: '08:35:00',
    logoutTime: '17:45:00'
  },
  {
    employeeId: '1002',
    employeeName: 'Jane Smith',
    date: '20/05/2025',
    loginTime: '08:10:00',
    logoutTime: '17:05:00'
  }
];

export const Attendance = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = mockAttendanceData.filter(record =>
    record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.employeeId.includes(searchTerm) ||
    record.date.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Employee Daily Attendance</h1>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search attendance records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Employee ID</TableHead>
              <TableHead className="font-semibold">Employee Name</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Login Time</TableHead>
              <TableHead className="font-semibold">Logout Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((record, index) => (
              <TableRow key={`${record.employeeId}-${record.date}-${index}`}>
                <TableCell className="font-medium text-primary">
                  {record.employeeId}
                </TableCell>
                <TableCell>{record.employeeName}</TableCell>
                <TableCell>{record.date}</TableCell>
                <TableCell>{record.loginTime}</TableCell>
                <TableCell>{record.logoutTime}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === pageNumber}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(pageNumber);
                      }}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};
