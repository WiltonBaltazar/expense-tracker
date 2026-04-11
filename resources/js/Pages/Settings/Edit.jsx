import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { useMotionPreference } from '@/contexts/MotionPreferenceContext';

const BUCKETS = [
    { key: 'needs_pct',   label: 'Necessidades', desc: 'Moradia, alimentação, transporte, saúde', color: '#2563EB' },
    { key: 'wants_pct',   label: 'Desejos',       desc: 'Lazer, restaurantes, assinaturas',       color: '#D97706' },
    { key: 'savings_pct', label: 'Economia',       desc: 'Metas e investimentos',                  color: '#00B679' },
];

const TABS = [
    { key: 'allocation', label: 'Alocação' },
    { key: 'accessibility', label: 'Acessibilidade' },
    { key: 'subscription', label: 'Subscrição' },
];

const currency = (value) => Number(value || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export default function Edit({ setting, subscription, subscriptionHistory = [] }) {
    const [activeTab, setActiveTab] = useState('allocation');
    const { reduceMotion, setReduceMotion } = useMotionPreference();
    const { post: renewSubscription, processing: renewing } = useForm({});
    const { data, setData, put, processing, errors } = useForm({
        needs_pct:   setting.needs_pct,
        wants_pct:   setting.wants_pct,
        savings_pct: setting.savings_pct,
    });

    const total   = Number(data.needs_pct) + Number(data.wants_pct) + Number(data.savings_pct);
    const isValid = Math.abs(total - 100) < 0.01;

    function handleSubmit(e) {
        e.preventDefault();
        put(route('settings.update'));
    }

    return (
        <AuthenticatedLayout
            header={<h2 className="text-[17px] font-bold text-gray-900 tracking-tight">Ajustes</h2>}
        >
            <Head title="Ajustes" />

            <div className="max-w-[580px] mx-auto px-5 sm:px-6 lg:px-8 py-6 pb-12">
                <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl border border-black/7 bg-white p-1">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${activeTab === tab.key
                                ? 'bg-[#00B679] text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'allocation' ? (
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white rounded-xl border border-black/7 shadow-sm p-6 sm:p-7">

                            <div className="mb-6">
                                <h3 className="text-[15px] font-bold text-gray-900 mb-1">Regra de Alocação</h3>
                                <p className="text-[13px] text-gray-500">Defina como sua renda será dividida. A soma deve ser 100%.</p>
                            </div>

                            <div className="flex rounded-full overflow-hidden h-3 mb-8 bg-black/6">
                                {BUCKETS.map(b => (
                                    <div key={b.key} className="flex items-center justify-center transition-all duration-300"
                                        style={{ width: `${data[b.key]}%`, background: b.color }}>
                                        {Number(data[b.key]) >= 12 && (
                                            <span className="font-mono text-[9px] font-bold text-white">{data[b.key]}%</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-7">
                                {BUCKETS.map(b => (
                                    <div key={b.key}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: b.color }} />
                                                <span className="text-[14px] font-semibold text-gray-900">{b.label}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <input
                                                    type="number" min="0" max="100"
                                                    value={data[b.key]}
                                                    onChange={e => setData(b.key, e.target.value)}
                                                    className="w-14 text-right px-2 py-1.5 rounded-lg bg-gray-50 border border-black/10 text-[14px] font-bold font-mono text-gray-900 outline-none focus:ring-2 transition-all"
                                                    style={{ '--tw-ring-color': b.color + '33' }}
                                                    onFocus={e => { e.target.style.borderColor = b.color + 'aa'; e.target.style.boxShadow = `0 0 0 3px ${b.color}20`; }}
                                                    onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
                                                />
                                                <span className="text-[13px] text-gray-400 font-mono">%</span>
                                            </div>
                                        </div>

                                        <div className="relative h-5 flex items-center">
                                            <div className="absolute inset-x-0 h-1.5 rounded-full bg-black/6" />
                                            <div className="absolute left-0 h-1.5 rounded-full pointer-events-none transition-all duration-150"
                                                style={{ width: `${data[b.key]}%`, background: b.color }} />
                                            <input
                                                type="range" min="0" max="100" step="1"
                                                value={data[b.key]}
                                                onChange={e => setData(b.key, e.target.value)}
                                                className="absolute inset-x-0 w-full h-5 opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="absolute w-4 h-4 rounded-full pointer-events-none transition-all duration-150 shadow-md"
                                                style={{ left: `${data[b.key]}%`, transform: 'translateX(-50%)', background: b.color, boxShadow: `0 2px 8px ${b.color}60` }} />
                                        </div>

                                        <p className="text-[11.5px] text-gray-400 mt-2">{b.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <div className={`mt-7 flex items-center justify-between px-4 py-3 rounded-xl border ${isValid ? 'bg-[#00B679]/5 border-[#00B679]/20' : 'bg-red-50 border-red-200'}`}>
                                <span className={`text-[13px] font-semibold ${isValid ? 'text-[#00916A]' : 'text-red-600'}`}>Total</span>
                                <span className={`font-mono text-[1.2rem] font-bold ${isValid ? 'text-[#00B679]' : 'text-red-600'}`}>
                                    {total.toFixed(0)}%
                                </span>
                            </div>

                            {!isValid && (
                                <p className="mt-2 text-[12px] text-red-500 text-center">A soma deve ser exatamente 100%</p>
                            )}
                            {errors.needs_pct && <p className="mt-2 text-[12px] text-red-500">{errors.needs_pct}</p>}

                            <div className="mt-6 flex justify-end">
                                <button type="submit" disabled={processing || !isValid} className="btn-primary text-[14px] px-7">
                                    {processing ? 'Salvando...' : 'Salvar Configurações'}
                                </button>
                            </div>
                        </div>
                    </form>
                ) : null}

                {activeTab === 'accessibility' ? (
                    <div className="bg-white rounded-xl border border-black/7 shadow-sm p-6 sm:p-7">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-[15px] font-bold text-gray-900 mb-1">Acessibilidade</h3>
                                <p className="text-[13px] text-gray-500">Reduz animações e transições para uma experiência mais estável.</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setReduceMotion((v) => !v)}
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${reduceMotion ? 'bg-[#00B679]' : 'bg-gray-300'}`}
                                aria-pressed={reduceMotion}
                                aria-label="Alternar modo de movimento reduzido"
                            >
                                <span
                                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${reduceMotion ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                            </button>
                        </div>

                        <p className="text-[12px] text-gray-500 mt-3">
                            Movimento reduzido: <span className="font-semibold text-gray-700">{reduceMotion ? 'Ativado' : 'Desativado'}</span>
                        </p>
                    </div>
                ) : null}

                {activeTab === 'subscription' ? (
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl border border-black/7 shadow-sm p-6 sm:p-7">
                            <h3 className="text-[15px] font-bold text-gray-900 mb-1">Subscrição Atual</h3>
                            <p className="text-[13px] text-gray-500 mb-4">A duração do seu plano é calculada em meses.</p>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="rounded-lg border border-black/10 bg-gray-50 px-4 py-3">
                                    <p className="text-[11px] uppercase tracking-wide text-gray-400">Plano</p>
                                    <p className="text-[14px] font-semibold text-gray-900">{subscription?.plan?.name || 'Gratis'}</p>
                                </div>
                                <div className="rounded-lg border border-black/10 bg-gray-50 px-4 py-3">
                                    <p className="text-[11px] uppercase tracking-wide text-gray-400">Preço Mensal</p>
                                    <p className="text-[14px] font-semibold text-gray-900">
                                        {currency(subscription?.plan?.price_monthly || 0)} {subscription?.plan?.currency || 'MZN'}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-black/10 bg-gray-50 px-4 py-3">
                                    <p className="text-[11px] uppercase tracking-wide text-gray-400">Duração (meses)</p>
                                    <p className="text-[14px] font-semibold text-gray-900">{subscription?.plan?.duration_months || 1} mês(es)</p>
                                </div>
                                <div className="rounded-lg border border-black/10 bg-gray-50 px-4 py-3">
                                    <p className="text-[11px] uppercase tracking-wide text-gray-400">Estado</p>
                                    <p className="text-[14px] font-semibold text-gray-900">{subscription?.status || 'active'}</p>
                                </div>
                                <div className="rounded-lg border border-black/10 bg-gray-50 px-4 py-3 sm:col-span-2">
                                    <p className="text-[11px] uppercase tracking-wide text-gray-400">Próxima Renovação</p>
                                    <p className="text-[14px] font-semibold text-gray-900">
                                        {subscription?.renews_at ? new Date(subscription.renews_at).toLocaleString() : 'Ainda não definida'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <p className="text-[12px] font-semibold text-gray-700 mb-2">Funcionalidades do seu plano</p>
                                <div className="flex flex-wrap gap-2">
                                    {(subscription?.features || []).map((feature) => (
                                        <span
                                            key={feature.key}
                                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${feature.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}
                                        >
                                            {feature.label}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-5 flex justify-end">
                                <button
                                    type="button"
                                    disabled={renewing}
                                    onClick={() => renewSubscription(route('settings.subscription.renew'), { preserveScroll: true })}
                                    className="inline-flex items-center rounded-lg bg-[#00B679] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#009a66] disabled:opacity-60"
                                >
                                    {renewing ? 'Renovando...' : 'Renovar Subscrição'}
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-black/7 shadow-sm p-6 sm:p-7">
                            <h3 className="text-[15px] font-bold text-gray-900 mb-1">Histórico de Subscrições e Pagamentos</h3>
                            <p className="text-[13px] text-gray-500 mb-4">Linha temporal das alterações de plano e cobranças.</p>

                            <div className="space-y-3">
                                {subscriptionHistory.length === 0 ? (
                                    <p className="text-[13px] text-gray-500">Ainda não há eventos de subscrição para mostrar.</p>
                                ) : subscriptionHistory.map((event) => (
                                    <div key={event.id} className="rounded-lg border border-black/10 px-4 py-3">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <p className="text-[13px] font-semibold text-gray-900">{event.event_label}</p>
                                            <span className="text-[11px] text-gray-500">
                                                {event.occurred_at ? new Date(event.occurred_at).toLocaleString() : '-'}
                                            </span>
                                        </div>
                                        <p className="text-[12px] text-gray-600 mt-1">
                                            Plano: <span className="font-semibold">{event.plan?.name || 'N/A'}</span>
                                            {event.plan?.duration_months ? ` • ${event.plan.duration_months} mês(es)` : ''}
                                        </p>
                                        {event.amount !== null ? (
                                            <p className="text-[12px] text-gray-700 mt-1">
                                                Valor: <span className="font-semibold">{currency(event.amount)} {event.currency || 'MZN'}</span>
                                            </p>
                                        ) : null}
                                        {event.note ? <p className="text-[12px] text-gray-500 mt-1">{event.note}</p> : null}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </AuthenticatedLayout>
    );
}
