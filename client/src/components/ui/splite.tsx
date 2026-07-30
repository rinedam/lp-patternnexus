import { Suspense, lazy, useState } from "react";
import { cn } from "@/lib/utils";

const Spline = lazy(() => import("@splinetool/react-spline"));

interface SplineSceneProps {
  scene: string;
  className?: string;
  /** Chamado quando a cena termina de carregar, para orquestrar a entrada. */
  onLoad?: () => void;
  /**
   * Chamado quando a cena nao pode ser carregada. Quem espera por ela precisa
   * saber que a espera acabou, senao fica preso aguardando um evento que nunca
   * vem.
   */
  onFail?: () => void;
}

/**
 * Cena 3D do Spline.
 *
 * O runtime do Spline e pesado e a cena vem da rede, entao o componente e
 * carregado sob demanda e trata os dois modos de falha: enquanto baixa mostra um
 * esqueleto, e se a rede cair mostra um aviso discreto em vez de quebrar a
 * secao inteira.
 */
export function SplineScene({
  scene,
  className,
  onLoad,
  onFail,
}: SplineSceneProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={cn("grid h-full w-full place-items-center", className)}>
        <p className="max-w-[24ch] text-center text-xs text-muted-foreground">
          A cena 3D não pôde ser carregada agora.
        </p>
      </div>
    );
  }

  return (
    <Suspense fallback={<SceneSkeleton className={className} />}>
      <Spline
        scene={scene}
        className={className}
        onLoad={onLoad}
        onError={() => {
          setFailed(true);
          onFail?.();
        }}
      />
    </Suspense>
  );
}

/**
 * Esqueleto de carregamento. Um pulso suave na cor da marca, no lugar da classe
 * `loader` do snippet original, que nao existe neste projeto.
 */
function SceneSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("grid h-full w-full place-items-center", className)}>
      <div className="relative h-16 w-16">
        <span className="absolute inset-0 animate-ping rounded-full bg-brand/20" />
        <span className="absolute inset-[30%] rounded-full bg-brand/60" />
      </div>
    </div>
  );
}
