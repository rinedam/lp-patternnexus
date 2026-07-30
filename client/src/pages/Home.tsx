import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Statement from "@/components/Statement";
import Standard from "@/components/Standard";
import Capabilities from "@/components/Capabilities";
import Process from "@/components/Process";
import Pipeline from "@/components/Pipeline";
import NexusHand from "@/components/NexusHand";
import Contact from "@/components/Contact";
import { CinematicFooter } from "@/components/ui/motion-footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { CinematicIntro } from "@/components/CinematicIntro";

/**
 * Pattern Nexus.
 *
 * A ordem das secoes segue o raciocinio de quem compra: reconhece o problema,
 * ve o que pode ser feito, entende como o trabalho acontece, assiste a coisa
 * funcionando e so entao encontra o contato.
 *
 * Cada secao usa uma familia de layout diferente, de proposito. Repetir a mesma
 * estrutura de secao em secao e o que faz uma pagina parecer gerada.
 */
export default function Home() {
  return (
    <CinematicIntro>
      <div className="grain-overlay" aria-hidden="true" />

      <Navbar />

      <main>
        <Hero />
        <Statement />
        <Standard />
        <Capabilities />
        <Process />
        <Pipeline />
        <NexusHand />
        <Contact />
      </main>

      <CinematicFooter />
      <WhatsAppFloat />
    </CinematicIntro>
  );
}
