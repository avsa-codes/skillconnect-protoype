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

  // New: Student modal and completion modal states
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentProfile, setStudentProfile] = useState<any | null>(null);
  const [viewingStudentForTask, setViewingStudentForTask] = useState<any | null>(null);

  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionTask, setCompletionTask] = useState<any | null>(null);
  const [completionFeedback, setCompletionFeedback] = useState("");
  const [completionRating, setCompletionRating] = useState<number | null>(null);
  const [completing, setCompleting] = useState(false);

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
          const orgId = orgData?.user_id;
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
              // Normalize skills & assigned_students columns to arrays
              const normalized = (tasksData || []).map((t: any) => ({
                ...t,
                skills: Array.isArray(t.skills) ? t.skills : (t.skills ? t.skills.split(",").map((s: string) => s.trim()) : []),
                assigned_students: Array.isArray(t.assigned_students) ? t.assigned_students : (t.assigned_students ? [t.assigned_students] : []),
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

  // Partition tasks into active and others
  const isActiveTask = (t: any) => {
    return (
      (t.positions_filled || 0) > 0 ||
      (Array.isArray(t.assigned_students) && t.assigned_students.length > 0) ||
      t.status === "active"
    );
  };

  const activeTasks = filteredTasks.filter(isActiveTask);
  const otherTasks = filteredTasks.filter((t) => !isActiveTask(t));

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
        const normalized = { ...data, skills: Array.isArray(data.skills) ? data.skills : (data.skills ? data.skills.split(",") : []), assigned_students: Array.isArray(data.assigned_students) ? data.assigned_students : [] };
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

  async function handleViewStudent(task: any) {
    // make sure there is an assigned student (we're in single-assigned-student mode)
    const assigned = Array.isArray(task.assigned_students) && task.assigned_students.length > 0 ? task.assigned_students[0] : null;
    if (!assigned) {
      toast.error("No student assigned to this task");
      return;
    }

    setViewingStudentForTask(task);
    setShowStudentModal(true);
    setStudentProfile(null);

    // fetch student profile by user_id
    const { data, error } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", assigned)
      .maybeSingle();

    if (error) {
      console.error("Error fetching student profile:", error);
      toast.error("Failed to load student profile");
      setShowStudentModal(false);
      setViewingStudentForTask(null);
      return;
    }

    setStudentProfile(data);
  }

  function openCompletionModal(task: any) {
    setCompletionTask(task);
    setCompletionFeedback("");
    setCompletionRating(null);
    setShowCompletionModal(true);
  }

  async function submitCompletion() {
    if (!completionTask) return;
    if (completionRating == null) {
      toast.error("Please provide a rating");
      return;
    }

    setCompleting(true);
    try {
      const updates: any = {
        org_feedback: completionFeedback || null,
        org_rating: completionRating,
        status: "completed",
        completed_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", completionTask.id)
        .select()
        .single();

      if (error) {
        console.error("Error completing task:", error);
        toast.error("Failed to mark task completed");
        return;
      }

      // Normalize result
      const normalized = {
        ...data,
        skills: Array.isArray(data.skills) ? data.skills : (data.skills ? data.skills.split(",") : []),
        assigned_students: Array.isArray(data.assigned_students) ? data.assigned_students : (data.assigned_students ? [data.assigned_students] : []),
      };

      setTasks((prev) => prev.map((t) => (t.id === normalized.id ? normalized : t)));
      toast.success("Task marked as completed");
      setShowCompletionModal(false);
      setCompletionTask(null);
    } catch (err) {
      console.error("Unexpected completion error:", err);
      toast.error("Unexpected error");
    } finally {
      setCompleting(false);
    }
  }

  function mapTaskStatus(status: string) {
    switch (status) {
      case "pending":
        return "Pending Review";
      case "open":
        return "Open";
      case "active":
        return "Accepted";
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
          <div className="space-y-8">
            {/* Active Tasks Section */}
            {activeTasks.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-3">Active Tasks</h2>
                <div className="space-y-4">
                  {activeTasks.map((task) => (
<div
  key={task.id}
  className="w-full rounded-xl border bg-white px-5 py-4 shadow-sm hover:shadow-md transition-all duration-200"
>
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

    {/* LEFT SECTION */}
    <div className="flex-1 space-y-1">
      {/* Title + Status */}
      <div className="flex items-center gap-2 flex-wrap">
        <h3 className="text-base font-semibold text-gray-900">
          {task.title}
        </h3>

        <BadgeStatus status={mapTaskStatus(task.status)} />
      </div>

      {/* Meta Info Row */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Users className="h-4 w-4 text-gray-400" />
          {task.positions_filled}/{task.positions} filled
        </span>

        {task.start_date && (
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-gray-400" />
            Starts: {new Date(task.start_date).toLocaleDateString()}
          </span>
        )}

        {task.weekly_hours && (
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-gray-400" />
            {task.weekly_hours} hrs/week
          </span>
        )}

        {(task.city || task.location) && (
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-gray-400" />
            {task.location === "remote" ? "Remote" : task.city}
          </span>
        )}
      </div>

      {/* Skills */}
      {(task.skills || []).length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {task.skills.slice(0, 3).map((skill: string) => (
            <span
              key={skill}
              className="px-2 py-0.5 bg-orange-50 text-orange-600 text-xs rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>


    {/* RIGHT SIDE BUTTONS */}
    <div className="flex items-center gap-2 shrink-0">
      {/* VIEW */}
      <Button
        asChild
        variant="outline"
        size="sm"
        className="rounded-lg px-3"
      >
        <Link href={`/org/tasks/${task.id}`}>View</Link>
      </Button>

      {/* If Active → Show Student & Complete */}
      {task.status === "active" && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg px-3"
            onClick={() => handleViewStudent(task)}
          >
            Student
          </Button>

          <Button
            size="sm"
            className="rounded-lg bg-orange-500 text-white px-3 hover:bg-orange-600"
            onClick={() => openCompletionModal(task)}
          >
            Complete
          </Button>
        </>
      )}

      {/* DELETE */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTaskToDelete(task)}
        className="text-red-600 hover:bg-red-100 rounded-full"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>

  </div>
</div>


                  ))}
                </div>
              </section>
            )}

            {/* Other Tasks Section */}
    {/* Other Tasks Section */}
{otherTasks.length > 0 && (
  <section>
    <h2 className="text-lg font-semibold mb-3">Other Tasks</h2>
    <div className="space-y-4">

      {otherTasks.map((task) => (
      <div
  key={task.id}
  className="w-full rounded-xl border bg-white px-5 py-4 shadow-sm hover:shadow-md transition-all duration-200"
>
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

    {/* LEFT SECTION */}
    <div className="flex-1 space-y-1">
      {/* Title + Status */}
      <div className="flex items-center gap-2 flex-wrap">
        <h3 className="text-base font-semibold text-gray-900">
          {task.title}
        </h3>

        <BadgeStatus status={mapTaskStatus(task.status)} />
      </div>

      {/* Meta Info Row */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Users className="h-4 w-4 text-gray-400" />
          {task.positions_filled}/{task.positions} filled
        </span>

        {task.start_date && (
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-gray-400" />
            Starts: {new Date(task.start_date).toLocaleDateString()}
          </span>
        )}

        {task.weekly_hours && (
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-gray-400" />
            {task.weekly_hours} hrs/week
          </span>
        )}

        {(task.city || task.location) && (
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-gray-400" />
            {task.location === "remote" ? "Remote" : task.city}
          </span>
        )}
      </div>

      {/* Skills */}
      {(task.skills || []).length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {task.skills.slice(0, 3).map((skill: string) => (
            <span
              key={skill}
              className="px-2 py-0.5 bg-orange-50 text-orange-600 text-xs rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>


    {/* RIGHT SIDE BUTTONS */}
    <div className="flex items-center gap-2 shrink-0">
      {/* VIEW */}
      <Button
        asChild
        variant="outline"
        size="sm"
        className="rounded-lg px-3"
      >
        <Link href={`/org/tasks/${task.id}`}>View</Link>
      </Button>

      {/* If Active → Show Student & Complete */}
      {task.status === "active" && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg px-3"
            onClick={() => handleViewStudent(task)}
          >
            Student
          </Button>

          <Button
            size="sm"
            className="rounded-lg bg-orange-500 text-white px-3 hover:bg-orange-600"
            onClick={() => openCompletionModal(task)}
          >
            Complete
          </Button>
        </>
      )}

      {/* DELETE */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTaskToDelete(task)}
        className="text-red-600 hover:bg-red-100 rounded-full"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>

  </div>
</div>

      ))}

    </div>
  </section>
)}

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

        {/* Task Detail Modal (existing) */}
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
                  {/* existing modal content ... */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Full Brief</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedTask.full_brief}
                    </p>
                  </div>

                  {/* other details omitted for brevity - kept as earlier */}
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
                        {selectedTask.location === "remote" ? "Remote" : selectedTask.city || "Onsite"}
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

                  <div>
                    <h4 className="font-semibold mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {(selectedTask.skills || []).map((skill: string) => (
                        <span key={skill} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Compensation</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-muted/50 rounded-xl">
                        <p className="text-xs text-muted-foreground">Salary / Budget</p>
                        <p className="font-medium">{selectedTask.salary ? `₹${selectedTask.salary}` : "-"}</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-xl">
                        <p className="text-xs text-muted-foreground">Payment Terms</p>
                        <p className="font-medium capitalize">{(selectedTask.payroll_terms || "-").replace("-", " ")}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-sm text-amber-800">
                      <span className="font-semibold">Confidential / NDA Required: </span>
                      {selectedTask.confidential ? "Yes" : "No"}
                    </p>
                  </div>

                  {selectedTask.attachment_urls && selectedTask.attachment_urls.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Attachments</h4>
                      <div className="space-y-2">
                        {selectedTask.attachment_urls.map((url: string, i: number) => (
                          <a key={i} href={url} target="_blank" className="text-primary underline text-sm">Attachment {i + 1}</a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Student Profile Modal */}
        <Dialog open={showStudentModal} onOpenChange={() => { setShowStudentModal(false); setStudentProfile(null); setViewingStudentForTask(null); }}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Student Profile</DialogTitle>
              <DialogDescription>
                {viewingStudentForTask ? `For task: ${viewingStudentForTask.title}` : ""}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              {!studentProfile ? (
                <div className="text-center py-8 text-muted-foreground">Loading student...</div>
              ) : (
                <div>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                      {studentProfile.full_name?.charAt(0) ?? "S"}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{studentProfile.full_name}</p>
                      <p className="text-sm text-muted-foreground">{studentProfile.college}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-semibold mb-1">Bio</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{studentProfile.bio || "No bio available"}</p>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-semibold mb-1">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(studentProfile.skills) ? studentProfile.skills : (studentProfile.skills ? studentProfile.skills.split(",") : [])).map((s: string) => (
                        <span key={s} className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">{s}</span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/50 rounded-xl">
                      <p className="text-xs text-muted-foreground">Rating</p>
                      <p className="font-medium">{studentProfile.rating ?? "-"}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-xl">
                      <p className="text-xs text-muted-foreground">Tasks Completed</p>
                      <p className="font-medium">{studentProfile.tasks_completed ?? "-"}</p>
                    </div>
                  </div>

                  {studentProfile.portfolio_url && (
                    <div className="mt-3">
                      <a href={studentProfile.portfolio_url} target="_blank" className="text-primary underline text-sm">View Portfolio</a>
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowStudentModal(false); setStudentProfile(null); setViewingStudentForTask(null); }}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Completion Modal */}
        <Dialog open={showCompletionModal} onOpenChange={() => setShowCompletionModal(false)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Mark Task as Completed</DialogTitle>
              <DialogDescription>
                Provide feedback and rating for the student who completed this task.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              {completionTask && (
                <>
                  <div>
                    <p className="font-medium">{completionTask.title}</p>
                    <p className="text-sm text-muted-foreground">Students filled: {completionTask.positions_filled ?? 0}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Rating (1-5)</label>
                    <div className="flex items-center gap-2">
                      {[1,2,3,4,5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setCompletionRating(n)}
                          className={`px-3 py-1 rounded-full border ${completionRating === n ? "bg-amber-100 border-amber-300" : "bg-transparent border-muted"}`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Feedback</label>
                    <Textarea value={completionFeedback} onChange={(e) => setCompletionFeedback(e.target.value)} />
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCompletionModal(false)}>Cancel</Button>
              <Button onClick={submitCompletion} disabled={completing}>{completing ? "Saving..." : "Submit & Complete"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={!!taskToDelete} onOpenChange={() => setTaskToDelete(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Task?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. The task will be permanently removed.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setTaskToDelete(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteTask}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

