import { AnimatePresence, motion } from 'motion/react';
import { useState, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function MorphingDialog({
  trigger,
  title,
  children,
  className,
}: {
  trigger: ReactNode;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className={cn(className)} onClick={() => setOpen(true)}>
        {trigger}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(5,3,21,0.45)] p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal
              aria-label={title}
              className="w-full max-w-lg rounded-2xl border border-[var(--scas-border)] bg-[var(--scas-surface)] p-6 shadow-xl"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-start justify-between gap-4">
                <h3 className="font-display text-xl font-semibold text-[var(--scas-text)]">{title}</h3>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full px-2 py-1 text-sm text-[var(--scas-text-muted)] hover:bg-[var(--scas-secondary)]"
                >
                  Close
                </button>
              </div>
              <div className="text-sm leading-relaxed text-[var(--scas-text-muted)]">{children}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
