import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BUCKET, supabase } from "./supabase";
import { todayISO } from "./logic";

export async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error("You are signed out. Please sign in again.");
  return id;
}

/** Read all of the signed-in user's rows from a table (RLS limits results to the owner). */
export function useRows<T>(table: string, order = "created_at", ascending = false) {
  return useQuery({
    queryKey: [table],
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select("*").order(order, { ascending });
      if (error) throw new Error(error.message);
      return (data ?? []) as T[];
    },
  });
}

export function useInvalidate() {
  const qc = useQueryClient();
  return (...tables: string[]) => Promise.all(tables.map((t) => qc.invalidateQueries({ queryKey: [t] })));
}

export async function insertRow<T>(table: string, row: Record<string, unknown>): Promise<T> {
  const user_id = await currentUserId();
  const { data, error } = await supabase.from(table).insert({ ...row, user_id }).select().single();
  if (error) throw new Error(error.message);
  return data as T;
}
export async function updateRow(table: string, id: string, patch: Record<string, unknown>) {
  const { error } = await supabase.from(table).update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}
export async function deleteRow(table: string, id: string) {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Write a Diary activity once per source_key; duplicates are ignored by the unique constraint. */
export async function logActivity(kind: string, sourceKey: string, title: string) {
  const user_id = await currentUserId();
  const { error } = await supabase.from("lunaria_activity")
    .upsert({ user_id, kind, source_key: sourceKey, title, entry_date: todayISO() }, { onConflict: "user_id,source_key", ignoreDuplicates: true });
  if (error) console.error("activity log failed", error.message);
}

export const MAX_UPLOAD = 50 * 1024 * 1024;
export const ACCEPT: Record<string, string> = {
  image: "image/jpeg,image/png,image/webp,image/gif",
  any: "image/*,video/mp4,video/webm,audio/mpeg,audio/mp4,audio/wav,audio/ogg,application/pdf,text/plain,.doc,.docx,.ppt,.pptx,.xls,.xlsx",
};

export function validateFile(file: File, kind: "image" | "any"): string | null {
  if (file.size > MAX_UPLOAD) return "That file is larger than 50 MB.";
  if (kind === "image" && !file.type.startsWith("image/")) return "Please choose an image (JPG, PNG, WEBP or GIF).";
  return null;
}

/** Upload into the private bucket under <uid>/<folder>/… with progress. Returns the storage path. */
export async function uploadPrivate(file: File, folder: string, onProgress?: (pct: number) => void): Promise<string> {
  const uid = await currentUserId();
  const safe = file.name.replace(/[^\w.-]+/g, "_").slice(-80);
  const path = `${uid}/${folder}/${crypto.randomUUID()}-${safe}`;
  const { data: s } = await supabase.auth.getSession();
  const token = s.session?.access_token ?? "";
  const base = (supabase as unknown as { storageUrl?: string }).storageUrl ?? "";
  // XHR gives real upload progress; falls back to SDK upload when URL is unavailable.
  if (base && onProgress) {
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${base}/object/${BUCKET}/${path}`);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.setRequestHeader("x-upsert", "false");
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
      xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
      xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status}): ${xhr.responseText.slice(0, 160)}`)));
      xhr.onerror = () => reject(new Error("Upload failed — check your connection."));
      xhr.send(file);
    });
  } else {
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
    if (error) throw new Error(error.message);
  }
  onProgress?.(100);
  return path;
}

export async function removePrivate(path: string | null | undefined) {
  if (path) await supabase.storage.from(BUCKET).remove([path]);
}

/** Short-lived signed URL for a private file preview. */
export function useSignedUrl(path: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    setUrl(null);
    if (path) supabase.storage.from(BUCKET).createSignedUrl(path, 3600).then(({ data }) => alive && setUrl(data?.signedUrl ?? null));
    return () => { alive = false; };
  }, [path]);
  return url;
}
