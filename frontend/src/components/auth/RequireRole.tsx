import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { UserRole } from '../../types/auth';

interface RequireRoleProps {
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user role
 * Shows fallback component if user doesn't have required role
 */
export const RequireRole: React.FC<RequireRoleProps> = ({
  allowedRoles,
  fallback,
  children,
}) => {
  const { hasAnyRole } = usePermissions();
  const { isLoading } = useAuth();

  // Show loading state while authentication is being verified
  // This prevents the fallback from flashing before auth completes
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Only check permissions after loading is complete
  if (!hasAnyRole(allowedRoles)) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};
