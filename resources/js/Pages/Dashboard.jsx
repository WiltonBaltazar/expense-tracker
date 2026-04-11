import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import MonthSelector from '@/Components/MonthSelector';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { getStaggerMotionProps, staggerItem } from '@/lib/motion';
import { useMotionPreference } from '@/contexts/MotionPreferenceContext';

const fmt  = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + ' MT';
const fmtN = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

const CATEGORIES = [
    'Alimentacao','Moradia','Aluguel','Agua','Energia','Internet',
    'Transporte','Combustivel','Saude','Farmacia','Educacao',
    'Dizimo','Ofertas','Lazer','Vestuario','Assinaturas',
    'Restaurantes','Telefone','Seguros','Manutencao',
    'Empregada','Mercado','Beleza','Presentes','Viagem',
    'Impostos','Taxas Bancarias','Outros',
];

const SOURCE_LABELS = { salario: 'Salário', freelance: 'Freelance', renda_passiva: 'Renda Passiva', outro: 'Outro' };
const FREQ_LABELS   = { semanal: 'Semanal', quinzenal: 'Quinzenal', mensal: 'Mensal', bimestral: 'Bimestral', trimestral: 'Trimestral', semestral: 'Semestral', anual: 'Anual', unico: 'Único' };

const inputCls = 'w-full px-3 py-2 rounded-lg bg-gray-50 border border-black/10 text-gray-900 text-[13px] outline-none focus:border-[#00B679]/50 focus:ring-2 focus:ring-[#00B679]/10 focus:bg-white transition-colors';

const CloseBtn = ({ onClose }) => (
    <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors p-1 rounded">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    </button>
);

