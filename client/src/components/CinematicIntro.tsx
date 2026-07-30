import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import LatticeField from "./LatticeField";
import { NexusMark } from "@/components/brand/Wordmark";
import { brand } from "@/lib/brand";

/**
 * A transicao de entrada do site.
 *
 * A coreografia original foi preservada: as frases entram, o conjunto recua com
 * blur, um card sobe de baixo, expande para a tela inteira e entrega o site.
 *
 * TRES COISAS QUE ESTA VERSAO RESOLVE:
 *
 * 1. Montagem unica. A versao original renderizava {children} duas vezes, uma
 *    como previa dentro do card e outra como pagina, o que montava o site
 *    inteiro em duplicado. Aqui o card e um painel opaco que se dissolve sobre o
 *    site real, e a sensacao de previa vem de escalar o proprio conteudo.
 *
 * 2. Espera a cena 3D. A cortina segura ate o Spline avisar que carregou, com
 *    teto de tempo para nunca travar. Assim o hero nao aparece com um buraco no
 *    lugar do robo.
 *
 * 3. Existe sob movimento reduzido. Antes a intro era pulada inteira nesse modo,
 *    e quem tinha a preferencia ligada no sistema simplesmente nunca via a
 *    abertura. Agora ela acontece em fade, sem zoom nem deslocamento, que sao as
 *    partes que de fato incomodam quem tem sensibilidade vestibular.
 */

/** Teto de espera pela cena 3D. Passou disso, a cortina sobe de qualquer jeito. */
const MAX_SCENE_WAIT_MS = 3200;

/**
 * Tempo minimo de cortina, contado do carregamento.
 *
 * Sem isto, com a cena 3D ja em cache a intro liberava quase imediatamente e a
 * frase piscava na tela rapido demais para alguem conseguir ler.
 */
const MIN_INTRO_HOLD_MS = 1900;

type IntroState = {
  done: boolean;
  /** A cena 3D chama isto quando termina de carregar, ou quando decide nao montar. */
  reportSceneReady: () => void;
};

const IntroContext = createContext<IntroState>({
  done: true,
  reportSceneReady: () => {},
});

export function useIntroDone() {
  return useContext(IntroContext).done;
}

export function useReportSceneReady() {
  return useContext(IntroContext).reportSceneReady;
}

export interface CinematicIntroProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  tagline1?: string;
  tagline2?: string;
}

