import { lazy, Suspense, useEffect, useState } from "react";

const Scene3D = lazy(() => import("./Scene3D"));

/** CSS-only decorative sky (stars, clouds, orbs). Used everywhere and as the 3D fallback. */
export function CssSky({ dense = false }: { dense?: boolean }) {
  const stars = Array.from({ length: dense ? 28 : 16 }, (_, i) => i);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-24 -top-24 size-80 rounded-full bg-g1 opacity-50 blur-3xl" />
      <div className="absolute -right-20 top-1/3 size-96 rounded-full bg-g3 opacity-30 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 size-80 rounded-full bg-g4 opacity-40 blur-3xl" />
      {stars.map((i) => (
        <span key={i} className="animate-twinkle absolute size-1.5 rounded-full bg-primary-foreground shadow-glow"
          style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, animationDelay: `${(i % 7) * 0.4}s` }} />
      ))}
      <div className="absolute top-24 h-10 w-40 rounded-full bg-primary-foreground/50 blur-md" style={{ animation: "drift 90s linear infinite" }} />
      <div className="absolute top-2/3 h-8 w-28 rounded-full bg-primary-foreground/40 blur-md" style={{ animation: "drift 120s linear infinite", animationDelay: "-40s" }} />
    </div>
  );
}

function canUse3D() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (document.documentElement.classList.contains("reduce-motion")) return false;
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; }
}

/** Real 3D moon/planets/crystals with a CSS fallback for reduced motion or no WebGL. */
export function Universe3D({ variant = "dashboard", className = "" }: { variant?: "dashboard" | "lock"; className?: string }) {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => setOk(canUse3D()), []);
  const fallback = (
    <div className="flex h-full items-center justify-center">
      <div className="animate-float relative size-28 rounded-full bg-universe shadow-glow">
        <div className="absolute left-5 top-6 size-5 rounded-full bg-primary-foreground/30" />
        <div className="absolute bottom-6 right-6 size-3 rounded-full bg-primary-foreground/30" />
      </div>
    </div>
  );
  return (
    <div className={className} data-scene-ready={ok !== null ? "" : undefined}>
      {ok ? <Suspense fallback={fallback}><Scene3D variant={variant} /></Suspense> : fallback}
    </div>
  );
}
