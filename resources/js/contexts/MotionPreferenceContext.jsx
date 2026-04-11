import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'fintrack.reduce-motion';

const MotionPreferenceContext = createContext({
    reduceMotion: false,
    setReduceMotion: () => {},
});

function readInitialPreference() {
    if (typeof window === 'undefined') {
        return false;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') return true;
    if (stored === 'false') return false;

    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export function MotionPreferenceProvider({ children }) {
    const [reduceMotion, setReduceMotion] = useState(readInitialPreference);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        window.localStorage.setItem(STORAGE_KEY, String(reduceMotion));
        document.documentElement.dataset.motion = reduceMotion ? 'reduce' : 'full';
    }, [reduceMotion]);

    const value = useMemo(() => ({ reduceMotion, setReduceMotion }), [reduceMotion]);

    return (
        <MotionPreferenceContext.Provider value={value}>
            {children}
        </MotionPreferenceContext.Provider>
    );
}

export function useMotionPreference() {
    return useContext(MotionPreferenceContext);
}