export function CinematicIntro({
  children,
  tagline1 = "Padrão não se improvisa.",
  tagline2 = "Se constrói.",
  className,
  ...props
}: CinematicIntroProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  /** A cena avisou que esta pronta. Ref porque pode chegar antes do efeito montar. */
  const sceneReadyRef = useRef(false);
  /** Preenchido pelo efeito: libera a pausa da timeline. */
  const releaseRef = useRef<(() => void) | null>(null);

  const [finished, setFinished] = useState(false);

  const reportSceneReady = useCallback(() => {
    sceneReadyRef.current = true;
    releaseRef.current?.();
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const body = document.body;
    const html = document.documentElement;

    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = html.style.overflow;
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";

    const unlockScroll = () => {
      body.style.overflow = previousBodyOverflow;
      html.style.overflow = previousHtmlOverflow;
    };

    /*
      CRITICO: limpar transform e will-change do wrapper do conteudo.

      Um ancestral com transform (mesmo scale(1)) ou com will-change: transform
      vira o bloco de contencao de qualquer position: fixed descendente. Como o
      GSAP pina elementos usando position: fixed, deixar o residuo da animacao
      aqui quebrava TODO pin da pagina.
    */
    const releaseContentTransform = () => {
      if (!contentRef.current) return;
      gsap.set(contentRef.current, { clearProps: "transform,willChange,scale" });
      ScrollTrigger.refresh();
    };

    const finish = () => {
      unlockScroll();
      releaseContentTransform();
      setFinished(true);
    };

    /*
      Coordenacao da cortina. Tres condicoes precisam ser verdadeiras para a
      intro seguir adiante, e elas chegam em ordem imprevisivel:

        reachedPause  - a timeline alcancou o ponto de espera
        sceneSettled  - o robo carregou, falhou, ou o teto de tempo estourou
        minHoldPassed - a frase ficou tempo suficiente para ser lida

      O tempo minimo existe porque, com a cena ja em cache, a liberacao chegava
      quase junto com o inicio e a frase piscava rapido demais para alguem ler.
    */
    let reachedPause = false;
    let sceneSettled = false;
    let minHoldPassed = false;

    const tryPlay = () => {
      if (reachedPause && sceneSettled && minHoldPassed) {
        timelineRef.current?.play();
      }
    };

    const markPauseReached = () => {
      reachedPause = true;
      tryPlay();
    };

    const minHoldTimer = window.setTimeout(() => {
      minHoldPassed = true;
      tryPlay();
    }, MIN_INTRO_HOLD_MS);

    const capTimer = window.setTimeout(() => {
      sceneSettled = true;
      tryPlay();
    }, MAX_SCENE_WAIT_MS);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2, onComplete: finish });
      timelineRef.current = tl;

      // Estado de partida do texto: igual nos dois modos, menos o deslocamento.
      gsap.set(".intro-line-1", {
        autoAlpha: 0,
        y: reduceMotion ? 0 : 60,
        scale: reduceMotion ? 1 : 0.85,
        filter: reduceMotion ? "none" : "blur(20px)",
        rotationX: reduceMotion ? 0 : -20,
      });

      if (reduceMotion) {
        /*
          Versao sem movimento: as frases aparecem, respiram e saem. Nada de
          zoom, card subindo ou escala do conteudo. A abertura continua
          existindo, que era o ponto.
        */
        gsap.set(".intro-line-2", { autoAlpha: 0, clipPath: "none" });

        tl.to(".intro-line-1", { autoAlpha: 1, duration: 0.5, ease: "power1.out" })
          .to(
            ".intro-line-2",
            { autoAlpha: 1, duration: 0.5, ease: "power1.out" },
            "-=0.25",
          )
          .addPause(undefined, markPauseReached)
          .to([".intro-line-1", ".intro-line-2"], {
            autoAlpha: 0,
            duration: 0.4,
            ease: "power1.in",
          })
          .to(overlayRef.current, { autoAlpha: 0, duration: 0.4 }, "-=0.15");
      } else {
        gsap.set(".intro-line-2", { autoAlpha: 1, clipPath: "inset(0 100% 0 0)" });
        gsap.set(".intro-card", { yPercent: 120, autoAlpha: 1 });
        gsap.set(".intro-brand", { autoAlpha: 0, scale: 0.94 });
        gsap.set(contentRef.current, { scale: 0.94, transformOrigin: "center center" });

        tl
          .to(".intro-line-1", {
            duration: 1.0,
            autoAlpha: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            rotationX: 0,
            ease: "expo.out",
          })
          .to(
            ".intro-line-2",
            { duration: 0.8, clipPath: "inset(0 0% 0 0)", ease: "power4.inOut" },
            "-=0.7",
          )
          // Aqui a cortina espera o robo. O teto de tempo garante que ela suba.
          .addPause(undefined, markPauseReached)
          .add("recuo", "+=0.2")
          .to(
            [".intro-text", ".intro-lattice"],
            {
              scale: 1.15,
              filter: "blur(20px)",
              autoAlpha: 0,
              ease: "power2.inOut",
              duration: 1.0,
            },
            "recuo",
          )
          .to(".intro-card", { yPercent: 0, ease: "power3.inOut", duration: 1.0 }, "recuo")
          .to(
            ".intro-brand",
            { autoAlpha: 1, scale: 1, ease: "power2.out", duration: 0.5 },
            "-=0.4",
          )
          .to(
            ".intro-brand",
            { autoAlpha: 0, scale: 1.04, ease: "power2.in", duration: 0.4 },
            "+=0.3",
          )
          .to(
            ".intro-card",
            {
              width: "100vw",
              height: "100dvh",
              borderRadius: 0,
              ease: "power3.inOut",
              duration: 0.6,
            },
            "<",
          )
          .to(contentRef.current, { scale: 1, ease: "power3.out", duration: 1.0 }, "-=0.25")
          .to(overlayRef.current, { autoAlpha: 0, duration: 0.6, ease: "power2.inOut" }, "<0.15");
      }
    }, rootRef);

    // A cena avisa por aqui. Pode ter avisado antes deste efeito montar.
    releaseRef.current = () => {
      sceneSettled = true;
      tryPlay();
    };
    if (sceneReadyRef.current) {
      sceneSettled = true;
      tryPlay();
    }

    /** Pular a intro: Esc, Enter, espaco ou clique. */
    const skip = () => {
      const tl = timelineRef.current;
      if (!tl) return;
      tl.play();
      tl.progress(1);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (["Escape", "Enter", " "].includes(event.key)) skip();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(capTimer);
      window.clearTimeout(minHoldTimer);
      window.removeEventListener("keydown", onKeyDown);
      releaseRef.current = null;
      ctx.revert();
      unlockScroll();
    };
  }, []);

  const skipNow = () => {
    const tl = timelineRef.current;
    if (!tl) return;
    tl.play();
    tl.progress(1);
  };

  return (
    <div ref={rootRef} className={cn("relative w-full", className)} {...props}>
      {!finished && (
        <div
          ref={overlayRef}
          onClick={skipNow}
          aria-hidden="true"
          className="fixed inset-0 z-[100] flex h-[100dvh] w-screen items-center justify-center overflow-hidden bg-background"
          style={{ perspective: "1500px" }}
        >
          <div className="intro-lattice absolute inset-0 opacity-70">
            <LatticeField interactive={false} intensity={0.85} />
          </div>

          <div className="intro-text absolute z-10 w-screen px-6 text-center [transform-style:preserve-3d]">
            <h1 className="intro-line-1 text-balance text-3xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {tagline1}
            </h1>
            <h1 className="intro-line-2 text-balance pb-2 text-3xl font-light leading-[1.15] tracking-tight text-brand sm:text-5xl lg:text-6xl">
              {tagline2}
            </h1>
          </div>

          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <div className="intro-card relative h-[92dvh] w-[92vw] overflow-hidden rounded-[28px] border border-hairline bg-surface shadow-[0_40px_120px_-24px_rgba(0,0,0,0.9)] md:h-[86dvh] md:w-[86vw] md:rounded-[32px]">
              <div className="absolute inset-0 opacity-45">
                <LatticeField interactive={false} intensity={0.7} />
              </div>

              <div className="intro-brand absolute inset-0 z-10 flex flex-col items-center justify-center gap-5">
                <span className="grid h-16 w-16 place-items-center rounded-2xl bg-surface-raised text-brand ring-1 ring-hairline">
                  <NexusMark className="h-9 w-9" />
                </span>
                <span className="text-xl tracking-tight">
                  <span className="font-semibold text-foreground">
                    {brand.nameParts.lead}
                  </span>{" "}
                  <span className="font-light text-muted-foreground">
                    {brand.nameParts.trail}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        ref={contentRef}
        className={cn("relative z-0", !finished && "will-change-transform")}
      >
        <IntroContext.Provider value={{ done: finished, reportSceneReady }}>
          {children}
        </IntroContext.Provider>
      </div>
    </div>
  );
}
