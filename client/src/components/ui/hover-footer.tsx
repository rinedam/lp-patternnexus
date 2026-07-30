import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/*
  Sistema de coordenadas do desenho. Tudo aqui - posicao da mascara, raio,
  espessura de traco - fala em unidades de viewBox, para o efeito nao mudar de
  proporcao conforme a largura do container.
*/
const VIEW_W = 640;
const VIEW_H = 130;

/**
 * Raio da poca de luz, em unidades de viewBox.
 *
 * A palavra ocupa cerca de 460 unidades de largura, entao 88 revela pouco mais
 * de um terco dela por vez. Raio maior que isso ilumina o nome inteiro e o
 * movimento do ponteiro deixa de ser percebido - foi o que acontecia com o
 * valor anterior (22% da diagonal normalizada, ~101 unidades, com queda suave
 * desde o centro: nunca havia nucleo solido).
 */
const REVEAL_R = 88;

/**
 * Texto vazado que revela cor sob o ponteiro.
 *
 * Tres camadas de <text> empilhadas:
 *   1. contorno neutro     - invisivel em repouso, entra a 0.7 no hover e da
 *                            corpo ao nome (mesmo papel da camada neutra do
 *                            componente original)
 *   2. contorno da marca   - stroke-dash animado, roda uma vez ao entrar na
 *                            tela e depois fica: o nome nunca desaparece
 *   3. traco claro + fill  - visivel apenas dentro de uma mascara radial que
 *                            segue o ponteiro. E a camada que acende
 *
 * O contraste entre 1+3 e o estado de repouso e o que torna o efeito legivel.
 * Uma versao anterior deixava o contorno neutro sempre visivel e revelava um
 * verde escuro: tecnicamente funcionava, mas a diferenca entre hover e repouso
 * era imperceptivel na tela.
 *
 * ADAPTACOES CONSCIENTES EM RELACAO AO COMPONENTE ORIGINAL:
 *
 * - GSAP no lugar de framer-motion. O original animava um <motion.radialGradient>
 *   com `animate={maskPosition}` alimentado por useState a cada mousemove: isso e
 *   um re-render do React por movimento de mouse. Aqui a posicao vive num objeto
 *   e o gsap.quickTo escreve direto no atributo do gradiente - zero re-render, e
 *   quickTo e feito exatamente para valores que mudam mais rapido que o quadro.
 *
 * - Paleta da marca no lugar do gradiente de cinco cores (amarelo, vermelho,
 *   verde, ciano, violeta). Este sistema visual tem um acento unico; a variacao
 *   vem de claro/escuro dentro do mesmo verde, nao de cores novas.
 *
 * - viewBox largo. O original usa 300x100, que comprime qualquer nome maior que
 *   uma palavra curta - "Pattern Nexus" tem treze caracteres.
 *
 * - Decorativo e aria-hidden: o nome da empresa ja e anunciado pelo wordmark do
 *   rodape. Sem cursor-pointer, porque nao ha nada para clicar aqui.
 */
