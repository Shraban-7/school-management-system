import type { AuthUser } from '@/types/auth'

declare module '@inertiajs/core' {
    interface PageProps {
        name: string
        auth: {
            user: AuthUser | null
        }
        flash: {
            message: string | null
        }
    }
}

export {}
