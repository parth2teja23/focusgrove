import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function updateSession(request: NextRequest) {
  try {
    // This `try/catch` block is only here for the interactive tutorial.
    // Feel free to remove once you have Supabase connected.
    const supabase = await createServerClient();

    // This will refresh session if needed, or return null if auth fails
    await supabase.auth.getUser();
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // `you'll end up in this return` which will create a simple
    // passthrough response.
    console.log(e);
  }

  // IMPORTANT: You *must* return the response object
  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
}
