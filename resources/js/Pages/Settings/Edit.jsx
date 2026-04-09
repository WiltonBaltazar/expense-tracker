import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

const BUCKETS = [
    { key: 'needs_pct',  label: 'Necessidades', desc: 'Moradia, alimentação, transporte, saúde', color: '#2563eb' },
    { key: 'wants_pct',  label: 'Desejos',       desc: 'Lazer, restaurantes, assinaturas',       color: '#d97706' },
    { key: 'savings_pct',label: 'Economia',       desc: 'Metas e investimentos',                  color: '#0d9488' },
];

const S = {
    card: { background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
    mono: { fontFamily: 'DM Mono, monospace' },
};

export default function Edit({ setting }) {
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
            header={<h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', fontWeight: 700, color: '#1c1812' }}>Ajustes</h2>}
        >
            <Head title="Ajustes" />

            <div style={{ padding: '32px 0 60px' }}>
                <div style={{ maxWidth: '560px', margin: '0 auto', padding: '0 24px' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ ...S.card, padding: '28px' }}>
                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1c1812', marginBottom: '5px' }}>Regra de Alocação</h3>
                                <p style={{ fontSize: '12px', color: '#6b6458' }}>Defina como sua renda será dividida. A soma deve ser 100%.</p>
                            </div>

                            {/* Visual preview bar */}
                            <div style={{ display: 'flex', borderRadius: '999px', overflow: 'hidden', height: '12px', marginBottom: '32px', background: 'rgba(0,0,0,0.07)' }}>
                                {BUCKETS.map((b) => (
                                    <div key={b.key} style={{ width: `${data[b.key]}%`, background: b.color, transition: 'width 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {data[b.key] >= 12 && (
                                            <span style={{ fontSize: '9px', fontWeight: 700, color: '#ffffff', fontFamily: 'DM Mono, monospace' }}>{data[b.key]}%</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                                {BUCKETS.map((b) => (
                                    <div key={b.key}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: b.color }} />
                                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1c1812' }}>{b.label}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <input
                                                    type="number" min="0" max="100"
                                                    value={data[b.key]}
                                                    onChange={(e) => setData(b.key, e.target.value)}
                                                    style={{ width: '52px', textAlign: 'right', padding: '5px 8px', borderRadius: '8px', background: '#faf8f3', border: '1px solid rgba(0,0,0,0.1)', color: '#1c1812', fontSize: '14px', fontWeight: 600, fontFamily: 'DM Mono, monospace', outline: 'none' }}
                                                    onFocus={(e) => { e.target.style.borderColor = b.color + 'aa'; e.target.style.boxShadow = `0 0 0 3px ${b.color}18`; }}
                                                    onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none'; }}
                                                />
                                                <span style={{ fontSize: '13px', color: '#a39888', fontFamily: 'DM Mono, monospace' }}>%</span>
                                            </div>
                                        </div>

                                        {/* Range slider */}
                                        <div style={{ position: 'relative', height: '20px', display: 'flex', alignItems: 'center' }}>
                                            <div style={{ position: 'absolute', left: 0, right: 0, height: '4px', borderRadius: '999px', background: 'rgba(0,0,0,0.07)' }} />
                                            <div style={{ position: 'absolute', left: 0, height: '4px', borderRadius: '999px', background: b.color, width: `${data[b.key]}%`, transition: 'width 0.15s', pointerEvents: 'none' }} />
                                            <input
                                                type="range" min="0" max="100" step="1"
                                                value={data[b.key]}
                                                onChange={(e) => setData(b.key, e.target.value)}
                                                style={{ position: 'absolute', left: 0, right: 0, width: '100%', height: '20px', opacity: 0, cursor: 'pointer', zIndex: 1 }}
                                            />
                                            <div style={{ position: 'absolute', left: `${data[b.key]}%`, transform: 'translateX(-50%)', width: '16px', height: '16px', borderRadius: '50%', background: b.color, boxShadow: `0 2px 8px ${b.color}50`, pointerEvents: 'none', transition: 'left 0.15s' }} />
                                        </div>

                                        <p style={{ fontSize: '11px', color: '#a39888', marginTop: '6px' }}>{b.desc}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Total indicator */}
                            <div style={{
                                marginTop: '28px', padding: '12px 16px', borderRadius: '12px',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                background: isValid ? 'rgba(13,148,136,0.06)' : 'rgba(220,38,38,0.06)',
                                border: `1px solid ${isValid ? 'rgba(13,148,136,0.2)' : 'rgba(220,38,38,0.2)'}`,
                            }}>
                                <span style={{ fontSize: '13px', fontWeight: 500, color: isValid ? '#0d9488' : '#dc2626' }}>Total</span>
                                <span style={{ ...S.mono, fontSize: '1.25rem', fontWeight: 700, color: isValid ? '#0d9488' : '#dc2626' }}>
                                    {total.toFixed(0)}%
                                </span>
                            </div>

                            {!isValid && (
                                <p style={{ marginTop: '8px', fontSize: '12px', color: '#dc2626', textAlign: 'center' }}>
                                    A soma deve ser exatamente 100%
                                </p>
                            )}

                            {errors.needs_pct && <p style={{ marginTop: '8px', fontSize: '12px', color: '#dc2626' }}>{errors.needs_pct}</p>}

                            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="submit" disabled={processing || !isValid} className="btn-primary" style={{ fontSize: '14px', padding: '11px 28px' }}>
                                    {processing ? 'Salvando...' : 'Salvar Configurações'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
