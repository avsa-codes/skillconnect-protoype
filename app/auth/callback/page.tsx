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

      // 🔥 1. EXCHANGE THE CODE INTO A SESSION (MANDATORY)
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("OAuth Exchange Error:", error);
        return;
      }

      console.log("Supabase login success:", data);

      // 🔥 2. Read the role from URL
      const role = searchParams.get("role") || "student";

      // 🔥 3. Redirect based on role
      if (role === "student") {
        router.replace("/student/onboarding");
      } else {
        router.replace("/org/profile");
      }
    }

    finishOAuth();
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
