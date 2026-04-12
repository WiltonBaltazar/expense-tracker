import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { getStaggerMotionProps, staggerItem } from '@/lib/motion';
import { fmtDateTime } from '@/lib/date';
import { useMotionPreference } from '@/contexts/MotionPreferenceContext';

const number = (value) => Number(value || 0).toLocaleString('pt-BR');

function MetricCard({ title, value, helper, tone = 'indigo' }) {
    const tones = {
        indigo: 'from-indigo-500 to-blue-500',
        emerald: 'from-emerald-500 to-teal-500',
        rose: 'from-rose-500 to-orange-500',
        violet: 'from-violet-500 to-fuchsia-500',
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`mb-4 h-1.5 w-16 rounded-full bg-gradient-to-r ${tones[tone] || tones.indigo}`} />
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">{title}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{helper}</p>
        </div>
    );
}

export default function Users({
    adminDomain,
    generatedAt,
    stats,
    users,
    planDistribution,
}) {
    const { reduceMotion } = useMotionPreference();
    const stagger = getStaggerMotionProps(reduceMotion);
    const [deletingId, setDeletingId] = useState(null);

    function handleDelete(user) {
        if (!confirm(`Remover "${user.name}" (${user.email})?\n\nTodos os dados do utilizador serão eliminados permanentemente.`)) return;
        setDeletingId(user.id);
        router.delete(route('admin.customers.destroy', user.id), {
            onFinish: () => setDeletingId(null),
        });
    }

    return (
        <AdminLayout
            title="Utilizadores da App"
            subtitle="Base de clientes com atividade e plano atual"
            adminDomain={adminDomain}
        >
            <Head title="Admin Users Overview" />

            <motion.div {...stagger} className="space-y-5">
                <motion.section variants={staggerItem} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        title="Total de Clientes"
                        value={number(stats.total_customers)}
                        helper={`${number(stats.new_customers_month)} novos este mês`}
                        tone="indigo"
                    />
                    <MetricCard
                        title="Ativos (30 dias)"
                        value={number(stats.active_customers_30d)}
                        helper={`${Number(stats.engagement_ratio_30d || 0).toFixed(1)}% da base`}
                        tone="emerald"
                    />
                    <MetricCard
                        title="Emails Verificados"
                        value={number(stats.verified_customers)}
                        helper="Contas prontas para comunicação"
                        tone="violet"
                    />
                    <MetricCard
                        title="Com Poupança"
                        value={number(stats.customers_with_savings)}
                        helper={`${number(stats.customers_with_goals)} clientes também têm metas`}
                        tone="rose"
                    />
                </motion.section>

                <motion.section variants={staggerItem} className="grid grid-cols-1 gap-5 xl:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-3">
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-900">Clientes Recentes</p>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                {number(users.length)} listados
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                                        <th className="py-2">Utilizador</th>
                                        <th className="py-2">Plano</th>
                                        <th className="py-2">Status</th>
                                        <th className="py-2">Atividade 30d</th>
                                        <th className="py-2">Ações (R/D/M/P)</th>
                                        <th className="py-2">Entrou em</th>
                                        <th className="py-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b border-slate-100">
                                            <td className="py-2.5">
                                                <p className="font-medium text-slate-800">{user.name}</p>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                            </td>
                                            <td className="py-2.5 text-slate-600">{user.plan.name}</td>
                                            <td className="py-2.5">
                                                <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                                                    {user.plan.status}
                                                </span>
                                            </td>
                                            <td className="py-2.5 font-semibold text-slate-800">{number(user.activity_30d)}</td>
                                            <td className="py-2.5 text-slate-600">
                                                {number(user.totals.incomes)}/{number(user.totals.expenses)}/{number(user.totals.goals)}/{number(user.totals.savings_deposits)}
                                            </td>
                                            <td className="py-2.5 text-slate-500">{user.joined_at}</td>
                                            <td className="py-2.5">
                                                <button
                                                    onClick={() => handleDelete(user)}
                                                    disabled={deletingId === user.id}
                                                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
                                                    title="Remover utilizador"
                                                >
                                                    {deletingId === user.id ? (
                                                        <svg className="animate-spin" width="13" height="13" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                                                    ) : (
                                                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                                    )}
                                                    Remover
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-semibold text-slate-900">Distribuição de Planos</p>
                        <p className="mb-4 text-xs text-slate-500">Visão rápida por tipo de assinatura</p>

                        <div className="space-y-2">
                            {planDistribution.map((plan) => (
                                <div key={plan.name} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
                                    <span className="text-slate-600">{plan.name}</span>
                                    <span className="font-semibold text-slate-900">{number(plan.count)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                <motion.section variants={staggerItem}>
                    <p className="text-xs text-slate-500">Atualizado em {fmtDateTime(generatedAt)}</p>
                </motion.section>
            </motion.div>
        </AdminLayout>
    );
}
