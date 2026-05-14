import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/features/auth/components/LoginForm";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { apiClient } from "@/lib/api-client";

const push = vi.fn();
const get = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => ({ get }),
}));

function renderWithQuery(ui: React.ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("LoginForm feature", () => {
  beforeEach(() => {
    push.mockReset();
    get.mockReturnValue(null);
    useAuthStore.getState().clearAuth();
    apiClient.defaults.adapter = async (config) => {
      if (config.url === "/api/v1/auth/login") {
        const data = JSON.parse(String(config.data ?? "{}")) as { email?: string };
        if (data.email === "bad@example.com") {
          return Promise.reject({
            isAxiosError: true,
            config,
            response: {
              status: 400,
              statusText: "Bad Request",
              headers: {},
              config,
              data: { detail: "Invalid credentials" },
            },
          });
        }
        return {
          status: 200,
          statusText: "OK",
          headers: {},
          config,
          data: {
            access: "access-token",
            user: { id: "1", name: "Ada", email: "ada@example.com", role: "admin" },
          },
        };
      }
      throw new Error(`Unhandled ${config.url ?? ""}`);
    };
  });

  it("renders validation errors", async () => {
    const user = userEvent.setup();
    renderWithQuery(<LoginForm />);

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("stores the access token and redirects on success", async () => {
    const user = userEvent.setup();
    renderWithQuery(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "person@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/dashboard"));
    expect(useAuthStore.getState().accessToken).toBe("access-token");
  });

  it("renders API errors and loading state", async () => {
    const user = userEvent.setup();
    renderWithQuery(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "bad@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid credentials");
  });

  it("disables submit while the login request is pending", async () => {
    const user = userEvent.setup();
    apiClient.defaults.adapter = async () => new Promise(() => undefined);
    renderWithQuery(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "person@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByRole("button", { name: /sign in/i })).toBeDisabled();
  });
});
