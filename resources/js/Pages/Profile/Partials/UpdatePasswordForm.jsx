import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';

const lbl = { fontSize: '11px', fontWeight: 600, color: '#6b6458', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: '7px', fontFamily: 'DM Mono, monospace' };
const inp = { width: '100%', padding: '10px 12px', borderRadius: '10px', background: '#faf8f3', border: '1px solid rgba(0,0,0,0.1)', color: '#1c1812', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', outline: 'none' };
const fi = (e) => { e.target.style.borderColor = 'rgba(184,121,10,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(184,121,10,0.1)'; };
const fo = (e) => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none'; };

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
                if (errors.password)          { reset('password', 'password_confirmation'); passwordInput.current.focus(); }
                if (errors.current_password)  { reset('current_password'); currentPasswordInput.current.focus(); }
            },
        });
    };

    return (
        <section>
            <div style={{ marginBottom: '22px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1c1812', marginBottom: '4px' }}>Alterar Senha</h3>
                <p style={{ fontSize: '12px', color: '#6b6458' }}>Use uma senha longa e aleatória para manter sua conta segura.</p>
            </div>

            <form onSubmit={updatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                    <label style={lbl}>Senha Atual</label>
                    <input ref={currentPasswordInput} type="password" value={data.current_password} onChange={(e) => setData('current_password', e.target.value)} style={inp} autoComplete="current-password" onFocus={fi} onBlur={fo} />
                    {errors.current_password && <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '5px' }}>{errors.current_password}</p>}
                </div>
                <div>
                    <label style={lbl}>Nova Senha</label>
                    <input ref={passwordInput} type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} style={inp} autoComplete="new-password" onFocus={fi} onBlur={fo} />
                    {errors.password && <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '5px' }}>{errors.password}</p>}
                </div>
                <div>
                    <label style={lbl}>Confirmar Nova Senha</label>
                    <input type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} style={inp} autoComplete="new-password" onFocus={fi} onBlur={fo} />
                    {errors.password_confirmation && <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '5px' }}>{errors.password_confirmation}</p>}
                </div>

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
