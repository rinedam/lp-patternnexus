import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { process } from "@/lib/brand";
import { SplitLines } from "@/components/motion/ScrollText";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * O processo, em tres movimentos.
 *
 * FORMATO: a coluna da direita fica parada enquanto os textos das etapas passam
 * pela esquerda. Quando uma etapa alcanca o centro da tela, o visual da direita
 * troca para o dela.
 *
 * POR QUE STICKY E NAO PIN: o efeito de "coluna parada" aqui e exatamente o que
 * `position: sticky` faz nativamente, sem pin-spacer, sem recalculo de altura e
 * sem o risco de gatilho medindo posicao dentro de um container que o GSAP
 * move - o problema que ja custou uma secao preta neste projeto (ver Standard).
 * O GSAP entra so para o crossfade do visual, que e o que ele faz melhor.
 *
 * Cada etapa ocupa quase uma tela de altura. Isso da tempo de ler antes da
 * proxima troca e e o que faz a coluna parada parecer intencional.
 */

/** Mapear: o fluxo do manual e o fluxo que realmente acontece. */
function ArtMap() {
  return (
    <div aria-hidden="true" className="w-full max-w-[24rem] space-y-5">
      <div>
        <span className="label-mono">no manual</span>
        <div className="mt-2.5 flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-1 items-center gap-1.5">
              <div className="h-1.5 flex-1 rounded-full bg-hairline-strong" />
              {i < 2 && <span className="text-hairline-strong">›</span>}
            </div>
          ))}
        </div>
      </div>

      <div>
        <span className="label-mono text-brand">na prática</span>
        {/* O caminho real tem desvio e volta: e esse que precisa ser mapeado. */}
        <svg viewBox="0 0 320 86" className="mt-2.5 w-full text-brand">
          <path
            d="M6 16 H90 C120 16 118 44 146 44 H196 C226 44 224 72 252 72 H314"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.75"
          />
          {[
            [6, 16],
            [146, 44],
            [252, 72],
            [314, 72],
          ].map(([cx, cy]) => (
            <circle key={`${cx}`} cx={cx} cy={cy} r="3.5" fill="currentColor" />
          ))}
        </svg>
      </div>

      <p className="label-mono border-t border-hairline pt-4">
        uma semana junto de quem executa
      </p>
    </div>
  );
}

/** Construir: versoes curtas, ja em producao. */
function ArtBuild() {
  const versions = [
    { tag: "v1", note: "em produção", live: true },
    { tag: "v2", note: "em produção", live: true },
    { tag: "v3", note: "esta semana", live: false },
  ];
  return (
    <div aria-hidden="true" className="w-full max-w-[24rem] space-y-2.5">
      {versions.map((v) => (
        <div
          key={v.tag}
          className={cn(
            "flex items-center gap-3 rounded-lg border px-4 py-3",
            v.live
              ? "border-brand/35 bg-brand/[0.06]"
              : "border-dashed border-hairline-strong bg-surface-raised",
          )}
        >
          <span className="tabular text-sm text-foreground">{v.tag}</span>
          <span className="label-mono ml-auto">{v.note}</span>
          {v.live && <span className="h-1.5 w-1.5 rounded-full bg-brand" />}
        </div>
      ))}
      <p className="label-mono border-t border-hairline pt-4">
        você usa antes do escopo fechar
      </p>
    </div>
  );
}

/** Operar: o fluxo continua sendo olhado depois da entrega. */
function ArtOperate() {
  const points = [38, 30, 42, 34, 46, 40, 52, 44, 58, 48, 62, 54];
  return (
    <div aria-hidden="true" className="w-full max-w-[24rem]">
      <svg viewBox="0 0 320 90" className="w-full">
        <path
          d={`M ${points
            .map((p, i) => `${(i * 320) / (points.length - 1)} ${90 - p}`)
            .join(" L ")}`}
          fill="none"
          stroke="var(--brand)"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        {/* Faixa esperada: o que sai dela e o que gera alerta. */}
        <rect
          x="0"
          y="18"
          width="320"
          height="54"
          fill="var(--brand)"
          opacity="0.05"
        />
      </svg>

      <div className="mt-4 flex items-center justify-between border-t border-hairline pt-4">
        <span className="label-mono">6 meses depois</span>
        <span className="label-mono text-brand">ainda dentro da faixa</span>
      </div>
    </div>
  );
}

