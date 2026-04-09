import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

const lbl = { fontSize: '11px', fontWeight: 600, color: '#6b6458', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: '7px', fontFamily: 'DM Mono, monospace' };
const inp = { width: '100%', padding: '10px 12px', borderRadius: '10px', background: '#faf8f3', border: '1px solid rgba(0,0,0,0.1)', color: '#1c1812', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', outline: 'none' };
const fi = (e) => { e.target.style.borderColor = 'rgba(184,121,10,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(184,121,10,0.1)'; };
const fo = (e) => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none'; };

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
            <div style={{ marginBottom: '22px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1c1812', marginBottom: '4px' }}>Informações do Perfil</h3>
                <p style={{ fontSize: '12px', color: '#6b6458' }}>Atualize seu nome e endereço de email.</p>
            </div>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                    <label style={lbl}>Nome</label>
                    <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} style={inp} autoFocus autoComplete="name" onFocus={fi} onBlur={fo} />
                    {errors.name && <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '5px' }}>{errors.name}</p>}
                </div>
                <div>
                    <label style={lbl}>Email</label>
                    <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} style={inp} autoComplete="username" onFocus={fi} onBlur={fo} />
                    {errors.email && <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '5px' }}>{errors.email}</p>}
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(184,121,10,0.06)', border: '1px solid rgba(184,121,10,0.18)' }}>
                        <p style={{ fontSize: '13px', color: '#92600c' }}>
                            Seu email não foi verificado.{' '}
                            <Link href={route('verification.send')} method="post" as="button"
                                style={{ fontWeight: 600, color: '#b8790a', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '13px' }}>
                                Reenviar verificação
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <p style={{ fontSize: '12px', color: '#047857', marginTop: '6px' }}>Link de verificação enviado!</p>
                        )}
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <button type="submit" disabled={processing} className="btn-primary" style={{ fontSize: '13px', padding: '9px 22px' }}>
                        {processing ? 'Salvando...' : 'Salvar'}
                    </button>
                    <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                        <p style={{ fontSize: '12px', color: '#047857' }}>Salvo!</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
