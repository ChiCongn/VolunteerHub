import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { UserRole } from "@/types/enum";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[]; 
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; 
  }

  // Nếu chưa đăng nhập, chuyển hướng về login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu có yêu cầu role cụ thể mà user không có role đó
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}