# Pattern Nexus - registro de design

Este arquivo substitui o brief anterior, que descrevia o site como "réplica fiel"
do template `nexstudio.demos.tailgrids.com`. Era daí que vinham tanto o nome
"NexStudio" quanto a cara genérica: o site era o esqueleto de um template com o
texto trocado.

## Posicionamento

Pattern Nexus constrói automação e IA para operações: agentes, integrações entre
sistemas, fluxos de decisão e painéis. O comprador é quem toca a operação de uma
empresa que já tem sistemas demais e tempo de menos.

## A premissa do site

Não existe prova social real ainda. Sem cliente para citar, a prova precisa ser o
próprio artefato: o comprador julga a capacidade técnica pelo que está vendo. Por
isso o site é construído para ser demonstrável, não para ser descrito.

Consequência direta: nada de depoimento, cliente ou número inventado. A versão
anterior tinha quatro depoimentos com nomes e empresas fictícios, quinze clientes
falsos e quatro métricas redondas sem lastro. Tudo saiu.

## A ideia central: a malha

"Pattern Nexus" é padrão mais conexão. A malha de nós conectados é ao mesmo tempo
o símbolo, o fundo do site e a metáfora do produto, já que automação é
exatamente isto: algo entra por um nó e atravessa o sistema até virar ação.

Ela aparece em três escalas:

- `client/src/components/brand/Wordmark.tsx` - o símbolo, quatro nós ligados a um centro
- `client/src/components/LatticeField.tsx` - o campo animado em canvas 2D, com pulsos que percorrem caminhos reais do grafo
- `client/src/components/Pipeline.tsx` - a demonstração interativa, onde a malha vira um fluxo nomeado

O Three.js saiu junto com a esfera distorcida genérica que ele desenhava. O canvas
2D é mais leve, mais nítido e diz algo sobre a marca.

## Decisões visuais

**Tema** travado em escuro. Nenhuma seção inverte para claro.

**Acento único:** `#2DD4A7`. Contraste verificado em 10.6:1 contra o fundo, nos
dois sentidos, o que passa WCAG AAA. Escolhido por significar sinal e fluxo ativo,
e por escapar tanto do roxo de IA quanto do verde de terminal.

**Tipografia:** Geist e Geist Mono, auto-hospedadas. A anterior era Inter com
Instrument Serif em itálico dentro dos títulos, que é a assinatura mais
reconhecível de site gerado por IA. O destaque agora é feito com peso e cor
dentro da mesma família.

**Raio:** botões em pill, cards em 16px, campos em 10px. Sem exceção.

**Rótulos de seção:** no máximo um a cada três seções. A versão anterior tinha
sete, um por seção, todos no formato `— LABEL MAIÚSCULO`.

**Em-dash:** zero na copy visível.

## Ordem das seções

Segue o raciocínio de quem compra, e cada uma usa uma família de layout diferente
de propósito. Repetir a mesma estrutura seção após seção é o que faz uma página
parecer gerada.

1. `Hero` - assimétrico sobre a malha interativa
2. `Statement` - o problema, declaração grande mais lista numerada
3. `Capabilities` - mestre-detalhe selecionável
4. `Process` - linha do tempo com trilho que se desenha na rolagem
5. `Pipeline` - demonstração interativa disparável
6. `Contact` - canais diretos

## Pendências antes de publicar

- **Contato real** em `client/src/lib/brand.ts`: o número de WhatsApp e o e-mail são placeholders.
- **Formulário**: hoje são canais diretos, porque o projeto não tem endpoint para receber envio. Um formulário que engole a mensagem é pior que nenhum.
- **Fotografia real** da equipe ou do trabalho, se quiser presença humana. O site hoje não usa nenhuma foto.
- **Perfis sociais** no rodapé, quando existirem. Foram removidos os ícones que apontavam para `#`.
