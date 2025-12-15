"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { UserRole } from "@/context/auth-context";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const handleAuth = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.user) {
        router.replace("/auth");
        return;
      }

      const user = session.user;
      const metadata = user.user_metadata || {};

      // 🔑 Role from URL (student by default)
      const role =
        (searchParams.get("role") as UserRole) || "student";

      // 🧠 Write metadata ONCE for Google users
      const needsUpdate =
        !metadata.role ||
        metadata.profile_complete === undefined ||
        metadata.must_change_password === undefined;

      if (needsUpdate) {
        await supabase.auth.updateUser({
          data: {
            role,
            profile_complete: false,
            must_change_password: true,
          },
        });
      }

      // ✅ Redirect based on role
      if (role === "student") {
        router.replace("/student/onboarding");
      } else if (role === "organization_user") {
        router.replace("/org/profile");
      } else {
        router.replace("/auth");
      }
    };

    handleAuth();
  }, [router, searchParams, supabase]);

  return null;
}
