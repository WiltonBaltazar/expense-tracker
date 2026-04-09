import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    const label = { fontSize: '12px', fontWeight: 600, color: '#6b6458', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: '8px', fontFamily: 'DM Mono, monospace' };
    const input = { width: '100%', padding: '11px 14px', borderRadius: '12px', background: '#faf8f3', border: '1px solid rgba(0,0,0,0.1)', color: '#1c1812', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', outline: 'none', transition: 'border-color 0.15s' };
    const err = { fontSize: '12px', color: '#dc2626', marginTop: '6px' };

    const focusIn = (e) => { e.target.style.borderColor = 'rgba(184,121,10,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(184,121,10,0.1)'; };
    const focusOut = (e) => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none'; };

    return (
        <GuestLayout>
            <Head title="Entrar" />

            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.7rem', fontWeight: 700, color: '#1c1812', marginBottom: '6px', lineHeight: 1.2 }}>
                Bem-vindo de volta
            </h2>
            <p style={{ fontSize: '14px', color: '#6b6458', marginBottom: '28px' }}>
                Entre na sua conta para continuar
            </p>

            {status && (
                <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)', fontSize: '13px', color: '#047857' }}>
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div style={{ marginBottom: '18px' }}>
                    <label style={label}>Email</label>
                    <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} style={input} autoComplete="username" autoFocus placeholder="seu@email.com" onFocus={focusIn} onBlur={focusOut} />
                    {errors.email && <p style={err}>{errors.email}</p>}
                </div>

                <div style={{ marginBottom: '18px' }}>
                    <label style={label}>Senha</label>
                    <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} style={input} autoComplete="current-password" placeholder="••••••••" onFocus={focusIn} onBlur={focusOut} />
                    {errors.password && <p style={err}>{errors.password}</p>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            style={{ accentColor: '#b8790a', width: '14px', height: '14px' }}
                        />
                        <span style={{ fontSize: '13px', color: '#6b6458' }}>Lembrar-me</span>
                    </label>
                    {canResetPassword && (
                        <Link href={route('password.request')} style={{ fontSize: '13px', color: '#b8790a', textDecoration: 'none', fontWeight: 500 }}>
                            Esqueci a senha
                        </Link>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    style={{ width: '100%', padding: '13px', borderRadius: '12px', background: processing ? 'rgba(184,121,10,0.5)' : '#b8790a', color: '#ffffff', fontWeight: 700, fontSize: '15px', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', transition: 'all 0.15s', fontFamily: 'DM Sans, sans-serif' }}
                >
                    {processing ? 'Entrando...' : 'Entrar →'}
                </button>

                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#6b6458' }}>
                    Não tem conta?{' '}
                    <Link href={route('register')} style={{ color: '#b8790a', textDecoration: 'none', fontWeight: 600 }}>
                        Criar conta
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
