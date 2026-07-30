import { motion, useReducedMotion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/brand";

/**
 * Atalho flutuante para o WhatsApp.
 *
 * Usa a cor da marca, nao o verde do WhatsApp: dois acentos proximos no espectro
 * brigam entre si, e a pagina tem um acento so. O pulso infinito anterior saiu
 * junto, porque chamava atencao sem comunicar nada.
 */
export default function WhatsAppFloat() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 rounded-full border border-hairline bg-surface/90 py-3 pl-3.5 pr-5 text-sm font-medium text-foreground shadow-[0_12px_40px_-12px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-colors duration-200 hover:border-brand/50"
    >
      <MessageCircle className="h-4.5 w-4.5 text-brand" />
      WhatsApp
    </motion.a>
  );
}
