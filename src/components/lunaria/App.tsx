import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Home, Target, CalendarDays, BookOpen, Compass, FolderHeart, Gem,
  Lightbulb, Gamepad2, Settings2, Moon, Sparkles, Plus, Search,
  Trash2, Check, CheckCircle2, Star, LockKeyhole, ArrowRight,
  ArrowUpRight, Menu, X, LogOut, Heart, Flower2, WandSparkles,
  CalendarCheck, Shuffle, Sprout, ChefHat, Archive
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
  | "Daily World" | "Explore" | "Randomizer" | "My Garden"
  | "Recipes" | "My Vault" | "Settings";

const navigation = [
  { name: "Home", icon: Home, group: "YOUR UNIVERSE" },
  { name: "Daily World", icon: CalendarCheck, group: "YOUR UNIVERSE" },
  { name: "Workspace", icon: Target, group: "YOUR UNIVERSE" },
  { name: "Calendar", icon: CalendarDays, group: "YOUR UNIVERSE" },

  { name: "Arcade", icon: Gamepad2, group: "DISCOVER" },
  { name: "Explore", icon: Compass, group: "DISCOVER" },
  { name: "Randomizer", icon: Shuffle, group: "DISCOVER" },
  { name: "Knowledge Garden", icon: Lightbulb, group: "DISCOVER" },

  { name: "Diary", icon: BookOpen, group: "PERSONAL SPACE" },
  { name: "Journey", icon: Compass, group: "PERSONAL SPACE" },
  { name: "Memories", icon: FolderHeart, group: "PERSONAL SPACE" },
  { name: "My Vault", icon: Archive, group: "PERSONAL SPACE" },
  { name: "Collections", icon: Gem, group: "PERSONAL SPACE" },
  { name: "My Garden", icon: Sprout, group: "PERSONAL SPACE" },
  { name: "Recipes", icon: ChefHat, group: "PERSONAL SPACE" },

  { name: "Settings", icon: Settings2, group: "SYSTEM" }
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
  "Daily World": { subtitle: "A little check-in for every day.", icon: CalendarCheck },
  Explore: { subtitle: "Discover every corner of your universe.", icon: Compass },
  Randomizer: { subtitle: "Let the universe make a choice.", icon: Shuffle },
  "My Garden": { subtitle: "Grow gently, one habit at a time.", icon: Sprout },
  Recipes: { subtitle: "A collection of things you love to make.", icon: ChefHat },
  "My Vault": { subtitle: "A private place for your treasures.", icon: Archive },
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
        <div className="font-display text-2xl font-semibold leading-none">Lunaria</div>
        <div className="mt-1 text-[9px] uppercase tracking-[.28em] text-muted-foreground">
          Personal universe
        </div>
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

function Button({ children, onClick, type = "button", variant = "primary", disabled = false }: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "soft" | "plain";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition active:scale-[.98] disabled:opacity-50",
        variant === "primary" && "bg-universe text-white shadow-float hover:opacity-90",
        variant === "soft" && "border border-white/70 bg-white/65 hover:bg-white",
        variant === "plain" && "text-muted-foreground hover:bg-white/60"
      )}
    >
      {children}
    </button>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", required = false, multiline = false }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  multiline?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-2 block font-medium">{label}</span>
      {multiline ? (
        <textarea
          required={required}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full rounded-2xl border border-white/80 bg-white/65 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20"
        />
      ) : (
        <input
          required={required}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-w-0 rounded-2xl border border-white/80 bg-white/65 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20"
        />
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
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          {pageInfo[page].subtitle}
        </p>
      </div>
      {extra}
    </div>
  );
}

