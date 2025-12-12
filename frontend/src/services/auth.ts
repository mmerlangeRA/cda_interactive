import { User } from '../types/auth';
import api from "./api";

// Helper function to get fresh CSRF token and update cookie
const getFreshCsrfToken = async () => {
  const response = await api.get("/auth/csrf/");
  const token = response.data.csrfToken;

  // Update the CSRF token in both headers and cookie
  api.defaults.headers.common['X-CSRFTOKEN'] = token;

  // Update the cookie
  document.cookie = `csrftoken=${token}; path=/`;

  return token;
};

interface LoginResponse {
  message: string;
  user: User;
  access?: string;
  refresh?: string;
}

interface AuthCheckResponse {
  isAuthenticated: boolean;
  user?: User;
}


export const login = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  try {
    // Get a fresh CSRF token before making the login request
    await getFreshCsrfToken();

    const response = await api.post("/auth/login/", {
      username: username,
      password,
    });

    // If we have an access token, store it for future API calls
    if (response.data.access) {
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;

      // Store the access token in a cookie for persistence across page refreshes
      document.cookie = `bearertoken=${response.data.access}; path=/; max-age=86400; SameSite=Lax`;
    }

    // Store the refresh token in a cookie with longer expiration
    if (response.data.refresh) {
      document.cookie = `refreshtoken=${response.data.refresh}; path=/; max-age=2592000; SameSite=Lax`;
    }

    // Update CSRF token from login response if provided
    if (response.data.csrfToken) {
      api.defaults.headers.common['X-CSRFTOKEN'] = response.data.csrfToken;
    }

    // Also check for CSRF token in response headers
    const headerToken = response.headers['x-csrftoken'];
    if (headerToken) {
      api.defaults.headers.common['X-CSRFTOKEN'] = headerToken;
    }

    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    // Get a fresh CSRF token before making the logout request
    await getFreshCsrfToken();

    // The Authorization header should already be set from login if the user is logged in
    // Make sure we keep it for the logout request so the backend can identify the session
    await api.post("/auth/logout/");

    // Clear CSRF token and other auth headers after logout
    delete api.defaults.headers.common['X-CSRFTOKEN'];
    delete api.defaults.headers.common['Authorization'];

    // Clear the bearer token and refresh token cookies
    document.cookie = 'bearertoken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    document.cookie = 'refreshtoken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const checkAuth = async (): Promise<AuthCheckResponse> => {
  const response = await api.get("/auth/check/");
  return response.data;
};
