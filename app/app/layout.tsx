import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/BottomNav";
import { Suspense } from "react";

function AppLayoutFallback() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto min-h-[calc(100vh-64px)] animate-pulse" />
      <BottomNav />
    </div>
  );
}

async function AppAuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto">{children}</div>
      <BottomNav />
    </div>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AppLayoutFallback />}>
      <AppAuthGate>{children}</AppAuthGate>
    </Suspense>
  );
}
