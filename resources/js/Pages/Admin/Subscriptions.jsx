import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { fmtDateTime } from '@/lib/date';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getStaggerMotionProps, staggerItem } from '@/lib/motion';
import { useMotionPreference } from '@/contexts/MotionPreferenceContext';

const currency = (value) => Number(value || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

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

export default function Subscriptions({
    adminDomain,
    generatedAt,
    stats,
    plans,
    series,
    subscriptions,
}) {
    const { reduceMotion } = useMotionPreference();
    const stagger = getStaggerMotionProps(reduceMotion);

    return (
        <AdminLayout
            title="Subscrições"
            subtitle="KPIs de assinaturas, planos e base de subscritores"
            adminDomain={adminDomain}
        >
            <Head title="Admin Subscriptions" />

            <motion.div {...stagger} className="space-y-5">
                <motion.section variants={staggerItem} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        title="Subscritores Totais"
                        value={number(stats.total_subscribers)}
                        helper={`${number(stats.active_subscribers)} ativos`}
                        tone="indigo"
                    />
                    <MetricCard
                        title="Plano Gratuito"
                        value={number(stats.free_subscribers)}
                        helper={`${number(stats.paid_subscribers)} pagos (${Number(stats.paid_ratio || 0).toFixed(1)}%)`}
                        tone="emerald"
                    />
                    <MetricCard
                        title="Novas no Mês"
                        value={number(stats.new_subscribers_month)}
                        helper={`${number(stats.canceled_subscribers_month)} canceladas`}
                        tone="violet"
                    />
                    <MetricCard
                        title="MRR"
                        value={`${currency(stats.mrr)} MT`}
                        helper="Receita mensal recorrente estimada"
                        tone="rose"
                    />
                </motion.section>

                <motion.section variants={staggerItem} className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
                        <p className="text-sm font-semibold text-slate-900">Aquisição vs Cancelamento (6 meses)</p>
                        <p className="mb-4 text-xs text-slate-500">Evolução mensal da base de assinaturas</p>

                        <div className="h-[290px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={series} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="subsNew" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                                        </linearGradient>
                                        <linearGradient id="subsCanceled" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                                    <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} width={45} />
                                    <Tooltip contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }} />
                                    <Area type="monotone" dataKey="new_subscriptions" name="Novas" stroke="#10b981" fill="url(#subsNew)" strokeWidth={2.3} />
                                    <Area type="monotone" dataKey="canceled_subscriptions" name="Canceladas" stroke="#f43f5e" fill="url(#subsCanceled)" strokeWidth={2.3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-semibold text-slate-900">Planos</p>
                        <p className="mb-4 text-xs text-slate-500">Estrutura pronta para restrições futuras</p>

                        <div className="space-y-3">
                            {plans.map((plan) => (
                                <div key={plan.id} className="rounded-xl border border-slate-100 p-3">
                                    <div className="mb-1 flex items-center justify-between">
                                        <p className="text-sm font-semibold text-slate-900">{plan.name}</p>
                                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                                            {plan.code}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        {plan.is_free ? 'Grátis' : `${currency(plan.price_monthly)} ${plan.currency}/mês`} • {number(plan.active_subscribers_count)} ativos
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">{number(plan.features_count)} flags de funcionalidades</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                <motion.section variants={staggerItem} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900">Subscritores</p>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            {number(subscriptions.length)} registos
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                                    <th className="py-2">Utilizador</th>
                                    <th className="py-2">Plano</th>
                                    <th className="py-2">Preço</th>
                                    <th className="py-2">Status</th>
                                    <th className="py-2">Início</th>
                                    <th className="py-2">Cancelamento</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscriptions.map((subscription) => (
                                    <tr key={subscription.id} className="border-b border-slate-100">
                                        <td className="py-2.5">
                                            <p className="font-medium text-slate-800">{subscription.user.name}</p>
                                            <p className="text-xs text-slate-500">{subscription.user.email}</p>
                                        </td>
                                        <td className="py-2.5 text-slate-600">{subscription.plan.name}</td>
                                        <td className="py-2.5 text-slate-600">
                                            {subscription.plan.is_free
                                                ? 'Grátis'
                                                : `${currency(subscription.plan.price_monthly)} ${subscription.plan.currency}`}
                                        </td>
                                        <td className="py-2.5">
                                            <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                                                {subscription.status}
                                            </span>
                                        </td>
                                        <td className="py-2.5 text-slate-500">{subscription.started_at || '-'}</td>
                                        <td className="py-2.5 text-slate-500">{subscription.canceled_at || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.section>

                <motion.section variants={staggerItem}>
                    <p className="text-xs text-slate-500">Atualizado em {fmtDateTime(generatedAt)}</p>
                </motion.section>
            </motion.div>
        </AdminLayout>
    );
}
