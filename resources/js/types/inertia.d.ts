import type { AuthUser } from '@/types/auth'
import type { SidebarConfig } from '@/types/sidebar'

declare module '@inertiajs/core' {
    interface PageProps {
        name: string
        locale: string
        translations: Record<string, unknown>
        school: Record<string, unknown> | null
        sidebar: SidebarConfig
        auth: {
            user: AuthUser | null
        }
        flash: {
            message: string | null
            error: string | null
        }
    }
}

export {}
