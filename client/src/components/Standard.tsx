import { useLayoutEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitLines } from "@/components/motion/ScrollText";
import { Reveal } from "@/components/motion/Reveal";
import { brand, standards } from "@/lib/brand";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * O padrao.
 *
 * Deixa explicito o que o nome quer dizer: Pattern e o nivel de exigencia da
 * casa, nao "coisa padronizada". E sustenta isso com compromissos que o cliente
 * consegue conferir depois de assinar, em vez de adjetivos sobre qualidade.
 *
 * FORMATO: painel pinado que troca de compromisso conforme a pagina rola. A
 * esquerda o texto, a direita uma leitura visual do mesmo compromisso, e um
 * contador dizendo onde o leitor esta. Pinado porque os quatro se leem como uma
 * lista unica: ocupando o mesmo lugar na tela, a diferenca entre eles fica
 * sendo o conteudo e nao a posicao.
 *
 * DECISOES DE ESTRUTURA, todas vindas de bug real:
 *
 * - O cabecalho fica FORA do elemento pinado. Dentro dele, os ScrollTriggers do
 *   reveal de titulo mediam posicao contra um container que o GSAP move e
 *   embrulha num pin-spacer; os gatilhos nunca disparavam e a secao inteira
 *   renderizava preta. O que mora no pin e animado pela timeline DO pin, nunca
 *   por gatilho proprio.
 *
 * - Nao ha Spotlight aqui. O foco de 620px num cabecalho de ~300px de altura era
 *   recortado pelo overflow do proprio container, e o efeito aparecia atras do
 *   cursor e sumia sem explicacao.
 *
 * - O pin so existe a partir de lg. Em tela pequena a altura de viewport e
 *   disputada com a barra do navegador, e prender a secao por quatro telas de
 *   scroll transforma a leitura em tunel. No celular os quatro compromissos
 *   viram uma lista que rola e acaba.
 *
 * - O empilhamento usa lg:motion-safe:, nao lg:. As classes que sobrepoem os
 *   quatro pares (absolute/inset-0) PRECISAM casar exatamente com a media query
 *   do matchMedia abaixo, porque quem separa os compromissos empilhados e o
 *   gsap.set de opacidade - o CSS sozinho so os joga um em cima do outro.
 *   Enquanto o CSS dizia lg: e o JS exigia tambem no-preference, qualquer tela
 *   grande com movimento reduzido renderizava os quatro sobrepostos, ilegiveis.
 *   Mexeu numa condicao, mexa na outra.
 */

/** Moldura comum das leituras visuais, para as quatro terem o mesmo peso. */
function VisualFrame({ children }: { children: ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="relative h-full w-full overflow-hidden rounded-[calc(var(--radius)+10px)] border border-hairline bg-[linear-gradient(180deg,var(--surface)_0%,#070a10_100%)]"
    >
      <div className="lattice-grid absolute inset-0 opacity-[0.35]" />
      <div className="relative grid h-full w-full place-items-center p-8">
        {children}
      </div>
    </div>
  );
}

