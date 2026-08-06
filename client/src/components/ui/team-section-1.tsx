import {
  useLayoutEffect,
  useRef,
  type ComponentProps,
  type ReactNode,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Reveal } from "@/components/motion/Reveal";
import { SplitLines } from "@/components/motion/ScrollText";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Grade de retratos do time.
 *
 * O QUE FOI DESCARTADO DO COMPONENTE DE ORIGEM, e por que:
 *
 * - Os cartoes rosa/cinza/amarelo vinham de `hsl(var(--destructive)/0.1)` e
 *   `hsl(var(--warning)/0.2)`. Nenhum dos dois funcionaria aqui: os tokens
 *   deste projeto sao hex, nao canais HSL soltos, e `--warning` nem existe.
 *   Renderizaria cor quebrada em dois dos tres cartoes.
 * - Botao "REGISTER NOW", "www.website.com" e o rotulo "O U R" saem porque sao
 *   de outro site. Aqui a secao nao vende nada: ela mostra quem assina.
 * - Icones sociais saem enquanto os perfis nao existirem. O rodape ja tomou
 *   essa decisao antes (ver ideas.md); repetir `href="#"` aqui seria voltar
 *   atras em silencio.
 *
 * O QUE SOBROU: retrato, nome, cargo. E o suficiente, porque a foto carrega o
 * peso - foram feitas na paleta da marca e encostam no fundo da pagina sem
 * moldura pesada em volta.
 */

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo: string;
  /** Descricao da imagem. Sem ela, cai em "Retrato de {name}". */
  alt?: string;
}

export interface TeamSectionProps
  /*
    Omit em `title`: <section> ja tem um atributo HTML `title` (o tooltip), que
    e string. O nosso titulo e ReactNode porque leva grifo dentro da frase.
  */
  extends Omit<ComponentProps<"section">, "title"> {
  title: ReactNode;
  description: ReactNode;
  /** `readonly` para aceitar direto os arrays `as const` do brand.ts. */
  members: readonly TeamMember[];
}

/*
  Altura extra do retrato dentro da moldura, em % da altura da moldura. E dessa
  sobra que sai o curso do parallax: sem ela, deslocar a imagem mostraria o
  fundo vazio da moldura.
*/
const SOBRA = 14;

/*
  Curso de cada retrato, em % da altura da PROPRIA IMAGEM (que e a unidade do
  yPercent). Diferentes de proposito: tres imagens andando na mesma velocidade
  leem como uma foto so, cortada em tres pedacos.
*/
const CURSO = [8, 4, 10];

/*
  Teto do curso. A imagem tem (100 + SOBRA)% da altura da moldura, e so pode
  subir a sobra inteira - o que, medido na altura dela mesma, da menos que
  SOBRA. Calculado em vez de chutado porque quem for mexer no SOBRA depois nao
  precisa refazer a conta para descobrir que a moldura comecou a vazar.
*/
const cursoMaximo = gsap.utils.clamp(0, (SOBRA * 100) / (100 + SOBRA));

