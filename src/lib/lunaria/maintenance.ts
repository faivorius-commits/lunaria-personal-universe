import { supabase } from "./supabase";
import { CYBER_PROJECT, missingEntries, todayISO } from "./logic";

/** Overdue unfinished tasks become failed (moved to Failed Archive). */
export async function failOverdueTasks() {
  const { error } = await supabase.from("lunaria_tasks").update({ status: "failed", updated_at: new Date().toISOString() })
    .eq("status", "active").lt("deadline", todayISO()).not("deadline", "is", null);
  if (error) console.error(error.message);
}

/** Ensure the existing Cybersecurity long project exists exactly once with both progress entries. */
export async function reconcileCyberProject(userId: string) {
  const { data: found, error } = await supabase.from("lunaria_tasks").select("id").eq("title", CYBER_PROJECT.title).order("created_at");
  if (error) throw new Error(error.message);
  let id = found?.[0]?.id as string | undefined;
  const fields = { label: CYBER_PROJECT.label, assigned_by: CYBER_PROJECT.assigned_by, task_type: "long", status: "completed", progress: 100 };
  if (!id) {
    const { data, error: e } = await supabase.from("lunaria_tasks")
      .insert({ user_id: userId, title: CYBER_PROJECT.title, ...fields, completed_at: "2026-11-27T12:00:00Z" }).select("id").single();
    if (e) throw new Error(e.message);
    id = data.id as string;
  } else {
    await supabase.from("lunaria_tasks").update(fields).eq("id", id);
  }
  const { data: existing } = await supabase.from("lunaria_task_progress").select("entry_date,description").eq("task_id", id);
  const missing = missingEntries(existing ?? []);
  if (missing.length) {
    const { error: e2 } = await supabase.from("lunaria_task_progress").insert(missing.map((m) => ({ ...m, task_id: id, user_id: userId })));
    if (e2) throw new Error(e2.message);
  }
}
