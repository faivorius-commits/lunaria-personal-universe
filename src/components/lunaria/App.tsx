import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BookHeart, BookOpen,
  CalendarDays, Check, CheckCircle2, ChevronDown, ChevronRight,
  CloudMoon, Compass, Feather, Flower2, FolderHeart, Gamepad2,
  Gem, Home, ImagePlus, Lightbulb, LockKeyhole, LogOut, Menu,
  Moon, Plus, Search, Settings2, Sparkles, Star, Target, Trash2,
  X, Heart, Sun, WandSparkles
} from "lucide-react";

import { useLunaria } from "./LunariaContext";
import { CssSky, Universe3D } from "./Universe";
import {
  useRows, useInvalidate, insertRow, updateRow, deleteRow
} from "@/lib/lunaria/data";
import { supabase } from "@/lib/lunaria/supabase";
import { hashPin, newSalt, verifyPin } from "@/lib/lunaria/pin";
import { todayISO } from "@/lib/lunaria/logic";
import type { Task } from "@/lib/lunaria/types";

type Page =
  | "Home" | "Workspace" | "Calendar" | "Diary" | "Journey"
  | "Memories" | "Collections" | "Arcade" | "Knowledge Garden"
  | "Settings";

const navigation = [
  { name: "Home", icon: Home, group: "My Universe" },
  { name: "Workspace", icon: Target, group: "My Universe" },
  { name: "Calendar", icon: CalendarDays, group: "My Universe" },
  { name: "Diary", icon: BookOpen, group: "Personal Space" },
  { name: "Journey", icon: Compass, group: "Personal Space" },
  { name: "Memories", icon: FolderHeart, group: "Personal Space" },
  { name: "Collections", icon: Gem, group: "Personal Space" },
  { name: "Knowledge Garden", icon: Lightbulb, group: "Discover" },
  { name: "Arcade", icon: Gamepad2, group: "Discover" },
  { name: "Settings", icon: Settings2, group: "System" }
] as const;

const pageInfo: Record<Page, { subtitle: string; icon: typeof Home }> = {
  Home: { subtitle: "A little universe that belongs to you.", icon: Home },
  Workspace: { subtitle: "Make room for the things you want to achieve.", icon: Target },
  Calendar: { subtitle: "Your days, plans, and little milestones.", icon: CalendarDays },
  Diary: { subtitle: "A quiet place for everything on your mind.", icon: BookOpen },
  Journey: { subtitle: "Notice your feelings. Celebrate your growth.", icon: Compass },
  Memories: { subtitle: "Keep the moments you never want to lose.", icon: FolderHeart },
  Collections: { subtitle: "Gather all the little things you love.", icon: Gem },
  Arcade: { subtitle: "A playful corner for a little break.", icon: Gamepad2 },
  "Knowledge Garden": { subtitle: "Plant an idea. Let it grow.", icon: Lightbulb },
  Settings: { subtitle: "Make this little universe feel like yours.", icon: Settings2 }
};

const cx = (...v: Array<string | false | undefined>) => v.filter(Boolean).join(" ");

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-11 place-items-center rounded-2xl bg-universe text-white shadow-float">
        <Moon size={23} />
      </div>
      <div>
        <div className="font-display text-2xl font-semibold leading-none tracking-wide">Lunaria</div>
        <div className="mt-1 text-[9px] uppercase tracking-[.28em] text-muted-foreground">Personal universe</div>
      </div>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-semibold uppercase tracking-[.25em] text-muted-foreground">{children}</p>;
}

function PageIntro({ page, extra }: { page: Page; extra?: React.ReactNode }) {
  const Icon = pageInfo[page].icon;
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="mb-3 flex items-center gap-2 text-primary">
          <Icon size={16} />
          <Eyebrow>{page === "Home" ? "Welcome to your universe" : "Your personal space"}</Eyebrow>
        </div>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">{page === "Home" ? "A universe of you." : page}</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{pageInfo[page].subtitle}</p>
      </div>
      {extra}
    </div>
  );
}

