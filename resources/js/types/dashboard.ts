export type StatStatus = 'ok' | 'warn' | 'down' | 'good' | 'bad' | 'neutral'
export type StatTone = 'default' | 'accent' | 'success' | 'warning' | 'danger'

export interface Stat {
    label: string
    value: string | number
    icon?: string
    trend?: number
    trendLabel?: string
    tone?: StatTone
    href?: string
    status?: StatStatus
}

export interface StatCard {
    title?: string
    items: Stat[]
}
