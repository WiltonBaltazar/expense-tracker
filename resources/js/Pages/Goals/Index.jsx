import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { getStaggerMotionProps, staggerItem } from '@/lib/motion';
import { useMotionPreference } from '@/contexts/MotionPreferenceContext';

const fmt = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + ' MT';
const fmtN = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
const today = () => new Date().toISOString().slice(0, 10);

const GOAL_COLORS = ['#00B679', '#2563EB', '#D97706', '#E11D48', '#0891B2', '#7C3AED'];

const inputCls = 'w-full px-3 py-2 rounded-lg bg-gray-50 border border-black/10 text-gray-900 text-[13px] outline-none focus:border-[#00B679]/50 focus:ring-2 focus:ring-[#00B679]/10 focus:bg-white transition-colors';

function CloseBtn({ onClose }) {
    return (
        <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors p-1 rounded">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    );
}

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
            put(route('goals.update', goal.id), {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });

            return;
        }

        post(route('goals.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    }

    return (
        <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-[16px] font-bold text-gray-900">{goal ? 'Editar Meta' : 'Nova Meta'}</h3>
                <CloseBtn onClose={onClose} />
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nome da Meta</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className={inputCls}
                            placeholder="Ex: Viagem, Reserva de emergência..."
                        />
                        {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Valor Alvo (MT)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={data.target_amount}
                            onChange={(e) => setData('target_amount', e.target.value)}
                            className={inputCls}
                            placeholder="0.00"
                        />
                        {errors.target_amount && <p className="text-[11px] text-red-500 mt-1">{errors.target_amount}</p>}
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Valor Atual (MT)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={data.current_amount}
                            onChange={(e) => setData('current_amount', e.target.value)}
                            className={inputCls}
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Prazo (opcional)</label>
                        <input
                            type="date"
                            value={data.deadline}
                            onChange={(e) => setData('deadline', e.target.value)}
                            className={inputCls}
                        />
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

function SavingsDepositModal({ show, onClose }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        amount: '',
        note: '',
        transferred_at: today(),
    });

    function handleSubmit(e) {
        e.preventDefault();
        post(route('savings.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    }

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[16px] font-bold text-gray-900">Depositar na Poupança</h3>
                    <CloseBtn onClose={onClose} />
                </div>
                <p className="text-[12.5px] text-gray-500 mb-5">Este valor ficará disponível para transferir para metas.</p>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Valor (MT)</label>
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="0.00"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            required
                            className={inputCls}
                            autoFocus
                        />
                        {errors.amount && <p className="text-[11px] text-red-500 mt-1">{errors.amount}</p>}
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Data</label>
                        <input
                            type="date"
                            value={data.transferred_at}
                            onChange={(e) => setData('transferred_at', e.target.value)}
                            required
                            className={inputCls}
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nota (opcional)</label>
                        <input
                            type="text"
                            placeholder="Ex: Bónus, renda extra..."
                            value={data.note}
                            onChange={(e) => setData('note', e.target.value)}
                            className={inputCls}
                        />
                    </div>
                    <div className="pt-2 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="btn-secondary text-[13px] inline-flex items-center gap-1.5">
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            Cancelar
                        </button>
                        <button type="submit" disabled={processing} className="btn-primary text-[13px] inline-flex items-center gap-1.5">
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                            {processing ? 'Salvando...' : 'Depositar'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

function TransferFromSavingsModal({ goal, walletAvailable, onClose }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        amount: '',
        note: '',
        transferred_at: today(),
    });

    const remaining = Math.max(0, Number(goal?.restante ?? 0));
    const maxTransfer = Math.max(0, Math.min(walletAvailable, remaining));

    function fillAll() {
        setData('amount', maxTransfer > 0 ? maxTransfer.toFixed(2) : '');
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!goal) return;

        post(route('goals.transfer.fromSavings', goal.id), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    }

    return (
        <Modal show={!!goal} onClose={onClose} maxWidth="md">
            <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[16px] font-bold text-gray-900">Depositar da Poupança para Meta</h3>
                    <CloseBtn onClose={onClose} />
                </div>

                <div className="text-[12px] text-gray-500 mb-4 space-y-1">
                    <p><span className="font-semibold text-gray-700">Meta:</span> {goal?.name}</p>
                    <p><span className="font-semibold text-gray-700">Saldo disponível:</span> <span className="font-mono">{fmt(walletAvailable)}</span></p>
                    <p><span className="font-semibold text-gray-700">Restante da meta:</span> <span className="font-mono">{fmt(remaining)}</span></p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Valor (MT)</label>
                            <button
                                type="button"
                                onClick={fillAll}
                                className="text-[11px] font-semibold text-[#00B679] hover:underline"
                            >
                                Tudo disponível
                            </button>
                        </div>
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="0.00"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            required
                            className={inputCls}
                            autoFocus
                        />
                        {errors.amount && <p className="text-[11px] text-red-500 mt-1">{errors.amount}</p>}
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Data</label>
                        <input
                            type="date"
                            value={data.transferred_at}
                            onChange={(e) => setData('transferred_at', e.target.value)}
                            required
                            className={inputCls}
                        />
                        {errors.transferred_at && <p className="text-[11px] text-red-500 mt-1">{errors.transferred_at}</p>}
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nota (opcional)</label>
                        <input
                            type="text"
                            placeholder="Ex: Reforço da meta"
                            value={data.note}
                            onChange={(e) => setData('note', e.target.value)}
                            className={inputCls}
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="btn-secondary text-[13px] inline-flex items-center gap-1.5">
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            Cancelar
                        </button>
                        <button type="submit" disabled={processing || maxTransfer <= 0} className="btn-primary text-[13px] inline-flex items-center gap-1.5">
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                            {processing ? 'Transferindo...' : 'Transferir para Meta'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

function TransferToSavingsModal({ goal, onClose }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        amount: '',
        note: '',
        transferred_at: today(),
    });

    const goalBalance = Math.max(0, Number(goal?.current_amount ?? 0));

    function fillAll() {
        setData('amount', goalBalance > 0 ? goalBalance.toFixed(2) : '');
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!goal) return;

        post(route('goals.transfer.toSavings', goal.id), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    }

    return (
        <Modal show={!!goal} onClose={onClose} maxWidth="md">
            <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[16px] font-bold text-gray-900">Retirar da Meta para Poupança</h3>
                    <CloseBtn onClose={onClose} />
                </div>

                <div className="text-[12px] text-gray-500 mb-4 space-y-1">
                    <p><span className="font-semibold text-gray-700">Meta:</span> {goal?.name}</p>
                    <p><span className="font-semibold text-gray-700">Saldo atual da meta:</span> <span className="font-mono">{fmt(goalBalance)}</span></p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Valor (MT)</label>
                            <button
                                type="button"
                                onClick={fillAll}
                                className="text-[11px] font-semibold text-[#00B679] hover:underline"
                            >
                                Tudo da meta
                            </button>
                        </div>
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="0.00"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            required
                            className={inputCls}
                            autoFocus
                        />
                        {errors.amount && <p className="text-[11px] text-red-500 mt-1">{errors.amount}</p>}
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Data</label>
                        <input
                            type="date"
                            value={data.transferred_at}
                            onChange={(e) => setData('transferred_at', e.target.value)}
                            required
                            className={inputCls}
                        />
                        {errors.transferred_at && <p className="text-[11px] text-red-500 mt-1">{errors.transferred_at}</p>}
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nota (opcional)</label>
                        <input
                            type="text"
                            placeholder="Ex: Ajuste de prioridade"
                            value={data.note}
                            onChange={(e) => setData('note', e.target.value)}
                            className={inputCls}
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="btn-secondary text-[13px] inline-flex items-center gap-1.5">
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            Cancelar
                        </button>
                        <button type="submit" disabled={processing || goalBalance <= 0} className="btn-primary text-[13px] inline-flex items-center gap-1.5">
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                            {processing ? 'Transferindo...' : 'Devolver para Poupança'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

function HistoryPanel({ history }) {
    function handleDelete(entry) {
        const ok = confirm('Remover esta movimentação?');
        if (!ok) return;

        if (entry.entry_type === 'savings_deposit') {
            router.delete(route('savings.destroy', entry.id), { preserveScroll: true });
            return;
        }

        router.delete(route('goals.transfer.destroy', entry.id), { preserveScroll: true });
    }

    if (!history?.length) {
        return (
            <div className="bg-white rounded-xl border border-black/7 shadow-sm px-5 py-6 text-center">
                <p className="text-[13px] text-gray-500">Nenhuma movimentação ainda.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-black/7 shadow-sm">
            <div className="px-5 py-3.5 border-b border-black/6">
                <p className="text-[13px] font-semibold text-gray-900">Histórico de Movimentações</p>
            </div>

            <div className="px-5 py-2">
                {history.map((entry) => {
                    const increasesSavings = entry.entry_type === 'savings_deposit' || entry.direction === 'to_savings';

                    return (
                        <div key={`${entry.entry_type}-${entry.id}`} className="flex items-start justify-between gap-3 py-2.5 border-b border-black/5 last:border-0">
                            <div className="min-w-0">
                                <p className="text-[13px] font-medium text-gray-800 truncate">{entry.title}</p>
                                {entry.goal_name && <p className="text-[11px] text-gray-500 mt-0.5">Meta: {entry.goal_name}</p>}
                                {entry.note && <p className="text-[11px] text-gray-400 mt-0.5">{entry.note}</p>}
                                <p className="text-[11px] text-gray-400 mt-1">{new Date(entry.transferred_at).toLocaleDateString('pt-BR')}</p>
                            </div>

                            <div className="flex items-center gap-3 flex-shrink-0">
                                <span className={`font-mono text-[12px] font-semibold ${increasesSavings ? 'text-[#00B679]' : 'text-amber-600'}`}>
                                    {increasesSavings ? '+ ' : '- '}{fmtN(entry.amount)}
                                </span>
                                <button onClick={() => handleDelete(entry)} className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded">
                                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function Index({ goals, savingsWallet, history }) {
    const [showForm, setShowForm] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [showSavingsModal, setShowSavingsModal] = useState(false);
    const [fromSavingsGoal, setFromSavingsGoal] = useState(null);
    const [toSavingsGoal, setToSavingsGoal] = useState(null);

    const { delete: destroy } = useForm();
    const page = usePage();
    const { reduceMotion } = useMotionPreference();
    const staggerProps = getStaggerMotionProps(reduceMotion);
    const pageErrors = page.props?.errors || {};

    const wallet = useMemo(() => ({
        available: Number(savingsWallet?.available_balance ?? 0),
        deposited: Number(savingsWallet?.total_deposited ?? 0),
        inGoals: Number(savingsWallet?.total_in_goals ?? 0),
    }), [savingsWallet]);

    function handleDeleteGoal(id) {
        if (!confirm('Remover esta meta?')) return;
        destroy(route('goals.destroy', id));
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">Metas</h2>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowSavingsModal(true)} className="btn-secondary text-[13px] inline-flex items-center gap-1.5">
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                            <span className="hidden sm:inline">Poupança</span>
                        </button>
                        <button onClick={() => { setEditingGoal(null); setShowForm(true); }} className="btn-primary text-[13px] inline-flex items-center gap-1.5">
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                            Nova Meta
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Metas" />

            <Modal show={showForm || !!editingGoal} onClose={() => { setShowForm(false); setEditingGoal(null); }} maxWidth="md">
                <GoalForm goal={editingGoal} onClose={() => { setShowForm(false); setEditingGoal(null); }} />
            </Modal>
            <SavingsDepositModal show={showSavingsModal} onClose={() => setShowSavingsModal(false)} />
            <TransferFromSavingsModal goal={fromSavingsGoal} walletAvailable={wallet.available} onClose={() => setFromSavingsGoal(null)} />
            <TransferToSavingsModal goal={toSavingsGoal} onClose={() => setToSavingsGoal(null)} />

            <motion.div
                className="max-w-[1100px] mx-auto px-5 sm:px-6 lg:px-8 py-5 pb-10 space-y-4"
                variants={staggerProps.variants}
                initial={staggerProps.initial}
                animate={staggerProps.animate}
            >

                {(pageErrors.savings || pageErrors.history) && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                        <p className="text-[12px] text-red-600 font-medium">{pageErrors.savings || pageErrors.history}</p>
                    </div>
                )}

                <motion.div variants={staggerItem} className="bg-[#00B679]/5 border border-[#00B679]/15 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-[10.5px] font-bold text-[#00916A] uppercase tracking-widest">Saldo da Poupança Disponível</p>
                            <p className="font-mono text-[1.4rem] font-bold text-gray-900 mt-1">{fmtN(wallet.available)} MT</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-gray-500">
                                <span>Depositado: <span className="font-mono text-gray-700">{fmtN(wallet.deposited)}</span></span>
                                <span>Em metas: <span className="font-mono text-gray-700">{fmtN(wallet.inGoals)}</span></span>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowSavingsModal(true)}
                            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#00B679] bg-[#00B679]/10 border border-[#00B679]/20 rounded-lg px-3 py-2 cursor-pointer hover:bg-[#00B679]/20 transition-colors whitespace-nowrap flex-shrink-0"
                        >
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                            Depositar
                        </button>
                    </div>
                </motion.div>

                {goals.length > 0 ? (
                    <motion.div variants={staggerItem} className="space-y-3">
                        {goals.map((goal, gi) => {
                            const color = GOAL_COLORS[gi % GOAL_COLORS.length];
                            const currentAmount = Number(goal.current_amount);
                            const targetAmount = Number(goal.target_amount);
                            const canWithdraw = currentAmount > 0;
                            const canDeposit = !goal.completed && wallet.available > 0;

                            return (
                                <motion.div
                                    key={goal.id}
                                    variants={staggerItem}
                                    whileHover={reduceMotion ? undefined : { y: -2 }}
                                    transition={{ duration: reduceMotion ? 0 : 0.2 }}
                                    className={`bg-white rounded-xl border shadow-sm p-5 ${goal.completed ? 'border-[#00B679]/20 bg-[#00B679]/2' : 'border-black/7'}`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                                                <h3 className="text-[15px] font-semibold text-gray-900">{goal.name}</h3>
                                                {goal.completed && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00B679]/10 text-[#00916A]">✓ Concluída</span>
                                                )}
                                            </div>
                                            {goal.deadline && <p className="text-[11px] text-gray-400 ml-4">Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</p>}
                                        </div>

                                        <div className="flex flex-wrap justify-end gap-1 flex-shrink-0">
                                            <button
                                                onClick={() => setFromSavingsGoal(goal)}
                                                disabled={!canDeposit}
                                                title="Depositar da poupança"
                                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11.5px] font-semibold transition-colors ${canDeposit ? 'text-[#00B679] hover:bg-[#00B679]/8 cursor-pointer' : 'text-gray-300 cursor-not-allowed'}`}
                                            >
                                                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                                                <span className="hidden sm:inline">Depositar</span>
                                            </button>
                                            <button
                                                onClick={() => setToSavingsGoal(goal)}
                                                disabled={!canWithdraw}
                                                title="Retirar para poupança"
                                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11.5px] font-semibold transition-colors ${canWithdraw ? 'text-[#2563EB] hover:bg-[#2563EB]/8 cursor-pointer' : 'text-gray-300 cursor-not-allowed'}`}
                                            >
                                                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 7.5m0 0L7.5 12m4.5-4.5V21" /></svg>
                                                <span className="hidden sm:inline">Retirar</span>
                                            </button>
                                            <button onClick={() => { setEditingGoal(goal); setShowForm(false); }} title="Editar meta" className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11.5px] font-semibold text-[#00B679] hover:bg-[#00B679]/8 transition-colors cursor-pointer">
                                                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                                                <span className="hidden sm:inline">Editar</span>
                                            </button>
                                            <button onClick={() => handleDeleteGoal(goal.id)} title="Excluir meta" className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11.5px] font-semibold text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
                                                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                                <span className="hidden sm:inline">Excluir</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="flex-1 h-2 bg-black/6 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${goal.progresso}%`, background: goal.completed ? '#00B679' : color }} />
                                        </div>
                                        <span className="font-mono text-[13px] font-bold text-gray-800 min-w-[38px] text-right">{goal.progresso}%</span>
                                    </div>

                                    <div className="flex flex-wrap justify-between gap-3">
                                        <span className="font-mono text-[12.5px] text-gray-600">
                                            {fmtN(currentAmount)} <span className="text-gray-400">de</span> {fmtN(targetAmount)}
                                        </span>
                                        {!goal.completed && (
                                            <span className="text-[11px] text-gray-500">
                                                Restante: <span className="font-mono">{fmtN(goal.restante)}</span>
                                            </span>
                                        )}
                                    </div>

                                </motion.div>
                            );
                        })}
                    </motion.div>
                ) : (
                    <motion.div variants={staggerItem} className="bg-white rounded-xl border border-black/7 shadow-sm px-6 py-14 text-center">
                        <div className="w-12 h-12 rounded-xl bg-[#00B679]/8 flex items-center justify-center mx-auto mb-4">
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#00B679">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                            </svg>
                        </div>
                        <p className="text-[14px] font-medium text-gray-600 mb-5">Nenhuma meta cadastrada ainda</p>
                        <button onClick={() => setShowForm(true)} className="btn-primary text-[13px]">Criar primeira meta</button>
                    </motion.div>
                )}

                <motion.div variants={staggerItem}>
                    <HistoryPanel history={history} />
                </motion.div>
            </motion.div>

            <motion.button
                onClick={() => { setEditingGoal(null); setShowForm(true); }}
                title="Nova Meta"
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
