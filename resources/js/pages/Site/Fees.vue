<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import PublicLayout from '@/layouts/PublicLayout.vue';
import { richTextHtml } from '@/lib/richText';

defineOptions({ layout: PublicLayout });

interface PublicSchool {
    name_en: string | null;
    fee_notes: string | null;
    phone: string | null;
}

interface FeeItem {
    id: number;
    fee_type: string;
    fee_type_label: string;
    name_en: string;
    name_bn: string | null;
    amount: number;
    class_label: string;
}

interface FeeGroup {
    type: string;
    label: string;
    description: string;
    items: FeeItem[];
}

defineProps<{
    school: PublicSchool;
    feeGroups: FeeGroup[];
}>();

function formatBdt(amount: number): string {
    return '৳' + amount.toLocaleString('en-BD', { maximumFractionDigits: 0 });
}
</script>

<template>
    <div>
        <Head title="Fees" />

        <section class="bg-[#1e2875] text-[#f7f3e8]">
            <div class="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
                <p class="text-xs font-semibold tracking-[0.25em] text-[#c9a227] uppercase">Accounts</p>
                <div class="mt-2 h-px w-16 bg-[#c9a227]" aria-hidden="true"></div>
                <h1 class="mt-5 font-serif text-3xl font-bold sm:text-4xl">Fee structure</h1>
                <p class="mt-3 max-w-2xl text-[#f7f3e8]/80">
                    Admission fee, monthly tuition, session (annual) fee, and exam fees for
                    {{ school.name_en }} — amounts in Bangladeshi Taka (৳).
                </p>
            </div>
        </section>

        <section class="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
            <div
                v-if="school.fee_notes"
                class="rich-text mb-10 max-w-3xl rounded-lg border border-[#1e2875]/10 bg-white p-6 text-sm leading-relaxed text-[#1a1a1a]/80 shadow-sm"
                v-html="richTextHtml(school.fee_notes)"
            ></div>

            <div v-if="feeGroups.length === 0" class="rounded-lg border border-dashed border-[#1e2875]/20 p-8 text-center text-sm text-[#1a1a1a]/60">
                Fee amounts have not been published yet. Please contact the accounts office
                <template v-if="school.phone"> ({{ school.phone }})</template>.
            </div>

            <div v-else class="space-y-12">
                <div v-for="group in feeGroups" :key="group.type">
                    <p class="text-xs font-semibold tracking-widest text-[#1e2875] uppercase">
                        {{ group.label }}
                    </p>
                    <div class="mt-2 h-px w-12 bg-[#c9a227]" aria-hidden="true"></div>
                    <p class="mt-3 text-sm text-[#1a1a1a]/65">
                        {{ group.description }}
                    </p>

                    <div class="mt-5 overflow-x-auto rounded-lg border border-[#1e2875]/10 bg-white shadow-sm">
                        <table class="min-w-full text-left text-sm">
                            <thead class="border-b border-[#1e2875]/10 bg-[#1e2875]/5 text-xs font-semibold tracking-wider text-[#1e2875] uppercase">
                                <tr>
                                    <th class="px-4 py-3">Class</th>
                                    <th class="px-4 py-3">Fee name</th>
                                    <th class="px-4 py-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-[#1e2875]/8">
                                <tr
                                    v-for="item in group.items"
                                    :key="item.id"
                                    class="text-[#1a1a1a]/85"
                                >
                                    <td class="px-4 py-3 font-medium">{{ item.class_label }}</td>
                                    <td class="px-4 py-3">
                                        <span>{{ item.name_en }}</span>
                                        <span
                                            v-if="item.name_bn"
                                            class="mt-0.5 block text-xs text-[#1a1a1a]/50"
                                        >
                                            {{ item.name_bn }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 text-right font-serif text-lg font-bold text-[#1e2875]">
                                        {{ formatBdt(item.amount) }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="mt-12 flex flex-wrap gap-4">
                <Link
                    href="/admission"
                    class="rounded bg-[#1e2875] px-5 py-2.5 text-sm font-semibold text-[#f7f3e8] transition-colors hover:bg-[#c9a227] hover:text-[#1a1a1a]"
                >
                    Admission guidelines
                </Link>
                <Link
                    href="/contact"
                    class="rounded border border-[#1e2875]/20 px-5 py-2.5 text-sm font-semibold text-[#1e2875] transition-colors hover:border-[#c9a227]"
                >
                    Contact accounts
                </Link>
            </div>
        </section>
    </div>
</template>
