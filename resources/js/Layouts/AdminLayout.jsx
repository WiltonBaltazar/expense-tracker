import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { getPageMotionProps } from '@/lib/motion';
import { useMotionPreference } from '@/contexts/MotionPreferenceContext';

function GridIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h3A2.25 2.25 0 0111.25 6v3A2.25 2.25 0 019 11.25H6A2.25 2.25 0 013.75 9V6zM12.75 6A2.25 2.25 0 0115 3.75h3A2.25 2.25 0 0120.25 6v3A2.25 2.25 0 0118 11.25h-3A2.25 2.25 0 0112.75 9V6zM3.75 15A2.25 2.25 0 016 12.75h3A2.25 2.25 0 0111.25 15v3A2.25 2.25 0 019 20.25H6A2.25 2.25 0 013.75 18v-3zM12.75 15A2.25 2.25 0 0115 12.75h3A2.25 2.25 0 0120.25 15v3A2.25 2.25 0 0118 20.25h-3A2.25 2.25 0 0112.75 18v-3z" />
        </svg>
    );
}

function ChartIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v16.5h16.5M7.5 15.75l3.25-3.25 2.5 2.5 4.5-5.5" />
        </svg>
    );
}

function UsersIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 20.25v-1.5A3.75 3.75 0 0012.75 15h-4.5a3.75 3.75 0 00-3.75 3.75v1.5M15 6.75a3 3 0 11-6 0 3 3 0 016 0zM18.75 8.25a2.25 2.25 0 110 4.5M20.25 20.25v-1.5A3.75 3.75 0 0017.25 15.1" />
        </svg>
    );
}

function CreditCardIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7.5h16.5M3.75 10.5h16.5M5.25 18.75h13.5A1.5 1.5 0 0020.25 17.25V6.75A1.5 1.5 0 0018.75 5.25H5.25a1.5 1.5 0 00-1.5 1.5v10.5a1.5 1.5 0 001.5 1.5z" />
        </svg>
    );
}

function LayersIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8.25 4.5L12 12 3.75 7.5 12 3zM3.75 12l8.25 4.5L20.25 12M3.75 16.5L12 21l8.25-4.5" />
        </svg>
    );
}

const NAV_ITEMS = [
    { label: 'Visão Geral', href: 'admin.dashboard', match: 'admin.dashboard', icon: GridIcon },
    { label: 'Analytics', href: 'admin.analytics', match: 'admin.analytics', icon: ChartIcon },
    { label: 'Utilizadores', href: 'admin.customers.index', match: 'admin.customers.*', icon: UsersIcon },
    { label: 'Subscrições', href: 'admin.subscriptions.index', match: 'admin.subscriptions.*', icon: CreditCardIcon },
    { label: 'Planos', href: 'admin.plans.index', match: 'admin.plans.*', icon: LayersIcon },
    { label: 'Admin Users', href: 'admin.users.index', match: 'admin.users.*', icon: UsersIcon },
];

function AppIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.44 1.153-.44 1.593 0L21.75 12M4.5 9.75V19.5A2.25 2.25 0 006.75 21.75h10.5a2.25 2.25 0 002.25-2.25V9.75" />
        </svg>
    );
}

export default function AdminLayout({ title, subtitle, adminDomain, children }) {
    const page = usePage();
    const user = page.props.auth.user;
    const { reduceMotion } = useMotionPreference();
    const pageMotion = getPageMotionProps(reduceMotion);
    const initial = user?.name?.charAt(0)?.toUpperCase() ?? 'A';

    const isActiveRoute = (match) => {
        if (typeof route !== 'undefined') {
            try {
                return route().current(match);
            } catch (_) {
                // Fallback below
            }
        }

        const pathname = page?.url?.split('?')[0] || '';
        const base = match.replace('.*', '');

        if (match.includes('.*')) {
            return pathname.includes(base);
        }

        return pathname === `/${base}`;
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <div className="flex min-h-screen">
                <aside className="hidden lg:flex lg:w-[280px] lg:flex-col lg:bg-slate-950 lg:text-slate-200">
                    <div className="border-b border-slate-800 px-6 py-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300">
                                <GridIcon />
                            </div>
                            <div>
                                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">TailAdmin</p>
                                <p className="text-lg font-semibold text-white">FinTrack SaaS</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 px-4 py-5">
                        <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Admin Menu</p>
                        <div className="space-y-1">
                            {NAV_ITEMS.map((item) => {
                                const active = isActiveRoute(item.match);

                                return (
                                    <Link
                                        key={item.href}
                                        href={route(item.href)}
                                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active
                                            ? 'bg-indigo-500/20 text-indigo-200'
                                            : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                                        }`}
                                    >
                                        <item.icon />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    <div className="border-t border-slate-800 p-4">
                        <Link
                            href={route('dashboard')}
                            className="mb-3 flex items-center gap-3 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
                        >
                            <AppIcon />
                            Voltar ao FinTrack
                        </Link>

                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="w-full rounded-xl border border-slate-700 bg-transparent px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:border-red-400/50 hover:text-red-300"
                        >
                            Terminar sessão
                        </Link>
                    </div>
                </aside>

                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
                        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                            <div className="min-w-0">
                                <p className="truncate text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Super Admin</p>
                                <h1 className="truncate text-xl font-semibold text-slate-900">{title}</h1>
                                {subtitle ? <p className="truncate text-sm text-slate-500">{subtitle}</p> : null}
                            </div>

                            <div className="flex items-center gap-3">
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700"
                                >
                                    <AppIcon />
                                    <span className="hidden sm:inline">FinTrack</span>
                                </Link>

                                <span className="hidden rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 sm:inline-flex">
                                    {adminDomain || 'wiltonvm.click'}
                                </span>

                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                                    {initial}
                                </div>
                            </div>
                        </div>
                    </header>

                    <motion.main
                        key={page?.url || 'admin-page'}
                        initial={pageMotion.initial}
                        animate={pageMotion.animate}
                        transition={pageMotion.transition}
                        className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-5 sm:px-6 lg:px-8"
                    >
                        {children}
                    </motion.main>
                </div>
            </div>
        </div>
    );
}
