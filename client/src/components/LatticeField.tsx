import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * LatticeField - a malha viva da Pattern Nexus.
 *
 * Uma rede de nos conectados onde pulsos percorrem caminhos reais do grafo.
 * Nao e decoracao: e a metafora do produto. Automacao e exatamente isto, algo
 * entrando por um no e atravessando o sistema ate virar acao.
 *
 * Regras de performance respeitadas aqui:
 * - nenhum estado do React e tocado por frame; tudo vive em refs
 * - o rAF pausa quando o canvas sai da viewport ou a aba perde o foco
 * - prefers-reduced-motion desenha um unico quadro estatico, sem laco
 */

type Node = {
  /** Posicao de repouso na grade. */
  baseX: number;
  baseY: number;
  /** Posicao renderizada, ja com deriva e repulsao do ponteiro. */
  x: number;
  y: number;
  /** Defasagem para que a deriva de cada no seja dessincronizada. */
  phase: number;
  /** Brilho atual, 0 a 1. Sobe perto do cursor e quando um pulso passa. */
  glow: number;
};

type Edge = { a: number; b: number };

type Pulse = {
  /** Sequencia de indices de nos que o pulso percorre. */
  path: number[];
  /** Segmento atual dentro do caminho. */
  segment: number;
  /** Progresso dentro do segmento, 0 a 1. */
  t: number;
  speed: number;
};

const SPACING = 78;
const MAX_NODES = 260;
const POINTER_RADIUS = 170;
const PULSE_PATH_LENGTH = 5;
const MAX_PULSES = 3;

function readCssColor(el: HTMLElement, name: string, fallback: string) {
  const value = getComputedStyle(el).getPropertyValue(name).trim();
  return value || fallback;
}

/** Converte "#2dd4a7" em "45, 212, 167" para uso em rgba(). */
function hexToRgbTuple(hex: string, fallback: string) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!match) return fallback;
  return `${parseInt(match[1], 16)}, ${parseInt(match[2], 16)}, ${parseInt(match[3], 16)}`;
}

