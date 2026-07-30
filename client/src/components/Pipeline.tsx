import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check } from "lucide-react";
import { pipeline } from "@/lib/brand";
import { SplitLines } from "@/components/motion/ScrollText";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * A demonstracao viva.
 *
 * Esta secao existe no lugar dos depoimentos. Sem clientes reais para citar, a
 * prova precisa ser o proprio artefato: um fluxo que a pessoa assiste atravessar
 * o sistema, do recebimento ate a acao.
 *
 * O QUE MUDOU E POR QUE:
 *
 * A versao anterior rodava a sequencia numa corrente de setTimeout disparada
 * quando a secao entrava na tela, com botao de "rodar de novo". Funcionava, mas
 * o tempo era do relogio e nao do leitor: quem chegava lendo devagar perdia o
 * inicio, e quem chegava rapido esperava parado. Agora o percurso e conduzido
 * pelo SCROLL - a mensagem avanca na velocidade em que a pessoa rola, para
 * quando ela para, e volta quando ela sobe.
 *
 * Isso tambem apagou de vez a classe de bug que o arquivo antigo documentava:
 * nao existe mais timer em voo para um re-render cancelar.
 *
 * O trilho anda na horizontal enquanto a secao esta presa. Cabecalho FORA do
 * elemento pinado, pelo motivo explicado em Standard.tsx: gatilho medido dentro
 * de um pin-spacer nao dispara.
 */
