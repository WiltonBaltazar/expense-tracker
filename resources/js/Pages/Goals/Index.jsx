import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useCallback } from 'react';

const fmt  = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + ' MT';
const fmtN = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

const GOAL_COLORS = ['#00B679','#7C3AED','#2563EB','#D97706','#E11D48','#0891B2'];

const inputCls = 'w-full px-3 py-2 rounded-lg bg-gray-50 border border-black/10 text-gray-900 text-[13px] outline-none focus:border-[#00B679]/50 focus:ring-2 focus:ring-[#00B679]/10 focus:bg-white transition-colors';

// ── Goal Form ─────────────────────────────────────────────────────────────────
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
        <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-[16px] font-bold text-gray-900">{goal ? 'Editar Meta' : 'Nova Meta'}</h3>
                <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors p-1 rounded">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nome da Meta</label>
                        <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className={inputCls} placeholder="Ex: Viagem, Reserva de emergência..." />
                        {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Valor Alvo (MT)</label>
                        <input type="number" step="0.01" value={data.target_amount} onChange={e => setData('target_amount', e.target.value)} className={inputCls} placeholder="0.00" />
                        {errors.target_amount && <p className="text-[11px] text-red-500 mt-1">{errors.target_amount}</p>}
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Valor Atual (MT)</label>
                        <input type="number" step="0.01" value={data.current_amount} onChange={e => setData('current_amount', e.target.value)} className={inputCls} placeholder="0.00" />
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Prazo (opcional)</label>
                        <input type="date" value={data.deadline} onChange={e => setData('deadline', e.target.value)} className={inputCls} />
                    </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="btn-secondary text-[13px]">Cancelar</button>
                    <button type="submit" disabled={processing} className="btn-primary text-[13px]">
                        {processing ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </div>
    );
}

