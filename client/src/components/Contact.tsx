import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Mail, MessageCircle } from "lucide-react";
import { contact, whatsappUrl, cta } from "@/lib/brand";
import { NexusMark } from "@/components/brand/Wordmark";
import { SplitLines } from "@/components/motion/ScrollText";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Contato, no formato de fechamento da pagina.
 *
 * Canais diretos em vez de formulario. O projeto nao tem endpoint para receber
 * envio, e um formulario que engole a mensagem sem entregar em lugar nenhum e
 * pior do que nao ter formulario. Quando existir uma rota de backend, esta
 * secao e o lugar de trocar.
 *
 * DUAS DIVERGENCIAS CONSCIENTES DA REFERENCIA:
 *
 * 1. Lá o cartao final inverte para um gradiente claro. Aqui nao: o sistema
 *    visual desta marca e travado em escuro e nenhuma secao inverte no meio da
 *    pagina (ver o topo do index.css). O destaque vem do halo da cor de marca,
 *    que produz o mesmo "isto e o ponto de chegada" sem furar a paleta.
 *
 * 2. Os cartoes flutuantes da referencia carregam metricas ("+145 leads hoje").
 *    Nao temos numero real para colocar ali, e inventar um seria exatamente o
 *    que o brand.ts proibe. Eles carregam COMPROMISSOS - que sao verdadeiros,
 *    verificaveis e, no fim, um argumento mais forte que um contador.
 */

/** Compromissos que ja aparecem na secao de padrao, aqui em forma de selo. */
const floats = [
  { text: "rollback testado em toda entrega", side: "left", top: "8%" },
  { text: "o código é seu desde o commit 1", side: "right", top: "18%" },
  { text: "o erro chega para nós primeiro", side: "left", top: "72%" },
  { text: "toda decisão fica registrada", side: "right", top: "80%" },
] as const;

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);

  const channels = [
    {
      id: "whatsapp",
      icon: MessageCircle,
      label: "WhatsApp",
      value: "Resposta no mesmo dia útil",
      href: whatsappUrl,
      external: true,
    },
    {
      id: "email",
      icon: Mail,
      label: "E-mail",
      value: contact.email,
      href: `mailto:${contact.email}`,
      external: false,
    },
  ];

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      /*
        O cartao chega menor e cresce ate o tamanho cheio enquanto sobe pela
        tela. O intervalo termina em "center 58%", um pouco antes do centro: o
        cartao precisa estar inteiro ANTES de virar o assunto da tela, senao o
        leitor ve o fim da animacao em vez do conteudo.
      */
      gsap.fromTo(
        ".cta-card",
        { scale: 0.93, y: 44 },
        {
          scale: 1,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "center 58%",
            scrub: 0.7,
          },
        },
      );

      // O halo acompanha, um pouco atrasado, para a luz parecer vir de tras.
      gsap.fromTo(
        ".cta-halo",
        { opacity: 0.2, scale: 0.85 },
        {
          opacity: 0.7,
          scale: 1.1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "center 50%",
            scrub: 1.1,
          },
        },
      );

      /*
        Os selos sobem em velocidades diferentes. E o unico lugar da pagina em
        que ha parallax entre elementos irmaos, e serve para o cartao central
        parecer mais perto do leitor do que eles.
      */
      gsap.utils.toArray<HTMLElement>(".cta-float").forEach((el, i) => {
        gsap.fromTo(
          el,
          { yPercent: 40 + i * 14, opacity: 0 },
          {
            yPercent: -18 - i * 10,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 1 + i * 0.2,
            },
          },
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contato"
      className="relative overflow-hidden border-t border-hairline py-24 md:py-32"
    >
      {/* Halo de chegada, atras do cartao. */}
      <div
        aria-hidden="true"
        className="cta-halo pointer-events-none absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(45,212,167,0.20),transparent_62%)]"
      />

      {/* Selos flutuantes: escondidos no celular, onde nao ha margem para eles. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden xl:block">
        {floats.map((f) => (
          <span
            key={f.text}
            className={cn(
              "cta-float absolute whitespace-nowrap rounded-full border border-hairline bg-surface/85 px-4 py-2 text-[0.7rem] text-muted-foreground backdrop-blur-sm",
              f.side === "left" ? "left-[2%] 2xl:left-[6%]" : "right-[2%] 2xl:right-[6%]",
            )}
            style={{ top: f.top }}
          >
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-brand align-middle" />
            {f.text}
          </span>
        ))}
      </div>

      <div className="container relative">
        <div className="cta-card relative overflow-hidden rounded-[calc(var(--radius)+12px)] border border-hairline-strong bg-[linear-gradient(165deg,#0d141d_0%,var(--surface)_45%,#070b11_100%)] p-8 md:p-14 lg:p-16">
          <div
            aria-hidden="true"
            className="lattice-grid lattice-fade pointer-events-none absolute inset-0 opacity-40"
          />
          {/* Luz interna vinda do canto, no lugar do Spotlight que seguia o cursor:
              esta secao e o fim da pagina, e aqui a luz precisa ser estavel. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(45,212,167,0.16),transparent_65%)]"
          />

          <div className="relative grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <span className="mb-9 grid h-12 w-12 place-items-center text-brand">
                <NexusMark />
              </span>

              <SplitLines
                as="h2"
                className="text-balance text-[clamp(1.9rem,4.2vw,2.9rem)] font-semibold leading-[1.06] tracking-[-0.025em] text-foreground"
              >
                Vamos olhar seu processo antes de propor{" "}
                <span className="text-brand">qualquer coisa</span>.
              </SplitLines>

              <p className="mt-7 max-w-[52ch] text-pretty leading-relaxed text-muted-foreground">
                A primeira conversa é um diagnóstico. Você mostra como o trabalho
                acontece hoje, e a gente aponta onde vale automatizar e, com a
                mesma franqueza, onde não vale.
              </p>

              <Reveal className="mt-10" y={14} delay={0.1}>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-medium text-brand-foreground transition-transform duration-300 hover:-translate-y-0.5"
                >
                  {cta.primary}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </Reveal>
            </div>

            {/* Centralizado na vertical: alinhado ao topo sobrava um vazio
                grande embaixo da segunda opcao de contato. */}
            <div className="lg:col-span-5 lg:flex lg:flex-col lg:justify-center">
              <Reveal as="ul" className="flex flex-col gap-3" delay={0.15}>
                {channels.map((channel) => (
                  <li key={channel.id}>
                    <a
                      href={channel.href}
                      {...(channel.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="group flex items-center gap-4 rounded-xl border border-hairline bg-surface-raised/70 p-5 transition-colors duration-200 hover:border-brand/40"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface text-brand ring-1 ring-hairline">
                        <channel.icon className="h-[1.15rem] w-[1.15rem]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-foreground">
                          {channel.label}
                        </span>
                        <span className="block truncate text-sm text-muted-foreground">
                          {channel.value}
                        </span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:text-brand" />
                    </a>
                  </li>
                ))}
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
