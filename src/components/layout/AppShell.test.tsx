import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { apiClient } from "@/lib/api-client";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/settings/company",
  useRouter: () => ({ push: vi.fn() }),
}));

function renderWithQuery(ui: React.ReactNode) {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      {ui}
    </QueryClientProvider>,
  );
}

describe("App shell components", () => {
  beforeEach(() => {
    useAuthStore.getState().setAuth("token", {
      id: "1",
      name: "Ada",
      email: "ada@example.com",
      role: "admin",
    });
    apiClient.defaults.adapter = async (config) => ({
      status: 200,
      statusText: "OK",
      headers: {},
      config,
      data: { unreadCount: 3 },
    });
  });

  it("renders sidebar navigation items", () => {
    render(<Sidebar mobileOpen={false} onMobileOpenChange={vi.fn()} />);

    expect(screen.getAllByLabelText("Dashboard").length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText("Orders").length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText("Products").length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText("Customers").length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText("Coupons").length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText("Settings").length).toBeGreaterThan(0);
  });

  it("opens and closes the mobile drawer", async () => {
    const user = userEvent.setup();
    function Wrapper() {
      const [open, setOpen] = React.useState(false);
      return <Sidebar mobileOpen={open} onMobileOpenChange={setOpen} />;
    }
    render(<Wrapper />);

    await user.click(screen.getByLabelText(/open navigation/i));
    expect(screen.getAllByText("CommerceOps").length).toBeGreaterThan(1);
    await user.click(screen.getByLabelText(/close navigation/i));
    expect(screen.queryByRole("button", { name: /close navigation/i })).not.toBeInTheDocument();
  });

  it("renders notification badge count", async () => {
    renderWithQuery(<Topbar />);

    expect(await screen.findByText("3")).toBeInTheDocument();
  });
});
