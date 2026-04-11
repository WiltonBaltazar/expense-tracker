import Modal from '@/Components/Modal';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { getStaggerMotionProps, staggerItem } from '@/lib/motion';
import { useMotionPreference } from '@/contexts/MotionPreferenceContext';

const inputCls = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100';

const number = (value) => Number(value || 0).toLocaleString('pt-BR');

export default function AdminUsers({ adminDomain, generatedAt, adminUsers, adminDomains }) {
    const { reduceMotion } = useMotionPreference();
    const stagger = getStaggerMotionProps(reduceMotion);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const createAdminForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        admin_domain: adminDomain || 'wiltonvm.click',
    });

    function submitAdminForm(e) {
        e.preventDefault();

        createAdminForm.post(route('admin.users.store'), {
            preserveScroll: true,
            onSuccess: () => {
                createAdminForm.reset('name', 'email', 'password', 'password_confirmation');
                setShowCreateModal(false);
            },
        });
    }

    return (
        <AdminLayout
            title="Admin Users"
            subtitle="Gestão de contas administrativas da plataforma"
            adminDomain={adminDomain}
        >
            <Head title="Admin Users" />

            <motion.div {...stagger} className="space-y-5">
                <motion.section variants={staggerItem} className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-900">Administradores</p>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                {number(adminUsers.length)} admins
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                                        <th className="py-2">Nome</th>
                                        <th className="py-2">Email</th>
                                        <th className="py-2">Domínio</th>
                                        <th className="py-2">Criado em</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {adminUsers.map((admin) => (
                                        <tr key={admin.id} className="border-b border-slate-100">
                                            <td className="py-2.5 font-medium text-slate-800">{admin.name}</td>
                                            <td className="py-2.5 text-slate-500">{admin.email}</td>
                                            <td className="py-2.5 text-slate-600">{admin.admin_domain || adminDomain}</td>
                                            <td className="py-2.5 text-slate-500">{admin.created_at}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-semibold text-slate-900">Distribuição por Domínio</p>
                        <p className="mb-4 text-xs text-slate-500">Onde os admins estão autorizados</p>

                        <div className="space-y-2">
                            {adminDomains.map((item) => (
                                <div key={item.domain} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
                                    <span className="text-slate-600">{item.domain}</span>
                                    <span className="font-semibold text-slate-900">{number(item.count)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                <motion.section variants={staggerItem} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">Adicionar Novo Admin</p>
                    <p className="mb-4 text-xs text-slate-500">Todas as criações no admin são feitas por modal.</p>
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
                    >
                        Novo Admin
                    </button>
                </motion.section>

                <motion.section variants={staggerItem}>
                    <p className="text-xs text-slate-500">Atualizado em {new Date(generatedAt).toLocaleString()}</p>
                </motion.section>
            </motion.div>

            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="2xl">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900">Criar Admin</p>
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                        >
                            Fechar
                        </button>
                    </div>

                    <form onSubmit={submitAdminForm} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-500">Nome</label>
                            <input className={inputCls} value={createAdminForm.data.name} onChange={(e) => createAdminForm.setData('name', e.target.value)} />
                            {createAdminForm.errors.name ? <p className="mt-1 text-xs text-rose-600">{createAdminForm.errors.name}</p> : null}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-500">Email</label>
                            <input className={inputCls} type="email" value={createAdminForm.data.email} onChange={(e) => createAdminForm.setData('email', e.target.value)} />
                            {createAdminForm.errors.email ? <p className="mt-1 text-xs text-rose-600">{createAdminForm.errors.email}</p> : null}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-500">Domínio Admin</label>
                            <input className={inputCls} value={createAdminForm.data.admin_domain} onChange={(e) => createAdminForm.setData('admin_domain', e.target.value)} />
                            {createAdminForm.errors.admin_domain ? <p className="mt-1 text-xs text-rose-600">{createAdminForm.errors.admin_domain}</p> : null}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-500">Senha</label>
                            <input className={inputCls} type="password" value={createAdminForm.data.password} onChange={(e) => createAdminForm.setData('password', e.target.value)} />
                            {createAdminForm.errors.password ? <p className="mt-1 text-xs text-rose-600">{createAdminForm.errors.password}</p> : null}
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-semibold text-slate-500">Confirmar Senha</label>
                            <input className={inputCls} type="password" value={createAdminForm.data.password_confirmation} onChange={(e) => createAdminForm.setData('password_confirmation', e.target.value)} />
                        </div>

                        <div className="sm:col-span-2 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={createAdminForm.processing}
                                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
                            >
                                {createAdminForm.processing ? 'A criar...' : 'Criar Admin'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AdminLayout>
    );
}
