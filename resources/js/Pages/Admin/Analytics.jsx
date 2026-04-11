import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { fmtDateTime } from '@/lib/date';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Pie,
    PieChart,
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

export default function Analytics({
    adminDomain,
    generatedAt,
    stats,
    series,
    activitySeries,
    featureAdoption,
    goalCompletion,
}) {
    const { reduceMotion } = useMotionPreference();
    const stagger = getStaggerMotionProps(reduceMotion);

    return (
        <AdminLayout
            title="Analytics"
            subtitle="Métricas detalhadas de uso e operação da plataforma"
            adminDomain={adminDomain}
        >
            <Head title="Admin Analytics" />

            <motion.div {...stagger} className="space-y-5">
                <motion.section variants={staggerItem} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        title="Engajamento Médio"
                        value={Number(stats.avg_events_per_active_user_30d || 0).toFixed(1)}
                        helper="Eventos por utilizador ativo (30d)"
                        tone="indigo"
                    />

                    <MetricCard
                        title="Poupança Agregada"
                        value={`${currency(stats.savings_total_deposited)} MT`}
                        helper="Total histórico depositado"
                        tone="emerald"
                    />

                    <MetricCard
                        title="Funding para Metas"
                        value={`${currency(stats.transfer_to_goals_month)} MT`}
                        helper="Fluxo do mês para metas"
                        tone="violet"
                    />

                    <MetricCard
                        title="Taxa de Metas"
                        value={`${Number(stats.goal_completion_rate || 0).toFixed(1)}%`}
                        helper="Concluídas vs total"
                        tone="rose"
                    />
                </motion.section>

                <motion.section variants={staggerItem} className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
                        <p className="text-sm font-semibold text-slate-900">Tendência Financeira (6 meses)</p>
                        <p className="mb-4 text-xs text-slate-500">Rendas, despesas e crescimento da base</p>

                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={series} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="analyticsIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                                        </linearGradient>
                                        <linearGradient id="analyticsExpense" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                                    <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} width={60} />
                                    <Tooltip formatter={(value, key) => key === 'new_users' ? number(value) : `${currency(value)} MT`} contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }} />
                                    <Area type="monotone" dataKey="income" name="Rendas" stroke="#10b981" fill="url(#analyticsIncome)" strokeWidth={2.3} />
                                    <Area type="monotone" dataKey="expense" name="Despesas" stroke="#f43f5e" fill="url(#analyticsExpense)" strokeWidth={2.3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-semibold text-slate-900">Estado das Metas</p>
                        <p className="text-xs text-slate-500">Visão agregada</p>

                        <div className="mt-4 flex h-[220px] items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={goalCompletion}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={55}
                                        outerRadius={88}
                                        paddingAngle={4}
                                        fill="#6366f1"
                                    />
                                    <Tooltip formatter={(value) => number(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Concluídas</span>
                                <span className="font-semibold text-slate-900">{number(goalCompletion?.[0]?.value || 0)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Ativas</span>
                                <span className="font-semibold text-slate-900">{number(goalCompletion?.[1]?.value || 0)}</span>
                            </div>
                        </div>
                    </div>
                </motion.section>

                <motion.section variants={staggerItem} className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
                        <p className="text-sm font-semibold text-slate-900">Atividade Operacional (14 dias)</p>
                        <p className="mb-4 text-xs text-slate-500">Contagem diária de rendas e despesas</p>

                        <div className="h-[270px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={activitySeries} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="activityIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.02} />
                                        </linearGradient>
                                        <linearGradient id="activityExpense" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} width={45} />
                                    <Tooltip contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }} />
                                    <Area type="monotone" dataKey="incomes" name="Rendas" stroke="#0ea5e9" fill="url(#activityIncome)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="expenses" name="Despesas" stroke="#f97316" fill="url(#activityExpense)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-semibold text-slate-900">Adoção de Funcionalidades</p>
                        <p className="mb-4 text-xs text-slate-500">Cobertura por utilizadores</p>

                        <div className="space-y-3">
                            {featureAdoption.map((item) => (
                                <div key={item.label}>
                                    <div className="mb-1 flex items-center justify-between text-xs">
                                        <span className="text-slate-600">{item.label}</span>
                                        <span className="font-semibold text-slate-800">{number(item.count)} ({Number(item.percentage).toFixed(1)}%)</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-slate-200">
                                        <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${Math.min(100, Math.max(0, Number(item.percentage)))}%` }} />
                                    </div>
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
