"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { GraduationCap, Building2, Loader2 } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";





function AuthContent() {




  const router = useRouter()
  const searchParams = useSearchParams()
  const {
  login,
  loginWithGoogle,
  signup,
  isAuthenticated,
  user,
  updateProfile
} = useAuth();


  const [userType, setUserType] = useState<"student" | "organization">("student")
  const [mode, setMode] = useState<"login" | "register">("login")
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)




  useEffect(() => {
  if (!user || !isAuthenticated) return;

  if (user.role === "student" && user.profileComplete === false) {
    router.replace("/student/onboarding");
    return;
  }

  if (user.role === "student" && user.profileComplete === true) {
    router.replace("/student/dashboard");
    return;
  }
}, [user, isAuthenticated]);


  
  useEffect(() => {
    const type = searchParams.get("type")
    const modeParam = searchParams.get("mode")

    if (type === "organization") setUserType("organization")
    if (type === "student") setUserType("student")
    if (modeParam === "register") setMode("register")
  }, [searchParams])

useEffect(() => {
  // 🚫 If you're NOT on the /auth page,
  // STOP AUTH REDIRECT LOGIC COMPLETELY.


  // 🛑 Check manual admin login FIRST
  if (typeof window !== "undefined") {
    if (localStorage.getItem("admin_session") === "super_admin") {
      router.push("/admin/dashboard");
      return;
    }
  }

  if (!isAuthenticated || !user) return;

  const path = window.location.pathname;

  // 🛑 Admin should NEVER be redirected by the auth page logic
  if (user.role === "admin" || user.role === "super_admin") {
    router.push("/admin/dashboard");
    return;
  }

  // ---- student/org logic ----
  if (user.isFirstLogin) {
    router.push("/auth/first-login");
    return;
  }

  if (!user.profileComplete) {
    if (user.role === "student") {
      router.push("/student/onboarding");
    } else if (user.role === "organization_user") {
      router.push("/org/profile");
    }
    return;
  }

  switch (user.role) {
    case "student":
      router.push("/student/dashboard");
      break;
    case "organization_user":
      router.push("/org/dashboard");
      break;
  }
}, [isAuthenticated, user, router]);


useEffect(() => {
  if (searchParams.get("passwordChanged") === "1") {
    toast.success("Password changed successfully. Please log in again.");
  }
}, [searchParams]);


useEffect(() => {
  if (typeof window === "undefined") return;

  const path = window.location.pathname;

  // 🚫 DO NOT redirect during OAuth flow
  if (path !== "/auth") return;

  if (!isAuthenticated || !user) return;

  if (user.role === "admin" || user.role === "super_admin") {
    router.push("/admin/dashboard");
    return;
  }

  if (user.isFirstLogin) {
    router.push("/auth/first-login");
    return;
  }

  if (!user.profileComplete) {
    if (user.role === "student") {
      router.push("/student/onboarding");
    } else {
      router.push("/org/profile");
    }
    return;
  }

  if (user.role === "student") {
    router.push("/student/dashboard");
  } else if (user.role === "organization_user") {
    router.push("/org/dashboard");
  }
}, [isAuthenticated, user, router]);





 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  let loginEmail = email; // default

  try {
    // -------------------------------
    // SKILLCONNECT ID LOGIN DETECTION
    // -------------------------------
    if (email.trim().toUpperCase().startsWith("SC-")) {
      const scid = email.trim().toUpperCase();

      const res = await fetch(`/api/auth/resolve-skillconnect-id?scid=${scid}`);
      const data = await res.json();

      if (res.status !== 200) {
        toast.error(data.error || "Invalid SkillConnect ID");
        setIsLoading(false);
        return;
      }

      // Replace email with resolved email
      loginEmail = data.email;
    }

    // -------------------------------
    // NORMAL LOGIN OR SCID-BASED LOGIN
    // -------------------------------
    const role = userType === "organization" ? "organization_user" : "student";
    const result = await login(loginEmail, password, role);

    if (!result.success) {
      toast.error(result.error || "Login failed");
    } else {
      toast.success("Welcome back!");
    }
  } catch (err) {
    console.error(err);
    toast.error("Something went wrong");
  }

  setIsLoading(false);
};


