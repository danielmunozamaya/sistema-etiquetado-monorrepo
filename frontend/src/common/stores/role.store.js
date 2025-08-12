import { create } from "zustand";

export const useRoleStore = create((set, get) => ({
  role: null,

  setRole: (newRole) => set({ role: newRole }),

  getRole: () => get().role,

  roleIs: (expectedRole) => get().getRole() === expectedRole,

  clearRole: () => set({ role: null }),
}));
