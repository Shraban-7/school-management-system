import React from 'react';
import AppIcon from '@/components/AppIcon';
import { useTheme } from '@/composables/useTheme';

export default function ThemeToggle() {
    const { theme, toggle } = useTheme();

    return (
        <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            onClick={toggle}
        >
            {theme === 'dark' ? (
                <AppIcon name="sun" className="h-5 w-5" />
            ) : (
                <AppIcon name="moon" className="h-5 w-5" />
            )}
        </button>
    );
}
