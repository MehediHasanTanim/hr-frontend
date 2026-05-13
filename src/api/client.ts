import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

export interface ApiErrorPayload {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  status: number;
  errors: Record<string, string[]> | undefined;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.status = payload.status;
    this.errors = payload.errors;
  }
}

export function getAccessToken(): string | null {
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readMessage(data: unknown): string | undefined {
  if (!isRecord(data) || typeof data.message !== "string") {
    return undefined;
  }

  return data.message;
}

function readErrors(data: unknown): Record<string, string[]> | undefined {
  if (!isRecord(data) || !isRecord(data.errors)) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(data.errors).filter(
      (entry): entry is [string, string[]] =>
        typeof entry[0] === "string" &&
        Array.isArray(entry[1]) &&
        entry[1].every((item) => typeof item === "string"),
    ),
  );
}

function normalizeApiError(error: AxiosError): ApiError {
  const status = error.response?.status ?? 0;
  const responseData = error.response?.data;
  const errors = readErrors(responseData);

  return new ApiError({
    status,
    message: readMessage(responseData) ?? error.message,
    ...(errors ? { errors } : {}),
  });
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

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
  (error: AxiosError) => Promise.reject(normalizeApiError(error)),
);
