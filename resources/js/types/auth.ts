export type UserRole = 'admin' | 'headmaster' | 'teacher' | 'student' | 'staff'

export interface AuthUser {
    id: number
    name: string
    email: string
    phone: string
    role: UserRole
    is_active: boolean
    email_verified_at: string | null
    phone_verified_at: string | null
    created_at: string
    updated_at: string
}

export interface AuthProps {
    user: AuthUser | null
}
