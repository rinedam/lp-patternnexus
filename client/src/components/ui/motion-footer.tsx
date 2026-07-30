"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Mail, MessageCircle } from "lucide-react";
import { contact, cta, whatsappUrl } from "@/lib/brand";
import { cn } from "@/lib/utils";
import "./motion-footer.css";

// Register ScrollTrigger safely for React
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// -------------------------------------------------------------------------
// 2. MAGNETIC BUTTON PRIMITIVE (Zero Dependency)
// -------------------------------------------------------------------------
export type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & 
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: React.ElementType;
  };

const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const element = localRef.current;
      if (!element) return;

      const ctx = gsap.context(() => {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = element.getBoundingClientRect();
          const h = rect.width / 2;
          const w = rect.height / 2;
          const x = e.clientX - rect.left - h;
          const y = e.clientY - rect.top - w;

          gsap.to(element, {
            x: x * 0.4,
            y: y * 0.4,
            rotationX: -y * 0.15,
            rotationY: x * 0.15,
            scale: 1.05,
            ease: "power2.out",
            duration: 0.4,
          });
        };

        const handleMouseLeave = () => {
          gsap.to(element, {
            x: 0,
            y: 0,
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            ease: "elastic.out(1, 0.3)",
            duration: 1.2,
          });
        };

        element.addEventListener("mousemove", handleMouseMove as any);
        element.addEventListener("mouseleave", handleMouseLeave);

        return () => {
          element.removeEventListener("mousemove", handleMouseMove as any);
          element.removeEventListener("mouseleave", handleMouseLeave);
        };
      }, element);

      return () => ctx.revert();
    },[]);

    return (
      <Component
        ref={(node: HTMLElement) => {
          (localRef as any).current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) (forwardedRef as any).current = node;
        }}
        className={cn("cursor-pointer", className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
MagneticButton.displayName = "MagneticButton";

// -------------------------------------------------------------------------
// 3. MAIN COMPONENT
// -------------------------------------------------------------------------
const MarqueeItem = () => (
  <div className="flex items-center space-x-12 px-6">
    <span>Automação com IA</span> <span className="text-primary/60">✦</span>
    <span>Sites Landing Page</span> <span className="text-secondary/60">✦</span>
    <span>Serviços de TI</span> <span className="text-primary/60">✦</span>
  </div>
);

/**
 * Metade do trilho da marquee.
 *
 * O keyframe anda exatamente `-50%`, entao cada grupo e uma volta completa: no
 * instante em que o primeiro sai de cena o segundo esta na posicao original e o
 * ciclo reinicia sem costura visivel. Os dois grupos precisam ser identicos.
 */
const MarqueeGroup = () => (
  <div className="footer-marquee-group flex shrink-0 items-center justify-around">
    <MarqueeItem />
    <MarqueeItem />
  </div>
);

export function CinematicFooter() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!wrapperRef.current) return;

    // React strict mode compatible GSAP context cleanup
    const ctx = gsap.context(() => {
      // Background Parallax
      gsap.fromTo(
        giantTextRef.current,
        { y: "10vh", scale: 0.8, opacity: 0 },
        {
          y: "0vh",
          scale: 1,
          opacity: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 80%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );

      // Staggered Content Reveal
      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 40%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );
    }, wrapperRef);

    return () => ctx.revert();
  },[]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>

      
      {/*
        The "Curtain Reveal" Wrapper:
        It sits in standard flow. Because it has clip-path, its contents
        are ONLY visible within its bounding box.
      */}
      {/*
        Abaixo de lg o rodape sai do modo "pinado" (fixed + h-[70vh] dentro de
        um espacador h-screen). Com pouca altura de tela e texto que quebra
        linha, o conteudo passava dos 70vh e o overflow-hidden cortava metade
        do rodape no celular. Em fluxo normal (relative, altura automatica) o
        conteudo nunca estoura o proprio container, porque o container e do
        tamanho do conteudo.
      */}
      <div
        ref={wrapperRef}
        className="relative w-full lg:h-screen"
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        {/* Acima de lg o rodape fica fixed, revelado por baixo do espacador acima. */}
        <footer className="relative flex w-full flex-col justify-between overflow-hidden bg-background text-foreground cinematic-footer-wrapper lg:fixed lg:bottom-0 lg:left-0 lg:h-[70vh]">
          
          {/*
            Ambient Light & Grid Background.

            A centralizacao vive so no keyframe `footer-breathe`, que ja carrega
            `translate(-50%, -50%)`. Somar as utilities `-translate-x-1/2
            -translate-y-1/2` duplicava o deslocamento - no Tailwind v4 elas
            escrevem a propriedade `translate`, que se acumula com o `transform`
            da animacao - e jogava o halo para o canto superior esquerdo.
          */}
          <div className="footer-aurora absolute left-1/2 top-1/2 h-[60vh] w-[80vw] animate-footer-breathe rounded-[50%] blur-[80px] pointer-events-none z-0" />
          <div className="footer-bg-grid absolute inset-0 z-0 pointer-events-none" />

          {/*
            Giant background text.

            A centralizacao e de layout (`inset-x-0` + `text-center`), nunca de
            transform: o GSAP abaixo assume o `transform` deste elemento e
            converte qualquer translate percentual em pixels fixos no momento em
            que o tween nasce. Com `left-1/2 -translate-x-1/2` o offset era
            congelado com a largura da fonte de fallback e nunca mais recalculado
            - a palavra saia do centro quando a webfont chegava e ia para fora da
            tela em qualquer resize.

            `hidden lg:block`: o `bottom-[5vh]` mede a partir da base do
            proprio rodape, que abaixo de lg tem altura automatica (variavel
            com o conteudo) em vez dos 70vh fixos. Com conteudo mais alto que
            a tela, esses 5vh iam bater perto ou em cima da barra de rodape
            (copyright / voltar ao topo). E so marca d'agua decorativa; some
            no celular em vez de arriscar a sobreposicao.
          */}
          <div
            ref={giantTextRef}
            className="footer-giant-bg-text absolute bottom-[5vh] inset-x-0 hidden whitespace-nowrap z-0 pointer-events-none select-none text-center lg:block"
          >
            PATTERN NEXUS
          </div>

          {/*
            1. Diagonal Sleek Marquee (Top of footer)

            O segundo grupo e `aria-hidden`: ele existe so para cobrir a emenda
            do loop, e repetir as tres frases no leitor de tela seria eco.
          */}
          <div className="footer-marquee-strip absolute top-12 left-0 w-full overflow-hidden border-y border-border/50 bg-background/60 backdrop-blur-md py-4 z-10 -rotate-2 scale-110 shadow-2xl">
            <div className="flex w-max animate-footer-scroll-marquee text-xs md:text-sm font-bold tracking-[0.3em] text-muted-foreground uppercase">
              <MarqueeGroup />
              <div aria-hidden="true" className="flex">
                <MarqueeGroup />
              </div>
            </div>
          </div>

          {/* 2. Main Center Content */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 mt-20 w-full max-w-5xl mx-auto">
            <h2
              ref={headingRef}
              className="text-5xl md:text-8xl font-black footer-text-glow tracking-tighter mb-12 text-center"
            >
              Prontos para começar?
            </h2>

            {/*
              Canais diretos, nao apps.

              Um site institucional de automacao/IA nao tem app de celular, e
              os dois pills de app store apontavam para "#" - link morto e
              promessa que o site nao cumpre. No lugar entram os mesmos dois
              canais que o resto do site usa para contato (Contact.tsx),
              porque este e o ultimo convite a agir antes do fim da pagina.
            */}
            <div ref={linksRef} className="flex flex-col items-center gap-6 w-full">
              {/* Canais de contato (Primario) */}
              <div className="flex flex-wrap justify-center gap-4 w-full">
                <MagneticButton
                  as="a"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-glass-pill px-10 py-5 rounded-full text-foreground font-bold text-sm md:text-base flex items-center gap-3 group"
                >
                  <MessageCircle className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  {cta.primary}
                </MagneticButton>

                <MagneticButton
                  as="a"
                  href={`mailto:${contact.email}`}
                  className="footer-glass-pill px-10 py-5 rounded-full text-foreground font-bold text-sm md:text-base flex items-center gap-3 group"
                >
                  <Mail className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  Enviar e-mail
                </MagneticButton>
              </div>

              {/* Secondary Text Links */}
              <div className="flex flex-wrap justify-center gap-3 md:gap-6 w-full mt-2">
                <MagneticButton as="a" href="#" className="footer-glass-pill px-6 py-3 rounded-full text-muted-foreground font-medium text-xs md:text-sm hover:text-foreground">
                  Privacy Policy
                </MagneticButton>
                <MagneticButton as="a" href="#" className="footer-glass-pill px-6 py-3 rounded-full text-muted-foreground font-medium text-xs md:text-sm hover:text-foreground">
                  Terms of Service
                </MagneticButton>
                <MagneticButton as="a" href="#" className="footer-glass-pill px-6 py-3 rounded-full text-muted-foreground font-medium text-xs md:text-sm hover:text-foreground">
                  Support
                </MagneticButton>
              </div>
            </div>
          </div>

          {/*
            3. Bottom Bar / Credits

            `mt-16 pt-8 border-t` so valem abaixo de lg: la o `justify-between`
            do rodape (dentro da caixa fixa de 70vh) ja abre esse espaco
            sozinho, e duplicar a margem via classe empurraria a barra para
            fora da caixa.
          */}
          <div className="relative z-20 mt-16 w-full border-t border-hairline px-6 pb-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 lg:mt-0 lg:border-t-0 lg:pt-0 md:px-12">

            {/* Copyright */}
            <div className="text-muted-foreground text-[10px] md:text-xs font-semibold tracking-widest uppercase order-2 md:order-1">
              © 2026 Pattern Nexus. All rights reserved.
            </div>

            {/* Back to top */}
            <MagneticButton
              as="button"
              onClick={scrollToTop}
              className="w-12 h-12 rounded-full footer-glass-pill flex items-center justify-center text-muted-foreground hover:text-foreground group order-3"
            >
              <svg className="w-5 h-5 transform group-hover:-translate-y-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
              </svg>
            </MagneticButton>

          </div>
        </footer>
      </div>
    </>
  );
}