function Glass({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={cx("glass rounded-[26px] p-5 sm:p-7", className)}>{children}</section>;
}

function Button({
  children, onClick, type = "button", variant = "primary", disabled = false
}: {
  children: React.ReactNode; onClick?: () => void; type?: "button" | "submit";
  variant?: "primary" | "soft" | "plain"; disabled?: boolean;
}) {
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-universe text-white shadow-float hover:opacity-90",
        variant === "soft" && "border border-white/70 bg-white/65 text-foreground hover:bg-white",
        variant === "plain" && "text-muted-foreground hover:bg-white/60"
      )}>
      {children}
    </button>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text", required = false, multiline = false
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean; multiline?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-2 block font-medium">{label}</span>
      {multiline ? (
        <textarea required={required} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} rows={4}
          className="w-full resize-y rounded-2xl border border-white/80 bg-white/65 px-4 py-3 outline-none transition placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-2 focus:ring-primary/15" />
      ) : (
        <input required={required} type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-w-0 rounded-2xl border border-white/80 bg-white/65 px-4 py-3 outline-none transition placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-2 focus:ring-primary/15" />
      )}
    </label>
  );
}

/* AUTH */

function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) throw error;
        if (!data.session) setMessage("Please check your email to confirm your account, then sign in.");
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10">
      <CssSky dense />
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <Universe3D variant="lock" className="h-full w-full" />
      </div>
      <Glass className="relative z-10 w-full max-w-md p-7 sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <Brand />
          <p className="mt-8 font-display text-3xl font-semibold">Your universe awaits.</p>
          <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">A little space for everything that makes you, you.</p>
        </div>
        <div className="mb-6 grid grid-cols-2 rounded-full bg-secondary/70 p-1">
          {(["login", "signup"] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setMessage(""); }}
              className={cx("rounded-full py-2.5 text-sm font-medium transition", mode === m && "bg-white shadow-sm")}>
              {m === "login" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Email address" value={email} onChange={setEmail} type="email" placeholder="you@example.com" required />
          <Field label="Password" value={password} onChange={setPassword} type="password" placeholder="At least 8 characters" required />
          {mode === "signup" && <p className="text-xs text-muted-foreground">Use at least 8 characters for your password.</p>}
          {message && <p className="rounded-2xl bg-secondary/70 p-3 text-sm">{message}</p>}
          <Button type="submit" disabled={busy}>
            {busy ? "Please wait..." : mode === "login" ? "Enter Lunaria" : "Create my universe"}
            <ArrowUpRight size={16} />
          </Button>
        </form>
        <p className="mt-6 text-center text-xs text-muted-foreground">A soft little corner of the internet, just for you.</p>
      </Glass>
    </main>
  );
}

/* PIN */

