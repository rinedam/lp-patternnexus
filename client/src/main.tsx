import { createRoot } from "react-dom/client";
import App from "./App";
import { installMotionOverride } from "./lib/motion-preference";

// Fontes auto-hospedadas: sem requisicao ao Google Fonts no caminho critico.
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";

import "./index.css";

// Antes do render: os componentes leem matchMedia ja no primeiro efeito.
installMotionOverride();

createRoot(document.getElementById("root")!).render(<App />);