function EmptyState({ icon: Icon, title, text }: {
  icon: typeof Sparkles;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-primary/20 bg-white/25 px-5 py-10 text-center">
      <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-secondary text-primary">
        <Icon size={23} />
      </div>
      <p className="font-display text-xl font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
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
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password
        });
        if (error) throw error;
        if (!data.session) {
          setMessage("Check your email to confirm your account, then sign in.");
        }
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
      <div className="pointer-events-none absolute inset-0">
        <Universe3D variant="lock" className="h-full w-full" />
      </div>
      <Glass className="relative z-10 w-full max-w-md p-7 sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <Brand />
          <p className="mt-8 font-display text-3xl font-semibold">Your universe awaits.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            A little space for everything that makes you, you.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-full bg-secondary/70 p-1">
          {(["login", "signup"] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setMessage(""); }}
              className={cx("rounded-full py-2.5 text-sm", mode === m && "bg-white shadow-sm")}
            >
              {m === "login" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Field label="Email address" value={email} onChange={setEmail}
            type="email" placeholder="you@example.com" required />
          <Field label="Password" value={password} onChange={setPassword}
            type="password" placeholder="Your password" required />
          {message && <p className="rounded-2xl bg-secondary p-3 text-sm">{message}</p>}
          <Button type="submit" disabled={busy}>
            {busy ? "Please wait..." : mode === "login" ? "Enter Lunaria" : "Create my universe"}
            <ArrowUpRight size={16} />
          </Button>
        </form>
      </Glass>
    </main>
  );
}

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
      <div className="pointer-events-none absolute inset-0">
        <Universe3D variant="lock" className="h-full w-full" />
      </div>
      <Glass className="relative z-10 w-full max-w-[370px] p-7 text-center sm:p-9">
        <div className="mx-auto mb-5 grid size-16 place-items-center rounded-[22px] bg-universe text-white shadow-float">
          <LockKeyhole size={27} />
        </div>
        <Eyebrow>{firstPin ? "A little privacy" : "Welcome back"}</Eyebrow>
        <h1 className="mt-2 font-display text-3xl font-semibold">
          {firstPin ? "Create your PIN" : "Unlock Lunaria"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {firstPin ? "Choose a four-digit PIN." : "Enter your four-digit PIN."}
        </p>
        <div className="my-7 flex justify-center gap-4">
          {[0, 1, 2, 3].map(i => (
            <span key={i} className={cx(
              "size-3 rounded-full border border-primary/40",
              pin.length > i ? "bg-primary" : "bg-white/60"
            )} />
          ))}
        </div>
        <div className="mx-auto grid max-w-[250px] grid-cols-3 gap-3">
          {["1","2","3","4","5","6","7","8","9","clear","0","back"].map(k => (
            <button
              key={k}
              onClick={() => {
                setError("");
                if (k === "clear") setPin("");
                else if (k === "back") setPin(v => v.slice(0, -1));
                else if (pin.length < 4) setPin(v => v + k);
              }}
              className="grid aspect-square place-items-center rounded-2xl border border-white/70 bg-white/65 text-lg font-semibold shadow-sm active:scale-95"
            >
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
  const { data: tasks = [], isLoading, error } =
    useRows<Task>("lunaria_tasks", "created_at", false);
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
        title: title.trim(),
        task_type: kind,
        label: "Personal",
        assigned_by: "",
        description: "",
        deadline: deadline || null,
        status: "active",
        progress: 0,
        completed_at: null
      });

      setTitle("");
      setDeadline("");
      setShowForm(false);
      await invalidate("lunaria_tasks");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save task.");
    } finally {
      setBusy(false);
    }
  }

  async function complete(task: Task) {
    await updateRow("lunaria_tasks", task.id, {
      status: "completed",
      progress: 100,
      completed_at: new Date().toISOString()
    });
    await invalidate("lunaria_tasks");
  }

  async function remove(task: Task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    await deleteRow("lunaria_tasks", task.id);
    await invalidate("lunaria_tasks");
  }

  return (
    <>
      <PageIntro page="Workspace" extra={
        <Button onClick={() => setShowForm(v => !v)}>
          <Plus size={16} /> New task
        </Button>
      } />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Active tasks", active.length, Target],
          ["Completed", completed.length, CheckCircle2],
          ["Total tasks", tasks.length, Sparkles],
          ["Completion", tasks.length
            ? `${Math.round(completed.length / tasks.length * 100)}%`
            : "0%", Star]
        ].map(([label, value, Icon]) => {
          const I = Icon as typeof Star;
          return (
            <Glass key={String(label)} className="p-4">
              <I size={18} className="mb-3 text-primary" />
              <p className="text-xs text-muted-foreground">{label as string}</p>
              <p className="mt-1 font-display text-3xl font-semibold">
                {value as string | number}
              </p>
            </Glass>
          );
        })}
      </div>

      {showForm && (
        <Glass className="mb-5">
          <form onSubmit={createTask} className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">A new little goal</h2>
            <Field label="Task name" value={title} onChange={setTitle}
              placeholder="What would you like to accomplish?" required />
            <label className="block text-sm">
              Task type
              <select
                value={kind}
                onChange={e => setKind(e.target.value as "small" | "long")}
                className="mt-2 w-full rounded-2xl border bg-white/65 px-4 py-3"
              >
                <option value="small">Small task</option>
                <option value="long">Long project</option>
              </select>
            </label>
            <Field label="Deadline" value={deadline} onChange={setDeadline} type="date" />
            <div className="flex gap-2">
              <Button type="submit" disabled={busy}>Save task</Button>
              <Button variant="soft" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Glass>
      )}

      {message && <p className="mb-4 text-sm text-destructive">{message}</p>}

      <Glass>
        <Eyebrow>Your to-do list</Eyebrow>
        <h2 className="mb-5 mt-1 font-display text-2xl font-semibold">Things in progress</h2>
        {isLoading && <p>Loading tasks...</p>}
        {error && <p className="text-destructive">{error.message}</p>}
        {!isLoading && !tasks.length && (
          <EmptyState icon={Target} title="Your workspace is waiting."
            text="Add your first task and start with one small step." />
        )}

        <div className="space-y-3">
          {tasks.map(task => (
            <article key={task.id} className="rounded-2xl border border-white/70 bg-white/45 p-4">
              <div className="flex justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{task.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {task.status} · {task.deadline || "No deadline"}
                  </p>
                </div>
                <button onClick={() => remove(task)} aria-label="Delete task">
                  <Trash2 size={16} />
                </button>
              </div>
              {task.task_type === "long" && (
                <input
                  aria-label="Task progress"
                  type="range"
                  min="0"
                  max="100"
                  value={task.progress}
                  onChange={async e => {
                    await updateRow("lunaria_tasks", task.id, {
                      progress: Number(e.target.value)
                    });
                    await invalidate("lunaria_tasks");
                  }}
                  className="mt-3 w-full"
                />
              )}
              {task.status === "active" && (
                <Button onClick={() => complete(task)}>
                  <Check size={15} /> Mark complete
                </Button>
              )}
            </article>
          ))}
        </div>
      </Glass>
    </>
  );
}
/* GENERIC RECORD PAGES */

type FieldDef = { key: string; label: string; type?: "text" | "date" | "number" | "textarea"; required?: boolean; placeholder?: string };
type ModuleConfig = { table: string; intro: string; fields: FieldDef[]; titleKey: string; dateKey?: string; accent: string };

