import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitLines } from "@/components/motion/ScrollText";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function NexusHand() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoEnded, setVideoEnded] = useState(false);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const handleVideoEnd = () => {
    setVideoEnded(true);
  };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-t border-hairline bg-black py-16 md:py-24"
    >
      <div className="container relative">
        <div className="mx-auto max-w-[46rem] text-center">
          <p className="label-mono flex items-center justify-center gap-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />O nexus
          </p>

          <SplitLines
            as="h2"
            className="mt-7 text-balance text-[clamp(2rem,5vw,3.8rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-foreground"
          >
            O ponto onde os seus sistemas passam a{" "}
            <span className="text-brand">se encontrar</span>.
          </SplitLines>

          <p className="mx-auto mt-7 max-w-[48ch] text-pretty leading-relaxed text-muted-foreground">
            {brand.meaning.nexus.charAt(0).toUpperCase() +
              brand.meaning.nexus.slice(1)}
          </p>
        </div>

        <div
          aria-hidden="true"
          className="relative mx-auto mt-16 h-[20rem] w-full max-w-[34rem] md:h-[28rem]"
        >
          <video
            ref={videoRef}
            src="/video/logoreveal.webm"
            muted
            playsInline
            onEnded={handleVideoEnd}
            className={cn("w-full h-full object-cover bg-black", {
              "hidden": videoEnded,
            })}
          />
          {videoEnded && (
            <img
              src="/images/estatico final.png"
              alt="Símbolo Pattern Nexus segurado na mão, quatro nós conectados a um centro"
              className="w-full h-full object-cover transition-transform duration-300 ease-in-out"
            />
          )}
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent z-10" />
        </div>
      </div>
    </section>
  );
}
