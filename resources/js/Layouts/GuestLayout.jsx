import { Link } from '@inertiajs/react';

const WalletIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
);

export default function GuestLayout({ children }) {
    return (
        <div style={{ minHeight: '100vh', background: '#f7f4ee', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
            {/* Atmospheric warmth */}
            <div style={{ position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(184,121,10,0.07), transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-40px', right: '0', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(13,148,136,0.05), transparent 70%)', pointerEvents: 'none' }} />

            {/* Logo */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '32px', position: 'relative' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #b8790a, #7c4f06)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(184,121,10,0.25)' }}>
                    <WalletIcon />
                </div>
                <span style={{ fontSize: '20px', fontWeight: 700, color: '#1c1812', fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.01em' }}>FinTrack</span>
            </Link>

            {/* Card */}
            <div style={{ width: '100%', maxWidth: '420px', background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '24px', padding: '36px', position: 'relative', boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' }}>
                {children}
            </div>
        </div>
    );
}
