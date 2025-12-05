
import React from 'react';
import { User } from '@/types';
import { MetricCard } from '@/components/ui/metric-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Truck, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp, 
  MapPin,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { mockAssignments, mockVehicles, mockExpenses, mockApprovals } from '@/data/mockData';

interface DashboardProps {
  user: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const getManagerDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Assignments"
          value={mockAssignments.filter(a => a.status === 'active').length}
          change={{ value: 12, type: 'increase' }}
          icon={<Calendar className="h-5 w-5" />}
        />
        <MetricCard
          title="Available Vehicles"
          value={mockVehicles.filter(v => v.status === 'active').length}
          icon={<Truck className="h-5 w-5" />}
        />
        <MetricCard
          title="Pending Expenses"
          value={`₹${mockExpenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0).toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <MetricCard
          title="Pending Approvals"
          value={mockApprovals.filter(a => a.status === 'pending').length}
          change={{ value: 5, type: 'decrease' }}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Assignments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockAssignments.filter(a => a.status === 'active').map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{assignment.title}</div>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {assignment.route.from} → {assignment.route.to}
                  </div>
                  <Progress value={Number(assignment.progress) || 0} className="w-32" />
                </div>
                <Badge variant={assignment.priority === 'high' ? 'destructive' : 'default'}>
                  {assignment.priority}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Create New Assignment
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <DollarSign className="mr-2 h-4 w-4" />
              Process Expenses
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Truck className="mr-2 h-4 w-4" />
              Vehicle Status
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Pending Approvals
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const getInchargeDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Fleet Utilization"
          value="87%"
          change={{ value: 5, type: 'increase' }}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <MetricCard
          title="Total Revenue"
          value="₹2,45,000"
          change={{ value: 8, type: 'increase' }}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <MetricCard
          title="Active Vehicles"
          value={mockVehicles.filter(v => v.status === 'active').length}
          icon={<Truck className="h-5 w-5" />}
        />
        <MetricCard
          title="Maintenance Due"
          value={mockVehicles.filter(v => v.status === 'maintenance').length}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Fleet Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockVehicles.map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{vehicle.registrationNumber}</div>
                    <div className="text-sm text-muted-foreground">{vehicle.model}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant={vehicle.status === 'active' ? 'default' : 'secondary'}>
                      {vehicle.status}
                    </Badge>
                    <div className="text-sm text-muted-foreground mt-1">
                      {vehicle.mileage?.toLocaleString()} km
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Total Drivers</span>
              <span className="font-medium">15</span>
            </div>
            <div className="flex justify-between">
              <span>On Duty</span>
              <span className="font-medium text-green-600">12</span>
            </div>
            <div className="flex justify-between">
              <span>On Break</span>
              <span className="font-medium text-yellow-600">2</span>
            </div>
            <div className="flex justify-between">
              <span>Off Duty</span>
              <span className="font-medium text-gray-600">1</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const getOwnerDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Monthly Revenue"
          value="₹8,45,000"
          change={{ value: 15, type: 'increase' }}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <MetricCard
          title="Total Expenses"
          value="₹3,20,000"
          change={{ value: 3, type: 'decrease' }}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <MetricCard
          title="Net Profit"
          value="₹5,25,000"
          change={{ value: 22, type: 'increase' }}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <MetricCard
          title="Fleet Size"
          value={mockVehicles.length}
          change={{ value: 1, type: 'increase' }}
          icon={<Truck className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Business Analytics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Revenue Growth</span>
                <span className="text-green-600 font-medium">+15%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Cost Optimization</span>
                <span className="text-green-600 font-medium">-8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Fleet Efficiency</span>
                <span className="text-blue-600 font-medium">92%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Customer Satisfaction</span>
                <span className="text-green-600 font-medium">4.8/5</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Strategic Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center text-blue-700 mb-2">
                <Clock className="h-4 w-4 mr-2" />
                <span className="font-medium">Operational Efficiency</span>
              </div>
              <p className="text-sm text-blue-600">Fleet utilization up 12% this quarter</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center text-green-700 mb-2">
                <TrendingUp className="h-4 w-4 mr-2" />
                <span className="font-medium">Revenue Growth</span>
              </div>
              <p className="text-sm text-green-600">Exceeded targets by 18%</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center text-yellow-700 mb-2">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span className="font-medium">Maintenance Alert</span>
              </div>
              <p className="text-sm text-yellow-600">2 vehicles due for service</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderDashboard = () => {
    switch (user.emp_role) {
      case 'Manager':
        return getManagerDashboard();
      case 'Admin':
        return getInchargeDashboard();
      case 'Supervisor':
        return getOwnerDashboard();
      default:
        return getManagerDashboard();
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user.emp_name}
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your transport operations today.
        </p>
      </div>
      {renderDashboard()}
    </div>
  );
};