function PinScreen() {
  const { profile, setUnlocked, saveProfile } = useLunaria();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const firstPin = !profile?.pin_hash || !profile?.pin_salt;

  async function unlock() {
    if (pin.length !== 4 || busy) return;
    setBusy(true);
    setError("");
    try {
      if (firstPin) {
        const salt = newSalt();
        const hash = await hashPin(pin, salt);
        await saveProfile({ pin_hash: hash, pin_salt: salt });
      } else {
        const valid = await verifyPin(pin, profile!.pin_salt!, profile!.pin_hash!);
        if (!valid) throw new Error("That PIN isn't quite right. Try again.");
      }
      setUnlocked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to unlock.");
      setPin("");
    } finally {
      setBusy(false);
    }
  }

  function addDigit(n: string) {
    if (pin.length >= 4 || busy) return;
    const next = pin + n;
    setPin(next);
    setError("");
    if (next.length === 4) {
      window.setTimeout(() => {
        setPin(current => current === next ? current : current);
      }, 10);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-8">
      <CssSky dense />
      <div className="pointer-events-none absolute inset-0"><Universe3D variant="lock" className="h-full w-full" /></div>
      <Glass className="relative z-10 w-full max-w-[370px] p-7 text-center sm:p-9">
        <div className="mx-auto mb-5 grid size-16 place-items-center rounded-[22px] bg-universe text-white shadow-float"><LockKeyhole size={27} /></div>
        <Eyebrow>{firstPin ? "A little privacy" : "Welcome back"}</Eyebrow>
        <h1 className="mt-2 font-display text-3xl font-semibold">{firstPin ? "Create your PIN" : "Unlock Lunaria"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{firstPin ? "Choose a four-digit PIN for your universe." : "Enter your four-digit universe PIN."}</p>
        <div className="my-7 flex justify-center gap-4">
          {[0, 1, 2, 3].map(i => <span key={i} className={cx("size-3 rounded-full border border-primary/40 transition", pin.length > i ? "bg-primary shadow-[0_0_12px_rgba(180,140,210,.5)]" : "bg-white/60")} />)}
        </div>
        <div className="mx-auto grid max-w-[250px] grid-cols-3 gap-3">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"].map(k => (
            <button key={k} onClick={() => k === "clear" ? setPin("") : k === "back" ? setPin(v => v.slice(0, -1)) : addDigit(k)}
              className={cx("grid aspect-square place-items-center rounded-2xl border border-white/70 text-lg font-semibold transition active:scale-95", /^\d$/.test(k) ? "bg-white/65 shadow-sm hover:bg-white" : "bg-secondary/60 text-sm text-muted-foreground hover:bg-secondary")}>
              {k === "clear" ? "Clear" : k === "back" ? "⌫" : k}
            </button>
          ))}
        </div>
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        <Button onClick={unlock} disabled={pin.length !== 4 || busy}>
          {busy ? "Opening..." : firstPin ? "Save PIN & enter" : "Unlock my space"}
          <ArrowRight size={16} />
        </Button>
      </Glass>
    </main>
  );
}

/* WORKSPACE */

