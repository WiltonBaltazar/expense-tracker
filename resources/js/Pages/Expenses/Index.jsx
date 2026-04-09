import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MonthSelector from '@/Components/MonthSelector';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

const fmt = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + ' MT';

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

const S = {
    card:    { background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
    mono:    { fontFamily: 'DM Mono, monospace' },
    label:   { fontSize: '11px', fontWeight: 600, color: '#6b6458', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: '7px', fontFamily: 'DM Mono, monospace' },
};

const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '10px', background: '#faf8f3', border: '1px solid rgba(0,0,0,0.1)', color: '#1c1812', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', outline: 'none' };
const focusIn  = (e) => { e.target.style.borderColor = 'rgba(184,121,10,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(184,121,10,0.1)'; };
const focusOut = (e) => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none'; };

function ExpenseForm({ onClose, expense = null, currentMonth }) {
    const defaultDate = expense?.spent_at?.split('T')[0] || `${currentMonth}-01`;
    const { data, setData, post, put, processing, errors, reset } = useForm({
        description: expense?.description || '',
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
        <div style={{ ...S.card, padding: '24px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1c1812', marginBottom: '20px' }}>
                {expense ? 'Editar Despesa' : 'Nova Despesa'}
            </h3>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={S.label}>Descrição</label>
                        <input type="text" value={data.description} onChange={(e) => setData('description', e.target.value)} style={inputStyle} placeholder="Ex: Supermercado, Netflix..." onFocus={focusIn} onBlur={focusOut} />
                        {errors.description && <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>{errors.description}</p>}
                    </div>
                    <div>
                        <label style={S.label}>Valor (MT)</label>
                        <input type="number" step="0.01" value={data.amount} onChange={(e) => setData('amount', e.target.value)} style={inputStyle} placeholder="0.00" onFocus={focusIn} onBlur={focusOut} />
                        {errors.amount && <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>{errors.amount}</p>}
                    </div>
                    <div>
                        <label style={S.label}>Categoria</label>
                        <select value={data.category} onChange={(e) => setData('category', e.target.value)} style={{ ...inputStyle, background: '#ffffff' }} onFocus={focusIn} onBlur={focusOut}>
                            {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={S.label}>Bucket</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            {['necessidades', 'desejos'].map((b) => {
                                const active = data.bucket === b;
                                const color = b === 'necessidades' ? '#2563eb' : '#d97706';
                                return (
                                    <button key={b} type="button" onClick={() => setData('bucket', b)} style={{ padding: '9px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, border: `2px solid ${active ? color : 'rgba(0,0,0,0.1)'}`, background: active ? color + '12' : 'transparent', color: active ? color : '#6b6458', cursor: 'pointer', transition: 'all 0.15s' }}>
                                        {b === 'necessidades' ? 'Necessidades' : 'Desejos'}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <label style={S.label}>Data</label>
                        <input type="date" value={data.spent_at} onChange={(e) => setData('spent_at', e.target.value)} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                        {errors.spent_at && <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>{errors.spent_at}</p>}
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.07)' }}>
                            <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
                                <input type="checkbox" checked={data.is_recurring} onChange={(e) => setData('is_recurring', e.target.checked)} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
                                <div style={{ width: '36px', height: '20px', borderRadius: '999px', background: data.is_recurring ? '#b8790a' : 'rgba(0,0,0,0.15)', transition: 'background 0.2s', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: '3px', left: data.is_recurring ? '19px' : '3px', width: '14px', height: '14px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                                </div>
                            </label>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '13px', fontWeight: 500, color: '#1c1812' }}>Despesa recorrente</p>
                                <p style={{ fontSize: '11px', color: '#a39888' }}>Contabilizada automaticamente todo mês</p>
                            </div>
                            {data.is_recurring && (
                                <select value={data.frequency} onChange={(e) => setData('frequency', e.target.value)} style={{ ...inputStyle, width: 'auto', background: '#ffffff', fontSize: '12px' }}>
                                    {Object.entries(FREQ_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                </select>
                            )}
                        </div>
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

function ExpenseRow({ expense, onEdit, onDelete, isMobile }) {
    if (isMobile) {
        return (
            <div style={{ ...S.card, padding: '14px 16px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: '#1c1812', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{expense.description}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px', alignItems: 'center' }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '999px', background: expense.bucket === 'necessidades' ? 'rgba(37,99,235,0.1)' : 'rgba(217,119,6,0.1)', color: expense.bucket === 'necessidades' ? '#1d4ed8' : '#b45309' }}>
                                {expense.bucket === 'necessidades' ? 'Necessidades' : 'Desejos'}
                            </span>
                            <span style={{ fontSize: '11px', color: '#a39888' }}>{expense.category}</span>
                            {expense.is_recurring && <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '999px', background: 'rgba(184,121,10,0.1)', color: '#92600c' }}>{FREQ_LABELS[expense.frequency]}</span>}
                        </div>
                        <p style={{ fontSize: '11px', color: '#a39888', marginTop: '3px' }}>
                            {expense.is_recurring ? `Desde ${new Date(expense.spent_at).toLocaleDateString('pt-BR')}` : new Date(expense.spent_at).toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                    <span style={{ ...S.mono, fontSize: '14px', fontWeight: 700, color: '#1c1812', marginLeft: '12px', flexShrink: 0 }}>{fmt(expense.amount)}</span>
                </div>
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', gap: '16px' }}>
                    <button onClick={() => onEdit(expense)} style={{ fontSize: '12px', fontWeight: 600, color: '#b8790a', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Editar</button>
                    <button onClick={() => onDelete(expense.id)} style={{ fontSize: '12px', fontWeight: 600, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Excluir</button>
                </div>
            </div>
        );
    }

    return (
        <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', transition: 'background 0.1s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.018)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <td style={{ padding: '12px 20px', fontSize: '12px', color: '#a39888', ...S.mono }}>
                {expense.is_recurring ? `Desde ${new Date(expense.spent_at).toLocaleDateString('pt-BR')}` : new Date(expense.spent_at).toLocaleDateString('pt-BR')}
            </td>
            <td style={{ padding: '12px 20px', fontSize: '13px', color: '#1c1812' }}>{expense.description}</td>
            <td style={{ padding: '12px 20px', fontSize: '12px', color: '#6b6458' }}>{expense.category}</td>
            <td style={{ padding: '12px 20px' }}>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: expense.bucket === 'necessidades' ? 'rgba(37,99,235,0.1)' : 'rgba(217,119,6,0.1)', color: expense.bucket === 'necessidades' ? '#1d4ed8' : '#b45309' }}>
                        {expense.bucket === 'necessidades' ? 'Necessidades' : 'Desejos'}
                    </span>
                    {expense.is_recurring && (
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: 'rgba(184,121,10,0.1)', color: '#92600c' }}>{FREQ_LABELS[expense.frequency]}</span>
                    )}
                </div>
            </td>
            <td style={{ padding: '12px 20px', textAlign: 'right', ...S.mono, fontSize: '13px', fontWeight: 600, color: '#1c1812' }}>{fmt(expense.amount)}</td>
            <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                <button onClick={() => onEdit(expense)} style={{ fontSize: '12px', fontWeight: 600, color: '#b8790a', background: 'none', border: 'none', cursor: 'pointer', marginRight: '14px' }}>Editar</button>
                <button onClick={() => onDelete(expense.id)} style={{ fontSize: '12px', fontWeight: 600, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>Excluir</button>
            </td>
        </tr>
    );
}

const thStyle = { padding: '10px 20px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#a39888', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', background: 'rgba(0,0,0,0.02)' };

function ExpenseTable({ title, items, onEdit, onDelete }) {
    if (items.length === 0) return null;
    return (
        <div style={{ marginBottom: '16px' }}>
            {title && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#a39888">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#a39888', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace' }}>{title}</span>
                </div>
            )}
            <div className="sm:hidden">
                {items.map((e) => <ExpenseRow key={e.id} expense={e} onEdit={onEdit} onDelete={onDelete} isMobile />)}
            </div>
            <div className="hidden sm:block" style={{ ...S.card, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            {['Data','Descrição','Categoria','Tipo','Valor','Ações'].map((h, i) => (
                                <th key={h} style={{ ...thStyle, textAlign: i >= 4 ? 'right' : 'left' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((e) => <ExpenseRow key={e.id} expense={e} onEdit={onEdit} onDelete={onDelete} />)}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function Index({ expenses, recurringExpenses, monthTotal, byBucket, currentMonth }) {
    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const { delete: destroy } = useForm();

    function handleDelete(id) {
        if (confirm('Remover esta despesa?')) destroy(route('expenses.destroy', id));
    }
    function handleEdit(expense) { setEditingExpense(expense); setShowForm(false); }

    const oneTimeItems = expenses.data || expenses;
    const allItems = [...oneTimeItems, ...(recurringExpenses || [])];

    return (
        <AuthenticatedLayout
            header={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', fontWeight: 700, color: '#1c1812' }}>Despesas</h2>
                        <MonthSelector currentMonth={currentMonth} routeName="expenses.index" className="mt-1" />
                    </div>
                    <button onClick={() => { setEditingExpense(null); setShowForm(true); }} className="btn-primary" style={{ fontSize: '13px', padding: '8px 18px' }}>
                        + Nova Despesa
                    </button>
                </div>
            }
        >
            <Head title="Despesas" />

            <div style={{ padding: '24px 0 40px' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }} className="sm:px-8">

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '16px' }}>
                        {[
                            { lbl: 'Total',         val: monthTotal,            clr: '#1c1812' },
                            { lbl: 'Necessidades',  val: byBucket.necessidades, clr: '#1d4ed8' },
                            { lbl: 'Desejos',       val: byBucket.desejos,      clr: '#b45309' },
                        ].map((d) => (
                            <div key={d.lbl} style={{ ...S.card, padding: '14px 16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a39888', fontFamily: 'DM Mono, monospace', marginBottom: '6px' }}>{d.lbl}</div>
                                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '1.05rem', fontWeight: 600, color: d.clr }}>{fmt(d.val)}</div>
                            </div>
                        ))}
                    </div>

                    {(showForm || editingExpense) && (
                        <ExpenseForm expense={editingExpense} currentMonth={currentMonth} onClose={() => { setShowForm(false); setEditingExpense(null); }} />
                    )}

                    {recurringExpenses?.length > 0 && (
                        <ExpenseTable title="Despesas Recorrentes Ativas" items={recurringExpenses} onEdit={handleEdit} onDelete={handleDelete} />
                    )}

                    {oneTimeItems.length > 0 && (
                        <ExpenseTable
                            title={recurringExpenses?.length > 0 ? 'Despesas Avulsas' : null}
                            items={oneTimeItems}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    )}

                    {allItems.length === 0 && (
                        <div style={{ ...S.card, padding: '60px 24px', textAlign: 'center' }}>
                            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <svg width="26" height="26" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#a39888">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                                </svg>
                            </div>
                            <p style={{ fontSize: '14px', color: '#6b6458', marginBottom: '6px' }}>Nenhuma despesa neste mês</p>
                            <p style={{ fontSize: '12px', color: '#a39888', marginBottom: '20px' }}>Registre suas despesas para acompanhar os gastos</p>
                            <button onClick={() => setShowForm(true)} className="btn-primary" style={{ fontSize: '13px' }}>Registrar despesa</button>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