export default function LatticeField({
  className,
  interactive = true,
  intensity = 1,
}: {
  className?: string;
  /** Desliga a reacao ao ponteiro em contextos onde ela distrairia. */
  interactive?: boolean;
  /** Multiplicador de opacidade geral, para usos mais discretos. */
  intensity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const brandHex = readCssColor(document.documentElement, "--brand", "#2dd4a7");
    const brandRgb = hexToRgbTuple(brandHex, "45, 212, 167");
    const lineRgb = "138, 151, 166";

    let nodes: Node[] = [];
    let edges: Edge[] = [];
    let pulses: Pulse[] = [];
    /** Lista de adjacencia, usada para sortear o caminho de cada pulso. */
    let neighbors: number[][] = [];

    let width = 0;
    let height = 0;
    let frame = 0;
    let running = false;
    let startedAt = performance.now();

    const pointer = { x: -9999, y: -9999, active: false };

    function build() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (width === 0 || height === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Espacamento cresce em telas grandes para segurar a contagem de nos.
      let spacing = SPACING;
      let cols = Math.ceil(width / spacing) + 1;
      let rows = Math.ceil(height / spacing) + 1;
      while (cols * rows > MAX_NODES && spacing < 220) {
        spacing += 8;
        cols = Math.ceil(width / spacing) + 1;
        rows = Math.ceil(height / spacing) + 1;
      }

      nodes = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Jitter deterministico: a malha nao pode parecer papel milimetrado.
          const seed = Math.sin(r * 12.9898 + c * 78.233) * 43758.5453;
          const jx = ((seed - Math.floor(seed)) - 0.5) * spacing * 0.42;
          const seed2 = Math.sin(c * 39.3468 + r * 11.135) * 24634.6345;
          const jy = ((seed2 - Math.floor(seed2)) - 0.5) * spacing * 0.42;

          nodes.push({
            baseX: c * spacing + jx,
            baseY: r * spacing + jy,
            x: c * spacing + jx,
            y: r * spacing + jy,
            phase: (seed - Math.floor(seed)) * Math.PI * 2,
            glow: 0,
          });
        }
      }

      // Liga cada no ao vizinho da direita e ao de baixo: malha limpa, sem
      // diagonais cruzadas competindo visualmente.
      edges = [];
      neighbors = nodes.map(() => []);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          if (c + 1 < cols) {
            const j = i + 1;
            edges.push({ a: i, b: j });
            neighbors[i].push(j);
            neighbors[j].push(i);
          }
          if (r + 1 < rows) {
            const j = i + cols;
            edges.push({ a: i, b: j });
            neighbors[i].push(j);
            neighbors[j].push(i);
          }
        }
      }

      pulses = [];
    }

    function spawnPulse() {
      if (nodes.length === 0) return;
      const path: number[] = [Math.floor(Math.random() * nodes.length)];
      for (let step = 0; step < PULSE_PATH_LENGTH; step++) {
        const current = path[path.length - 1];
        const options = neighbors[current]?.filter(
          (n) => n !== path[path.length - 2],
        );
        if (!options || options.length === 0) break;
        path.push(options[Math.floor(Math.random() * options.length)]);
      }
      if (path.length < 2) return;
      pulses.push({ path, segment: 0, t: 0, speed: 0.011 + Math.random() * 0.012 });
    }

    function draw(now: number) {
      const elapsed = (now - startedAt) / 1000;
      ctx!.clearRect(0, 0, width, height);

      // 1. Posicoes: deriva lenta mais repulsao suave do ponteiro.
      for (const node of nodes) {
        const driftX = reduceMotion ? 0 : Math.sin(elapsed * 0.32 + node.phase) * 4;
        const driftY = reduceMotion ? 0 : Math.cos(elapsed * 0.26 + node.phase) * 4;
        let x = node.baseX + driftX;
        let y = node.baseY + driftY;

        let proximity = 0;
        if (interactive && pointer.active) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < POINTER_RADIUS && dist > 0.001) {
            proximity = 1 - dist / POINTER_RADIUS;
            const push = proximity * proximity * 16;
            x += (dx / dist) * push;
            y += (dy / dist) * push;
          }
        }

        node.x = x;
        node.y = y;
        // Decai o brilho a cada frame; pulso e cursor reinjetam luz.
        node.glow = Math.max(node.glow * 0.94, proximity);
      }

      // 2. Arestas em um unico traco: uma chamada de stroke para a malha toda.
      ctx!.beginPath();
      for (const edge of edges) {
        const a = nodes[edge.a];
        const b = nodes[edge.b];
        ctx!.moveTo(a.x, a.y);
        ctx!.lineTo(b.x, b.y);
      }
      ctx!.strokeStyle = `rgba(${lineRgb}, ${0.1 * intensity})`;
      ctx!.lineWidth = 1;
      ctx!.stroke();

      // 3. Pulsos: cauda com gradiente e cabeca luminosa.
      if (!reduceMotion) {
        for (let p = pulses.length - 1; p >= 0; p--) {
          const pulse = pulses[p];
          pulse.t += pulse.speed;
          if (pulse.t >= 1) {
            pulse.t = 0;
            pulse.segment++;
            if (pulse.segment >= pulse.path.length - 1) {
              pulses.splice(p, 1);
              continue;
            }
          }

          const from = nodes[pulse.path[pulse.segment]];
          const to = nodes[pulse.path[pulse.segment + 1]];
          if (!from || !to) {
            pulses.splice(p, 1);
            continue;
          }

          const hx = from.x + (to.x - from.x) * pulse.t;
          const hy = from.y + (to.y - from.y) * pulse.t;

          const gradient = ctx!.createLinearGradient(from.x, from.y, hx, hy);
          gradient.addColorStop(0, `rgba(${brandRgb}, 0)`);
          gradient.addColorStop(1, `rgba(${brandRgb}, ${0.85 * intensity})`);
          ctx!.beginPath();
          ctx!.moveTo(from.x, from.y);
          ctx!.lineTo(hx, hy);
          ctx!.strokeStyle = gradient;
          ctx!.lineWidth = 1.6;
          ctx!.stroke();

          ctx!.beginPath();
          ctx!.arc(hx, hy, 2.4, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(${brandRgb}, ${0.95 * intensity})`;
          ctx!.fill();

          // O no de destino acende quando o pulso se aproxima.
          to.glow = Math.max(to.glow, pulse.t * 0.9);
          from.glow = Math.max(from.glow, (1 - pulse.t) * 0.6);
        }

        if (pulses.length < MAX_PULSES && Math.random() < 0.018) {
          spawnPulse();
        }
      }

      // 4. Nos: base neutra, acendendo em cor de marca conforme o brilho.
      for (const node of nodes) {
        const glow = node.glow;
        const radius = 1.3 + glow * 2.4;
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx!.fillStyle =
          glow > 0.03
            ? `rgba(${brandRgb}, ${(0.25 + glow * 0.75) * intensity})`
            : `rgba(${lineRgb}, ${0.28 * intensity})`;
        ctx!.fill();

        if (glow > 0.35) {
          ctx!.beginPath();
          ctx!.arc(node.x, node.y, radius + 5 * glow, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(${brandRgb}, ${glow * 0.1 * intensity})`;
          ctx!.fill();
        }
      }
    }

    function loop(now: number) {
      draw(now);
      frame = requestAnimationFrame(loop);
    }

    function start() {
      if (running || reduceMotion) return;
      running = true;
      frame = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(frame);
    }

    function handlePointerMove(event: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    }

    function handlePointerLeave() {
      pointer.active = false;
    }

    function handleVisibility() {
      if (document.hidden) stop();
      else start();
    }

    build();
    // Um quadro imediato garante que a malha ja apareca desenhada, inclusive
    // sob prefers-reduced-motion, onde o laco nunca roda.
    startedAt = performance.now();
    draw(startedAt);

    const resizeObserver = new ResizeObserver(() => {
      build();
      draw(performance.now());
    });
    resizeObserver.observe(canvas);

    // Fora da viewport o canvas nao gasta frame algum.
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
        else stop();
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(canvas);

    if (interactive) {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      window.addEventListener("pointerdown", handlePointerMove, { passive: true });
      document.addEventListener("pointerleave", handlePointerLeave);
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      if (interactive) {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerdown", handlePointerMove);
        document.removeEventListener("pointerleave", handlePointerLeave);
      }
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [interactive, intensity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("h-full w-full", className)}
    />
  );
}
