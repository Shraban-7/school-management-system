<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3'
import { computed } from 'vue'
import KpiCard from '@/components/KpiCard.vue'
import type { Stat } from '@/types/dashboard'

defineProps<{
    role: string
    title: string
    subtitle?: string
    stats?: Stat[]
    actions?: Array<{ label: string; href: string }>
}>()

const page = usePage()
const user = computed(() => page.props.auth?.user ?? null)
const flash = computed(() => page.props.flash?.message ?? null)
</script>

<template>
    <div class="space-y-6">
        <div
            v-if="flash"
            class="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
        >
            {{ flash }}
        </div>

        <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p class="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    {{ role }} dashboard
                </p>
                <h1 class="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
                    {{ title }}
                </h1>
                <p v-if="subtitle" class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Welcome back, <span class="font-medium text-slate-900 dark:text-slate-100">{{ user?.name ?? 'there' }}</span>.
                    {{ subtitle }}
                </p>
            </div>

            <div v-if="actions && actions.length" class="flex flex-wrap gap-2">
                <Link
                    v-for="action in actions"
                    :key="action.href"
                    :href="action.href"
                    class="inline-flex items-center gap-1.5 rounded-md bg-accent-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
                >
                    {{ action.label }}
                </Link>
            </div>
        </header>

        <section
            v-if="stats && stats.length"
            class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
            <KpiCard
                v-for="(stat, i) in stats"
                :key="stat.label"
                :label="stat.label"
                :value="stat.value"
                :icon="stat.icon"
                :trend="stat.trend"
                :trend-label="stat.trendLabel"
                :tone="stat.tone"
                :href="stat.href"
            />
        </section>

        <slot />
    </div>
</template>
