"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Loader2 } from "lucide-react";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    async function handleOAuth() {
      const code = searchParams.get("code");
      const role = searchParams.get("role") || "student";

      if (!code) return;

      // 1️⃣ EXCHANGE CODE → CREATE SESSION
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("OAuth exchange failed:", error.message);
        return;
      }

      // 2️⃣ REDIRECT USER
      if (role === "student") {
        router.replace("/student/onboarding");
      } else {
        router.replace("/org/profile");
      }
    }

    handleOAuth();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
