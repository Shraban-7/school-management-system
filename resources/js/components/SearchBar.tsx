import React from 'react';
import AppIcon from '@/components/AppIcon';

interface SearchBarProps {
    placeholder?: string;
    collapsed?: boolean;
    className?: string;
}

export default function SearchBar({
    placeholder = 'Search…',
    collapsed = false,
    className = '',
}: SearchBarProps) {
    return (
        <label
            className={`group flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 transition focus-within:border-accent-500 focus-within:ring-2 focus-within:ring-accent-500/20 dark:border-slate-700 dark:bg-slate-900 ${
                collapsed ? 'h-9 w-9 justify-center px-0' : 'h-9 w-full max-w-sm'
            } ${className}`}
        >
            <AppIcon
                name="search"
                className="h-4 w-4 shrink-0 text-slate-400 group-focus-within:text-accent-500"
            />
            {!collapsed && (
                <input
                    type="search"
                    placeholder={placeholder}
                    className="w-full border-0 bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-0 dark:text-slate-100 dark:placeholder-slate-500"
                />
            )}
        </label>
    );
}
