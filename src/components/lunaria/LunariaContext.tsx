import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/lunaria/supabase";
import type { Profile, ThemeSettings } from "@/lib/lunaria/types";
import { applyTheme, resolveTheme } from "@/lib/lunaria/theme";
import { failOverdueTasks, reconcileCyberProject } from "@/lib/lunaria/maintenance";

type Status = "loading" | "signed-out" | "recovery" | "setup-needed" | "ready";
interface Ctx {
  status: Status; session: Session | null; profile: Profile | null; theme: ThemeSettings; schemaError: string;
  unlocked: boolean; setUnlocked: (v: boolean) => void;
  saveProfile: (patch: Partial<Profile>) => Promise<void>; reload: () => void; signOut: () => Promise<void>;
  previewTheme: (t: ThemeSettings) => void;
}
const LunariaCtx = createContext<Ctx | null>(null);
export const useLunaria = () => {
  const c = useContext(LunariaCtx);
  if (!c) throw new Error("useLunaria outside provider");
  return c;
};

export function LunariaProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [schemaError, setSchemaError] = useState("");
  const [unlocked, setUnlockedState] = useState(false);
  const [tick, setTick] = useState(0);

  const setUnlocked = (v: boolean) => {
    setUnlockedState(v);
    if (v) sessionStorage.setItem("lunaria-unlocked", "1"); else sessionStorage.removeItem("lunaria-unlocked");
  };

  useEffect(() => {
    setUnlockedState(sessionStorage.getItem("lunaria-unlocked") === "1");
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); if (!data.session) setStatus("signed-out"); });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === "PASSWORD_RECOVERY") setStatus("recovery");
      else if (!s) { setStatus("signed-out"); setProfile(null); setUnlocked(false); }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const uid = session?.user.id;
  useEffect(() => {
    if (!uid || status === "recovery") return;
    let alive = true;
    (async () => {
      const { data, error } = await supabase.from("lunaria_profiles").select("*").eq("user_id", uid).maybeSingle();
      if (!alive) return;
      if (error) { setSchemaError(error.message); setStatus("setup-needed"); return; }
      let p = data as Profile | null;
      if (!p) {
        const { data: created, error: e } = await supabase.from("lunaria_profiles").insert({ user_id: uid }).select().single();
        if (e) { setSchemaError(e.message); setStatus("setup-needed"); return; }
        p = created as Profile;
      }
      setProfile(p);
      applyTheme(resolveTheme(p.theme));
      setStatus("ready");
      try { await failOverdueTasks(); await reconcileCyberProject(uid); } catch (err) { console.error(err); }
    })();
    return () => { alive = false; };
  }, [uid, tick, status === "recovery"]);

  const saveProfile = useCallback(async (patch: Partial<Profile>) => {
    if (!uid) return;
    const { data, error } = await supabase.from("lunaria_profiles").update({ ...patch, updated_at: new Date().toISOString() }).eq("user_id", uid).select().single();
    if (error) throw new Error(error.message);
    setProfile(data as Profile);
    applyTheme(resolveTheme((data as Profile).theme));
  }, [uid]);

  const value: Ctx = {
    status, session, profile, theme: resolveTheme(profile?.theme), schemaError, unlocked, setUnlocked, saveProfile,
    reload: () => { setStatus("loading"); setTick((t) => t + 1); },
    signOut: async () => { setUnlocked(false); await supabase.auth.signOut(); },
    previewTheme: applyTheme,
  };
  return <LunariaCtx.Provider value={value}>{children}</LunariaCtx.Provider>;
}
