import { create } from 'zustand';
import { Store } from '@tauri-apps/plugin-store';

interface SettingsState {
    theme: 'light' | 'dark' | 'system';
    language: string;
    autoSave: boolean;
    setTheme: (theme: SettingsState['theme']) => void;
    setLanguage: (lang: string) => void;
    setAutoSave: (enabled: boolean) => void;
    load: () => Promise<void>;
    save: () => Promise<void>;
}

let store: Store | null = null;

const useSettingsStore = create<SettingsState>((set, get) => ({
    theme: 'system',
    language: 'zh-CN',
    autoSave: true,

    setTheme: (theme) => {
        set({ theme });
        get().save();
    },
    setLanguage: (language) => {
        set({ language });
        get().save();
    },
    setAutoSave: (autoSave) => {
        set({ autoSave });
        get().save();
    },

    load: async () => {
        if (!store) {
            store = await Store.load('settings.json', { autoSave: false });
        }
        const theme = await store.get<'light' | 'dark' | 'system'>('theme') ?? 'system';
        const language = await store.get<string>('language') ?? 'zh-CN';
        const autoSave = await store.get<boolean>('autoSave') ?? true;
        set({ theme, language, autoSave });
    },

    save: async () => {
        if (!store) return;
        const { theme, language, autoSave } = get();
        await store.set('theme', theme);
        await store.set('language', language);
        await store.set('autoSave', autoSave);
        await store.save();
    },
}));

export default useSettingsStore;