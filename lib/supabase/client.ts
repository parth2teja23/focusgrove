import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}

export const createBrowserClient = createClient;
