import { RouteConfig } from '../config/routes';
import { User, UserRole } from '../types/auth';

/**
 * Check if a user has a specific role
 */
export const hasRole = (user: User | null, role: UserRole): boolean => {
  return user?.role === role;
};

/**
 * Check if a user has any of the specified roles
 */
export const hasAnyRole = (user: User | null, roles: UserRole[]): boolean => {
  return user ? roles.includes(user.role) : false;
};

/**
 * Check if a user can access a specific route based on role requirements
 */
export const canAccessRoute = (user: User | null, route: RouteConfig): boolean => {
  return hasAnyRole(user, route.allowedRoles);
};

/**
 * Check if user is an admin
 */
export const isAdmin = (user: User | null): boolean => {
  return hasRole(user, 'ADMIN');
};

/**
 * Check if user is an editor (or admin)
 */
export const isEditor = (user: User | null): boolean => {
  return hasAnyRole(user, ['EDITOR', 'ADMIN']);
};

/**
 * Check if user is a reader (any authenticated user)
 */
export const isReader = (user: User | null): boolean => {
  return hasAnyRole(user, ['READER', 'EDITOR', 'ADMIN']);
};

/**
 * Check if user can edit content (editor or admin)
 */
export const canEdit = (user: User | null): boolean => {
  return hasAnyRole(user, ['EDITOR', 'ADMIN']);
};
