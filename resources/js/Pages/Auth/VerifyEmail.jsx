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

            <div className="text-center mb-7">
                <div className="flex items-center justify-center mx-auto mb-4 rounded-2xl bg-[#00B679]/10 border border-[#00B679]/18" style={{ width: 56, height: 56 }}>
                    <svg width="26" height="26" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#00B679">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                </div>
                <h2 className="text-[1.6rem] font-bold text-gray-900 leading-tight mb-2">Verifique seu email</h2>
                <p className="text-[14px] text-gray-500 leading-relaxed">
                    Obrigado por se cadastrar! Enviamos um link de verificação para o seu endereço de email. Por favor, clique no link para ativar sua conta.
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-5 px-3.5 py-2.5 rounded-lg bg-[#00B679]/8 border border-[#00B679]/20 text-[13px] text-[#00916A] text-center">
                    Um novo link de verificação foi enviado para o seu email.
                </div>
            )}

            <form onSubmit={submit} className="space-y-3">
                <button type="submit" disabled={processing}
                    className="w-full py-3 rounded-lg bg-[#00B679] text-white font-semibold text-[15px] border-none cursor-pointer transition-all hover:bg-[#009D69] disabled:opacity-50 disabled:cursor-not-allowed">
                    {processing ? 'Enviando...' : 'Reenviar email de verificação'}
                </button>

                <div className="text-center">
                    <Link href={route('logout')} method="post" as="button"
                        className="text-[13px] text-gray-400 bg-none border-none cursor-pointer hover:text-gray-600 hover:underline transition-colors">
                        Sair
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
