import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

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
            <div className="mb-4">
                <h3 className="text-[15px] font-bold text-red-600 mb-1">Excluir Conta</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed">
                    Após excluir sua conta, todos os dados serão permanentemente removidos. Faça backup de qualquer informação que deseje manter.
                </p>
            </div>

            <button onClick={() => setConfirmingDeletion(true)}
                className="px-4 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[13px] font-semibold cursor-pointer transition-all hover:bg-red-100">
                Excluir Conta
            </button>

            <Modal show={confirmingDeletion} onClose={closeModal}>
                <div className="bg-white rounded-2xl p-8 border border-red-100 shadow-2xl">
                    <h2 className="text-[17px] font-bold text-gray-900 mb-2">
                        Tem certeza que deseja excluir sua conta?
                    </h2>
                    <p className="text-[13px] text-gray-500 leading-relaxed mb-6">
                        Esta ação é irreversível. Todos os seus dados serão permanentemente excluídos. Confirme com sua senha.
                    </p>

                    <form onSubmit={deleteUser}>
                        <input
                            ref={passwordInput}
                            type="password"
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-lg bg-gray-50 border border-black/10 text-gray-900 text-[14px] outline-none focus:border-red-400/60 focus:ring-2 focus:ring-red-400/10 transition-colors"
                            placeholder="Sua senha"
                            autoFocus
                        />
                        {errors.password && <p className="text-[12px] text-red-500 mt-1.5">{errors.password}</p>}

                        <div className="flex justify-end gap-2.5 mt-5">
                            <button type="button" onClick={closeModal} className="btn-secondary text-[13px]">
                                Cancelar
                            </button>
                            <button type="submit" disabled={processing}
                                className="px-5 py-2.5 rounded-lg bg-red-600 text-white text-[13px] font-semibold border-none cursor-pointer transition-all hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                {processing ? 'Excluindo...' : 'Excluir Conta'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </section>
    );
}
