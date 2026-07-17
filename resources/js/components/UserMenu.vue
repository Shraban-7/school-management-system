<script setup lang="ts">
import { Link, router, usePage } from '@inertiajs/vue3'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useI18n } from '@/composables/useI18n'
import type { AuthUser } from '@/types/auth'

const page = usePage()
const user = computed<AuthUser | null>(() => page.props.auth?.user ?? null)
const { t } = useI18n()

const open = ref(false)
const root = ref<HTMLElement | null>(null)

function toggle() {
    open.value = !open.value
}

function close() {
    open.value = false
}

function logout() {
    close()
    router.post('/logout')
}

function onDocumentClick(event: MouseEvent) {
    if (!open.value || !root.value) {
        return
    }
    if (!root.value.contains(event.target as Node)) {
        close()
    }
}

onMounted(() => {
    document.addEventListener('click', onDocumentClick)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', onDocumentClick)
})

const initial = computed(() => user.value?.name?.charAt(0).toUpperCase() ?? '?')
const dashboardByRole: Record<string, string> = {
    admin: '/admin/dashboard',
    headmaster: '/headmaster/dashboard',
    teacher: '/teacher/dashboard',
    student: '/student/dashboard',
    staff: '/staff/dashboard',
    parent: '/parent/dashboard',
}
const dashboardUrl = computed(() =>
    user.value ? dashboardByRole[user.value.role] ?? '/' : null,
)

const roleLabels: Record<string, string> = {
    admin: 'Admin',
    headmaster: 'Headmaster',
    teacher: 'Teacher',
    student: 'Student',
    staff: 'Staff',
    parent: 'Parent/Guardian',
}
const roleLabel = computed(() =>
    user.value ? roleLabels[user.value.role] ?? user.value.role : 'Guest',
)
</script>

<template>
    <div ref="root" class="relative">
        <button
            type="button"
            class="flex items-center gap-2 rounded-md p-1 pr-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            :aria-expanded="open"
            aria-haspopup="true"
            @click="toggle"
        >
            <span
                class="flex h-8 w-8 items-center justify-center rounded-full bg-accent-600 text-sm font-semibold text-white"
                aria-hidden="true"
            >
                {{ initial }}
            </span>
            <span class="hidden text-left sm:block">
                <span class="block text-sm font-medium leading-tight text-slate-900 dark:text-slate-100">
                    {{ user?.name ?? 'Guest' }}
                </span>
                <span class="block text-xs leading-tight text-slate-500 dark:text-slate-400">
                    {{ roleLabel }}
                </span>
            </span>
            <AppIcon name="chevron-down" class="hidden h-4 w-4 text-slate-400 sm:block" />
        </button>

        <Transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
        >
            <div
                v-if="open"
                class="absolute right-0 z-40 mt-2 w-60 origin-top-right overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
            >
                <div class="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                    <p class="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {{ user?.name ?? 'Guest' }}
                    </p>
                    <p v-if="user?.email" class="truncate text-xs text-slate-500 dark:text-slate-400">
                        {{ user.email }}
                    </p>
                    <p v-if="user?.phone" class="truncate text-xs text-slate-500 dark:text-slate-400">
                        {{ user.phone }}
                    </p>
                    <span
                        class="mt-2 inline-flex rounded-full bg-accent-100 px-2 py-0.5 text-[11px] font-semibold text-accent-700 dark:bg-accent-900 dark:text-accent-200"
                    >
                        {{ roleLabel }}
                    </span>
                </div>
                <div class="py-1">
                    <Link
                        v-if="dashboardUrl"
                        :href="dashboardUrl"
                        class="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                        @click="close"
                    >
                        <AppIcon name="grid" class="h-4 w-4 text-slate-400" />
                        {{ t('nav.dashboard') }}
                    </Link>
                    <Link
                        href="/profile"
                        class="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                        @click="close"
                    >
                        <AppIcon name="user" class="h-4 w-4 text-slate-400" />
                        {{ t('nav.my_profile') }}
                    </Link>
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener"
                        class="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                        @click="close"
                    >
                        <AppIcon name="globe" class="h-4 w-4 text-slate-400" />
                        {{ t('nav.go_to_website') }}
                    </a>
                </div>
                <div class="flex items-center justify-between border-t border-slate-200 px-4 py-2 dark:border-slate-700">
                    <span class="text-xs text-slate-500 dark:text-slate-400">{{ t('profile.theme') }}</span>
                    <ThemeToggle />
                </div>
                <div class="border-t border-slate-200 py-1 dark:border-slate-700">
                    <button
                        type="button"
                        class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                        @click="logout"
                    >
                        <AppIcon name="logout" class="h-4 w-4" />
                        {{ t('profile.sign_out') }}
                    </button>
                </div>
            </div>
        </Transition>
    </div>
</template>
