import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import LatticeField from "@/components/LatticeField";
import { Wordmark } from "@/components/brand/Wordmark";

/**
 * 404.
 *
 * Mesmo tema, mesma tipografia e mesma malha do resto do site. Uma pagina de
 * erro em tema claro no meio de um site escuro le como bug, nao como pagina.
 */
export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <main className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="absolute inset-0 z-0 opacity-60">
        <LatticeField interactive={false} intensity={0.8} />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(5,7,11,0.92)_0%,transparent_100%)]"
      />

      <div className="relative z-10 flex flex-col items-center">
        <Wordmark href="/" />

        <p className="tabular mt-12 text-sm text-brand">404</p>
        <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Essa página não existe
        </h1>
        <p className="mt-4 max-w-[46ch] text-pretty leading-relaxed text-muted-foreground">
          O endereço pode ter mudado, ou o link que trouxe você até aqui está
          desatualizado.
        </p>

        <button
          type="button"
          onClick={() => setLocation("/")}
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-brand-foreground transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao início
        </button>
      </div>
    </main>
  );
}
