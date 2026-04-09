import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';

const NAV_ITEMS = [
    { name: 'painel',   label: 'Painel',    href: 'dashboard',     match: 'dashboard'   },
    { name: 'rendas',   label: 'Rendas',    href: 'incomes.index', match: 'incomes.*'   },
    { name: 'despesas', label: 'Despesas',  href: 'expenses.index',match: 'expenses.*'  },
    { name: 'metas',    label: 'Metas',     href: 'goals.index',   match: 'goals.*'     },
    { name: 'ajustes',  label: 'Ajustes',   href: 'settings.edit', match: 'settings.*'  },
];

const NAV_ICONS = {
    painel: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
    ),
    rendas: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    despesas: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
        </svg>
    ),
    metas: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        </svg>
    ),
    ajustes: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
};

const WalletIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
);

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    return (
        <div style={{ minHeight: '100vh', background: '#f7f4ee' }} className="pb-20 sm:pb-0">

            {/* ── Desktop nav ── */}
            <nav className="hidden sm:block" style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(247,244,238,0.92)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Logo + links */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
                        <Link href={route('dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #b8790a, #7c4f06)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(184,121,10,0.2)', flexShrink: 0 }}>
                                <WalletIcon />
                            </div>
                            <span style={{ fontSize: '17px', fontWeight: 700, color: '#1c1812', letterSpacing: '-0.01em' }}>FinTrack</span>
                        </Link>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            {NAV_ITEMS.map((item) => {
                                const active = route().current(item.match);
                                return (
                                    <Link
                                        key={item.name}
                                        href={route(item.href)}
                                        style={{
                                            padding: '6px 14px', borderRadius: '10px', fontSize: '14px', fontWeight: 500,
                                            textDecoration: 'none', transition: 'all 0.15s',
                                            color: active ? '#b8790a' : '#6b6458',
                                            background: active ? 'rgba(184,121,10,0.08)' : 'transparent',
                                        }}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* User menu */}
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '10px', background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'DM Sans, sans-serif', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(184,121,10,0.12)', border: '1px solid rgba(184,121,10,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#b8790a' }}>{user.name.charAt(0).toUpperCase()}</span>
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 500, color: '#6b6458' }}>{user.name}</span>
                                <svg style={{ width: '14px', height: '14px', color: '#a39888', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </button>
                        </Dropdown.Trigger>
                        <Dropdown.Content>
                            <Dropdown.Link href={route('profile.edit')}>Perfil</Dropdown.Link>
                            <Dropdown.Link href={route('logout')} method="post" as="button">Sair</Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </nav>

            {/* ── Mobile top bar ── */}
            <div className="sm:hidden" style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(247,244,238,0.92)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                <div style={{ height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
                    <Link href={route('dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #b8790a, #7c4f06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <WalletIcon />
                        </div>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#1c1812' }}>FinTrack</span>
                    </Link>
                    <Link href={route('profile.edit')} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(184,121,10,0.1)', border: '1px solid rgba(184,121,10,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#b8790a' }}>{user.name.charAt(0).toUpperCase()}</span>
                    </Link>
                </div>
            </div>

            {/* ── Page header ── */}
            {header && (
                <header style={{ background: '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px' }} className="sm:px-8 sm:py-5">
                        {header}
                    </div>
                </header>
            )}

            {/* ── Content ── */}
            <main>{children}</main>

            {/* ── Mobile bottom nav ── */}
            <nav className="sm:hidden pb-safe" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(247,244,238,0.97)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
                <div style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 4px' }}>
                    {NAV_ITEMS.map((item) => {
                        const active = route().current(item.match);
                        return (
                            <Link
                                key={item.name}
                                href={route(item.href)}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px', flex: 1, textDecoration: 'none', color: active ? '#b8790a' : '#a39888', transition: 'color 0.15s', minHeight: '44px' }}
                            >
                                {NAV_ICONS[item.name]}
                                <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.02em' }}>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
