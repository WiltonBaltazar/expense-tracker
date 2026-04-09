import { router, usePage } from '@inertiajs/react';

export default function MonthSelector({ currentMonth, routeName, className = '' }) {
    const { auth } = usePage().props;
    const [year, month] = currentMonth.split('-').map(Number);

    function navigate(offset) {
        const date = new Date(year, month - 1 + offset, 1);
        const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        router.get(route(routeName), { month: newMonth }, { preserveState: true });
    }

    const label = new Date(year, month - 1).toLocaleDateString('pt-BR', {
        month: 'long', year: 'numeric',
    });

    const isCurrentMonth = (() => {
        const now = new Date();
        return year === now.getFullYear() && month === now.getMonth() + 1;
    })();

    const isFirstMonth = (() => {
        if (!auth.subscription_start_month) return false;
        const [subYear, subMonth] = auth.subscription_start_month.split('-').map(Number);
        return year === subYear && month === subMonth;
    })();

    const btnBase = {
        width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '8px', background: '#ffffff', border: '1px solid rgba(0,0,0,0.09)',
        color: '#a39888', cursor: 'pointer', transition: 'all 0.15s',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)', flexShrink: 0,
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className={className}>
            <button
                onClick={() => navigate(-1)}
                disabled={isFirstMonth}
                style={{ ...btnBase, opacity: isFirstMonth ? 0.3 : 1, cursor: isFirstMonth ? 'not-allowed' : 'pointer' }}
                onMouseEnter={(e) => { if (!isFirstMonth) { e.currentTarget.style.color = '#1c1812'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.18)'; }}}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#a39888'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.09)'; }}
            >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>

            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1c1812', minWidth: '140px', textAlign: 'center', textTransform: 'capitalize', fontFamily: 'DM Mono, monospace' }}>
                {label}
            </span>

            <button
                onClick={() => navigate(1)}
                disabled={isCurrentMonth}
                style={{ ...btnBase, opacity: isCurrentMonth ? 0.3 : 1, cursor: isCurrentMonth ? 'not-allowed' : 'pointer' }}
                onMouseEnter={(e) => { if (!isCurrentMonth) { e.currentTarget.style.color = '#1c1812'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.18)'; }}}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#a39888'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.09)'; }}
            >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
            </button>
        </div>
    );
}
