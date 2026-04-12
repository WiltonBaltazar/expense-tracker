import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import MonthSelector from '@/Components/MonthSelector';
import { Head, useForm, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
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

const FREQ_LABELS = {
    semanal:'Semanal', quinzenal:'Quinzenal', mensal:'Mensal',
    bimestral:'Bimestral', trimestral:'Trimestral', semestral:'Semestral', anual:'Anual',
};

const PAYMENT_LABELS = {
    dinheiro: 'Dinheiro',
    mpesa: 'M-Pesa',
    emola: 'e-Mola',
    mkesh: 'mKesh',
    banco: 'Banco',
};

const PAYMENT_COLORS = {
    dinheiro: '#6B7280',
    mpesa: '#E4093E',
    emola: '#F97316',
    mkesh: '#3B82F6',
    banco: '#8B5CF6',
};

const inputCls = 'w-full px-3 py-2 rounded-lg bg-gray-50 border border-black/10 text-gray-900 text-[13px] outline-none focus:border-[#00B679]/50 focus:ring-2 focus:ring-[#00B679]/10 focus:bg-white transition-colors';

// ── Pie chart tooltip ─────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-black/10 rounded-lg px-3 py-2 shadow-lg text-xs">
            <p className="font-semibold text-gray-800">{payload[0].name}</p>
            <p className="font-mono text-red-500 mt-0.5">- {fmt(payload[0].value)}</p>
        </div>
    );
};

