// import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
// import { createServerClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";

// // CLIENT (Browser)
// export function createClient() {
//   return createBrowserClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//   );
// }

// // SERVER (Server Components + Server Actions)
// export async function createServerSupabase() {
//   const cookieStore = await cookies();

//   return createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         get(name: string) {
//           return cookieStore.get(name)?.value;
//         },
//         set(name: string, value: string, options: any) {
//           try {
//             cookieStore.set(name, value, options);
//           } catch (e) {
//             // ignore in edge runtimes
//           }
//         },
//         remove(name: string, options: any) {
//           try {
//             cookieStore.set(name, "", { ...options, maxAge: 0 });
//           } catch (e) {
//             // ignore in edge runtimes
//           }
//         },
//       },
//     }
//   );
// }
