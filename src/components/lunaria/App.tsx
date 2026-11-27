import { useState } from "react";
import {
  ArrowUpRight, BookOpen, CalendarDays, Check, CheckCircle2,
  ChevronRight, CircleHelp, CloudMoon, Compass, FolderHeart,
  Gamepad2, Gem, Home, LockKeyhole, LogOut, Moon, Plus,
  Search, Settings2, Sparkles, Target, Trash2, X
} from "lucide-react";

import { useLunaria } from "./LunariaContext";
import { Universe3D, CssSky } from "./Universe";
import {
  useRows, useInvalidate, insertRow, updateRow, deleteRow
} from "@/lib/lunaria/data";
import { supabase } from "@/lib/lunaria/supabase";
import { hashPin, newSalt, verifyPin } from "@/lib/lunaria/pin";
import { DEFAULT_PIN, todayISO } from "@/lib/lunaria/logic";
import type { Task } from "@/lib/lunaria/types";

type Page =
  | "Home" | "Workspace" | "Calendar" | "Diary"
  | "Journey" | "Memories" | "Collections" | "Arcade"
  | "Knowledge Garden" | "Settings";

const navigation = [
  { name: "Home", icon: Home, group: "Universe" },
  { name: "Workspace", icon: Target, group: "Universe" },
  { name: "Calendar", icon: CalendarDays, group: "Universe" },
  { name: "Diary", icon: BookOpen, group: "Personal Space" },
  { name: "Journey", icon: Compass, group: "Personal Space" },
  { name: "Memories", icon: FolderHeart, group: "Personal Space" },
  { name: "Collections", icon: Gem, group: "Personal Space" },
  { name: "Arcade", icon: Gamepad2, group: "Explore" },
  { name: "Knowledge Garden", icon: Sparkles, group: "Explore" },
  { name: "Settings", icon: Settings2, group: "System" },
] as const;

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-11 place-items-center rounded-2xl bg-universe text-white shadow-float">
        <Moon size={23} />
      </div>
      <div>
        <div className="font-display text-xl font-semibold tracking-wide">Lunaria</div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Personal Universe
        </div>
      </div>
    </div>
  );
}

function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(), password
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(), password
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
      <div className="pointer-events-none absolute inset-0 opacity-90">
        <Universe3D variant="lock" className="h-[390px] w-full" />
      </div>

      <section className="glass relative z-10 w-full max-w-md p-7 sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <Brand />
          <h1 className="mt-8 font-display text-3xl font-semibold">
            Your universe awaits.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A little space for everything that makes you, you.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-full bg-secondary/70 p-1">
          <button onClick={() => setMode("login")}
            className={`rounded-full py-2 text-sm ${mode === "login" ? "bg-white shadow" : ""}`}>
            Sign in
          </button>
          <button onClick={() => setMode("signup")}
            className={`rounded-full py-2 text-sm ${mode === "signup" ? "bg-white shadow" : ""}`}>
            Create account
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-medium">
            Email address
            <input required type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-2xl border bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-primary" />
          </label>

          <label className="block text-sm font-medium">
            Password
            <input required type="password" minLength={8} value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="mt-2 w-full rounded-2xl border bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-primary" />
          </label>

          {message && <p className="rounded-xl bg-secondary p-3 text-sm">{message}</p>}

          <button disabled={busy}
            className="w-full rounded-full bg-universe py-3 font-semibold text-white shadow-float disabled:opacity-50">
            {busy ? "Please wait..." : mode === "login" ? "Enter Lunaria" : "Create my universe"}
            <ArrowUpRight className="ml-2 inline" size={17} />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Your personal space, protected by your account.
        </p>
      </section>
    </main>
  );
}

