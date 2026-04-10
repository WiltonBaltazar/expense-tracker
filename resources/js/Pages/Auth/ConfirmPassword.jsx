import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

const inputCls = 'w-full px-3.5 py-2.5 rounded-lg bg-gray-50 border border-black/10 text-gray-900 text-[14px] outline-none focus:border-[#00B679]/60 focus:ring-2 focus:ring-[#00B679]/10 focus:bg-white transition-colors placeholder:text-gray-400';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({ password: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), { onFinish: () => reset('password') });
    };

    return (
        <GuestLayout>
            <Head title="Confirmar Senha" />

            <div className="text-center mb-7">
                <div className="w-13 h-13 rounded-[14px] bg-[#00B679]/10 border border-[#00B679]/18 flex items-center justify-center mx-auto mb-3.5" style={{ width: 52, height: 52 }}>
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#00B679">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                </div>
                <h2 className="text-[1.6rem] font-bold text-gray-900 leading-tight mb-1.5">Área segura</h2>
                <p className="text-[14px] text-gray-500 leading-relaxed">Confirme sua senha para continuar.</p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Senha</label>
                    <input
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className={inputCls}
                        autoFocus
                        placeholder="••••••••"
                    />
                    {errors.password && <p className="text-[12px] text-red-500 mt-1">{errors.password}</p>}
                </div>

                <button type="submit" disabled={processing}
                    className="w-full py-3 rounded-lg bg-[#00B679] text-white font-semibold text-[15px] border-none cursor-pointer transition-all hover:bg-[#009D69] disabled:opacity-50 disabled:cursor-not-allowed">
                    {processing ? 'Confirmando...' : 'Confirmar →'}
                </button>
            </form>
        </GuestLayout>
    );
}
