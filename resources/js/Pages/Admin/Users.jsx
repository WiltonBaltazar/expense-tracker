import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { getStaggerMotionProps, staggerItem } from '@/lib/motion';
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
                    <p className="text-xs text-slate-500">Atualizado em {new Date(generatedAt).toLocaleString()}</p>
                </motion.section>
            </motion.div>
        </AdminLayout>
    );
}
