import { TeamSection } from "@/components/ui/team-section-1";
import { team } from "@/lib/brand";

/**
 * Quem assina o padrao.
 *
 * ONDE ELA ENTRA E POR QUE: logo depois do Pipeline. A pessoa acabou de ver a
 * mensagem atravessar o sistema, ou seja, acabou de ver o artefato funcionando.
 * Esse e o momento em que ela quer saber quem construiu aquilo - e ainda antes
 * do NexusHand, que fecha o argumento na marca, e do Contato.
 *
 * O texto abaixo nao cita numero, cliente nem depoimento. A unica afirmacao que
 * ele faz e verificavel na propria pagina (sao tres) e ja e um compromisso
 * escrito em outro lugar do site: o alerta de madrugada chega para a casa antes
 * de chegar para o cliente, em `standards`. Se soar como promessa nova, e
 * porque a copy escorregou.
 */
export default function Team() {
  return (
    <TeamSection
      id="time"
      members={team}
      title={
        <>
          As pessoas por trás do <span className="text-brand">padrão</span>.
        </>
      }
      description="Três sócios, e isso é decisão de projeto, não estágio de crescimento. Quem senta com você na primeira reunião é quem escreve o código e quem recebe o alerta quando um fluxo quebra de madrugada."
    />
  );
}
