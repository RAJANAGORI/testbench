import { motion, useInView, useSpring, useTransform } from 'motion/react';
import { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

export function AnimatedNumber({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const spring = useSpring(0, { stiffness: 70, damping: 18 });
  const display = useTransform(spring, (v) => Math.round(v).toString());

  useEffect(() => {
    if (inView) spring.set(value);
  }, [inView, spring, value]);

  return <motion.span ref={ref} className={cn(className)}>{display}</motion.span>;
}