function PinScreen() {
  const { profile, setUnlocked, saveProfile } = useLunaria();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{4}$/.test(pin)) {
      setError("Enter a 4-digit PIN.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      if (!profile?.pin_hash || !profile.pin_salt) {
        const salt = newSalt();
        const hash = await hashPin(pin, salt);
        await saveProfile({ pin_hash: hash, pin_salt: salt });
      } else {
        const valid = await verifyPin(pin, profile.pin_salt, profile.pin_hash);
        if (!valid) throw new Error("Incorrect PIN. Please try again.");
      }
      setUnlocked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to unlock.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5">
      <CssSky dense />
      <div className="pointer-events-none absolute inset-0">
        <Universe3D variant="lock" className="h-full w-full" />
      </div>

      <form onSubmit={unlock} className="glass relative z-10 w-full max-w-sm p-8 text-center">
        <div className="mx-auto mb-5 grid size-16 place-items-center rounded-3xl bg-universe text-white shadow-float">
          <LockKeyhole size={28} />
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Welcome back</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">Unlock Lunaria</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your four-digit universe PIN.
        </p>

        <input autoFocus inputMode="numeric" maxLength={4} type="password"
          value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
          placeholder="••••"
          className="my-7 w-full rounded-2xl border bg-white/70 px-4 py-4 text-center text-3xl tracking-[0.8em] outline-none focus:ring-2 focus:ring-primary" />

        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

        <button disabled={busy} className="w-full rounded-full bg-universe py-3 font-semibold text-white">
          {busy ? "Unlocking..." : "Unlock"}
        </button>
      </form>
    </main>
  );
}

