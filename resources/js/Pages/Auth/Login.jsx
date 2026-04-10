import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const inputCls = 'w-full px-3.5 py-2.5 rounded-lg bg-gray-50 border border-black/10 text-gray-900 text-[14px] outline-none focus:border-[#00B679]/60 focus:ring-2 focus:ring-[#00B679]/10 focus:bg-white transition-colors placeholder:text-gray-400';

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

    return (
        <GuestLayout>
            <Head title="Entrar" />

            <h2 className="text-[1.6rem] font-bold text-gray-900 leading-tight mb-1">Bem-vindo de volta</h2>
            <p className="text-[14px] text-gray-500 mb-7">Entre na sua conta para continuar</p>

            {status && (
                <div className="mb-4 px-3.5 py-2.5 rounded-lg bg-[#00B679]/8 border border-[#00B679]/20 text-[13px] text-[#00916A]">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                    <input type="email" value={data.email} onChange={e => setData('email', e.target.value)}
                        className={inputCls} autoComplete="username" autoFocus placeholder="seu@email.com" />
                    {errors.email && <p className="text-[12px] text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Senha</label>
                    <input type="password" value={data.password} onChange={e => setData('password', e.target.value)}
                        className={inputCls} autoComplete="current-password" placeholder="••••••••" />
                    {errors.password && <p className="text-[12px] text-red-500 mt-1">{errors.password}</p>}
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={data.remember} onChange={e => setData('remember', e.target.checked)}
                            className="w-3.5 h-3.5 rounded accent-[#00B679]" />
                        <span className="text-[13px] text-gray-600">Lembrar-me</span>
                    </label>
                    {canResetPassword && (
                        <Link href={route('password.request')} className="text-[13px] text-[#00B679] font-medium no-underline hover:underline">
                            Esqueci a senha
                        </Link>
                    )}
                </div>

                <button type="submit" disabled={processing}
                    className="w-full py-3 rounded-lg bg-[#00B679] text-white font-semibold text-[15px] border-none cursor-pointer transition-all hover:bg-[#009D69] disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                    {processing ? 'Entrando...' : 'Entrar →'}
                </button>

                <p className="text-center text-[13px] text-gray-500 pt-1">
                    Não tem conta?{' '}
                    <Link href={route('register')} className="text-[#00B679] font-semibold no-underline hover:underline">
                        Criar conta
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
