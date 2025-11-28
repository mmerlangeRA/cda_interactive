import { ComponentType } from 'react';
import { House, Icon, Images } from 'react-bootstrap-icons';
import { UserRole } from '../types/auth';

export interface RouteConfig {
  path: string;
  name: string;
  icon?: Icon;
  allowedRoles: UserRole[];
  showInNav?: boolean;
  element: ComponentType;
}

// Lazy load components
import DashboardPage from '../pages/DashboardPage';
import DebugLibraryPage from '../pages/DebugLibraryPage';
import ImageLibraryPage from '../pages/ImageLibraryPage';

export const APP_ROUTES: RouteConfig[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    icon: House,
    allowedRoles: ['READER', 'EDITOR', 'ADMIN'],
    showInNav: true,
    element: DashboardPage,
  },
  {
    path: '/library',
    name: 'Library',
    icon: Images,
    allowedRoles: ['ADMIN'],
    showInNav: true,
    element: ImageLibraryPage,
  },
  {
    path: '/debug/library',
    name: 'Debug Library',
    allowedRoles: ['ADMIN'],
    showInNav: false, // Hidden from navigation menu
    element: DebugLibraryPage,
  },
];

// Helper to get route by path
export const getRouteByPath = (path: string): RouteConfig | undefined => {
  return APP_ROUTES.find(route => route.path === path);
};

// Helper to get all accessible routes for a user role
export const getAccessibleRoutes = (userRole: UserRole | null): RouteConfig[] => {
  if (!userRole) return [];
  return APP_ROUTES.filter(route => route.allowedRoles.includes(userRole));
};

// Helper to get navigation routes (only those with showInNav=true)
export const getNavigationRoutes = (userRole: UserRole | null): RouteConfig[] => {
  return getAccessibleRoutes(userRole).filter(route => route.showInNav !== false);
};
