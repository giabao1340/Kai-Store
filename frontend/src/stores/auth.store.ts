import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, AuthResponse } from "@/types";
import { authService } from "@/services/auth.service";

// ── Định nghĩa State & Actions ─────────────────────
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  setTokens: (tokens: AuthResponse) => void;
  fetchMe: () => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  // persist → tự động lưu vào localStorage
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,

      // ── Đăng nhập ────────────────────────────────
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const data = await authService.login({ email, password });

          // Lưu token vào localStorage (persist tự làm)
          set({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
          });

          // Lấy thông tin user
          await get().fetchMe();
        } finally {
          set({ isLoading: false });
        }
      },

      // ── Đăng ký ──────────────────────────────────
      register: async (email, password, name) => {
        set({ isLoading: true });
        try {
          const data = await authService.register({ email, password, name });

          set({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
          });

          await get().fetchMe();
        } finally {
          set({ isLoading: false });
        }
      },

      // ── Đăng xuất ────────────────────────────────
      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      // ── Cập nhật tokens (dùng cho refresh) ───────
      setTokens: (tokens: AuthResponse) => {
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
        });
      },

      // ── Lấy thông tin user hiện tại ──────────────
      fetchMe: async () => {
        try {
          const user = await authService.getMe();
          set({ user, isAuthenticated: true });
        } catch {
          // Token không hợp lệ → logout
          get().logout();
        }
      },
    }),

    {
      name: "kai-auth", // tên key trong localStorage
      // Chỉ persist những field cần thiết
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

export default useAuthStore;
