
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Truck, 
  Calendar, 
  DollarSign, 
  Map, 
  Package, 
  FileText, 
  CheckSquare,
  Users,
  BarChart3,
  ChevronLeft,
  IndianRupee,
  Banknote,
  LogsIcon,
  Fuel
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { User } from '@/types';

interface SidebarProps {
  user: User;
  collapsed: boolean;
  handleMenu: (value: string) => void;
  ismenu: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

// Roles - Admin Manager Supervisor Operator Driver Technician Accountant HR, Logistics Head,
// Warehouse Keeper, Auditor, Support, Sales, Field Agent, Dispatcher, Quality Inspector, Data Entry,
// Fleet Manager, Security, Maintenance

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['Manager', 'Admin']
  },
  {
    title: 'Vehicles',
    href: '/vehicles',
    icon: Truck,
    roles: ['Manager', 'incharge', 'Admin']
  },
  {
    title: 'Assignments',
    href: '/assignments',
    icon: Calendar,
    roles: ['Manager', 'Supervisor', 'Admin']
  },
  {
    title: 'Log Sheet',
    href: '/logsheet',
    icon: LogsIcon,
    roles: ['Manager', 'Supervisor', 'Admin']
  },
  {
    title: 'GPS Tracking',
    href: '/tracking',
    icon: Map,
    roles: ['Manager', 'Supervisor', 'Admin']
  },
  {
    title: 'Expenses',
    href: '/expenses',
    icon: IndianRupee,
    roles: ['Manager', 'Admin']
  },
  {
    title: 'Driver Payments',
    href: '/driver-payments',
    icon: Banknote,
    roles: ['Manager', 'Admin', 'Supervisor', 'incharge']
  },
  {
    title: 'Inventory',
    href: '/inventory',
    icon: Package,
    roles: ['Manager', 'Admin']
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: FileText,
    roles: ['incharge', 'Admin']
  },
  {
    title: 'Approvals',
    href: '/approvals',
    icon: CheckSquare,
    roles: ['Manager', 'Supervisor', 'Admin']
  },
  {
    title: 'Users',
    href: '/users',
    icon: Users,
    roles: ['Admin']
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    roles: ['Manager']
  },
  {
    title: 'Fuels',
    href: '/fuels',
    icon: Fuel,
    roles: ['Manager', 'Admin']
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ user, collapsed, handleMenu, ismenu }) => {

  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role_name || user.emp_role || ''));

  return (
    <aside className={cn(
      // Use an even lighter blue gradient
      "bg-gradient-to-b from-blue-50 via-blue-100 to-blue-200 border-r border-border transition-all duration-300 side-nav",
      collapsed ? "w-16" : "w-64",
      ismenu == 'hide' ? 'm-hide' : 'm-show'
    )}>
      <nav className="p-4 space-y-2">
        <div className="goback_link px-3 py-2 flex rounded-lg transition-colors hover:bg-blue-100 hover:text-blue-900 text-blue-800" onClick={() => handleMenu('hide')}><ChevronLeft /><label>Go Back</label></div>
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={() => handleMenu('hide')}
            className={({ isActive }) =>
              cn(
                "flex items-center space-x-3 px-3 py-2 rounded-full transition-all text-blue-900 hover:bg-blue-100 hover:text-blue-800",
                isActive && "bg-blue-600 text-white font-semibold shadow"
              )
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium menuitem-title">{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
