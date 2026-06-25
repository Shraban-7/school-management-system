export interface SidebarItem {
    label: string
    href: string
    match?: string
    icon: string
    badge?: number | string
    permission?: string
    active?: boolean
}

export interface SidebarGroup {
    title?: string
    items: SidebarItem[]
}

export type SidebarConfig = SidebarGroup[]