/** Rollback: o estado novo existe, e o caminho de volta tambem. */
function VisualRollback() {
  return (
    <VisualFrame>
      <div className="flex w-full max-w-[22rem] flex-col items-center gap-6">
        <div className="flex w-full items-stretch justify-between gap-3">
          {["Antes", "Depois"].map((label, i) => (
            <div
              key={label}
              className={cn(
                "flex-1 rounded-xl border p-4 text-center",
                i === 1
                  ? "border-brand/45 bg-brand/[0.07]"
                  : "border-hairline bg-surface-raised"
              )}
            >
              <span className="label-mono">{label}</span>
              <div className="mt-3 space-y-1.5">
                {[0, 1, 2].map(r => (
                  <div
                    key={r}
                    className={cn(
                      "h-1.5 rounded-full",
                      i === 1 ? "bg-brand/45" : "bg-hairline-strong"
                    )}
                    style={{ width: `${100 - r * 22}%` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* A seta de volta: o ponto da secao esta nela, entao ela leva a cor. */}
        <svg viewBox="0 0 260 44" className="w-full text-brand">
          <path
            d="M244 6 C244 30 200 38 130 38 C60 38 16 30 16 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.7"
          />
          <path
            d="M16 8 L10 18 M16 8 L23 17"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span className="label-mono">rollback testado</span>
      </div>
    </VisualFrame>
  );
}

/** Auditoria: entrada, regra e horario, um por linha. */
function VisualAudit() {
  const rows = [
    { time: "09:14:02", rule: "orçamento", out: "fila comercial" },
    { time: "09:14:07", rule: "suporte", out: "chamado #4471" },
    { time: "09:15:31", rule: "fora do padrão", out: "exceção" },
  ];
  return (
    <VisualFrame>
      <div className="w-full max-w-[24rem] space-y-2">
        {rows.map((r, i) => (
          <div
            key={r.time}
            className={cn(
              "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-[0.7rem]",
              i === 2
                ? "border-brand/40 bg-brand/[0.06]"
                : "border-hairline bg-surface-raised"
            )}
          >
            <span className="tabular text-muted-foreground">{r.time}</span>
            <span className="text-foreground">{r.rule}</span>
            <span className="ml-auto tabular text-muted-foreground">
              → {r.out}
            </span>
          </div>
        ))}
        <p className="label-mono pt-2">toda decisão, com o motivo</p>
      </div>
    </VisualFrame>
  );
}

/** Alerta: o pico fora do expediente, e quem e avisado. */
function VisualAlert() {
  const bars = [12, 18, 14, 22, 30, 26, 64, 88, 40, 24, 16, 20];
  return (
    <VisualFrame>
      <div className="w-full max-w-[24rem]">
        <div className="flex items-end justify-between gap-1.5">
          {bars.map((h, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 rounded-t-[3px]",
                h > 60 ? "bg-brand" : "bg-hairline-strong"
              )}
              style={{ height: `${h * 1.1}px` }}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3">
          <span className="label-mono">02h14</span>
          <span className="rounded-full border border-brand/40 bg-brand/10 px-2.5 py-1 text-[0.65rem] text-brand">
            alerta enviado para nós
          </span>
        </div>
      </div>
    </VisualFrame>
  );
}

/** Propriedade: o repositorio e seu, com historico desde o inicio. */
function VisualOwnership() {
  const commits = [
    { sha: "a1f9c02", msg: "primeiro commit" },
    { sha: "7d3e118", msg: "fluxo de orçamento" },
    { sha: "b25c9af", msg: "documentação" },
  ];
  return (
    <VisualFrame>
      <div className="w-full max-w-[22rem]">
        <div className="rounded-xl border border-hairline bg-surface-raised p-4">
          <div className="flex items-center gap-2 border-b border-hairline pb-3">
            <span className="h-2 w-2 rounded-full bg-brand" />
            <span className="tabular text-[0.7rem] text-foreground">
              seu-repo / automacao
            </span>
            <span className="label-mono ml-auto">main</span>
          </div>
          <ul className="mt-3 space-y-2.5">
            {commits.map(c => (
              <li key={c.sha} className="flex items-center gap-3 text-[0.7rem]">
                <span className="tabular text-brand/70">{c.sha}</span>
                <span className="text-muted-foreground">{c.msg}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="label-mono mt-4">acesso desde o dia um</p>
      </div>
    </VisualFrame>
  );
}

const visuals = [VisualRollback, VisualAudit, VisualAlert, VisualOwnership];

export default function Standard() {
  const pinRef = useRef<HTMLDivElement>(null);
  const total = standards.length;

  useLayoutEffect(() => {
    const pin = pinRef.current;
    if (!pin) return;

    /*
      matchMedia resolve as tres realidades de uma vez: pino no desktop, lista
      rolavel no celular, e nenhuma das duas quando o usuario pediu menos
      movimento. Na troca de faixa o GSAP reverte o que a faixa anterior criou,
      entao nao sobra estilo inline de um layout no outro.

      O escopo vai no construtor (nao num gsap.context em volta): quem limpa um
      matchMedia e o proprio mm.revert(). Envolve-lo num context e limpar o
      context deixaria os media listeners vivos depois do unmount.
    */
    const mm = gsap.matchMedia(pin);

    mm.add(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      () => {
        const texts = gsap.utils.toArray<HTMLElement>(".std-text");
        const arts = gsap.utils.toArray<HTMLElement>(".std-visual");
        const fills = gsap.utils.toArray<HTMLElement>(".std-fill");
        const counter = pin.querySelector<HTMLElement>(".std-counter");

        // Estado inicial: so o primeiro compromisso na tela.
        gsap.set(texts.slice(1), { opacity: 0, yPercent: 8 });
        gsap.set(arts.slice(1), { opacity: 0, scale: 0.97 });
        gsap.set(fills, { scaleX: 0, transformOrigin: "left center" });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: pin,
            start: "top top",
            // Uma tela de scroll por compromisso.
            end: () => `+=${window.innerHeight * total}`,
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: self => {
              if (!counter) return;
              const i = Math.min(total - 1, Math.floor(self.progress * total));
              counter.textContent = String(i + 1).padStart(2, "0");
            },
          },
        });

        standards.forEach((_, i) => {
          // A barra do compromisso atual enche durante o tempo dele.
          tl.fromTo(fills[i], { scaleX: 0 }, { scaleX: 1, duration: 1 }, i);

          if (i === total - 1) return;

          /*
          A troca acontece perto do fim da unidade e as duas metades se
          sobrepoem de proposito: o que sai e o que entra se cruzam, para nao
          existir um quadro de tela vazia entre dois compromissos.
        */
          const at = i + 0.74;
          tl.to(
            texts[i],
            { opacity: 0, yPercent: -8, duration: 0.34, ease: "power2.in" },
            at
          )
            .to(
              arts[i],
              { opacity: 0, scale: 1.03, duration: 0.34, ease: "power2.in" },
              at
            )
            .to(
              texts[i + 1],
              { opacity: 1, yPercent: 0, duration: 0.4, ease: "power2.out" },
              at + 0.12
            )
            .to(
              arts[i + 1],
              { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" },
              at + 0.12
            );
        });
      }
    );

    return () => mm.revert();
  }, [total]);

  return (
    <section id="padrao" className="relative border-t border-hairline">
      {/* Cabecalho: fluxo normal, para os reveals de texto funcionarem. */}
      <div className="container pt-24 md:pt-32">
        <p className="label-mono flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />O padrão
        </p>

        <SplitLines
          as="h2"
          className="mt-7 max-w-[22ch] text-balance text-[clamp(2rem,4.8vw,3.6rem)] font-semibold leading-[1.04] tracking-[-0.025em] text-foreground"
        >
          Padrão não se improvisa. Se{" "}
          <span className="text-brand">constrói</span>.
        </SplitLines>

        {/* A leitura correta do nome, dita sem rodeio. */}
        <Reveal className="mt-10 grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2">
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Pattern:</span>{" "}
            {brand.meaning.pattern}
          </p>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Nexus:</span>{" "}
            {brand.meaning.nexus}
          </p>
        </Reveal>
      </div>

      {/*
        Area pinada. Nada aqui dentro usa ScrollTrigger proprio: tudo e animado
        pela timeline do pin, pelo motivo explicado no topo do arquivo.
      */}
      <div
        ref={pinRef}
        className="relative flex flex-col justify-center overflow-hidden py-20 lg:motion-safe:h-screen lg:motion-safe:py-0"
      >
        <div className="container flex h-full flex-col justify-center lg:py-20">
          {/* Contador: so existe no modo pinado, onde ele orienta. */}
          <p className="tabular mb-10 hidden text-sm text-muted-foreground lg:motion-safe:block">
            <span className="std-counter text-foreground">01</span>
            <span className="mx-1 opacity-50">/</span>
            {String(total).padStart(2, "0")}
          </p>

          {/*
            O palco. No desktop os quatro pares ocupam a mesma area e o GSAP
            alterna entre eles; no celular viram uma lista comum.
          */}
          <div className="relative lg:motion-safe:min-h-[24rem] lg:motion-safe:flex-1">
            <div className="space-y-16 lg:motion-safe:relative lg:motion-safe:h-full lg:motion-safe:space-y-0">
              {standards.map((s, i) => {
                const Visual = visuals[i];
                return (
                  <div
                    key={s.id}
                    className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-14 lg:motion-safe:absolute lg:motion-safe:inset-0"
                  >
                    <div className="std-text lg:col-span-5">
                      <span className="tabular text-xs text-brand lg:motion-safe:hidden">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="mt-3 text-balance text-xl font-medium leading-snug text-foreground md:text-2xl lg:mt-0">
                        {s.title}
                      </h3>
                      <p className="mt-4 max-w-[44ch] text-pretty leading-relaxed text-muted-foreground">
                        {s.body}
                      </p>
                    </div>

                    <div className="std-visual h-[19rem] lg:col-span-7 lg:max-h-[25rem] lg:motion-safe:h-full">
                      <Visual />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trilha de progresso: uma barra por compromisso. */}
          <div className="mt-12 hidden gap-2 lg:motion-safe:flex">
            {standards.map(s => (
              <div
                key={s.id}
                className="h-[2px] flex-1 overflow-hidden bg-hairline"
              >
                <div className="std-fill h-full w-full bg-brand" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
