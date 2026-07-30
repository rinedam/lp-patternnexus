import { Fragment, useLayoutEffect, useMemo, useRef, type ElementType } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GlitchWord } from "@/components/motion/GlitchWord";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Revelacao de titulo palavra por palavra, com mascara.
 *
 * Cada palavra sobe de dentro de uma faixa que a corta, o que da a sensacao de
 * texto sendo impresso em vez de simplesmente aparecer. E feito na mao porque o
 * SplitText do GSAP e plugin pago do Club.
 *
 * Acessibilidade: o container carrega o texto completo em aria-label e os
 * pedacos ficam aria-hidden, entao leitores de tela leem a frase inteira e nao
 * uma palavra solta por vez.
 */
export function SplitReveal({
  text,
  as: Tag = "h2",
  className,
  delay = 0,
  stagger = 0.055,
  trigger = "scroll",
  highlight,
  morph,
  play = true,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
  /** "load" anima assim que monta, "scroll" espera entrar na viewport. */
  trigger?: "load" | "scroll";
  /** Palavras que recebem a cor da marca. */
  highlight?: string[];
  /**
   * Uma palavra da frase que alterna com outra grafia, em glitch.
   * `word` precisa bater com a palavra como ela aparece em `text`.
   */
  morph?: { word: string; to: string };
  /**
   * Segura a animacao de "load" ate o momento certo. O hero usa isto para so
   * comecar depois que a intro sai, senao a entrada acontece atras da cortina.
   */
  play?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const words = useMemo(() => text.split(" "), [text]);
  const highlightSet = useMemo(
    () => new Set((highlight ?? []).map((w) => w.toLowerCase())),
    [highlight],
  );

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = el.querySelectorAll<HTMLElement>("[data-word]");

    const ctx = gsap.context(() => {
      /*
        Movimento reduzido nao significa pagina morta. O deslocamento vertical
        e o que incomoda quem tem sensibilidade vestibular, entao ele sai; a
        revelacao em si continua acontecendo, em opacidade e mais rapida.
      */
      gsap.set(targets, {
        yPercent: reduceMotion ? 0 : 118,
        opacity: 0,
      });

      // Modo "load" segurado: mantem escondido ate play virar true.
      if (trigger === "load" && !play) return;

      gsap.to(targets, {
        yPercent: 0,
        opacity: 1,
        duration: reduceMotion ? 0.4 : 0.9,
        ease: reduceMotion ? "power1.out" : "expo.out",
        stagger: reduceMotion ? stagger * 0.4 : stagger,
        delay: trigger === "load" ? delay : 0,
        scrollTrigger:
          trigger === "scroll"
            ? { trigger: el, start: "top 85%", once: true }
            : undefined,
      });
    }, el);

    return () => ctx.revert();
  }, [text, delay, stagger, trigger, play]);

  return (
    <Tag ref={ref} className={cn(className)} aria-label={text}>
      {words.map((word, i) => {
        const bare = word.toLowerCase().replace(/[.,:;!?]/g, "");
        const isMorph = morph != null && bare === morph.word.toLowerCase();

        return (
          <Fragment key={`${word}-${i}`}>
            {/*
              A mascara recorta a palavra durante a subida.

              Detalhes que importam e ja causaram bug:
              - inline-block, nao inline-flex. O inline-flex vira caixa atomica e
                desregula a altura da linha, o que cortava as ultimas linhas do
                titulo no mobile.
              - o par pb / -mb abre espaco para descendentes e acentos sem alterar
                a altura final ocupada pelo texto.
              - o par px / -mx faz o mesmo na horizontal, e so na palavra que tem
                glitch: sem essa folga o overflow-hidden cortaria os ecos
                deslocados, que e justamente o efeito.
              - o espaco entre palavras e um no de texto comum FORA da mascara,
                para a quebra de linha acontecer naturalmente entre as palavras.
            */}
            <span
              aria-hidden="true"
              className={cn(
                "inline-block overflow-hidden pb-[0.18em] align-bottom -mb-[0.18em]",
                isMorph && "px-[0.14em] -mx-[0.14em]",
              )}
            >
              <span
                data-word
                className={cn(
                  "inline-block will-change-transform",
                  highlightSet.has(bare) && "text-brand",
                )}
              >
                {isMorph ? (
                  <GlitchWord from={word} to={morph.to} play={play} />
                ) : (
                  word
                )}
              </span>
            </span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        );
      })}
    </Tag>
  );
}
