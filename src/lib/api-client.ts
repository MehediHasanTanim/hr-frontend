import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import { useAuthStore } from "@/features/auth/stores/authStore";
import type { ApiErrorResponse, RefreshResponse } from "@/types/api";

interface RetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

type QueueItem = {
  resolve: (token: string) => void;
  reject: (error: AxiosError<ApiErrorResponse>) => void;
};

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

function processQueue(error: AxiosError<ApiErrorResponse> | null, token: string | null) {
  failedQueue.forEach((request) => {
    if (error || !token) {
      request.reject(error ?? new AxiosError("Unable to refresh session"));
      return;
    }

    request.resolve(token);
  });

  failedQueue = [];
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8025",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export function getAccessToken() {
  return useAuthStore.getState().accessToken;
}

function redirectToLogin() {
  if (typeof window !== "undefined") {
    window.location.assign("/login");
  }
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();

  if (token) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as RetryRequestConfig | undefined;
    const requestUrl = originalRequest?.url ?? "";

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      requestUrl.includes("/api/v1/auth/")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise<AxiosResponse>((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            const headers = AxiosHeaders.from(originalRequest.headers);
            headers.set("Authorization", `Bearer ${token}`);
            originalRequest.headers = headers;
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const response = await axios.post<RefreshResponse>(
        `${apiClient.defaults.baseURL ?? ""}/api/v1/auth/refresh`,
        {},
        { withCredentials: true },
      );
      const token = response.data.access;
      const currentUser = useAuthStore.getState().user;

      useAuthStore.getState().setAuth(token, response.data.user ?? currentUser);
      processQueue(null, token);

      const headers = AxiosHeaders.from(originalRequest.headers);
      headers.set("Authorization", `Bearer ${token}`);
      originalRequest.headers = headers;

      return apiClient(originalRequest);
    } catch (refreshError) {
      const refreshAxiosError =
        refreshError instanceof AxiosError
          ? refreshError
          : new AxiosError<ApiErrorResponse>("Unable to refresh session");
      processQueue(refreshAxiosError, null);
      useAuthStore.getState().clearAuth();
      redirectToLogin();
      return Promise.reject(refreshAxiosError);
    } finally {
      isRefreshing = false;
    }
  },
);

export function readApiErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallback;
  }

  return (
    error.response?.data?.detail ??
    error.response?.data?.message ??
    error.response?.data?.non_field_errors?.[0] ??
    fallback
  );
}
