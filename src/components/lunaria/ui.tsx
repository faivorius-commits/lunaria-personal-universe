import { useRef, useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ACCEPT, validateFile } from "@/lib/lunaria/data";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";

export function PageHeader({ emoji, title, subtitle, children }: { emoji: string; title: string; subtitle: string; children?: ReactNode }) {
  return (
    <header className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-3">
          <span className="animate-float grid size-12 shrink-0 place-items-center rounded-2xl bg-universe text-2xl shadow-float">{emoji}</span>
          <h1 className="truncate text-3xl font-semibold text-universe sm:text-4xl">{title}</h1>
        </div>
        <p className="text-sm text-muted-foreground sm:text-base">{subtitle}</p>
      </div>
      {children && <div className="flex shrink-0 gap-2">{children}</div>}
    </header>
  );
}

export function Glass({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("glass pad", className)} {...rest}>{children}</div>;
}

export function Modal({ open, onOpenChange, title, description, children }: { open: boolean; onOpenChange: (v: boolean) => void; title: string; description?: string; children: ReactNode }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] w-[calc(100vw-1.5rem)] max-w-lg overflow-y-auto rounded-3xl border-border bg-popover">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-universe">{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : <DialogDescription className="sr-only">{title}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export function Empty({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="glass flex flex-col items-center gap-2 p-8 text-center text-muted-foreground">
      <span className="animate-float text-4xl">{emoji}</span>
      <p>{text}</p>
    </div>
  );
}

export function GradientButton({ className, ...p }: React.ComponentProps<typeof Button>) {
  return <Button className={cn("rounded-full bg-universe text-primary-foreground shadow-float hover:opacity-90", className)} {...p} />;
}

export function FilePicker({ kind = "any", file, onFile, progress, label = "Choose a file" }: { kind?: "image" | "any"; file: File | null; onFile: (f: File | null) => void; progress?: number | null; label?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState("");
  return (
    <div className="space-y-2">
      <button type="button" onClick={() => ref.current?.click()}
        className="flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-input bg-glass p-4 text-left transition hover:border-primary">
        <Upload className="size-5 shrink-0 text-primary" />
        <span className="min-w-0 truncate text-sm">{file ? `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB` : label}</span>
      </button>
      <input ref={ref} type="file" hidden accept={ACCEPT[kind]} onChange={(e) => {
        const f = e.target.files?.[0] ?? null;
        if (!f) return onFile(null);
        const v = validateFile(f, kind);
        setErr(v ?? "");
        onFile(v ? null : f);
        e.target.value = "";
      }} />
      {err && <p className="text-sm text-destructive">{err}</p>}
      {progress != null && <Progress value={progress} className="h-2" />}
    </div>
  );
}

export const fmtDate = (iso: string) => new Date(iso.length === 10 ? `${iso}T00:00:00` : iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
