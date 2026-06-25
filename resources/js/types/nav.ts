export interface NavLink {
    label: string
    href: string
    match?: string
    icon?: string
    active?: boolean
}

export interface NavAction {
    label: string
    href?: string
    onClick?: () => void
    variant?: 'primary' | 'secondary'
}
