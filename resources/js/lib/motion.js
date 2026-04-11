export const pageTransition = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
};

export const staggerContainer = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.04,
        },
    },
};

export const staggerItem = {
    hidden: { opacity: 0, y: 12 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
    },
};

export function getPageMotionProps(reduceMotion) {
    if (reduceMotion) {
        return {
            initial: false,
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0 },
        };
    }

    return {
        initial: pageTransition.initial,
        animate: pageTransition.animate,
        transition: pageTransition.transition,
    };
}

export function getStaggerMotionProps(reduceMotion) {
    if (reduceMotion) {
        return {
            initial: false,
            animate: 'show',
            variants: {
                hidden: {},
                show: { transition: { staggerChildren: 0 } },
            },
        };
    }

    return {
        initial: 'hidden',
        animate: 'show',
        variants: staggerContainer,
    };
}
