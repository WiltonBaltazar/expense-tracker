import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

const inp = { width: '100%', padding: '10px 12px', borderRadius: '10px', background: '#faf8f3', border: '1px solid rgba(0,0,0,0.1)', color: '#1c1812', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', outline: 'none' };
const fi = (e) => { e.target.style.borderColor = 'rgba(220,38,38,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.08)'; };
const fo = (e) => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none'; };

export default function DeleteUserForm() {
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const passwordInput = useRef();

    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({ password: '' });

    const deleteUser = (e) => {
        e.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section>
            <div style={{ marginBottom: '18px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#dc2626', marginBottom: '4px' }}>Excluir Conta</h3>
                <p style={{ fontSize: '12px', color: '#6b6458', lineHeight: 1.6 }}>
                    Após excluir sua conta, todos os dados serão permanentemente removidos. Faça backup de qualquer informação que deseje manter.
                </p>
            </div>

            <button
                onClick={() => setConfirmingDeletion(true)}
                style={{ padding: '9px 20px', borderRadius: '10px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.18)', color: '#dc2626', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'DM Sans, sans-serif' }}
            >
                Excluir Conta
            </button>

            <Modal show={confirmingDeletion} onClose={closeModal}>
                <div style={{ background: '#ffffff', borderRadius: '20px', padding: '32px', border: '1px solid rgba(220,38,38,0.15)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1c1812', marginBottom: '8px' }}>
                        Tem certeza que deseja excluir sua conta?
                    </h2>
                    <p style={{ fontSize: '13px', color: '#6b6458', lineHeight: 1.6, marginBottom: '24px' }}>
                        Esta ação é irreversível. Todos os seus dados serão permanentemente excluídos. Confirme com sua senha.
                    </p>

                    <form onSubmit={deleteUser}>
                        <input
                            ref={passwordInput}
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            style={inp}
                            placeholder="Sua senha"
                            autoFocus
                            onFocus={fi}
                            onBlur={fo}
                        />
                        {errors.password && <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '6px' }}>{errors.password}</p>}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                            <button type="button" onClick={closeModal} className="btn-secondary" style={{ fontSize: '13px', padding: '9px 20px' }}>
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                style={{ padding: '9px 20px', borderRadius: '10px', background: '#dc2626', color: '#ffffff', fontSize: '13px', fontWeight: 700, border: 'none', cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.6 : 1, transition: 'all 0.15s', fontFamily: 'DM Sans, sans-serif' }}
                            >
                                {processing ? 'Excluindo...' : 'Excluir Conta'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </section>
    );
}