// ── Savings Transfer Modal ────────────────────────────────────────────────────
function SavingsTransferModal({ show, onClose }) {
    const { data, setData, post, processing, reset } = useForm({
        amount: '', note: '', transferred_at: new Date().toISOString().slice(0, 10),
    });

    function handleSubmit(e) {
        e.preventDefault();
        post(route('savings.store'), { onSuccess: () => { reset(); onClose(); } });
    }

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[16px] font-bold text-gray-900">Adicionar à Poupança</h3>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors p-1 rounded">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <p className="text-[12.5px] text-gray-400 mb-5">O valor será registrado na poupança e distribuído entre suas metas conforme a alocação configurada.</p>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Valor (MT)</label>
                        <input type="number" min="0.01" step="0.01" placeholder="0.00" value={data.amount} onChange={e => setData('amount', e.target.value)} required className={inputCls} autoFocus />
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Data</label>
                        <input type="date" value={data.transferred_at} onChange={e => setData('transferred_at', e.target.value)} required className={inputCls} />
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nota (opcional)</label>
                        <input type="text" placeholder="Ex: Bónus, renda extra..." value={data.note} onChange={e => setData('note', e.target.value)} className={inputCls} />
                    </div>
                    <div className="pt-2 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="btn-secondary text-[13px]">Cancelar</button>
                        <button type="submit" disabled={processing} className="btn-primary text-[13px]">
                            {processing ? 'Registrando...' : 'Adicionar à Poupança'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

// ── Allocation sliders ────────────────────────────────────────────────────────
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
            otherIds.forEach((id, i) => { newAllocs[id] = i === otherIds.length - 1 ? Math.round((remaining - each * (otherIds.length - 1)) * 100) / 100 : each; });
        } else {
            let distributed = 0;
            otherIds.forEach((id, i) => {
                if (i === otherIds.length - 1) { newAllocs[id] = Math.round((remaining - distributed) * 100) / 100; }
                else { const val = Math.round(remaining * (allocations[id] / oldOtherTotal) * 100) / 100; newAllocs[id] = val; distributed += val; }
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

    function calcMonths(goal, pct) {
        const monthly = totalSavings * pct / 100;
        if (monthly <= 0) return null;
        return Math.ceil((Number(goal.target_amount) - Number(goal.current_amount)) / monthly);
    }
    function calcDate(months) {
        if (!months) return null;
        const d = new Date(); d.setMonth(d.getMonth() + months);
        return d.toLocaleDateString('pt-BR');
    }

    if (activeGoals.length < 2) return null;

    return (
        <div className="bg-white rounded-xl border border-black/7 shadow-sm p-5 mb-3">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#00B679]/10 flex items-center justify-center">
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#00B679">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                        </svg>
                    </div>
                    <span className="text-[14px] font-semibold text-gray-900">Distribuir Economia entre Metas</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleReset} className="text-[12px] text-gray-500 hover:text-gray-800 transition-colors cursor-pointer bg-none border-none">Igualar</button>
                    {dirty && (
                        <button onClick={handleSave} disabled={saving} className="btn-primary text-[12px] py-1.5 px-3">
                            {saving ? 'Salvando...' : 'Salvar'}
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-5">
                {activeGoals.map((goal, gi) => {
                    const pct    = allocations[goal.id] || 0;
                    const amount = totalSavings * pct / 100;
                    const months = calcMonths(goal, pct);
                    const color  = GOAL_COLORS[gi % GOAL_COLORS.length];

                    return (
                        <div key={goal.id}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                                    <span className="text-[13px] font-medium text-gray-800 max-w-[160px] truncate">{goal.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-[11px] text-gray-400">({fmtN(amount)})</span>
                                    <span className="font-mono text-[15px] font-bold" style={{ color }}>{pct.toFixed(0)}%</span>
                                </div>
                            </div>
                            <input
                                type="range" min="0" max="100" step="1" value={pct}
                                onChange={e => handleSlider(goal.id, Number(e.target.value))}
                                className="w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none"
                                style={{ background: `linear-gradient(to right, ${color} ${pct}%, rgba(0,0,0,0.1) ${pct}%)`, accentColor: color }}
                            />
                            {months && (
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#9CA3AF"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span className="text-[11px] text-gray-400">{calcDate(months)} ({months}m)</span>
                                </div>
                            )}
                            {pct === 0 && <p className="text-[11px] text-amber-600 mt-1">Sem alocação — esta meta não terá progresso</p>}
                        </div>
                    );
                })}
            </div>

            {/* Combined bar */}
            <div className="mt-5 flex h-1.5 rounded-full overflow-hidden bg-black/7">
                {activeGoals.map((goal, gi) => (
                    <div key={goal.id} className="transition-all duration-300" style={{ width: `${allocations[goal.id] || 0}%`, background: GOAL_COLORS[gi % GOAL_COLORS.length] }} />
                ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-2.5">
                {activeGoals.map((goal, gi) => (
                    <div key={goal.id} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: GOAL_COLORS[gi % GOAL_COLORS.length] }} />
                        <span className="text-[11px] text-gray-500">{goal.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Fast-track simulator ──────────────────────────────────────────────────────
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
        <div className="mt-4 p-4 rounded-xl bg-[#00B679]/4 border border-[#00B679]/15">
            <div className="flex items-center gap-2 mb-3">
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#00B679"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                <span className="text-[11px] font-bold text-[#00916A] uppercase tracking-widest font-mono">Fast-Track Simulator</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-[12.5px] text-gray-600">Redirecionar MT</span>
                <input type="number" value={redirectAmount} onChange={e => setRedirectAmount(Number(e.target.value))}
                    className="w-20 px-2.5 py-1.5 rounded-lg border border-black/10 bg-white text-[12px] font-mono outline-none focus:border-[#00B679]/50" />
                <span className="text-[12.5px] text-gray-600">de Desejos</span>
                <button onClick={simulate} className="btn-primary text-[12px] py-1.5 px-3">Simular</button>
            </div>
            {result && (
                <div className="space-y-1.5">
                    <div className="flex gap-2 text-[12.5px]">
                        <span className="text-gray-500 w-20">Normal:</span>
                        <span className="font-mono font-medium text-gray-800">{result.meses_normal} meses</span>
                    </div>
                    <div className="flex gap-2 text-[12.5px]">
                        <span className="text-[#00916A] w-20">Fast-Track:</span>
                        <span className="font-mono font-bold text-[#00B679]">{result.meses_fast_track} meses ({result.data_estimada})</span>
                    </div>
                    {result.dias_economizados > 0 && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00B679]/8 border border-[#00B679]/18 mt-1">
                            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#00B679"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="text-[12px] font-bold text-[#00916A]">{result.dias_economizados} dias mais rápido!</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Index({ goals, allocations }) {
    const [showForm, setShowForm] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [showSavingsModal, setShowSavingsModal] = useState(false);
    const { delete: destroy } = useForm();

    function handleDelete(id) {
        if (confirm('Remover esta meta?')) destroy(route('goals.destroy', id));
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">Metas</h2>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowSavingsModal(true)} className="btn-secondary text-[13px]">
                            + Poupança
                        </button>
                        <button onClick={() => { setEditingGoal(null); setShowForm(true); }} className="btn-primary text-[13px]">
                            + Nova Meta
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Metas" />

            {/* Modals */}
            <Modal show={showForm || !!editingGoal} onClose={() => { setShowForm(false); setEditingGoal(null); }} maxWidth="md">
                <GoalForm goal={editingGoal} onClose={() => { setShowForm(false); setEditingGoal(null); }} />
            </Modal>
            <SavingsTransferModal show={showSavingsModal} onClose={() => setShowSavingsModal(false)} />

            <div className="max-w-[1100px] mx-auto px-5 sm:px-6 lg:px-8 py-5 pb-10">

                {/* Monthly savings info */}
                {allocations.renda_total > 0 && (
                    <div className="flex items-center justify-between gap-4 bg-[#00B679]/5 border border-[#00B679]/15 rounded-xl p-4 mb-3">
                        <div className="flex items-center gap-4">
                            <div className="w-9 h-9 rounded-lg bg-[#00B679]/10 flex items-center justify-center flex-shrink-0">
                                <svg width="17" height="17" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#00B679">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-[10.5px] font-bold text-[#00916A] uppercase tracking-widest">Economia mensal para metas</p>
                                <p className="font-mono text-[1.15rem] font-bold text-gray-900 mt-0.5">
                                    {fmtN(allocations.economia.valor)}
                                    <span className="text-[12px] text-[#00B679] font-normal ml-1.5">/ mês</span>
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setShowSavingsModal(true)} className="text-[12px] font-semibold text-[#00B679] bg-[#00B679]/10 border border-[#00B679]/20 rounded-lg px-3 py-2 cursor-pointer hover:bg-[#00B679]/20 transition-colors whitespace-nowrap flex-shrink-0">
                            + Adicionar à Poupança
                        </button>
                    </div>
                )}

                <AllocationPanel goals={goals} totalSavings={allocations.economia.valor} />

                {goals.length > 0 ? (
                    <div className="space-y-3">
                        {goals.map((goal, gi) => {
                            const color = GOAL_COLORS[gi % GOAL_COLORS.length];
                            return (
                                <div key={goal.id} className={`bg-white rounded-xl border shadow-sm p-5 ${goal.completed ? 'border-[#00B679]/20 bg-[#00B679]/2' : 'border-black/7'}`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                                                <h3 className="text-[15px] font-semibold text-gray-900">{goal.name}</h3>
                                                {goal.completed && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00B679]/10 text-[#00916A]">✓ Concluída</span>
                                                )}
                                            </div>
                                            {goal.deadline && (
                                                <p className="text-[11px] text-gray-400 ml-4">Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-3 flex-shrink-0">
                                            <button onClick={() => { setEditingGoal(goal); setShowForm(false); }} className="text-[12px] font-semibold text-[#00B679] bg-none border-none cursor-pointer hover:underline">Editar</button>
                                            <button onClick={() => handleDelete(goal.id)} className="text-[12px] font-semibold text-red-500 bg-none border-none cursor-pointer hover:underline">Excluir</button>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="flex-1 h-2 bg-black/6 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-700" style={{
                                                width: `${goal.progresso}%`,
                                                background: goal.completed ? '#00B679' : color,
                                            }} />
                                        </div>
                                        <span className="font-mono text-[13px] font-bold text-gray-800 min-w-[38px] text-right">{goal.progresso}%</span>
                                    </div>

                                    {/* Amounts */}
                                    <div className="flex flex-wrap justify-between gap-3">
                                        <span className="font-mono text-[12.5px] text-gray-600">
                                            {fmtN(goal.current_amount)} <span className="text-gray-400">de</span> {fmtN(goal.target_amount)}
                                        </span>
                                        {goal.eta && !goal.completed && (
                                            <div className="flex flex-col items-end gap-0.5">
                                                <span className="flex items-center gap-1.5 text-[12.5px] font-medium" style={{ color }}>
                                                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    {goal.eta.data_estimada} ({goal.eta.meses}m)
                                                </span>
                                                <span className="text-[11px] text-gray-400">
                                                    {fmtN(goal.eta.economia_mensal)}/mês · {Number(goal.savings_pct).toFixed(0)}% da economia
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {!goal.completed && <FastTrackSimulator goal={goal} />}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-black/7 shadow-sm px-6 py-14 text-center">
                        <div className="w-12 h-12 rounded-xl bg-[#00B679]/8 flex items-center justify-center mx-auto mb-4">
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#00B679">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                            </svg>
                        </div>
                        <p className="text-[14px] font-medium text-gray-600 mb-5">Nenhuma meta cadastrada ainda</p>
                        <button onClick={() => setShowForm(true)} className="btn-primary text-[13px]">Criar primeira meta</button>
                    </div>
                )}
            </div>

            {/* FAB */}
            <button
                onClick={() => { setEditingGoal(null); setShowForm(true); }}
                title="Nova Meta"
                className="fixed bottom-24 right-5 lg:bottom-8 lg:right-8 w-[52px] h-[52px] lg:w-14 lg:h-14 rounded-full bg-[#00B679] border-none cursor-pointer flex items-center justify-center shadow-lg shadow-[#00B679]/30 z-30 hover:scale-105 active:scale-95 transition-transform"
            >
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#fff">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </button>
        </AuthenticatedLayout>
    );
}
