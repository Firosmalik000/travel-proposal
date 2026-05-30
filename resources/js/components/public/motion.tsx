import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';

// Public animations should repeat, and should trigger as soon as content starts
// entering the viewport (especially on mobile). We also add a generous positive
// bottom rootMargin so IntersectionObserver doesn't miss tall sections/cards.
export const publicViewport = {
    once: false,
    amount: 0.15,
    margin: '12% 0px 30% 0px',
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
