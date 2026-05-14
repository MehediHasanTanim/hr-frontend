import axios, { AxiosError } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthStore } from "@/features/auth/stores/authStore";
import { apiClient } from "@/lib/api-client";

describe("apiClient token refresh", () => {
  beforeEach(() => {
    useAuthStore.getState().setAuth("old-token", {
      id: "1",
      name: "Ada",
      email: "ada@example.com",
      role: "admin",
    });
    Object.defineProperty(window, "location", {
      value: { assign: vi.fn() },
      writable: true,
    });
  });

  it("retries a 401 after refreshing the token", async () => {
    let attempts = 0;
    const refresh = vi.spyOn(axios, "post").mockResolvedValue({
      data: { access: "new-token" },
    });
    apiClient.defaults.adapter = async (config) => {
      attempts += 1;
      if (attempts === 1) {
        throw new AxiosError("Unauthorized", "401", config, {}, {
          status: 401,
          statusText: "Unauthorized",
          headers: {},
          config,
          data: { detail: "Unauthorized" },
        });
      }
      return { status: 200, statusText: "OK", headers: {}, config, data: { ok: true } };
    };

    await expect(apiClient.get("/api/v1/company")).resolves.toMatchObject({ data: { ok: true } });
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().accessToken).toBe("new-token");
    refresh.mockRestore();
  });

  it("queues concurrent 401s behind one refresh call", async () => {
    let attempts = 0;
    const refresh = vi.spyOn(axios, "post").mockResolvedValue({ data: { access: "queued-token" } });
    apiClient.defaults.adapter = async (config) => {
      attempts += 1;
      if (attempts <= 2) {
        throw new AxiosError("Unauthorized", "401", config, {}, {
          status: 401,
          statusText: "Unauthorized",
          headers: {},
          config,
          data: {},
        });
      }
      return { status: 200, statusText: "OK", headers: {}, config, data: { ok: true } };
    };

    await Promise.all([apiClient.get("/one"), apiClient.get("/two")]);

    expect(refresh).toHaveBeenCalledTimes(1);
    refresh.mockRestore();
  });

  it("clears auth and redirects when refresh fails", async () => {
    const refresh = vi.spyOn(axios, "post").mockRejectedValue(new AxiosError("Refresh failed"));
    apiClient.defaults.adapter = async (config) => {
      throw new AxiosError("Unauthorized", "401", config, {}, {
        status: 401,
        statusText: "Unauthorized",
        headers: {},
        config,
        data: {},
      });
    };

    await expect(apiClient.get("/api/v1/company")).rejects.toBeInstanceOf(AxiosError);

    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(window.location.assign).toHaveBeenCalledWith("/login");
    refresh.mockRestore();
  });
});
