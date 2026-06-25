<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/AppIcon.vue'

const props = withDefaults(
    defineProps<{
        label: string
        value: string | number
        icon?: string
        trend?: number
        trendLabel?: string
        tone?: 'default' | 'accent' | 'success' | 'warning' | 'danger'
        href?: string
    }>(),
    {
        tone: 'default',
    },
)

const toneClass = computed(() => {
    switch (props.tone) {
        case 'accent':
            return 'bg-accent-50 text-accent-600 dark:bg-accent-950/40 dark:text-accent-300'
        case 'success':
            return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300'
        case 'warning':
            return 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300'
        case 'danger':
            return 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300'
        default:
            return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
    }
})

const trendClass = computed(() => {
    if (props.trend === undefined) {
        return ''
    }
    return props.trend >= 0
        ? 'text-emerald-600 dark:text-emerald-400'
        : 'text-rose-600 dark:text-rose-400'
})
</script>

<template>
    <component
        :is="href ? 'a' : 'div'"
        :href="href"
        :class="[
            'group relative flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition dark:border-slate-800 dark:bg-slate-900',
            href ? 'hover:border-accent-300 hover:shadow dark:hover:border-accent-700' : '',
        ]"
    >
        <div class="flex items-start justify-between">
            <p class="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {{ label }}
            </p>
            <span
                v-if="icon"
                :class="['inline-flex h-9 w-9 items-center justify-center rounded-lg', toneClass]"
            >
                <AppIcon :name="icon" class="h-5 w-5" />
            </span>
        </div>
        <p class="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            {{ value }}
        </p>
        <div v-if="trend !== undefined || trendLabel" class="flex items-center gap-1.5 text-xs">
            <span
                v-if="trend !== undefined"
                :class="['inline-flex items-center gap-0.5 font-medium', trendClass]"
            >
                <AppIcon
                    :name="trend >= 0 ? 'trend-up' : 'trend-down'"
                    class="h-3.5 w-3.5"
                />
                {{ Math.abs(trend) }}%
            </span>
            <span class="text-slate-500 dark:text-slate-400">{{ trendLabel ?? 'vs last period' }}</span>
        </div>
    </component>
</template>
