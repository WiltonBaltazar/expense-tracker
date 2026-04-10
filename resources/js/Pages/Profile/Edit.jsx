import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-[17px] font-bold text-gray-900 tracking-tight">Perfil</h2>}
        >
            <Head title="Perfil" />

            <div className="max-w-[700px] mx-auto px-5 sm:px-6 lg:px-8 py-6 pb-12 space-y-4">
                <div className="bg-white rounded-xl border border-black/7 shadow-sm p-6">
                    <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                </div>
                <div className="bg-white rounded-xl border border-black/7 shadow-sm p-6">
                    <UpdatePasswordForm />
                </div>
                <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
                    <DeleteUserForm />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
