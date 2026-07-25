import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

const CHARS = '!<>-_\\/[]{}—=+*^?#________';

export function TextScramble({
  children,
  className,
  duration = 1.1,
  as: Tag = 'span',
}: {
  children: string;
  className?: string;
  duration?: number;
  as?: 'span' | 'h1' | 'h2' | 'p';
}) {
  const [display, setDisplay] = useState(children);

  useEffect(() => {
    let frame = 0;
    const total = Math.max(12, Math.floor(duration * 40));
    const id = window.setInterval(() => {
      frame += 1;
      const progress = frame / total;
      setDisplay(
        children
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' ';
            if (i / children.length < progress) return children[i];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join(''),
      );
      if (frame >= total) {
        window.clearInterval(id);
        setDisplay(children);
      }
    }, 28);
    return () => window.clearInterval(id);
  }, [children, duration]);

  return <Tag className={cn(className)}>{display}</Tag>;
}
