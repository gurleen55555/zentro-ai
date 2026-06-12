
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

const globalForSupabase = globalThis as typeof globalThis & {
  zentroSupabase?: SupabaseClient;
};

export const supabase =
  globalForSupabase.zentroSupabase ??
  (isSupabaseConfigured
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )
    : new Proxy({} as SupabaseClient, {
        get() {
          throw new Error("Supabase is unavailable in local Microsoft IQ demo mode.");
        },
      }));

if (process.env.NODE_ENV !== "production" && isSupabaseConfigured) {
  globalForSupabase.zentroSupabase = supabase;
}