// ── Quick Expense Modal ───────────────────────────────────────────────────────
function QuickExpenseModal({ show, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        description: '',
        amount: '',
        category: 'Alimentacao',
        bucket: 'necessidades',
        spent_at: new Date().toISOString().slice(0, 10),
        is_recurring: false,
        frequency: 'mensal',
    });

    function handleSubmit(e) {
        e.preventDefault();
        post(route('expenses.store'), { onSuccess: () => { reset(); onClose(); } });
    }

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[16px] font-bold text-gray-900">Nova Despesa</h3>
                    <CloseBtn onClose={onClose} />
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Descrição</label>
                            <input type="text" value={data.description} onChange={e => setData('description', e.target.value)} className={inputCls} placeholder="Ex: Supermercado, Netflix..." autoFocus />
                            {errors.description && <p className="text-[11px] text-red-500 mt-1">{errors.description}</p>}
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Valor (MT)</label>
                            <input type="number" step="0.01" value={data.amount} onChange={e => setData('amount', e.target.value)} className={inputCls} placeholder="0.00" />
                            {errors.amount && <p className="text-[11px] text-red-500 mt-1">{errors.amount}</p>}
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Categoria</label>
                            <select value={data.category} onChange={e => setData('category', e.target.value)} className={inputCls}>
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Bucket</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['necessidades', 'desejos'].map(b => {
                                    const active = data.bucket === b;
                                    const color = b === 'necessidades' ? '#2563EB' : '#D97706';
                                    return (
                                        <button key={b} type="button" onClick={() => setData('bucket', b)}
                                            className="py-2 rounded-lg text-[12px] font-semibold transition-all duration-150 cursor-pointer border-2"
                                            style={{ borderColor: active ? color : 'rgba(0,0,0,0.1)', background: active ? color + '12' : 'transparent', color: active ? color : '#6B7280' }}>
                                            {b === 'necessidades' ? 'Necessidades' : 'Desejos'}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Data</label>
                            <input type="date" value={data.spent_at} onChange={e => setData('spent_at', e.target.value)} className={inputCls} />
                            {errors.spent_at && <p className="text-[11px] text-red-500 mt-1">{errors.spent_at}</p>}
                        </div>
                    </div>
                    <div className="mt-5 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="btn-secondary text-[13px]">Cancelar</button>
                        <button type="submit" disabled={processing} className="btn-primary text-[13px]">
                            {processing ? 'Salvando...' : 'Salvar Despesa'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

// ── Quick Income Modal ───────────────────────────────────────────────────────
function QuickIncomeModal({ show, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        source: 'salario',
        amount: '',
        frequency: 'mensal',
        description: '',
        received_at: new Date().toISOString().slice(0, 10),
    });

    function handleSubmit(e) {
        e.preventDefault();
        post(route('incomes.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    }

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[16px] font-bold text-gray-900">Nova Renda</h3>
                    <CloseBtn onClose={onClose} />
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Fonte</label>
                            <select value={data.source} onChange={e => setData('source', e.target.value)} className={inputCls}>
                                {Object.entries(SOURCE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                            </select>
                            {errors.source && <p className="text-[11px] text-red-500 mt-1">{errors.source}</p>}
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Valor (MT)</label>
                            <input type="number" step="0.01" value={data.amount} onChange={e => setData('amount', e.target.value)} className={inputCls} placeholder="0.00" />
                            {errors.amount && <p className="text-[11px] text-red-500 mt-1">{errors.amount}</p>}
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Frequência</label>
                            <select value={data.frequency} onChange={e => setData('frequency', e.target.value)} className={inputCls}>
                                {Object.entries(FREQ_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                            </select>
                            {errors.frequency && <p className="text-[11px] text-red-500 mt-1">{errors.frequency}</p>}
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Data</label>
                            <input type="date" value={data.received_at} onChange={e => setData('received_at', e.target.value)} className={inputCls} />
                            {errors.received_at && <p className="text-[11px] text-red-500 mt-1">{errors.received_at}</p>}
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Descrição</label>
                            <input type="text" value={data.description} onChange={e => setData('description', e.target.value)} className={inputCls} placeholder="Opcional" />
                        </div>
                    </div>
                    <div className="mt-5 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="btn-secondary text-[13px]">Cancelar</button>
                        <button type="submit" disabled={processing} className="btn-primary text-[13px]">
                            {processing ? 'Salvando...' : 'Salvar Renda'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

// ── Quick Goal Modal ─────────────────────────────────────────────────────────
function QuickGoalModal({ show, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        target_amount: '',
        current_amount: '0',
        deadline: '',
    });

    function handleSubmit(e) {
        e.preventDefault();
        post(route('goals.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    }

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[16px] font-bold text-gray-900">Nova Meta</h3>
                    <CloseBtn onClose={onClose} />
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nome da Meta</label>
                            <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className={inputCls} placeholder="Ex: Viagem, Reserva..." />
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
                            {errors.deadline && <p className="text-[11px] text-red-500 mt-1">{errors.deadline}</p>}
                        </div>
                    </div>
                    <div className="mt-5 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="btn-secondary text-[13px]">Cancelar</button>
                        <button type="submit" disabled={processing} className="btn-primary text-[13px]">
                            {processing ? 'Salvando...' : 'Salvar Meta'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
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
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h3 className="text-[16px] font-bold text-gray-900">Transferir para Poupança</h3>
                        <p className="text-[12px] text-gray-400 mt-0.5">O valor ficará disponível para suas metas</p>
                    </div>
                    <CloseBtn onClose={onClose} />
                </div>
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
                        <input type="text" placeholder="Ex: Bónus de fim de ano..." value={data.note} onChange={e => setData('note', e.target.value)} className={inputCls} />
                    </div>
                    <div className="pt-2 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="btn-secondary text-[13px]">Cancelar</button>
                        <button type="submit" disabled={processing} className="btn-primary text-[13px]">
                            {processing ? 'Registrando...' : 'Registrar Transferência'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

// ── Donut chart tooltip ───────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-black/10 rounded-lg px-3 py-2 shadow-lg text-xs">
            <p className="font-semibold text-gray-800">{payload[0].name}</p>
            <p className="font-mono text-gray-600 mt-0.5">{fmt(payload[0].value)}</p>
        </div>
    );
};

// ── Summary header with donut chart ──────────────────────────────────────────
function SummaryHeader({ allocations, bucketStatus, monthIncome }) {
    const totalSpent   = bucketStatus.necessidades.gasto + bucketStatus.desejos.gasto + bucketStatus.economia.transferido;
    const totalRemain  = bucketStatus.necessidades.restante + bucketStatus.desejos.restante + bucketStatus.economia.restante;
    const isNeg        = totalRemain < 0;

    const pieData = [
        { name: 'Necessidades', value: bucketStatus.necessidades.gasto,        color: '#2563EB' },
        { name: 'Desejos',      value: bucketStatus.desejos.gasto,             color: '#D97706' },
        { name: 'Economia',     value: bucketStatus.economia.transferido || 0, color: '#00B679' },
    ].filter(d => d.value > 0);

    const alloc = [
        { label: 'Necessidades', pct: allocations.necessidades.percentual, color: '#2563EB' },
        { label: 'Desejos',      pct: allocations.desejos.percentual,      color: '#D97706' },
        { label: 'Economia',     pct: allocations.economia.percentual,     color: '#00B679' },
    ];

    return (
        <div className="bg-white rounded-xl border border-black/7 shadow-sm overflow-hidden">
            <div className="flex h-1 rounded-t-xl overflow-hidden">
                {alloc.map(a => (
                    <div key={a.label} style={{ flex: a.pct, background: a.color }} />
                ))}
            </div>

            <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-4">
                        <div>
                            <p className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Renda do Mês</p>
                            <p className="font-mono text-2xl font-bold text-gray-900">{fmtN(monthIncome)}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">MT</p>
                        </div>
                        <div>
                            <p className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Saldo Restante</p>
                            <p className={`font-mono text-2xl font-bold ${isNeg ? 'text-red-500' : 'text-[#00B679]'}`}>
                                {isNeg ? '-' : ''}{fmtN(Math.abs(totalRemain))}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5">MT</p>
                        </div>
                        <div>
                            <p className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Total Gasto</p>
                            <p className="font-mono text-lg font-semibold text-red-500">- {fmtN(totalSpent)}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">MT</p>
                        </div>
                        <div>
                            <p className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Renda Base</p>
                            <p className="font-mono text-lg font-semibold text-gray-600">{fmtN(allocations.renda_total)}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">MT estimado</p>
                        </div>
                    </div>

                    {pieData.length > 0 && (
                        <div className="flex flex-col items-center gap-3 sm:w-[180px]">
                            <ResponsiveContainer width={150} height={150}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={2} dataKey="value" stroke="none">
                                        {pieData.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<ChartTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-col gap-1.5 w-full">
                                {pieData.map(d => (
                                    <div key={d.name} className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                                            <span className="text-[11px] text-gray-500">{d.name}</span>
                                        </div>
                                        <span className="font-mono text-[11px] font-semibold text-red-500">-{fmtN(d.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Budget buckets ────────────────────────────────────────────────────────────
function BucketPanel({ bucketStatus }) {
    const buckets = [
        { label: 'Necessidades', colorHex: '#2563EB', allocated: bucketStatus.necessidades.alocado, spent: bucketStatus.necessidades.gasto, remaining: bucketStatus.necessidades.restante },
        { label: 'Desejos',      colorHex: '#D97706', allocated: bucketStatus.desejos.alocado,      spent: bucketStatus.desejos.gasto,      remaining: bucketStatus.desejos.restante },
        { label: 'Economia',     colorHex: '#00B679', allocated: bucketStatus.economia.alocado,     spent: bucketStatus.economia.transferido, remaining: bucketStatus.economia.restante },
    ];

    return (
        <div className="bg-white rounded-xl border border-black/7 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-black/6 flex items-center justify-between">
                <span className="text-[13px] font-semibold text-gray-900">Orçamento Mensal</span>
            </div>
            {buckets.map((b, i) => {
                const pct   = b.allocated > 0 ? Math.min(100, (b.spent / b.allocated) * 100) : 0;
                const isOver = b.remaining < 0;
                return (
                    <div key={b.label} className={`px-5 py-3.5 ${i < buckets.length - 1 ? 'border-b border-black/5' : ''}`}>
                        <div className="flex items-start justify-between mb-2 gap-2">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: b.colorHex }} />
                                <span className="text-[13.5px] font-medium text-gray-800">{b.label}</span>
                            </div>
                            <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                                <span className="font-mono text-[12px] text-gray-500 hidden sm:inline">
                                    <span className="text-red-500">-{fmtN(b.spent)}</span>
                                    <span className="text-gray-300 mx-1">/</span>
                                    {fmtN(b.allocated)}
                                </span>
                                <span className={`font-mono text-[12px] font-semibold ${isOver ? 'text-red-500' : 'text-[#00B679]'}`}>
                                    {isOver ? '-' : ''}{fmt(Math.abs(b.remaining))}
                                </span>
                                <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full min-w-[52px] text-center ${isOver ? 'bg-red-50 text-red-600' : 'bg-green-50 text-[#00916A]'}`}>
                                    {isOver ? 'Excedido' : 'OK'}
                                </span>
                            </div>
                        </div>
                        <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, pct)}%`, background: isOver ? '#EF4444' : b.colorHex }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ── Savings card (modal-based) ────────────────────────────────────────────────
function SavingsCard({ economia, savingsTransfers, onAddSaving }) {
    function handleDelete(id) {
        router.delete(route('savings.destroy', id), { preserveScroll: true });
    }

    const pct    = economia.alocado > 0 ? Math.min(100, Math.round((economia.transferido / economia.alocado) * 100)) : 0;
    const isOver = economia.restante < 0;

    return (
        <div className="bg-white rounded-xl border border-black/7 shadow-sm">
            <div className="px-5 py-3.5 border-b border-black/6 flex items-center justify-between">
                <span className="text-[13px] font-semibold text-gray-900">Transferências para Economia</span>
                <button onClick={onAddSaving} className="text-[12px] font-semibold text-[#00B679] bg-[#00B679]/8 border-none rounded-md px-3 py-1 cursor-pointer hover:bg-[#00B679]/15 transition-colors">
                    + Registrar
                </button>
            </div>

            <div className="px-5 py-3.5">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] text-gray-500 font-mono">
                        <span className={isOver ? 'text-red-500' : 'text-[#00B679]'}>{fmt(economia.transferido)}</span>
                        <span className="text-gray-300 mx-1">/</span>
                        {fmt(economia.alocado)}
                    </span>
                    <span className={`text-[11px] font-semibold ${isOver ? 'text-red-500' : 'text-gray-400'}`}>{pct}% transferido</span>
                </div>
                <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: isOver ? '#EF4444' : '#00B679' }} />
                </div>
            </div>

            {savingsTransfers.length > 0 && (
                <div className="px-5 pb-3 space-y-0">
                    {savingsTransfers.map(t => (
                        <div key={t.id} className="flex items-center justify-between py-2 border-b border-black/4 last:border-0">
                            <div className="min-w-0">
                                <span className="font-mono text-[12.5px] font-semibold text-[#00B679]">{fmt(t.amount)}</span>
                                {t.note && <span className="text-[11px] text-gray-400 ml-2">{t.note}</span>}
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <span className="text-[11px] text-gray-400">{new Date(t.transferred_at).toLocaleDateString('pt-BR')}</span>
                                <button onClick={() => handleDelete(t.id)} className="text-gray-300 hover:text-red-400 transition-colors p-1 rounded">
                                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Weekly budget ─────────────────────────────────────────────────────────────
function WeeklyCard({ weeklyBudget }) {
    const { allowance, spent, remaining, pct_spent, week_start, week_end } = weeklyBudget;
    const isOver   = remaining < 0;
    const barColor = pct_spent >= 100 ? '#EF4444' : pct_spent >= 80 ? '#D97706' : '#00B679';

    return (
        <div className="bg-white rounded-xl border border-black/7 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="text-[13.5px] font-semibold text-gray-900">Orçamento Semanal · Desejos</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{week_start} – {week_end}</p>
                </div>
                <span className={`text-[10.5px] font-semibold px-2.5 py-1 rounded-full ${isOver ? 'bg-red-50 text-red-600' : 'bg-green-50 text-[#00916A]'}`}>
                    {isOver ? 'Excedido' : `${pct_spent}% usado`}
                </span>
            </div>

            <div className="h-1.5 bg-black/5 rounded-full overflow-hidden mb-3">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, pct_spent)}%`, background: barColor }} />
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
                {[
                    { lbl: 'Semanal',  val: allowance,           negative: false, clr: 'text-gray-700' },
                    { lbl: 'Gasto',    val: spent,               negative: true,  clr: 'text-red-500' },
                    { lbl: 'Restante', val: Math.abs(remaining), negative: false, clr: isOver ? 'text-red-500' : 'text-[#00B679]' },
                ].map(d => (
                    <div key={d.lbl}>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">{d.lbl}</p>
                        <p className={`font-mono text-[12.5px] font-semibold ${d.clr}`}>
                            {d.negative ? '- ' : ''}{fmtN(d.val)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Goal item ─────────────────────────────────────────────────────────────────
function GoalItem({ goal }) {
    return (
        <div className="flex items-center gap-3 py-2.5 border-b border-black/5 last:border-0">
            <div className="w-9 h-9 rounded-full bg-[#00B679]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[11.5px] font-bold text-[#00B679]">{goal.progresso}%</span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-medium text-gray-800 truncate">{goal.name}</p>
                <div className="h-1.5 bg-black/5 rounded-full overflow-hidden mt-1.5">
                    <div className="h-full rounded-full transition-all duration-500 bg-[#00B679]" style={{ width: `${goal.progresso}%` }} />
                </div>
            </div>
            <div className="text-right flex-shrink-0">
                <p className="font-mono text-[12px] font-semibold text-gray-800">{fmtN(goal.current_amount)}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">/ {fmtN(goal.target_amount)}</p>
            </div>
        </div>
    );
}

// ── Expense transaction row ───────────────────────────────────────────────────
function ExpenseItem({ expense, isLast }) {
    const initial = (expense.description || '?').charAt(0).toUpperCase();
    const isNeeds = expense.bucket === 'necessidades';

    return (
        <div className={`flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors ${isLast ? '' : 'border-b border-black/5'}`}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[13px] font-bold" style={{ background: isNeeds ? '#2563EB18' : '#D9770618', color: isNeeds ? '#2563EB' : '#D97706' }}>
                {initial}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-medium text-gray-800 truncate">{expense.description}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10.5px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: isNeeds ? '#2563EB10' : '#D9770610', color: isNeeds ? '#2563EB' : '#D97706' }}>
                        {isNeeds ? 'Necessidades' : 'Desejos'}
                    </span>
                    <span className="text-[11px] text-gray-400">{expense.category}</span>
                </div>
            </div>
            <span className="font-mono text-[13.5px] font-semibold text-red-500 flex-shrink-0">- {fmtN(expense.amount)}</span>
        </div>
    );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Dashboard({ allocations, bucketStatus, goals, recentExpenses, monthIncome, weeklyBudget, savingsTransfers, currentMonth }) {
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showIncomeModal, setShowIncomeModal] = useState(false);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [showSavingsModal, setShowSavingsModal] = useState(false);
    const [fabOpen, setFabOpen] = useState(false);
    const { reduceMotion } = useMotionPreference();
    const staggerProps = getStaggerMotionProps(reduceMotion);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">Painel Financeiro</h2>
                        <MonthSelector currentMonth={currentMonth} routeName="dashboard" className="mt-0.5" />
                    </div>
                    <button onClick={() => setShowExpenseModal(true)} className="btn-primary text-[13px]">
                        + Nova Despesa
                    </button>
                </div>
            }
        >
            <Head title="Painel" />

            <QuickExpenseModal show={showExpenseModal} onClose={() => setShowExpenseModal(false)} />
            <QuickIncomeModal show={showIncomeModal} onClose={() => setShowIncomeModal(false)} />
            <QuickGoalModal show={showGoalModal} onClose={() => setShowGoalModal(false)} />
            <SavingsTransferModal show={showSavingsModal} onClose={() => setShowSavingsModal(false)} />

            <motion.div
                className="max-w-[1100px] mx-auto px-5 sm:px-6 lg:px-8 py-5 pb-10 space-y-4"
                variants={staggerProps.variants}
                initial={staggerProps.initial}
                animate={staggerProps.animate}
            >

                <motion.div variants={staggerItem}>
                    <SummaryHeader allocations={allocations} bucketStatus={bucketStatus} monthIncome={monthIncome} />
                </motion.div>

                <motion.div variants={staggerItem}>
                    <BucketPanel bucketStatus={bucketStatus} />
                </motion.div>

                <motion.div variants={staggerItem}>
                    <SavingsCard
                        economia={bucketStatus.economia}
                        savingsTransfers={savingsTransfers}
                        onAddSaving={() => setShowSavingsModal(true)}
                    />
                </motion.div>

                <motion.div variants={staggerItem}>
                    <WeeklyCard weeklyBudget={weeklyBudget} />
                </motion.div>

                <motion.div variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    <motion.div whileHover={reduceMotion ? undefined : { y: -2 }} transition={{ duration: reduceMotion ? 0 : 0.2 }} className="bg-white rounded-xl border border-black/7 shadow-sm">
                        <div className="px-5 py-3.5 border-b border-black/6 flex items-center justify-between">
                            <span className="text-[13px] font-semibold text-gray-900">Metas</span>
                            <Link href={route('goals.index')} className="text-[12px] font-semibold text-[#00B679] hover:underline">Ver todas</Link>
                        </div>
                        <div className="px-5 py-2">
                            {goals.length > 0
                                ? goals.map(g => <GoalItem key={g.id} goal={g} />)
                                : (
                                    <div className="text-center py-8">
                                        <p className="text-[13px] text-gray-500 mb-3">Nenhuma meta cadastrada</p>
                                        <Link href={route('goals.index')} className="btn-primary text-[12px] py-1.5 px-4">Criar meta</Link>
                                    </div>
                                )
                            }
                        </div>
                    </motion.div>

                    <motion.div whileHover={reduceMotion ? undefined : { y: -2 }} transition={{ duration: reduceMotion ? 0 : 0.2 }} className="bg-white rounded-xl border border-black/7 shadow-sm">
                        <div className="px-5 py-3.5 border-b border-black/6 flex items-center justify-between">
                            <span className="text-[13px] font-semibold text-gray-900">Despesas Recentes</span>
                            <Link href={route('expenses.index')} className="text-[12px] font-semibold text-[#00B679] hover:underline">Ver todas</Link>
                        </div>
                        {recentExpenses.length > 0
                            ? recentExpenses.map((e, i) => <ExpenseItem key={e.id} expense={e} isLast={i === recentExpenses.length - 1} />)
                            : (
                                <div className="text-center py-8 px-5">
                                    <p className="text-[13px] text-gray-500 mb-3">Nenhuma despesa registrada</p>
                                    <button onClick={() => setShowExpenseModal(true)} className="btn-primary text-[12px] py-1.5 px-4">Registrar despesa</button>
                                </div>
                            )
                        }
                    </motion.div>

                </motion.div>
            </motion.div>

            {/* FAB Speed Dial */}
            <div className="fixed bottom-24 right-5 lg:bottom-8 lg:right-8 z-30 flex flex-col items-end gap-2">
                <AnimatePresence>
                    {fabOpen && (
                        <motion.div
                            className="flex flex-col items-end gap-2"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: reduceMotion ? 0 : 0.2 }}
                        >
                            <motion.button
                            onClick={() => { setShowGoalModal(true); setFabOpen(false); }}
                            className="flex items-center gap-2 bg-white border border-black/10 rounded-full px-3 py-2 shadow-md hover:bg-gray-50 transition-colors"
                            whileHover={reduceMotion ? undefined : { x: -2 }}
                            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                        >
                            <span className="text-[12px] font-semibold text-gray-700">Nova Meta</span>
                            <span className="w-7 h-7 rounded-full bg-[#00B679]/10 flex items-center justify-center text-[#00B679]">
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22" /></svg>
                            </span>
                            </motion.button>

                            <motion.button
                            onClick={() => { setShowIncomeModal(true); setFabOpen(false); }}
                            className="flex items-center gap-2 bg-white border border-black/10 rounded-full px-3 py-2 shadow-md hover:bg-gray-50 transition-colors"
                            whileHover={reduceMotion ? undefined : { x: -2 }}
                            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                        >
                            <span className="text-[12px] font-semibold text-gray-700">Nova Renda</span>
                            <span className="w-7 h-7 rounded-full bg-[#00B679]/10 flex items-center justify-center text-[#00B679]">
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0" /></svg>
                            </span>
                            </motion.button>

                            <motion.button
                            onClick={() => { setShowExpenseModal(true); setFabOpen(false); }}
                            className="flex items-center gap-2 bg-white border border-black/10 rounded-full px-3 py-2 shadow-md hover:bg-gray-50 transition-colors"
                            whileHover={reduceMotion ? undefined : { x: -2 }}
                            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                        >
                            <span className="text-[12px] font-semibold text-gray-700">Nova Despesa</span>
                            <span className="w-7 h-7 rounded-full bg-[#00B679]/10 flex items-center justify-center text-[#00B679]">
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5h18M7.5 15h1.5" /></svg>
                            </span>
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    onClick={() => setFabOpen((v) => !v)}
                    title={fabOpen ? 'Fechar ações rápidas' : 'Ações rápidas'}
                    className="w-[52px] h-[52px] lg:w-14 lg:h-14 rounded-full bg-[#00B679] border-none cursor-pointer flex items-center justify-center shadow-lg shadow-[#00B679]/30 hover:scale-105 active:scale-95 transition-transform"
                    whileHover={reduceMotion ? undefined : { scale: 1.05 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.93 }}
                >
                    <svg
                        width="22"
                        height="22"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="#fff"
                        className={`transition-transform duration-200 ${fabOpen ? 'rotate-45' : ''}`}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </motion.button>
            </div>
        </AuthenticatedLayout>
    );
}
