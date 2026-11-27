import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Home, Target, CalendarDays, BookOpen, Compass, FolderHeart, Gem,
  Lightbulb, Gamepad2, Settings2, Moon, Sparkles, Plus, Search,
  Trash2, Check, CheckCircle2, Star, LockKeyhole, ArrowRight,
  ArrowUpRight, Menu, X, LogOut, Heart, Flower2, WandSparkles
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

function Glass({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={cx("glass rounded-[26px] p-5 sm:p-7", className)}>{children}</section>;
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-[10px] font-semibold uppercase tracking-[.25em] text-muted-foreground">{children}</p>;
}

function Button({
  children, onClick, type = "button", variant = "primary", disabled = false
}: {
  children: ReactNode; onClick?: () => void; type?: "button" | "submit";
  variant?: "primary" | "soft" | "plain"; disabled?: boolean;
}) {
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition active:scale-[.98] disabled:opacity-50",
        variant === "primary" && "bg-universe text-white shadow-float hover:opacity-90",
        variant === "soft" && "border border-white/70 bg-white/65 hover:bg-white",
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
          className="w-full rounded-2xl border border-white/80 bg-white/65 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20" />
      ) : (
        <input required={required} type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-w-0 rounded-2xl border border-white/80 bg-white/65 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20" />
      )}
    </label>
  );
}

function PageIntro({ page, extra }: { page: Page; extra?: ReactNode }) {
  const Icon = pageInfo[page].icon;
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="mb-3 flex items-center gap-2 text-primary">
          <Icon size={16} />
          <Eyebrow>{page === "Home" ? "Welcome to your universe" : "Your personal space"}</Eyebrow>
        </div>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">
          {page === "Home" ? "A universe of you." : page}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{pageInfo[page].subtitle}</p>
      </div>
      {extra}
    </div>
  );
}

