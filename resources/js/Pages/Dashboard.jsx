import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MonthSelector from '@/Components/MonthSelector';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

const fmt = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + ' MT';

const S = {
    card:    { background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
    label:   { fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a39888', fontFamily: 'DM Mono, monospace' },
    muted:   { fontSize: '12px', color: '#6b6458' },
    mono:    { fontFamily: 'DM Mono, monospace' },
    divider: { height: '1px', background: 'rgba(0,0,0,0.05)' },
};

function IncomeHero({ allocations, bucketStatus, monthIncome }) {
    const pcts = [
        { pct: allocations.necessidades.percentual, color: '#2563eb' },
        { pct: allocations.desejos.percentual,      color: '#d97706' },
        { pct: allocations.economia.percentual,     color: '#0d9488' },
    ];

    const totalRemaining = bucketStatus.necessidades.restante + bucketStatus.desejos.restante + bucketStatus.economia.restante;
    const isNegative = totalRemaining < 0;

    return (
        <div style={{ ...S.card, padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
            {/* Warm accent */}
            <div style={{ position: 'absolute', top: '-40px', right: '-30px', width: '180px', height: '180px', background: 'radial-gradient(circle, rgba(184,121,10,0.06), transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '24px', marginBottom: '20px', position: 'relative' }}>
                <div>
                    <div style={S.label}>Renda Recebida no Mês</div>
                    <div style={{ ...S.mono, fontSize: 'clamp(1.6rem, 6vw, 2.4rem)', fontWeight: 500, color: '#1c1812', lineHeight: 1.1, marginTop: '4px' }}>
                        {fmt(monthIncome)}
                    </div>
                </div>
                <div style={{ marginBottom: '4px' }}>
                    <div style={S.label}>Base mensal estimada</div>
                    <div style={{ ...S.mono, fontSize: '1.1rem', fontWeight: 500, color: '#6b6458', marginTop: '2px' }}>
                        {fmt(allocations.renda_total)}
                    </div>
                </div>
                <div style={{ marginBottom: '4px', marginLeft: 'auto' }}>
                    <div style={S.label}>Saldo Restante Total</div>
                    <div style={{ ...S.mono, fontSize: '1.35rem', fontWeight: 700, color: isNegative ? '#dc2626' : '#0d9488', marginTop: '2px' }}>
                        {isNegative ? '-' : ''}{fmt(Math.abs(totalRemaining))}
                    </div>
                </div>
            </div>

            {/* Segmented bar */}
            <div style={{ display: 'flex', borderRadius: '999px', overflow: 'hidden', height: '8px', background: 'rgba(0,0,0,0.06)', marginBottom: '14px' }}>
                {pcts.map((p, i) => (
                    <div key={i} style={{ width: `${p.pct}%`, background: p.color, transition: 'width 0.6s' }} />
                ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {[
                    { label: 'Necessidades', pct: allocations.necessidades.percentual, color: '#2563eb' },
                    { label: 'Desejos',      pct: allocations.desejos.percentual,      color: '#d97706' },
                    { label: 'Economia',     pct: allocations.economia.percentual,     color: '#0d9488' },
                ].map((item) => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '12px', color: '#6b6458' }}>{item.label} </span>
                        <span style={{ ...S.mono, fontSize: '12px', color: item.color, fontWeight: 600 }}>{item.pct}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function BucketCard({ title, colorHex, icon, allocated, spent, remaining, barColor }) {
    const pct = allocated > 0 ? Math.min(100, (spent / allocated) * 100) : 0;
    const isOver = remaining < 0;

    return (
        <div style={{ ...S.card, padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: colorHex + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ color: colorHex, display: 'flex' }}>{icon}</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#1c1812' }}>{title}</span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: isOver ? 'rgba(220,38,38,0.1)' : 'rgba(13,148,136,0.1)', color: isOver ? '#dc2626' : '#0d9488' }}>
                    {isOver ? 'Excedido' : 'OK'}
                </span>
            </div>

            <div style={{ height: '5px', background: 'rgba(0,0,0,0.06)', borderRadius: '999px', overflow: 'hidden', marginBottom: '14px' }}>
                <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: isOver ? '#dc2626' : barColor, borderRadius: '999px', transition: 'width 0.6s' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', textAlign: 'center', gap: '8px' }}>
                {[
                    { lbl: 'Alocado',   val: allocated, clr: '#6b6458' },
                    { lbl: 'Gasto',     val: spent,     clr: '#6b6458' },
                    { lbl: 'Restante',  val: Math.abs(remaining), clr: isOver ? '#dc2626' : '#0d9488' },
                ].map((d) => (
                    <div key={d.lbl}>
                        <div style={S.label}>{d.lbl}</div>
                        <div style={{ ...S.mono, fontSize: '13px', fontWeight: 600, color: d.clr, marginTop: '3px' }}>{fmt(d.val)}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SavingsCard({ economia, savingsTransfers }) {
    const [showForm, setShowForm] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        amount: '',
        note: '',
        transferred_at: new Date().toISOString().slice(0, 10),
    });

    const pct = economia.alocado > 0 ? Math.min(100, Math.round((economia.transferido / economia.alocado) * 100)) : 0;
    const isOver = economia.restante < 0;

    function handleSubmit(e) {
        e.preventDefault();
        post(route('savings.store'), {
            onSuccess: () => { reset(); setShowForm(false); },
        });
    }

    function handleDelete(id) {
        router.delete(route('savings.destroy', id), { preserveScroll: true });
    }

    return (
        <div style={{ ...S.card, padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(13,148,136,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#0d9488">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                        </svg>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#1c1812' }}>Economia</span>
                </div>
                <button
                    onClick={() => setShowForm((v) => !v)}
                    style={{ fontSize: '12px', fontWeight: 600, color: '#0d9488', background: 'rgba(13,148,136,0.08)', border: 'none', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer' }}
                >
                    {showForm ? 'Cancelar' : '+ Registrar transferência'}
                </button>
            </div>

            {/* Progress bar */}
            <div style={{ height: '5px', background: 'rgba(0,0,0,0.06)', borderRadius: '999px', overflow: 'hidden', marginBottom: '14px' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: isOver ? '#dc2626' : '#0d9488', borderRadius: '999px', transition: 'width 0.6s' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', textAlign: 'center', gap: '8px', marginBottom: savingsTransfers.length > 0 || showForm ? '16px' : 0 }}>
                {[
                    { lbl: 'Alocado',     val: economia.alocado,     clr: '#6b6458' },
                    { lbl: 'Transferido', val: economia.transferido,  clr: '#0d9488' },
                    { lbl: 'Restante',    val: Math.abs(economia.restante), clr: isOver ? '#dc2626' : '#6b6458' },
                ].map((d) => (
                    <div key={d.lbl}>
                        <div style={S.label}>{d.lbl}</div>
                        <div style={{ ...S.mono, fontSize: '13px', fontWeight: 600, color: d.clr, marginTop: '3px' }}>{fmt(d.val)}</div>
                    </div>
                ))}
            </div>

            {/* Transfer log form */}
            {showForm && (
                <form onSubmit={handleSubmit} style={{ background: 'rgba(13,148,136,0.04)', borderRadius: '12px', padding: '14px', marginBottom: savingsTransfers.length > 0 ? '12px' : 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="number" min="0.01" step="0.01" placeholder="Valor"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            required
                            style={{ flex: 1, padding: '7px 10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', background: '#fff', fontSize: '13px', fontFamily: 'DM Mono, monospace', outline: 'none' }}
                        />
                        <input
                            type="date"
                            value={data.transferred_at}
                            onChange={(e) => setData('transferred_at', e.target.value)}
                            required
                            style={{ flex: 1, padding: '7px 10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', background: '#fff', fontSize: '13px', outline: 'none' }}
                        />
                    </div>
                    <input
                        type="text" placeholder="Nota (opcional)"
                        value={data.note}
                        onChange={(e) => setData('note', e.target.value)}
                        style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', background: '#fff', fontSize: '13px', outline: 'none' }}
                    />
                    <button type="submit" disabled={processing} style={{ alignSelf: 'flex-end', padding: '7px 18px', borderRadius: '8px', background: '#0d9488', color: '#fff', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                        {processing ? 'Salvando...' : 'Registrar'}
                    </button>
                </form>
            )}

            {/* Transfer list */}
            {savingsTransfers.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    {savingsTransfers.map((t) => (
                        <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 4px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                            <div style={{ minWidth: 0 }}>
                                <span style={{ ...S.mono, fontSize: '13px', fontWeight: 600, color: '#0d9488' }}>{fmt(t.amount)}</span>
                                {t.note && <span style={{ fontSize: '11px', color: '#a39888', marginLeft: '8px' }}>{t.note}</span>}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                                <span style={{ fontSize: '11px', color: '#a39888' }}>{new Date(t.transferred_at).toLocaleDateString('pt-BR')}</span>
                                <button
                                    onClick={() => handleDelete(t.id)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', margin: '-8px', color: '#a39888', display: 'flex', borderRadius: '8px' }}
                                >
                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function GoalCard({ goal }) {
    return (
        <div style={{ ...S.card, padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1c1812', lineHeight: 1.3 }}>{goal.name}</span>
                <span style={{ ...S.mono, fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: 'rgba(184,121,10,0.1)', color: '#92600c', flexShrink: 0, marginLeft: '8px' }}>{goal.progresso}%</span>
            </div>
            <div style={{ height: '4px', background: 'rgba(0,0,0,0.06)', borderRadius: '999px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ width: `${goal.progresso}%`, height: '100%', background: 'linear-gradient(90deg, #b8790a, #0d9488)', borderRadius: '999px', transition: 'width 0.6s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ ...S.mono, fontSize: '11px', color: '#a39888' }}>{fmt(goal.current_amount)}</span>
                <span style={{ ...S.mono, fontSize: '11px', color: '#a39888' }}>{fmt(goal.target_amount)}</span>
            </div>
            {goal.eta && (
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#b8790a">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span style={{ fontSize: '11px', color: '#b8790a', fontWeight: 500 }}>{goal.eta.data_estimada} ({goal.eta.meses}m)</span>
                </div>
            )}
        </div>
    );
}

const NeedsIcon = () => (
    <svg width="17" height="17" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
);
const WantsIcon = () => (
    <svg width="17" height="17" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
);

function WeeklyBudgetCard({ weeklyBudget }) {
    const { allowance, spent, remaining, pct_spent, week_start, week_end } = weeklyBudget;
    const isOver = remaining < 0;
    const barColor = pct_spent >= 100 ? '#dc2626' : pct_spent >= 80 ? '#d97706' : '#0d9488';

    return (
        <div style={{ ...S.card, padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(217,119,6,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="17" height="17" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#d97706">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                        </svg>
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#1c1812' }}>Orçamento Semanal · Desejos</div>
                        <div style={{ fontSize: '11px', color: '#a39888', marginTop: '1px' }}>{week_start} – {week_end}</div>
                    </div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: isOver ? 'rgba(220,38,38,0.1)' : 'rgba(13,148,136,0.1)', color: isOver ? '#dc2626' : '#0d9488' }}>
                    {isOver ? 'Excedido' : `${pct_spent}% usado`}
                </span>
            </div>

            <div style={{ height: '5px', background: 'rgba(0,0,0,0.06)', borderRadius: '999px', overflow: 'hidden', margin: '14px 0' }}>
                <div style={{ width: `${Math.min(100, pct_spent)}%`, height: '100%', background: barColor, borderRadius: '999px', transition: 'width 0.6s' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', textAlign: 'center', gap: '8px' }}>
                {[
                    { lbl: 'Semanal',  val: allowance,           clr: '#6b6458' },
                    { lbl: 'Gasto',    val: spent,               clr: '#6b6458' },
                    { lbl: 'Restante', val: Math.abs(remaining), clr: isOver ? '#dc2626' : '#0d9488' },
                ].map((d) => (
                    <div key={d.lbl}>
                        <div style={S.label}>{d.lbl}</div>
                        <div style={{ ...S.mono, fontSize: '13px', fontWeight: 600, color: d.clr, marginTop: '3px' }}>{fmt(d.val)}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Dashboard({ allocations, bucketStatus, goals, recentExpenses, monthIncome, weeklyBudget, savingsTransfers, currentMonth }) {
    return (
        <AuthenticatedLayout
            header={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', fontWeight: 700, color: '#1c1812' }}>
                            Painel Financeiro
                        </h2>
                        <MonthSelector currentMonth={currentMonth} routeName="dashboard" className="mt-1" />
                    </div>
                    <Link href={route('expenses.index')} className="btn-primary" style={{ fontSize: '13px', padding: '10px 20px' }}>
                        + Despesa
                    </Link>
                </div>
            }
        >
            <Head title="Painel" />

            <div style={{ padding: '24px 0 40px' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }} className="sm:px-8">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        <IncomeHero allocations={allocations} bucketStatus={bucketStatus} monthIncome={monthIncome} />

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <BucketCard
                                title="Necessidades" colorHex="#2563eb" barColor="#2563eb"
                                icon={<NeedsIcon />}
                                allocated={bucketStatus.necessidades.alocado}
                                spent={bucketStatus.necessidades.gasto}
                                remaining={bucketStatus.necessidades.restante}
                            />
                            <BucketCard
                                title="Desejos" colorHex="#d97706" barColor="#d97706"
                                icon={<WantsIcon />}
                                allocated={bucketStatus.desejos.alocado}
                                spent={bucketStatus.desejos.gasto}
                                remaining={bucketStatus.desejos.restante}
                            />
                            <SavingsCard economia={bucketStatus.economia} savingsTransfers={savingsTransfers} />
                        </div>

                        <WeeklyBudgetCard weeklyBudget={weeklyBudget} />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a39888', fontFamily: 'DM Mono, monospace' }}>Metas</span>
                                    <Link href={route('goals.index')} style={{ fontSize: '12px', color: '#b8790a', textDecoration: 'none', fontWeight: 600 }}>Ver todas</Link>
                                </div>
                                {goals.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {goals.map((goal) => <GoalCard key={goal.id} goal={goal} />)}
                                    </div>
                                ) : (
                                    <div style={{ ...S.card, padding: '40px 24px', textAlign: 'center' }}>
                                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(184,121,10,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#b8790a">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                                            </svg>
                                        </div>
                                        <p style={{ fontSize: '13px', color: '#6b6458', marginBottom: '14px' }}>Nenhuma meta cadastrada</p>
                                        <Link href={route('goals.index')} className="btn-primary" style={{ fontSize: '12px', padding: '7px 16px' }}>Criar meta</Link>
                                    </div>
                                )}
                            </div>

                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a39888', fontFamily: 'DM Mono, monospace' }}>Despesas Recentes</span>
                                    <Link href={route('expenses.index')} style={{ fontSize: '12px', color: '#b8790a', textDecoration: 'none', fontWeight: 600 }}>Ver todas</Link>
                                </div>
                                {recentExpenses.length > 0 ? (
                                    <div style={{ ...S.card, overflow: 'hidden' }}>
                                        {recentExpenses.map((expense, i) => (
                                            <div key={expense.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: i < recentExpenses.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                                                <div style={{ minWidth: 0, flex: 1 }}>
                                                    <p style={{ fontSize: '13px', fontWeight: 500, color: '#1c1812', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '12px' }}>{expense.description}</p>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                                                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 7px', borderRadius: '999px', background: expense.bucket === 'necessidades' ? 'rgba(37,99,235,0.1)' : 'rgba(217,119,6,0.1)', color: expense.bucket === 'necessidades' ? '#1d4ed8' : '#b45309' }}>
                                                            {expense.bucket === 'necessidades' ? 'Necessidades' : 'Desejos'}
                                                        </span>
                                                        <span style={{ fontSize: '11px', color: '#a39888' }}>{expense.category}</span>
                                                    </div>
                                                </div>
                                                <span style={{ ...S.mono, fontSize: '13px', fontWeight: 600, color: '#1c1812', flexShrink: 0 }}>{fmt(expense.amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ ...S.card, padding: '40px 24px', textAlign: 'center' }}>
                                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#a39888">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                                            </svg>
                                        </div>
                                        <p style={{ fontSize: '13px', color: '#6b6458', marginBottom: '14px' }}>Nenhuma despesa registrada</p>
                                        <Link href={route('expenses.index')} className="btn-primary" style={{ fontSize: '12px', padding: '7px 16px' }}>Registrar despesa</Link>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
