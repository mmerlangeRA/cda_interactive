import axios, { InternalAxiosRequestConfig } from "axios";
import {
  InteractiveElement,
  InteractiveElementCreateUpdate,
  Sheet,
  SheetCreateUpdate,
  SheetPage,
  SheetPageCreateUpdate,
} from "../types";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  }
});
// Helper functions to get tokens from cookies
const getBearerToken = (): string | null => {
  return getCookieValue('bearertoken');
};

const getRefreshToken = (): string | null => {
  return getCookieValue('refreshtoken');
};

const getCookieValue = (name: string): string | null => {
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        return decodeURIComponent(cookie.substring(name.length + 1));
      }
    }
  }
  return null;
};

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getBearerToken();

  if (token) {
    // Django expects the header in HTTP_X_CSRFTOKEN format
    config.headers["Authorization"] = "Bearer " + token;
  }
  return config;
});

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

// Function to refresh the access token using the refresh token
export const refreshAccessToken = async () => {
  try {
    console.log("refreshAccessToken")
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Call the refresh token endpoint
    const response = await axios.post("/api/auth/refresh/", {
      refresh: refreshToken
    }, {
      baseURL: api.defaults.baseURL,
      headers: {
        "Content-Type": "application/json"
      }
    });

    // Update the access token in headers and cookie
    if (response.data.access) {
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      document.cookie = `bearertoken=${response.data.access}; path=/; max-age=86400; SameSite=Lax`;
    }

    // Update the refresh token if a new one is provided
    if (response.data.refresh) {
      document.cookie = `refreshtoken=${response.data.refresh}; path=/; max-age=2592000; SameSite=Lax`;
    }

    return response.data;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is due to an expired token (401) and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Use the refreshAccessToken function to get a new access token
        await refreshAccessToken();

        // Update the Authorization header in the original request
        const token = getBearerToken();
        if (token) {
          originalRequest.headers["Authorization"] = "Bearer " + token;
        }

        // Retry the original request with the new token
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // If refresh fails, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


export const SheetsAPI = {
  list: (params?: { business_id?: string; language?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.business_id) queryParams.append('business_id', params.business_id);
    if (params?.language) queryParams.append('language', params.language);
    if (params?.search) queryParams.append('search', params.search);
    const query = queryParams.toString();
    return api.get<{ results: Sheet[]; count: number }>(`/sheets/${query ? `?${query}` : ''}`);
  },
  get: (id: number) => api.get<Sheet>(`/sheets/${id}/`),
  create: async (data: SheetCreateUpdate) => {
    await getFreshCsrfToken();
    return api.post<Sheet>('/sheets/', data);
  },
  update: async (id: number, data: SheetCreateUpdate) => {
    await getFreshCsrfToken();
    return api.put<Sheet>(`/sheets/${id}/`, data);
  },
  partialUpdate: async (id: number, data: Partial<SheetCreateUpdate>) => {
    await getFreshCsrfToken();
    return api.patch<Sheet>(`/sheets/${id}/`, data);
  },
  delete: async (id: number) => {
    await getFreshCsrfToken();
    return api.delete(`/sheets/${id}/`);
  },
  getByBusinessId: (businessId: string) =>
    api.get<Sheet[]>(`/sheets/by_business_id/?business_id=${businessId}`),
};

export const SheetPagesAPI = {
  list: (params?: { sheet?: number; business_id?: string; language?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.sheet) queryParams.append('sheet', params.sheet.toString());
    if (params?.business_id) queryParams.append('business_id', params.business_id);
    if (params?.language) queryParams.append('language', params.language);
    if (params?.search) queryParams.append('search', params.search);
    const query = queryParams.toString();
    return api.get<{ results: SheetPage[]; count: number }>(`/pages/${query ? `?${query}` : ''}`);
  },
  get: (id: number) => api.get<SheetPage>(`/pages/${id}/`),
  create: async (data: SheetPageCreateUpdate) => {
    await getFreshCsrfToken();
    return api.post<SheetPage>('/pages/', data);
  },
  update: async (id: number, data: SheetPageCreateUpdate) => {
    await getFreshCsrfToken();
    return api.put<SheetPage>(`/pages/${id}/`, data);
  },
  partialUpdate: async (id: number, data: Partial<SheetPageCreateUpdate>) => {
    await getFreshCsrfToken();
    return api.patch<SheetPage>(`/pages/${id}/`, data);
  },
  delete: async (id: number) => {
    await getFreshCsrfToken();
    return api.delete(`/pages/${id}/`);
  },
  getByBusinessId: (businessId: string) =>
    api.get<SheetPage[]>(`/pages/by_business_id/?business_id=${businessId}`),
};

export const InteractiveElementsAPI = {
  list: (params?: { page?: number; business_id?: string; language?: string; type?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.business_id) queryParams.append('business_id', params.business_id);
    if (params?.language) queryParams.append('language', params.language);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.search) queryParams.append('search', params.search);
    const query = queryParams.toString();
    return api.get<{ results: InteractiveElement[]; count: number }>(`/elements/${query ? `?${query}` : ''}`);
  },
  get: (id: number) => api.get<InteractiveElement>(`/elements/${id}/`),
  create: async (data: InteractiveElementCreateUpdate) => {
    await getFreshCsrfToken();
    return api.post<InteractiveElement>('/elements/', data);
  },
  update: async (id: number, data: InteractiveElementCreateUpdate) => {
    await getFreshCsrfToken();
    return api.put<InteractiveElement>(`/elements/${id}/`, data);
  },
  partialUpdate: async (id: number, data: Partial<InteractiveElementCreateUpdate>) => {
    await getFreshCsrfToken();
    return api.patch<InteractiveElement>(`/elements/${id}/`, data);
  },
  delete: async (id: number) => {
    await getFreshCsrfToken();
    return api.delete(`/elements/${id}/`);
  },
  getByBusinessId: (businessId: string) =>
    api.get<InteractiveElement[]>(`/elements/by_business_id/?business_id=${businessId}`),
};

export default api;
