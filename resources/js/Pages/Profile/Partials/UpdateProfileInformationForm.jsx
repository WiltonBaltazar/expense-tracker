import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

const inputCls = 'w-full px-3.5 py-2.5 rounded-lg bg-gray-50 border border-black/10 text-gray-900 text-[14px] outline-none focus:border-[#00B679]/60 focus:ring-2 focus:ring-[#00B679]/10 focus:bg-white transition-colors';

export default function UpdateProfileInformation({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section>
            <div className="mb-5">
                <h3 className="text-[15px] font-bold text-gray-900 mb-1">Informações do Perfil</h3>
                <p className="text-[13px] text-gray-500">Atualize seu nome e endereço de email.</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nome</label>
                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className={inputCls} autoFocus autoComplete="name" />
                    {errors.name && <p className="text-[12px] text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                    <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className={inputCls} autoComplete="username" />
                    {errors.email && <p className="text-[12px] text-red-500 mt-1">{errors.email}</p>}
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="px-4 py-3 rounded-lg bg-[#00B679]/6 border border-[#00B679]/18">
                        <p className="text-[13px] text-[#00916A]">
                            Seu email não foi verificado.{' '}
                            <Link href={route('verification.send')} method="post" as="button"
                                className="font-semibold text-[#00B679] bg-none border-none cursor-pointer text-[13px] hover:underline">
                                Reenviar verificação
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <p className="text-[12px] text-[#00916A] mt-1.5">Link de verificação enviado!</p>
                        )}
                    </div>
                )}

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
