import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import LatticeField from "./LatticeField";
import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { useIntroDone, useReportSceneReady } from "./CinematicIntro";
import { brand, cta } from "@/lib/brand";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const SPLINE_SCENE = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

/**
 * Hero.
 *
 * Tres camadas de movimento, cada uma com uma funcao:
 *   fundo  - a malha reage ao ponteiro e da textura viva
 *   foco   - o Spotlight segue o cursor e ilumina a area sob ele
 *   frente - a cena 3D responde ao mouse e sustenta o "olha o que eles
 *            conseguem fazer", que e o trabalho principal desta tela
 *
 * SOBRE A AREA DE RASTREIO DA CENA 3D:
 *
 * O runtime do Spline so escuta ponteiro dentro do proprio canvas. Quando o
 * canvas ocupava apenas a coluna da direita, o robo so reagia numa ilha em volta
 * dele. Aqui o canvas atravessa o hero inteiro e e mais largo que a viewport,
 * deslocado para que o robo continue caindo a direita enquanto a area sensivel
 * cobre toda a secao. Por isso a copy e o veu ficam com pointer-events
 * desligados: se capturassem o ponteiro, o canvas embaixo pararia de receber.
 */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [sceneReady, setSceneReady] = useState(false);
  const [allowScene, setAllowScene] = useState<boolean | null>(null);

  const introDone = useIntroDone();
  const reportSceneReady = useReportSceneReady();

  /*
    A cena precisa ser condicionada por MONTAGEM, nao por CSS. Com
    `hidden md:block` o componente montava mesmo invisivel, e o runtime do
    Spline era baixado e executado em celular sem nunca aparecer na tela.
  */
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const sync = () => setAllowScene(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Sem cena para esperar, a cortina da intro pode subir imediatamente.
  useEffect(() => {
    if (allowScene === false) reportSceneReady();
  }, [allowScene, reportSceneReady]);

  // Parallax de saida: a copy e a cena sobem em velocidades diferentes.
  useLayoutEffect(() => {
    if (reduceMotion) return;
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.to(copyRef.current, {
        yPercent: -18,
        opacity: 0.15,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });
      gsap.to(sceneRef.current, {
        yPercent: -8,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });
    }, section);

    return () => ctx.revert();
  }, [reduceMotion, allowScene]);

  return (
    <section
      ref={sectionRef}
      id="topo"
      className="relative min-h-[100dvh] overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <LatticeField intensity={0.75} />
      </div>

      {/*
        A cena 3D, atravessando o hero inteiro. Mais larga que a viewport e
        deslocada, para que o robo fique a direita e mesmo assim o canvas
        receba o ponteiro de ponta a ponta da secao.
      */}
      {allowScene && (
        <div
          ref={sceneRef}
          className="absolute inset-y-0 left-[-3%] z-[1] w-[150%]"
        >
          <motion.div
            initial={false}
            animate={{ opacity: sceneReady ? 1 : 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="h-full w-full"
          >
            <SplineScene
              scene={SPLINE_SCENE}
              className="h-full w-full"
              onLoad={() => {
                setSceneReady(true);
                reportSceneReady();
              }}
              onFail={reportSceneReady}
            />
          </motion.div>
        </div>
      )}

      <Spotlight className="z-[2]" size={520} fill="var(--brand)" />

      {/* Veu de leitura. pointer-events desligado para nao roubar o ponteiro. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[3] bg-[radial-gradient(ellipse_58%_55%_at_18%_50%,rgba(5,7,11,0.96)_0%,rgba(5,7,11,0.6)_45%,transparent_100%)]"
      />

      <div className="pointer-events-none container relative z-10 grid min-h-[100dvh] grid-cols-1 items-center gap-8 pt-28 pb-16 lg:grid-cols-12 lg:gap-4 lg:pt-24 lg:pb-0">
        <div ref={copyRef} className="lg:col-span-6">
          <SplitReveal
            as="h1"
            trigger="load"
            delay={0.15}
            play={introDone}
            text="Automação no padrão que sua operação exige."
            highlight={["padrão"]}
            /*
              A palavra vira "Pattern" e volta. O nome da empresa se explica
              sozinho na frase, sem um paragrafo dizendo o que ele significa.
            */
            morph={{ word: "padrão", to: "pattern" }}
            className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-foreground md:text-5xl lg:text-[3.4rem]"
          />

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={introDone ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.8, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 max-w-[50ch] text-pretty leading-relaxed text-muted-foreground md:text-lg"
          >
            Agentes, integrações e fluxos sob medida. Construídos com rigor de
            engenharia, não montados com atalho de template.
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={introDone ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.8, delay: 0.92, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            {/* Os CTAs reativam o ponteiro: so eles precisam ser clicaveis aqui. */}
            <MagneticButton
              href="#contato"
              className="pointer-events-auto rounded-full bg-brand px-7 py-3.5 text-sm font-medium text-brand-foreground"
            >
              {cta.primary}
              <ArrowUpRight className="h-4 w-4" />
            </MagneticButton>

            <MagneticButton
              href="#capacidades"
              strength={0.25}
              className="pointer-events-auto rounded-full border border-hairline-strong px-7 py-3.5 text-sm font-medium text-foreground transition-colors duration-200 hover:border-brand/50 hover:bg-surface"
            >
              {cta.secondary}
            </MagneticButton>
          </motion.div>
        </div>
      </div>

      <span className="sr-only">{brand.summary}</span>
    </section>
  );
}
