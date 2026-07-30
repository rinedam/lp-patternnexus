import { Wordmark } from "@/components/brand/Wordmark";
import {
  TextHoverEffect,
  FooterBackgroundGradient,
} from "@/components/ui/hover-footer";
import { brand, contact, footerColumns, whatsappUrl } from "@/lib/brand";

/**
 * Rodape.
 *
 * Sem icones de redes sociais apontando para "#": links mortos sao pior do que
 * ausencia. Quando os perfis reais existirem, entram aqui.
 *
 * O nome da empresa vazado em tamanho grande fecha a pagina, no lugar de um
 * rodape que so termina. Passar o ponteiro por cima revela a cor da marca por
 * dentro das letras - o unico movimento da pagina que responde ao ponteiro em
 * vez do scroll, e o ultimo convite a interagir antes do fim.
 *
 * O vazado e `aria-hidden`: o nome ja foi anunciado no wordmark logo acima, e
 * repeti-lo em leitor de tela seria eco, nao conteudo.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-hairline bg-[#03050a]">
      {/* z-10 mantem o conteudo acima do halo, que e absoluto em z-0. */}
      <div className="container relative z-10 py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Wordmark />
            <p className="mt-5 max-w-[38ch] text-pretty text-sm leading-relaxed text-muted-foreground">
              {brand.summary}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 lg:col-span-5 lg:col-start-8">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="label-mono">{column.title}</h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-hairline pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {year} {brand.name}
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <a
              href={`mailto:${contact.email}`}
              className="text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              {contact.email}
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/*
        Assinatura vazada e interativa.

        A altura e generosa e o texto ocupa a largura toda: o alvo do ponteiro
        precisa ser grande, senao a mascara que segue o cursor mal tem espaco
        para aparecer. `-mt` puxa o bloco para perto do conteudo acima, porque o
        viewBox do SVG carrega folga propria em cima e embaixo.
      */}


      {/* Horizonte: corta o vazado por baixo e devolve a luz da cena anterior. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-24 bg-gradient-to-t from-[#03050a] via-[#03050a]/80 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-px bg-[linear-gradient(to_right,transparent,rgba(45,212,167,0.55),transparent)]"
      />

      <FooterBackgroundGradient />
    </footer>
  );
}
