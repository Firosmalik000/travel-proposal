import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';

export const publicViewport = { once: false, amount: 0.18 };

export const publicSectionVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 32,
    },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.55,
            ease: [0.16, 1, 0.3, 1],
        },
    },
};

export const publicStaggerVariants: Variants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.04,
        },
    },
};

export const publicCardVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 26,
        scale: 0.97,
    },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.48,
            ease: [0.16, 1, 0.3, 1],
        },
    },
};

export function MotionSection(props: HTMLMotionProps<'section'>) {
    return (
        <motion.section
            initial="hidden"
            whileInView="show"
            viewport={publicViewport}
            variants={publicSectionVariants}
            {...props}
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
    return <motion.div variants={publicCardVariants} {...props} />;
}
