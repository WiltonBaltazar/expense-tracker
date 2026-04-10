import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';

const inputCls = 'w-full px-3.5 py-2.5 rounded-lg bg-gray-50 border border-black/10 text-gray-900 text-[14px] outline-none focus:border-[#00B679]/60 focus:ring-2 focus:ring-[#00B679]/10 focus:bg-white transition-colors';

export default function UpdatePasswordForm() {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password)         { reset('password', 'password_confirmation'); passwordInput.current.focus(); }
                if (errors.current_password) { reset('current_password'); currentPasswordInput.current.focus(); }
            },
        });
    };

    return (
        <section>
            <div className="mb-5">
                <h3 className="text-[15px] font-bold text-gray-900 mb-1">Alterar Senha</h3>
                <p className="text-[13px] text-gray-500">Use uma senha longa e aleatória para manter sua conta segura.</p>
            </div>

            <form onSubmit={updatePassword} className="space-y-4">
                <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Senha Atual</label>
                    <input ref={currentPasswordInput} type="password" value={data.current_password} onChange={e => setData('current_password', e.target.value)} className={inputCls} autoComplete="current-password" />
                    {errors.current_password && <p className="text-[12px] text-red-500 mt-1">{errors.current_password}</p>}
                </div>
                <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nova Senha</label>
                    <input ref={passwordInput} type="password" value={data.password} onChange={e => setData('password', e.target.value)} className={inputCls} autoComplete="new-password" />
                    {errors.password && <p className="text-[12px] text-red-500 mt-1">{errors.password}</p>}
                </div>
                <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Confirmar Nova Senha</label>
                    <input type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} className={inputCls} autoComplete="new-password" />
                    {errors.password_confirmation && <p className="text-[12px] text-red-500 mt-1">{errors.password_confirmation}</p>}
                </div>

                <div className="flex items-center gap-4 pt-1">
                    <button type="submit" disabled={processing} className="btn-primary text-[13px]">
                        {processing ? 'Salvando...' : 'Salvar'}
                    </button>
                    <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                        <p className="text-[12.5px] text-[#00916A] font-medium">Salvo!</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
