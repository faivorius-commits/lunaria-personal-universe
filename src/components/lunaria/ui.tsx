
import { useRef, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ACCEPT, validateFile } from "@/lib/lunaria/data";
import { cn } from "@/lib/utils";
import { Upload, Sparkles } from "lucide-react";

export function PageHeader({
  emoji,
  title,
  subtitle,
  children
}: {
  emoji: string;
  title: string;
  subtitle: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-primary">
          <Sparkles size={13} />
          Your personal universe
        </div>

        <div className="flex items-center gap-3">
          <span className="animate-float grid size-12 shrink-0 place-items-center rounded-2xl bg-universe text-2xl shadow-float">
            {emoji}
          </span>

          <h1 className="font-display text-3xl font-semibold tracking-tight text-universe sm:text-4xl">
            {title}
          </h1>
        </div>

        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {subtitle}
        </p>
      </div>

      {children && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {children}
        </div>
      )}
    </header>
  );
}

export function Glass({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "glass pad transition-all duration-300 hover:shadow-float",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] w-[calc(100vw-1.5rem)] max-w-lg overflow-y-auto rounded-[2rem] border-white/60 bg-white/90 shadow-2xl backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-semibold text-universe">
            {title}
          </DialogTitle>

          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : (
            <DialogDescription className="sr-only">
              {title}
            </DialogDescription>
          )}
        </DialogHeader>

        {children}
      </DialogContent>
    </Dialog>
  );
}

export function Empty({
  emoji,
  text
}: {
  emoji: string;
  text: string;
}) {
  return (
    <div className="glass flex min-h-48 flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
      <span className="animate-float text-5xl">{emoji}</span>

      <p className="max-w-xs text-sm leading-relaxed">
        {text}
      </p>

      <span className="text-xs tracking-widest text-primary/70">
        ✧ A little space waiting for you ✧
      </span>
    </div>
  );
}

export function GradientButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn(
        "rounded-full bg-universe px-5 text-primary-foreground shadow-float transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90",
        className
      )}
      {...props}
    />
  );
}

export function FilePicker({
  kind = "any",
  file,
  onFile,
  progress,
  label = "Choose a file"
}: {
  kind?: "image" | "any";
  file: File | null;
  onFile: (f: File | null) => void;
  progress?: number | null;
  label?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState("");

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="group flex w-full items-center gap-4 rounded-2xl border-2 border-dashed border-primary/20 bg-white/40 p-5 text-left transition-all duration-300 hover:border-primary/60 hover:bg-white/70"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-universe text-white shadow-float transition-transform group-hover:scale-105">
          <Upload size={19} />
        </span>

        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-foreground">
            {file ? file.name : label}
          </span>

          <span className="mt-1 block text-xs text-muted-foreground">
            {file
              ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
              : "Add something lovely to your universe"}
          </span>
        </span>
      </button>

      <input
        ref={ref}
        type="file"
        hidden
        accept={ACCEPT[kind]}
        onChange={e => {
          const selected = e.target.files?.[0] ?? null;

          if (!selected) {
            onFile(null);
            return;
          }

          const validation = validateFile(selected, kind);
          setErr(validation ?? "");
          onFile(validation ? null : selected);
          e.target.value = "";
        }}
      />

      {err && (
        <p className="text-sm text-destructive">{err}</p>
      )}

      {progress != null && (
        <Progress value={progress} className="h-2 rounded-full" />
      )}
    </div>
  );
}

export const fmtDate = (iso: string) =>
  new Date(
    iso.length === 10 ? `${iso}T00:00:00` : iso
  ).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
