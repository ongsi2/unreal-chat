import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/lib/types";

interface UserState {
  currentUser: User | null;
  token: string | null;
  users: User[];
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;

  // Actions
  setCurrentUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setUsers: (users: User[]) => void;
  updateUserStatus: (userId: string, isOnline: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentUser: null,
      token: null,
      users: [],
      isLoading: false,
      error: null,
      _hasHydrated: false,

      setCurrentUser: (user) => set({ currentUser: user }),

      setToken: (token) => set({ token }),

      setUsers: (users) => set({ users }),

      updateUserStatus: (userId, isOnline) =>
        set((state) => ({
          users: state.users.map((user) =>
            user.id === userId ? { ...user, isOnline } : user
          ),
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      logout: () => set({ currentUser: null, token: null }),

      setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        token: state.token
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
