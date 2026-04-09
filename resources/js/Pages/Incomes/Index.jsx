import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MonthSelector from '@/Components/MonthSelector';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

const fmt = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + ' MT';

const SOURCE_LABELS = { salario:'Salário', freelance:'Freelance', renda_passiva:'Renda Passiva', outro:'Outro' };
const SOURCE_COLORS = { salario:'#0d9488', freelance:'#b8790a', renda_passiva:'#d97706', outro:'#2563eb' };
const FREQ_LABELS   = { semanal:'Semanal', quinzenal:'Quinzenal', mensal:'Mensal', bimestral:'Bimestral', trimestral:'Trimestral', semestral:'Semestral', anual:'Anual', unico:'Único' };

const S = {
    card:  { background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
    mono:  { fontFamily: 'DM Mono, monospace' },
    label: { fontSize: '11px', fontWeight: 600, color: '#6b6458', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: '7px', fontFamily: 'DM Mono, monospace' },
};

const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '10px', background: '#faf8f3', border: '1px solid rgba(0,0,0,0.1)', color: '#1c1812', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', outline: 'none' };
const focusIn  = (e) => { e.target.style.borderColor = 'rgba(184,121,10,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(184,121,10,0.1)'; };
const focusOut = (e) => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none'; };

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
        <div style={{ ...S.card, padding: '24px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1c1812', marginBottom: '20px' }}>
                {income ? 'Editar Renda' : 'Nova Renda'}
            </h3>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                        <label style={S.label}>Fonte</label>
                        <select value={data.source} onChange={(e) => setData('source', e.target.value)} style={{ ...inputStyle, background: '#ffffff' }} onFocus={focusIn} onBlur={focusOut}>
                            {Object.entries(SOURCE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                        {errors.source && <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>{errors.source}</p>}
                    </div>
                    <div>
                        <label style={S.label}>Valor (MT)</label>
                        <input type="number" step="0.01" value={data.amount} onChange={(e) => setData('amount', e.target.value)} style={inputStyle} placeholder="0.00" onFocus={focusIn} onBlur={focusOut} />
                        {errors.amount && <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>{errors.amount}</p>}
                    </div>
                    <div>
                        <label style={S.label}>Frequência</label>
                        <select value={data.frequency} onChange={(e) => setData('frequency', e.target.value)} style={{ ...inputStyle, background: '#ffffff' }} onFocus={focusIn} onBlur={focusOut}>
                            {Object.entries(FREQ_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={S.label}>Data de Recebimento</label>
                        <input type="date" value={data.received_at} onChange={(e) => setData('received_at', e.target.value)} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                        {errors.received_at && <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>{errors.received_at}</p>}
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={S.label}>Descrição</label>
                        <input type="text" value={data.description} onChange={(e) => setData('description', e.target.value)} style={inputStyle} placeholder="Opcional" onFocus={focusIn} onBlur={focusOut} />
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

const thStyle = { padding: '10px 20px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#a39888', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', background: 'rgba(0,0,0,0.02)' };

export default function Index({ incomes, monthTotal, currentMonth }) {
    const [showForm, setShowForm] = useState(false);
    const [editingIncome, setEditingIncome] = useState(null);
    const { delete: destroy } = useForm();

    function handleDelete(id) {
        if (confirm('Remover esta renda?')) destroy(route('incomes.destroy', id));
    }

    return (
        <AuthenticatedLayout
            header={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', fontWeight: 700, color: '#1c1812' }}>Rendas</h2>
                        <MonthSelector currentMonth={currentMonth} routeName="incomes.index" className="mt-1" />
                    </div>
                    <button onClick={() => { setEditingIncome(null); setShowForm(true); }} className="btn-primary" style={{ fontSize: '13px', padding: '8px 18px' }}>
                        + Nova Renda
                    </button>
                </div>
            }
        >
            <Head title="Rendas" />

            <div style={{ padding: '24px 0 40px' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }} className="sm:px-8">

                    {/* Summary card */}
                    <div style={{ ...S.card, padding: '20px 24px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(13,148,136,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#0d9488">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: '#0d9488', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace' }}>Total recebido no mês</div>
                                <div style={{ ...S.mono, fontSize: '1.6rem', fontWeight: 500, color: '#1c1812', lineHeight: 1.2 }}>{fmt(monthTotal)}</div>
                            </div>
                        </div>
                        <span style={{ fontSize: '12px', color: '#0d9488', fontWeight: 600 }}>
                            {incomes.length} entrada{incomes.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {(showForm || editingIncome) && (
                        <IncomeForm income={editingIncome} currentMonth={currentMonth} onClose={() => { setShowForm(false); setEditingIncome(null); }} />
                    )}

                    {incomes.length > 0 ? (
                        <>
                            {/* Mobile */}
                            <div className="sm:hidden" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {incomes.map((income) => (
                                    <div key={income.id} style={{ ...S.card, padding: '14px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: (SOURCE_COLORS[income.source] || '#2563eb') + '18', color: SOURCE_COLORS[income.source] || '#2563eb' }}>
                                                        {SOURCE_LABELS[income.source] || income.source}
                                                    </span>
                                                    <span style={{ fontSize: '11px', color: '#a39888' }}>{FREQ_LABELS[income.frequency]}</span>
                                                </div>
                                                <p style={{ fontSize: '13px', color: '#6b6458', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{income.description || 'Sem descrição'}</p>
                                                <p style={{ fontSize: '11px', color: '#a39888', marginTop: '2px' }}>{new Date(income.received_at).toLocaleDateString('pt-BR')}</p>
                                            </div>
                                            <span style={{ ...S.mono, fontSize: '14px', fontWeight: 700, color: '#1c1812', marginLeft: '12px', flexShrink: 0 }}>{fmt(income.amount)}</span>
                                        </div>
                                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', gap: '16px' }}>
                                            <button onClick={() => { setEditingIncome(income); setShowForm(false); }} style={{ fontSize: '12px', fontWeight: 600, color: '#b8790a', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Editar</button>
                                            <button onClick={() => handleDelete(income.id)} style={{ fontSize: '12px', fontWeight: 600, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Excluir</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop */}
                            <div className="hidden sm:block" style={{ ...S.card, overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            {['Data','Fonte','Descrição','Frequência','Valor','Ações'].map((h, i) => (
                                                <th key={h} style={{ ...thStyle, textAlign: i >= 4 ? 'right' : 'left' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {incomes.map((income) => (
                                            <tr key={income.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', transition: 'background 0.1s' }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.018)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                                <td style={{ padding: '12px 20px', fontSize: '12px', color: '#a39888', ...S.mono }}>{new Date(income.received_at).toLocaleDateString('pt-BR')}</td>
                                                <td style={{ padding: '12px 20px' }}>
                                                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 9px', borderRadius: '999px', background: (SOURCE_COLORS[income.source] || '#2563eb') + '18', color: SOURCE_COLORS[income.source] || '#2563eb' }}>
                                                        {SOURCE_LABELS[income.source] || income.source}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px 20px', fontSize: '13px', color: '#6b6458' }}>{income.description || '—'}</td>
                                                <td style={{ padding: '12px 20px', fontSize: '12px', color: '#6b6458' }}>{FREQ_LABELS[income.frequency]}</td>
                                                <td style={{ padding: '12px 20px', textAlign: 'right', ...S.mono, fontSize: '13px', fontWeight: 600, color: '#1c1812' }}>{fmt(income.amount)}</td>
                                                <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                                                    <button onClick={() => { setEditingIncome(income); setShowForm(false); }} style={{ fontSize: '12px', fontWeight: 600, color: '#b8790a', background: 'none', border: 'none', cursor: 'pointer', marginRight: '14px' }}>Editar</button>
                                                    <button onClick={() => handleDelete(income.id)} style={{ fontSize: '12px', fontWeight: 600, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>Excluir</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div style={{ ...S.card, padding: '60px 24px', textAlign: 'center' }}>
                            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(184,121,10,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <svg width="26" height="26" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#b8790a">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p style={{ fontSize: '14px', color: '#6b6458', marginBottom: '6px' }}>Nenhuma renda registrada neste mês</p>
                            <p style={{ fontSize: '12px', color: '#a39888', marginBottom: '20px' }}>Adicione suas rendas para acompanhar o histórico</p>
                            <button onClick={() => setShowForm(true)} className="btn-primary" style={{ fontSize: '13px' }}>Adicionar renda</button>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
