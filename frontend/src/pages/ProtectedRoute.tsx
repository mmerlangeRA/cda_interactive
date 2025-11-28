import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Header } from "../components/header/Header";
import { useAuth } from "../contexts/AuthContext";
import { checkAuth } from "../services/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await checkAuth();
        setIsAuthenticated(response.isAuthenticated);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Authentication check failed:", error.message);
        }
        setIsAuthenticated(false);
      }
    };

    verifyAuth();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  if (isAuthenticated === null) {
    // Show loading state while checking authentication
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <>
      <Header user={user} onLogout={handleLogout} />
      {children}
    </>
  );
};

export default ProtectedRoute;
