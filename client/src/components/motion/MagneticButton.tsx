import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Botao magnetico: o elemento e puxado na direcao do cursor conforme ele se
 * aproxima, e volta com mola quando o ponteiro sai.
 *
 * A posicao vive inteiramente em motion values. Se isso passasse por useState,
 * a arvore do React re-renderizaria a cada movimento do mouse e a interacao
 * engasgaria, que e exatamente o erro que essa tecnica costuma trazer junto.
 */
export function MagneticButton({
  children,
  href,
  className,
  strength = 0.35,
  onClick,
}: {
  children: ReactNode;
  href?: string;
  className?: string;
  /** 0 a 1: quanto o botao acompanha o cursor. */
  strength?: number;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spring = { stiffness: 220, damping: 18, mass: 0.6 };
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);

  // O conteudo desliza um pouco menos que o botao: da profundidade ao gesto.
  const innerX = useTransform(sx, (v) => v * 0.35);
  const innerY = useTransform(sy, (v) => v * 0.35);

  const handleMove = (event: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = event.clientX - (rect.left + rect.width / 2);
    const relY = event.clientY - (rect.top + rect.height / 2);
    x.set(relX * strength);
    y.set(relY * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const Component = href ? motion.a : motion.button;

  return (
    <Component
      ref={ref}
      href={href}
      onClick={onClick}
      type={href ? undefined : "button"}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.97 }}
      className={cn("relative inline-flex items-center justify-center", className)}
    >
      <motion.span
        style={{ x: innerX, y: innerY }}
        className="inline-flex items-center gap-2 whitespace-nowrap"
      >
        {children}
      </motion.span>
    </Component>
  );
}
