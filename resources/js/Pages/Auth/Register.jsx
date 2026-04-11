import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const inputCls = 'w-full px-3.5 py-2.5 rounded-lg bg-gray-50 border border-black/10 text-gray-900 text-[14px] outline-none focus:border-[#00B679]/60 focus:ring-2 focus:ring-[#00B679]/10 focus:bg-white transition-colors placeholder:text-gray-400';

function PlanBanner({ plan }) {
    const priceLabel = plan.is_free
        ? 'Gratuito'
        : `${Number(plan.price_monthly).toLocaleString('pt-MZ')} ${plan.currency} / ${plan.duration_months > 1 ? `${plan.duration_months} meses` : 'mês'}`;

    return (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-[#00B679]/8 border border-[#00B679]/20 px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-[#00B679] flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" />
                </svg>
            </div>
            <div className="min-w-0">
                <p className="text-[12px] text-[#00916A] font-semibold leading-tight">Plano selecionado</p>
                <p className="text-[14px] font-bold text-gray-900 truncate">{plan.name} <span className="font-normal text-gray-500 text-[13px]">— {priceLabel}</span></p>
            </div>
        </div>
    );
}

export default function Register({ selectedPlan }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        plan_code: selectedPlan?.code ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    return (
        <GuestLayout>
            <Head title="Criar Conta" />

            <h2 className="text-[1.6rem] font-bold text-gray-900 leading-tight mb-1">Criar conta</h2>
            <p className="text-[14px] text-gray-500 mb-6">Comece a controlar suas finanças gratuitamente</p>

            {selectedPlan && <PlanBanner plan={selectedPlan} />}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nome</label>
                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)}
                        className={inputCls} autoFocus autoComplete="name" placeholder="Seu nome" />
                    {errors.name && <p className="text-[12px] text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                    <input type="email" value={data.email} onChange={e => setData('email', e.target.value)}
                        className={inputCls} autoComplete="username" placeholder="seu@email.com" />
                    {errors.email && <p className="text-[12px] text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Senha</label>
                    <input type="password" value={data.password} onChange={e => setData('password', e.target.value)}
                        className={inputCls} autoComplete="new-password" placeholder="Mín. 8 caracteres" />
                    {errors.password && <p className="text-[12px] text-red-500 mt-1">{errors.password}</p>}
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Confirmar Senha</label>
                    <input type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)}
                        className={inputCls} autoComplete="new-password" placeholder="Repita a senha" />
                    {errors.password_confirmation && <p className="text-[12px] text-red-500 mt-1">{errors.password_confirmation}</p>}
                </div>

                <button type="submit" disabled={processing}
                    className="w-full py-3 rounded-lg bg-[#00B679] text-white font-semibold text-[15px] border-none cursor-pointer transition-all hover:bg-[#009D69] disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                    {processing ? 'Criando...' : 'Criar conta →'}
                </button>

                <p className="text-center text-[13px] text-gray-500 pt-1">
                    Já tem conta?{' '}
                    <Link href={route('login')} className="text-[#00B679] font-semibold no-underline hover:underline">
                        Entrar
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
