import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import AppIcon from '@/components/AppIcon';
import type { SidebarItem, SidebarGroup as SidebarGroupType } from '@/types/sidebar';

interface SidebarGroupProps {
    groups: SidebarGroupType[];
    collapsed?: boolean;
}

export default function SidebarGroup({ groups, collapsed = false }: SidebarGroupProps) {
    const page = usePage();
    const currentUrl = page.url;

    function isActive(item: SidebarItem): boolean {
        if (item.active !== undefined) {
            return item.active;
        }
        const match = item.match ?? item.href.replace(/^\//, '');
        if (match === '' || match === '/') {
            return currentUrl === '/';
        }
        return currentUrl === `/${match}` || currentUrl.startsWith(`/${match}/`);
    }

    function linkClass(active: boolean): string {
        return [
            'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            active
                ? 'bg-accent-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-white/5 hover:text-white',
        ].join(' ');
    }

    return (
        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
            {groups.map((group, gi) => (
                <div key={gi} className="flex flex-col gap-1">
                    {group.title && !collapsed && (
                        <p className="px-3 pb-1 text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
                            {group.title}
                        </p>
                    )}
                    {group.items.map((item, i) => {
                        const active = isActive(item);
                        return (
                            <Link
                                key={`${gi}-${i}-${item.href}`}
                                href={item.href}
                                className={`${linkClass(active)} ${collapsed ? 'justify-center px-2' : ''}`}
                                title={collapsed ? item.label : undefined}
                                aria-current={active ? 'page' : undefined}
                            >
                                <AppIcon
                                    name={item.icon}
                                    className={`h-5 w-5 shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}
                                />
                                {!collapsed && (
                                    <span className="flex-1 truncate">{item.label}</span>
                                )}
                                {!collapsed && item.badge && (
                                    <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-600 px-1.5 text-[10px] font-semibold text-white">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            ))}
        </nav>
    );
}
