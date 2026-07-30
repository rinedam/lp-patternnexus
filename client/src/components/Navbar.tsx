import { useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";
import { cta, nav } from "@/lib/brand";

/**
 * Cabecalho da Pattern Nexus.
 *
 * O estado de scroll vem de useScroll do framer-motion, nao de um listener em
 * window: o listener antigo disparava a cada frame de rolagem e re-renderizava
 * a arvore inteira. Aqui o valor so vira estado quando cruza o limiar.
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const next = latest > 24;
    // Só reage na virada do limiar, não a cada pixel rolado.
    setScrolled((current) => (current === next ? current : next));
  });

  return (
    <>
      <motion.header
        initial={reduceMotion ? false : { y: -72, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,padding] duration-300 ${
          scrolled
            ? "border-b border-hairline bg-background/85 py-3 backdrop-blur-xl"
            : "border-b border-transparent py-4"
        }`}
      >
        <div className="container flex items-center justify-between gap-6">
          <Wordmark />

          <nav className="hidden items-center gap-7 md:flex">
            {nav.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="#contato"
              className="hidden items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] md:inline-flex"
            >
              {cta.primary}
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="-mr-2 grid h-11 w-11 place-items-center rounded-full text-foreground md:hidden"
              aria-label="Abrir menu"
              aria-expanded={mobileOpen}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] bg-background md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
          >
            <div className="container flex items-center justify-between py-4">
              <Wordmark />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="-mr-2 grid h-11 w-11 place-items-center rounded-full text-foreground"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="container mt-6 flex flex-col">
              {nav.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  initial={reduceMotion ? false : { x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.06 + 0.08, duration: 0.35 }}
                  className="border-b border-hairline py-5 text-2xl font-medium text-foreground"
                >
                  {link.label}
                </motion.a>
              ))}
              <a
                href="#contato"
                onClick={() => setMobileOpen(false)}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-4 text-base font-medium text-brand-foreground"
              >
                {cta.primary}
                <ArrowUpRight className="h-5 w-5" />
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
