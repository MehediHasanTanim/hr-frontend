import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { apiClient } from "@/lib/api-client";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/orders",
  useRouter: () => ({ replace }),
}));

function renderWithQuery(ui: React.ReactNode) {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      {ui}
    </QueryClientProvider>,
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    replace.mockReset();
    useAuthStore.getState().clearAuth();
  });

  it("renders children immediately when an access token exists", () => {
    useAuthStore.getState().setAuth("token", {
      id: "1",
      name: "Ada",
      email: "ada@example.com",
      role: "admin",
    });

    renderWithQuery(<ProtectedRoute>Protected content</ProtectedRoute>);

    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });

  it("silently refreshes a lost in-memory token before rendering", async () => {
    apiClient.defaults.adapter = async (config) => ({
      status: 200,
      statusText: "OK",
      headers: {},
      config,
      data: {
        access: "refreshed-token",
        user: { id: "2", name: "Grace", email: "grace@example.com", role: "admin" },
      },
    });

    renderWithQuery(<ProtectedRoute>Protected content</ProtectedRoute>);

    expect(screen.getByText(/checking session/i)).toBeInTheDocument();
    expect(await screen.findByText("Protected content")).toBeInTheDocument();
    expect(useAuthStore.getState().accessToken).toBe("refreshed-token");
  });

  it("redirects to login with next path when silent refresh fails", async () => {
    apiClient.defaults.adapter = async (config) =>
      Promise.reject({
        isAxiosError: true,
        config,
        response: {
          status: 401,
          statusText: "Unauthorized",
          headers: {},
          config,
          data: {},
        },
      });

    renderWithQuery(<ProtectedRoute>Protected content</ProtectedRoute>);

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/login?next=%2Fdashboard%2Forders"),
    );
  });
});
