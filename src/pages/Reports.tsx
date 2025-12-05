import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockExpenses } from '@/data/mockData';
import { Expense } from '@/types';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const COLORS = ['#2563eb', '#1d4ed8', '#60a5fa', '#38bdf8', '#818cf8', '#f59e42', '#fbbf24', '#10b981', '#f43f5e'];

const CATEGORY_LIST = ['fuel', 'maintenance', 'insurance', 'other'];
const CATEGORY_COLORS = {
  fuel: '#2563eb',         // blue
  maintenance: '#10b981',  // green
  insurance: '#f59e42',    // orange
  other: '#f43f5e',        // red
};

const getCategoryColor = (category: string) => CATEGORY_COLORS[category] || '#818cf8';

const Reports: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);

  // Aggregate data
  const totalExpenses = mockExpenses.reduce((sum, e) => sum + e.amount, 0);
  const categoryData = Array.from(
    mockExpenses.reduce((acc, e) => {
      acc.set(e.category, (acc.get(e.category) || 0) + e.amount);
      return acc;
    }, new Map<string, number>())
  ).map(([category, value]) => ({ category, value }));

  // Monthly data (mocked for 6 months)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const monthlyData = months.map((month, i) => ({
    month,
    fuel: Math.round(Math.random() * 10000 + 5000),
    maintenance: Math.round(Math.random() * 8000 + 2000),
    insurance: Math.round(Math.random() * 4000 + 1000),
    other: Math.round(Math.random() * 2000 + 500),
  }));

  // Export CSV
  const handleExportCSV = () => {
    const csv = Papa.unparse(mockExpenses);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'expenses_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF
  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 40;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
    pdf.save('expenses_report.pdf');
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-700">Reports & Analytics</h1>
          <p className="text-muted-foreground">Visualize and export your fleet's spending patterns</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline">Export CSV</Button>
          <Button onClick={handleExportPDF} variant="default">Export PDF</Button>
        </div>
      </div>

      <div ref={reportRef} className="space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">₹{totalExpenses.toLocaleString()}</div>
            </CardContent>
          </Card>
          {categoryData.map((cat, i) => (
            <Card key={cat.category}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{cat.category.charAt(0).toUpperCase() + cat.category.slice(1)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: getCategoryColor(cat.category) }}>₹{cat.value.toLocaleString()}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown (Pie)</CardTitle>
            </CardHeader>
            <CardContent style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {categoryData.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={getCategoryColor(entry.category)} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending (Bar)</CardTitle>
            </CardHeader>
            <CardContent style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Legend />
                  <RechartsTooltip />
                  <Bar dataKey="fuel" stackId="a" fill={CATEGORY_COLORS.fuel} name="Fuel" />
                  <Bar dataKey="maintenance" stackId="a" fill={CATEGORY_COLORS.maintenance} name="Maintenance" />
                  <Bar dataKey="insurance" stackId="a" fill={CATEGORY_COLORS.insurance} name="Insurance" />
                  <Bar dataKey="other" stackId="a" fill={CATEGORY_COLORS.other} name="Other" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Expenses</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-blue-50">
                  <th className="p-2 text-left">Title</th>
                  <th className="p-2 text-left">Category</th>
                  <th className="p-2 text-left">Amount</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Description</th>
                </tr>
              </thead>
              <tbody>
                {mockExpenses.map((expense, i) => (
                  <tr key={i} className="border-b hover:bg-blue-50">
                    <td className="p-2 font-medium">{expense.title}</td>
                    <td className="p-2 capitalize">{expense.category}</td>
                    <td className="p-2">₹{expense.amount.toLocaleString()}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        expense.status === 'approved' ? 'bg-green-100 text-green-800' :
                        expense.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-2">{expense.date}</td>
                    <td className="p-2">{expense.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports; 