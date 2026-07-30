/*
  Ponto unico de decisao sobre `prefers-reduced-motion`.

  O Windows expoe "Mostrar animacoes no Windows" (Configuracoes > Acessibilidade
  > Efeitos visuais). Com ela desligada o navegador passa a reportar
  `prefers-reduced-motion: reduce` para todo site, e o nosso — que respeita a
  preferencia em ~18 pontos entre JS e CSS — entra no caminho degradado inteiro.

  Com FORCE_MOTION ligado o site ignora essa preferencia do sistema e anima
  sempre. Vira uma decisao editorial explicita, num lugar so, em vez de ficar
  espalhada por componente.
*/
export const FORCE_MOTION = true;

/*
  Sentinelas que substituem a feature de movimento dentro da media query. Nao
  da para simplesmente devolver `matches: false`: existem queries compostas no
  projeto — `(min-width: 1024px) and (prefers-reduced-motion: no-preference)` e
  `(max-width: 1023px), (prefers-reduced-motion: reduce)` — e zerar a string
  toda mataria tambem a parte de largura. Trocando apenas a feature por uma
  condicao trivialmente falsa/verdadeira, o resto da query segue valendo.
*/
const NEVER_MATCHES = "min-width: 100000px";
const ALWAYS_MATCHES = "min-width: 0px";

/*
  Casa `prefers-reduced-motion`, `prefers-reduced-motion: reduce` e
  `prefers-reduced-motion: no-preference`. A forma booleana (sem valor)
  equivale a `reduce`.
*/
const MOTION_FEATURE = /prefers-reduced-motion\s*(?::\s*(reduce|no-preference)\s*)?/gi;

/** Reescreve uma media query como se o sistema nunca pedisse menos movimento. */
export function forceMotionQuery(query: string): string {
  return query.replace(MOTION_FEATURE, (_match, value: string | undefined) =>
    value?.toLowerCase() === "no-preference" ? ALWAYS_MATCHES : NEVER_MATCHES,
  );
}

/*
  Precisa rodar antes de qualquer componente montar. Cobre de uma vez os
  `window.matchMedia` dos componentes e o `gsap.matchMedia()`, que le
  `window.matchMedia` no momento do `add()` e por isso tambem cai no patch.

  A classe no <html> e o par disso no CSS: media query em folha de estilo nao
  passa por JS, entao os blocos de `index.css` e `motion-footer.css` ficam
  condicionados a ausencia dela.
*/
export function installMotionOverride(): void {
  if (!FORCE_MOTION || typeof window === "undefined") return;

  document.documentElement.classList.add("force-motion");

  const nativeMatchMedia = window.matchMedia.bind(window);
  window.matchMedia = ((query: string) =>
    nativeMatchMedia(forceMotionQuery(query))) as typeof window.matchMedia;
}
