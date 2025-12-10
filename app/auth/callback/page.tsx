"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Loader2 } from "lucide-react";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    async function finishOAuth() {
      const code = searchParams.get("code");
      if (!code) return;

      console.log("OAuth returned with code:", code);

      // 1️⃣ Exchange code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("OAuth Exchange Error:", error);
        return;
      }

      console.log("Session established!");

      // 2️⃣ Redirect to onboarding or profile
      router.replace("/auth/first-login");
    }

    finishOAuth();
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