// ── Form ──────────────────────────────────────────────────────────────────────
function ExpenseForm({ onClose, expense = null, currentMonth }) {
    const defaultDate = expense?.spent_at?.split('T')[0] || `${currentMonth}-01`;
    const { data, setData, post, put, processing, errors, reset } = useForm({
        description: expense?.description || '',
        notes: expense?.notes || '',
        payment_method: expense?.payment_method || '',
        amount: expense?.amount || '',
        category: expense?.category || 'Alimentacao',
        bucket: expense?.bucket || 'necessidades',
        spent_at: defaultDate,
        is_recurring: expense?.is_recurring || false,
        frequency: expense?.frequency || 'mensal',
    });

    function handleSubmit(e) {
        e.preventDefault();
        if (expense) {
            put(route('expenses.update', expense.id), { onSuccess: () => { reset(); onClose(); } });
        } else {
            post(route('expenses.store'), { onSuccess: () => { reset(); onClose(); } });
        }
    }

    return (
        <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-[16px] font-bold text-gray-900">{expense ? 'Editar Despesa' : 'Nova Despesa'}</h3>
                <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors p-1 rounded">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Descrição</label>
                        <input type="text" value={data.description} onChange={e => setData('description', e.target.value)} className={inputCls} placeholder="Ex: Supermercado, Netflix..." />
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
                                const color  = b === 'necessidades' ? '#2563EB' : '#D97706';
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
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Forma de Pagamento</label>
                        <select value={data.payment_method} onChange={e => setData('payment_method', e.target.value)} className={inputCls}>
                            <option value="">— Opcional —</option>
                            {Object.entries(PAYMENT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Notas</label>
                        <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} className={inputCls + ' resize-none'} rows={2} placeholder="Observações opcionais..." />
                        {errors.notes && <p className="text-[11px] text-red-500 mt-1">{errors.notes}</p>}
                    </div>
                    <div className="sm:col-span-2">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-black/7">
                            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                <input type="checkbox" checked={data.is_recurring} onChange={e => setData('is_recurring', e.target.checked)} className="sr-only" />
                                <div className="relative w-9 h-5 rounded-full transition-colors" style={{ background: data.is_recurring ? '#00B679' : 'rgba(0,0,0,0.15)' }}>
                                    <div className="absolute top-[3px] w-3.5 h-3.5 bg-white rounded-full shadow transition-all" style={{ left: data.is_recurring ? '19px' : '3px' }} />
                                </div>
                            </label>
                            <div className="flex-1">
                                <p className="text-[13px] font-medium text-gray-800">Despesa recorrente</p>
                                <p className="text-[11px] text-gray-400">Contabilizada automaticamente todo mês</p>
                            </div>
                            {data.is_recurring && (
                                <select value={data.frequency} onChange={e => setData('frequency', e.target.value)} className="px-2.5 py-1.5 rounded-lg border border-black/10 bg-white text-[12px] outline-none focus:border-[#00B679]/50">
                                    {Object.entries(FREQ_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                </select>
                            )}
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="btn-secondary text-[13px] inline-flex items-center gap-1.5">
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        Cancelar
                    </button>
                    <button type="submit" disabled={processing} className="btn-primary text-[13px] inline-flex items-center gap-1.5">
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                        {processing ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </div>
    );
}

// ── Transaction row ───────────────────────────────────────────────────────────
function ExpenseRow({ expense, onEdit, onDelete }) {
    const [hovered, setHovered] = useState(false);
    const { reduceMotion } = useMotionPreference();
    const initial  = (expense.description || '?').charAt(0).toUpperCase();
    const isNeeds  = expense.bucket === 'necessidades';
    const dateStr  = expense.is_recurring
        ? `Desde ${new Date(expense.spent_at).toLocaleDateString('pt-BR')}`
        : new Date(expense.spent_at).toLocaleDateString('pt-BR');
    const pmColor = expense.payment_method ? PAYMENT_COLORS[expense.payment_method] : null;

    return (
        <motion.div
            className={`flex items-center gap-3 px-4 py-2.5 border-b border-black/5 last:border-0 transition-colors ${hovered ? 'bg-gray-50' : ''}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            whileHover={reduceMotion ? undefined : { y: -1 }}
            transition={{ duration: reduceMotion ? 0 : 0.15 }}
        >
            {/* Icon */}
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[13px] font-bold"
                style={{ background: isNeeds ? '#2563EB18' : '#D9770618', color: isNeeds ? '#2563EB' : '#D97706' }}>
                {initial}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-medium text-gray-800 truncate">{expense.description}</p>
                {expense.notes && (
                    <p className="text-[11px] text-gray-400 truncate mt-0.5 italic">{expense.notes}</p>
                )}
                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
                        style={{ background: isNeeds ? '#2563EB10' : '#D9770610', color: isNeeds ? '#2563EB' : '#D97706' }}>
                        {isNeeds ? 'Necessidades' : 'Desejos'}
                    </span>
                    <span className="text-[11px] text-gray-400">{expense.category}</span>
                    {expense.is_recurring && (
                        <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-[#00B679]/8 text-[#00916A]">
                            {FREQ_LABELS[expense.frequency]}
                        </span>
                    )}
                    {expense.payment_method && (
                        <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
                            style={{ background: pmColor + '18', color: pmColor }}>
                            {PAYMENT_LABELS[expense.payment_method]}
                        </span>
                    )}
                </div>
            </div>

            {/* Date – hidden on mobile */}
            <span className="hidden sm:block text-[11.5px] text-gray-400 flex-shrink-0 min-w-[84px] text-right">{dateStr}</span>

            {/* Amount */}
            <span className="font-mono text-[13.5px] font-semibold text-red-500 flex-shrink-0 min-w-[76px] sm:min-w-[90px] text-right">
                - {fmtN(expense.amount)}
            </span>

            {/* Actions: icon buttons on hover (desktop) */}
            <div className={`hidden sm:flex gap-1 flex-shrink-0 transition-opacity duration-100 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
                <button onClick={() => onEdit(expense)} title="Editar"
                    className="p-1.5 rounded text-gray-300 hover:text-[#00B679] transition-colors">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                </button>
                <button onClick={() => onDelete(expense.id)} title="Excluir"
                    className="p-1.5 rounded text-gray-300 hover:text-red-500 transition-colors">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                </button>
            </div>

            {/* Mobile actions */}
            <div className="flex sm:hidden gap-0.5 flex-shrink-0">
                <button onClick={() => onEdit(expense)} title="Editar"
                    className="p-2.5 rounded-lg text-[#00B679] hover:bg-[#00B679]/8 transition-colors active:scale-95">
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                </button>
                <button onClick={() => onDelete(expense.id)} title="Excluir"
                    className="p-2.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors active:scale-95">
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                </button>
            </div>
        </motion.div>
    );
}

// ── Section ───────────────────────────────────────────────────────────────────
function ExpenseSection({ title, items, onEdit, onDelete }) {
    if (items.length === 0) return null;
    return (
        <div className="mb-3">
            {title && (
                <div className="flex items-center gap-1.5 mb-2 px-1">
                    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#9CA3AF"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                    <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider">{title}</span>
                </div>
            )}
            <div className="bg-white rounded-xl border border-black/7 shadow-sm overflow-hidden">
                {/* Desktop column header */}
                <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gray-50 border-b border-black/5">
                    <div className="w-9 flex-shrink-0" />
                    <div className="flex-1 text-[10.5px] font-bold text-gray-400 uppercase tracking-wider">Descrição</div>
                    <div className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider min-w-[84px] text-right">Data</div>
                    <div className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider min-w-[90px] text-right">Valor</div>
                    <div className="w-14 flex-shrink-0" />
                </div>
                {items.map(e => <ExpenseRow key={e.id} expense={e} onEdit={onEdit} onDelete={onDelete} />)}
            </div>
        </div>
    );
}

// ── Search / Filter bar ───────────────────────────────────────────────────────
function FilterBar({ search, onSearch, category, onCategory, bucket, onBucket, payment, onPayment, onClear, hasFilters }) {
    const selectCls = 'px-2.5 py-1.5 rounded-lg border border-black/10 bg-white text-[12px] text-gray-700 outline-none focus:border-[#00B679]/50 cursor-pointer';
    return (
        <div className="bg-white rounded-xl border border-black/7 shadow-sm px-4 py-3 mb-4 flex flex-wrap gap-2 items-center">
            {/* Search input */}
            <div className="relative flex-1 min-w-[160px]">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" width="13" height="13" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                    type="text"
                    value={search}
                    onChange={e => onSearch(e.target.value)}
                    placeholder="Pesquisar despesas..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-black/10 bg-gray-50 text-[13px] text-gray-900 outline-none focus:border-[#00B679]/50 focus:ring-2 focus:ring-[#00B679]/10 focus:bg-white transition-colors"
                />
            </div>
            {/* Filters */}
            <select value={category} onChange={e => onCategory(e.target.value)} className={selectCls}>
                <option value="">Todas as categorias</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={bucket} onChange={e => onBucket(e.target.value)} className={selectCls}>
                <option value="">Todos os buckets</option>
                <option value="necessidades">Necessidades</option>
                <option value="desejos">Desejos</option>
            </select>
            <select value={payment} onChange={e => onPayment(e.target.value)} className={selectCls}>
                <option value="">Todos os pagamentos</option>
                {Object.entries(PAYMENT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            {hasFilters && (
                <button onClick={onClear} className="text-[12px] text-gray-400 hover:text-gray-700 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-100">
                    Limpar
                </button>
            )}
        </div>
    );
}

// ── Budget Limits card ────────────────────────────────────────────────────────
function BudgetLimitsCard({ budgetLimits, categoryTotals }) {
    const [showForm, setShowForm] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);
    const [expanded, setExpanded] = useState(true);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        category: CATEGORIES[0],
        monthly_limit: '',
    });

    function openAdd() { reset(); setEditingBudget(null); setShowForm(true); }
    function openEdit(b) { setData({ category: b.category, monthly_limit: b.monthly_limit }); setEditingBudget(b); setShowForm(true); }
    function closeForm() { setShowForm(false); setEditingBudget(null); reset(); }

    function handleSubmit(e) {
        e.preventDefault();
        if (editingBudget) {
            put(route('budgets.update', editingBudget.id), { onSuccess: closeForm });
        } else {
            post(route('budgets.store'), { onSuccess: closeForm });
        }
    }

    function handleDelete(id) {
        if (confirm('Remover este limite?')) {
            router.delete(route('budgets.destroy', id));
        }
    }

    // Budgets enriched with current spend
    const enriched = budgetLimits.map(b => {
        const spent = categoryTotals[b.category] || 0;
        const pct = Math.min((spent / b.monthly_limit) * 100, 100);
        const over = spent > b.monthly_limit;
        const warning = !over && pct >= 70;
        return { ...b, spent, pct, over, warning };
    });

    // Categories not yet budgeted
    const budgetedCats = new Set(budgetLimits.map(b => b.category));
    const availableCategories = CATEGORIES.filter(c => !budgetedCats.has(c) || (editingBudget && editingBudget.category === c));

    return (
        <div className="bg-white rounded-xl border border-black/7 shadow-sm overflow-hidden mb-4">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
                <button onClick={() => setExpanded(v => !v)} className="flex items-center gap-2 text-left">
                    <div className="w-7 h-7 rounded-lg bg-[#00B679]/10 flex items-center justify-center">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#00B679">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c-.99.143-1.99.317-2.98.52m2.98-.52L5.13 15.197c-.122.499.106 1.028.589 1.202a5.989 5.989 0 002.031.352 5.989 5.989 0 002.031-.352c.483-.174.711-.703.59-1.202L5.25 4.971z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-[13.5px] font-bold text-gray-900 leading-tight">Limites por Categoria</p>
                        <p className="text-[11px] text-gray-400">{enriched.length === 0 ? 'Nenhum limite definido' : `${enriched.length} categoria${enriched.length > 1 ? 's' : ''} com limite`}</p>
                    </div>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#9CA3AF"
                        className={`ml-1 transition-transform ${expanded ? 'rotate-180' : ''}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </button>
                <button onClick={openAdd} className="flex items-center gap-1.5 text-[12px] font-semibold text-[#00B679] hover:text-[#00916A] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#00B679]/5">
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Adicionar
                </button>
            </div>

            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        {/* Inline add/edit form */}
                        <AnimatePresence>
                            {showForm && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.15 }}
                                    className="px-5 py-4 bg-gray-50 border-b border-black/5"
                                >
                                    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
                                        {!editingBudget && (
                                            <div className="flex-1 min-w-[140px]">
                                                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Categoria</label>
                                                <select value={data.category} onChange={e => setData('category', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg bg-white border border-black/10 text-gray-900 text-[13px] outline-none focus:border-[#00B679]/50">
                                                    {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                        )}
                                        {editingBudget && (
                                            <div className="flex-1 min-w-[140px]">
                                                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Categoria</label>
                                                <div className="px-3 py-2 rounded-lg bg-white border border-black/10 text-[13px] text-gray-700">{editingBudget.category}</div>
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-[120px]">
                                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Limite Mensal (MT)</label>
                                            <input type="number" step="1" min="1" value={data.monthly_limit}
                                                onChange={e => setData('monthly_limit', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg bg-white border border-black/10 text-gray-900 text-[13px] outline-none focus:border-[#00B679]/50"
                                                placeholder="0" autoFocus />
                                            {errors.monthly_limit && <p className="text-[11px] text-red-500 mt-1">{errors.monthly_limit}</p>}
                                        </div>
                                        <div className="flex gap-2 pb-0.5">
                                            <button type="submit" disabled={processing} className="btn-primary text-[13px] inline-flex items-center gap-1.5">
                                                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                                {processing ? '...' : 'Salvar'}
                                            </button>
                                            <button type="button" onClick={closeForm} className="btn-secondary text-[13px] inline-flex items-center gap-1.5">
                                                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                Cancelar
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Budget rows */}
                        {enriched.length > 0 ? (
                            <div className="divide-y divide-black/5">
                                {enriched.map(b => {
                                    const barColor = b.over ? '#EF4444' : b.warning ? '#F59E0B' : '#00B679';
                                    return (
                                        <div key={b.id} className="px-5 py-3 group">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[13px] font-medium text-gray-800">{b.category}</span>
                                                    {b.over && (
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-50 text-red-500">Excedido</span>
                                                    )}
                                                    {b.warning && !b.over && (
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">Atenção</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <span className="font-mono text-[12px] font-semibold text-gray-700">{fmtN(b.spent)}</span>
                                                        <span className="text-[11px] text-gray-400"> / {fmtN(b.monthly_limit)} MT</span>
                                                    </div>
                                                    <div className="hidden group-hover:flex gap-1">
                                                        <button onClick={() => openEdit(b)} title="Editar" className="p-1 rounded text-gray-300 hover:text-[#00B679] transition-colors">
                                                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                                                        </button>
                                                        <button onClick={() => handleDelete(b.id)} title="Remover" className="p-1 rounded text-gray-300 hover:text-red-500 transition-colors">
                                                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full rounded-full"
                                                    style={{ background: barColor }}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${b.pct}%` }}
                                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                                />
                                            </div>
                                            <div className="flex justify-between mt-1">
                                                <span className="text-[10.5px] text-gray-400">{Math.round(b.pct)}% utilizado</span>
                                                {b.over ? (
                                                    <span className="text-[10.5px] font-semibold text-red-500">+ {fmtN(b.spent - b.monthly_limit)} MT acima</span>
                                                ) : (
                                                    <span className="text-[10.5px] text-gray-400">{fmtN(b.monthly_limit - b.spent)} MT restantes</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : !showForm ? (
                            <div className="px-5 py-8 text-center">
                                <p className="text-[13px] text-gray-400">Defina limites mensais por categoria para controlar os seus gastos</p>
                                <button onClick={openAdd} className="mt-3 text-[12px] font-semibold text-[#00B679] hover:underline">+ Adicionar primeiro limite</button>
                            </div>
                        ) : null}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Spending Insights card ────────────────────────────────────────────────────
function InsightsCard({ insights, monthTotal }) {
    const { topCategories, momChanges, lastMonthTotal } = insights;
    const [expanded, setExpanded] = useState(true);

    if (topCategories.length === 0 && momChanges.length === 0) return null;

    const momVsLast = lastMonthTotal > 0
        ? Math.round(((monthTotal - lastMonthTotal) / lastMonthTotal) * 100)
        : null;

    return (
        <div className="bg-white rounded-xl border border-black/7 shadow-sm overflow-hidden mb-4">
            <button
                onClick={() => setExpanded(v => !v)}
                className="w-full flex items-center justify-between px-5 py-4 border-b border-black/5 text-left"
            >
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#7C3AED">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-[13.5px] font-bold text-gray-900 leading-tight">Insights de Gastos</p>
                        {momVsLast !== null && (
                            <p className="text-[11px] text-gray-400">
                                {momVsLast > 0 ? `+${momVsLast}%` : `${momVsLast}%`} em relação ao mês passado
                            </p>
                        )}
                    </div>
                </div>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#9CA3AF"
                    className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </button>

            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 py-4 space-y-5">
                            {/* Top categories */}
                            {topCategories.length > 0 && (
                                <div>
                                    <p className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider mb-3">Top categorias este mês</p>
                                    <div className="space-y-2.5">
                                        {topCategories.map((c, i) => (
                                            <div key={c.category}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-5 h-5 rounded-full bg-black/5 text-[10px] font-bold text-gray-500 flex items-center justify-center flex-shrink-0">{i + 1}</span>
                                                        <span className="text-[13px] text-gray-700">{c.category}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-mono text-[12px] font-semibold text-red-500">- {fmtN(c.amount)}</span>
                                                        <span className="text-[11px] text-gray-400 min-w-[32px] text-right">{c.pct}%</span>
                                                    </div>
                                                </div>
                                                <div className="h-1 bg-black/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full rounded-full bg-purple-400"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${c.pct}%` }}
                                                        transition={{ duration: 0.5, delay: i * 0.07, ease: 'easeOut' }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Month-over-month changes */}
                            {momChanges.length > 0 && (
                                <div>
                                    <p className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider mb-3">Variação vs mês passado</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {momChanges.map(c => {
                                            const up = c.change_pct > 0;
                                            return (
                                                <div key={c.category} className={`flex items-center justify-between px-3 py-2.5 rounded-lg border ${up ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                                                    <div>
                                                        <p className="text-[12.5px] font-medium text-gray-800">{c.category}</p>
                                                        <p className="text-[11px] text-gray-400 mt-0.5 font-mono">{fmtN(c.current)} MT</p>
                                                    </div>
                                                    <div className={`flex items-center gap-1 text-[13px] font-bold ${up ? 'text-red-500' : 'text-green-600'}`}>
                                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d={up ? 'M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18' : 'M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3'} />
                                                        </svg>
                                                        {up ? '+' : ''}{c.change_pct}%
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Index({ expenses, recurringExpenses, monthTotal, byBucket, currentMonth, budgetLimits, categoryTotals, insights }) {
    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const { delete: destroy } = useForm();
    const { reduceMotion } = useMotionPreference();
    const staggerProps = getStaggerMotionProps(reduceMotion);

    // Filter state
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterBucket, setFilterBucket] = useState('');
    const [filterPayment, setFilterPayment] = useState('');

    function handleDelete(id) {
        if (confirm('Remover esta despesa?')) destroy(route('expenses.destroy', id));
    }
    function handleEdit(expense) { setEditingExpense(expense); setShowForm(false); }
    function openNew() { setEditingExpense(null); setShowForm(true); }
    function clearFilters() { setSearch(''); setFilterCategory(''); setFilterBucket(''); setFilterPayment(''); }

    const oneTimeItems = expenses.data || expenses;
    const allItems = [...oneTimeItems, ...(recurringExpenses || [])];
    const hasFilters = search || filterCategory || filterBucket || filterPayment;

    function applyFilters(items) {
        return items.filter(e => {
            const q = search.toLowerCase();
            if (q && !e.description?.toLowerCase().includes(q) && !e.notes?.toLowerCase().includes(q)) return false;
            if (filterCategory && e.category !== filterCategory) return false;
            if (filterBucket && e.bucket !== filterBucket) return false;
            if (filterPayment && e.payment_method !== filterPayment) return false;
            return true;
        });
    }

    const visibleOneTime   = applyFilters(oneTimeItems);
    const visibleRecurring = applyFilters(recurringExpenses || []);

    const pieData = [
        { name: 'Necessidades', value: byBucket.necessidades, color: '#2563EB' },
        { name: 'Desejos',      value: byBucket.desejos,      color: '#D97706' },
    ].filter(d => d.value > 0);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">Despesas</h2>
                        <MonthSelector currentMonth={currentMonth} routeName="expenses.index" className="mt-0.5" />
                    </div>
                    <button onClick={openNew} className="btn-primary text-[13px] inline-flex items-center gap-1.5">
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        Nova Despesa
                    </button>
                </div>
            }
        >
            <Head title="Despesas" />

            <motion.div
                className="max-w-[1100px] mx-auto px-5 sm:px-6 lg:px-8 py-5 pb-10"
                variants={staggerProps.variants}
                initial={staggerProps.initial}
                animate={staggerProps.animate}
            >

                {/* Summary + chart */}
                <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    {[
                        { lbl: 'Total Gasto',   val: monthTotal,            clr: 'text-red-500',   prefix: '- ' },
                        { lbl: 'Necessidades',  val: byBucket.necessidades, clr: 'text-blue-600',  prefix: '- ' },
                        { lbl: 'Desejos',       val: byBucket.desejos,      clr: 'text-amber-600', prefix: '- ' },
                    ].map(d => (
                        <div key={d.lbl} className="bg-white rounded-xl border border-black/7 shadow-sm p-4">
                            <p className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{d.lbl}</p>
                            <p className={`font-mono text-lg font-bold ${d.clr}`}>{d.prefix}{fmtN(d.val)}</p>
                        </div>
                    ))}
                </motion.div>

                {/* Donut breakdown */}
                {pieData.length > 0 && (
                    <motion.div variants={staggerItem} className="bg-white rounded-xl border border-black/7 shadow-sm p-5 mb-4">
                        <p className="text-[13px] font-semibold text-gray-900 mb-4">Distribuição por Categoria</p>
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <ResponsiveContainer width={160} height={160}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={64} paddingAngle={3} dataKey="value" stroke="none">
                                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip content={<ChartTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-3">
                                {pieData.map(d => {
                                    const pct = monthTotal > 0 ? Math.round((d.value / monthTotal) * 100) : 0;
                                    return (
                                        <div key={d.name}>
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                                                    <span className="text-[12.5px] text-gray-700">{d.name}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-mono text-[12px] font-semibold text-red-500">- {fmtN(d.value)}</span>
                                                    <span className="text-[11px] text-gray-400 min-w-[32px] text-right">{pct}%</span>
                                                </div>
                                            </div>
                                            <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: d.color }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Budget limits */}
                <motion.div variants={staggerItem}>
                    <BudgetLimitsCard budgetLimits={budgetLimits || []} categoryTotals={categoryTotals || {}} />
                </motion.div>

                {/* Spending insights */}
                {insights && (
                    <motion.div variants={staggerItem}>
                        <InsightsCard insights={insights} monthTotal={monthTotal} />
                    </motion.div>
                )}

                {/* Form modal */}
                <Modal show={showForm || !!editingExpense} onClose={() => { setShowForm(false); setEditingExpense(null); }} maxWidth="lg">
                    <ExpenseForm expense={editingExpense} currentMonth={currentMonth} onClose={() => { setShowForm(false); setEditingExpense(null); }} />
                </Modal>

                {/* Search & filter bar — only when there are transactions */}
                {allItems.length > 0 && (
                    <motion.div variants={staggerItem}>
                        <FilterBar
                            search={search} onSearch={setSearch}
                            category={filterCategory} onCategory={setFilterCategory}
                            bucket={filterBucket} onBucket={setFilterBucket}
                            payment={filterPayment} onPayment={setFilterPayment}
                            onClear={clearFilters}
                            hasFilters={!!hasFilters}
                        />
                    </motion.div>
                )}

                {/* Lists */}
                {visibleRecurring.length > 0 && (
                    <motion.div variants={staggerItem}>
                        <ExpenseSection title="Despesas Recorrentes Ativas" items={visibleRecurring} onEdit={handleEdit} onDelete={handleDelete} />
                    </motion.div>
                )}
                {visibleOneTime.length > 0 && (
                    <motion.div variants={staggerItem}>
                        <ExpenseSection
                            title={visibleRecurring.length > 0 ? 'Despesas Avulsas' : null}
                            items={visibleOneTime}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </motion.div>
                )}

                {/* Empty states */}
                {allItems.length === 0 && (
                    <motion.div variants={staggerItem} className="bg-white rounded-xl border border-black/7 shadow-sm px-6 py-14 text-center">
                        <div className="w-12 h-12 rounded-xl bg-black/4 flex items-center justify-center mx-auto mb-4">
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#9CA3AF">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                            </svg>
                        </div>
                        <p className="text-[14px] font-medium text-gray-600 mb-1">Nenhuma despesa neste mês</p>
                        <p className="text-[12.5px] text-gray-400 mb-5">Registre suas despesas para acompanhar os gastos</p>
                        <button onClick={openNew} className="btn-primary text-[13px] inline-flex items-center gap-1.5">
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                            Registrar despesa
                        </button>
                    </motion.div>
                )}
                {allItems.length > 0 && visibleOneTime.length === 0 && visibleRecurring.length === 0 && (
                    <div className="bg-white rounded-xl border border-black/7 shadow-sm px-6 py-10 text-center">
                        <p className="text-[13.5px] font-medium text-gray-500 mb-1">Nenhuma despesa encontrada</p>
                        <p className="text-[12px] text-gray-400">Tente ajustar os filtros</p>
                    </div>
                )}
            </motion.div>

            {/* FAB */}
            <motion.button
                onClick={openNew}
                className="fixed bottom-24 right-5 lg:bottom-8 lg:right-8 w-[52px] h-[52px] lg:w-14 lg:h-14 rounded-full bg-[#00B679] border-none cursor-pointer flex items-center justify-center shadow-lg shadow-[#00B679]/30 z-30 hover:scale-105 active:scale-95 transition-transform"
                whileHover={reduceMotion ? undefined : { scale: 1.05 }}
                whileTap={reduceMotion ? undefined : { scale: 0.93 }}
            >
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#fff">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </motion.button>
        </AuthenticatedLayout>
    );
}