export function TeamSection({
  title,
  description,
  members,
  className,
  ...props
}: TeamSectionProps) {
  /*
    O ref fica num embrulho em volta do Reveal, e nao no Reveal, porque ele
    precisa ser a grade em pessoa: o Reveal escalona os PROPRIOS FILHOS, entao
    inserir uma div entre ele e os cartoes faria a cascata animar um elemento
    unico em vez dos tres.
  */
  const gradeRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const grade = gradeRef.current;
    if (!grade) return;

    /*
      matchMedia e nao um `if (reduceMotion) return`: assim o parallax entra e
      sai sozinho se a preferencia mudar com a pagina aberta, e mm.revert()
      devolve as imagens ao lugar.
    */
    const mm = gsap.matchMedia(grade);

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const retratos = gsap.utils.toArray<HTMLElement>(".team-portrait");

      retratos.forEach((retrato, i) => {
        gsap.fromTo(
          retrato,
          { yPercent: 0 },
          {
            yPercent: -cursoMaximo(CURSO[i % CURSO.length]),
            // "none" e obrigatorio em scrub: e o que mantem 1:1 com o scroll.
            ease: "none",
            scrollTrigger: {
              /*
                A moldura, nao o cartao: e ela que recorta, entao e a posicao
                dela que define quando faz sentido a imagem andar por dentro.
              */
              trigger: retrato.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
      });
    });

    return () => mm.revert();
  }, [members.length]);

  return (
    <section
      className={cn(
        "relative border-t border-hairline py-24 md:py-32",
        className
      )}
      {...props}
    >
      <div className="container">
        {/*
          Cabecalho em duas colunas, com o texto de apoio ao LADO do titulo.
          As secoes vizinhas empilham titulo e paragrafo; repetir a mesma forma
          uma terceira vez seguida e o que faz a pagina parecer gerada.

          Sem rotulo `label-mono` aqui de proposito: Pipeline e NexusHand, que
          cercam esta secao, ja tem o deles, e o ideas.md limita a um rotulo a
          cada tres secoes.
        */}
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
          <SplitLines
            as="h2"
            className="max-w-[20ch] text-balance text-[clamp(2rem,4.8vw,3.6rem)] font-semibold leading-[1.04] tracking-[-0.025em] text-foreground lg:col-span-7"
          >
            {title}
          </SplitLines>

          <p className="max-w-[46ch] text-pretty leading-relaxed text-muted-foreground lg:col-span-5">
            {description}
          </p>
        </div>

        <div ref={gradeRef}>
          <Reveal className="mt-16 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:mt-24 lg:grid-cols-3 lg:gap-x-10">
            {members.map((member, i) => (
              <article key={member.id} className="group relative">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[calc(var(--radius)+8px)] border border-hairline bg-surface transition-colors duration-500 group-hover:border-brand/40">
                  {/*
                    DUAS CAMADAS, E ELAS PRECISAM SER DUAS.

                    O parallax e o zoom do hover moram em elementos separados de
                    proposito. Tentar por os dois no <img> nao funciona, e falha
                    em silencio: ao assumir o transform de um elemento, o GSAP
                    escreve INLINE `translate: none; rotate: none; scale: none`
                    nele. E ele faz isso por um bom motivo - sao propriedades
                    CSS independentes que o navegador multiplicaria pelo
                    `transform` - mas o efeito colateral e que qualquer utility
                    de escala do Tailwind v4, que escreve exatamente em `scale`,
                    perde para o inline e nunca aparece. Nenhum erro, nenhum
                    aviso: o hover simplesmente nao acontece.

                    Com o curso no embrulho e a escala na imagem, cada um tem o
                    seu proprio elemento e ninguem zera o outro.

                    A altura extra vai em `style` porque e a mesma constante que
                    o JS usa para calcular o curso. Duas fontes de verdade aqui
                    (uma classe arbitraria + a constante) e como a moldura passa
                    a vazar sem ninguem entender por que.
                  */}
                  <div
                    className="team-portrait absolute inset-x-0 top-0"
                    style={{ height: `${100 + SOBRA}%` }}
                  >
                    <img
                      src={member.photo}
                      alt={member.alt ?? `Retrato de ${member.name}, ${member.role} na Pattern Nexus`}
                      loading="lazy"
                      decoding="async"
                      className={cn(
                        "h-full w-full object-cover",
                        /*
                          `transition-[scale]`, nao `transition-transform`: o
                          transform do embrulho e do GSAP, e uma transicao CSS
                          em cima de um scrub emperra o acompanhamento do
                          scroll. Aqui so a propriedade `scale` transiciona.
                        */
                        "transition-[scale] duration-700 ease-out motion-safe:group-hover:scale-[1.03]"
                      )}
                    />
                  </div>

                  {/*
                    Fusao com o fundo da pagina. O retrato foi fotografado em
                    fundo preto, praticamente o --background; o degrade termina
                    de dissolver o ombro e o recorte para de parecer recorte.
                  */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent"
                  />
                </div>

                <div className="mt-6 flex items-baseline gap-3">
                  <span className="tabular text-xs text-brand">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-xl font-medium tracking-tight text-foreground transition-colors duration-500 group-hover:text-brand md:text-2xl">
                    {member.name}
                  </h3>
                </div>
                <p className="label-mono mt-2">{member.role}</p>
              </article>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
