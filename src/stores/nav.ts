// src/store/navStore.ts
import { create } from 'zustand';
import type { NavigateFunction } from 'react-router-dom';

interface NavStore {
    navigate: NavigateFunction | null;
    historyLength: number;
    canGoBack: boolean;

    setNavigate: (nav: NavigateFunction) => void;
    forward: (url: string) => void;
    back: () => void;
    goto: (url: string) => void;
    replace: (url: string) => void;
}

const useNavStore = create<NavStore>((set, get) => ({
    navigate: null,
    historyLength: 0,
    canGoBack: false,

    setNavigate: (nav) => set({ navigate: nav }),

    forward: (url) => {
        const nav = get().navigate;
        if (!nav) return;

        const newLen = get().historyLength + 1;
        set({ historyLength: newLen, canGoBack: true });
        nav(url);
    },

    back: () => {
        const nav = get().navigate;
        const len = get().historyLength;
        if (!nav) return;

        if (len <= 0) {
            set({ canGoBack: false });
            nav(-1);
            return;
        }

        const nextLen = len - 1;
        set({ historyLength: nextLen, canGoBack: nextLen > 0 });
        nav(-1);
    },

    goto: (url) => {
        const nav = get().navigate;
        if (!nav) return;

        set({ historyLength: 0, canGoBack: false });
        nav(url);
    },

    replace: (url) => {
        const nav = get().navigate;
        if (!nav) return;

        nav(url, { replace: true });
    },
}));

export default useNavStore;