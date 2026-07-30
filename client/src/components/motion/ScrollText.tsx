import {
  useLayoutEffect,
  useRef,
  type ElementType,
  type ReactNode,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

/**
 * Reveal de titulo linha por linha, saindo de uma mascara.
 *
 * POR QUE SplitText E NAO O SplitReveal DA CASA:
 *
 * O SplitReveal quebra por palavra a partir de uma string. Aqui os titulos
 * carregam grifo dentro da frase (um trecho em branco, o resto em cinza), e
 * quebrar isso a mao significaria remontar o JSX em pedacos. O SplitText opera
 * sobre o DOM ja renderizado, entao o grifo continua sendo JSX normal e o corte
 * por LINHA acompanha a quebra real do texto em cada largura de tela.
 *
 * `mask: "lines"` e do proprio plugin: ele embrulha cada linha num elemento com
 * overflow escondido, que e o que faz a linha parecer emergir de baixo da linha
 * de base em vez de simplesmente deslizar na tela.
 *
 * O split espera `document.fonts.ready`. Medir linha antes da fonte carregar
 * gera quebra na posicao errada, e a mascara congela essa medida errada.
 */
export function SplitLines({
  children,
  className,
  as: Tag = "h2",
  start = "top 82%",
  stagger = 0.085,
  delay = 0,
  duration = 1,
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  start?: string;
  stagger?: number;
  delay?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Movimento reduzido: fade curto no bloco inteiro, sem split nem mascara.
    if (reduceMotion) {
      const ctx = gsap.context(() => {
        gsap.from(el, {
          opacity: 0,
          duration: 0.4,
          delay,
          scrollTrigger: { trigger: el, start, once: true },
        });
      }, el);
      return () => ctx.revert();
    }

    let ctx: gsap.Context | undefined;
    let split: SplitText | undefined;
    let cancelled = false;
    /*
      autoSplit refaz o split quando a largura muda, e o onSplit roda de novo
      junto. Sem esta trava, redimensionar a janela recriaria o tween de entrada
      e um titulo que o usuario ja leu voltaria a animar do zero. Depois da
      primeira revelacao o re-split apenas remonta as linhas, ja visiveis.
    */
    let revealed = false;

    document.fonts.ready.then(() => {
      if (cancelled || !ref.current) return;

      ctx = gsap.context(() => {
        split = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          onSplit: (self) => {
            if (revealed) return;
            return gsap.from(self.lines, {
              yPercent: 115,
              opacity: 0,
              duration,
              delay,
              ease: "power3.out",
              stagger,
              scrollTrigger: {
                trigger: el,
                start,
                once: true,
                onEnter: () => {
                  revealed = true;
                },
              },
            });
          },
        });
      }, el);
    });

    return () => {
      cancelled = true;
      split?.revert();
      ctx?.revert();
    };
  }, [start, stagger, delay, duration]);

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  );
}

/**
 * Texto que acende palavra por palavra conforme a pagina rola.
 *
 * As palavras comecam apagadas e ganham cor no ritmo do scroll, entao o leitor
 * avanca na frase junto com o dedo. E o efeito que sustenta as frases longas da
 * referencia sem precisar de imagem ao lado.
 *
 * O grifo continua sendo JSX: quem quiser destacar um trecho usa
 * `className="text-brand"` no span, e este componente so mexe em opacidade.
 * Por isso a animacao NAO toca `color` — mexer na cor apagaria o grifo.
 */
export function ScrubWords({
  children,
  className,
  as: Tag = "h2",
  dim = 0.14,
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** Opacidade da palavra ainda nao lida. */
  dim?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ctx: gsap.Context | undefined;
    let split: SplitText | undefined;
    let cancelled = false;

    document.fonts.ready.then(() => {
      if (cancelled || !ref.current) return;

      ctx = gsap.context(() => {
        split = SplitText.create(el, {
          type: "words",
          wordsClass: "scrub-word",
          autoSplit: true,
          onSplit: (self) => {
            gsap.set(self.words, { opacity: dim });
            return gsap.to(self.words, {
              opacity: 1,
              ease: "none",
              stagger: 1,
              scrollTrigger: {
                trigger: el,
                start: "top 78%",
                end: "bottom 55%",
                scrub: 0.4,
              },
            });
          },
        });
      }, el);
    });

    return () => {
      cancelled = true;
      split?.revert();
      ctx?.revert();
    };
  }, [dim]);

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  );
}

/*
  NAO existe um Counter aqui de proposito.

  A referencia ancora varias secoes em numeros que sobem ao entrar na tela, e o
  primitivo para isso e trivial de escrever. O que falta nao e o codigo: e o
  numero. Enquanto nao houver dado proprio para citar, um contador nesta pagina
  so poderia exibir estatistica inventada - o que o brand.ts proibe. Quando o
  dado real existir, este e o arquivo onde o componente entra.
*/
