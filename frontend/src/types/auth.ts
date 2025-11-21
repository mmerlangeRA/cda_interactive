export type UserRole = 'READER' | 'EDITOR' | 'ADMIN';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
