// app/org/tasks/page.tsx
"use client";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BadgeStatus } from "@/components/ui/badge-status";
import { EmptyState } from "@/components/ui/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Plus, Search, Calendar, Clock, MapPin, Users, Eye } from "lucide-react";

export default function OrgTasksPage() {
  const supabase = createSupabaseBrowserClient();

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [organization, setOrganization] = useState<any | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<any>(null);


  // Create task modal state + form
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    title: "",
    short_description: "",
    full_brief: "",
    skillsText: "", // comma-separated
    weekly_hours: "",
    duration_weeks: "",
    start_date: "",
    location: "remote",
    city: "",
    salary: "",
    payroll_terms: "monthly",
    positions: "1",
  });
  const [creating, setCreating] = useState(false);

  // load current user -> organization -> tasks
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const { data: userRes } = await supabase.auth.getUser();
        const user = userRes?.user ?? null;
        if (!user) {
          console.warn("No user signed in");
          setOrganization(null);
          setTasks([]);
          setLoading(false);
          return;
        }

        // fetch organization row where user_id === auth user id
        const { data: orgData, error: orgErr } = await supabase
          .from("organization_profiles")
          .select("*")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();

        if (orgErr) {
          console.error("Error loading organization:", orgErr);
        } else if (mounted) {
          setOrganization(orgData ?? null);

          // fetch tasks for this org
          // NOTE: your tasks table uses column `org_id` (based on screenshot). query by that.
          // const orgId = orgData?.user_id ?? orgData?.id ?? null;
          const orgId = orgData?.user_id;
 // ALWAYS use the row id from organization_profiles

          if (orgId) {
            const { data: tasksData, error: tasksErr } = await supabase
              .from("tasks")
              .select("*")
              .eq("org_id", orgId)
              .order("created_at", { ascending: false });

            if (tasksErr) {
              console.error("Error loading org tasks:", tasksErr);
              setTasks([]);
            } else {
              // Normalize skills column to array
              const normalized = (tasksData || []).map((t: any) => ({
                ...t,
                skills: Array.isArray(t.skills) ? t.skills : (t.skills ? t.skills.split(",").map((s: string) => s.trim()) : []),
              }));
              setTasks(normalized);
            }
          } else {
            setTasks([]);
          }
        }
      } catch (err) {
        console.error("Error loading org/tasks:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  // filters
  const filteredTasks = tasks.filter((task) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      String(task.title ?? "").toLowerCase().includes(q) ||
      String(task.short_description ?? "").toLowerCase().includes(q) ||
      (task.skills || []).some((s: string) => s.toLowerCase().includes(q));
    const matchesStatus = statusFilter === "all" || (task.status ?? "pending") === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // create a new task
  const handleCreateTask = async () => {
    if (!organization) {
      alert("Organization not loaded.");
      return;
    }

    // minimal validation
    if (!form.title.trim()) {
      alert("Title required");
      return;
    }

    setCreating(true);
    try {
      const payload = {
        org_id: organization.user_id,
        title: form.title.trim(),
        short_description: form.short_description.trim() || null,
        full_brief: form.full_brief.trim() || null,
        skills: form.skillsText ? form.skillsText.split(",").map((s) => s.trim()) : [],
        weekly_hours: form.weekly_hours ? parseInt(form.weekly_hours, 10) : null,
        duration_weeks: form.duration_weeks ? parseInt(form.duration_weeks, 10) : null,
        start_date: form.start_date || null,
        location: form.location || null,
        city: form.city || null,
        salary: form.salary ? parseInt(form.salary, 10) : null,
        payroll_terms: form.payroll_terms || null,
        positions: form.positions ? parseInt(form.positions, 10) : 1,
        positions_filled: 0,
        confidential: false,
        attachment_urls: null,
        status: "pending",
      };

      const { data, error } = await supabase.from("tasks").insert(payload).select().single();
      if (error) {
        console.error("Failed to create task:", error);
        alert("Error creating task: " + (error.message || error.code));
      } else {
        // normalize and add to list
        const normalized = { ...data, skills: Array.isArray(data.skills) ? data.skills : (data.skills ? data.skills.split(",") : []) };
        setTasks((prev) => [normalized, ...prev]);
        setShowNew(false);
        setForm({
          title: "",
          short_description: "",
          full_brief: "",
          skillsText: "",
          weekly_hours: "",
          duration_weeks: "",
          start_date: "",
          location: "remote",
          city: "",
          salary: "",
          payroll_terms: "monthly",
          positions: "1",
        });
      }
    } catch (err) {
      console.error("Unexpected create error:", err);
      alert("Unexpected error creating task");
    } finally {
      setCreating(false);
    }
  };





const handleDeleteTask = async () => {
  if (!taskToDelete) return;

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskToDelete.id);

  if (error) {
    toast.error("Failed to delete task");
    return;
  }

  setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
  toast.success("Task deleted successfully!");
  setTaskToDelete(null); // close modal
};



function mapTaskStatus(status: string) {
  switch (status) {
    case "pending":
      return "Pending Review";
    case "open":
      return "Open";
    case "active":
      return "Accepted"; // STUDENT ACCEPTED OFFER
    case "completed":
      return "Completed";
    default:
      return status;
  }
}




  return (
    <DashboardLayout allowedRoles={["organization_user", "admin", "super_admin"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
            <p className="text-muted-foreground">Manage your posted tasks</p>
          </div>
         <div>
  <Button asChild>
    <Link href="/org/tasks/new">
      <Plus className="mr-2 h-4 w-4" />
      Post New Task
    </Link>
  </Button>
</div>

        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {filteredTasks.length === 0 ? (
          <EmptyState
            icon={<Search />}
            title="No tasks found"
            description={
              organization == null
                ? "No organization profile found for current user."
                : tasks.length === 0
                ? "You haven't posted any tasks yet. Create your first task to start finding talent."
                : "Try adjusting your search or filters."
            }
            action={
              tasks.length === 0 ? (
                <Button onClick={() => setShowNew(true)}>Post Your First Task</Button>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3>{task.title}</h3>
<BadgeStatus status={mapTaskStatus(task.status)} />


                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{task.short_description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {task.duration_weeks ? `${task.duration_weeks} wk` : "—"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {task.weekly_hours ?? "-"}h/week
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {task.location === "remote" ? "Remote" : task.city}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {task.positions_filled ?? 0}/{task.positions ?? 1} filled
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right mr-4">
                        <p className="text-lg font-semibold text-foreground">{task.salary ?? "-"}</p>
                        <p className="text-xs text-muted-foreground capitalize">{String(task.payroll_terms ?? "").replace("-", " ")}</p>
                      </div>
                     <div className="flex items-center gap-3">

  {/* VIEW BUTTON */}
  <Button
    variant="outline"
    size="sm"
    className="rounded-xl"
    onClick={() => setSelectedTask(task)}
  >
    <Eye className="mr-2 h-4 w-4" />
    View
  </Button>

  {/* DELETE BUTTON */}
  <Button
    variant="ghost"
    size="icon"
    className="text-destructive hover:bg-red-100 rounded-full"
    onClick={() => setTaskToDelete(task)}

  >
    <Trash2 className="h-5 w-5" />
  </Button>

</div>

                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* New Task Modal */}
        <Dialog open={showNew} onOpenChange={setShowNew}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Post New Task</DialogTitle>
              <DialogDescription>Provide details for the task you want to post.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground">Title</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground">Short description</label>
                <Input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground">Full brief</label>
                <Textarea value={form.full_brief} onChange={(e) => setForm({ ...form, full_brief: e.target.value })} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input placeholder="Skills (comma separated)" value={form.skillsText} onChange={(e) => setForm({ ...form, skillsText: e.target.value })} />
                <Input placeholder="Weekly hours" value={form.weekly_hours} onChange={(e) => setForm({ ...form, weekly_hours: e.target.value })} />
                <Input placeholder="Duration (weeks)" value={form.duration_weeks} onChange={(e) => setForm({ ...form, duration_weeks: e.target.value })} />
                <Input placeholder="Start date (YYYY-MM-DD)" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                <Select value={form.location} onValueChange={(v) => setForm({ ...form, location: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="onsite">Onsite</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input placeholder="Salary" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
                <Select value={form.payroll_terms} onValueChange={(v) => setForm({ ...form, payroll_terms: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="one-time">One-time</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Positions" value={form.positions} onChange={(e) => setForm({ ...form, positions: e.target.value })} />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
              <Button onClick={handleCreateTask} disabled={creating}>{creating ? "Posting..." : "Post Task"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Task Detail Modal */}
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
  {selectedTask && (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold">
          {selectedTask.title}
        </DialogTitle>
        <DialogDescription>
          {selectedTask.short_description}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 mt-4">

        {/* FULL BRIEF */}
        <div>
          <h4 className="font-semibold text-foreground mb-2">Full Brief</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {selectedTask.full_brief}
          </p>
        </div>

        {/* REQUIREMENTS GRID */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-muted/50 rounded-xl">
            <p className="text-xs text-muted-foreground">Duration (weeks)</p>
            <p className="font-medium">{selectedTask.duration_weeks ?? "-"}</p>
          </div>

          <div className="p-3 bg-muted/50 rounded-xl">
            <p className="text-xs text-muted-foreground">Weekly Hours</p>
            <p className="font-medium">{selectedTask.weekly_hours ?? "-"}</p>
          </div>

          <div className="p-3 bg-muted/50 rounded-xl">
            <p className="text-xs text-muted-foreground">Start Date</p>
            <p className="font-medium">{selectedTask.start_date ?? "-"}</p>
          </div>

          <div className="p-3 bg-muted/50 rounded-xl">
            <p className="text-xs text-muted-foreground">Location</p>
            <p className="font-medium">
              {selectedTask.location === "remote"
                ? "Remote"
                : selectedTask.city || "Onsite"}
            </p>
          </div>

          <div className="p-3 bg-muted/50 rounded-xl">
            <p className="text-xs text-muted-foreground">Students Needed</p>
            <p className="font-medium">{selectedTask.positions}</p>
          </div>

          <div className="p-3 bg-muted/50 rounded-xl">
            <p className="text-xs text-muted-foreground">Positions Filled</p>
            <p className="font-medium">{selectedTask.positions_filled}</p>
          </div>

        </div>

        {/* SKILLS */}
        <div>
          <h4 className="font-semibold mb-2">Required Skills</h4>
          <div className="flex flex-wrap gap-2">
            {(selectedTask.skills || []).map((skill: string) => (
              <span
                key={skill}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* COMPENSATION */}
        <div>
          <h4 className="font-semibold mb-2">Compensation</h4>
          <div className="grid grid-cols-2 gap-4">

            <div className="p-3 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground">Salary / Budget</p>
              <p className="font-medium">
                {selectedTask.salary ? `₹${selectedTask.salary}` : "-"}
              </p>
            </div>

            <div className="p-3 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground">Payment Terms</p>
              <p className="font-medium capitalize">
                {(selectedTask.payroll_terms || "-").replace("-", " ")}
              </p>
            </div>

          </div>
        </div>

        {/* CONFIDENTIAL / NDA */}
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Confidential / NDA Required: </span>
            {selectedTask.confidential ? "Yes" : "No"}
          </p>
        </div>

        {/* ATTACHMENTS */}
        {selectedTask.attachment_urls && selectedTask.attachment_urls.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Attachments</h4>
            <div className="space-y-2">
              {selectedTask.attachment_urls.map((url: string, i: number) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  className="text-primary underline text-sm"
                >
                  Attachment {i + 1}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )}
</DialogContent>

        </Dialog>
      </div>

<Dialog open={!!taskToDelete} onOpenChange={() => setTaskToDelete(null)}>
  <DialogContent className="max-w-sm">
    <DialogHeader>
      <DialogTitle>Delete Task?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. The task will be permanently removed.
      </DialogDescription>
    </DialogHeader>

    <DialogFooter className="mt-4 flex justify-end gap-3">
      <Button variant="outline" onClick={() => setTaskToDelete(null)}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={handleDeleteTask}>
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>



    </DashboardLayout>



  );
}
