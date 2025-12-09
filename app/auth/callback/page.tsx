"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, updateProfile } = useAuth();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    async function processLogin() {
      if (!isAuthenticated || !user) return;

      const roleParam = searchParams.get("role") || "student"; // default student

      try {
        // 1) Fetch fresh metadata from Supabase
        const { data: freshUserData } = await supabase.auth.getUser();
        const freshUser = freshUserData.user;
        if (!freshUser) return;

        const meta = freshUser.user_metadata || {};
        let role = meta.role || roleParam;

        // 2) Generate SC-ID if missing
        let scId = meta.skillconnect_id;
        if (!scId) {
          scId = `SC-${freshUser.id.replace(/-/g, "").slice(-6).toUpperCase()}`;
          await supabase.auth.updateUser({
            data: { skillconnect_id: scId, role }
          });
        }

        // 3) Create profile row (student or org)
        if (role === "student") {
          const { data: existing } = await supabase
            .from("student_profiles")
            .select("user_id")
            .eq("user_id", freshUser.id)
            .maybeSingle();

          if (!existing) {
            await supabase.from("student_profiles").insert([
              {
                user_id: freshUser.id,
                full_name: meta.full_name || freshUser.email,
                email: freshUser.email,
                profile_strength: 0,
              },
            ]);
          }
        }

        if (role === "organization_user") {
          const { data: existing } = await supabase
            .from("organization_profiles")
            .select("user_id")
            .eq("user_id", freshUser.id)
            .maybeSingle();

          if (!existing) {
            await supabase.from("organization_profiles").insert([
              {
                user_id: freshUser.id,
                company_name: meta.full_name || freshUser.email,
                contact_person: meta.full_name || "",
                email: freshUser.email,
              },
            ]);
          }
        }

        // 4) Set profileComplete = false in metadata
        await supabase.auth.updateUser({
          data: { profile_complete: false },
        });

        await updateProfile({ profileComplete: false });

        // 5) Redirect based on role
        if (role === "student") {
          router.replace("/student/onboarding");
        } else {
          router.replace("/org/profile");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error finishing login");
      }
    }

    processLogin();
  }, [isAuthenticated, user]);

  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
