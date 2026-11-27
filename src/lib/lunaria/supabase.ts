import { createClient } from "@supabase/supabase-js";

// Publishable (anon) values only — safe in browser code. Never put a secret / service_role key here.
const url = import.meta.env["VITE_SUPABASE_URL"] || "https://mfeazhpafclmfnieqbhd.supabase.co";
const key = import.meta.env["VITE_SUPABASE_ANON_KEY"] || "sb_publishable_IQOCAfVwFxG8qVdhRhIl1w_vES1vD5p";

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

export const BUCKET = "lunaria-private";
