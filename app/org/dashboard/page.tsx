// "use client";

// import Link from "next/link";
// import { useState } from "react";
// import { DashboardLayout } from "@/components/layout/dashboard-layout";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { BadgeStatus } from "@/components/ui/badge-status";
// import { StatCard } from "@/components/ui/stat-card";

// import {
//   ClipboardList,
//   Users,
//   CreditCard,
//   TrendingUp,
//   Plus,
//   ArrowRight,
//   Calendar,
//   Clock,
//   MapPin,
// } from "lucide-react";

// export default function OrgDashboard() {
//   // ---------------------
//   // Temporary MVP demo data
//   // ---------------------
//   const notifications = [
//     { id: 1, message: "Task approved by Admin", time: "2 hours ago" },
//     { id: 2, message: "A student showed interest in your task", time: "1 day ago" },
//     { id: 3, message: "Invoice generated for Task #1", time: "2 days ago" },
//   ];

//   const activeTasks = [];
//   const assignedStudents = [];
//   const totalSpent = 0;
//   const pendingInvoices = [];

//   return (
//     <DashboardLayout allowedRoles={["organization_user", "admin", "super_admin"]}>
//       <div className="space-y-6">
//         {/* ---------------- HEADER ---------------- */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//           <div>
//             <h1 className="text-2xl font-bold text-foreground">Organization Dashboard</h1>
//             <p className="text-muted-foreground">Welcome back!</p>
//           </div>

//           <Button asChild>
//             <Link href="/org/tasks/new">
//               <Plus className="mr-2 h-4 w-4" />
//               Post New Task
//             </Link>
//           </Button>
//         </div>

//         {/* ---------------- STATS SECTION ---------------- */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           <StatCard
//             title="Active Tasks"
//             value={activeTasks.length.toString()}
//             icon={<ClipboardList className="h-6 w-6 text-primary" />}
//           />
//           <StatCard
//             title="Assigned Students"
//             value={assignedStudents.length.toString()}
//             icon={<Users className="h-6 w-6 text-primary" />}
//           />
//           <StatCard
//             title="Total Spent"
//             value={`₹${totalSpent.toLocaleString()}`}
//             icon={<TrendingUp className="h-6 w-6 text-primary" />}
//           />
//           <StatCard
//             title="Pending Invoices"
//             value={pendingInvoices.length.toString()}
//             icon={<CreditCard className="h-6 w-6 text-primary" />}
//           />
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* ---------------- ASSIGNED STUDENTS ---------------- */}
//           <Card className="lg:col-span-2">
//             <CardHeader className="flex flex-row items-center justify-between">
//               <div>
//                 <CardTitle>Assigned Students</CardTitle>
//                 <CardDescription>Students currently working on your tasks</CardDescription>
//               </div>

//               <Button variant="ghost" size="sm" asChild>
//                 <Link href="/org/tasks">
//                   View all <ArrowRight className="ml-1 h-4 w-4" />
//                 </Link>
//               </Button>
//             </CardHeader>

//             <CardContent>
//               {assignedStudents.length === 0 ? (
//                 <div className="text-center py-8 text-muted-foreground">
//                   <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
//                   <p>No students assigned yet</p>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {/* future students mapping */}
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* ---------------- RECENT ACTIVITY ---------------- */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Recent Activity</CardTitle>
//               <CardDescription>Latest updates on your tasks</CardDescription>
//             </CardHeader>

//             <CardContent>
//               <div className="space-y-4">
//                 {notifications.map((note) => (
//                   <div
//                     key={note.id}
//                     className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
//                   >
//                     <div className="h-2 w-2 mt-2 rounded-full bg-primary shrink-0" />
//                     <div className="flex-1">
//                       <p className="text-sm text-foreground">{note.message}</p>
//                       <p className="text-xs text-muted-foreground mt-1">{note.time}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* ---------------- ACTIVE TASKS ---------------- */}
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between">
//             <div>
//               <CardTitle>Active Tasks</CardTitle>
//               <CardDescription>Tasks currently in progress</CardDescription>
//             </div>

//             <Button variant="outline" size="sm" asChild>
//               <Link href="/org/tasks">View All Tasks</Link>
//             </Button>
//           </CardHeader>

//           <CardContent>
//             {activeTasks.length === 0 ? (
//               <div className="text-center py-8 text-muted-foreground">
//                 <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
//                 <p>No active tasks</p>
//                 <Button className="mt-4" asChild>
//                   <Link href="/org/tasks/new">Post your first task</Link>
//                 </Button>
//               </div>
//             ) : (
//               <div className="space-y-4">{/* active tasks go here */}</div>
//             )}
//           </CardContent>
//         </Card>

