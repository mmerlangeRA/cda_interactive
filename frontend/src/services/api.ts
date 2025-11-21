import axios, { InternalAxiosRequestConfig } from "axios";
import {
  Execution,
  ExecutionStatus,
  Network,
  PhotoCollection,
  Record,
  Workflow,
  WorkflowParams
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



export const RecordsAPI = {
  listActiveWorkflows: () =>
    api.get<Workflow[]>(`/records/list_active_workflows/`),
  getByNetwork: (networkUuid: string) =>
    api.get<Record[]>(`/records/?network_uuid=${networkUuid}`),
  create: async (data: { name: string; srid: number, date_time: string; network_uuid: string; network_slug?: string }) => {
    await getFreshCsrfToken();
    return api.post<Record>("/records/", data);
  },
  getRecord: (recordId: number) =>
    api.get<Record>(`/records/${recordId}/`),
  getExecutions: (recordId: number) =>
    api.get<Execution[]>(`/records/${recordId}/executions/`),
  getExecutionStatus: (executionId: number | undefined) => {
    if (!executionId) {
      return Promise.reject(new Error("No execution ID provided"));
    }
    return api.get<ExecutionStatus>(`/executions/${executionId}/status/`);
  },
  getExecutionDetails: (executionId: number) =>
    api.get<Execution>(`/executions/${executionId}/`),
  requestUpload: async (
    recordId: number,
    data: { title: string; content_type: string }
  ) => {
    await getFreshCsrfToken();
    return api.post<{ upload_url: string; blob_name: string }>(
      `/records/${recordId}/request_upload/`,
      data
    );
  },
  confirmUpload: async (
    recordId: number,
    data: { blob_name: string; title: string; content_type: string; date_time?: string }
  ) => {
    await getFreshCsrfToken();
    return api.post(`/records/${recordId}/confirm_upload/`, data);
  },
  startWorkflow: async (recordId: number, data: WorkflowParams) => {
    await getFreshCsrfToken();
    return api.post(`/records/${recordId}/start_workflow/`, data);
  },
  listBlobDownloadUrls: (recordId: number, containerType: 'raw' | 'extracted' | 'processed') =>
    api.get<{ download_urls: string[] }>(`/records/${recordId}/list_blob_download_urls/?container_type=${containerType}`),
  listBlobDownloadUrlsWithFolders: (recordId: number, containerType: 'raw' | 'extracted' | 'processed') =>
    api.get<{ folders: { [key: string]: string[] } }>(`/records/${recordId}/list_blob_download_urls_with_folders/?container_type=${containerType}`),
};

export const VideosAPI = {
  setMaster: async (videoId: number) => {
    await getFreshCsrfToken();
    return api.post(`/videos/${videoId}/set_master/`);
  },
  refreshUrl: (videoId: number) => {
    return api.get(`/videos/${videoId}/refresh_url/`);
  },
};

// Export the token helper functions for use in other components
export const TokenHelpers = {
  getBearerToken,
  getRefreshToken,
  refreshAccessToken
};

export const NetworksAPI = {
  getNetworks: async () => {
    // The Authorization header with the Bearer token will be added automatically by the request interceptor
    return api.get<Network[]>('/network/networks/');
  },
};

export const PhotoAPI = {
  getCollections: (networkSlug: string) => {
    return api.get<PhotoCollection[]>(`/photo/collections/`, {
      params: { network: networkSlug }
    });
  },
};

export const DebugAPI = {
  triggerBackendError: () => {
    // This endpoint is designed to throw an error for testing Sentry
    return api.get(`/sentry/debug/`);
  },
};

export default api;
