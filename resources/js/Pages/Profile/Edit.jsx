import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    const section = {
        background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.07)',
        borderRadius: '20px',
        padding: '28px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', fontWeight: 700, color: '#1c1812' }}>
                    Perfil
                </h2>
            }
        >
            <Head title="Perfil" />

            <div style={{ padding: '32px 0 60px' }}>
                <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={section}>
                        <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                    </div>
                    <div style={section}>
                        <UpdatePasswordForm />
                    </div>
                    <div style={{ ...section, border: '1px solid rgba(220,38,38,0.15)' }}>
                        <DeleteUserForm />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
