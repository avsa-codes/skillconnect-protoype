"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/context/auth-context";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { BadgeStatus } from "@/components/ui/badge-status";
import { EmptyState } from "@/components/ui/empty-state";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Wallet,
  Briefcase,
  Clock,
  Star,
  FileText,
  XCircle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

import { toast } from "sonner";

export default function StudentDashboardPage() {
  const supabase = createSupabaseBrowserClient();
  const { user } = useAuth();
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);

  const [studentProfile, setStudentProfile] = useState<any | null>(null);
  const [activeTasks, setActiveTasks] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedOffer, setSelectedOffer] = useState<any | null>(null);
  const [confirmAction, setConfirmAction] =
    useState<"accept" | "decline" | null>(null);

  // -----------------------------------------------------------
  // 1️⃣ LOAD PROFILE
  // -----------------------------------------------------------



  function getProfileStrengthStatus(strength: number) {
  if (strength < 40) return { label: "Weak profile", tip: "Add more details to improve", color: "text-red-500" };
  if (strength < 70) return { label: "Average profile", tip: "Complete missing sections", color: "text-yellow-500" };
  return { label: "Good profile", tip: "Reach 100% for best visibility", color: "text-green-600" };
}



  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      const { data: profile } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      setStudentProfile(profile);
    };

    loadProfile();
  }, [user]);

  // -----------------------------------------------------------
  // 2️⃣ UNIVERSAL DASHBOARD DATA LOADER (REUSABLE)
  // -----------------------------------------------------------
  const loadDashboardData = async () => {
    if (!studentProfile) return;

    setLoading(true);

    // 1. Offers
    const { data: offersData } = await supabase
      .from("offers")
      .select("*")
      .eq("student_id", studentProfile.user_id)
      .order("created_at", { ascending: false });

    // 2. Tasks
    const { data: tasksData } = await supabase
      .from("tasks")
      .select(`
        id, title, short_description, full_brief, skills,
        weekly_hours, duration_weeks, start_date, location,
        city, salary, payroll_terms, positions, attachment_urls
      `);

    // 3. Organizations
    const { data: orgsData } = await supabase
      .from("organization_profiles")
      .select("user_id, company_name");

    // Maps
    const taskMap = Object.fromEntries(
      (tasksData || []).map((t: any) => [t.id, t])
    );

    const orgMap = Object.fromEntries(
      (orgsData || []).map((o: any) => [o.user_id, o])
    );

    // Join offers
    const joinedOffers = (offersData || []).map((o: any) => ({
      ...o,
      task: taskMap[o.task_id] || null,
      organization: orgMap[o.org_id] || null,
    }));

    setOffers(joinedOffers);

    // Active tasks
    const { data: tasksActive } = await supabase
      .from("tasks")
      .select("*")
      .contains("assigned_students", [studentProfile.user_id])
      .eq("status", "active");

    setActiveTasks(tasksActive || []);


    // Completed tasks
const { data: tasksCompleted } = await supabase
.from("tasks")
.select("*")
.contains("assigned_students", [studentProfile.user_id])
.eq("status", "completed");

setCompletedTasks(tasksCompleted || []);


    setLoading(false);
  };

  // -----------------------------------------------------------
  // 3️⃣ LOAD DASHBOARD DATA WHEN PROFILE IS READY
  // -----------------------------------------------------------
  useEffect(() => {
    if (studentProfile) loadDashboardData();
  }, [studentProfile]);

  const pendingOffers = offers.filter((o) => o.status === "sent");

  // -----------------------------------------------------------
  // 4️⃣ HANDLE ACCEPT / DECLINE
  // -----------------------------------------------------------
  const handleOfferAction = async (action: "accept" | "decline") => {
    if (!selectedOffer) return;

    const res = await fetch("/api/offers/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        offer_id: selectedOffer.id,
        action,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      toast.error(result.error || "Something went wrong");
      return;
    }

    toast.success(
      action === "accept" ? "Offer accepted!" : "Offer declined!"
    );

    // 🔥 REFRESH EVERYTHING
    await loadDashboardData();

    setConfirmAction(null);
    setSelectedOffer(null);
  };







  // -------------------------------------
  // LOADING STATE
  // -------------------------------------
  if (loading) {
    return (
      <DashboardLayout allowedRoles={["student"]}>
        <div className="p-10 text-center text-muted-foreground">
          Loading dashboard…
        </div>
      </DashboardLayout>
    );
  }

  // -------------------------------------
  // UI
  // -------------------------------------
  return (
    <DashboardLayout allowedRoles={["student"]}>
      <div className="space-y-8 pb-10 px-2 sm:px-4 lg:px-0">
        {/* HEADER */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Welcome back, {studentProfile?.full_name?.split(" ")[0] || "Student"}!
          </h1>
          <p className="text-muted-foreground">
            Here’s what’s happening with your SkillConnect profile.
          </p>
        </div>

        {/* TOP STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Available Balance"
            value={`₹${(studentProfile?.wallet_balance || 0).toLocaleString()}`}
            icon={<Wallet className="h-5 w-5" />}
          />
          <StatCard
            title="Active Tasks"
            value={activeTasks.length}
            icon={<Briefcase className="h-5 w-5" />}
          />
          <StatCard
            title="Pending Offers"
            value={pendingOffers.length}
            icon={<Clock className="h-5 w-5" />}
          />
          <StatCard
            title="Your Rating"
            value={(studentProfile?.rating || 0).toFixed(1)}
            description={`${studentProfile?.tasks_completed || 0} tasks completed`}
            icon={<Star className="h-5 w-5" />}
          />
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: OFFERS + TASKS */}
          <div className="lg:col-span-2 space-y-6">
            {/* PENDING OFFERS */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold">Pending Offers</h2>
                {pendingOffers.length > 0 && (
                  <span className="h-6 w-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                    {pendingOffers.length}
                  </span>
                )}
              </div>

              {pendingOffers.length > 0 ? (
                pendingOffers.map((offer) => (
                  <Card key={offer.id} className="rounded-2xl">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">
                              {offer.task?.title || "Task"}
                            </h3>
                            <BadgeStatus status={offer.status} />
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">
                            {offer.organization?.company_name || "Organization"}
                          </p>

                          <div className="flex gap-3 text-sm">
                            <span className="text-primary font-medium">
                              {offer.salary ? `₹${offer.salary}` : "-"}
                            </span>
                            <span className="text-muted-foreground">
                              Start:{" "}
                              {offer.start_date
                                ? new Date(offer.start_date).toLocaleDateString()
                                : "-"}
                            </span>
                          </div>
                        </div>

                       <div className="flex flex-col sm:flex-row gap-2">
  <Button
    variant="outline"
    size="sm"
    className="rounded-xl"
    onClick={() => setSelectedOffer(offer)}
  >
    View Details
  </Button>

  <Button
    variant="outline"
    size="sm"
    className="rounded-xl"
    onClick={() => {
      setSelectedOffer(offer);
      setConfirmAction("decline");
    }}
  >
    <XCircle className="h-4 w-4 mr-1" />
    Decline
  </Button>

  <Button
    size="sm"
    className="rounded-xl"
    onClick={() => {
      setSelectedOffer(offer);
      setConfirmAction("accept");
    }}
  >
    <CheckCircle className="h-4 w-4 mr-1" />
    Accept
  </Button>
</div>

                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="rounded-2xl">
                  <CardContent className="p-6">
                    <EmptyState
                      icon={<FileText className="h-8 w-8 text-muted-foreground" />}
                      title="No offers yet"
                      description="When organizations shortlist you, offers will appear here."
                    />
                  </CardContent>
                </Card>
              )}
            </section>

            {/* ACTIVE TASKS */}
            <section className="space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold">Current Tasks</h2>

              {activeTasks.length > 0 ? (
                activeTasks.map((task) => (
                  <Card key={task.id} className="rounded-2xl">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{task.title}</h3>
                            <BadgeStatus status={task.status} />
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">
                            {task.organization_name}
                          </p>

                          <div className="flex gap-2 flex-wrap">
                            {(task.skills || []).slice(0, 3).map((s: string) => (
                              <span
                                key={s}
                                className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        <Button variant="outline" size="sm" className="rounded-xl" asChild>
                          <Link href={`/student/tasks/${task.id}`}>
                            View Details <ArrowRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="rounded-2xl">
                  <CardContent className="p-6">
                    <EmptyState
                      icon={<Briefcase className="h-8 w-8 text-muted-foreground" />}
                      title="No active tasks"
                      description="Accept an offer to start working."
                    />
                  </CardContent>
                </Card>
              )}
            </section>

            {/* COMPLETED TASKS SECTION */}
<section className="space-y-4">
  <h2 className="text-lg sm:text-xl font-semibold">Completed Tasks</h2>

  {completedTasks.length > 0 ? (
    completedTasks.map((task) => (
      <Card key={task.id} className="rounded-2xl">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">{task.title}</h3>
                <BadgeStatus status="completed" />
              </div>

              <p className="text-sm text-muted-foreground mb-2">
                {task.organization_name}
              </p>

              {/* Rating + Feedback */}
              <div className="text-sm">
                <p className="font-medium">⭐ {task.org_rating ?? "-"} / 5</p>
                {task.org_feedback && (
                  <p className="text-muted-foreground mt-1 line-clamp-2">
                    “{task.org_feedback}”
                  </p>
                )}
              </div>
            </div>

            <Button variant="outline" size="sm" className="rounded-xl" asChild>
              <Link href={`/student/tasks/${task.id}`}>
                View Details <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    ))
  ) : (
    <Card className="rounded-2xl">
      <CardContent className="p-6">
        <EmptyState
          icon={<Star className="h-8 w-8 text-muted-foreground" />}
          title="No completed tasks yet"
          description="After completing tasks, your ratings and feedback will appear here."
        />
      </CardContent>
    </Card>
  )}
</section>

          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Profile Strength</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="flex items-center gap-4 mb-3">
                 {(() => {
  const strength = studentProfile?.profile_strength || 0;
  const status = getProfileStrengthStatus(strength);

  return (
    <div className="flex items-center gap-4 mb-3">
      {/* Strength Circle */}
      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
        <span className="text-xl font-bold text-primary">{strength}%</span>
      </div>

      {/* Status Text */}
      <div className="flex-1">
        <p className={`text-sm font-medium ${status.color}`}>{status.label}</p>
        <p className="text-xs text-muted-foreground">{status.tip}</p>
      </div>
    </div>
  );
})()}

                </div>

                <Button variant="outline" size="sm" className="w-full rounded-xl" asChild>
                  <Link href="/student/profile">Update Profile</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Quick Links</CardTitle>
              </CardHeader>

              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start rounded-xl" asChild>
                  <Link href="/student/profile">Edit Profile</Link>
                </Button>

                <Button variant="ghost" className="w-full justify-start rounded-xl" asChild>
                  <Link href="/student/earnings">View Earnings</Link>
                </Button>

                <Button variant="ghost" className="w-full justify-start rounded-xl" asChild>
                  <Link href="/student/settings">Notifications</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>




{/* OFFER DETAILS MODAL */}
<Dialog open={!!selectedOffer && !confirmAction} onOpenChange={() => setSelectedOffer(null)}>
  <DialogContent className="rounded-2xl max-w-lg max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Offer Details</DialogTitle>
      <DialogDescription>
        Review the full details of this offer.
      </DialogDescription>
    </DialogHeader>

   {selectedOffer && (
  <div className="space-y-4">

    {/* TASK SECTION */}
    <div className="bg-muted/50 p-4 rounded-xl space-y-2">
      <p className="text-xs text-muted-foreground">Task</p>
      <p className="font-semibold">{selectedOffer.task?.title}</p>

      {selectedOffer.task?.short_description && (
        <>
          <p className="text-xs text-muted-foreground mt-3">Description</p>
          <p className="text-sm">{selectedOffer.task.short_description}</p>
        </>
      )}

      {selectedOffer.task?.full_brief && (
        <>
          <p className="text-xs text-muted-foreground mt-3">Full Brief</p>
          <p className="text-sm whitespace-pre-wrap">
            {selectedOffer.task.full_brief}
          </p>
        </>
      )}
    </div>

    {/* ORGANIZATION */}
    <div className="bg-muted/50 p-4 rounded-xl space-y-2">
      <p className="text-xs text-muted-foreground">Organization</p>
      <p className="font-medium">
        {selectedOffer.organization?.company_name}
      </p>
    </div>

    {/* SALARY + DATES */}
    <div className="bg-muted/50 p-4 rounded-xl space-y-2">
      <p className="text-xs text-muted-foreground">Salary</p>
      <p className="font-semibold text-primary">₹{selectedOffer.salary}</p>

      <p className="text-xs text-muted-foreground mt-3">Start Date</p>
      <p>{new Date(selectedOffer.start_date).toLocaleDateString()}</p>

      <p className="text-xs text-muted-foreground mt-3">Sent On</p>
      <p>
        {selectedOffer.sent_at
          ? new Date(selectedOffer.sent_at).toLocaleString()
          : "-"}
      </p>
    </div>

  </div>
)}


    <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
      <Button
        variant="outline"
        onClick={() => setSelectedOffer(null)}
        className="rounded-xl w-full sm:w-auto"
      >
        Close
      </Button>

      <Button
        variant="outline"
        className="rounded-xl w-full sm:w-auto"
        onClick={() => setConfirmAction("decline")}
      >
        Decline
      </Button>

      <Button
        className="rounded-xl w-full sm:w-auto"
        onClick={() => setConfirmAction("accept")}
      >
        Accept
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>










      {/* CONFIRMATION DIALOG */}
{/* CONFIRMATION DIALOG */}
<Dialog
  open={!!confirmAction}
  onOpenChange={() => {
    setConfirmAction(null);
    setSelectedOffer(null);
  }}
>
  <DialogContent className="rounded-2xl max-w-lg max-h-[80vh] overflow-y-auto p-0">
    <DialogHeader className="px-6 pt-6">
      <DialogTitle className="text-xl font-semibold">
        {confirmAction === "accept" ? "Accept this offer?" : "Decline this offer?"}
      </DialogTitle>
      <DialogDescription className="text-sm text-muted-foreground">
        {confirmAction === "accept"
          ? "Please review the key details carefully before accepting. Once you accept, the organization and admin will be notified."
          : "If you decline, the organization and admin will be notified and this slot may be offered to another student."}
      </DialogDescription>
    </DialogHeader>

    {selectedOffer && (
      <div className="px-6 py-4 space-y-4">

        {/* TASK OVERVIEW */}
        <div className="bg-muted/50 rounded-xl p-4 border border-border space-y-2">
          <p className="text-xs text-muted-foreground">Role / Task</p>
          <p className="font-medium">
            {selectedOffer.task?.title || "Untitled Task"}
          </p>

          {selectedOffer.task?.short_description && (
            <p className="text-sm text-muted-foreground">
              {selectedOffer.task.short_description}
            </p>
          )}
        </div>

        {/* ORG + LOCATION + BASIC META */}
        <div className="bg-muted/50 rounded-xl p-4 border border-border space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Organization</p>
            <p className="text-sm font-medium">
              {selectedOffer.organization?.company_name || "Unknown Organization"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Weekly Hours</p>
              <p className="font-medium">
                {selectedOffer.task?.weekly_hours
                  ? `${selectedOffer.task.weekly_hours} hrs/week`
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="font-medium">
                {selectedOffer.task?.duration_weeks
                  ? `${selectedOffer.task.duration_weeks} weeks`
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="font-medium">
                {selectedOffer.task?.location || "-"}
                {selectedOffer.task?.city ? ` · ${selectedOffer.task.city}` : ""}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Positions</p>
              <p className="font-medium">
                {selectedOffer.task?.positions ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Payroll Terms</p>
              <p className="font-medium">
                {selectedOffer.task?.payroll_terms || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* SKILLS */}
        {Array.isArray(selectedOffer.task?.skills) &&
          selectedOffer.task.skills.length > 0 && (
            <div className="bg-muted/50 rounded-xl p-4 border border-border space-y-2">
              <p className="text-xs text-muted-foreground">Key Skills</p>
              <div className="flex flex-wrap gap-2">
                {selectedOffer.task.skills.map((s: string) => (
                  <span
                    key={s}
                    className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

        {/* FULL BRIEF (optional, scrollable inside) */}
        {selectedOffer.task?.full_brief && (
          <div className="bg-muted/50 rounded-xl p-4 border border-border space-y-2">
            <p className="text-xs text-muted-foreground">Full Brief</p>
            <p className="text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">
              {selectedOffer.task.full_brief}
            </p>
          </div>
        )}

        {/* SALARY + DATES */}
        <div className="bg-muted/50 rounded-xl p-4 border border-border space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Total Stipend / Salary</p>
            <p className="font-semibold text-primary">
              {selectedOffer.salary ? `₹${selectedOffer.salary}` : "-"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Start Date</p>
              <p>
                {selectedOffer.start_date
                  ? new Date(selectedOffer.start_date).toLocaleDateString()
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Offer Sent On</p>
              <p>
                {selectedOffer.sent_at
                  ? new Date(selectedOffer.sent_at).toLocaleString()
                  : "-"}
              </p>
            </div>
          </div>

          <p className="text-xs text-amber-600 mt-2">
            Note: This offer is valid for 24 hours from the time it was sent.
          </p>
        </div>

        {/* ATTACHMENTS (if any) */}
        {Array.isArray(selectedOffer.task?.attachment_urls) &&
          selectedOffer.task.attachment_urls.length > 0 && (
            <div className="bg-muted/50 rounded-xl p-4 border border-border space-y-2">
              <p className="text-xs text-muted-foreground">Attachments</p>
              <ul className="space-y-1 text-sm list-disc list-inside">
                {selectedOffer.task.attachment_urls.map((url: string, idx: number) => (
                  <li key={idx}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Attachment {idx + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
      </div>
    )}

    <DialogFooter className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
      <Button
        variant="outline"
        className="rounded-xl w-full"
        onClick={() => {
          setConfirmAction(null);
          setSelectedOffer(null);
        }}
      >
        Cancel
      </Button>

      <Button
        variant={confirmAction === "decline" ? "destructive" : "default"}
        className="rounded-xl w-full"
        onClick={() => handleOfferAction(confirmAction!)}
      >
        {confirmAction === "accept" ? "Confirm & Accept" : "Confirm & Decline"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

    </DashboardLayout>
  );
}
