import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    const label = { fontSize: '12px', fontWeight: 600, color: '#6b6458', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: '8px', fontFamily: 'DM Mono, monospace' };
    const input = { width: '100%', padding: '11px 14px', borderRadius: '12px', background: '#faf8f3', border: '1px solid rgba(0,0,0,0.1)', color: '#1c1812', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', outline: 'none', transition: 'border-color 0.15s' };
    const err = { fontSize: '12px', color: '#dc2626', marginTop: '6px' };

    const focusIn = (e) => { e.target.style.borderColor = 'rgba(184,121,10,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(184,121,10,0.1)'; };
    const focusOut = (e) => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none'; };

    return (
        <GuestLayout>
            <Head title="Criar Conta" />

            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.7rem', fontWeight: 700, color: '#1c1812', marginBottom: '6px', lineHeight: 1.2 }}>
                Criar conta
            </h2>
            <p style={{ fontSize: '14px', color: '#6b6458', marginBottom: '28px' }}>
                Comece a controlar suas finanças gratuitamente
            </p>

            <form onSubmit={submit}>
                <div style={{ marginBottom: '16px' }}>
                    <label style={label}>Nome</label>
                    <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} style={input} autoFocus autoComplete="name" placeholder="Seu nome" onFocus={focusIn} onBlur={focusOut} />
                    {errors.name && <p style={err}>{errors.name}</p>}
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={label}>Email</label>
                    <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} style={input} autoComplete="username" placeholder="seu@email.com" onFocus={focusIn} onBlur={focusOut} />
                    {errors.email && <p style={err}>{errors.email}</p>}
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={label}>Senha</label>
                    <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} style={input} autoComplete="new-password" placeholder="Mín. 8 caracteres" onFocus={focusIn} onBlur={focusOut} />
                    {errors.password && <p style={err}>{errors.password}</p>}
                </div>

                <div style={{ marginBottom: '28px' }}>
                    <label style={label}>Confirmar Senha</label>
                    <input type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} style={input} autoComplete="new-password" placeholder="Repita a senha" onFocus={focusIn} onBlur={focusOut} />
                    {errors.password_confirmation && <p style={err}>{errors.password_confirmation}</p>}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    style={{ width: '100%', padding: '13px', borderRadius: '12px', background: processing ? 'rgba(184,121,10,0.5)' : '#b8790a', color: '#ffffff', fontWeight: 700, fontSize: '15px', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', transition: 'all 0.15s', fontFamily: 'DM Sans, sans-serif' }}
                >
                    {processing ? 'Criando...' : 'Criar conta →'}
                </button>

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#6b6458' }}>
                    Já tem conta?{' '}
                    <Link href={route('login')} style={{ color: '#b8790a', textDecoration: 'none', fontWeight: 600 }}>
                        Entrar
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
