import { describe, expect, it } from "vitest";

import { useUiStore } from "@/stores/ui.store";

describe("ui.store", () => {
  it("toggles the sidebar open state", () => {
    useUiStore.setState({ isSidebarOpen: true });

    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().isSidebarOpen).toBe(false);

    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().isSidebarOpen).toBe(true);
  });
});
