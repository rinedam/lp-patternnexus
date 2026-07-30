import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Palavra que alterna entre duas grafias com um glitch curto.
 *
 * No hero, "padrão" vira "Pattern" e volta. Nao e enfeite: e a explicacao do
 * nome da empresa acontecendo na propria frase, sem precisar de um paragrafo
 * dizendo "Pattern quer dizer padrao".
 *
 * TRES COISAS QUE PRECISAM SER ASSIM:
 *
 * 1. LARGURA RESERVADA. As duas grafias tem larguras diferentes (~0.25em). Se o
 *    container encolhesse e crescesse, o resto do titulo dancaria a cada troca e
 *    poderia ate reflowar de linha. As duas palavras ficam empilhadas na mesma
 *    celula de grid, invisiveis, e a celula assume a largura da maior. Sobra uma
 *    folga fixa quando a palavra curta esta na tela: e o preco de zero salto.
 *
 * 2. O CICLO VIVE EM REFS, NAO NAS DEPENDENCIAS DO EFEITO. Este foi o bug do
 *    Pipeline: efeito com o passo atual nas deps se recria a cada avanco e o
 *    cleanup cancela o timer em voo. Aqui o efeito roda uma vez e a corrente de
 *    timers se mantem sozinha.
 *
 * 3. MOVIMENTO REDUZIDO NAO E MOVIMENTO ZERO. O que incomoda e o tremor e o
 *    embaralhamento. Some os dois; a troca continua, em crossfade lento.
 */

/** Alfabeto do embaralhamento: tecnico, mas com larguras parecidas com letras. */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&$/<>";

const SCRAMBLE_MS = 340;
/** Quanto tempo cada grafia fica parada na tela. */
const HOLD_PRIMARY_MS = 7500;
const HOLD_ALT_MS = 2000;
/** Movimento reduzido: crossfade em vez de glitch. */
const FADE_OUT_MS = 220;
const HOLD_PRIMARY_REDUCED_MS = 8000;
const HOLD_ALT_REDUCED_MS = 2500;

export function GlitchWord({
  from,
  to,
  className,
  play = true,
}: {
  /** Grafia inicial, a que aparece na maior parte do tempo. */
  from: string;
  /** Grafia alternativa. */
  to: string;
  className?: string;
  /** Segura o ciclo ate a hora certa (no hero, ate a intro sair). */
  play?: boolean;
}) {
  const hostRef = useRef<HTMLSpanElement>(null);
  const slotRef = useRef(0);
  const [display, setDisplay] = useState(from);
  const [glitching, setGlitching] = useState(false);
  const [fading, setFading] = useState(false);
  const [inView, setInView] = useState(true);

  /* Fora da tela o ciclo para: sem timers nem rAF rodando a toa. */
  useEffect(() => {
    const el = hostRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!play || !inView) return;

    // Ignoramos a preferência de movimento reduzido para este componente específico,
    // pois o usuário deseja ver o efeito de glitch/pixels em todos os casos.
    const reduce = false;
    let cancelled = false;
    let raf = 0;
    let timer = 0;

    const later = (ms: number, fn: () => void) => {
      timer = window.setTimeout(fn, ms);
    };

    /*
      Embaralhamento com resolucao progressiva: cada posicao tem seu proprio
      instante de assentar, da esquerda para a direita com um pouco de sorteio.
      Fica mais legivel do que embaralhar a palavra inteira ate o ultimo frame.
    */
    const scrambleTo = (target: string, done: () => void) => {
      const settleAt = Array.from(target, (_, i) =>
        (i / target.length) * 0.45 + Math.random() * 0.4,
      );
      const startedAt = performance.now();
      setGlitching(true);

      const frame = (now: number) => {
        if (cancelled) return;
        const progress = Math.min(1, (now - startedAt) / SCRAMBLE_MS);

        // Durante o glitch, usamos caracteres aleatorios para dar o efeito de pixels bugados
        setDisplay(
          Array.from(target, (char, i) =>
            progress >= settleAt[i]
              ? char
              : GLYPHS[(Math.random() * GLYPHS.length) | 0],
          ).join(""),
        );

        if (progress < 1) {
          raf = requestAnimationFrame(frame);
          return;
        }
        setDisplay(target);
        setGlitching(false);
        done();
      };

      raf = requestAnimationFrame(frame);
    };

    const cycle = () => {
      const next = slotRef.current === 0 ? 1 : 0;
      slotRef.current = next;
      const target = next === 1 ? to : from;

      if (reduce) {
        setFading(true);
        later(FADE_OUT_MS, () => {
          if (cancelled) return;
          setDisplay(target);
          setFading(false);
          later(next === 1 ? HOLD_ALT_REDUCED_MS : HOLD_PRIMARY_REDUCED_MS, cycle);
        });
        return;
      }

      scrambleTo(target, () => {
        later(next === 1 ? HOLD_ALT_MS : HOLD_PRIMARY_MS, cycle);
      });
    };

    later(reduce ? HOLD_PRIMARY_REDUCED_MS : HOLD_PRIMARY_MS, cycle);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      setGlitching(false);
      setFading(false);
    };
  }, [play, inView, from, to]);

  return (
    <span
      ref={hostRef}
      className={cn("relative inline-grid align-baseline", className)}
    >
      {/* Fantasmas de medida: definem a largura da celula pela grafia maior. */}
      <span aria-hidden="true" className="invisible col-start-1 row-start-1 whitespace-pre">
        {from}
      </span>
      <span aria-hidden="true" className="invisible col-start-1 row-start-1 whitespace-pre">
        {to}
      </span>

      <span
        aria-hidden="true"
        data-text={display}
        data-glitching={glitching || undefined}
        data-fading={fading || undefined}
        className="glitch-word col-start-1 row-start-1 whitespace-pre"
      >
        {display}
        
        {/* Camadas extras para o efeito visual de pixel/glitch */}
        {glitching && (
          <>
            <span className="glitch-echo-a" aria-hidden="true" data-text={display}>
              {display}
            </span>
            <span className="glitch-echo-b" aria-hidden="true" data-text={display}>
              {display}
            </span>
            <span className="glitch-pixel-overlay" aria-hidden="true" />
          </>
        )}
      </span>
    </span>
  );
}
