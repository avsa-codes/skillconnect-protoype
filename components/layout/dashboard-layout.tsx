"use client";

import type React from "react";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, type UserRole } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Menu,
  ChevronDown,
  LogOut,
  Settings,
  LayoutDashboard,
  User,
  CreditCard,
  Users,
  Building2,
  ClipboardList,
  Send,
  Database,
  RefreshCw,
  Shield,
  MessageSquare,
  Bell,
} from "lucide-react";

/* ------------------ NAV CONFIG ------------------ */

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const studentNavItems: NavItem[] = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/profile", label: "Profile", icon: User },
  { href: "/student/settings", label: "Settings", icon: Settings },
];

const orgNavItems: NavItem[] = [
  { href: "/org/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/org/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/org/profile", label: "Profile", icon: Building2 },
];

const adminNavItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/organizations", label: "Organizations", icon: Building2 },
  { href: "/admin/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/admin/offers", label: "Offers", icon: Send },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/seed", label: "Seed Users", icon: Database },
  { href: "/admin/replacements", label: "Replacements", icon: RefreshCw },
  { href: "/admin/audit", label: "Audit Logs", icon: Shield },
  { href: "/admin/support", label: "Support", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/completed-tasks", label: "Completed Tasks", icon: Settings },
];

/* ------------------ LAYOUT ------------------ */

interface DashboardLayoutProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

export function DashboardLayout({ children, allowedRoles }: DashboardLayoutProps) {


  const { user, isLoading, logout, hasRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminSession, setAdminSession] = useState<string | null>(null);

 const [forced, setForced] = useState<string | null>(null);

useEffect(() => {
  const flag = localStorage.getItem("FORCE_STUDENT_DASHBOARD");
  if (flag === "1") {
    localStorage.removeItem("FORCE_STUDENT_DASHBOARD");
    setForced("1");
  }
}, []);


console.log("📦 DashboardLayout render", {
  isLoading,
  hasUser: !!user,
  userRole: user?.role,
  pathname,
});


  /* -------- read admin session -------- */
  useEffect(() => {
    const s =
      typeof window !== "undefined"
        ? localStorage.getItem("admin_session")
        : null;
    setAdminSession(s);
  }, []);

  const isAdmin = adminSession === "super_admin";

  /* -------- 1️⃣ loading -------- */
 if (isLoading) {
  console.log("⏳ Dashboard waiting for auth", { isLoading });
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-muted-foreground">Loading session…</div>
    </div>
  );
}
  /* -------- 2️⃣ not logged in -------- */
  console.log("🚨 Dashboard redirect to /auth", {
  isLoading,
  hasUser: !!user,
  isAdmin,
});

if (!user && !isAdmin) {
  router.replace("/auth");
  return null;
}


  /* -------- 3️⃣ student onboarding guard -------- *----------------/
  // if (
  //   user &&
  //   user.role === "student" &&
  //   user.profileComplete === false &&
  //   pathname !== "/student/onboarding"
  // ) {
  //   router.replace("/student/onboarding");
  //   return null;
  // }

  /* -------- 4️⃣ role guard -------- */


  /* -------- nav items -------- */
  const navItems: NavItem[] = isAdmin || hasRole(["admin", "super_admin"])
    ? adminNavItems
    : hasRole("organization_user")
    ? orgNavItems
    : studentNavItems;

  /* ------------------ UI ------------------ */



  return (
    <div className="min-h-screen bg-background">
      {/* Top navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          {/* Mobile menu + Logo */}
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b">
                    <Link href="/" className="flex items-center gap-1">
                      <span className="text-lg font-semibold text-foreground">InstaTask</span>
                      <span className="text-lg font-semibold text-primary">| SkillConnect</span>
                    </Link>
                  </div>
                  <nav className="flex-1 p-4">
                    <ul className="space-y-1">
                      {navItems.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                              pathname === item.href
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted",
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-1">
              <span className="text-lg font-semibold text-foreground">InstaTask</span>
              <span className="text-lg font-semibold text-primary">| SkillConnect</span>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full" />
              <span className="sr-only">Notifications</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {user?.fullName?.charAt(0) || "U"}
                  </div>
                  <span className="hidden sm:inline max-w-[120px] truncate">{user?.fullName}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  {user?.skillConnectId && <p className="text-xs text-primary font-mono mt-1">{user.skillConnectId}</p>}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={navItems.find((i) => i.label === "Settings")?.href || "#"} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
