import { create } from 'zustand';

type ToastStore = {
  seq: number;
  visible: boolean;
  message: string;
  show: (message: string) => void;
  hide: () => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  seq: 0,
  visible: false,
  message: '',
  show: (message) =>
    set((state) => ({
      seq: state.seq + 1,
      visible: true,
      message,
    })),
  hide: () => set({ visible: false }),
}));
