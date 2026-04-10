import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

const inputCls = 'w-full px-3.5 py-2.5 rounded-lg bg-gray-50 border border-black/10 text-gray-900 text-[14px] outline-none focus:border-[#00B679]/60 focus:ring-2 focus:ring-[#00B679]/10 focus:bg-white transition-colors placeholder:text-gray-400';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Recuperar Senha" />

            <h2 className="text-[1.6rem] font-bold text-gray-900 leading-tight mb-1">Esqueceu a senha?</h2>
            <p className="text-[14px] text-gray-500 leading-relaxed mb-7">
                Informe seu email e enviaremos um link para redefinir sua senha.
            </p>

            {status && (
                <div className="mb-5 px-3.5 py-2.5 rounded-lg bg-[#00B679]/8 border border-[#00B679]/20 text-[13px] text-[#00916A]">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                    <input type="email" value={data.email} onChange={e => setData('email', e.target.value)}
                        className={inputCls} autoFocus placeholder="seu@email.com" />
                    {errors.email && <p className="text-[12px] text-red-500 mt-1">{errors.email}</p>}
                </div>

                <button type="submit" disabled={processing}
                    className="w-full py-3 rounded-lg bg-[#00B679] text-white font-semibold text-[15px] border-none cursor-pointer transition-all hover:bg-[#009D69] disabled:opacity-50 disabled:cursor-not-allowed">
                    {processing ? 'Enviando...' : 'Enviar link de recuperação'}
                </button>
            </form>
        </GuestLayout>
    );
}
