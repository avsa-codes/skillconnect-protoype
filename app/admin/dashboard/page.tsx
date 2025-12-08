"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { BadgeStatus } from "@/components/ui/badge-status";
import { Users, Building2, ClipboardList, RefreshCw, CreditCard, Send } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AdminRoute from "@/components/admin/AdminRoute";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function AdminDashboard() {
  const supabase = createSupabaseBrowserClient();
  const [tasks, setTasks] = useState<any[]>([]);

  const [stats, setStats] = useState({
    students: 0,
    organizations: 0,
    activeTasks: 0,
    pendingTasks: 0,
    pendingReplacements: 0,
    pendingInvoices: 0,
    pendingOffers: 0,
  });

  const [recentTasks, setRecentTasks] = useState([]);
  const [recentOffers, setRecentOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // -------------------------------
  // FETCH ALL ADMIN DASHBOARD DATA
  // -------------------------------
  useEffect(() => {
    async function loadDashboard() {
      try {
        // 1) Total students
        const { count: stuCount } = await supabase
          .from("student_profiles")
          .select("*", { count: "exact", head: true });

        // 2) Total orgs
        const { count: orgCount } = await supabase
          .from("organization_profiles")
          .select("*", { count: "exact", head: true });

        // 3) Tasks: active
        const { count: activeTaskCount } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("status", "active");

        // 4) Tasks: pending review
        const { count: pendingTaskCount } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");

        // 5) Pending replacements
        const { count: replacementCount } = await supabase
          .from("replacements")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");

        // 6) Pending invoices
        const { count: invoiceCount } = await supabase
          .from("invoices")
          .select("*", { count: "exact", head: true })
          .in("status", ["pending", "overdue"]);

        // 7) Pending offers
        const { count: offersCount } = await supabase
          .from("offers")
          .select("*", { count: "exact", head: true })
          .eq("status", "sent");

        // 8) Recent 4 tasks
        const { data: latestTasks } = await supabase
          .from("tasks")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(4);

        // 9) Recent pending offers
        const { data: latestOffers } = await supabase
          .from("offers")
          .select("*")
          .eq("status", "sent")
          .order("created_at", { ascending: false })
          .limit(4);

        setStats({
          students: stuCount || 0,
          organizations: orgCount || 0,
          activeTasks: activeTaskCount || 0,
          pendingTasks: pendingTaskCount || 0,
          pendingReplacements: replacementCount || 0,
          pendingInvoices: invoiceCount || 0,
          pendingOffers: offersCount || 0,
        });

        setRecentTasks(latestTasks || []);
        setRecentOffers(latestOffers || []);
      } catch (err) {
        console.error("Dashboard load error:", err);
      }

      setLoading(false);
    }

    loadDashboard();
  }, []);

  // -------------------------------
  // RENDER PAGE
  // -------------------------------
  return (
    <AdminRoute>
      <DashboardLayout allowedRoles={["admin", "super_admin"]}>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Overview of InstaTask SkillConnect</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Students" value={stats.students.toString()} icon={<Users />} />
            <StatCard title="Organizations" value={stats.organizations.toString()} icon={<Building2 />} />
            <StatCard title="Active Tasks" value={stats.activeTasks.toString()} icon={<ClipboardList />} />
            <StatCard
              title="Pending Replacements"
              value={stats.pendingReplacements.toString()}
              icon={<RefreshCw />}
              className={stats.pendingReplacements > 0 ? "border-amber-200 bg-amber-50" : ""}
            />
          </div>

          {/* Alerts */}
          {(stats.pendingTasks > 0 ||
            stats.pendingInvoices > 0 ||
            stats.pendingReplacements > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.pendingTasks > 0 && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                        <ClipboardList className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-amber-800">
                          {stats.pendingTasks} Tasks Pending
                        </p>
                      </div>
                      <Button variant="outline" asChild>
                        <Link href="/admin/tasks">Review</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {stats.pendingReplacements > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
                        <RefreshCw className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-red-800">
                          {stats.pendingReplacements} Replacements Needed
                        </p>
                      </div>
                      <Button variant="outline" asChild>
                        <Link href="/admin/replacements">Handle</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {stats.pendingInvoices > 0 && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-blue-800">
                          {stats.pendingInvoices} Invoices Pending
                        </p>
                      </div>
                      <Button variant="outline" asChild>
                        <Link href="/admin/payments">View</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Recent Tasks & Offers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Tasks</CardTitle>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/tasks">View all</Link>
                </Button>
              </CardHeader>

              <CardContent>
                {recentTasks.map((t: any) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border"
                  >
                    <p className="font-medium">{t.title}</p>
                    <BadgeStatus status={t.status} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>Pending Offers</CardTitle>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/offers">View all</Link>
                </Button>
              </CardHeader>

              <CardContent>
                {recentOffers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6">No pending offers</p>
                ) : (
                  recentOffers.map((o: any) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border"
                    >
                      <p className="font-medium">{o.taskTitle}</p>
                      <BadgeStatus status={o.status} />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </AdminRoute>
  );
}


