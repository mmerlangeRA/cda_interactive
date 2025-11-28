import React from 'react';
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

  if (!hasAnyRole(allowedRoles)) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};
