import { create } from "zustand";

export type ModalPayload = Record<string, unknown>;

export interface ModalStoreState {
  activeModalId: string | null;
  payload: ModalPayload | null;
  openModal: (id: string, payload?: ModalPayload) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalStoreState>((set) => ({
  activeModalId: null,
  payload: null,
  openModal: (id, payload) =>
    set({ activeModalId: id, payload: payload ?? null }),
  closeModal: () => set({ activeModalId: null, payload: null }),
}));

export const useActiveModalId = () =>
  useModalStore((state) => state.activeModalId);

export const useModalPayload = () => useModalStore((state) => state.payload);

export const useModalActions = () =>
  useModalStore((state) => ({
    openModal: state.openModal,
    closeModal: state.closeModal,
  }));
