import { USER_ROLE, type UserRole } from "../constants/shared.constants";

import { create } from "zustand";

interface RoleStoreState {
  role: UserRole;
  setRole: (newRole: UserRole) => void;
  getRole: () => UserRole;
  roleIs: (expectedRole: UserRole) => boolean;
  clearRole: () => void;
}

export const useRoleStore = create<RoleStoreState>((set, get) => ({
  role: USER_ROLE.ETIQUETADO,

  setRole: (newRole) => set({ role: newRole }),

  getRole: () => get().role,

  roleIs: (expectedRole) => get().getRole() === expectedRole,

  clearRole: () => set({ role: USER_ROLE.ETIQUETADO }),
}));