const arts = [ArtMap, ArtBuild, ArtOperate];

export default function Process() {
  const stageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const steps = gsap.utils.toArray<HTMLElement>(".proc-step");
      // artEls (nos do DOM), nao `arts` (os componentes no topo do arquivo).
      const artEls = gsap.utils.toArray<HTMLElement>(".proc-art");
      const dots = gsap.utils.toArray<HTMLElement>(".proc-dot");

      // Só o primeiro visual comeca visivel.
      gsap.set(artEls.slice(1), { opacity: 0, yPercent: 4 });

      const activate = (index: number) => {
        artEls.forEach((art, i) => {
          gsap.to(art, {
            opacity: i === index ? 1 : 0,
            yPercent: i === index ? 0 : 4,
            duration: 0.45,
            ease: "power2.out",
            overwrite: true,
          });
        });
        dots.forEach((dot, i) => {
          gsap.to(dot, {
            /* A bolinha da etapa ativa fica cheia; as outras, vazias. */
            backgroundColor:
              i === index ? "var(--brand)" : "var(--hairline-strong)",
            scale: i === index ? 1 : 0.7,
            duration: 0.35,
            overwrite: true,
          });
        });
      };

      /*
        Um gatilho por etapa, ativando quando ela cruza o meio da tela. Vale
        tanto descendo (onEnter) quanto subindo (onEnterBack), senao voltar a
        pagina deixaria o visual travado na ultima etapa.
      */
      steps.forEach((step, i) => {
        ScrollTrigger.create({
          trigger: step,
          start: "top 55%",
          end: "bottom 45%",
          onEnter: () => activate(i),
          onEnterBack: () => activate(i),
        });
      });
    }, stage);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="processo"
      className="relative border-t border-hairline py-24 md:py-32"
    >
      <div className="container">
        <p className="label-mono flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />O processo
        </p>

        <SplitLines
          as="h2"
          className="mt-7 max-w-[24ch] text-balance text-[clamp(2rem,4.8vw,3.6rem)] font-semibold leading-[1.04] tracking-[-0.025em] text-foreground"
        >
          Como um projeto <span className="text-brand">acontece</span> aqui.
        </SplitLines>

        <div
          ref={stageRef}
          className="mt-16 grid grid-cols-1 gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-16"
        >
          {/* Coluna dos textos: rola normalmente. */}
          <ol className="lg:col-span-5">
            {process.map((step, i) => {
              const Art = arts[i];
              return (
                <li
                  key={step.id}
                  className="proc-step flex flex-col justify-center border-t border-hairline py-14 lg:min-h-[78vh] lg:border-0 lg:py-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="tabular text-xs text-brand">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="h-px w-8 bg-hairline-strong" />
                    <span className="label-mono">{step.verb}</span>
                  </div>

                  <h3 className="mt-6 max-w-[26ch] text-balance text-2xl font-medium leading-snug tracking-tight text-foreground md:text-3xl">
                    {step.title}
                  </h3>
                  <p className="mt-5 max-w-[44ch] text-pretty leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>

                  {/* No celular o visual acompanha a propria etapa. */}
                  <div className="mt-10 grid place-items-center rounded-[calc(var(--radius)+8px)] border border-hairline bg-surface p-7 lg:hidden">
                    <Art />
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Coluna parada: um visual por etapa, trocando em crossfade. */}
          <div className="hidden lg:col-span-7 lg:block">
            <div className="sticky top-0 flex h-screen flex-col justify-center py-20">
              <div className="relative grid min-h-[22rem] flex-1 place-items-center overflow-hidden rounded-[calc(var(--radius)+10px)] border border-hairline bg-[linear-gradient(180deg,var(--surface)_0%,#070a10_100%)]">
                <div className="lattice-grid absolute inset-0 opacity-[0.35]" />

                {process.map((step, i) => {
                  const Art = arts[i];
                  return (
                    <div
                      key={step.id}
                      className="proc-art absolute inset-0 grid place-items-center p-10"
                    >
                      <Art />
                    </div>
                  );
                })}
              </div>

              {/* Bolinhas de etapa: dizem quantas faltam. */}
              <div className="mt-8 flex items-center gap-2.5">
                {process.map((step) => (
                  <span
                    key={step.id}
                    className="proc-dot h-1.5 w-1.5 rounded-full bg-hairline-strong"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
