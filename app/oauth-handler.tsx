// "use client";

// import { useEffect } from "react";
// import { useRouter, usePathname } from "next/navigation";
// import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

// export default function OAuthHandler() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const supabase = createSupabaseBrowserClient();

//   useEffect(() => {
//     async function handleOAuth() {
//       if (typeof window === "undefined") return;

//       const url = new URL(window.location.href);
//       const code = url.searchParams.get("code");

//       // Only run this logic when Supabase returns ?code=xxxx
//       if (!code) return;

//       console.log("OAuth returned with code:", code);

//       // Get session restored by Supabase
//       const { data: { session } } = await supabase.auth.getSession();

//       if (!session?.user) {
//         console.log("No session found after OAuth.");
//         return;
//       }

//       const user = session.user;
//       const role =
//         user.user_metadata.role ||
//         "student"; // default if missing

//       console.log("OAuth session restored:", { user, role });

//       // Remove ?code= from URL
//       window.history.replaceState({}, "", pathname);

//       // Redirect based on role
//       if (role === "student") {
//         router.replace("/student/onboarding");
//       } else if (role === "organization_user") {
//         router.replace("/org/profile");
//       } else {
//         router.replace("/auth");
//       }
//     }

//     handleOAuth();
//   }, []);

//   return null;
// }
