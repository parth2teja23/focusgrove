import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const envBaseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const baseUrl =
    envBaseUrl ||
    (forwardedHost ? `${forwardedProto}://${forwardedHost}` : requestUrl.origin);

  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/app/today";
  const safeNext = next.startsWith("/") ? next : "/app/today";

  if (!code) {
    return NextResponse.redirect(new URL("/auth/error?error=Missing OAuth code", baseUrl));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/error?error=${encodeURIComponent(error.message)}`, baseUrl),
    );
  }

  return NextResponse.redirect(new URL(safeNext, baseUrl));
}
