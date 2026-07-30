import { createRoot } from "react-dom/client";
import App from "./App";
import { installMotionOverride } from "./lib/motion-preference";
import { installScrollRestorationOverride } from "./lib/scroll-restoration";

// Fontes auto-hospedadas: sem requisicao ao Google Fonts no caminho critico.
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";

import "./index.css";

// Antes do render: os componentes leem matchMedia ja no primeiro efeito.
installMotionOverride();

// Antes do render tambem, e o quanto antes: correndo com a restauracao do
// navegador, que acontece sozinha e sem avisar. Ver o arquivo para o porque.
installScrollRestorationOverride();

createRoot(document.getElementById("root")!).render(<App />);
