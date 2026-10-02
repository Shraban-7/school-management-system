import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState, FormEvent } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import AppIcon from '@/components/AppIcon';
import { useSidebarStack } from '@/composables/useNavStack';
import type { SidebarConfig } from '@/types/sidebar';

interface Props {
    structure: {
        id: number;
        institution_id: number;
        class_id: number;
        session_id: number | null;
        fee_type: string;
        name_en: string;
        name_bn: string | null;
        amount: number;
        is_active: boolean;
    };
    sidebar: SidebarConfig;
    classes: { value: number; label: string }[];
    sessions: { value: number; label: string }[];
    feeTypes: { value: string; label: string }[];
}

export default function Edit({
    structure,
    sidebar,
    classes,
    feeTypes,
}: Props) {
    const sidebarStack = useSidebarStack();
    useEffect(() => {
        sidebarStack.set(sidebar);
    }, [sidebar]);

    const [form, setForm] = useState({
        class_id: structure.class_id,
        session_id: structure.session_id,
        fee_type: structure.fee_type,
        name_en: structure.name_en,
        name_bn: structure.name_bn ?? '',
        amount: structure.amount,
        is_active: structure.is_active,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        router.put(`/admin/fees/structures/${structure.id}`, {
            class_id: Number(form.class_id),
            session_id: form.session_id ? Number(form.session_id) : null,
            fee_type: form.fee_type,
            name_en: form.name_en,
            name_bn: form.name_bn || null,
            amount: Number(form.amount),
            is_active: form.is_active,
        });
    }

    return (
        <DashboardLayout>
            <Head title="Edit Fee Structure" />
            <div className="space-y-6">
                <header className="flex items-center gap-4">
                    <Link
                        href="/admin/fees/structures"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
                    >
                        <AppIcon name="arrow-left" className="h-5 w-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                        Edit fee structure
                    </h1>
                </header>
                <form
                    className="max-w-xl space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
                    onSubmit={submit}
                >
                    <label className="block text-sm">
                        Class
                        <select
                            value={form.class_id}
                            onChange={(e) =>
                                setForm({ ...form, class_id: Number(e.target.value) })
                            }
                            className="mt-1 h-9 w-full rounded-md border px-3"
                            required
                        >
                            {classes.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="block text-sm">
                        Fee type
                        <select
                            value={form.fee_type}
                            onChange={(e) =>
                                setForm({ ...form, fee_type: e.target.value })
                            }
                            className="mt-1 h-9 w-full rounded-md border px-3"
                        >
                            {feeTypes.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="block text-sm">
                        Name
                        <input
                            value={form.name_en}
                            onChange={(e) =>
                                setForm({ ...form, name_en: e.target.value })
                            }
                            type="text"
                            className="mt-1 h-9 w-full rounded-md border px-3"
                            required
                        />
                    </label>
                    <label className="block text-sm">
                        Amount (BDT)
                        <input
                            value={form.amount}
                            onChange={(e) =>
                                setForm({ ...form, amount: Number(e.target.value) })
                            }
                            type="number"
                            min="0"
                            step="0.01"
                            className="mt-1 h-9 w-full rounded-md border px-3"
                            required
                        />
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            checked={form.is_active}
                            onChange={(e) =>
                                setForm({ ...form, is_active: e.target.checked })
                            }
                            type="checkbox"
                        />
                        Active
                    </label>
                    <button
                        type="submit"
                        className="rounded-md bg-accent-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                        Update
                    </button>
                </form>
            </div>
        </DashboardLayout>
    );
}
