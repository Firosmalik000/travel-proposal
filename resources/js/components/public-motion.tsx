import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';

// Public animations should repeat, but we tune the viewport so it doesn't rapidly
// toggle enter/leave (which causes jank). Higher amount + negative bottom margin
// means it must be more "in view" before playing again.
export const publicViewport = {
    once: false,
    amount: 0.6,
    margin: '0px 0px -34% 0px',
};

export const publicSectionVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 12,
    },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.38,
            ease: [0.16, 1, 0.3, 1],
        },
    },
};

export const publicStaggerVariants: Variants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.02,
        },
    },
};

export const publicCardVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 10,
    },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.32,
            ease: [0.16, 1, 0.3, 1],
        },
    },
};

export function MotionSection(props: HTMLMotionProps<'section'>) {
    const { className, ...rest } = props;

    return (
        <motion.section
            initial="hidden"
            whileInView="show"
            viewport={publicViewport}
            variants={publicSectionVariants}
            className={['transform-gpu', className].filter(Boolean).join(' ')}
            {...rest}
        />
    );
}

export function MotionGroup(props: HTMLMotionProps<'div'>) {
    return (
        <motion.div
            initial="hidden"
            whileInView="show"
            viewport={publicViewport}
            variants={publicStaggerVariants}
            {...props}
        />
    );
}

export function MotionCard(props: HTMLMotionProps<'div'>) {
    const { className, ...rest } = props;

    return (
        <motion.div
            variants={publicCardVariants}
            className={['transform-gpu', className].filter(Boolean).join(' ')}
            {...rest}
        />
    );
}
