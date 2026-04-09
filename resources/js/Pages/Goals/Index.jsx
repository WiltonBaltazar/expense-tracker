import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useCallback } from 'react';

const fmt = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + ' MT';

const S = {
    card:  { background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
    mono:  { fontFamily: 'DM Mono, monospace' },
    label: { fontSize: '11px', fontWeight: 600, color: '#6b6458', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: '7px', fontFamily: 'DM Mono, monospace' },
};

const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '10px', background: '#faf8f3', border: '1px solid rgba(0,0,0,0.1)', color: '#1c1812', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', outline: 'none' };
const focusIn  = (e) => { e.target.style.borderColor = 'rgba(184,121,10,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(184,121,10,0.1)'; };
const focusOut = (e) => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none'; };

function GoalForm({ onClose, goal = null }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: goal?.name || '',
        target_amount: goal?.target_amount || '',
        current_amount: goal?.current_amount || '0',
        deadline: goal?.deadline?.split('T')[0] || '',
    });

    function handleSubmit(e) {
        e.preventDefault();
        if (goal) {
            put(route('goals.update', goal.id), { onSuccess: () => { reset(); onClose(); } });
        } else {
            post(route('goals.store'), { onSuccess: () => { reset(); onClose(); } });
        }
    }

    return (
        <div style={{ ...S.card, padding: '24px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1c1812', marginBottom: '20px' }}>
                {goal ? 'Editar Meta' : 'Nova Meta'}
            </h3>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={S.label}>Nome da Meta</label>
                        <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} style={inputStyle} placeholder="Ex: Viagem, Reserva de emergência..." onFocus={focusIn} onBlur={focusOut} />
                        {errors.name && <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>{errors.name}</p>}
                    </div>
                    <div>
                        <label style={S.label}>Valor Alvo (MT)</label>
                        <input type="number" step="0.01" value={data.target_amount} onChange={(e) => setData('target_amount', e.target.value)} style={inputStyle} placeholder="0.00" onFocus={focusIn} onBlur={focusOut} />
                        {errors.target_amount && <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>{errors.target_amount}</p>}
                    </div>
                    <div>
                        <label style={S.label}>Valor Atual (MT)</label>
                        <input type="number" step="0.01" value={data.current_amount} onChange={(e) => setData('current_amount', e.target.value)} style={inputStyle} placeholder="0.00" onFocus={focusIn} onBlur={focusOut} />
                    </div>
                    <div>
                        <label style={S.label}>Prazo (opcional)</label>
                        <input type="date" value={data.deadline} onChange={(e) => setData('deadline', e.target.value)} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                    </div>
                </div>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button type="button" onClick={onClose} className="btn-secondary" style={{ fontSize: '12px', padding: '8px 16px' }}>Cancelar</button>
                    <button type="submit" disabled={processing} className="btn-primary" style={{ fontSize: '12px', padding: '8px 16px' }}>
                        {processing ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </div>
    );
}

const GOAL_COLORS = ['#b8790a','#7c3aed','#0d9488','#d97706','#e11d48','#2563eb'];

