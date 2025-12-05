
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthService } from '@/utils/auth';
import { LoginForm } from '@/components/auth/LoginForm';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Dashboard } from '@/pages/Dashboard';
import { Vehicles } from '@/pages/Vehicles';
import { Assignments } from '@/pages/Assignments';
import { Tracking } from '@/pages/Tracking';
import { Expenses } from '@/pages/Expenses';
import { Approvals } from '@/pages/Approvals';
import { Users } from '@/pages/Users';
import { Inventory } from '@/pages/Inventory';
import { NotFound } from './pages/NotFound';
import { Unauthorized } from './pages/Unauthorized';
import MyProfile from './pages/MyProfile';
import { User } from '@/types';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProtectedRoute from './guards/ProtectedRoute';
import { MyAuthService } from './services/authService';
import MySettings from './pages/MySettings';
import Reports from './pages/Reports';
import DriverPayments from './pages/DriverPayments';
import { LogSheet } from './pages/LogSheet';
import Fuels from './pages/Fuels';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [childIsMenu, setChildIsMenu] = useState('hide');

  useEffect(() => {
    const user = MyAuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    const user = MyAuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
  };

  const childHandleMenu = (v) => {
    setChildIsMenu(v);
  }

  const onClickHamburger = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    setChildIsMenu(childIsMenu == 'hide' ? 'show' : 'hide');
  }

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background flex w-full page_level">
            <Sidebar user={currentUser} collapsed={sidebarCollapsed} handleMenu={childHandleMenu} ismenu={childIsMenu} />
            <div className="flex-1 flex flex-col">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClickHamburger}
                  className="m-4"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="flex-1 top-nav">
                  <Navbar user={currentUser} onLogout={handleLogout} />
                </div>
              </div>
              <main className="flex-1 overflow-auto">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard user={currentUser} />} />
                  <Route path="/vehicles" element={<Vehicles />} />
                  <Route path="/logsheet" element={<LogSheet />} />
                  <Route path="/assignments" element={<Assignments />} />
                  <Route path="/tracking" element={<Tracking />} />
                  <Route path="/expenses" element={<Expenses />} />
                  <Route path="/approvals" element={<Approvals />} />
                  <Route path="/fuels" element={<Fuels />} />
                  <Route path="/inventory" element={<ProtectedRoute allowedRoles={["Manager", "Admin"]}> 
                      <Inventory />
                    </ProtectedRoute>} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/users" element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                      <Users />
                    </ProtectedRoute>} />
                  <Route path="/driver-payments" element={<ProtectedRoute allowedRoles={["Manager", "Admin", "Supervisor", "incharge"]}><DriverPayments /></ProtectedRoute>} />
                  
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  
                  <Route path="/myprofile" element={<MyProfile user={currentUser} />} />
                  <Route path="/mysettings" element={<MySettings user={currentUser} />} />
                  <Route path="/analytics" element={<div className="p-6"><h1 className="text-2xl font-bold">Analytics - Coming Soon</h1></div>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
          <Toaster />
          <Sonner />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
