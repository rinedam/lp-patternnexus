import React, { useRef, useState, useCallback, useEffect } from "react";
import { motion, useSpring, useTransform, type SpringOptions } from "framer-motion";
import { cn } from "@/lib/utils";

type SpotlightProps = {
  className?: string;
  size?: number;
  springOptions?: SpringOptions;
  /**
   * Cor do foco. O componente original nao expunha isto, mas o exemplo de uso
   * passava `fill`, entao a prop existe para os dois casarem.
   */
  fill?: string;
};

/**
 * Foco de luz que segue o cursor dentro do elemento pai.
 *
 * Duas correcoes em relacao a versao de origem:
 *
 * 1. O cleanup registrava arrow functions novas em removeEventListener, que
 *    nunca batem com as que foram adicionadas. Os listeners de mouseenter e
 *    mouseleave vazavam a cada montagem. Agora as referencias sao estaveis.
 * 2. O gradiente era fixo em tons de zinco, pensado para tema claro. Aqui ele
 *    aceita cor e usa a da marca por padrao.
 */
export function Spotlight({
  className,
  size = 200,
  springOptions = { bounce: 0 },
  fill = "var(--brand)",
}: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [parentElement, setParentElement] = useState<HTMLElement | null>(null);

  const mouseX = useSpring(0, springOptions);
  const mouseY = useSpring(0, springOptions);

  const spotlightLeft = useTransform(mouseX, (x) => `${x - size / 2}px`);
  const spotlightTop = useTransform(mouseY, (y) => `${y - size / 2}px`);

  useEffect(() => {
    if (!containerRef.current) return;
    const parent = containerRef.current.parentElement;
    if (!parent) return;

    /*
      Terceira correcao em relacao a versao de origem, e a mais perigosa das
      tres: o original sobrescrevia position e overflow do pai sem perguntar.

      Isso quebrava qualquer pai que ja dependesse do proprio position. Um painel
      `sticky` virava `relative` e parava de grudar; e um elemento pinado pelo
      GSAP, que usa position: fixed, teria o pin desfeito. So mexemos quando o
      valor atual e o padrao e nao vai atropelar ninguem.
    */
    const computed = getComputedStyle(parent);
    if (computed.position === "static") parent.style.position = "relative";
    if (computed.overflow === "visible") parent.style.overflow = "hidden";

    setParentElement(parent);
  }, []);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!parentElement) return;
      const { left, top } = parentElement.getBoundingClientRect();
      mouseX.set(event.clientX - left);
      mouseY.set(event.clientY - top);
    },
    [mouseX, mouseY, parentElement],
  );

  useEffect(() => {
    if (!parentElement) return;

    // Referencias nomeadas: sem isto o cleanup nao remove nada.
    const onEnter = () => setIsHovered(true);
    const onLeave = () => setIsHovered(false);

    parentElement.addEventListener("mousemove", handleMouseMove);
    parentElement.addEventListener("mouseenter", onEnter);
    parentElement.addEventListener("mouseleave", onLeave);

    return () => {
      parentElement.removeEventListener("mousemove", handleMouseMove);
      parentElement.removeEventListener("mouseenter", onEnter);
      parentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [parentElement, handleMouseMove]);

  return (
    <motion.div
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute rounded-full blur-3xl transition-opacity duration-300",
        isHovered ? "opacity-100" : "opacity-0",
        className,
      )}
      style={{
        width: size,
        height: size,
        left: spotlightLeft,
        top: spotlightTop,
        background: `radial-gradient(circle at center, ${fill}, transparent 70%)`,
      }}
    />
  );
}
