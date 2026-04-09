import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({ password: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), { onFinish: () => reset('password') });
    };

    return (
        <GuestLayout>
            <Head title="Confirmar Senha" />

            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(184,121,10,0.1)', border: '1px solid rgba(184,121,10,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#b8790a">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                </div>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', fontWeight: 700, color: '#1c1812', marginBottom: '6px' }}>
                    Área segura
                </h2>
                <p style={{ fontSize: '14px', color: '#6b6458', lineHeight: 1.6 }}>
                    Confirme sua senha para continuar.
                </p>
            </div>

            <form onSubmit={submit}>
                <div style={{ marginBottom: '24px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b6458', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: '8px', fontFamily: 'DM Mono, monospace' }}>
                        Senha
                    </label>
                    <input
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', background: '#faf8f3', border: '1px solid rgba(0,0,0,0.1)', color: '#1c1812', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', outline: 'none' }}
                        autoFocus
                        placeholder="••••••••"
                        onFocus={(e) => { e.target.style.borderColor = 'rgba(184,121,10,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(184,121,10,0.1)'; }}
                        onBlur={(e)  => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none'; }}
                    />
                    {errors.password && <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '6px' }}>{errors.password}</p>}
                </div>
                <button
                    type="submit"
                    disabled={processing}
                    style={{ width: '100%', padding: '13px', borderRadius: '12px', background: processing ? 'rgba(184,121,10,0.5)' : '#b8790a', color: '#ffffff', fontWeight: 700, fontSize: '15px', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', transition: 'all 0.15s', fontFamily: 'DM Sans, sans-serif' }}
                >
                    {processing ? 'Confirmando...' : 'Confirmar →'}
                </button>
            </form>
        </GuestLayout>
    );
}
