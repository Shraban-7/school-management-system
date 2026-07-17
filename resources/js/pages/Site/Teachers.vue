<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import PublicLayout from '@/layouts/PublicLayout.vue';

defineOptions({ layout: PublicLayout });

interface Person {
    id: number;
    name_en: string;
    name_bn: string | null;
    designation: string | null;
    qualification: string | null;
    subject_specialization: string | null;
}

defineProps<{ people: Person[] }>();

function initials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');
}
</script>

<template>
    <div>
        <Head title="Teachers" />

        <section class="bg-[#1e2875] text-[#f7f3e8]">
            <div class="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
                <p class="text-xs font-semibold tracking-[0.25em] text-[#c9a227] uppercase">Faculty</p>
                <div class="mt-2 h-px w-16 bg-[#c9a227]" aria-hidden="true"></div>
                <h1 class="mt-5 font-serif text-3xl font-bold sm:text-4xl">Our Teachers</h1>
            </div>
        </section>

        <section class="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
            <div v-if="people.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div
                    v-for="person in people"
                    :key="person.id"
                    class="rounded-lg border border-[#1e2875]/10 bg-white p-6 shadow-sm"
                >
                    <div class="flex items-center gap-4">
                        <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1e2875] font-serif text-lg font-bold text-[#f7f3e8] ring-2 ring-[#c9a227]">
                            {{ initials(person.name_en) }}
                        </span>
                        <div class="min-w-0">
                            <p class="truncate font-serif text-lg font-bold text-[#1e2875]">
                                {{ person.name_en }}
                            </p>
                            <p v-if="person.designation" class="text-xs font-semibold tracking-widest text-[#c9a227] uppercase">
                                {{ person.designation }}
                            </p>
                        </div>
                    </div>

                    <dl class="mt-4 space-y-2 border-t border-[#1e2875]/10 pt-4 text-sm">
                        <div v-if="person.subject_specialization">
                            <dt class="text-xs font-semibold text-[#1a1a1a]/50 uppercase">Subject</dt>
                            <dd class="text-[#1a1a1a]/80">{{ person.subject_specialization }}</dd>
                        </div>
                        <div v-if="person.qualification">
                            <dt class="text-xs font-semibold text-[#1a1a1a]/50 uppercase">Qualification</dt>
                            <dd class="text-[#1a1a1a]/80">{{ person.qualification }}</dd>
                        </div>
                    </dl>
                </div>
            </div>
            <p v-else class="rounded-lg border border-dashed border-[#1e2875]/20 p-8 text-center text-sm text-[#1a1a1a]/60">
                Teacher profiles will appear here soon.
            </p>
        </section>
    </div>
</template>
