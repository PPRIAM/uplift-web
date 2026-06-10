// store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Définition de la structure de l'utilisateur authentifié
interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'attendee' | 'admin';
}

// Définition de l'état d'authentification global
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  updateUser: (data: Partial<AuthUser>) => void;
}

/**
 * Store Zustand pour gérer l'état d'authentification utilisateur.
 * Utilise le middleware 'persist' pour stocker automatiquement l'état
 * dans le localStorage sous la clé 'ayibuzz-auth' afin de maintenir
 * la session active après rechargement de la page.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      // Action pour connecter l'utilisateur et mettre à jour le store
      login: (user) => set({ user, isAuthenticated: true }),
      // Action pour déconnecter l'utilisateur en réinitialisant les informations
      logout: () => set({ user: null, isAuthenticated: false }),
      // Action pour mettre à jour partiellement les données de profil de l'utilisateur connecté
      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
    }),
    { name: 'ayibuzz-auth' }
  )
);