export default function Pipeline() {
  const pinRef = useRef<HTMLDivElement>(null);
  const total = pipeline.length;

  useLayoutEffect(() => {
    const pin = pinRef.current;
    if (!pin) return;

    /*
      O escopo vai no construtor do matchMedia, e a limpeza e mm.revert(). Um
      gsap.context em volta nao serviria: ele nao remove os media listeners.
    */
    const mm = gsap.matchMedia(pin);

    /*
      Opacidade do detalhe fora da etapa ativa.

      Nao e zero. Com zero, os cartoes vizinhos - e ha sempre dois ou tres na
      tela ao mesmo tempo - ficavam com o titulo boiando num vazio, e o desenho
      lia como texto que nao carregou, nao como etapa inativa. Apagado o
      suficiente para a etapa ativa continuar sendo a unica em foco, presente o
      suficiente para o cartao parecer inteiro.
    */
    const DETALHE_APAGADO = 0.3;

    /** Pinta nos e legendas de acordo com a etapa alcancada. */
    const paint = (reached: number) => {
      gsap.utils
        .toArray<HTMLElement>(pin.querySelectorAll(".pipe-stage"))
        .forEach((el, i) => {
          el.dataset.state =
            i < reached ? "done" : i === reached ? "active" : "pending";
        });
      gsap.utils
        .toArray<HTMLElement>(pin.querySelectorAll(".pipe-detail"))
        .forEach((el, i) => {
          gsap.to(el, {
            opacity: i === reached ? 1 : DETALHE_APAGADO,
            y: i === reached ? 0 : 4,
            duration: 0.3,
            overwrite: true,
          });
        });
    };

    mm.add(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      () => {
        const track = pin.querySelector<HTMLElement>(".pipe-track");
        const fill = pin.querySelector<HTMLElement>(".pipe-fill");
        if (!track) return;

        /*
        Distancia que o trilho precisa andar para o ultimo estagio encostar na
        borda direita. Calculada em funcao, nao valor fixo: com
        invalidateOnRefresh o GSAP a remede quando a janela muda de tamanho.
      */
        const distance = () =>
          Math.max(track.scrollWidth - window.innerWidth + 96, 0);

        gsap.set(".pipe-detail", { opacity: 0, y: 6 });
        paint(0);

        gsap.to(track, {
          x: () => -distance(),
          // ease "none" e obrigatorio: e o que mantem 1:1 entre scroll e trilho.
          ease: "none",
          scrollTrigger: {
            trigger: pin,
            start: "top top",
            end: () => `+=${distance() + window.innerHeight * 0.6}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: self => {
              if (fill) fill.style.transform = `scaleX(${self.progress})`;
              /*
              Arredonda para o estagio mais proximo em vez de truncar: o no
              acende quando o cartao dele esta de fato no centro da tela, e nao
              no instante em que sua borda esquerda aparece.
            */
              paint(
                Math.min(total - 1, Math.round(self.progress * (total - 1)))
              );
            },
          },
        });

        return () => {
          gsap.set(track, { clearProps: "x" });
        };
      }
    );

    /*
      Celular e movimento reduzido: sem pino e sem trilho. Cada estagio acende
      quando chega ao meio da tela, e a lista rola normalmente.
    */
    mm.add("(max-width: 1023px), (prefers-reduced-motion: reduce)", () => {
      gsap.set(".pipe-detail", { opacity: 1, y: 0 });
      const stages = gsap.utils.toArray<HTMLElement>(
        pin.querySelectorAll(".pipe-stage")
      );
      stages.forEach((stage, i) => {
        ScrollTrigger.create({
          trigger: stage,
          start: "top 70%",
          onEnter: () => {
            for (let k = 0; k <= i; k++) {
              stages[k].dataset.state = k === i ? "active" : "done";
            }
          },
        });
      });
    });

    return () => mm.revert();
  }, [total]);

  return (
    <section id="demonstracao" className="relative border-t border-hairline">
      {/* Cabecalho: fora do pin, para os reveals dispararem. */}
      <div className="container pt-24 md:pt-32">
        <p className="label-mono flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          Demonstração
        </p>

        <SplitLines
          as="h2"
          className="mt-7 max-w-[24ch] text-balance text-[clamp(2rem,4.8vw,3.6rem)] font-semibold leading-[1.04] tracking-[-0.025em] text-foreground"
        >
          Uma mensagem <span className="text-brand">atravessando</span> o
          sistema.
        </SplitLines>

        <p className="mt-7 max-w-[56ch] text-pretty leading-relaxed text-muted-foreground">
          O desenho abaixo é o mesmo de qualquer fluxo que entregamos: cada
          etapa registra o que decidiu, e o caso que sai do padrão vai para uma
          fila humana com o contexto junto.
        </p>
      </div>

      {/* Area pinada: o trilho e a barra de progresso. */}
      <div
        ref={pinRef}
        className="relative mt-16 overflow-hidden py-4 lg:mt-20 lg:motion-safe:flex lg:motion-safe:h-screen lg:motion-safe:flex-col lg:motion-safe:justify-center lg:motion-safe:py-0"
      >
        {/*
          Progresso do percurso. So aparece quando o percurso existe: sem a
          faixa de desktop do matchMedia nao ha o que a barra meca, e ela
          ficaria na tela como um risco que nunca enche.
        */}
        <div className="container hidden lg:motion-safe:block">
          <div className="h-px w-full bg-hairline">
            {/*
              O zero inicial vai em style, NAO na utility scale-x-0.

              No Tailwind v4 as utilities de escala deixaram de compor o
              `transform` e passam a escrever na propriedade CSS `scale`. O
              onUpdate abaixo escreve em `transform`. Sao duas propriedades
              distintas e o navegador MULTIPLICA as duas, entao com scale:0 fixo
              a barra ficava invisivel por mais que o transform mudasse - o
              percurso inteiro rodava com a barra em largura zero.

              Mantendo o estado inicial na mesma propriedade que o JS anima, as
              duas pontas falam a mesma lingua. Em style e nao numa classe
              porque assim o zero vale tambem quando a faixa de desktop do
              matchMedia nao roda (movimento reduzido), onde ninguem animaria a
              barra e ela apareceria cheia.
            */}
            <div
              className="pipe-fill h-px origin-left bg-brand"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
        </div>

        <div
          className={cn(
            "pipe-track mt-0 flex flex-col gap-5",
            "px-5 sm:px-8",
            /*
              O trilho so vira linha horizontal quando ha quem o desloque.
              Estas classes PRECISAM casar com a media query do matchMedia
              acima: sem o pin, w-max dentro de um overflow-hidden deixava a
              ultima etapa fora da viewport, sem scroll nem transform para
              alcanca-la. Mexeu numa condicao, mexa na outra.
            */
            "lg:motion-safe:mt-14 lg:motion-safe:w-max lg:motion-safe:flex-row lg:motion-safe:gap-6 lg:motion-safe:px-0",
            "lg:motion-safe:pl-[max(2.5rem,calc((100vw-1240px)/2+2.5rem))]"
          )}
        >
          {pipeline.map((stage, i) => (
            <article
              key={stage.id}
              data-state="pending"
              className={cn(
                "pipe-stage group relative flex flex-col justify-between overflow-hidden rounded-[calc(var(--radius)+8px)] border p-7 transition-colors duration-500 md:p-8",
                "border-hairline bg-surface",
                "data-[state=active]:border-brand/50",
                "data-[state=done]:border-brand/25",
                "lg:motion-safe:h-[22rem] lg:motion-safe:w-[26rem] lg:motion-safe:shrink-0"
              )}
            >
              <div className="lattice-grid absolute inset-0 opacity-25" />

              <header className="relative flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-colors duration-500",
                    "border-hairline-strong bg-surface-raised",
                    "group-data-[state=active]:border-brand group-data-[state=active]:bg-brand",
                    "group-data-[state=done]:border-brand/50"
                  )}
                >
                  <Check
                    className={cn(
                      "h-3.5 w-3.5 text-brand opacity-0 transition-opacity duration-500",
                      "group-data-[state=done]:opacity-100"
                    )}
                  />
                  <span
                    className={cn(
                      "absolute h-2 w-2 rounded-full bg-hairline-strong transition-all duration-500",
                      "group-data-[state=active]:bg-brand-foreground",
                      "group-data-[state=done]:opacity-0"
                    )}
                  />
                </span>

                <span className="tabular text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "ml-auto label-mono transition-colors duration-500",
                    "group-data-[state=active]:text-brand"
                  )}
                >
                  {stage.label}
                </span>
              </header>

              <div className="relative mt-8">
                <h3
                  className={cn(
                    "text-pretty text-lg font-medium leading-snug transition-colors duration-500 md:text-xl",
                    "text-muted-foreground",
                    "group-data-[state=active]:text-foreground",
                    "group-data-[state=done]:text-foreground/80"
                  )}
                >
                  {stage.caption}
                </h3>
                {/*
                  O detalhe fica sempre no DOM e so muda de opacidade. Trocar o
                  texto por estado faria a altura do cartao pular no meio do
                  movimento horizontal.
                */}
                <p className="pipe-detail mt-4 max-w-[38ch] text-pretty text-sm leading-relaxed text-muted-foreground">
                  {stage.detail}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Vinheta: o proximo cartao esta na fila, nao cortado por bug. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-32 bg-gradient-to-l from-background to-transparent lg:motion-safe:block"
        />
      </div>
    </section>
  );
}
