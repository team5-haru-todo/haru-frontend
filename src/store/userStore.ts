import { create } from 'zustand';

import { getMe, type UserResponse } from '@/src/api/user';

type UserStore = {
  user: UserResponse | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
  clearUser: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  loading: false,

  fetchUser: async () => {
    set({ loading: true });
    try {
      const user = await getMe();
      set({ user, loading: false });
    } catch (error) {
      console.error('유저 정보 조회 실패:', error);
      set({ loading: false });
    }
  },

  clearUser: () => {
    set({ user: null });
  },
}));
