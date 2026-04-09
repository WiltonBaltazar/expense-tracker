import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    const input = { width: '100%', padding: '11px 14px', borderRadius: '12px', background: '#faf8f3', border: '1px solid rgba(0,0,0,0.1)', color: '#1c1812', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', outline: 'none' };

    return (
        <GuestLayout>
            <Head title="Recuperar Senha" />

            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.7rem', fontWeight: 700, color: '#1c1812', marginBottom: '6px', lineHeight: 1.2 }}>
                Esqueceu a senha?
            </h2>
            <p style={{ fontSize: '14px', color: '#6b6458', marginBottom: '28px', lineHeight: 1.6 }}>
                Informe seu email e enviaremos um link para redefinir sua senha.
            </p>

            {status && (
                <div style={{ marginBottom: '20px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)', fontSize: '13px', color: '#047857' }}>
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div style={{ marginBottom: '24px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b6458', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: '8px', fontFamily: 'DM Mono, monospace' }}>
                        Email
                    </label>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        style={input}
                        autoFocus
                        placeholder="seu@email.com"
                        onFocus={(e) => { e.target.style.borderColor = 'rgba(184,121,10,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(184,121,10,0.1)'; }}
                        onBlur={(e)  => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none'; }}
                    />
                    {errors.email && <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '6px' }}>{errors.email}</p>}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    style={{ width: '100%', padding: '13px', borderRadius: '12px', background: processing ? 'rgba(184,121,10,0.5)' : '#b8790a', color: '#ffffff', fontWeight: 700, fontSize: '15px', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', transition: 'all 0.15s', fontFamily: 'DM Sans, sans-serif' }}
                >
                    {processing ? 'Enviando...' : 'Enviar link de recuperação'}
                </button>
            </form>
        </GuestLayout>
    );
}
