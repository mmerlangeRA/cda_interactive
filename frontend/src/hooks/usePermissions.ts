import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';
import * as permissions from '../utils/permissions';

/**
 * Custom hook for checking permissions in components
 */
export const usePermissions = () => {
  const { user } = useAuth();

  return {
    // Check if user has specific role(s)
    hasRole: (role: UserRole) => permissions.hasRole(user, role),
    hasAnyRole: (roles: UserRole[]) => permissions.hasAnyRole(user, roles),
    
    // Convenience helpers
    isAdmin: permissions.isAdmin(user),
    isEditor: permissions.isEditor(user),
    isReader: permissions.isReader(user),
    canEdit: permissions.canEdit(user),
    
    // User object
    user,
  };
};