//         {/* ---------------- PENDING INVOICES ---------------- */}
//         {pendingInvoices.length > 0 && (
//           <Card className="border-amber-200 bg-amber-50/50">
//             <CardHeader>
//               <CardTitle className="text-amber-800">Pending Invoices</CardTitle>
//               <CardDescription className="text-amber-700">
//                 You have {pendingInvoices.length} pending invoice(s)
//               </CardDescription>
//             </CardHeader>

//             <CardContent>
//               {/* future invoice list */}
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";

import { BadgeStatus } from "@/components/ui/badge-status";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useAuth } from "@/context/auth-context";

import {
  ClipboardList,
  Users,
  CreditCard,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";

export default function OrgDashboard() {
  const supabase = createSupabaseBrowserClient();
  const { user } = useAuth();

  const [orgTasks, setOrgTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const pendingInvoices: any[] = [];

  // -----------------------------
  //  LOAD TASKS FOR THIS ORG
  // -----------------------------
  useEffect(() => {
    if (!user) return;

    async function loadOrgDashboard() {
      setLoading(true);

      const { data: tasksData, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("org_id", user.id);

      if (error) {
        console.error("Task load error:", error);
        setLoading(false);
        return;
      }

      setOrgTasks(tasksData || []);
      setLoading(false);
    }

    loadOrgDashboard();
  }, [user]);

  // -----------------------------
  //  COMPUTED LIVE VALUES
  // -----------------------------
  const activeTasks = orgTasks.filter((t) => t.status === "active");
  const assignedStudents = orgTasks.filter((t) => t.student_id !== null);

  const totalSpent = 0; // Calculations can be added later

  // --------------------------------------------------------
  // STATUS MAPPER — FIX "open" → "Open", "active" → "Accepted"
  // --------------------------------------------------------
  function mapTaskStatus(status: string) {
    switch (status) {
      case "active":
        return "Accepted"; // student accepted the offer
      case "open":
        return "Open";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  }

  return (
    <DashboardLayout allowedRoles={["organization_user", "admin", "super_admin"]}>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Organization Dashboard</h1>
            <p className="text-muted-foreground">Welcome back!</p>
          </div>

          <Button asChild>
            <Link href="/org/tasks/new">
              <Plus className="mr-2 h-4 w-4" />
              Post New Task
            </Link>
          </Button>
        </div>

        {/* STATS SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Tasks"
            value={activeTasks.length.toString()}
            icon={<ClipboardList className="h-6 w-6 text-primary" />}
          />

          <StatCard
            title="Assigned Students"
            value={assignedStudents.length.toString()}
            icon={<Users className="h-6 w-6 text-primary" />}
          />

          <StatCard
            title="Total Spent"
            value={`₹${totalSpent.toLocaleString()}`}
            icon={<TrendingUp className="h-6 w-6 text-primary" />}
          />

          <StatCard
            title="Pending Invoices"
            value={pendingInvoices.length.toString()}
            icon={<CreditCard className="h-6 w-6 text-primary" />}
          />
        </div>

        {/* ASSIGNED STUDENTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Assigned Students</CardTitle>
                <CardDescription>Students currently working on your tasks</CardDescription>
              </div>

              <Button variant="ghost" size="sm" asChild>
                <Link href="/org/tasks">
                  View all <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>

            <CardContent>
              {assignedStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No students assigned yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* student list can be added later */}
                </div>
              )}
            </CardContent>
          </Card>

          {/* RECENT ACTIVITY (static for now) */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates on your tasks</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {/* Hard-coded notifications, fine for MVP */}
                {[
                  { id: 1, message: "Task approved by Admin", time: "2 hours ago" },
                  { id: 2, message: "A student accepted your offer", time: "1 day ago" },
                ].map((note) => (
                  <div
                    key={note.id}
                    className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
                  >
                    <div className="h-2 w-2 mt-2 rounded-full bg-primary shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{note.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{note.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ACTIVE TASKS */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Tasks</CardTitle>
              <CardDescription>Tasks currently in progress</CardDescription>
            </div>

            <Button variant="outline" size="sm" asChild>
              <Link href="/org/tasks">View All Tasks</Link>
            </Button>
          </CardHeader>

          <CardContent>
            {activeTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No active tasks</p>

                <Button className="mt-4" asChild>
                  <Link href="/org/tasks/new">Post your first task</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeTasks.map((task) => (
                  <Card key={task.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {mapTaskStatus(task.status)}
                          </p>
                        </div>

                        <BadgeStatus status={mapTaskStatus(task.status)} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
