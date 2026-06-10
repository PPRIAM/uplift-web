import { create } from 'zustand';

interface Session {
  id: string;
  name: string;
  date_time?: string;
  start_time?: string;
  end_time?: string;
  location_name?: string;
  room?: string;
  speaker_name?: string;
  speaker?: {
    name: string;
    avatar_url?: string;
    bio?: string;
  };
  description?: string;
}

interface ValidationModalOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
}

interface AdminLayoutState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  selectedSession: Session | null;
  isDrawerOpen: boolean;
  setSelectedSession: (session: Session | null) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  // Validation modal state
  validationModal: ValidationModalOptions | null;
  isValidationModalOpen: boolean;
  openValidationModal: (options: ValidationModalOptions) => void;
  closeValidationModal: () => void;
}

export const useAdminLayoutStore = create<AdminLayoutState>((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  activeFilter: 'Tout',
  setActiveFilter: (filter) => set({ activeFilter: filter }),
  selectedSession: null,
  isDrawerOpen: false,
  setSelectedSession: (session) => set({ selectedSession: session, isDrawerOpen: !!session }),
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false, selectedSession: null }),
  // Validation modal implementation
  validationModal: null,
  isValidationModalOpen: false,
  openValidationModal: (options) => set({ validationModal: options, isValidationModalOpen: true }),
  closeValidationModal: () => set({ isValidationModalOpen: false, validationModal: null }),
}));

