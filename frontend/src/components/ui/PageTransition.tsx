import { motion, useReducedMotion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
}

const variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

export function PageTransition({ children }: PageTransitionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: 'easeInOut' }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}
