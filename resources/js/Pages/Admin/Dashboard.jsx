import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { fmtDateTime } from '@/lib/date';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
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

function ChangePill({ value }) {
    const positive = Number(value) >= 0;

    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${positive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {positive ? '+' : ''}
            {Number(value || 0).toFixed(1)}%
        </span>
    );
}

export default function Dashboard({
    adminDomain,
    generatedAt,
    stats,
    series,
}) {
    const { reduceMotion } = useMotionPreference();
    const stagger = getStaggerMotionProps(reduceMotion);

    return (
        <AdminLayout
            title="Admin Dashboard"
            subtitle="KPIs essenciais da plataforma"
            adminDomain={adminDomain}
        >
            <Head title="Admin Dashboard" />

            <motion.div {...stagger} className="space-y-5">
                <motion.section variants={staggerItem} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        title="Utilizadores"
                        value={number(stats.total_users)}
                        helper={`${number(stats.new_users_month)} novos este mês`}
                        tone="indigo"
                    />

                    <MetricCard
                        title="Ativos (30 dias)"
                        value={number(stats.active_users_30d)}
                        helper={`${Number(stats.engagement_ratio_30d || 0).toFixed(1)}% da base`}
                        tone="emerald"
                    />

                    <MetricCard
                        title="Receita (mês)"
                        value={`${currency(stats.monthly_income)} MT`}
                        helper="Total de rendas registadas"
                        tone="violet"
                    />

                    <MetricCard
                        title="Despesas (mês)"
                        value={`${currency(stats.monthly_expense)} MT`}
                        helper="Total de despesas registadas"
                        tone="rose"
                    />
                </motion.section>

                <motion.section variants={staggerItem} className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-900">Rendas vs Despesas</p>
                                <p className="text-xs text-slate-500">Últimos 6 meses</p>
                            </div>

                            <div className="flex gap-2">
                                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                                    Receita <ChangePill value={stats.monthly_income_change} />
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
                                    Despesa <ChangePill value={stats.monthly_expense_change} />
                                </div>
                            </div>
                        </div>

                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={series} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                                        </linearGradient>
                                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                                    <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} width={60} />
                                    <Tooltip formatter={(value) => `${currency(value)} MT`} contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }} />
                                    <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#incomeGradient)" strokeWidth={2.5} />
                                    <Area type="monotone" dataKey="expense" stroke="#f43f5e" fill="url(#expenseGradient)" strokeWidth={2.5} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-semibold text-slate-900">Fluxo de Metas (mês)</p>
                            <div className="mt-3 space-y-2 text-sm text-slate-600">
                                <p>Poupança → Metas: <span className="font-semibold text-slate-900">{currency(stats.transfer_to_goals_month)} MT</span></p>
                                <p>Metas → Poupança: <span className="font-semibold text-slate-900">{currency(stats.transfer_to_savings_month)} MT</span></p>
                                <p>Saldo líquido: <span className="font-semibold text-indigo-700">{currency(stats.net_goal_funding_month)} MT</span></p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-semibold text-slate-900">Navegação Rápida</p>
                            <div className="mt-3 grid grid-cols-1 gap-2">
                                <Link href={route('admin.analytics')} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700">
                                    Ver Analytics Completo
                                </Link>
                                <Link href={route('admin.customers.index')} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700">
                                    Ver Utilizadores
                                </Link>
                                <Link href={route('admin.subscriptions.index')} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700">
                                    Ver Subscrições
                                </Link>
                                <Link href={route('admin.plans.index')} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700">
                                    Gerir Planos
                                </Link>
                                <Link href={route('admin.users.index')} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700">
                                    Gerir Admin Users
                                </Link>
                            </div>
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
