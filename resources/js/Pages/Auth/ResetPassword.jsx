import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

const inputCls = 'w-full px-3.5 py-2.5 rounded-lg bg-gray-50 border border-black/10 text-gray-900 text-[14px] outline-none focus:border-[#00B679]/60 focus:ring-2 focus:ring-[#00B679]/10 focus:bg-white transition-colors placeholder:text-gray-400';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token, email, password: '', password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    return (
        <GuestLayout>
            <Head title="Redefinir Senha" />

            <h2 className="text-[1.6rem] font-bold text-gray-900 leading-tight mb-1">Redefinir senha</h2>
            <p className="text-[14px] text-gray-500 leading-relaxed mb-7">Escolha uma nova senha para sua conta.</p>

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                    <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)}
                        className={inputCls} autoComplete="username" />
                    {errors.email && <p className="text-[12px] text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nova Senha</label>
                    <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)}
                        className={inputCls} autoFocus autoComplete="new-password" placeholder="Mín. 8 caracteres" />
                    {errors.password && <p className="text-[12px] text-red-500 mt-1">{errors.password}</p>}
                </div>
                <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Confirmar Senha</label>
                    <input type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)}
                        className={inputCls} autoComplete="new-password" placeholder="Repita a senha" />
                    {errors.password_confirmation && <p className="text-[12px] text-red-500 mt-1">{errors.password_confirmation}</p>}
                </div>

                <button type="submit" disabled={processing}
                    className="w-full py-3 rounded-lg bg-[#00B679] text-white font-semibold text-[15px] border-none cursor-pointer transition-all hover:bg-[#009D69] disabled:opacity-50 disabled:cursor-not-allowed">
                    {processing ? 'Salvando...' : 'Redefinir senha →'}
                </button>
            </form>
        </GuestLayout>
    );
}
