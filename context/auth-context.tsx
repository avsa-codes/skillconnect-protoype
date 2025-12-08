"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
// your lib file
import type { PostgrestError } from "@supabase/supabase-js";

export type UserRole =
  | "student"
  | "organization_user"
  | "admin"
  | "super_admin"
  | "system_role"
  ;

export interface User {
  id: string;
  email: string;
  fullName?: string;
  role: UserRole;
  skillConnectId?: string;
  avatarUrl?: string | null;
  isFirstLogin?: boolean;
  profileComplete?: boolean;
}

/**
 * Auth context interface
 */
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
    role?: UserRole
  ) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signup: (
    email: string,
    password: string,
    fullName: string,
    role: UserRole
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;
  linkGoogleAccount: () => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Utility: generate SC ID from UUID (last 6 chars)
function generateSCIDFromUUID(userId?: string) {
  if (!userId) {
    // fallback: random 6 digits
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `SC-${rand}`;
  }
  return `SC-${userId.replace(/-/g, "").slice(-6).toUpperCase()}`;
}

/**
 * Map supabase auth user + profile rows into our User shape
 */
async function buildUserFromSupabase(
  supabase: ReturnType<typeof createSupabaseBrowserClient>,
  authUser: SupabaseUser
): Promise<User> {
  const metadata = (authUser.user_metadata || {}) as Record<string, any>;
  const role: UserRole = (metadata.role as UserRole) || "student";
  const skillConnectId: string | undefined =
    (metadata.skillconnect_id as string) || undefined;
  const isFirstLogin = metadata.must_change_password === true;

  // fetch profile from student_profiles or organization_profiles
  let profileComplete = false;
  let fullName: string | undefined = metadata.full_name || metadata.name || undefined;
  let avatarUrl: string | null = metadata.avatar_url || null;

  try {
    if (role === "student") {
      const { data: studentProfile } = await supabase
        .from("student_profiles")
        .select("full_name, profile_strength")
        .eq("user_id", authUser.id)
        .maybeSingle();

      if (studentProfile) {
        profileComplete = true; // if a row exists, consider profile created (you can do stricter checks)
        if (!fullName && (studentProfile as any).full_name) fullName = (studentProfile as any).full_name;
      }
    } else if (role === "organization_user") {
      const { data: orgProfile } = await supabase
        .from("organization_profiles")
        .select("company_name")
        .eq("user_id", authUser.id)
        .maybeSingle();

      if (orgProfile) {
        profileComplete = true;
        if (!fullName && (orgProfile as any).company_name) fullName = (orgProfile as any).company_name;
      }
    }
  } catch (e) {
    // ignore — non-fatal
    console.warn("Failed to fetch profile row:", e);
  }

  return {
    id: authUser.id,
    email: authUser.email ?? "",
    fullName,
    role,
    skillConnectId,
    avatarUrl,
    isFirstLogin,
    profileComplete,
  };
}

/**
 * AuthProvider implementation using Supabase
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createSupabaseBrowserClient();

  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);




  // 🔥 SUPER IMPORTANT: If admin is logged in via admin_session → bypass Supabase
useEffect(() => {
  const adminSession = typeof window !== "undefined"
    ? localStorage.getItem("admin_session")
    : null;

  if (adminSession === "super_admin") {
    setUser({
      id: "local-admin",
      email: "admin@local",
      role: "admin",
      fullName: "Super Admin",
      profileComplete: true,
      isFirstLogin: false,
    });
    setIsLoading(false);
  }
}, []);




  // On mount: check current session & subscribe to auth changes
// 🔥 FIX 1: Admin login via localStorage must override Supabase auth
useEffect(() => {
  const adminSession =
    typeof window !== "undefined"
      ? localStorage.getItem("admin_session")
      : null;

  if (adminSession === "super_admin") {
    setUser({
      id: "local-admin",
      email: "admin@local",
      role: "admin",
      fullName: "Super Admin",
      profileComplete: true,
      isFirstLogin: false,
    });
    setIsLoading(false);
  }
}, []);

// 🔥 FIX 2: Supabase auth session ONLY applies if NOT admin
useEffect(() => {
  let mounted = true;

  (async () => {
    // If admin logged in locally → skip Supabase session entirely
    const adminSession =
      typeof window !== "undefined"
        ? localStorage.getItem("admin_session")
        : null;

    if (adminSession === "super_admin") {
      return; // ❌ Skip Supabase login check
    }

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (session?.user) {
        const built = await buildUserFromSupabase(supabase, session.user);

        if (!mounted) return;
        setUser(built);
      } else {
        if (!mounted) return;
        setUser(null);
      }
    } catch (err) {
      console.error("Error fetching session on mount:", err);
    } finally {
      if (!mounted) return;
      setIsLoading(false);
    }
  })();

  // Subscribe to Supabase auth changes
  const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {

    // 🛑 If admin is logged in via localStorage, ignore Supabase changes
    const adminSession =
      typeof window !== "undefined"
        ? localStorage.getItem("admin_session")
        : null;

    if (adminSession === "super_admin") return;

    if (session?.user) {
      const built = await buildUserFromSupabase(supabase, session.user);
      setUser(built);
    } else {
      setUser(null);
    }
  });

  return () => {
    mounted = false;
    sub.subscription?.unsubscribe?.();
  };
}, []);


  // LOGIN: email + password
 const login = useCallback(
  async (
    email: string,
    password: string,
    role?: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data?.user) {
        console.warn("signInWithPassword error:", error);
        setIsLoading(false);
        return { success: false, error: error?.message || "Login failed" };
      }

      // 🔥 NEW: refresh session after login
      const { data: sessionData } = await supabase.auth.getSession();

     if (sessionData?.session?.user) {

  // 🔥 Force admin metadata so Supabase doesn’t overwrite the role back to "student"
  if (role === "admin") {
    await supabase.auth.updateUser({
      data: { role: "admin" },
    });
  }

  // Re-fetch session after metadata update
  const { data: refreshedSession } = await supabase.auth.getSession();

  const built = await buildUserFromSupabase(
    supabase,
    refreshedSession.session!.user
  );

  const finalUser = role ? { ...built, role } : built;
  setUser(finalUser);
}


      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      console.error("login error:", err);
      setIsLoading(false);
      return { success: false, error: err?.message || "Login failed" };
    }
  },
  [supabase]
);


  // LOGIN WITH GOOGLE: triggers OAuth redirect
  const loginWithGoogle = useCallback(
    async (role?: UserRole): Promise<{ success: boolean; error?: string }> => {
      try {
        // We attach role info in redirect query so server-side or client-side can take action after return
        const redirectTo = `${window.location.origin}/auth`; // Supabase will return here after OAuth
        const query = role ? `?role=${role}` : "";
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: redirectTo + query },
        });
        if (error) {
          console.error("signInWithOAuth error:", error);
          return { success: false, error: error.message };
        }
        // The browser will redirect; return success true for the caller, although app will navigate away
        return { success: true };
      } catch (err: any) {
        console.error("loginWithGoogle error:", err);
        return { success: false, error: err?.message || "Google login failed" };
      }
    },
    [supabase]
  );

  // SIGNUP: create account and profile
  const signup = useCallback(
  async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const supabase = createSupabaseBrowserClient();

      // 1. Create user in Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            full_name: fullName,
            must_change_password: true,
            profile_complete: false
          }
        }
      });

      if (error) {
  console.error("SUPABASE SIGNUP ERROR:", error);
  setIsLoading(false);
  return { success: false, error: error.message };
}


      // 2. Generate SC-ID
      const scId = `SC-${Math.floor(10000 + Math.random() * 90000)}`;

      // 3. Attach metadata (SC-ID)
      await supabase.auth.updateUser({
        data: {
          role,
          full_name: fullName,
          skillconnect_id: scId,
          must_change_password: true,
          profile_complete: false
        }
      });

      // 4. Save locally
      const newUser: User = {
        id: data.user!.id,
        email,
        fullName,
        role,
        skillConnectId: scId,
        isFirstLogin: true,
        profileComplete: false
      };

      setUser(newUser);
      localStorage.setItem("skillconnect_user", JSON.stringify(newUser));

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  },
  []
);


  // LOGOUT
  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error("logout error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // CHANGE PASSWORD (user must be logged in)
const changePassword = useCallback(
  async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const supabase = createSupabaseBrowserClient();

      if (!user?.email) {
        return { success: false, error: "User email missing" };
      }

      //
      // 1. SIGN OUT FIRST — required for reauth to work properly
      //
      await supabase.auth.signOut();

      //
      // 2. SIGN IN USING TEMPORARY PASSWORD
      //
      const { data: loginData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });

      if (loginError || !loginData?.user) {
        console.warn("Reauth error:", loginError);
        return { success: false, error: "Temporary password is incorrect" };
      }

      //
      // 3. UPDATE PASSWORD
      //
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
        data: {
          must_change_password: false,
        },
      });

      if (updateError) {
        console.error("Password update error:", updateError);
        return { success: false, error: updateError.message };
      }

      //
      // 4. UPDATE LOCAL STATE
      //
      const updatedUser: User = {
        ...(user as User),
        isFirstLogin: false,
      };

      setUser(updatedUser);
      localStorage.setItem("skillconnect_user", JSON.stringify(updatedUser));

      return { success: true };
    } catch (err: any) {
      console.error("changePassword error:", err);
      return { success: false, error: err.message };
    }
  },
  [user]
);



  // LINK GOOGLE ACCOUNT (starts OAuth link flow)
  const linkGoogleAccount = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      // Supabase currently doesn't provide "link provider" directly from client; typical flow:
      // - trigger OAuth sign-in which will reauthenticate and link if emails match or via server merge.
      // For simplicity, we use signInWithOAuth which will redirect the user.
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (error) {
        console.warn("linkGoogleAccount error:", error);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      console.error("linkGoogleAccount error:", err);
      return { success: false, error: err?.message || "Failed to link Google" };
    }
  }, [supabase]);

  // UPDATE PROFILE (small updates that reflect in profile tables or metadata)
  const updateProfile = useCallback(
    async (data: Partial<User>): Promise<{ success: boolean; error?: string }> => {
      try {
        if (!user) return { success: false, error: "Not authenticated" };

        const updates: Record<string, any> = {};
        if (data.fullName) updates.full_name = data.fullName;
        if (data.skillConnectId) updates.skillconnect_id = data.skillConnectId;
        if (data.avatarUrl) updates.avatar_url = data.avatarUrl;
        if (data.isFirstLogin !== undefined) updates.must_change_password = data.isFirstLogin;

        // update auth metadata
        if (Object.keys(updates).length > 0) {
          await supabase.auth.updateUser({ data: updates });
        }

        // update profile table (student or org)
        if (data.fullName) {
          if (user.role === "student") {
            await supabase
              .from("student_profiles")
              .update({ full_name: data.fullName })
              .eq("user_id", user.id);
          } else if (user.role === "organization_user") {
            await supabase
              .from("organization_profiles")
              .update({ company_name: data.fullName })
              .eq("user_id", user.id);
          }
        }

        // refresh local user
        const {
          data: { user: refreshed },
        } = await supabase.auth.getUser();

        if (refreshed) {
          const built = await buildUserFromSupabase(supabase, refreshed);
          setUser(built);
        }

        return { success: true };
      } catch (err: any) {
        console.error("updateProfile error:", err);
        return { success: false, error: err?.message || "Failed to update profile" };
      }
    },
    [supabase, user]
  );

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]): boolean => {
      if (!user) return false;
      const roleArray = Array.isArray(roles) ? roles : [roles];
      return roleArray.includes(user.role);
    },
    [user]
  );

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginWithGoogle,
    signup,
    logout,
    changePassword,
    linkGoogleAccount,
    updateProfile,
    hasRole,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