const modules: Partial<Record<Page, ModuleConfig>> = {
  Diary: { table: "lunaria_diary_entries", intro: "Write freely. No perfect words needed here.", titleKey: "title", dateKey: "entry_date", accent: "A page for your thoughts", fields: [
    {key:"title",label:"Entry title",required:true},{key:"entry_date",label:"Date",type:"date",required:true},{key:"mood",label:"Mood"},{key:"body",label:"Your thoughts",type:"textarea",required:true}
  ]},
  Calendar: { table: "lunaria_calendar_events", intro: "Give your plans a place to live.", titleKey: "title", dateKey: "event_date", accent: "Your upcoming moments", fields: [
    {key:"title",label:"Event name",required:true},{key:"event_date",label:"Date",type:"date",required:true},{key:"start_time",label:"Time"},{key:"details",label:"Details",type:"textarea"}
  ]},
  Journey: { table: "lunaria_journey", intro: "A gentle check-in with the person you are becoming.", titleKey: "feeling", dateKey: "entry_date", accent: "Your emotional check-in", fields: [
    {key:"feeling",label:"What are you feeling?",required:true},{key:"emoji",label:"Emoji"},{key:"intensity",label:"Intensity (1–5)",type:"number"},{key:"entry_date",label:"Date",type:"date",required:true},{key:"reflection",label:"Reflection",type:"textarea"}
  ]},
  Memories: { table: "lunaria_memories", intro: "Save the moments that make your heart feel full.", titleKey: "title", dateKey: "memory_date", accent: "Little moments, kept forever", fields: [
    {key:"title",label:"Memory title",required:true},{key:"memory_date",label:"When was it?",type:"date",required:true},{key:"caption",label:"Your memory",type:"textarea"}
  ]},
  Collections: { table: "lunaria_collections", intro: "Make little collections of the things you adore.", titleKey: "name", accent: "Your personal catalogue", fields: [
    {key:"name",label:"Name",required:true},{key:"category",label:"Category"},{key:"rating",label:"Rating (0–5)",type:"number"},{key:"description",label:"Description",type:"textarea"}
  ]},
  "Knowledge Garden": { table: "lunaria_knowledge_cards", intro: "Collect ideas, lessons, and discoveries as they come.", titleKey: "title", accent: "Ideas worth growing", fields: [
    {key:"title",label:"Idea or topic",required:true},{key:"category",label:"Category"},{key:"body",label:"Your notes",type:"textarea",required:true},{key:"tags",label:"Tags (separate with commas)"}
  ]}
};

