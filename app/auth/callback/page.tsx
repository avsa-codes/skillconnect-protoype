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
      const role = searchParams.get("role") || "student";

      if (!code) return;

      console.log("OAuth code:", code);

      // 1️⃣ Exchange code → session
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error("OAuth error:", error);
        return;
      }

      // 2️⃣ Force refresh so AuthContext gets updated IMMEDIATELY
      await supabase.auth.getSession();

      // 3️⃣ Set metadata role immediately (Supabase does NOT do this itself)
      await supabase.auth.updateUser({
        data: {
          role: role,
          profile_complete: false,
        },
      });

      // 4️⃣ Redirect based on selected role
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
