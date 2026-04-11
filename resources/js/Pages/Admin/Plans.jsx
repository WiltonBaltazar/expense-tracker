import Modal from '@/Components/Modal';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { getStaggerMotionProps, staggerItem } from '@/lib/motion';
import { useMotionPreference } from '@/contexts/MotionPreferenceContext';

const inputCls = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100';
const number = (value) => Number(value || 0).toLocaleString('pt-BR');
const money = (value) => Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const toSelectedFeatures = (plan, featureCatalog) =>
    featureCatalog
        .filter((feature) => Boolean(plan.features?.[feature.key]))
        .map((feature) => feature.key);

function PlanFormFields({ form, featureCatalog, durationOptions, toggleFeature }) {
    return (
        <>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-500">Código</label>
                    <input className={inputCls} value={form.data.code} onChange={(e) => form.setData('code', e.target.value.toLowerCase())} />
                    {form.errors.code ? <p className="mt-1 text-xs text-rose-600">{form.errors.code}</p> : null}
                </div>
                <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-500">Nome</label>
                    <input className={inputCls} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                    {form.errors.name ? <p className="mt-1 text-xs text-rose-600">{form.errors.name}</p> : null}
                </div>
                <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-500">Preço Mensal</label>
                    <input className={inputCls} type="number" min="0" step="0.01" value={form.data.price_monthly} onChange={(e) => form.setData('price_monthly', e.target.value)} />
                    {form.errors.price_monthly ? <p className="mt-1 text-xs text-rose-600">{form.errors.price_monthly}</p> : null}
                </div>
                <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-500">Moeda</label>
                    <input className={inputCls} value={form.data.currency} onChange={(e) => form.setData('currency', e.target.value.toUpperCase())} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-500">Duração (meses)</label>
                    <input className={inputCls} type="number" min="1" max="120" value={form.data.duration_months} onChange={(e) => form.setData('duration_months', e.target.value)} />
                    <p className="mt-1 text-[11px] text-slate-500">
                        Sugestões: {durationOptions.join(', ') || '1, 3, 6, 12'}
                    </p>
                </div>
                <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-500">Descrição</label>
                    <input className={inputCls} value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                    <input type="checkbox" checked={form.data.is_active} onChange={(e) => form.setData('is_active', e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    Plano ativo
                </label>
                <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                    <input type="checkbox" checked={form.data.is_free} onChange={(e) => form.setData('is_free', e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    Plano gratuito
                </label>
            </div>

            <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Funcionalidades permitidas (utilizador)</p>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {featureCatalog.map((feature) => (
                        <label key={feature.key} className="inline-flex items-start gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                checked={form.data.selected_features.includes(feature.key)}
                                onChange={() => toggleFeature(form, feature.key)}
                                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>
                                <span className="block font-medium text-slate-800">{feature.label}</span>
                                <span className="block text-xs text-slate-500">{feature.description}</span>
                            </span>
                        </label>
                    ))}
                </div>
            </div>
        </>
    );
}

export default function Plans({ adminDomain, generatedAt, featureCatalog, durationOptions = [], plans, users }) {
    const { reduceMotion } = useMotionPreference();
    const stagger = getStaggerMotionProps(reduceMotion);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [editingPlanId, setEditingPlanId] = useState(null);

    const editingPlan = useMemo(
        () => plans.find((plan) => plan.id === editingPlanId) || null,
        [plans, editingPlanId],
    );

    const createPlanForm = useForm({
        code: '',
        name: '',
        description: '',
        price_monthly: '0',
        currency: 'MZN',
        duration_months: String(durationOptions[0] || 1),
        is_active: true,
        is_free: false,
        selected_features: featureCatalog.map((feature) => feature.key),
    });

    const editForm = useForm({
        code: '',
        name: '',
        description: '',
        price_monthly: '0',
        currency: 'MZN',
        duration_months: '1',
        is_active: true,
        is_free: false,
        selected_features: [],
    });

    const assignForm = useForm({
        user_id: '',
        subscription_plan_id: '',
        started_at: new Date().toISOString().slice(0, 10),
        status: 'active',
    });

    const toggleFeature = (form, key) => {
        const exists = form.data.selected_features.includes(key);
        form.setData('selected_features', exists
            ? form.data.selected_features.filter((item) => item !== key)
            : [...form.data.selected_features, key]);
    };

    const openEditModal = (plan) => {
        setEditingPlanId(plan.id);
        editForm.setData({
            code: plan.code || '',
            name: plan.name || '',
            description: plan.description || '',
            price_monthly: String(plan.price_monthly ?? 0),
            currency: plan.currency || 'MZN',
            duration_months: String(plan.duration_months ?? 1),
            is_active: Boolean(plan.is_active),
            is_free: Boolean(plan.is_free),
            selected_features: toSelectedFeatures(plan, featureCatalog),
        });
        editForm.clearErrors();
    };

    const closeEditModal = () => {
        setEditingPlanId(null);
        editForm.reset();
        editForm.clearErrors();
    };

    const submitCreate = (event) => {
        event.preventDefault();
        createPlanForm.post(route('admin.plans.store'), {
            preserveScroll: true,
            onSuccess: () => {
                createPlanForm.reset('code', 'name', 'description');
                createPlanForm.setData('price_monthly', '0');
                setShowCreateModal(false);
            },
        });
    };

    const submitEdit = (event) => {
        event.preventDefault();
        if (!editingPlan) {
            return;
        }
        editForm.put(route('admin.plans.update', editingPlan.id), {
            preserveScroll: true,
            onSuccess: () => closeEditModal(),
        });
    };

    const submitAssign = (event) => {
        event.preventDefault();
        assignForm.post(route('admin.plans.assignSubscription'), {
            preserveScroll: true,
            onSuccess: () => {
                assignForm.reset('user_id', 'subscription_plan_id');
                setShowAssignModal(false);
            },
        });
    };

    return (
        <AdminLayout title="Planos" subtitle="Gestão de planos e subscrições (duração em meses)" adminDomain={adminDomain}>
            <Head title="Admin Plans" />

            <motion.div {...stagger} className="space-y-5">
                <motion.section variants={staggerItem} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-slate-900">Lista de Planos</p>
                            <p className="text-xs text-slate-500">A duração é sempre baseada em meses.</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setShowAssignModal(true)}
                                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                            >
                                Atribuir Subscrição
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(true)}
                                className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500"
                            >
                                Novo Plano
                            </button>
                        </div>
                    </div>
                </motion.section>

                <motion.section variants={staggerItem} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                                    <th className="py-2">Plano</th>
                                    <th className="py-2">Preço/mês</th>
                                    <th className="py-2">Duração (meses)</th>
                                    <th className="py-2">Features ativas</th>
                                    <th className="py-2">Subscritores ativos</th>
                                    <th className="py-2">Estado</th>
                                    <th className="py-2">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {plans.map((plan) => {
                                    const enabledCount = Object.values(plan.features || {}).filter(Boolean).length;
                                    return (
                                        <tr key={plan.id} className="border-b border-slate-100">
                                            <td className="py-2.5">
                                                <p className="font-semibold text-slate-800">{plan.name}</p>
                                                <p className="text-xs text-slate-500">{plan.code}</p>
                                            </td>
                                            <td className="py-2.5 text-slate-700">{money(plan.price_monthly)} {plan.currency}</td>
                                            <td className="py-2.5 text-slate-700">{number(plan.duration_months)} meses</td>
                                            <td className="py-2.5 text-slate-700">{number(enabledCount)}</td>
                                            <td className="py-2.5 text-slate-700">{number(plan.active_subscribers_count)}</td>
                                            <td className="py-2.5">
                                                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${plan.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>
                                                    {plan.is_active ? 'ativo' : 'inativo'}
                                                </span>
                                            </td>
                                            <td className="py-2.5">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(plan)}
                                                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
                                                >
                                                    Editar
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </motion.section>

                <motion.section variants={staggerItem}>
                    <p className="text-xs text-slate-500">Atualizado em {new Date(generatedAt).toLocaleString()}</p>
                </motion.section>
            </motion.div>

            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="2xl">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900">Criar Plano</p>
                        <button type="button" onClick={() => setShowCreateModal(false)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100">Fechar</button>
                    </div>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <PlanFormFields
                            form={createPlanForm}
                            featureCatalog={featureCatalog}
                            durationOptions={durationOptions}
                            toggleFeature={toggleFeature}
                        />
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setShowCreateModal(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100">Cancelar</button>
                            <button type="submit" disabled={createPlanForm.processing} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60">{createPlanForm.processing ? 'A criar...' : 'Criar Plano'}</button>
                        </div>
                    </form>
                </div>
            </Modal>

            <Modal show={Boolean(editingPlan)} onClose={closeEditModal} maxWidth="2xl">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900">Editar Plano {editingPlan ? `• ${editingPlan.name}` : ''}</p>
                        <button type="button" onClick={closeEditModal} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100">Fechar</button>
                    </div>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <PlanFormFields
                            form={editForm}
                            featureCatalog={featureCatalog}
                            durationOptions={durationOptions}
                            toggleFeature={toggleFeature}
                        />
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={closeEditModal} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100">Cancelar</button>
                            <button type="submit" disabled={editForm.processing} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60">{editForm.processing ? 'A guardar...' : 'Guardar'}</button>
                        </div>
                    </form>
                </div>
            </Modal>

            <Modal show={showAssignModal} onClose={() => setShowAssignModal(false)} maxWidth="xl">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900">Atribuir Subscrição</p>
                        <button type="button" onClick={() => setShowAssignModal(false)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100">Fechar</button>
                    </div>
                    <form onSubmit={submitAssign} className="space-y-3">
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-500">Utilizador</label>
                            <select className={inputCls} value={assignForm.data.user_id} onChange={(e) => assignForm.setData('user_id', e.target.value)}>
                                <option value="">Selecionar</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>{user.name} ({user.current_plan_name})</option>
                                ))}
                            </select>
                            {assignForm.errors.user_id ? <p className="mt-1 text-xs text-rose-600">{assignForm.errors.user_id}</p> : null}
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-500">Plano</label>
                            <select className={inputCls} value={assignForm.data.subscription_plan_id} onChange={(e) => assignForm.setData('subscription_plan_id', e.target.value)}>
                                <option value="">Selecionar</option>
                                {plans.map((plan) => (
                                    <option key={plan.id} value={plan.id}>{plan.name} ({plan.duration_months} meses)</option>
                                ))}
                            </select>
                            {assignForm.errors.subscription_plan_id ? <p className="mt-1 text-xs text-rose-600">{assignForm.errors.subscription_plan_id}</p> : null}
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-500">Início</label>
                                <input className={inputCls} type="date" value={assignForm.data.started_at} onChange={(e) => assignForm.setData('started_at', e.target.value)} />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-500">Estado</label>
                                <select className={inputCls} value={assignForm.data.status} onChange={(e) => assignForm.setData('status', e.target.value)}>
                                    <option value="active">active</option>
                                    <option value="trialing">trialing</option>
                                    <option value="canceled">canceled</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setShowAssignModal(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100">Cancelar</button>
                            <button type="submit" disabled={assignForm.processing} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60">{assignForm.processing ? 'A atribuir...' : 'Atribuir'}</button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AdminLayout>
    );
}
