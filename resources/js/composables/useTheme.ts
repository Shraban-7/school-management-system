import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

function readInitialTheme(): Theme {
    if (typeof window === 'undefined') {
        return 'light';
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
        return stored;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

function applyTheme(theme: Theme): void {
    if (typeof document === 'undefined') {
        return;
    }
    document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function useTheme() {
    const [theme, setThemeState] = useState<Theme>(readInitialTheme);

    useEffect(() => {
        applyTheme(theme);
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(STORAGE_KEY, theme);
        }
    }, [theme]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const listener = (event: MediaQueryListEvent) => {
            if (window.localStorage.getItem(STORAGE_KEY)) {
                return;
            }
            const next: Theme = event.matches ? 'dark' : 'light';
            setThemeState(next);
            applyTheme(next);
        };
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, []);

    const setTheme = useCallback((next: Theme): void => {
        setThemeState(next);
    }, []);

    const toggle = useCallback((): void => {
        setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
    }, []);

    return { theme, setTheme, toggle };
}
