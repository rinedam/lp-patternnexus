import { useLayoutEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Entrada em cascata dos filhos diretos quando a secao chega na viewport.
 *
 * Existe para que nenhuma secao apareca pronta na tela. O deslocamento e curto
 * de proposito: o objetivo e dar ritmo de leitura, nao fazer o conteudo voar.
 */
export function Reveal({
  children,
  className,
  stagger = 0.09,
  y = 26,
  start = "top 82%",
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
  start?: string;
  delay?: number;
  /**
   * Permite virar ul, ol ou section, para escalonar os proprios itens da lista
   * sem inserir uma div extra entre a lista e seus filhos, o que quebraria a
   * semantica de lista para leitores de tela.
   */
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const targets = Array.from(el.children);
      if (targets.length === 0) return;

      // Sob movimento reduzido a entrada vira fade puro, sem deslocamento.
      gsap.set(targets, { opacity: 0, y: reduceMotion ? 0 : y });
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: reduceMotion ? 0.4 : 0.85,
        ease: reduceMotion ? "power1.out" : "power3.out",
        stagger: reduceMotion ? stagger * 0.4 : stagger,
        delay,
        scrollTrigger: { trigger: el, start, once: true },
      });
    }, el);

    return () => ctx.revert();
  }, [stagger, y, start, delay]);

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  );
}

/**
 * Parallax vertical ligado ao scroll.
 *
 * `speed` positivo faz o elemento subir mais devagar que a pagina, criando
 * profundidade entre camadas de uma mesma secao.
 */
export function Parallax({
  children,
  className,
  speed = 0.18,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        yPercent: -speed * 100,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [speed]);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