function StatCard({ icon: Icon, label, value, detail }: {
  icon: React.ElementType; label: string; value: string | number; detail: string
}) {
  return (
    <div className="glass lift min-w-0 p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="grid size-10 place-items-center rounded-2xl bg-universe text-white">
          <Icon size={19} />
        </span>
      </div>
      <div className="font-display text-3xl font-semibold">{value}</div>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function TaskPanel({ compact = false }: { compact?: boolean }) {
  const { data: tasks = [], isLoading, error } = useRows<Task>("lunaria_tasks", "created_at", false);
  const invalidate = useInvalidate();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<"small" | "long">("small");
  const [deadline, setDeadline] = useState("");
  const [progress, setProgress] = useState("0");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const active = tasks.filter(t => t.status === "active");
  const completed = tasks.filter(t => t.status === "completed");
  const failed = tasks.filter(t => t.status === "failed");

  async function createTask(e: React.FormEvent) {
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
        progress: kind === "long" ? Number(progress) : 0,
        completed_at: null
      });
      setTitle("");
      setDeadline("");
      setProgress("0");
      setShowForm(false);
      await invalidate("lunaria_tasks");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not create task.");
    } finally {
      setBusy(false);
    }
  }

  async function finishTask(task: Task) {
    try {
      await updateRow("lunaria_tasks", task.id, {
        status: "completed",
        progress: 100,
        completed_at: new Date().toISOString()
      });
      await invalidate("lunaria_tasks");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not update task.");
    }
  }

  async function addProgress(task: Task) {
    const value = window.prompt("Current progress (0–100):", String(task.progress));
    if (value === null) return;
    const pct = Math.max(0, Math.min(100, Number(value)));
    if (!Number.isFinite(pct)) return;
    const description = window.prompt("What did you work on today?", "Progress update") ?? "";
    try {
      await insertRow("lunaria_task_progress", {
        task_id: task.id,
        entry_date: todayISO(),
        description,
        progress: pct
      });
      await updateRow("lunaria_tasks", task.id, {
        progress: pct,
        ...(pct === 100 ? { status: "completed", completed_at: new Date().toISOString() } : {})
      });
      await invalidate("lunaria_tasks", "lunaria_task_progress");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save progress.");
    }
  }

  async function removeTask(task: Task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try {
      await deleteRow("lunaria_tasks", task.id);
      await invalidate("lunaria_tasks");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not delete task.");
    }
  }

  const shown = compact ? active.slice(0, 4) : tasks;

  return (
    <section className="glass p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Your progress</p>
          <h2 className="font-display text-2xl font-semibold">Workspace</h2>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 rounded-full bg-universe px-4 py-2 text-sm font-semibold text-white">
          <Plus size={16} /> Add task
        </button>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-secondary/70 p-3">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="mt-1 text-2xl font-semibold">{active.length}</p>
        </div>
        <div className="rounded-2xl bg-secondary/70 p-3">
          <p className="text-xs text-muted-foreground">Completed</p>
          <p className="mt-1 text-2xl font-semibold">{completed.length}</p>
        </div>
        <div className="rounded-2xl bg-secondary/70 p-3">
          <p className="text-xs text-muted-foreground">Failed</p>
          <p className="mt-1 text-2xl font-semibold">{failed.length}</p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={createTask} className="mb-5 space-y-3 rounded-2xl border bg-white/50 p-4">
          <input required value={title} onChange={e => setTitle(e.target.value)}
            placeholder="What do you want to accomplish?"
            className="w-full rounded-xl border bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-primary" />
          <div className="grid grid-cols-2 gap-2">
            <select value={kind} onChange={e => setKind(e.target.value as "small" | "long")}
              className="rounded-xl border bg-white/80 px-3 py-3 text-sm">
              <option value="small">Small Task</option>
              <option value="long">Long Task</option>
            </select>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
              className="min-w-0 rounded-xl border bg-white/80 px-3 py-3 text-sm" />
          </div>
          {kind === "long" && (
            <input type="number" min="0" max="100" value={progress}
              onChange={e => setProgress(e.target.value)}
              placeholder="Starting progress (%)"
              className="w-full rounded-xl border bg-white/80 px-4 py-3" />
          )}
          <div className="flex gap-2">
            <button disabled={busy} className="rounded-full bg-universe px-5 py-2 text-sm text-white">
              {busy ? "Saving..." : "Save task"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="rounded-full bg-secondary px-5 py-2 text-sm">Cancel</button>
          </div>
        </form>
      )}

      {message && <p className="mb-3 text-sm text-destructive">{message}</p>}
      {isLoading && <p className="py-5 text-sm text-muted-foreground">Loading tasks...</p>}
      {error && <p className="py-5 text-sm text-destructive">Could not load tasks: {error.message}</p>}

      {!isLoading && shown.length === 0 && (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <Target className="mx-auto mb-3 text-primary" size={30} />
          <p className="font-medium">Your workspace is waiting.</p>
          <p className="mt-1 text-sm text-muted-foreground">Create your first task to begin.</p>
        </div>
      )}

      <div className="space-y-3">
        {shown.map(task => (
          <article key={task.id} className="rounded-2xl border border-white/70 bg-white/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-secondary px-2 py-1 text-[10px] uppercase tracking-wider">
                    {task.task_type === "long" ? "Long Task" : "Small Task"}
                  </span>
                  <span className="text-xs text-muted-foreground">{task.status}</span>
                </div>
                <h3 className="font-semibold">{task.title}</h3>
                {task.deadline && <p className="mt-1 text-xs text-muted-foreground">Due {task.deadline}</p>}
              </div>
              <button title="Delete task" onClick={() => removeTask(task)}
                className="rounded-full p-2 text-muted-foreground hover:bg-secondary">
                <Trash2 size={16} />
              </button>
            </div>

            {task.task_type === "long" && (
              <div className="mt-4">
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <strong>{task.progress}%</strong>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-universe transition-all"
                    style={{ width: `${task.progress}%` }} />
                </div>
              </div>
            )}

            {task.status === "active" && (
              <div className="mt-4 flex flex-wrap gap-2">
                {task.task_type === "small" ? (
                  <button onClick={() => finishTask(task)}
                    className="flex items-center gap-2 rounded-full bg-universe px-4 py-2 text-xs font-semibold text-white">
                    <Check size={14} /> Complete
                  </button>
                ) : (
                  <button onClick={() => addProgress(task)}
                    className="rounded-full bg-universe px-4 py-2 text-xs font-semibold text-white">
                    Update progress
                  </button>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function Dashboard({ navigate }: { navigate: (p: Page) => void }) {
  const { profile } = useLunaria();
  const { data: tasks = [] } = useRows<Task>("lunaria_tasks", "created_at", false);
  const active = tasks.filter(t => t.status === "active");
  const completed = tasks.filter(t => t.status === "completed");
  const name = profile?.display_name?.trim() || "Explorer";

  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric"
  });

  return (
    <div className="animate-page space-y-6">
      <section className="relative min-h-[300px] overflow-hidden rounded-[2rem] border border-white/60 bg-gradient-to-br from-white/50 via-purple-100/40 to-pink-200/50 p-6 shadow-float sm:min-h-[340px] sm:p-9">
        <div className="pointer-events-none absolute inset-0">
          <Universe3D variant="dashboard" className="h-full w-full" />
        </div>
        <div className="relative z-10 max-w-lg">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{date}</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Welcome to your<br />
            <span className="text-universe">little universe.</span>
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            Every thought, dream, and little achievement has a place here.
          </p>
          <button onClick={() => navigate("Journey")}
            className="mt-6 flex items-center gap-2 rounded-full bg-universe px-5 py-3 text-sm font-semibold text-white shadow-float">
            How are you feeling today? <ArrowUpRight size={17} />
          </button>
        </div>
        <div className="pointer-events-none absolute bottom-5 right-6 hidden text-right sm:block">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Your universe</p>
          <p className="font-display text-2xl">∞ possibilities</p>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard icon={Target} label="Active tasks" value={active.length} detail="Things in progress" />
        <StatCard icon={CheckCircle2} label="Completed" value={completed.length} detail="Achievements collected" />
        <StatCard icon={Sparkles} label="Your universe" value="∞" detail="Room to grow" />
        <StatCard icon={CloudMoon} label="Today's focus" value={active.length ? "In motion" : "Rest & plan"} detail="One step at a time" />
      </div>

      <TaskPanel compact />

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Discover</p>
            <h2 className="font-display text-2xl font-semibold">Explore your universe</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Diary", "📖", "A home for your thoughts"],
            ["Memories", "🌷", "Keep moments close"],
            ["Collections", "💎", "Everything you treasure"],
            ["Knowledge Garden", "🌱", "Ideas worth growing"]
          ].map(([title, emoji, desc]) => (
            <button key={title} onClick={() => navigate(title as Page)}
              className="glass lift p-4 text-left">
              <span className="text-3xl">{emoji}</span>
              <h3 className="mt-3 font-display text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
              <ChevronRight className="mt-3 text-primary" size={17} />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function SimpleModule({ page }: { page: Page }) {
  const details: Record<string, { emoji: string; description: string }> = {
    Calendar: { emoji: "🌙", description: "Your dates, plans, and important moments." },
    Diary: { emoji: "📖", description: "A quiet place to write down your thoughts." },
    Journey: { emoji: "🌷", description: "Check in with yourself and reflect on today." },
    Memories: { emoji: "✨", description: "A gallery for the moments you want to keep." },
    Collections: { emoji: "💎", description: "A home for your favourite things and recipes." },
    Arcade: { emoji: "🪐", description: "A playful corner of your universe." },
    "Knowledge Garden": { emoji: "🌱", description: "Collect ideas, notes, and things you learn." },
    Settings: { emoji: "⚙️", description: "Personalise your Lunaria experience." }
  };

  const info = details[page];
  return (
    <section className="glass min-h-[360px] p-7 sm:p-10">
      <div className="text-5xl">{info?.emoji ?? "🌙"}</div>
      <h1 className="mt-5 font-display text-3xl font-semibold">{page}</h1>
      <p className="mt-2 max-w-lg text-sm text-muted-foreground">{info?.description}</p>
      <div className="mt-8 rounded-2xl border border-dashed p-6">
        <Sparkles className="mb-3 text-primary" />
        <p className="font-medium">Your {page} space is ready for its next module.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          This page shell is connected to Lunaria navigation. Its full data features will be added in the next implementation steps.
        </p>
      </div>
    </section>
  );
}

function AppShell() {
  const { profile, signOut } = useLunaria();
  const [page, setPage] = useState<Page>("Home");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch] = useState("");

  const groups = ["Universe", "Personal Space", "Explore", "System"];

  return (
    <div className="relative min-h-screen">
      <CssSky />
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-[250px] shrink-0 flex-col border-r border-white/50 bg-white/20 p-5 backdrop-blur-xl lg:flex">
          <Brand />
          <div className="my-8 rounded-2xl bg-white/40 p-4">
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Your space</p>
            <p className="mt-1 truncate font-semibold">{profile?.display_name || "Explorer"}</p>
            <p className="mt-1 text-xs text-muted-foreground">Personal Universe</p>
          </div>

          <nav className="flex-1 space-y-6 overflow-y-auto">
            {groups.map(group => (
              <div key={group}>
                <p className="mb-2 px-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{group}</p>
                <div className="space-y-1">
                  {navigation.filter(n => n.group === group).map(item => {
                    const Icon = item.icon;
                    return (
                      <button key={item.name} onClick={() => setPage(item.name as Page)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                          page === item.name ? "bg-universe font-semibold text-white shadow-float" : "hover:bg-white/50"
                        }`}>
                        <Icon size={17} /> {item.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <button onClick={() => void signOut()}
            className="mt-5 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted-foreground hover:bg-white/50">
            <LogOut size={17} /> Sign out
          </button>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-28 pt-5 sm:px-7 lg:px-9 lg:pb-10 lg:pt-8">
          <header className="mb-7 flex items-center justify-between gap-3">
            <div className="lg:hidden"><Brand /></div>
            <div className="hidden lg:block">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Personal Digital Universe</p>
              <p className="font-display text-lg">{page}</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="hidden items-center gap-2 rounded-full border border-white/70 bg-white/50 px-4 py-2 sm:flex">
                <Search size={16} className="text-muted-foreground" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search your universe..."
                  className="w-40 bg-transparent text-sm outline-none" />
              </label>
              <button onClick={() => setPage("Settings")}
                className="grid size-10 place-items-center rounded-full border border-white/70 bg-white/50">
                <Settings2 size={18} />
              </button>
              <button onClick={() => setMobileMenu(v => !v)}
                className="grid size-10 place-items-center rounded-full border border-white/70 bg-white/50 lg:hidden">
                {mobileMenu ? <X size={18} /> : <Compass size={18} />}
              </button>
            </div>
          </header>

          {mobileMenu && (
            <div className="glass mb-5 grid grid-cols-2 gap-2 p-3 sm:grid-cols-3">
              {navigation.map(item => (
                <button key={item.name} onClick={() => { setPage(item.name as Page); setMobileMenu(false); }}
                  className={`rounded-xl px-3 py-2 text-left text-xs ${page === item.name ? "bg-universe text-white" : "bg-white/40"}`}>
                  {item.name}
                </button>
              ))}
              <button onClick={() => void signOut()} className="rounded-xl bg-white/40 px-3 py-2 text-left text-xs">
                Sign out
              </button>
            </div>
          )}

          {page === "Home" && <Dashboard navigate={setPage} />}
          {page === "Workspace" && <TaskPanel />}
          {page !== "Home" && page !== "Workspace" && <SimpleModule page={page} />}

          <footer className="mt-10 border-t border-white/50 py-5 text-center text-xs text-muted-foreground">
            Made of little moments and endless possibilities · Lunaria
          </footer>
        </main>
      </div>

      <nav className="fixed bottom-3 left-3 right-3 z-40 grid grid-cols-5 rounded-2xl border border-white/60 bg-white/75 p-2 shadow-float backdrop-blur-xl lg:hidden">
        {[
          ["Home", Home], ["Workspace", Target], ["Calendar", CalendarDays],
          ["Diary", BookOpen], ["Explore", Compass]
        ].map(([name, Icon]) => {
          const I = Icon as React.ElementType;
          return (
            <button key={name as string}
              onClick={() => setPage(name === "Explore" ? "Collections" : name as Page)}
              className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] ${
                page === name ? "bg-universe text-white" : "text-muted-foreground"
              }`}>
              <I size={18} /> {name as string}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default function LunariaApp() {
  const { status, unlocked, schemaError, reload } = useLunaria();

  if (status === "loading") {
    return (
      <main className="grid min-h-screen place-items-center">
        <CssSky dense />
        <div className="relative z-10 text-center">
          <div className="mx-auto mb-4 grid size-16 animate-float place-items-center rounded-3xl bg-universe text-white shadow-float">
            <Moon size={30} />
          </div>
          <p className="font-display text-2xl">Opening Lunaria...</p>
        </div>
      </main>
    );
  }

  if (status === "signed-out") return <AuthScreen />;

  if (status === "recovery") {
    return <div className="grid min-h-screen place-items-center p-6">
      <div className="glass max-w-md p-7 text-center">
        <h1 className="font-display text-2xl">Password recovery</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your password recovery session is active. Please complete your password reset from your email link.</p>
      </div>
    </div>;
  }

  if (status === "setup-needed") {
    return <div className="grid min-h-screen place-items-center p-6">
      <div className="glass max-w-lg p-7">
        <h1 className="font-display text-2xl">Database setup needed</h1>
        <p className="mt-3 text-sm text-muted-foreground">{schemaError}</p>
        <button onClick={reload} className="mt-5 rounded-full bg-universe px-5 py-2 text-white">Retry</button>
      </div>
    </div>;
  }

  if (!unlocked) return <PinScreen />;

  return <AppShell />;
}
