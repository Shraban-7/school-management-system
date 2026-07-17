<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

withDefaults(
    defineProps<{
        variant?: 'public' | 'dashboard'
    }>(),
    {
        variant: 'public',
    },
)

const { locale, t, setLocale } = useI18n()
</script>

<template>
    <div
        class="inline-flex items-center overflow-hidden rounded-md border text-xs font-semibold"
        :class="
            variant === 'public'
                ? 'border-[#1e2875]/20'
                : 'border-slate-200 dark:border-slate-700'
        "
        role="group"
        :aria-label="t('site.language')"
    >
        <button
            type="button"
            class="px-2.5 py-1.5 transition"
            :class="
                locale === 'en'
                    ? variant === 'public'
                        ? 'bg-[#1e2875] text-[#f7f3e8]'
                        : 'bg-accent-600 text-white'
                    : variant === 'public'
                      ? 'text-[#1a1a1a]/70 hover:bg-[#1e2875]/10'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            "
            :aria-pressed="locale === 'en'"
            @click="setLocale('en')"
        >
            EN
        </button>
        <button
            type="button"
            class="px-2.5 py-1.5 transition"
            :class="
                locale === 'bn'
                    ? variant === 'public'
                        ? 'bg-[#1e2875] text-[#f7f3e8]'
                        : 'bg-accent-600 text-white'
                    : variant === 'public'
                      ? 'text-[#1a1a1a]/70 hover:bg-[#1e2875]/10'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            "
            :aria-pressed="locale === 'bn'"
            @click="setLocale('bn')"
        >
            বাং
        </button>
    </div>
</template>
