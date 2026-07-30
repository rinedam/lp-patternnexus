import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/*
  Quem manda na posicao de scroll no carregamento.

  O NAVEGADOR restaura sozinho, no F5, a posicao em que a pessoa estava - e faz
  isso com `history.scrollRestoration` valendo "auto", que e o padrao. Num site
  comum isso e um presente: voce recarrega e continua lendo de onde parou.

  Aqui e o oposto de um presente. A CinematicIntro toca inteira a cada
  carregamento, em cima de qualquer posicao que o navegador tenha restaurado.
  Entao a cortina sobe, a marca se dissolve, e o site aparece no MEIO da pagina.
  A abertura promete um comeco e entrega uma pagina ja pela metade.

  Pior: a posicao restaurada quase nunca e a original. O navegador restaura
  antes de a pagina ter a altura final - a cena 3D nao carregou, as fotos estao
  em lazy, e os pins do ScrollTrigger (Standard e Pipeline) ainda nem criaram os
  seus espacadores, que sao varias telas de altura. Sem essa altura toda ele
  prende o valor no fim do documento curto que existe naquele instante, e o
  resultado e um ponto arbitrario logo depois do Hero, que nao e onde a pessoa
  estava nem o topo. Foi medido: de 13625px restaurou 8953px.

  POR QUE NAO BASTA `history.scrollRestoration = "manual"`:

  O ScrollTrigger tambem tem opiniao sobre essa propriedade. Ao registrar, ele
  GUARDA o valor que encontrou (`_scrollRestoration = history.scrollRestoration
  || "auto"`) e reescreve esse valor guardado a cada `refreshAll()` - o que
  acontece varias vezes no carregamento, a cada pin criado e a cada resize.

  E ele registra ANTES de qualquer linha deste modulo rodar: os componentes
  chamam `gsap.registerPlugin(ScrollTrigger)` no topo dos seus arquivos, e
  import de ES module e icado, entao tudo isso executa antes da primeira
  instrucao do main.tsx. Resultado do que foi medido: nosso "manual" entrava aos
  155ms e o ScrollTrigger o desfazia aos 159ms, com o navegador restaurando aos
  274ms - depois da briga, e do lado errado dela.

  `clearScrollMemory("manual")` resolve porque escreve nos DOIS lugares: na
  propriedade do navegador e no valor guardado do ScrollTrigger. A partir dai os
  refresh dele passam a reafirmar "manual" em vez de desfazer. De quebra, o
  metodo tambem zera as posicoes que o ScrollTrigger memoriza para reaplicar
  entre refreshes, que sao a mesma ideia um nivel abaixo.
*/
export function installScrollRestorationOverride(): void {
  if (typeof window === "undefined") return;

  ScrollTrigger.clearScrollMemory("manual");

  /*
    Rede para o caso de o navegador ter restaurado antes deste modulo rodar -
    conexao lenta, bundle grande, bfcache. Ancora na URL fica de fora: e uma
    intencao explicita de quem abriu o link, diferente da posicao que o
    navegador guardou por conta propria, e nao se rouba o scroll de quem pediu
    /#contato.
  */
  if (!window.location.hash) {
    window.scrollTo(0, 0);
  }
}