export function TextHoverEffect({
  text,
  duration = 0.5,
  className,
}: {
  text: string;
  /** Tempo que a mascara leva para alcancar o ponteiro, em segundos. */
  duration?: number;
  className?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      /*
        Os ganchos se chamam layer-* de proposito. Um nome como .text-base
        colidiria com a utility de mesmo nome do Tailwind: o twMerge dentro do
        cn() trata as duas como font-size e descartaria o text-[5.5rem].
      */
      const mask = svg.querySelector<SVGElement>(".reveal-mask");
      const drawn = svg.querySelector<SVGTextElement>(".layer-draw");
      const base = svg.querySelector<SVGTextElement>(".layer-base");

      // 1) O contorno se desenha uma vez, quando o rodape entra na tela.
      if (drawn && !reduce) {
        gsap.fromTo(
          drawn,
          { strokeDashoffset: 1000, strokeDasharray: 1000 },
          {
            strokeDashoffset: 0,
            duration: 3.2,
            ease: "power2.inOut",
            scrollTrigger: { trigger: svg, start: "top 92%", once: true },
          }
        );
      }

      if (!mask) return;

      /*
        2) A mascara segue o ponteiro, em UNIDADES DE USUARIO (viewBox), nao em
        porcentagem do elemento.

        O viewBox e mais largo que o container, entao o preserveAspectRatio
        centraliza o desenho e sobra letterbox em cima e embaixo. Medir pelo
        getBoundingClientRect ignorava essa folga e deslocava a luz no eixo Y.
        A matriz de tela do proprio SVG faz a conversao exata, seja qual for o
        tamanho do container.
      */
      const pos = { x: VIEW_W / 2, y: VIEW_H / 2 };
      const apply = () => {
        mask.setAttribute("cx", String(pos.x));
        mask.setAttribute("cy", String(pos.y));
      };

      /*
        Sob movimento reduzido a interacao CONTINUA: o que sai e a interpolacao,
        nao a funcionalidade. A luz salta direto para o ponteiro em vez de
        deslizar ate ele. Desligar o hover inteiro aqui era um erro - quem pede
        menos movimento nao pediu uma pagina sem resposta.

        E por isso sao dois caminhos, e nao um quickTo com duracao variavel: com
        duration 0 o quickTo divide pelo intervalo da tween e devolve NaN, o que
        apaga a mascara.
      */
      const ease = "power3.out";
      const xTo = reduce
        ? (v: number) => {
            pos.x = v;
            apply();
          }
        : gsap.quickTo(pos, "x", { duration, ease, onUpdate: apply });
      const yTo = reduce
        ? (v: number) => {
            pos.y = v;
            apply();
          }
        : gsap.quickTo(pos, "y", { duration, ease, onUpdate: apply });

      const onMove = (e: PointerEvent) => {
        const ctm = svg.getScreenCTM();
        if (!ctm) return;
        const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(
          ctm.inverse()
        );
        xTo(p.x);
        yTo(p.y);
      };

      /*
        3) O raio da mascara abre no enter e fecha no leave. Fechar em vez de
        apenas esconder evita o salto de cor quando o ponteiro sai e volta por
        outro canto: a luz encolhe no lugar onde estava.
      */
      const openTo = (r: number) =>
        gsap.to(mask, {
          attr: { r },
          duration: reduce ? 0 : 0.55,
          ease: "power3.out",
          overwrite: true,
        });

      /*
        4) O contorno neutro so existe sob o ponteiro, como no componente
        original: em repouso o nome e apenas o traco da marca; no hover ganha
        corpo. E o contraste entre os dois estados que torna o efeito legivel.
      */
      const fade = (opacity: number) =>
        gsap.to(base, {
          opacity,
          duration: reduce ? 0 : 0.4,
          ease: "power2.out",
          overwrite: true,
        });

      const onEnter = () => {
        openTo(REVEAL_R);
        if (base) fade(0.7);
      };
      const onLeave = () => {
        openTo(0);
        if (base) fade(0);
      };

      // Estado inicial: mascara fechada, nenhuma cor na tela.
      mask.setAttribute("r", "0");
      apply();

      svg.addEventListener("pointermove", onMove);
      svg.addEventListener("pointerenter", onEnter);
      svg.addEventListener("pointerleave", onLeave);

      return () => {
        svg.removeEventListener("pointermove", onMove);
        svg.removeEventListener("pointerenter", onEnter);
        svg.removeEventListener("pointerleave", onLeave);
      };
    }, svg);

    return () => ctx.revert();
  }, [duration]);

  /*
    O texto e desenhado tres vezes com os mesmos atributos de posicao. As
    propriedades ficam num objeto para as tres camadas nao saírem de sincronia
    quando uma delas for ajustada.
  */
  const glyph = {
    x: "50%",
    y: "52%",
    textAnchor: "middle" as const,
    dominantBaseline: "middle" as const,
    className:
      "fill-transparent text-[5.5rem] font-semibold tracking-[-0.03em]",
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 640 130"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("h-full w-full select-none", className)}
    >
      <defs>
        {/*
          A cor que a mascara revela.

          Antes as pontas eram --brand-dim (#17705a): mais escuro que o contorno
          que ja estava na tela, entao em boa parte da largura a "revelacao"
          escurecia o texto em vez de acende-lo. Agora a faixa inteira e clara -
          so um pedaco dela aparece por vez, e esse pedaco precisa brilhar.
        */}
        <linearGradient
          id="nexus-text-gradient"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2={VIEW_W}
          y2="0"
        >
          <stop offset="0%" stopColor="var(--brand)" />
          <stop offset="28%" stopColor="#7ffde2" />
          <stop offset="50%" stopColor="#f2fffb" />
          <stop offset="72%" stopColor="#7ffde2" />
          <stop offset="100%" stopColor="var(--brand)" />
        </linearGradient>

        {/*
          Queda da mascara: nucleo solido ate 45% do raio e so entao o
          esmaecimento. Com a rampa comecando em zero, o brilho maximo existia
          num ponto unico e o efeito sumia.
        */}
        <radialGradient
          className="reveal-mask"
          id="nexus-reveal-mask"
          gradientUnits="userSpaceOnUse"
          cx={VIEW_W / 2}
          cy={VIEW_H / 2}
          r="0"
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="45%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </radialGradient>

        <mask id="nexus-text-mask">
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#nexus-reveal-mask)"
          />
        </mask>
      </defs>

      {/*
        1. Contorno neutro, invisivel em repouso.

        Como no componente original: aparece so sob o ponteiro (opacity 0 -> 0.7)
        e da corpo ao nome no hover. O GSAP controla a opacidade.
      */}
      <text
        {...glyph}
        className={cn(glyph.className, "layer-base")}
        stroke="var(--hairline-strong)"
        strokeWidth="1.1"
        opacity="0"
      >
        {text}
      </text>

      {/* 2. Contorno que se desenha na entrada - o nome nunca desaparece. */}
      <text
        {...glyph}
        className={cn(glyph.className, "layer-draw")}
        stroke="var(--brand)"
        strokeWidth="0.9"
        opacity="0.32"
      >
        {text}
      </text>

      {/*
        3. Traco claro recortado pela mascara que segue o ponteiro.

        O fill entra junto, bem discreto: e ele que faz as letras ACENDEREM por
        dentro dentro da poca de luz, em vez de so engrossarem o contorno. Sem
        isso o efeito depende de 0,5 unidade de diferenca de espessura, que na
        pratica ninguem enxerga.
      */}
      <text
        {...glyph}
        stroke="url(#nexus-text-gradient)"
        strokeWidth="2.4"
        mask="url(#nexus-text-mask)"
        /*
          O fill vai em style, nao em atributo: glyph.className carrega
          fill-transparent, e classe CSS sobrepoe presentation attribute.
        */
        style={{ fill: "url(#nexus-text-gradient)", fillOpacity: 0.16 }}
      >
        {text}
      </text>
    </svg>
  );
}

/**
 * Halo de fundo do rodape.
 *
 * O original usa um radial em #0F0F11 com azul #3ca2fa. Aqui a base e o fundo
 * real da pagina e o brilho e o acento da marca, para o rodape continuar sendo
 * a mesma superficie do resto do site e nao um retangulo de outra origem.
 */
export function FooterBackgroundGradient({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 z-0", className)}
      style={{
        background:
          "radial-gradient(125% 125% at 50% 100%, rgba(5,7,11,0) 45%, rgba(45,212,167,0.10) 100%)",
      }}
    />
  );
}
