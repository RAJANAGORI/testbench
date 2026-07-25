import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

export function TextLoop({
  texts,
  className,
  interval = 2200,
}: {
  texts: string[];
  className?: string;
  interval?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % texts.length);
    }, interval);
    return () => window.clearInterval(id);
  }, [texts.length, interval]);

  return (
    <span className={cn('relative inline-grid', className)}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={texts[index]}
          initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
          transition={{ duration: 0.35 }}
          className="col-start-1 row-start-1"
        >
          {texts[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
