/**
 * Pattern Nexus - fonte unica de verdade da marca e do conteudo.
 *
 * O QUE O NOME SIGNIFICA, porque isto ja foi lido errado uma vez:
 *
 *   Pattern = o padrao de qualidade da casa. NAO e "malha repetida" nem
 *             "entregamos coisas padronizadas". E o nivel de exigencia.
 *   Nexus   = o ponto onde os sistemas do cliente se encontram.
 *
 * Toda copy deste arquivo precisa sustentar essa leitura. Se um texto puder ser
 * interpretado como "generico", "comum" ou "de prateleira", esta errado.
 *
 * Nada aqui pode ser inventado: numeros, clientes e depoimentos so entram quando
 * forem reais. Os campos marcados com PENDENTE precisam do dado antes de publicar.
 */

export const brand = {
  name: "Pattern Nexus",
  nameParts: { lead: "Pattern", trail: "Nexus" },
  tagline: "Padrão não se improvisa. Se constrói.",
  summary:
    "Automação, IA e sites construídos com rigor de engenharia, para operações que não podem parar quando aparece o primeiro caso fora da curva.",
  /** Explicacao do nome, usada na secao de padrao. */
  meaning: {
    pattern:
      "o nível de exigência que não muda de projeto para projeto, nem quando o prazo aperta.",
    nexus: "o ponto onde os sistemas que você já usa passam a conversar.",
  },
} as const;

/** PENDENTE: substituir pelos dados reais antes de publicar. */
export const contact = {
  email: "contato@patternnexus.com.br",
  whatsapp: "5500000000000",
  whatsappMessage:
    "Olá! Vim pelo site e gostaria de conversar sobre automação para a minha operação.",
} as const;

