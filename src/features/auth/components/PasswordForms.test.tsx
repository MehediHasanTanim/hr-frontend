import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import { apiClient } from "@/lib/api-client";

const push = vi.fn();
const replace = vi.fn();
let token: string | null = "reset-token";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
  useSearchParams: () => ({ get: () => token }),
}));

function renderWithQuery(ui: React.ReactNode) {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      {ui}
    </QueryClientProvider>,
  );
}

describe("Forgot and reset password forms", () => {
  beforeEach(() => {
    push.mockReset();
    replace.mockReset();
    token = "reset-token";
    apiClient.defaults.adapter = async (config) => ({
      status: 200,
      statusText: "OK",
      headers: {},
      config,
      data: {},
    });
  });

  it("always renders forgot password success after submit", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText(/email/i), "person@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    expect(await screen.findByText(/if this email exists/i)).toBeInTheDocument();
  });

  it("redirects when reset token is missing", async () => {
    token = null;
    renderWithQuery(<ResetPasswordForm />);

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/forgot-password"));
  });

  it("redirects to login after reset success", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ResetPasswordForm />);

    await user.type(screen.getByLabelText(/new password/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");
    await user.click(screen.getByRole("button", { name: /reset password/i }));

    expect(await screen.findByText(/password reset successful/i)).toBeInTheDocument();
    await waitFor(() => expect(push).toHaveBeenCalledWith("/login"), { timeout: 3000 });
  }, 8000);

  it("renders an expired token error with a forgot password link", async () => {
    const user = userEvent.setup();
    apiClient.defaults.adapter = async (config) =>
      Promise.reject({
        isAxiosError: true,
        config,
        response: {
          status: 400,
          statusText: "Bad Request",
          headers: {},
          config,
          data: { detail: "This reset link is invalid or expired" },
        },
      });
    renderWithQuery(<ResetPasswordForm />);

    await user.type(screen.getByLabelText(/new password/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");
    await user.click(screen.getByRole("button", { name: /reset password/i }));

    expect(await screen.findByText("This reset link is invalid or expired")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /request a new reset link/i })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
  });
});