function AllocationPanel({ goals, totalSavings }) {
    const activeGoals = goals.filter(g => !g.completed);
    const [allocations, setAllocations] = useState(() =>
        Object.fromEntries(activeGoals.map(g => [g.id, Number(g.savings_pct)]))
    );
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    const handleSlider = useCallback((changedId, newValue) => {
        const otherIds = activeGoals.filter(g => g.id !== changedId).map(g => g.id);
        const oldOtherTotal = otherIds.reduce((s, id) => s + allocations[id], 0);
        const remaining = 100 - newValue;
        const newAllocs = { ...allocations, [changedId]: newValue };

        if (otherIds.length === 0) {
            newAllocs[changedId] = 100;
        } else if (oldOtherTotal === 0) {
            const each = Math.round((remaining / otherIds.length) * 100) / 100;
            otherIds.forEach((id, i) => {
                newAllocs[id] = i === otherIds.length - 1 ? Math.round((remaining - each * (otherIds.length - 1)) * 100) / 100 : each;
            });
        } else {
            let distributed = 0;
            otherIds.forEach((id, i) => {
                if (i === otherIds.length - 1) {
                    newAllocs[id] = Math.round((remaining - distributed) * 100) / 100;
                } else {
                    const val = Math.round(remaining * (allocations[id] / oldOtherTotal) * 100) / 100;
                    newAllocs[id] = val;
                    distributed += val;
                }
            });
        }
        setAllocations(newAllocs);
        setDirty(true);
    }, [allocations, activeGoals]);

    function handleSave() {
        setSaving(true);
        router.put(route('goals.allocations'), {
            allocations: activeGoals.map(g => ({ id: g.id, savings_pct: allocations[g.id] })),
        }, { preserveScroll: true, onSuccess: () => { setDirty(false); setSaving(false); }, onError: () => setSaving(false) });
    }

    function handleReset() {
        const even = Math.round((100 / activeGoals.length) * 100) / 100;
        const newAllocs = {};
        activeGoals.forEach((g, i) => { newAllocs[g.id] = i === activeGoals.length - 1 ? Math.round((100 - even * (activeGoals.length - 1)) * 100) / 100 : even; });
        setAllocations(newAllocs);
        setDirty(true);
    }

    if (activeGoals.length < 2) return null;

    function calcMonths(goal, pct) {
        const monthly = totalSavings * pct / 100;
        if (monthly <= 0) return null;
        return Math.ceil((Number(goal.target_amount) - Number(goal.current_amount)) / monthly);
    }
    function calcDate(months) {
        if (!months) return null;
        const d = new Date();
        d.setMonth(d.getMonth() + months);
        return d.toLocaleDateString('pt-BR');
    }

    return (
        <div style={{ ...S.card, padding: '22px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(184,121,10,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#b8790a">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                        </svg>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#1c1812' }}>Distribuir Economia</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button onClick={handleReset} style={{ fontSize: '11px', fontWeight: 500, color: '#6b6458', background: 'none', border: 'none', cursor: 'pointer' }}>Igualar</button>
                    {dirty && (
                        <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ fontSize: '11px', padding: '5px 14px' }}>
                            {saving ? 'Salvando...' : 'Salvar'}
                        </button>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {activeGoals.map((goal, gi) => {
                    const pct = allocations[goal.id] || 0;
                    const amount = totalSavings * pct / 100;
                    const months = calcMonths(goal, pct);
                    const color = GOAL_COLORS[gi % GOAL_COLORS.length];

                    return (
                        <div key={goal.id}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: color }} />
                                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#1c1812', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{goal.name}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'baseline' }}>
                                    <span style={{ ...S.mono, fontSize: '11px', color: '#a39888' }}>({fmt(amount)})</span>
                                    <span style={{ ...S.mono, fontSize: '15px', fontWeight: 600, color }}>
                                        {pct.toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                            <input
                                type="range" min="0" max="100" step="1" value={pct}
                                onChange={(e) => handleSlider(goal.id, Number(e.target.value))}
                                style={{ width: '100%', height: '4px', borderRadius: '999px', appearance: 'none', background: `linear-gradient(to right, ${color} ${pct}%, rgba(0,0,0,0.1) ${pct}%)`, cursor: 'pointer', outline: 'none' }}
                            />
                            {months && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
                                    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#a39888">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span style={{ fontSize: '11px', color: '#a39888' }}>{calcDate(months)} ({months}m)</span>
                                </div>
                            )}
                            {pct === 0 && <p style={{ fontSize: '11px', color: '#d97706', marginTop: '4px' }}>Sem alocação — esta meta não terá progresso</p>}
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', borderRadius: '999px', overflow: 'hidden', height: '5px', background: 'rgba(0,0,0,0.07)' }}>
                {activeGoals.map((goal, gi) => (
                    <div key={goal.id} style={{ width: `${allocations[goal.id] || 0}%`, background: GOAL_COLORS[gi % GOAL_COLORS.length], transition: 'width 0.3s' }} />
                ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '10px' }}>
                {activeGoals.map((goal, gi) => (
                    <div key={goal.id} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: GOAL_COLORS[gi % GOAL_COLORS.length] }} />
                        <span style={{ fontSize: '11px', color: '#6b6458' }}>{goal.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function FastTrackSimulator({ goal }) {
    const [redirectAmount, setRedirectAmount] = useState(100);
    const [result, setResult] = useState(goal.fast_track);

    async function simulate() {
        const response = await fetch(route('goals.simulate'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content },
            body: JSON.stringify({ remaining_amount: goal.restante, redirect_amount: redirectAmount, savings_pct: Number(goal.savings_pct) }),
        });
        const data = await response.json();
        setResult(data);
    }

    if (!goal.eta) return null;

    return (
        <div style={{ marginTop: '16px', padding: '14px 16px', borderRadius: '12px', background: 'rgba(184,121,10,0.04)', border: '1px solid rgba(184,121,10,0.14)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px' }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#b8790a">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#b8790a', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace' }}>Fast-Track</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#6b6458' }}>Redirecionar MT</span>
                <input type="number" value={redirectAmount} onChange={(e) => setRedirectAmount(Number(e.target.value))}
                    style={{ ...inputStyle, width: '72px', fontSize: '12px', padding: '6px 10px' }}
                    onFocus={focusIn} onBlur={focusOut} />
                <span style={{ fontSize: '12px', color: '#6b6458' }}>de Desejos</span>
                <button onClick={simulate} className="btn-primary" style={{ fontSize: '11px', padding: '5px 14px' }}>Simular</button>
            </div>
            {result && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
                        <span style={{ color: '#6b6458' }}>Normal:</span>
                        <span style={{ color: '#1c1812', fontWeight: 500, ...S.mono }}>{result.meses_normal} meses</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
                        <span style={{ color: '#b8790a' }}>Fast-Track:</span>
                        <span style={{ color: '#b8790a', fontWeight: 700, ...S.mono }}>{result.meses_fast_track} meses ({result.data_estimada})</span>
                    </div>
                    {result.dias_economizados > 0 && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '8px', background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.18)', marginTop: '4px' }}>
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#0d9488">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0d9488' }}>{result.dias_economizados} dias mais rápido!</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function Index({ goals, allocations }) {
    const [showForm, setShowForm] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const { delete: destroy } = useForm();

    function handleDelete(id) {
        if (confirm('Remover esta meta?')) destroy(route('goals.destroy', id));
    }

    return (
        <AuthenticatedLayout
            header={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', fontWeight: 700, color: '#1c1812' }}>Metas</h2>
                    <button onClick={() => { setEditingGoal(null); setShowForm(true); }} className="btn-primary" style={{ fontSize: '13px', padding: '8px 18px' }}>
                        + Nova Meta
                    </button>
                </div>
            }
        >
            <Head title="Metas" />

            <div style={{ padding: '24px 0 40px' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }} className="sm:px-8">

                    {allocations.renda_total > 0 && (
                        <div style={{ ...S.card, padding: '16px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(13,148,136,0.04)', border: '1px solid rgba(13,148,136,0.14)' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(13,148,136,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#0d9488">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                                </svg>
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: '#0d9488', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace' }}>Economia mensal para metas</div>
                                <div style={{ ...S.mono, fontSize: '1.25rem', fontWeight: 600, color: '#1c1812' }}>
                                    {fmt(allocations.economia.valor)}
                                    <span style={{ fontSize: '12px', color: '#0d9488', marginLeft: '5px' }}>/ mês</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <AllocationPanel goals={goals} totalSavings={allocations.economia.valor} />

                    {(showForm || editingGoal) && (
                        <GoalForm goal={editingGoal} onClose={() => { setShowForm(false); setEditingGoal(null); }} />
                    )}

                    {goals.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {goals.map((goal, gi) => (
                                <div key={goal.id} style={{ ...S.card, padding: '22px', background: goal.completed ? 'rgba(13,148,136,0.03)' : '#ffffff', border: goal.completed ? '1px solid rgba(13,148,136,0.15)' : '1px solid rgba(0,0,0,0.07)' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: GOAL_COLORS[gi % GOAL_COLORS.length] }} />
                                                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1c1812' }}>{goal.name}</h3>
                                                {goal.completed && (
                                                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: 'rgba(13,148,136,0.1)', color: '#0d9488' }}>✓ Concluída</span>
                                                )}
                                            </div>
                                            {goal.deadline && (
                                                <p style={{ fontSize: '11px', color: '#a39888' }}>Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</p>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
                                            <button onClick={() => { setEditingGoal(goal); setShowForm(false); }} style={{ fontSize: '12px', fontWeight: 600, color: '#b8790a', background: 'none', border: 'none', cursor: 'pointer' }}>Editar</button>
                                            <button onClick={() => handleDelete(goal.id)} style={{ fontSize: '12px', fontWeight: 600, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>Excluir</button>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                                        <div style={{ flex: 1, height: '8px', background: 'rgba(0,0,0,0.07)', borderRadius: '999px', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%', borderRadius: '999px', transition: 'width 0.7s',
                                                width: `${goal.progresso}%`,
                                                background: goal.completed ? '#0d9488' : `linear-gradient(90deg, ${GOAL_COLORS[gi % GOAL_COLORS.length]}, ${GOAL_COLORS[(gi + 2) % GOAL_COLORS.length]})`,
                                            }} />
                                        </div>
                                        <span style={{ ...S.mono, fontSize: '13px', fontWeight: 700, color: '#1c1812', minWidth: '38px', textAlign: 'right' }}>{goal.progresso}%</span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                        <span style={{ ...S.mono, fontSize: '12px', color: '#6b6458' }}>
                                            {fmt(goal.current_amount)} <span style={{ color: '#a39888' }}>de</span> {fmt(goal.target_amount)}
                                        </span>
                                        {goal.eta && !goal.completed && (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#b8790a', fontWeight: 500 }}>
                                                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {goal.eta.data_estimada} ({goal.eta.meses}m)
                                                </span>
                                                <span style={{ fontSize: '11px', color: '#a39888' }}>
                                                    {fmt(goal.eta.economia_mensal)}/mês ({Number(goal.savings_pct).toFixed(0)}% da economia)
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {!goal.completed && <FastTrackSimulator goal={goal} />}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ ...S.card, padding: '60px 24px', textAlign: 'center' }}>
                            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(184,121,10,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <svg width="26" height="26" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#b8790a">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                                </svg>
                            </div>
                            <p style={{ fontSize: '14px', color: '#6b6458', marginBottom: '20px' }}>Nenhuma meta cadastrada ainda</p>
                            <button onClick={() => setShowForm(true)} className="btn-primary" style={{ fontSize: '13px' }}>Criar primeira meta</button>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