function EmptyState({ icon: Icon, title, text }: { icon: typeof Sparkles; title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-primary/20 bg-white/25 px-5 py-10 text-center">
      <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-secondary text-primary"><Icon size={23} /></div>
      <p className="font-display text-xl font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

/* AUTHENTICATION */

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
        if (!data.session) setMessage("Check your email to confirm your account, then sign in.");
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
      <div className="pointer-events-none absolute inset-0"><Universe3D variant="lock" className="h-full w-full" /></div>
      <Glass className="relative z-10 w-full max-w-md p-7 sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <Brand />
          <p className="mt-8 font-display text-3xl font-semibold">Your universe awaits.</p>
          <p className="mt-2 text-sm text-muted-foreground">A little space for everything that makes you, you.</p>
        </div>
        <div className="mb-6 grid grid-cols-2 rounded-full bg-secondary/70 p-1">
          {(["login", "signup"] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setMessage(""); }}
              className={cx("rounded-full py-2.5 text-sm", mode === m && "bg-white shadow-sm")}>
              {m === "login" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Email address" value={email} onChange={setEmail} type="email" placeholder="you@example.com" required />
          <Field label="Password" value={password} onChange={setPassword} type="password" placeholder="Your password" required />
          {message && <p className="rounded-2xl bg-secondary p-3 text-sm">{message}</p>}
          <Button type="submit" disabled={busy}>{busy ? "Please wait..." : mode === "login" ? "Enter Lunaria" : "Create my universe"}<ArrowUpRight size={16} /></Button>
        </form>
        <p className="mt-6 text-center text-xs text-muted-foreground">A soft little corner of the internet, just for you.</p>
      </Glass>
    </main>
  );
}

/* PIN LOCK */

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
        if (!valid) throw new Error("Incorrect PIN. Please try again.");
      }
      setUnlocked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to unlock.");
      setPin("");
    } finally {
      setBusy(false);
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
        <p className="mt-2 text-sm text-muted-foreground">{firstPin ? "Choose a four-digit PIN." : "Enter your four-digit PIN."}</p>
        <div className="my-7 flex justify-center gap-4">
          {[0, 1, 2, 3].map(i => <span key={i} className={cx("size-3 rounded-full border border-primary/40", pin.length > i ? "bg-primary" : "bg-white/60")} />)}
        </div>
        <div className="mx-auto grid max-w-[250px] grid-cols-3 gap-3">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"].map(k => (
            <button key={k} onClick={() => {
              setError("");
              if (k === "clear") setPin("");
              else if (k === "back") setPin(v => v.slice(0, -1));
              else if (pin.length < 4) setPin(v => v + k);
            }} className="grid aspect-square place-items-center rounded-2xl border border-white/70 bg-white/65 text-lg font-semibold shadow-sm active:scale-95">
              {k === "clear" ? "Clear" : k === "back" ? "⌫" : k}
            </button>
          ))}
        </div>
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        <Button onClick={unlock} disabled={pin.length !== 4 || busy}>
          {busy ? "Opening..." : firstPin ? "Save PIN & enter" : "Unlock my space"}<ArrowRight size={16} />
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
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const active = tasks.filter(t => t.status === "active");
  const completed = tasks.filter(t => t.status === "completed");

  async function createTask(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setMessage("");
    try {
      await insertRow("lunaria_tasks", {
        title: title.trim(), task_type: kind, label: "Personal",
        assigned_by: "", description: "", deadline: deadline || null,
        status: "active", progress: 0, completed_at: null
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
        {isLoading && <p className="text-sm text-muted-foreground">Loading tasks...</p>}
        {error && <p className="text-sm text-destructive">{error.message}</p>}
        {!isLoading && tasks.length === 0 && <EmptyState icon={Target} title="Your workspace is waiting." text="Add your first task and start with one small step." />}
        <div className="space-y-3">
          {tasks.map(task => <article key={task.id} className="rounded-2xl border border-white/70 bg-white/45 p-4">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1"><div className="mb-2 flex flex-wrap gap-2"><span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] uppercase tracking-wider">{task.task_type === "long" ? "Long project" : "Small task"}</span><span className="text-xs text-muted-foreground">{task.status}</span></div><h3 className="font-semibold">{task.title}</h3>{task.deadline && <p className="mt-1 text-xs text-muted-foreground">Due {task.deadline}</p>}</div>
              <button onClick={() => remove(task)} className="rounded-full p-2 text-muted-foreground hover:bg-secondary"><Trash2 size={16} /></button>
            </div>
            {task.task_type === "long" && <div className="mt-4"><div className="mb-2 flex justify-between text-xs"><span>Progress</span><b>{task.progress}%</b></div><div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-universe" style={{ width: `${task.progress}%` }} /></div><input aria-label="Task progress" type="range" min="0" max="100" value={task.progress} onChange={async e => { const n = Number(e.target.value); await updateRow("lunaria_tasks", task.id, { progress: n }); await invalidate("lunaria_tasks"); }} className="mt-3 w-full" /></div>}
            {task.status === "active" && <div className="mt-4"><Button onClick={() => complete(task)}><Check size={15} /> Mark complete</Button></div>}
          </article>)}
        </div>
      </Glass>
    </>
  );
}

/* PERSONAL MODULES */

type FieldDef = { key: string; label: string; type?: "text" | "date" | "number" | "textarea"; required?: boolean; placeholder?: string };
type ModuleConfig = { table: string; intro: string; fields: FieldDef[]; titleKey: string; dateKey?: string; accent: string };

const modules: Partial<Record<Page, ModuleConfig>> = {
  Diary: {
    table: "lunaria_diary_entries", intro: "Write freely. No perfect words needed here.",
    titleKey: "title", dateKey: "entry_date", accent: "A page for your thoughts",
    fields: [
      { key: "title", label: "Entry title", required: true, placeholder: "A little note to remember..." },
      { key: "entry_date", label: "Date", type: "date", required: true },
      { key: "mood", label: "Mood", placeholder: "peaceful, excited, thoughtful..." },
      { key: "body", label: "Your thoughts", type: "textarea", required: true, placeholder: "Dear diary..." }
    ]
  },
  Calendar: {
    table: "lunaria_calendar_events", intro: "Give your plans a place to live.",
    titleKey: "title", dateKey: "event_date", accent: "Your upcoming moments",
    fields: [
      { key: "title", label: "Event name", required: true, placeholder: "What is happening?" },
      { key: "event_date", label: "Date", type: "date", required: true },
      { key: "start_time", label: "Time", placeholder: "09:30" },
      { key: "details", label: "Details", type: "textarea", placeholder: "A little note about this plan..." }
    ]
  },
  Journey: {
    table: "lunaria_journey", intro: "A gentle check-in with the person you are becoming.",
    titleKey: "feeling", dateKey: "entry_date", accent: "Your emotional check-in",
    fields: [
      { key: "feeling", label: "What are you feeling?", required: true, placeholder: "Give this feeling a name..." },
      { key: "emoji", label: "Emoji", placeholder: "🌷" },
      { key: "intensity", label: "Intensity (1–5)", type: "number", placeholder: "3" },
      { key: "entry_date", label: "Date", type: "date", required: true },
      { key: "reflection", label: "Reflection", type: "textarea", placeholder: "What might be behind this feeling?" }
    ]
  },
  Memories: {
    table: "lunaria_memories", intro: "Save the moments that make your heart feel full.",
    titleKey: "title", dateKey: "memory_date", accent: "Little moments, kept forever",
    fields: [
      { key: "title", label: "Memory title", required: true, placeholder: "A day worth remembering..." },
      { key: "memory_date", label: "When was it?", type: "date", required: true },
      { key: "caption", label: "Your memory", type: "textarea", placeholder: "Write down what happened..." }
    ]
  },
  Collections: {
    table: "lunaria_collections", intro: "Make little collections of the things you adore.",
    titleKey: "name", accent: "Your personal catalogue",
    fields: [
      { key: "name", label: "Name", required: true, placeholder: "Favourite books..." },
      { key: "category", label: "Category", placeholder: "Books, films, places..." },
      { key: "rating", label: "Rating (0–5)", type: "number", placeholder: "5" },
      { key: "description", label: "Description", type: "textarea", placeholder: "Why is this special to you?" }
    ]
  },
  "Knowledge Garden": {
    table: "lunaria_knowledge_cards", intro: "Collect ideas, lessons, and discoveries as they come.",
    titleKey: "title", accent: "Ideas worth growing",
    fields: [
      { key: "title", label: "Idea or topic", required: true, placeholder: "What did you discover?" },
      { key: "category", label: "Category", placeholder: "Learning, life, language..." },
      { key: "body", label: "Your notes", type: "textarea", required: true, placeholder: "Write what you learned..." },
      { key: "tags", label: "Tags (separate with commas)", placeholder: "reading, psychology, ideas" }
    ]
  }
};

function RecordPage({ page }: { page: Page }) {
  const config = modules[page]!;
  const { data = [], isLoading, error } = useRows<Record<string, unknown>>(config.table, config.dateKey || "created_at", false);
  const invalidate = useInvalidate();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Record<string, string> | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => data.filter(row =>
    Object.values(row).some(v => String(v ?? "").toLowerCase().includes(search.toLowerCase()))
  ), [data, search]);

  function blankForm() {
    const obj: Record<string, string> = {};
    config.fields.forEach(f => { obj[f.key] = f.key.endsWith("_date") ? todayISO() : ""; });
    if (page === "Journey") { obj.emoji = "✨"; obj.intensity = "3"; }
    if (page === "Collections") obj.rating = "0";
    return obj;
  }

  function startNew() { setEditing(blankForm()); setShowForm(true); setMessage(""); }

  function startEdit(row: Record<string, unknown>) {
    const obj: Record<string, string> = {};
    config.fields.forEach(f => {
      const value = row[f.key];
      obj[f.key] = Array.isArray(value) ? value.join(", ") : String(value ?? "");
    });
    setEditing({ ...obj, id: String(row.id ?? "") });
    setShowForm(true);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true); setMessage("");
    try {
      const payload: Record<string, unknown> = {};
      config.fields.forEach(f => {
        const value = editing[f.key] ?? "";
        if (f.key === "tags") payload[f.key] = value.split(",").map(s => s.trim()).filter(Boolean);
        else if (f.type === "number") payload[f.key] = value === "" ? 0 : Number(value);
        else payload[f.key] = value;
      });
      if (page === "Journey") {
        payload.intensity = Math.min(5, Math.max(1, Number(payload.intensity) || 3));
        if (!payload.emoji) payload.emoji = "✨";
      }
      if (editing.id) await updateRow(config.table, editing.id, payload);
      else await insertRow(config.table, payload);
      await invalidate(config.table);
      setShowForm(false); setEditing(null);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save this entry.");
    } finally { setBusy(false); }
  }

  async function remove(row: Record<string, unknown>) {
    if (!window.confirm(`Delete "${String(row[config.titleKey] ?? "this entry")}"?`)) return;
    try { await deleteRow(config.table, String(row.id)); await invalidate(config.table); }
    catch (err) { setMessage(err instanceof Error ? err.message : "Could not delete entry."); }
  }

  return (
    <>
      <PageIntro page={page} extra={<Button onClick={startNew}><Plus size={16} /> Add new</Button>} />
      <Glass className="mb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><Eyebrow>{config.accent}</Eyebrow><p className="mt-1 text-sm text-muted-foreground">{config.intro}</p></div>
          <span className="rounded-full bg-secondary/70 px-4 py-2 text-xs">{data.length} saved</span>
        </div>
        <div className="relative mt-5">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${page.toLowerCase()}...`} className="w-full rounded-full border border-white/70 bg-white/60 py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/15" />
        </div>
      </Glass>

      {showForm && editing && <Glass className="mb-5">
        <div className="mb-5 flex items-center justify-between">
          <div><Eyebrow>{editing.id ? "Edit entry" : "Create something new"}</Eyebrow><h2 className="mt-1 font-display text-2xl font-semibold">{editing.id ? "Edit your entry" : "A new page"}</h2></div>
          <button onClick={() => { setShowForm(false); setEditing(null); }} className="rounded-full p-2 hover:bg-secondary"><X size={18} /></button>
        </div>
        <form onSubmit={save} className="space-y-4">
          {config.fields.map(f => <Field key={f.key} label={f.label} value={editing[f.key] ?? ""} onChange={v => setEditing(old => old ? { ...old, [f.key]: v } : old)} placeholder={f.placeholder} type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"} required={f.required} multiline={f.type === "textarea"} />)}
          {message && <p className="text-sm text-destructive">{message}</p>}
          <div className="flex flex-wrap gap-2"><Button type="submit" disabled={busy}>{busy ? "Saving..." : "Save entry"}</Button><Button variant="soft" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button></div>
        </form>
      </Glass>}

      {message && !showForm && <p className="mb-4 rounded-2xl bg-secondary p-3 text-sm">{message}</p>}
      {isLoading && <p className="py-8 text-center text-sm text-muted-foreground">Loading your little universe...</p>}
      {error && <p className="rounded-2xl bg-secondary p-4 text-sm text-destructive">{error.message}</p>}
      {!isLoading && !error && filtered.length === 0 && <EmptyState icon={pageInfo[page].icon} title="Nothing here just yet." text="Create your first entry and let this space grow." />}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map(row => (
          <article key={String(row.id)} className="glass rounded-3xl p-5 transition hover:-translate-y-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Eyebrow>{String(row[config.dateKey || "created_at"] ?? "").slice(0, 10)}</Eyebrow>
                <h3 className="mt-2 break-words font-display text-2xl font-semibold">{String(row[config.titleKey] ?? "Untitled")}</h3>
              </div>
              <button onClick={() => remove(row)} aria-label="Delete entry" className="rounded-full p-2 text-muted-foreground hover:bg-secondary"><Trash2 size={16} /></button>
            </div>
            {row.mood != null && <p className="mt-2 text-xs text-primary">Mood · {String(row.mood)}</p>}
            {row.emoji != null && <p className="mt-2 text-2xl">{String(row.emoji)}</p>}
            {row.intensity != null && <p className="mt-2 text-xs text-muted-foreground">Feeling intensity · {String(row.intensity)}/5</p>}
            {row.category != null && <p className="mt-2 text-xs text-primary">{String(row.category)}</p>}
            {row.start_time != null && <p className="mt-2 text-xs text-muted-foreground">Time · {String(row.start_time).slice(0, 5)}</p>}
            <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{String(row.body ?? row.reflection ?? row.caption ?? row.description ?? row.details ?? "")}</p>
            {Array.isArray(row.tags) && <div className="mt-3 flex flex-wrap gap-2">{(row.tags as string[]).map(tag => <span key={tag} className="rounded-full bg-secondary px-3 py-1 text-xs">#{tag}</span>)}</div>}
            {row.rating != null && <p className="mt-3 text-sm text-primary">{"★".repeat(Math.min(5, Number(row.rating)))}{"☆".repeat(5 - Math.min(5, Number(row.rating)))}</p>}
            <button onClick={() => startEdit(row)} className="mt-4 text-xs font-semibold text-primary hover:underline">Edit entry →</button>
          </article>
        ))}
      </div>
    </>
  );
}

/* HOME */

function Dashboard({ navigate }: { navigate: (p: Page) => void }) {
  const { profile } = useLunaria();
  const { data: tasks = [] } = useRows<Task>("lunaria_tasks", "created_at", false);
  const { data: diary = [] } = useRows("lunaria_diary_entries", "entry_date", false);
  const { data: memories = [] } = useRows("lunaria_memories", "memory_date", false);
  const hour = new Date().getHours();
  const greeting = hour < 11 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const shortcuts: { page: Page; icon: typeof BookOpen; note: string }[] = [
    { page: "Diary", icon: BookOpen, note: "Write your thoughts" },
    { page: "Calendar", icon: CalendarDays, note: "Plan your days" },
    { page: "Memories", icon: FolderHeart, note: "Keep a moment" },
    { page: "Knowledge Garden", icon: Lightbulb, note: "Save an idea" }
  ];

  return (
    <>
      <div className="relative mb-6 overflow-hidden rounded-[30px] bg-universe p-7 text-white shadow-float sm:p-10">
        <div className="pointer-events-none absolute -right-8 -top-12 size-56 rounded-full border border-white/20" />
        <div className="pointer-events-none absolute -right-2 -top-5 size-40 rounded-full border border-white/20" />
        <Eyebrow>{greeting}, welcome back</Eyebrow>
        <h1 className="mt-3 max-w-xl font-display text-4xl font-semibold sm:text-6xl">{profile?.display_name || "Lovely soul"}.</h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-white/80">Your little universe is waiting. Take a breath, make a wish, and begin wherever you are.</p>
        <button onClick={() => navigate("Workspace")} className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:scale-[1.02]">Visit my workspace <ArrowUpRight size={16} /></button>
        <Sparkles className="absolute bottom-8 right-9 opacity-70" size={34} />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Active goals", tasks.filter(t => t.status === "active").length, Target],
          ["Completed", tasks.filter(t => t.status === "completed").length, CheckCircle2],
          ["Diary pages", diary.length, BookOpen],
          ["Memories", memories.length, Heart]
        ].map(([label, value, Icon]) => {
          const I = Icon as typeof Star;
          return <Glass key={String(label)} className="p-4"><I size={19} className="mb-3 text-primary" /><p className="text-xs text-muted-foreground">{label as string}</p><p className="font-display text-3xl font-semibold">{value as number}</p></Glass>;
        })}
      </div>

      <Glass className="mb-6">
        <div className="mb-5 flex items-center justify-between"><div><Eyebrow>A little bit of everything</Eyebrow><h2 className="mt-1 font-display text-2xl font-semibold">Your quick access</h2></div><Flower2 className="text-primary" /></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {shortcuts.map(({ page, icon: Icon, note }) => <button key={page} onClick={() => navigate(page)} className="rounded-2xl border border-white/70 bg-white/45 p-4 text-left transition hover:-translate-y-1 hover:bg-white/80"><span className="mb-4 grid size-10 place-items-center rounded-xl bg-secondary text-primary"><Icon size={20} /></span><span className="block font-semibold">{page}</span><span className="mt-1 block text-xs text-muted-foreground">{note}</span></button>)}
        </div>
      </Glass>

      <Glass>
        <Eyebrow>A gentle reminder</Eyebrow>
        <p className="mt-2 font-display text-2xl font-semibold">You are allowed to grow at your own pace.</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Small steps are still steps. You do not have to figure everything out today.</p>
      </Glass>
    </>
  );
}

/* ARCADE */

function ArcadePage() {
  const [target, setTarget] = useState(() => Math.floor(Math.random() * 9) + 1);
  const [guess, setGuess] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [message, setMessage] = useState("Choose a number and see if the universe agrees.");

  function play(n: number) {
    if (guess !== null) return;
    setGuess(n);
    setRounds(v => v + 1);
    if (n === target) { setScore(v => v + 1); setMessage("You found it! A little spark of luck ✨"); }
    else setMessage(n < target ? "A little higher! Try again next round." : "A little lower! Try again next round.");
  }

  function next() {
    setTarget(Math.floor(Math.random() * 9) + 1);
    setGuess(null);
    setMessage("Choose a number and see if the universe agrees.");
  }

  return (
    <>
      <PageIntro page="Arcade" />
      <Glass className="mx-auto max-w-xl text-center">
        <div className="mx-auto mb-4 grid size-16 place-items-center rounded-3xl bg-secondary text-primary"><WandSparkles size={30} /></div>
        <Eyebrow>A tiny game of intuition</Eyebrow>
        <h2 className="mt-2 font-display text-3xl font-semibold">Guess the starlight</h2>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <div className="my-7 grid grid-cols-3 gap-3">
          {Array.from({ length: 9 }, (_, i) => i + 1).map(n => <button key={n} onClick={() => play(n)} disabled={guess !== null} className={cx("aspect-square rounded-2xl border border-white/70 bg-white/60 font-display text-3xl transition hover:bg-secondary disabled:opacity-70", guess === n && "bg-universe text-white")}>{n}</button>)}
        </div>
        <div className="mb-5 flex justify-center gap-8 text-sm"><span>Score <b>{score}</b></span><span>Rounds <b>{rounds}</b></span></div>
        {guess !== null && <Button onClick={next}>Play another round <ArrowRight size={16} /></Button>}
      </Glass>
    </>
  );
}

/* SETTINGS */

function SettingsPage() {
  const { profile, saveProfile, signOut } = useLunaria();
  const [name, setName] = useState(profile?.display_name ?? "");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setMessage("");
    try {
      await saveProfile({ display_name: name.trim() });
      setMessage("Your changes have been saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save settings.");
    } finally { setBusy(false); }
  }

  return (
    <>
      <PageIntro page="Settings" />
      <Glass className="mb-5">
        <div className="mb-5 flex items-center gap-3"><div className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary"><Settings2 /></div><div><h2 className="font-display text-2xl font-semibold">Personal details</h2><p className="text-sm text-muted-foreground">A name for your little universe.</p></div></div>
        <form onSubmit={save} className="space-y-4">
          <Field label="Display name" value={name} onChange={setName} placeholder="What should Lunaria call you?" />
          {message && <p className="text-sm text-primary">{message}</p>}
          <Button type="submit" disabled={busy}>{busy ? "Saving..." : "Save changes"}</Button>
        </form>
      </Glass>
      <Glass>
        <Eyebrow>Your account</Eyebrow>
        <h2 className="mt-2 font-display text-2xl font-semibold">Sign out of Lunaria</h2>
        <p className="mt-2 mb-5 text-sm text-muted-foreground">Your saved universe will stay connected to your account.</p>
        <Button variant="soft" onClick={() => void signOut()}><LogOut size={16} /> Sign out</Button>
      </Glass>
    </>
  );
}

/* MAIN APP SHELL */

function AppShell() {
  const [page, setPage] = useState<Page>("Home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile } = useLunaria();

  function navigate(next: Page) {
    setPage(next);
    setSidebarOpen(false);
  }

  const groups = [...new Set(navigation.map(n => n.group))];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <CssSky />
      <div className="relative z-10 flex min-h-screen">
        {sidebarOpen && <button aria-label="Close menu" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden" />}
        <aside className={cx("fixed inset-y-0 left-0 z-40 flex w-[275px] flex-col border-r border-white/50 bg-white/75 p-5 shadow-xl backdrop-blur-2xl transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none", sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
          <div className="mb-9 flex items-center justify-between"><Brand /><button onClick={() => setSidebarOpen(false)} className="rounded-full p-2 hover:bg-secondary lg:hidden"><X size={18} /></button></div>
          <div className="mb-6 rounded-2xl bg-universe p-4 text-white"><p className="text-[10px] uppercase tracking-[.2em] text-white/70">Your universe</p><p className="mt-1 font-display text-xl font-semibold">{profile?.display_name || "Lovely soul"}</p><p className="mt-1 text-xs text-white/70">A space to become yourself.</p></div>
          <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto">
            {groups.map(group => <div key={group}><p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.22em] text-muted-foreground">{group}</p><div className="space-y-1">
              {navigation.filter(n => n.group === group).map(item => {
                const Icon = item.icon;
                return <button key={item.name} onClick={() => navigate(item.name)} className={cx("flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition", page === item.name ? "bg-universe text-white shadow-float" : "text-muted-foreground hover:bg-white/80 hover:text-foreground")}><Icon size={18} /><span>{item.name}</span>{page === item.name && <ArrowUpRight size={14} className="ml-auto" />}</button>;
              })}
            </div></div>)}
          </nav>
          <div className="mt-5 rounded-2xl border border-white/70 bg-white/45 p-4"><p className="font-display text-lg">A gentle note</p><p className="mt-1 text-xs leading-5 text-muted-foreground">You are a work in progress, and that is beautiful.</p></div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/40 bg-white/40 px-4 py-3 backdrop-blur-xl sm:px-8">
            <div className="flex items-center gap-3"><button onClick={() => setSidebarOpen(true)} className="rounded-xl bg-white/70 p-2 lg:hidden"><Menu size={19} /></button><span className="font-display text-xl font-semibold lg:hidden">Lunaria</span><span className="hidden text-xs text-muted-foreground lg:block">Your personal universe ✧</span></div>
            <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-3 py-2 text-xs"><Sparkles size={14} className="text-primary" /> A little space for you</div>
          </header>
          <div className="mx-auto max-w-6xl px-4 py-7 sm:px-8 sm:py-10">
            {page === "Home" && <Dashboard navigate={navigate} />}
            {page === "Workspace" && <WorkspacePage />}
            {modules[page] && <RecordPage page={page} />}
            {page === "Arcade" && <ArcadePage />}
            {page === "Settings" && <SettingsPage />}
          </div>
          <footer className="px-5 pb-8 text-center text-xs text-muted-foreground">Made with a little bit of stardust · Lunaria ✧</footer>
        </main>
      </div>
    </div>
  );
}

/* APPLICATION ENTRY */

export function LunariaApp() {
  const { status, unlocked, schemaError } = useLunaria();

  if (status === "loading") {
    return <main className="flex min-h-screen items-center justify-center"><div className="text-center"><div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-universe text-white"><Moon /></div><p className="font-display text-2xl">Opening Lunaria...</p></div></main>;
  }

  if (status === "signed-out") return <AuthScreen />;

  if (status === "recovery") {
    return <main className="flex min-h-screen items-center justify-center p-5"><Glass className="max-w-md text-center"><LockKeyhole className="mx-auto mb-4 text-primary" size={32} /><h1 className="font-display text-3xl">Password recovery</h1><p className="mt-3 text-sm text-muted-foreground">Use the password reset link from your email to continue.</p><Button onClick={() => void supabase.auth.signOut()}><LogOut size={16} /> Return to sign in</Button></Glass></main>;
  }

  if (status === "setup-needed") {
    return <main className="flex min-h-screen items-center justify-center p-5"><Glass className="max-w-lg"><h1 className="font-display text-3xl">A little setup is needed</h1><p className="mt-3 text-sm text-muted-foreground">Lunaria could not load your profile table. Check that the Supabase schema has been installed.</p><p className="mt-3 break-words text-xs text-destructive">{schemaError}</p></Glass></main>;
  }

  if (!unlocked) return <PinScreen />;
  return <AppShell />;
}

export default LunariaApp;
