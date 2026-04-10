import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

const BUCKETS = [
    { key: 'needs_pct',   label: 'Necessidades', desc: 'Moradia, alimentação, transporte, saúde', color: '#2563EB' },
    { key: 'wants_pct',   label: 'Desejos',       desc: 'Lazer, restaurantes, assinaturas',       color: '#D97706' },
    { key: 'savings_pct', label: 'Economia',       desc: 'Metas e investimentos',                  color: '#00B679' },
];

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
            header={<h2 className="text-[17px] font-bold text-gray-900 tracking-tight">Ajustes</h2>}
        >
            <Head title="Ajustes" />

            <div className="max-w-[580px] mx-auto px-5 sm:px-6 lg:px-8 py-6 pb-12">
                <form onSubmit={handleSubmit}>
                    <div className="bg-white rounded-xl border border-black/7 shadow-sm p-6 sm:p-7">

                        <div className="mb-6">
                            <h3 className="text-[15px] font-bold text-gray-900 mb-1">Regra de Alocação</h3>
                            <p className="text-[13px] text-gray-500">Defina como sua renda será dividida. A soma deve ser 100%.</p>
                        </div>

                        {/* Visual bar */}
                        <div className="flex rounded-full overflow-hidden h-3 mb-8 bg-black/6">
                            {BUCKETS.map(b => (
                                <div key={b.key} className="flex items-center justify-center transition-all duration-300"
                                    style={{ width: `${data[b.key]}%`, background: b.color }}>
                                    {Number(data[b.key]) >= 12 && (
                                        <span className="font-mono text-[9px] font-bold text-white">{data[b.key]}%</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="space-y-7">
                            {BUCKETS.map(b => (
                                <div key={b.key}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: b.color }} />
                                            <span className="text-[14px] font-semibold text-gray-900">{b.label}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="number" min="0" max="100"
                                                value={data[b.key]}
                                                onChange={e => setData(b.key, e.target.value)}
                                                className="w-14 text-right px-2 py-1.5 rounded-lg bg-gray-50 border border-black/10 text-[14px] font-bold font-mono text-gray-900 outline-none focus:ring-2 transition-all"
                                                style={{ '--tw-ring-color': b.color + '33' }}
                                                onFocus={e => { e.target.style.borderColor = b.color + 'aa'; e.target.style.boxShadow = `0 0 0 3px ${b.color}20`; }}
                                                onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
                                            />
                                            <span className="text-[13px] text-gray-400 font-mono">%</span>
                                        </div>
                                    </div>

                                    {/* Custom range slider */}
                                    <div className="relative h-5 flex items-center">
                                        <div className="absolute inset-x-0 h-1.5 rounded-full bg-black/6" />
                                        <div className="absolute left-0 h-1.5 rounded-full pointer-events-none transition-all duration-150"
                                            style={{ width: `${data[b.key]}%`, background: b.color }} />
                                        <input
                                            type="range" min="0" max="100" step="1"
                                            value={data[b.key]}
                                            onChange={e => setData(b.key, e.target.value)}
                                            className="absolute inset-x-0 w-full h-5 opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="absolute w-4 h-4 rounded-full pointer-events-none transition-all duration-150 shadow-md"
                                            style={{ left: `${data[b.key]}%`, transform: 'translateX(-50%)', background: b.color, boxShadow: `0 2px 8px ${b.color}60` }} />
                                    </div>

                                    <p className="text-[11.5px] text-gray-400 mt-2">{b.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className={`mt-7 flex items-center justify-between px-4 py-3 rounded-xl border ${isValid ? 'bg-[#00B679]/5 border-[#00B679]/20' : 'bg-red-50 border-red-200'}`}>
                            <span className={`text-[13px] font-semibold ${isValid ? 'text-[#00916A]' : 'text-red-600'}`}>Total</span>
                            <span className={`font-mono text-[1.2rem] font-bold ${isValid ? 'text-[#00B679]' : 'text-red-600'}`}>
                                {total.toFixed(0)}%
                            </span>
                        </div>

                        {!isValid && (
                            <p className="mt-2 text-[12px] text-red-500 text-center">A soma deve ser exatamente 100%</p>
                        )}
                        {errors.needs_pct && <p className="mt-2 text-[12px] text-red-500">{errors.needs_pct}</p>}

                        <div className="mt-6 flex justify-end">
                            <button type="submit" disabled={processing || !isValid} className="btn-primary text-[14px] px-7">
                                {processing ? 'Salvando...' : 'Salvar Configurações'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
