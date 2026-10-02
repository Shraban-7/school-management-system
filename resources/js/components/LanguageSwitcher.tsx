import React from 'react';
import { useI18n } from '@/composables/useI18n';

interface LanguageSwitcherProps {
    variant?: 'public' | 'dashboard';
}

export default function LanguageSwitcher({ variant = 'public' }: LanguageSwitcherProps) {
    const { locale, t, setLocale } = useI18n();

    const isPublic = variant === 'public';

    return (
        <div
            className={`inline-flex items-center overflow-hidden rounded-md border text-xs font-semibold ${
                isPublic ? 'border-[#1e2875]/20' : 'border-slate-200 dark:border-slate-700'
            }`}
            role="group"
            aria-label={t('site.language')}
        >
            <button
                type="button"
                className={`px-2.5 py-1.5 transition ${
                    locale === 'en'
                        ? isPublic
                            ? 'bg-[#1e2875] text-[#f7f3e8]'
                            : 'bg-accent-600 text-white'
                        : isPublic
                          ? 'text-[#1a1a1a]/70 hover:bg-[#1e2875]/10'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
                aria-pressed={locale === 'en'}
                onClick={() => setLocale('en')}
            >
                EN
            </button>
            <button
                type="button"
                className={`px-2.5 py-1.5 transition ${
                    locale === 'bn'
                        ? isPublic
                            ? 'bg-[#1e2875] text-[#f7f3e8]'
                            : 'bg-accent-600 text-white'
                        : isPublic
                          ? 'text-[#1a1a1a]/70 hover:bg-[#1e2875]/10'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
                aria-pressed={locale === 'bn'}
                onClick={() => setLocale('bn')}
            >
                বাং
            </button>
        </div>
    );
}
