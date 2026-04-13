import { create } from "zustand";

interface LeadsUiState {
  selectedIds: Set<string>;
  isDrawerOpen: boolean;
  drawerLeadId: string | null;
  isImportModalOpen: boolean;

  toggleSelect: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  openDrawer: (id: string) => void;
  closeDrawer: () => void;
  openImportModal: () => void;
  closeImportModal: () => void;
}

export const useLeadsStore = create<LeadsUiState>((set, get) => ({
  selectedIds: new Set(),
  isDrawerOpen: false,
  drawerLeadId: null,
  isImportModalOpen: false,

  toggleSelect: (id) => {
    const next = new Set(get().selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    set({ selectedIds: next });
  },

  selectAll: (ids) => set({ selectedIds: new Set(ids) }),
  clearSelection: () => set({ selectedIds: new Set() }),

  openDrawer: (id) => set({ isDrawerOpen: true, drawerLeadId: id }),
  closeDrawer: () => set({ isDrawerOpen: false, drawerLeadId: null }),

  openImportModal: () => set({ isImportModalOpen: true }),
  closeImportModal: () => set({ isImportModalOpen: false }),
}));
