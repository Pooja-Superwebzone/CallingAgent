
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DollarSign, 
  Plus, 
  Filter, 
  Download,
  Receipt,
  TrendingUp,
  TrendingDown,
  FileText
} from 'lucide-react';
import { mockExpenses } from '@/data/mockData';
import { Expense } from '@/types';

export const Expenses: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');

  const getStatusBadgeVariant = (status: Expense['status']) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'outline';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const getCategoryIcon = (category: Expense['category']) => {
    switch (category) {
      case 'fuel': return '⛽';
      case 'maintenance': return '🔧';
      case 'insurance': return '🛡️';
      case 'other': return '📄';
      default: return '📄';
    }
  };

  const filteredExpenses = mockExpenses.filter(expense => {
    if (activeTab === 'all') return true;
    return expense.status === activeTab;
  });

  const totalExpenses = mockExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const pendingExpenses = mockExpenses
    .filter(e => e.status === 'pending')
    .reduce((sum, expense) => sum + expense.amount, 0);
  const approvedExpenses = mockExpenses
    .filter(e => e.status === 'approved')
    .reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground">
            Track and manage transportation expenses
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold">₹{totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">₹{approvedExpenses.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">₹{pendingExpenses.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">
                  ₹{mockExpenses
                    .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
                    .reduce((sum, e) => sum + e.amount, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Expenses</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Expense List</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Expense</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{expense.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {expense.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getCategoryIcon(expense.category)}</span>
                          <span className="capitalize">{expense.category}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">₹{expense.amount.toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(expense.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(expense.status)}>
                          {expense.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{expense.submittedBy}</div>
                      </TableCell>
                      <TableCell>
                        {expense.receiptUrl ? (
                          <Button variant="outline" size="sm">
                            <Receipt className="h-4 w-4" />
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">No receipt</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {['fuel', 'maintenance', 'insurance', 'other'].map((category) => {
              const categoryExpenses = mockExpenses.filter(e => e.category === category);
              const categoryTotal = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
              const percentage = (categoryTotal / totalExpenses) * 100;
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getCategoryIcon(category as Expense['category'])}</span>
                      <span className="capitalize font-medium">{category}</span>
                    </div>
                    <div className="text-sm font-medium">
                      ₹{categoryTotal.toLocaleString()} ({percentage.toFixed(1)}%)
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockExpenses.slice(0, 5).map((expense) => (
              <div key={expense.id} className="flex items-center space-x-3 p-2 border rounded">
                <div className="text-lg">{getCategoryIcon(expense.category)}</div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{expense.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {expense.submittedBy} • {new Date(expense.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">₹{expense.amount.toLocaleString()}</div>
                  <Badge variant={getStatusBadgeVariant(expense.status)} className="text-xs">
                    {expense.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
