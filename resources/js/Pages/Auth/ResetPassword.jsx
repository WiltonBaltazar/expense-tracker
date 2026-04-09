import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token, email, password: '', password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    const lbl = { fontSize: '12px', fontWeight: 600, color: '#6b6458', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: '8px', fontFamily: 'DM Mono, monospace' };
    const inp = { width: '100%', padding: '11px 14px', borderRadius: '12px', background: '#faf8f3', border: '1px solid rgba(0,0,0,0.1)', color: '#1c1812', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', outline: 'none' };
    const err = { fontSize: '12px', color: '#dc2626', marginTop: '6px' };
    const fi = (e) => { e.target.style.borderColor = 'rgba(184,121,10,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(184,121,10,0.1)'; };
    const fo = (e) => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none'; };

    return (
        <GuestLayout>
            <Head title="Redefinir Senha" />

            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.7rem', fontWeight: 700, color: '#1c1812', marginBottom: '6px', lineHeight: 1.2 }}>
                Redefinir senha
            </h2>
            <p style={{ fontSize: '14px', color: '#6b6458', marginBottom: '28px' }}>Escolha uma nova senha para sua conta.</p>

            <form onSubmit={submit}>
                <div style={{ marginBottom: '16px' }}>
                    <label style={lbl}>Email</label>
                    <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} style={inp} autoComplete="username" onFocus={fi} onBlur={fo} />
                    {errors.email && <p style={err}>{errors.email}</p>}
                </div>
                <div style={{ marginBottom: '16px' }}>
                    <label style={lbl}>Nova Senha</label>
                    <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} style={inp} autoFocus autoComplete="new-password" placeholder="Mín. 8 caracteres" onFocus={fi} onBlur={fo} />
                    {errors.password && <p style={err}>{errors.password}</p>}
                </div>
                <div style={{ marginBottom: '28px' }}>
                    <label style={lbl}>Confirmar Senha</label>
                    <input type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} style={inp} autoComplete="new-password" placeholder="Repita a senha" onFocus={fi} onBlur={fo} />
                    {errors.password_confirmation && <p style={err}>{errors.password_confirmation}</p>}
                </div>
                <button
                    type="submit"
                    disabled={processing}
                    style={{ width: '100%', padding: '13px', borderRadius: '12px', background: processing ? 'rgba(184,121,10,0.5)' : '#b8790a', color: '#ffffff', fontWeight: 700, fontSize: '15px', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', transition: 'all 0.15s', fontFamily: 'DM Sans, sans-serif' }}
                >
                    {processing ? 'Salvando...' : 'Redefinir senha →'}
                </button>
            </form>
        </GuestLayout>
    );
}
