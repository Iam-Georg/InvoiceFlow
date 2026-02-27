import { createClient as _create } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let _client: ReturnType<typeof _create> | null = null;

export function createClient() {
  if (typeof window === "undefined") return _create(URL, KEY);
  if (!_client) _client = _create(URL, KEY);
  return _client;
}
