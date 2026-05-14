"use client";

import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResetPasswordRequest,
} from "@/types/api";

export function useLogin() {
  return useMutation({
    mutationFn: async (payload: LoginRequest) => {
      const response = await apiClient.post<LoginResponse>("/api/v1/auth/login", payload);
      return response.data;
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (payload: RegisterRequest) => {
      const response = await apiClient.post("/api/v1/auth/register", payload);
      return response.data as unknown;
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (payload: ForgotPasswordRequest) => {
      const response = await apiClient.post("/api/v1/auth/forgot-password", payload);
      return response.data as unknown;
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (payload: ResetPasswordRequest) => {
      const response = await apiClient.post("/api/v1/auth/reset-password", payload);
      return response.data as unknown;
    },
  });
}