function WorkspacePage() {
  const { data: tasks = [], isLoading, error } = useRows<Task>("lunaria_tasks", "created_at", false);
  const invalidate = useInvalidate();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<"small" | "long">("small");
  const [deadline, setDeadline] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const active = tasks.filter(t => t.status === "active");
  const completed = tasks.filter(t => t.status === "completed");

  async function createTask(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setMessage("");
    try {
      await insertRow("lunaria_tasks", {
        title: title.trim(), task_type: kind, label: "Personal", assigned_by: "",
        description: "", deadline: deadline || null, status: "active",
        progress: 0, completed_at: null
      });
      setTitle(""); setDeadline(""); setShowForm(false);
      await invalidate("lunaria_tasks");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save task.");
    } finally { setBusy(false); }
  }

  async function complete(task: Task) {
    try {
      await updateRow("lunaria_tasks", task.id, {
        status: "completed", progress: 100, completed_at: new Date().toISOString()
      });
      await invalidate("lunaria_tasks");
    } catch (err) { setMessage(err instanceof Error ? err.message : "Could not update task."); }
  }

  async function progress(task: Task) {
    const value = window.prompt("Progress from 0 to 100:", String(task.progress));
    if (value === null) return;
    const pct = Number(value);
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      setMessage("Please enter a number between 0 and 100."); return;
    }
    try {
      await insertRow("lunaria_task_progress", {
        task_id: task.id, entry_date: todayISO(), description: "Progress update", progress: pct
      });
      await updateRow("lunaria_tasks", task.id, {
        progress: pct,
        ...(pct === 100 ? { status: "completed", completed_at: new Date().toISOString() } : {})
      });
      await invalidate("lunaria_tasks", "lunaria_task_progress");
    } catch (err) { setMessage(err instanceof Error ? err.message : "Could not save progress."); }
  }

  async function remove(task: Task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try { await deleteRow("lunaria_tasks", task.id); await invalidate("lunaria_tasks"); }
    catch (err) { setMessage(err instanceof Error ? err.message : "Could not delete task."); }
  }

  return (
    <>
      <PageIntro page="Workspace" extra={<Button onClick={() => setShowForm(v => !v)}><Plus size={16} /> New task</Button>} />
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Active tasks", active.length, Target],
          ["Completed", completed.length, CheckCircle2],
          ["Total tasks", tasks.length, Sparkles],
          ["Completion", tasks.length ? `${Math.round(completed.length / tasks.length * 100)}%` : "0%", Star]
        ].map(([label, value, Icon]) => {
          const I = Icon as typeof Star;
          return <Glass key={String(label)} className="p-4"><I size={18} className="mb-3 text-primary" /><p className="text-xs text-muted-foreground">{label as string}</p><p className="mt-1 font-display text-3xl font-semibold">{value as string | number}</p></Glass>;
        })}
      </div>
      {showForm && <Glass className="mb-5">
        <form onSubmit={createTask} className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">A new little goal</h2>
          <Field label="Task name" value={title} onChange={setTitle} placeholder="What would you like to accomplish?" required />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm"><span className="mb-2 block font-medium">Task type</span><select value={kind} onChange={e => setKind(e.target.value as "small" | "long")} className="w-full rounded-2xl border bg-white/65 px-4 py-3"><option value="small">Small task</option><option value="long">Long project</option></select></label>
            <Field label="Deadline" value={deadline} onChange={setDeadline} type="date" />
          </div>
          <div className="flex flex-wrap gap-2"><Button type="submit" disabled={busy}>{busy ? "Saving..." : "Save task"}</Button><Button variant="soft" onClick={() => setShowForm(false)}>Cancel</Button></div>
        </form>
      </Glass>}
      {message && <p className="mb-4 rounded-2xl bg-secondary p-3 text-sm">{message}</p>}
      <Glass>
        <div className="mb-5 flex items-center justify-between"><div><Eyebrow>Your to-do list</Eyebrow><h2 className="mt-1 font-display text-2xl font-semibold">Things in progress</h2></div><span className="rounded-full bg-secondary px-3 py-1 text-xs">{active.length} active</span></div>
        {isLoading && <p className="text-sm text-muted-foreground">Loading your tasks...</p>}
        {error && <p className="text-sm text-destructive">{error.message}</p>}
        {!isLoading && tasks.length === 0 && <EmptyState icon={Target} title="Your workspace is waiting." text="Add your first task and start with one small step." />}
        <div className="space-y-3">
          {tasks.map(task => <article key={task.id} className="rounded-2xl border border-white/70 bg-white/45 p-4">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1"><div className="mb-2 flex flex-wrap gap-2"><span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] uppercase tracking-wider">{task.task_type === "long" ? "Long project" : "Small task"}</span><span className="text-xs text-muted-foreground">{task.status}</span></div><h3 className="font-semibold">{task.title}</h3>{task.deadline && <p className="mt-1 text-xs text-muted-foreground">Due {task.deadline}</p>}</div>
              <button onClick={() => remove(task)} className="rounded-full p-2 text-muted-foreground hover:bg-secondary" aria-label="Delete task"><Trash2 size={16} /></button>
            </div>
            {task.task_type === "long" && <div className="mt-4"><div className="mb-2 flex justify-between text-xs"><span>Progress</span><b>{task.progress}%</b></div><div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-universe transition-all" style={{ width: `${task.progress}%` }} /></div></div>}
            {task.status === "active" && <div className="mt-4"><Button onClick={() => task.task_type === "long" ? progress(task) : complete(task)}><Check size={15} />{task.task_type === "long" ? "Update progress" : "Mark complete"}</Button></div>}
          </article>)}
        </div>
      </Glass>
    </>
  );
}

/* GENERIC DATA PAGES */

type FieldDef = { key: string; label: string; type?: "text" | "date" | "number" | "textarea"; required?: boolean; placeholder?: string };
type ModuleConfig = { table: string; intro: string; fields: FieldDef[]; titleKey: string; dateKey?: string; accent: string };

const modules: Partial<Record<Page, ModuleConfig>> = {
  Diary: {
    table: "lunaria_diary_entries",
    intro: "Write freely. No perfect words needed here.",
    titleKey: "title", dateKey: "entry_date",
    accent: "A page for your thoughts",
    f
