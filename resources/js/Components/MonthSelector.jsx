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

    return (
        <div className={`flex items-center gap-1.5 ${className}`}>
            <button
                onClick={() => navigate(-1)}
                disabled={isFirstMonth}
                className={`w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-black/8 text-gray-400 transition-all hover:text-gray-800 hover:border-black/20 shadow-sm ${isFirstMonth ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>

            <span className="font-mono text-[12.5px] font-semibold text-gray-700 min-w-[130px] text-center capitalize">
                {label}
            </span>

            <button
                onClick={() => navigate(1)}
                disabled={isCurrentMonth}
                className={`w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-black/8 text-gray-400 transition-all hover:text-gray-800 hover:border-black/20 shadow-sm ${isCurrentMonth ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
            </button>
        </div>
    );
}
