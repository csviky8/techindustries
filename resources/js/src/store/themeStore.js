import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const themes = [
    { name: 'Indigo',   value: 'indigo',  primary: '#6366f1', bg: '#eef2ff' },
    { name: 'Blue',     value: 'blue',    primary: '#3b82f6', bg: '#eff6ff' },
    { name: 'Violet',   value: 'violet',  primary: '#8b5cf6', bg: '#f5f3ff' },
    { name: 'Rose',     value: 'rose',    primary: '#f43f5e', bg: '#fff1f2' },
    { name: 'Emerald',  value: 'emerald', primary: '#10b981', bg: '#ecfdf5' },
    { name: 'Orange',   value: 'orange',  primary: '#f97316', bg: '#fff7ed' },
    { name: 'Cyan',     value: 'cyan',    primary: '#06b6d4', bg: '#ecfeff' },
    { name: 'Slate',    value: 'slate',   primary: '#64748b', bg: '#f8fafc' },
];

export const useThemeStore = create(
    persist(
        (set) => ({
            theme: 'indigo',
            dark: false,
            setTheme: (theme) => set({ theme }),
            toggleDark: () => set((s) => ({ dark: !s.dark })),
        }),
        { name: 'theme-storage' }
    )
);
