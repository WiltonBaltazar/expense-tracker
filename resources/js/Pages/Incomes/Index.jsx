import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import MonthSelector from '@/Components/MonthSelector';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

const fmt  = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + ' MT';
const fmtN = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

const SOURCE_LABELS = { salario:'Salário', freelance:'Freelance', renda_passiva:'Renda Passiva', outro:'Outro' };
const SOURCE_COLORS = { salario:'#00B679', freelance:'#D97706', renda_passiva:'#2563EB', outro:'#6B7280' };
const FREQ_LABELS   = { semanal:'Semanal', quinzenal:'Quinzenal', mensal:'Mensal', bimestral:'Bimestral', trimestral:'Trimestral', semestral:'Semestral', anual:'Anual', unico:'Único' };

const inputCls = 'w-full px-3 py-2 rounded-lg bg-gray-50 border border-black/10 text-gray-900 text-[13px] outline-none focus:border-[#00B679]/50 focus:ring-2 focus:ring-[#00B679]/10 focus:bg-white transition-colors';

// ── Form ──────────────────────────────────────────────────────────────────────
function IncomeForm({ onClose, income = null, currentMonth }) {
    const defaultDate = income?.received_at?.split('T')[0] || `${currentMonth}-01`;
    const { data, setData, post, put, processing, errors, reset } = useForm({
        source: income?.source || 'salario',
        amount: income?.amount || '',
        frequency: income?.frequency || 'mensal',
        description: income?.description || '',
        received_at: defaultDate,
    });

    function handleSubmit(e) {
        e.preventDefault();
        if (income) {
            put(route('incomes.update', income.id), { onSuccess: () => { reset(); onClose(); } });
        } else {
            post(route('incomes.store'), { onSuccess: () => { reset(); onClose(); } });
        }
    }

    return (
        <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-[16px] font-bold text-gray-900">{income ? 'Editar Renda' : 'Nova Renda'}</h3>
                <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors p-1 rounded">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Fonte</label>
                        <select value={data.source} onChange={e => setData('source', e.target.value)} className={inputCls}>
                            {Object.entries(SOURCE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
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
                            {Object.entries(FREQ_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Data de Recebimento</label>
                        <input type="date" value={data.received_at} onChange={e => setData('received_at', e.target.value)} className={inputCls} />
                        {errors.received_at && <p className="text-[11px] text-red-500 mt-1">{errors.received_at}</p>}
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Descrição</label>
                        <input type="text" value={data.description} onChange={e => setData('description', e.target.value)} className={inputCls} placeholder="Opcional" />
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

// ── Income row (transaction style) ───────────────────────────────────────────
function IncomeRow({ income, onEdit, onDelete }) {
    const [hovered, setHovered] = useState(false);
    const color  = SOURCE_COLORS[income.source] || '#6B7280';
    const initial = (SOURCE_LABELS[income.source] || income.source).charAt(0).toUpperCase();

    return (
        <div
            className={`flex items-center gap-3 px-4 py-2.5 border-b border-black/5 last:border-0 transition-colors ${hovered ? 'bg-gray-50' : ''}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Icon */}
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[13px] font-bold"
                style={{ background: color + '18', color }}>
                {initial}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-medium text-gray-800 truncate">{income.description || SOURCE_LABELS[income.source] || income.source}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10.5px] font-semibold px-1.5 py-0.5 rounded-full"
                        style={{ background: color + '12', color }}>
                        {SOURCE_LABELS[income.source] || income.source}
                    </span>
                    <span className="text-[11px] text-gray-400">{FREQ_LABELS[income.frequency]}</span>
                </div>
            </div>

            {/* Date */}
            <span className="hidden sm:block text-[11.5px] text-gray-400 flex-shrink-0 min-w-[84px] text-right">
                {new Date(income.received_at).toLocaleDateString('pt-BR')}
            </span>

            {/* Amount */}
            <span className="font-mono text-[13.5px] font-semibold text-[#00B679] flex-shrink-0 min-w-[90px] text-right">
                + {fmtN(income.amount)}
            </span>

            {/* Actions */}
            <div className={`hidden sm:flex gap-1 flex-shrink-0 transition-opacity ${hovered ? 'opacity-100' : 'opacity-0'}`}>
                <button onClick={() => onEdit(income)} className="p-1.5 rounded text-gray-300 hover:text-[#00B679] transition-colors">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                </button>
                <button onClick={() => onDelete(income.id)} className="p-1.5 rounded text-gray-300 hover:text-red-500 transition-colors">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                </button>
            </div>

            {/* Mobile */}
            <div className="flex sm:hidden gap-2 flex-shrink-0 text-[11px] font-semibold">
                <button onClick={() => onEdit(income)} className="text-[#00B679]">Editar</button>
                <span className="text-gray-300">·</span>
                <button onClick={() => onDelete(income.id)} className="text-red-500">Excluir</button>
            </div>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Index({ incomes, monthTotal, currentMonth }) {
    const [showForm, setShowForm] = useState(false);
    const [editingIncome, setEditingIncome] = useState(null);
    const { delete: destroy } = useForm();

    function handleDelete(id) {
        if (confirm('Remover esta renda?')) destroy(route('incomes.destroy', id));
    }
    function handleEdit(income) { setEditingIncome(income); setShowForm(false); }
    function openNew() { setEditingIncome(null); setShowForm(true); }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">Rendas</h2>
                        <MonthSelector currentMonth={currentMonth} routeName="incomes.index" className="mt-0.5" />
                    </div>
                    <button onClick={openNew} className="btn-primary text-[13px]">+ Nova Renda</button>
                </div>
            }
        >
            <Head title="Rendas" />

            <div className="max-w-[1100px] mx-auto px-5 sm:px-6 lg:px-8 py-5 pb-10">

                {/* Summary card */}
                <div className="bg-white rounded-xl border border-black/7 shadow-sm p-5 mb-4 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-[#00B679]/10 flex items-center justify-center flex-shrink-0">
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#00B679">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10.5px] font-bold text-[#00B679] uppercase tracking-widest">Total recebido no mês</p>
                            <p className="font-mono text-2xl font-bold text-gray-900 mt-0.5">+ {fmtN(monthTotal)}</p>
                        </div>
                    </div>
                    <span className="text-[12.5px] font-semibold text-[#00B679] bg-[#00B679]/8 px-3 py-1 rounded-full">
                        {incomes.length} entrada{incomes.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Form modal */}
                <Modal show={showForm || !!editingIncome} onClose={() => { setShowForm(false); setEditingIncome(null); }} maxWidth="lg">
                    <IncomeForm income={editingIncome} currentMonth={currentMonth} onClose={() => { setShowForm(false); setEditingIncome(null); }} />
                </Modal>

                {/* List */}
                {incomes.length > 0 ? (
                    <div className="bg-white rounded-xl border border-black/7 shadow-sm overflow-hidden">
                        {/* Desktop header */}
                        <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gray-50 border-b border-black/5">
                            <div className="w-9 flex-shrink-0" />
                            <div className="flex-1 text-[10.5px] font-bold text-gray-400 uppercase tracking-wider">Descrição / Fonte</div>
                            <div className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider min-w-[84px] text-right">Data</div>
                            <div className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider min-w-[90px] text-right">Valor</div>
                            <div className="w-14 flex-shrink-0" />
                        </div>
                        {incomes.map(income => (
                            <IncomeRow key={income.id} income={income} onEdit={handleEdit} onDelete={handleDelete} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-black/7 shadow-sm px-6 py-14 text-center">
                        <div className="w-12 h-12 rounded-xl bg-[#00B679]/8 flex items-center justify-center mx-auto mb-4">
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#00B679">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-[14px] font-medium text-gray-600 mb-1">Nenhuma renda registrada neste mês</p>
                        <p className="text-[12.5px] text-gray-400 mb-5">Adicione suas rendas para acompanhar o histórico</p>
                        <button onClick={openNew} className="btn-primary text-[13px]">Adicionar renda</button>
                    </div>
                )}
            </div>

            {/* FAB */}
            <button onClick={openNew}
                className="fixed bottom-24 right-5 lg:bottom-8 lg:right-8 w-[52px] h-[52px] lg:w-14 lg:h-14 rounded-full bg-[#00B679] border-none cursor-pointer flex items-center justify-center shadow-lg shadow-[#00B679]/30 z-30 hover:scale-105 active:scale-95 transition-transform">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#fff">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </button>
        </AuthenticatedLayout>
    );
}
