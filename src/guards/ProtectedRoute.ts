// components/ProtectedRoute.tsx
import React, { useEffect } from "react";
import { useNavigate  } from "react-router-dom";
//import { useAuth } from "../context/AuthContext";
import { AuthService } from "@/utils/auth";
import { Unauthorized } from "@/pages/Unauthorized";
import { MyAuthService } from "@/services/authService";

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const  user  = MyAuthService.getCurrentUser();
    const navigate = useNavigate();
    useEffect(() => {
        if (!allowedRoles.includes(user.emp_role)) {
            navigate('/unauthorized');
        }
    }, [user.emp_role]);    
    return children;
};

export default ProtectedRoute;
