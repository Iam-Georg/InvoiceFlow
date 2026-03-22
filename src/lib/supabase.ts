import { createBrowserClient } from "@supabase/ssr";
import { createClient as _createServerFallback } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let _client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  // createBrowserClient is browser-only and stores the session in cookies,
  // making it accessible to server-side route handlers via createRouteSupabaseClient.
  if (typeof window === "undefined") return _createServerFallback(URL, KEY);
  if (!_client) _client = createBrowserClient(URL, KEY);
  return _client;
}