export const whatsappUrl = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(
  contact.whatsappMessage
)}`;

/** Um rotulo por intencao de CTA, repetido em todo o site. */
export const cta = {
  primary: "Agendar diagnóstico",
  secondary: "Ver capacidades",
} as const;

export const nav = [
  { label: "Padrão", href: "#padrao" },
  { label: "Capacidades", href: "#capacidades" },
  { label: "Processo", href: "#processo" },
  { label: "Demonstração", href: "#demonstracao" },
] as const;

/**
 * O padrao, em compromissos verificaveis.
 *
 * Esta secao existe porque "qualidade" dita de forma abstrata nao vale nada.
 * Cada item aqui e uma coisa que o cliente pode conferir depois de contratar.
 */
export const standards = [
  {
    id: "rollback",
    title: "Nada entra em produção sem caminho de volta",
    body: "Toda entrega tem rollback testado. Se o fluxo novo se comportar diferente do previsto, ele volta ao estado anterior sem virar madrugada de ninguém.",
  },
  {
    id: "auditoria",
    title: "Toda decisão automática fica registrada",
    body: "Quando alguém perguntar por que o sistema fez o que fez, existe resposta: a entrada, a regra aplicada e o horário. Automação que não explica suas decisões é automação que ninguém confia.",
  },
  {
    id: "alerta",
    title: "O erro chega para nós antes de chegar para você",
    body: "Monitoramento faz parte da entrega, não é linha extra na proposta. Fluxo quebrado às duas da manhã vira alerta nosso, não reclamação do seu cliente.",
  },
  {
    id: "propriedade",
    title: "O código é seu, desde o primeiro commit",
    body: "Acesso ao repositório desde o início e documentação de como tudo funciona. Você contrata um parceiro, não um sequestro técnico.",
  },
] as const;

export const capabilities = [
  {
    id: "agentes",
    title: "Agentes de atendimento",
    summary:
      "Atendem no WhatsApp e no Instagram, qualificam o contato e entregam para a pessoa certa.",
    detail:
      "Conectados ao seu CRM, não a uma caixa de entrada paralela que ninguém abre. O histórico da conversa fica onde o time já trabalha, e o caso que o agente não resolve sobe para um humano com o contexto inteiro junto.",
    signals: ["WhatsApp", "Instagram", "CRM"],
  },
  {
    id: "integracoes",
    title: "Integrações entre sistemas",
    summary:
      "Seu ERP, sua planilha, seu gateway e seu CRM trocando dados sem ninguém copiando e colando.",
    detail:
      "Quando um pedido entra, o estoque baixa, a nota sai e o financeiro enxerga. Uma vez só, sem redigitação e sem a planilha paralela que uma pessoa só sabe usar.",
    signals: ["ERP", "Planilhas", "APIs"],
  },
  {
    id: "decisao",
    title: "Fluxos de decisão",
    summary:
      "Regras e modelos que classificam, priorizam e roteiam o que chega na operação.",
    detail:
      "O caso simples resolve sozinho. O caso fora do padrão vai para a fila de exceção antes de virar problema, e cada decisão fica registrada com o motivo.",
    signals: ["Classificação", "Roteamento", "Auditoria"],
  },
  {
    id: "paineis",
    title: "Painéis de operação",
    summary:
      "O que está rodando, o que travou e onde o processo parou, em tempo real.",
    detail:
      "Feito para quem opera, não para slide de reunião. A pessoa que abre o painel às sete da manhã precisa saber em cinco segundos se a noite foi tranquila.",
    signals: ["Tempo real", "Alertas", "Histórico"],
  },
  {
    id: "sites",
    title: "Sites e plataformas web",
    summary:
      "Site institucional, landing page de campanha ou sistema interno, no mesmo padrão de engenharia do resto.",
    detail:
      "Carrega rápido no celular de quem está com sinal ruim, e o texto é editado pelo seu time sem abrir chamado. O site é a porta de entrada da operação: ele nasce já conectado ao agente de atendimento e ao CRM, não como uma peça solta que alguém integra depois.",
    signals: ["Performance", "SEO técnico", "Conteúdo editável"],
  },
] as const;

export const process = [
  {
    id: "mapear",
    verb: "Mapear",
    title: "Acompanhamos o processo como ele é hoje",
    body: "Uma semana junto de quem executa, não de quem descreve. O fluxo real quase nunca é o fluxo do manual, e é o real que precisa ser automatizado.",
  },
  {
    id: "construir",
    verb: "Construir",
    title: "Você usa a primeira versão antes do escopo fechar",
    body: "Entrega em ciclos curtos, em produção. Automação aprovada só no papel costuma resolver o problema errado com muita elegância.",
  },
  {
    id: "operar",
    verb: "Operar",
    title: "Monitoramento e ajuste depois da entrega",
    body: "Sistema sem manutenção vira trabalho manual de novo em seis meses. A gente continua olhando os fluxos depois que a nota fiscal foi emitida.",
  },
] as const;

export const pipeline = [
  {
    id: "recebe",
    label: "Recebe",
    caption: "Mensagem chega pelo WhatsApp",
    detail:
      "O contato entra por onde o cliente já está. Nenhum canal novo para ele aprender.",
  },
  {
    id: "classifica",
    label: "Classifica",
    caption: "O agente entende a intenção",
    detail:
      "Orçamento, suporte ou segunda via. A classificação define o caminho, e fica registrada junto com a confiança do modelo.",
  },
  {
    id: "decide",
    label: "Decide",
    caption: "A regra escolhe o destino",
    detail:
      "Caso simples resolve sozinho. Caso fora do padrão vai para a fila de exceção com o contexto junto, antes de virar reclamação.",
  },
  {
    id: "age",
    label: "Age",
    caption: "O sistema executa e registra",
    detail:
      "Abre o chamado, atualiza o CRM e responde o cliente. O time vê o resultado, não o trabalho.",
  },
] as const;

/**
 * O time.
 *
 * PENDENTE: cargo de cada socio, e o sobrenome de quem quiser aparecer com ele.
 *
 * Os primeiros nomes vieram do arquivo de cada foto, entao sao reais. Os cargos
 * NAO existem ainda, e por isso estao escritos como pendencia que aparece na
 * tela em vez de comentario aqui: um cargo inventado passaria despercebido numa
 * revisao, "Cargo pendente" impresso embaixo do rosto nao passa.
 *
 * As fotos ja estavam em client/public/images sem uso, e o ideas.md listava
 * "fotografia real da equipe" como pendencia em aberto. Foram feitas na paleta
 * da marca - fundo preto e luz de contorno no verde do acento - o que e o
 * motivo de o retrato na secao nao precisar de cartao em volta: ele encosta no
 * fundo da pagina e se funde sozinho.
 */
export const team = [
  {
    id: "rinedam",
    name: "Gustavo Rinedam",
    role: "CEO & Desenvolvedor",
    photo: "/images/socio-rinedam.jpeg",
  },
  {
    id: "rick",
    name: "Luiz Kostiuk",
    role: "CEO & Financeiro",
    photo: "/images/socio-rick.jpeg",
  },
  {
    id: "joaov",
    name: "João Vinicius",
    role: "CEO & Comercial",
    photo: "/images/socio-joaov.jpeg",
  },
] as const;

export const footerColumns = [
  {
    title: "Capacidades",
    links: capabilities.map(c => ({ label: c.title, href: "#capacidades" })),
  },
  {
    title: "Empresa",
    links: [
      { label: "Padrão", href: "#padrao" },
      { label: "Processo", href: "#processo" },
      { label: "Demonstração", href: "#demonstracao" },
      { label: "Contato", href: "#contato" },
    ],
  },
] as const;

export type Capability = (typeof capabilities)[number];
export type ProcessStep = (typeof process)[number];
export type PipelineStage = (typeof pipeline)[number];
export type Standard = (typeof standards)[number];
export type TeamMember = (typeof team)[number];
