import { create } from "zustand";

export interface UiStoreState {
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiStoreState>((set) => ({
  isSidebarOpen: true,
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));

export const useSidebarOpen = () =>
  useUiStore((state) => state.isSidebarOpen);

export const useToggleSidebar = () =>
  useUiStore((state) => state.toggleSidebar);
