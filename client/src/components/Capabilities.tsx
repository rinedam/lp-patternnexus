import {
  useLayoutEffect,
  useRef,
  type ComponentType,
  type CSSProperties,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { capabilities, type Capability } from "@/lib/brand";
import { SplitLines } from "@/components/motion/ScrollText";
import { NexusMark } from "@/components/brand/Wordmark";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Capacidades, em grade de tamanhos desiguais.
 *
 * O formato anterior era mestre-detalhe: a pessoa clicava num item e o texto
 * aparecia ao lado. Funcionava, mas escondia quase tudo o que a casa faz atras
 * de um clique que ninguem e obrigado a dar. Aqui as cinco frentes ficam
 * visiveis de uma vez, e o que diferencia cada uma e o TAMANHO do card e a
 * leitura visual dentro dele - nao um estado de selecao.
 *
 * A grade e deliberadamente irregular (7/5, 5/7, 12). Cards do mesmo tamanho
 * lado a lado sao o desenho que faz uma pagina parecer gerada.
 */

/** Agentes: a conversa acontece onde o cliente ja esta. */
function ArtAgents() {
  const turns = [
    { from: "cliente", text: "Vocês fazem orçamento pra 400 peças?" },
    { from: "agente", text: "Fazemos. Me diz o material e o prazo." },
  ];
  return (
    <div aria-hidden="true" className="space-y-2.5">
      {turns.map(t => (
        <div
          key={t.from}
          className={cn(
            "max-w-[80%] rounded-2xl px-4 py-2.5 text-[0.78rem] leading-relaxed",
            t.from === "cliente"
              ? "rounded-bl-md bg-surface-raised text-muted-foreground"
              : "ml-auto rounded-br-md bg-brand/12 text-foreground ring-1 ring-brand/25"
          )}
        >
          {t.text}
        </div>
      ))}
      <div className="flex items-center gap-2 pt-2">
        <span className="h-1.5 w-1.5 rounded-full bg-brand" />
        <span className="label-mono">
          caso fora do padrão sobe com o histórico
        </span>
      </div>
    </div>
  );
}

/**
 * Integracoes: quatro sistemas convergindo para um ponto.
 *
 * Usa o simbolo da marca como centro porque e literalmente o que ele desenha -
 * o nexus, onde os sistemas do cliente se encontram. A ilustracao e a marca
 * dizendo a mesma coisa.
 */
function ArtIntegrations() {
  const systems = ["ERP", "Planilha", "Gateway", "CRM"];
  return (
    <div aria-hidden="true" className="relative grid place-items-center py-2">
      <div className="grid w-full max-w-[15rem] grid-cols-3 items-center gap-y-3 text-center">
        <span className="label-mono col-span-3">{systems[0]}</span>
        <span className="label-mono text-right">{systems[1]}</span>
        <span className="mx-auto h-11 w-11 text-brand">
          <NexusMark />
        </span>
        <span className="label-mono text-left">{systems[2]}</span>
        <span className="label-mono col-span-3">{systems[3]}</span>
      </div>
      <p className="label-mono mt-4">uma vez só, sem redigitação</p>
    </div>
  );
}

/** Decisao: o caminho simples e o caminho da excecao. */
function ArtDecision() {
  return (
    <div aria-hidden="true" className="space-y-3">
      <div className="rounded-lg border border-hairline bg-surface-raised px-3.5 py-2.5 text-[0.75rem] text-foreground">
        entrada classificada
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-brand/40 bg-brand/[0.07] px-3.5 py-2.5">
          <span className="label-mono text-brand">resolve sozinho</span>
        </div>
        <div className="rounded-lg border border-hairline bg-surface-raised px-3.5 py-2.5">
          <span className="label-mono">fila de exceção</span>
        </div>
      </div>
      <p className="label-mono pt-1">com o motivo registrado</p>
    </div>
  );
}

/** Paineis: o que rodou, o que travou, e onde parou. */
function ArtDashboard() {
  const rows = [
    { label: "Fluxo de orçamento", state: "ok" },
    { label: "Baixa de estoque", state: "ok" },
    { label: "Emissão de nota", state: "espera" },
  ];
  return (
    <div aria-hidden="true" className="space-y-2">
      {rows.map(r => (
        <div
          key={r.label}
          className="flex items-center gap-3 rounded-lg border border-hairline bg-surface-raised px-3.5 py-2.5"
        >
          <span
            className={cn(
              "h-1.5 w-1.5 shrink-0 rounded-full",
              r.state === "ok" ? "bg-brand" : "bg-muted-foreground"
            )}
          />
          <span className="text-[0.75rem] text-foreground">{r.label}</span>
          <span className="label-mono ml-auto">{r.state}</span>
        </div>
      ))}
      <p className="label-mono pt-1">
        a noite foi tranquila, em cinco segundos
      </p>
    </div>
  );
}

/**
 * Sites: a mesma pagina servida em tres larguras.
 *
 * Horizontal de proposito. Este e o unico card de largura inteira, e as artes
 * compactas das outras frentes deixariam metade dele vazio.
 */
function ArtSites() {
  /*
    As proporcoes imitam as tres larguras reais, por isso nao sao redondas. O
    numero de linhas cresce conforme a tela estreita: e o mesmo conteudo
    refluindo numa coluna menor, que e exatamente o que o card afirma. Com a
    mesma contagem nas tres, o "celular" saia mais largo do que alto e
    desmentia a legenda.
  */
  const telas = [
    { grow: "flex-[2.6]", linhas: 3 },
    // A do meio sai no celular: as tres dividindo 330px deixavam a ultima com
    // 37px de largura, um caco que nao se le como tela nenhuma.
    { grow: "hidden sm:block sm:flex-[1.1]", linhas: 5 },
    { grow: "flex-[0.9] sm:flex-[0.5]", linhas: 8 },
  ];
  return (
    <div aria-hidden="true" className="space-y-4">
      <div className="flex items-start gap-3">
        {telas.map(({ grow, linhas }, i) => (
          <div
            key={i}
            className={cn(
              "overflow-hidden rounded-lg border border-hairline bg-surface-raised",
              grow
            )}
          >
            {/* Barra do navegador. */}
            <div className="flex items-center gap-1.5 border-b border-hairline px-2.5 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-hairline-strong" />
              <span className="h-1.5 w-1.5 rounded-full bg-hairline-strong" />
              <span className="ml-1 h-1.5 flex-1 rounded-full bg-hairline" />
            </div>
            {/* Esqueleto da pagina: titulo, texto e o botao de acao. */}
            <div className="space-y-1.5 p-2.5">
              <div className="h-2.5 w-2/3 rounded-sm bg-brand/45" />
              {Array.from({ length: linhas }, (_, l) => (
                <div
                  key={l}
                  className="h-1.5 rounded-sm bg-hairline-strong"
                  style={{ width: l % 3 === 2 ? "70%" : "100%" }}
                />
              ))}
              <div className="!mt-2.5 h-3 w-1/2 rounded-sm bg-brand/25" />
            </div>
          </div>
        ))}
      </div>
      <p className="label-mono">a mesma página, do desktop ao celular</p>
    </div>
  );
}

/**
 * Layout de cada card na grade.
 *
 * E um Record indexado pelo id da capacidade, nao um array indexado por posicao.
 * Com array, acrescentar uma frente no brand.ts sem acrescentar o layout aqui
 * fazia layout[i] devolver undefined e a desestruturacao derrubava a pagina
 * inteira em runtime. Assim o TypeScript exige a entrada e o erro aparece na
 * compilacao.
 */
const layout: Record<
  Capability["id"],
  { art: ComponentType; span: string; glow: string }
> = {
  agentes: { art: ArtAgents, span: "lg:col-span-7", glow: "26%" },
  integracoes: { art: ArtIntegrations, span: "lg:col-span-5", glow: "70%" },
  decisao: { art: ArtDecision, span: "lg:col-span-5", glow: "34%" },
  paineis: { art: ArtDashboard, span: "lg:col-span-7", glow: "64%" },
  // Largura inteira: e o produto que o site nao citava, e fecha a grade.
  sites: { art: ArtSites, span: "lg:col-span-12", glow: "50%" },
};

export default function Capabilities() {
  const gridRef = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(grid.children);
      gsap.set(cards, { opacity: 0, y: 48 });

      /*
        batch agrupa os cards que entram na tela na mesma janela de tempo e
        anima o lote junto. Numa grade irregular como esta, dois cards cruzam a
        borda quase ao mesmo tempo: sem o agrupamento cada um dispararia seu
        proprio stagger e a cascata sairia torta.
      */
      ScrollTrigger.batch(cards, {
        start: "top 88%",
        once: true,
        onEnter: batch =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.95,
            ease: "power3.out",
            stagger: 0.11,
            overwrite: true,
          }),
      });
    }, grid);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="capacidades"
      className="relative border-t border-hairline py-24 md:py-32"
    >
      <div className="container">
        <p className="label-mono flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />O que
          construímos
        </p>

        <SplitLines
          as="h2"
          className="mt-7 max-w-[24ch] text-balance text-[clamp(2rem,4.8vw,3.6rem)] font-semibold leading-[1.04] tracking-[-0.025em] text-foreground"
        >
          Cinco frentes que costumam vir{" "}
          <span className="text-brand">juntas</span>.
        </SplitLines>

        <ul
          ref={gridRef}
          className="mt-16 grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6"
        >
          {capabilities.map(c => {
            const { art: Art, span, glow } = layout[c.id];
            return (
              <li
                key={c.id}
                className={cn(
                  "card-shell group flex flex-col p-7 md:p-8",
                  span
                )}
                style={{ "--glow-x": glow } as CSSProperties}
              >
                {/* A leitura visual primeiro: ela e o gancho, o texto explica. */}
                <div className="min-h-[9.5rem]">
                  <Art />
                </div>

                <h3 className="mt-8 text-lg font-medium leading-snug text-foreground md:text-xl">
                  {c.title}
                </h3>
                <p className="mt-3 max-w-[52ch] text-pretty text-sm leading-relaxed text-muted-foreground">
                  {c.detail}
                </p>

                <ul className="mt-auto flex flex-wrap gap-2 pt-7">
                  {c.signals.map(signal => (
                    <li
                      key={signal}
                      className="label-mono rounded-full border border-hairline bg-surface-raised px-3 py-1.5 text-foreground transition-colors duration-300 group-hover:border-brand/30"
                    >
                      {signal}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
