import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

type Preset = 'blur' | 'fade-in-blur' | 'fade' | 'slide';

export function TextEffect({
  children,
  className,
  as: Tag = 'p',
  per = 'word',
  preset = 'fade-in-blur',
  delay = 0,
}: {
  children: string;
  className?: string;
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'span' | 'div';
  per?: 'word' | 'char';
  preset?: Preset;
  delay?: number;
}) {
  const segments =
    per === 'char'
      ? children.split('')
      : children.split(/(\s+)/).filter((s) => s.length > 0);

  const itemHidden =
    preset === 'blur'
      ? { opacity: 0, filter: 'blur(10px)' }
      : preset === 'fade-in-blur'
        ? { opacity: 0, y: 18, filter: 'blur(10px)' }
        : preset === 'slide'
          ? { opacity: 0, y: 16 }
          : { opacity: 0 };

  const itemVisible =
    preset === 'blur'
      ? { opacity: 1, filter: 'blur(0px)' }
      : preset === 'fade-in-blur'
        ? { opacity: 1, y: 0, filter: 'blur(0px)' }
        : preset === 'slide'
          ? { opacity: 1, y: 0 }
          : { opacity: 1 };

  const MotionTag = motion[Tag] as typeof motion.p;

  return (
    <MotionTag
      className={cn(className)}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: per === 'char' ? 0.02 : 0.045,
            delayChildren: delay,
          },
        },
      }}
    >
      {segments.map((segment, i) => (
        <motion.span
          key={`${segment}-${i}`}
          className="inline-block whitespace-pre"
          variants={{
            hidden: itemHidden,
            visible: {
              ...itemVisible,
              transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          {segment}
        </motion.span>
      ))}
    </MotionTag>
  );
}