function RecordPage({ page }: { page: Page }) {
  const config = modules[page]!;
  const { data = [], isLoading, error } = useRows<Record<string, unknown>>(config.table, config.dateKey || "created_at", false);
  const invalidate = useInvalidate();
  const [showForm,setShowForm] = useState(false);
  const [search,setSearch] = useState("");
  const [editing,setEditing] = useState<Record<string,string> | null>(null);
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState("");
  const filtered = useMemo(() => data.filter(row => Object.values(row).some(v => String(v ?? "").toLowerCase().includes(search.toLowerCase()))), [data,search]);

  function startNew() {
    const obj: Record<string,string> = {};
    config.fields.forEach(f => { obj[f.key] = f.key.endsWith("_date") ? todayISO() : ""; });
    if (page === "Journey") { obj.emoji = "✨"; obj.intensity = "3"; }
    setEditing(obj); setShowForm(true); setMessage("");
  }

  async function save(e: FormEvent) {
    e.preventDefault(); if (!editing) return;
    setBusy(true); setMessage("");
    try {
      const payload: Record<string,unknown> = {};
      config.fields.forEach(f => {
        const value = editing[f.key] ?? "";
        if (f.key === "tags") payload[f.key] = value.split(",").map(s => s.trim()).filter(Boolean);
        else if (f.type === "number") payload[f.key] = value === "" ? 0 : Number(value);
        else payload[f.key] = value;
      });
      if (page === "Journey") { payload.intensity = Math.min(5,Math.max(1,Number(payload.intensity)||3)); if (!payload.emoji) payload.emoji = "✨"; }
      if (editing.id) await updateRow(config.table,editing.id,payload); else await insertRow(config.table,payload);
      await invalidate(config.table); setShowForm(false); setEditing(null);
    } catch(err) { setMessage(err instanceof Error ? err.message : "Could not save."); }
    finally { setBusy(false); }
  }

  async function remove(row: Record<string,unknown>) {
    if (!window.confirm(`Delete "${String(row[config.titleKey] ?? "this entry")}"?`)) return;
    await deleteRow(config.table,String(row.id)); await invalidate(config.table);
  }

  return <>
    <PageIntro page={page} extra={<Button onClick={startNew}><Plus size={16} /> Add new</Button>} />
    <Glass className="mb-5"><div className="flex items-center justify-between gap-3"><div><Eyebrow>{config.accent}</Eyebrow><p className="mt-1 text-sm text-muted-foreground">{config.intro}</p></div><span className="rounded-full bg-secondary px-4 py-2 text-xs">{data.length} saved</span></div>
      <div className="relative mt-5"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${page.toLowerCase()}...`} className="w-full rounded-full border border-white/70 bg-white/60 py-3 pl-11 pr-4 text-sm" /></div>
    </Glass>
    {showForm && editing && <Glass className="mb-5"><div className="mb-5 flex justify-between"><h2 className="font-display text-2xl font-semibold">A new page</h2><button onClick={() => setShowForm(false)}><X /></button></div>
      <form onSubmit={save} className="space-y-4">{config.fields.map(f => <Field key={f.key} label={f.label} value={editing[f.key] ?? ""} onChange={v => setEditing(old => old ? {...old,[f.key]:v} : old)} placeholder={f.placeholder} type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"} required={f.required} multiline={f.type === "textarea"} />)}
        {message && <p className="text-sm text-destructive">{message}</p>}<div className="flex gap-2"><Button type="submit" disabled={busy}>{busy ? "Saving..." : "Save entry"}</Button><Button variant="soft" onClick={() => setShowForm(false)}>Cancel</Button></div>
      </form></Glass>}
    {isLoading && <p>Loading...</p>}{error && <p className="text-destructive">{error.message}</p>}
    {!isLoading && !filtered.length && <EmptyState icon={pageInfo[page].icon} title="Nothing here just yet." text="Create your first entry and let this space grow." />}
    <div className="grid gap-4 sm:grid-cols-2">{filtered.map(row => <article key={String(row.id)} className="glass rounded-3xl p-5"><div className="flex justify-between gap-3"><div><Eyebrow>{String(row[config.dateKey || "created_at"] ?? "").slice(0,10)}</Eyebrow><h3 className="mt-2 font-display text-2xl font-semibold">{String(row[config.titleKey] ?? "Untitled")}</h3></div><button onClick={() => remove(row)}><Trash2 size={16} /></button></div>
      {row.emoji != null && <p className="mt-2 text-2xl">{String(row.emoji)}</p>}{row.category != null && <p className="mt-2 text-xs text-primary">{String(row.category)}</p>}
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{String(row.body ?? row.reflection ?? row.caption ?? row.description ?? row.details ?? "")}</p>
    </article>)}</div>
  </>;
}

/* DAILY WORLD */

function DailyWorldPage() {
  const { profile } = useLunaria();
  const { data: entries = [] } = useRows<Record<string,unknown>>("lunaria_journey","entry_date",false);
  const [mood,setMood] = useState("😊");
  const [note,setNote] = useState("");
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState("");
  const invalidate = useInvalidate();
  const today = todayISO();
  const already = entries.some(e => String(e.entry_date) === today);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  async function checkIn() {
    setBusy(true);
    try {
      await insertRow("lunaria_journey",{ feeling: mood, emoji: mood, intensity: 3, entry_date: today, reflection: note });
      await invalidate("lunaria_journey"); setMessage("Your daily check-in is saved ✨");
    } catch(err) { setMessage(err instanceof Error ? err.message : "Could not save check-in."); }
    finally { setBusy(false); }
  }

  return <>
    <PageIntro page="Daily World" />
    <Glass className="mb-5"><Eyebrow>Your little daily universe</Eyebrow><h2 className="mt-2 font-display text-4xl font-semibold">{greeting}, {profile?.display_name || "Lovely soul"} ✨</h2><p className="mt-3 text-sm text-muted-foreground">Today is another chance to become a little more yourself.</p></Glass>
    <Glass><Eyebrow>Daily check-in</Eyebrow><h2 className="mt-2 font-display text-2xl font-semibold">How are you feeling today?</h2>
      <div className="my-5 flex flex-wrap gap-3">{["😊","🥰","😌","🥺","😔","😴","🤩"].map(e => <button key={e} onClick={() => setMood(e)} className={cx("rounded-2xl border p-3 text-2xl",mood === e ? "border-primary bg-secondary" : "border-white/70 bg-white/50")}>{e}</button>)}</div>
      <Field label="A little note about today" value={note} onChange={setNote} placeholder="What's on your mind?" multiline />
      <Button onClick={checkIn} disabled={busy || already}>{busy ? "Saving..." : already ? "Already checked in today ✓" : "Save my check-in"}</Button>
      {message && <p className="mt-3 text-sm text-primary">{message}</p>}
    </Glass>
  </>;
}

/* EXPLORE */

function ExplorePage({ navigate }: { navigate: (p: Page) => void }) {
  const items: { page: Page; icon: typeof Home; description: string }[] = [
    {page:"Daily World",icon:CalendarCheck,description:"Your daily moments and check-in"},
    {page:"My Garden",icon:Sprout,description:"Grow your habits"},
    {page:"Recipes",icon:ChefHat,description:"Keep your favourite recipes"},
    {page:"My Vault",icon:Archive,description:"Your personal collection"},
    {page:"Randomizer",icon:Shuffle,description:"Let the universe decide"},
    {page:"Knowledge Garden",icon:Lightbulb,description:"Save things you learn"},
    {page:"Arcade",icon:Gamepad2,description:"Take a little break"},
    {page:"Collections",icon:Gem,description:"Collect things you love"}
  ];
  return <><PageIntro page="Explore" /><div className="grid gap-4 sm:grid-cols-2">{items.map(({page,icon:Icon,description}) => <button key={page} onClick={() => navigate(page)} className="glass rounded-3xl p-5 text-left transition hover:-translate-y-1"><Icon className="mb-4 text-primary" size={25} /><h2 className="font-display text-2xl font-semibold">{page}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></button>)}</div></>;
}

/* RANDOMIZER */

function RandomizerPage() {
  const [choices,setChoices] = useState("Read a book\nWatch a movie\nGo for a walk\nRest");
  const [result,setResult] = useState("");
  function choose() {
    const options = choices.split("\n").map(s => s.trim()).filter(Boolean);
    if (!options.length) return;
    setResult(options[Math.floor(Math.random()*options.length)]);
  }
  return <><PageIntro page="Randomizer" /><Glass className="mx-auto max-w-xl text-center"><div className="mx-auto mb-4 grid size-16 place-items-center rounded-3xl bg-secondary text-primary"><WandSparkles size={30} /></div><Eyebrow>Let the universe decide</Eyebrow><h2 className="mt-2 font-display text-3xl font-semibold">What should I do?</h2><p className="my-3 text-sm text-muted-foreground">Write each option on a new line.</p><textarea value={choices} onChange={e => setChoices(e.target.value)} rows={6} className="w-full rounded-2xl border bg-white/65 p-4 text-left" /><Button onClick={choose}><Shuffle size={16} /> Choose for me</Button>{result && <div className="mt-6 rounded-3xl bg-secondary p-6"><Eyebrow>The universe says...</Eyebrow><p className="mt-2 font-display text-3xl font-semibold">{result}</p></div>}</Glass></>;
}

/* MY GARDEN */

function GardenPage() {
  const {data:habits = [],isLoading,error} = useRows<Record<string,any>>("lunaria_habits","created_at",false);
  const {data:checks = []} = useRows<Record<string,any>>("lunaria_habit_checkins","created_at",false);
  const invalidate = useInvalidate();
  const [name,setName] = useState("");
  const [emoji,setEmoji] = useState("🌱");
  const [detail,setDetail] = useState("");
  const [frequency,setFrequency] = useState<"daily"|"weekly"|"monthly">("daily");
  const [busy,setBusy] = useState(false);
  const period = todayISO();

  async function addHabit(e: FormEvent) {
    e.preventDefault(); if (!name.trim()) return;
    setBusy(true);
    try {
      await insertRow("lunaria_habits",{name:name.trim(),emoji,detail,frequency});
      setName(""); setDetail(""); await invalidate("lunaria_habits");
    } finally { setBusy(false); }
  }

  async function mark(habit: Record<string,any>) {
    const exists = checks.some(c => c.habit_id === habit.id && c.period_key === period);
    if (exists) return;
    await insertRow("lunaria_habit_checkins",{habit_id:habit.id,period_key:period});
    await invalidate("lunaria_habit_checkins");
  }

  async function remove(habit: Record<string,any>) {
    if (!window.confirm(`Delete "${habit.name}"?`)) return;
    await deleteRow("lunaria_habits",habit.id); await invalidate("lunaria_habits");
  }

  return <><PageIntro page="My Garden" /><Glass className="mb-5"><Eyebrow>Plant a new habit</Eyebrow><form onSubmit={addHabit} className="mt-4 space-y-3"><div className="grid gap-3 sm:grid-cols-[100px_1fr]"><Field label="Emoji" value={emoji} onChange={setEmoji} /><Field label="Habit name" value={name} onChange={setName} placeholder="Drink more water" required /></div><Field label="Details" value={detail} onChange={setDetail} placeholder="A little reminder..." /><label className="block text-sm">Frequency<select value={frequency} onChange={e => setFrequency(e.target.value as typeof frequency)} className="mt-2 w-full rounded-2xl border bg-white/65 px-4 py-3"><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></label><Button type="submit" disabled={busy}><Plus size={16} /> Add to my garden</Button></form></Glass>
    <Glass><Eyebrow>Your growing garden</Eyebrow><h2 className="mb-5 mt-1 font-display text-2xl font-semibold">Little steps, big growth</h2>{isLoading && <p>Loading habits...</p>}{error && <p className="text-destructive">{error.message}</p>}{!habits.length && <EmptyState icon={Sprout} title="Your garden is waiting." text="Plant your first habit and nurture it every day." />}
      <div className="space-y-3">{habits.map(h => {const done = checks.some(c => c.habit_id === h.id && c.period_key === period);return <article key={h.id} className="flex items-center gap-3 rounded-2xl border bg-white/45 p-4"><span className="text-3xl">{h.emoji}</span><div className="min-w-0 flex-1"><h3 className="font-semibold">{h.name}</h3><p className="text-xs text-muted-foreground">{h.frequency} · {h.detail}</p></div><Button variant={done ? "soft" : "primary"} onClick={() => mark(h)} disabled={done}>{done ? "Done ✓" : "Check in"}</Button><button onClick={() => remove(h)} aria-label="Delete habit"><Trash2 size={16}/></button></article>;})}</div>
    </Glass></>;
}

/* RECIPES */

function RecipesPage() {
  const {data:recipes = [],isLoading,error} = useRows<Record<string,any>>("lunaria_recipes","created_at",false);
  const invalidate = useInvalidate();
  const [name,setName] = useState("");
  const [category,setCategory] = useState("Favourite");
  const [ingredients,setIngredients] = useState("");
  const [steps,setSteps] = useState("");
  const [busy,setBusy] = useState(false);

  async function add(e: FormEvent) {
    e.preventDefault(); if (!name.trim()) return;
    setBusy(true);
    try {
      await insertRow("lunaria_recipes",{name:name.trim(),category,ingredients,steps,image_path:null});
      setName("");setIngredients("");setSteps("");await invalidate("lunaria_recipes");
    } finally {setBusy(false);}
  }
  async function remove(id:string) {
    if (!window.confirm("Delete this recipe?")) return;
    await deleteRow("lunaria_recipes",id);await invalidate("lunaria_recipes");
  }
  return <><PageIntro page="Recipes" /><Glass className="mb-5"><Eyebrow>Add a recipe</Eyebrow><form onSubmit={add} className="mt-4 space-y-3"><Field label="Recipe name" value={name} onChange={setName} placeholder="Strawberry pancakes" required /><Field label="Category" value={category} onChange={setCategory} placeholder="Breakfast, dessert..." /><Field label="Ingredients" value={ingredients} onChange={setIngredients} multiline placeholder="List your ingredients..." /><Field label="Steps" value={steps} onChange={setSteps} multiline placeholder="How do you make it?" /><Button type="submit" disabled={busy}><Plus size={16}/> Save recipe</Button></form></Glass>
    <div className="grid gap-4 sm:grid-cols-2">{isLoading && <p>Loading recipes...</p>}{error && <p className="text-destructive">{error.message}</p>}{!recipes.length && <EmptyState icon={ChefHat} title="No recipes yet." text="Save a recipe you love." />}{recipes.map(r => <Glass key={r.id}><div className="flex justify-between gap-3"><div><Eyebrow>{r.category}</Eyebrow><h3 className="mt-2 font-display text-2xl font-semibold">{r.name}</h3></div><button onClick={() => remove(r.id)}><Trash2 size={16}/></button></div><h4 className="mt-4 text-sm font-semibold">Ingredients</h4><p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{r.ingredients}</p><h4 className="mt-4 text-sm font-semibold">Steps</h4><p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{r.steps}</p></Glass>)}</div>
  </>;
}

/* MY VAULT */

function VaultPage() {
  const {data:items = [],isLoading,error} = useRows<Record<string,any>>("lunaria_media_items","created_at",false);
  const invalidate = useInvalidate();
  const [title,setTitle] = useState("");
  const [description,setDescription] = useState("");
  const [category,setCategory] = useState("Personal");
  const [path,setPath] = useState("");
  const [busy,setBusy] = useState(false);

  async function add(e:FormEvent) {
    e.preventDefault();if(!title.trim() || !path.trim()) return;
    setBusy(true);
    try {
      await insertRow("lunaria_media_items",{title:title.trim(),description,category,file_path:path,mime_type:"",size_bytes:0});
      setTitle("");setDescription("");setPath("");await invalidate("lunaria_media_items");
    } finally {setBusy(false);}
  }
  async function remove(id:string) {
    if(!window.confirm("Remove this vault entry?"))return;
    await deleteRow("lunaria_media_items",id);await invalidate("lunaria_media_items");
  }
  return <><PageIntro page="My Vault"/><Glass className="mb-5"><Eyebrow>Save a vault reference</Eyebrow><p className="mt-2 text-sm text-muted-foreground">Add a title and file path for a media item already stored in your private storage.</p><form onSubmit={add} className="mt-4 space-y-3"><Field label="Title" value={title} onChange={setTitle} required placeholder="My favourite photo"/><Field label="Description" value={description} onChange={setDescription} placeholder="A little note..."/><Field label="Category" value={category} onChange={setCategory}/><Field label="Storage file path" value={path} onChange={setPath} required placeholder="folder/file-name.jpg"/><Button type="submit" disabled={busy}><Plus size={16}/> Save reference</Button></form></Glass>
    <Glass><Eyebrow>Your private collection</Eyebrow>{isLoading && <p>Loading vault...</p>}{error && <p className="text-destructive">{error.message}</p>}{!items.length && <EmptyState icon={Archive} title="Your vault is empty." text="Your saved media references will appear here."/>}<div className="grid gap-3 sm:grid-cols-2">{items.map(item=><article key={item.id} className="rounded-2xl border bg-white/45 p-4"><div className="flex justify-between"><div><h3 className="font-semibold">{item.title}</h3><p className="text-xs text-muted-foreground">{item.category}</p></div><button onClick={()=>remove(item.id)}><Trash2 size={16}/></button></div><p className="mt-2 break-all text-xs text-muted-foreground">{item.file_path}</p><p className="mt-2 text-sm">{item.description}</p></article>)}</div></Glass>
  </>;
}

/* HOME */

function Dashboard({ navigate }: { navigate: (p: Page) => void }) {
  const {profile} = useLunaria();
  const {data:tasks=[]} = useRows<Task>("lunaria_tasks","created_at",false);
  const {data:diary=[]} = useRows("lunaria_diary_entries","entry_date",false);
  const {data:memories=[]} = useRows("lunaria_memories","memory_date",false);
  const hour = new Date().getHours();
  const greeting = hour < 11 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const shortcuts: {page:Page;icon:typeof BookOpen;note:string}[] = [
    {page:"Daily World",icon:CalendarCheck,note:"Daily check-in"},
    {page:"My Garden",icon:Sprout,note:"Grow your habits"},
    {page:"Recipes",icon:ChefHat,note:"Save recipes"},
    {page:"My Vault",icon:Archive,note:"Keep your treasures"},
    {page:"Diary",icon:BookOpen,note:"Write your thoughts"},
    {page:"Calendar",icon:CalendarDays,note:"Plan your days"},
    {page:"Memories",icon:FolderHeart,note:"Keep a moment"},
    {page:"Explore",icon:Compass,note:"Discover your universe"}
  ];
  return <>
    <div className="relative mb-6 overflow-hidden rounded-[30px] bg-universe p-7 text-white shadow-float sm:p-10"><div className="pointer-events-none absolute -right-8 -top-12 size-56 rounded-full border border-white/20"/><div className="pointer-events-none absolute -right-2 -top-5 size-40 rounded-full border border-white/20"/><Eyebrow>{greeting}, welcome back</Eyebrow><h1 className="mt-3 max-w-xl font-display text-4xl font-semibold sm:text-6xl">{profile?.display_name || "Lovely soul"}.</h1><p className="mt-3 max-w-md text-sm leading-6 text-white/80">Your little universe is waiting. Take a breath, make a wish, and begin wherever you are.</p><button onClick={()=>navigate("Workspace")} className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-foreground">Visit my workspace <ArrowUpRight size={16}/></button><Sparkles className="absolute bottom-8 right-9 opacity-70" size={34}/></div>
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Active goals",tasks.filter(t=>t.status==="active").length,Target],["Completed",tasks.filter(t=>t.status==="completed").length,CheckCircle2],["Diary pages",diary.length,BookOpen],["Memories",memories.length,Heart]].map(([label,value,Icon])=>{const I=Icon as typeof Star;return <Glass key={String(label)} className="p-4"><I size={19} className="mb-3 text-primary"/><p className="text-xs text-muted-foreground">{label as string}</p><p className="font-display text-3xl font-semibold">{value as number}</p></Glass>;})}</div>
    <Glass className="mb-6"><div className="mb-5 flex items-center justify-between"><div><Eyebrow>A little bit of everything</Eyebrow><h2 className="mt-1 font-display text-2xl font-semibold">Your quick access</h2></div><Flower2 className="text-primary"/></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{shortcuts.map(({page,icon:Icon,note})=><button key={page} onClick={()=>navigate(page)} className="rounded-2xl border border-white/70 bg-white/45 p-4 text-left transition hover:-translate-y-1 hover:bg-white/80"><span className="mb-4 grid size-10 place-items-center rounded-xl bg-secondary text-primary"><Icon size={20}/></span><span className="block font-semibold">{page}</span><span className="mt-1 block text-xs text-muted-foreground">{note}</span></button>)}</div></Glass>
    <Glass><Eyebrow>A gentle reminder</Eyebrow><p className="mt-2 font-display text-2xl font-semibold">You are allowed to grow at your own pace.</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Small steps are still steps. You do not have to figure everything out today.</p></Glass>
  </>;
}

/* ARCADE */

function ArcadePage() {
  const [target,setTarget] = useState(()=>Math.floor(Math.random()*9)+1);
  const [guess,setGuess] = useState<number|null>(null);
  const [score,setScore] = useState(0);
  const [rounds,setRounds] = useState(0);
  const [message,setMessage] = useState("Choose a number and see if the universe agrees.");
  function play(n:number) {if(guess!==null)return;setGuess(n);setRounds(v=>v+1);if(n===target){setScore(v=>v+1);setMessage("You found it! A little spark of luck ✨");}else setMessage(n<target?"A little higher! Try again next round.":"A little lower! Try again next round.");}
  function next(){setTarget(Math.floor(Math.random()*9)+1);setGuess(null);setMessage("Choose a number and see if the universe agrees.");}
  return <><PageIntro page="Arcade"/><Glass className="mx-auto max-w-xl text-center"><div className="mx-auto mb-4 grid size-16 place-items-center rounded-3xl bg-secondary text-primary"><WandSparkles size={30}/></div><Eyebrow>A tiny game of intuition</Eyebrow><h2 className="mt-2 font-display text-3xl font-semibold">Guess the starlight</h2><p className="mt-2 text-sm text-muted-foreground">{message}</p><div className="my-7 grid grid-cols-3 gap-3">{Array.from({length:9},(_,i)=>i+1).map(n=><button key={n} onClick={()=>play(n)} disabled={guess!==null} className={cx("aspect-square rounded-2xl border border-white/70 bg-white/60 font-display text-3xl transition hover:bg-secondary disabled:opacity-70",guess===n&&"bg-universe text-white")}>{n}</button>)}</div><div className="mb-5 flex justify-center gap-8 text-sm"><span>Score <b>{score}</b></span><span>Rounds <b>{rounds}</b></span></div>{guess!==null&&<Button onClick={next}>Play another round <ArrowRight size={16}/></Button>}</Glass></>;
}

/* SETTINGS */

function SettingsPage() {
  const {profile,saveProfile,signOut} = useLunaria();
  const [name,setName] = useState(profile?.display_name ?? "");
  const [message,setMessage] = useState("");
  const [busy,setBusy] = useState(false);
  async function save(e:FormEvent){e.preventDefault();setBusy(true);setMessage("");try{await saveProfile({display_name:name.trim()});setMessage("Your changes have been saved.");}catch(err){setMessage(err instanceof Error?err.message:"Could not save settings.");}finally{setBusy(false);}}
  return <><PageIntro page="Settings"/><Glass className="mb-5"><div className="mb-5 flex items-center gap-3"><div className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary"><Settings2/></div><div><h2 className="font-display text-2xl font-semibold">Personal details</h2><p className="text-sm text-muted-foreground">A name for your little universe.</p></div></div><form onSubmit={save} className="space-y-4"><Field label="Display name" value={name} onChange={setName} placeholder="What should Lunaria call you?"/>{message&&<p className="text-sm text-primary">{message}</p>}<Button type="submit" disabled={busy}>{busy?"Saving...":"Save changes"}</Button></form></Glass><Glass><Eyebrow>Your account</Eyebrow><h2 className="mt-2 font-display text-2xl font-semibold">Sign out of Lunaria</h2><p className="mt-2 mb-5 text-sm text-muted-foreground">Your saved universe will stay connected to your account.</p><Button variant="soft" onClick={()=>void signOut()}><LogOut size={16}/> Sign out</Button></Glass></>;
}

/* MAIN APP SHELL */

function AppShell() {
  const [page,setPage] = useState<Page>("Home");
  const [sidebarOpen,setSidebarOpen] = useState(false);
  const {profile} = useLunaria();
  function navigate(next:Page){setPage(next);setSidebarOpen(false);}
  const groups = [...new Set(navigation.map(n=>n.group))];

  return <div className="relative min-h-screen overflow-hidden"><CssSky/><div className="relative z-10 flex min-h-screen">
    {sidebarOpen&&<button aria-label="Close menu" onClick={()=>setSidebarOpen(false)} className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"/>}
    <aside className={cx("fixed inset-y-0 left-0 z-40 flex w-[275px] flex-col border-r border-white/50 bg-white/75 p-5 shadow-xl backdrop-blur-2xl transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none",sidebarOpen?"translate-x-0":"-translate-x-full")}>
      <div className="mb-9 flex items-center justify-between"><Brand/><button onClick={()=>setSidebarOpen(false)} className="rounded-full p-2 hover:bg-secondary lg:hidden"><X size={18}/></button></div>
      <div className="mb-6 rounded-2xl bg-universe p-4 text-white"><p className="text-[10px] uppercase tracking-[.2em] text-white/70">Your universe</p><p className="mt-1 font-display text-xl font-semibold">{profile?.display_name||"Lovely soul"}</p><p className="mt-1 text-xs text-white/70">A space to become yourself.</p></div>
      <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto">{groups.map(group=><div key={group}><p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.22em] text-muted-foreground">{group}</p><div className="space-y-1">{navigation.filter(n=>n.group===group).map(item=>{const Icon=item.icon;return <button key={item.name} onClick={()=>navigate(item.name)} className={cx("flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition",page===item.name?"bg-universe text-white shadow-float":"text-muted-foreground hover:bg-white/80 hover:text-foreground")}><Icon size={18}/><span>{item.name}</span>{page===item.name&&<ArrowUpRight size={14} className="ml-auto"/>}</button>;})}</div></div>)}</nav>
      <div className="mt-5 rounded-2xl border border-white/70 bg-white/45 p-4"><p className="font-display text-lg">A gentle note</p><p className="mt-1 text-xs leading-5 text-muted-foreground">You are a work in progress, and that is beautiful.</p></div>
    </aside>
    <main className="min-w-0 flex-1"><header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/40 bg-white/40 px-4 py-3 backdrop-blur-xl sm:px-8"><div className="flex items-center gap-3"><button onClick={()=>setSidebarOpen(true)} className="rounded-xl bg-white/70 p-2 lg:hidden"><Menu size={19}/></button><span className="font-display text-xl font-semibold lg:hidden">Lunaria</span><span className="hidden text-xs text-muted-foreground lg:block">Your personal universe ✧</span></div><div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-3 py-2 text-xs"><Sparkles size={14} className="text-primary"/> A little space for you</div></header>
      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-8 sm:py-10">
        {page==="Home"&&<Dashboard navigate={navigate}/>}
        {page==="Workspace"&&<WorkspacePage/>}
        {modules[page]&&<RecordPage page={page}/>}
        {page==="Daily World"&&<DailyWorldPage/>}
        {page==="Explore"&&<ExplorePage navigate={navigate}/>}
        {page==="Randomizer"&&<RandomizerPage/>}
        {page==="My Garden"&&<GardenPage/>}
        {page==="Recipes"&&<RecipesPage/>}
        {page==="My Vault"&&<VaultPage/>}
        {page==="Arcade"&&<ArcadePage/>}
        {page==="Settings"&&<SettingsPage/>}
      </div>
      <footer className="px-5 pb-8 text-center text-xs text-muted-foreground">Made with a little bit of stardust · Lunaria ✧</footer>
    </main>
  </div></div>;
}

/* APPLICATION ENTRY */

export function LunariaApp() {
  const {status,unlocked,schemaError} = useLunaria();
  if(status==="loading") return <main className="flex min-h-screen items-center justify-center"><div className="text-center"><div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-universe text-white"><Moon/></div><p className="font-display text-2xl">Opening Lunaria...</p></div></main>;
  if(status==="signed-out") return <AuthScreen/>;
  if(status==="recovery") return <main className="flex min-h-screen items-center justify-center p-5"><Glass className="max-w-md text-center"><LockKeyhole className="mx-auto mb-4 text-primary" size={32}/><h1 className="font-display text-3xl">Password recovery</h1><p className="mt-3 text-sm text-muted-foreground">Use the password reset link from your email to continue.</p><Button onClick={()=>void supabase.auth.signOut()}><LogOut size={16}/> Return to sign in</Button></Glass></main>;
  if(status==="setup-needed") return <main className="flex min-h-screen items-center justify-center p-5"><Glass className="max-w-lg"><h1 className="font-display text-3xl">A little setup is needed</h1><p className="mt-3 text-sm text-muted-foreground">Lunaria could not load your profile table. Check that the Supabase schema has been installed.</p><p className="mt-3 break-words text-xs text-destructive">{schemaError}</p></Glass></main>;
  if(!unlocked) return <PinScreen/>;
  return <AppShell/>;
}

export default LunariaApp;

