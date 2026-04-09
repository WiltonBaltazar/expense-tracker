import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Verificar Email" />

            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(184,121,10,0.1)', border: '1px solid rgba(184,121,10,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <svg width="26" height="26" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#b8790a">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                </div>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', fontWeight: 700, color: '#1c1812', marginBottom: '8px', lineHeight: 1.2 }}>
                    Verifique seu email
                </h2>
                <p style={{ fontSize: '14px', color: '#6b6458', lineHeight: 1.65 }}>
                    Obrigado por se cadastrar! Enviamos um link de verificação para o seu endereço de email. Por favor, clique no link para ativar sua conta.
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <div style={{ marginBottom: '20px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)', fontSize: '13px', color: '#047857', textAlign: 'center' }}>
                    Um novo link de verificação foi enviado para o seu email.
                </div>
            )}

            <form onSubmit={submit}>
                <button
                    type="submit"
                    disabled={processing}
                    style={{ width: '100%', padding: '13px', borderRadius: '12px', background: processing ? 'rgba(184,121,10,0.5)' : '#b8790a', color: '#ffffff', fontWeight: 700, fontSize: '15px', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', transition: 'all 0.15s', fontFamily: 'DM Sans, sans-serif', marginBottom: '14px' }}
                >
                    {processing ? 'Enviando...' : 'Reenviar email de verificação'}
                </button>

                <div style={{ textAlign: 'center' }}>
                    <Link href={route('logout')} method="post" as="button"
                        style={{ fontSize: '13px', color: '#a39888', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'DM Sans, sans-serif' }}>
                        Sair
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
