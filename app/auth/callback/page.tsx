"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Loader2 } from "lucide-react";

export default function OAuthCallbackPage() {
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const finalize = async () => {
      // ⛔ DO NOT exchange code manually
      // Just wait for Supabase to hydrate the session
      await supabase.auth.getSession();

      // Let auth-context decide everything
      window.location.replace("/auth");
    };

    finalize();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}