const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!acceptTerms) {
    toast.error("Please accept the Terms & Conditions");
    return;
  }

  setIsLoading(true);

  const supabase = createSupabaseBrowserClient();
  const role = userType === "organization" ? "organization_user" : "student";
  const name = userType === "organization" ? companyName : fullName;

  try {
    // 1) CREATE USER IN SUPABASE
    const {
      data: { user: createdUser },
      error: signupErr,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          full_name: name,
          profile_complete: false,
        },
      },
    });

    if (signupErr || !createdUser) {
      toast.error(signupErr?.message || "Registration failed");
      setIsLoading(false);
      return;
    }

    // 2) GENERATE SKILLCONNECT ID
    const scid = `SC-${createdUser.id.replace(/-/g, "").slice(-6).toUpperCase()}`;

    await supabase.auth.updateUser({
      data: {
        skillconnect_id: scid,
        role,
        full_name: name,
        profile_complete: false,
        is_first_login: true,
      },
    });

    // 3) INSERT INTO PROFILE TABLE
    if (role === "student") {
      await supabase.from("student_profiles").insert([
        {
          user_id: createdUser.id,
          full_name: name,
          email: createdUser.email,
          profile_strength: 0,
        },
      ]);
    } else {
      await supabase.from("organization_profiles").insert([
        {
          user_id: createdUser.id,
          company_name: name,
          contact_person: name,
          email: createdUser.email,
          profile_strength: 0,
        },
      ]);
    }

    toast.success("Account created successfully!");

    // 4) REDIRECT TO FIRST LOGIN SCREEN
    router.push("/auth/first-login");
  } catch (err) {
    console.error(err);
    toast.error("Something went wrong");
  }

  setIsLoading(false);
};


  const handleGoogleLogin = async () => {
    setIsLoading(true)
    const role = userType === "organization" ? "organization_user" : "student"
    const result = await loginWithGoogle(role)

    if (!result.success) {
      toast.error(result.error || "Google login failed")
    }

    setIsLoading(false)
  }


    // ----------------------------------------------------------
  // GOOGLE OAUTH → POST LOGIN HANDLER
  // ----------------------------------------------------------




  return (
    <div className="min-h-screen flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground text-background p-12 flex-col justify-between">
        <div>
          <Link href="/" className="flex items-center gap-1">
            <span className="text-2xl font-semibold">InstaTask</span>
            <span className="text-2xl font-semibold text-primary">| SkillConnect</span>
          </Link>
        </div>

        <div>
          <h1 className="text-4xl font-bold mb-4 text-balance">
            {userType === "student" ? "Start building your career today" : "Find skilled talent for your projects"}
          </h1>
          <p className="text-lg opacity-80">
            {userType === "student"
              ? "Join thousands of students earning while gaining real work experience."
              : "Access pre-screened students ready to contribute to your team."}
          </p>
        </div>

        <p className="text-sm opacity-60">&copy; {new Date().getFullYear()} InstaTask SkillConnect</p>
      </div>

      {/* Right - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-1 justify-center">
              <span className="text-xl font-semibold">InstaTask</span>
              <span className="text-xl font-semibold text-primary">| SkillConnect</span>
            </Link>
          </div>

          {/* User Type Toggle */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={userType === "student" ? "default" : "outline"}
              className="flex-1 rounded-xl gap-2"
              onClick={() => setUserType("student")}
            >
              <GraduationCap className="h-4 w-4" />
              Student
            </Button>
            <Button
              variant={userType === "organization" ? "default" : "outline"}
              className="flex-1 rounded-xl gap-2"
              onClick={() => setUserType("organization")}
            >
              <Building2 className="h-4 w-4" />
              Organization
            </Button>
          </div>

          <Card className="rounded-2xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle>{mode === "login" ? "Welcome back" : "Create your account"}</CardTitle>
              <CardDescription>
                {mode === "login" ? `Sign in to your ${userType} account` : `Register as a ${userType}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={mode} onValueChange={(v) => setMode(v as "login" | "register")}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Sign in</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="text"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="rounded-xl"
                      />
                    </div>
                    <Button type="submit" className="w-full rounded-xl" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign in
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    {userType === "student" ? (
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="Your full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          className="rounded-xl"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          type="text"
                          placeholder="Your company name"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          required
                          className="rounded-xl"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="registerEmail">Email</Label>
                      <Input
                        id="registerEmail"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registerPassword">Password</Label>
                      <Input
                        id="registerPassword"
                        type="password"
                        placeholder="Create a password (min 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="terms"
                        checked={acceptTerms}
                        onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                      />
                      <Label htmlFor="terms" className="text-sm leading-tight cursor-pointer">
                        I accept the{" "}
                        <Link href="/terms" className="text-primary hover:underline">
                          Terms & Conditions.
                        </Link>
                        {userType === "student" && ""}
                        {userType === "organization" && " and replacement policy"}
                      </Label>
                    </div>
                    <Button type="submit" className="w-full rounded-xl" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

            {/* Only show Google login for STUDENTS */}
{userType === "student" && (
  <>
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
      </div>
    </div>

    <Button
      variant="outline"
      className="w-full rounded-xl gap-2 bg-transparent"
      onClick={handleGoogleLogin}
      disabled={isLoading}
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      Sign in with Google
    </Button>
  </>
)}


              <p className="text-center text-sm text-muted-foreground mt-6">
                
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  )
}
