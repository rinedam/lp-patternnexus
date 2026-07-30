import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrubWords } from "@/components/motion/ScrollText";
import { Parallax } from "@/components/motion/Reveal";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * A secao do problema.
 *
 * Substitui o "Sobre nos" generico. Antes de dizer o que a empresa faz, nomeia
 * a dor de quem compra, em termos concretos e sem numero inventado.
 *
 * SOBRE OS NUMEROS DOS CARDS:
 *
 * A referencia ancora cada card num percentual grande. Nao temos pesquisa
 * propria para citar, e inventar "68% das operacoes" seria exatamente o tipo de
 * dado de prateleira que o brand.ts proibe. O numero grande continua aqui como
 * ancora visual, mas e a ORDEM do item (01, 02, 03) - um fato sobre a pagina,
 * nao uma estatistica sobre o mundo.
 */

const leaks = [
  {
    id: "redigitacao",
    title: "Copiar e colar entre sistemas",
    body: "O dado já existe em algum lugar. Alguém digita ele de novo em outro, e erra de vez em quando.",
    /* Posicao do halo no card. Varia para os tres nao parecerem o mesmo card. */
    glow: "22%",
  },
  {
    id: "fila",
    title: "A mensagem que envelheceu na fila",
    body: "Chegou fora do horário, entrou na fila e ficou. Quando alguém abriu, o cliente já tinha perguntado em outro lugar.",
    glow: "50%",
  },
  {
    id: "relatorio",
    title: "O relatório de toda segunda",
    body: "Alguém monta na mão, toda semana, o que os sistemas já sabem responder sozinhos.",
    glow: "78%",
  },
];

export default function Statement() {
  const gridRef = useRef<HTMLUListElement>(null);

  /*
    Os cards entram em cascata e sobem um pouco mais que a pagina enquanto a
    secao atravessa a tela. O deslocamento e pequeno: passando de uns 40px, a
    borda inferior do card comeca a descolar do ritmo do texto ao lado.
  */
  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(grid.children);

      gsap.from(cards, {
        opacity: 0,
        y: 56,
        duration: 1,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: grid, start: "top 85%", once: true },
      });

      // Cada card sobe num ritmo proprio: o do meio um pouco mais que os outros.
      cards.forEach((card, i) => {
        gsap.to(card, {
          yPercent: i === 1 ? -9 : -4,
          ease: "none",
          scrollTrigger: {
            trigger: grid,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
      });
    }, grid);

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative overflow-hidden py-28 md:py-40">
      {/* Camada de profundidade: sobe mais devagar que o conteudo. */}
      <Parallax
        speed={0.12}
        className="pointer-events-none absolute inset-x-0 -top-24 h-[140%]"
      >
        <div className="lattice-grid lattice-fade h-full w-full opacity-25" />
      </Parallax>

      <div className="container relative">
        <p className="label-mono flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          O problema
        </p>

        {/*
          A frase ocupa a tela e acende no ritmo do scroll. Cada linha e um
          bloco proprio para a quebra nao depender da largura da janela: e o
          desenho da frase, nao um acidente de viewport.
        */}
        <ScrubWords
          as="h2"
          className="mt-10 max-w-[18ch] text-balance text-[clamp(2.5rem,7vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.03em] text-foreground"
        >
          O trabalho não some. Ele <span className="text-brand">vaza</span>.
        </ScrubWords>

        <p className="mt-10 max-w-[52ch] text-pretty leading-relaxed text-muted-foreground md:text-lg">
          Vaza em tarefas pequenas demais para alguém reclamar e frequentes o
          bastante para consumir um time inteiro. Nenhuma delas justifica um
          projeto sozinha. Juntas, justificam.
        </p>

        <ul
          ref={gridRef}
          className="mt-20 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6"
        >
          {leaks.map((leak, i) => (
            <li
              key={leak.id}
              className="card-shell group flex flex-col p-7 md:p-8"
              style={{ "--glow-x": leak.glow } as CSSProperties}
            >
              <span
                aria-hidden="true"
                className="tabular text-[3.25rem] font-light leading-none tracking-tight text-hairline-strong transition-colors duration-500 group-hover:text-brand/70"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <h3 className="mt-10 text-lg font-medium leading-snug text-foreground md:text-xl">
                {leak.title}
              </h3>
              <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
                {leak.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
