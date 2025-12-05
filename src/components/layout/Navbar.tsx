
import React, { useState } from 'react';
import { User, Bell, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AuthService } from '@/utils/auth';
import { User as UserType } from '@/types';
import { MyAuthService } from '@/services/authService';

interface NavbarProps {
  user: UserType;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const handleLogout = () => {
    MyAuthService.logout();
    onLogout();
  };

  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const [open, setOpen] = useState(false);

  const notifications = [
    { id: 1, message: 'New user registered' },
    { id: 2, message: 'Server backup completed' },
    { id: 3, message: 'Test data, New comment on your post' },
  ];

  return (
    <nav className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">TMS</span>
            </div>
            <h1 className="text-xl font-semibold text-foreground">Transport Management</h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </Button> */}

          <button
            onClick={() => setOpen(!open)}
            className="relative p-2 rounded-full hover:bg-gray-100"
          >
            <Bell className="h-6 w-6 text-gray-700" />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center h-4 w-4 text-xs font-bold text-white bg-red-600 rounded-full">
                {notifications.length}
              </span>
            )}
          </button>

          {open && (
            <div className="notifications absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="py-2">
                {notifications.map((note) => (
                  <div
                    key={note.id}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    {note.message}
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    No notifications
                  </div>
                )}
              </div>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 p-2">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(user.emp_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left user-info">
                  <div className="text-sm font-medium">{user.emp_name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{user.emp_role}</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span onClick={()=> navigate("/myprofile")} className='cursor-pointer'>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span className='cursor-pointer' onClick={()=> navigate("/mysettings")}>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span className='cursor-pointer'>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};
