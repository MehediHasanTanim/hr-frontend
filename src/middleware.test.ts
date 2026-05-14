import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { middleware } from "@/middleware";

function request(path: string, cookie?: string) {
  const init = cookie ? { headers: { cookie } } : undefined;
  return new NextRequest(`http://localhost:3000${path}`, init);
}

describe("middleware", () => {
  it("redirects unauthenticated dashboard requests to login", () => {
    const response = middleware(request("/dashboard/orders"));

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?next=%2Fdashboard%2Forders",
    );
  });

  it("redirects authenticated users away from login", () => {
    const response = middleware(request("/login", "refresh=token"));

    expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard");
  });
});
