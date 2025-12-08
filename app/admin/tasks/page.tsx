// app/admin/tasks/page.tsx
"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BadgeStatus } from "@/components/ui/badge-status";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Eye, Users, Send, Calendar, CheckCircle } from "lucide-react";
import Link from "next/link";
import AdminRoute from "@/components/admin/AdminRoute";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function AdminTasksPage() {
  const supabase = createSupabaseBrowserClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // fetched data
  const [tasks, setTasks] = useState<any[]>([]);
  const [orgMap, setOrgMap] = useState<Record<string, string>>({}); // org_id -> company_name
  const [students, setStudents] = useState<any[]>([]);

  // UI state
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [showShortlist, setShowShortlist] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [showOfferSent, setShowOfferSent] = useState(false);

  // Load tasks, organizations, students
useEffect(() => {
  let mounted = true;

  async function loadData() {
    setLoading(true);

    try {
      // 1) Load organizations FIRST
      const { data: orgs } = await supabase
        .from("organization_profiles")
        .select("user_id, company_name");

      if (!mounted) return;

      // Build a clean map: { org_user_id: name }
      const orgMapTemp: Record<string, string> = {};
      orgs?.forEach((o: any) => {
        orgMapTemp[o.user_id] = o.company_name ?? "Unknown Organization";
      });

      setOrgMap(orgMapTemp);

      // 2) Load tasks AFTER orgMap exists
      const { data: rawTasks } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (!mounted) return;

      // 3) Attach organization names + normalize skills
      const formatted = (rawTasks || []).map((t: any) => ({
        ...t,
        organizationName: orgMapTemp[t.org_id] ?? "Unknown Organization",

        skills: (() => {
  const raw = t.skills;

  if (!raw) return [];

  // Case 1: Already array
  if (Array.isArray(raw)) return raw;

  // Case 2: Postgres array string "{React,Node,UI}"
  if (typeof raw === "string" && raw.startsWith("{") && raw.endsWith("}")) {
    return raw
      .slice(1, -1) // remove { }
      .split(",")
      .map((s: string) => s.trim().replace(/"/g, ""));
  }

  // Case 3: JSON-like string '["React","Node"]'
  if (typeof raw === "string" && raw.startsWith("[") && raw.endsWith("]")) {
    try {
      return JSON.parse(raw);
    } catch {
      /* ignore parsing error */
    }
  }

  // Case 4: Plain comma separated "React, Node, UI"
  if (typeof raw === "string") {
    return raw.split(",").map((s: string) => s.trim());
  }

  return [];
})(),

      }));

      setTasks(formatted);

      // 4) Load students
      const { data: studs } = await supabase
        .from("student_profiles")
        .select("user_id, full_name, skills, rating, availability, college");

      if (!mounted) return;

      const normalizedStudents = studs?.map((s: any) => ({
        id: s.user_id,
        fullName: s.full_name,
        skills: Array.isArray(s.skills) ? s.skills : [],
        rating: s.rating ?? 0,
        availability: s.availability ?? "",
        college: s.college ?? "",
      }));

      setStudents(normalizedStudents || []);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      if (mounted) setLoading(false);
    }
  }

  loadData();
  return () => {
    mounted = false;
  };
}, []);


  // Filters derived from fetched tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.organizationName ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate matching students using live students data
  const getMatchingStudents = (task: any) => {
    if (!task) return [];
    return students
      .filter((student) => {
        // match if any overlapping skill
        return student.skills?.some((s: string) => task.skills?.includes?.(s));
      })
      .map((student) => ({
        ...student,
        matchScore: Math.floor(Math.random() * 30) + 70, // simple simulated score
      }));
  };

  const handleSendOffers = async () => {
    // Very simple demo: insert offers rows for selected students (if you have offers table)
    try {
      if (selectedStudents.length === 0 || !selectedTask) return;

      const payloads = selectedStudents.map((studentId) => ({
        student_user_id: studentId,
        task_id: selectedTask.id,
        organization_user_id: selectedTask.organization_id ?? selectedTask.organization_user_id ?? null,
        status: "sent",
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from("offers").insert(payloads);
      if (error) {
        console.error("Failed to create offers:", error);
      } else {
        setShowOfferSent(true);
        setTimeout(() => {
          setShowOfferSent(false);
          setShowShortlist(false);
          setSelectedStudents([]);
        }, 1800);
      }
    } catch (err) {
      console.error("send offers error:", err);
    }
  };



  function DetailCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="p-3 bg-muted/50 rounded-xl">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground">{value ?? "-"}</p>
    </div>
  )
}


  return (


    
    <AdminRoute>
      <DashboardLayout allowedRoles={["admin", "super_admin"]}>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
            <p className="text-muted-foreground">Review and manage all tasks, shortlist candidates</p>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by task title or organization..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
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

          {/* Tasks Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Tasks</CardTitle>
              <CardDescription>{loading ? "Loading…" : `${filteredTasks.length} task(s) found`}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Positions</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {loading ? "Loading tasks…" : "No tasks found"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell>
                            <p className="font-medium text-foreground">{task.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {task.description ?? task.fullBrief ?? ""}
                            </p>
                          </TableCell>
                          <TableCell>{task.organizationName}</TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              {task.duration ?? "-"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              {task.positionsFilled ?? 0}/{task.positions ?? 1}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium">{task.salary ?? "-"}</TableCell>
                          <TableCell>
                            <BadgeStatus status={task.status ?? "pending"} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" 
                              
                               onClick={() => {
    console.log("TASK CLICKED:", task.skills, task);
    setSelectedTask(task);
  }}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              {task.status === "pending" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTask(task);
                                    setShowShortlist(true);
                                  }}
                                >
                                  <Users className="mr-2 h-4 w-4" />
                                  Shortlist
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* View Task Modal */}
          <Dialog open={!!selectedTask && !showShortlist} onOpenChange={() => setSelectedTask(null)}>
  <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
    {selectedTask && (
      <>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{selectedTask.title}</DialogTitle>
          <DialogDescription>
            {selectedTask.organizationName ?? "Unknown Organization"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">

          {/* Short Description */}
          {selectedTask.short_description && (
            <div>
              <h3 className="font-semibold text-foreground mb-1">Short Description</h3>
              <p className="text-muted-foreground">{selectedTask.short_description}</p>
            </div>
          )}

          {/* Full Brief */}
          {selectedTask.full_brief && (
            <div>
              <h3 className="font-semibold text-foreground mb-1">Full Brief</h3>
              <p className="text-muted-foreground whitespace-pre-line">{selectedTask.full_brief}</p>
            </div>
          )}

          {/* Grid of Main Details */}
          <div className="grid grid-cols-2 gap-4">

            <DetailCard label="Duration (weeks)" value={selectedTask.duration_weeks} />
            <DetailCard label="Weekly Hours" value={selectedTask.weekly_hours} />
            <DetailCard label="Start Date" value={selectedTask.start_date} />
            <DetailCard label="Location" value={selectedTask.location === "remote" ? "Remote" : selectedTask.city} />
            <DetailCard label="Salary" value={selectedTask.salary} />
            <DetailCard label="Payroll Terms" value={selectedTask.payroll_terms} />
            <DetailCard label="Positions" value={`${selectedTask.positions_filled ?? 0}/${selectedTask.positions ?? 1}`} />
            <DetailCard label="Confidential" value={selectedTask.confidential ? "Yes" : "No"} />

          </div>

          {/* Skills */}
          <div>
            <h3 className="font-semibold text-foreground mb-1">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {(selectedTask.skills || []).map((skill: string) => (
                <span key={skill} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Attachments */}
          {selectedTask.attachment_urls?.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-1">Attachments</h3>
              <ul className="list-disc ml-6 text-sm break-all">
                {selectedTask.attachment_urls.map((url: string, i: number) => (
                  <li key={i}>
                    <a href={url} target="_blank" className="text-primary underline">
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* System Info */}
          <div className="space-y-2 text-xs text-muted-foreground border-t pt-4">
            <p><b>Task ID:</b> {selectedTask.id}</p>
            <p><b>Org ID:</b> {selectedTask.org_id}</p>
            <p><b>Created At:</b> {selectedTask.created_at}</p>
            <p><b>Updated At:</b> {selectedTask.updated_at}</p>
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setSelectedTask(null)}>
            Close
          </Button>
        </DialogFooter>
      </>
    )}
  </DialogContent>
</Dialog>


          {/* Shortlist Modal */}
          <Dialog open={showShortlist} onOpenChange={setShowShortlist}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              {selectedTask && (
                <>
                  <DialogHeader>
                    <DialogTitle>Shortlist Candidates</DialogTitle>
                    <DialogDescription>
                      Select students for &quot;{selectedTask.title}&quot; ({selectedTask.positions ?? 1} position
                      {selectedTask.positions > 1 ? "s" : ""} available)
                    </DialogDescription>
                  </DialogHeader>

                  {showOfferSent ? (
                    <div className="py-12 text-center">
                      <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Offers Sent!</h3>
                      <p className="text-muted-foreground">{selectedStudents.length} offer(s) have been sent.</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 py-4">
                        {getMatchingStudents(selectedTask).map((student) => (
                          <div
                            key={student.id}
                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors cursor-pointer ${
                              selectedStudents.includes(student.id) ? "bg-primary/5 border-primary" : "bg-muted/50 border-border hover:border-primary/30"
                            }`}
                            onClick={() =>
                              setSelectedStudents((prev) =>
                                prev.includes(student.id) ? prev.filter((id) => id !== student.id) : [...prev, student.id],
                              )
                            }
                          >
                            <Checkbox checked={selectedStudents.includes(student.id)} onCheckedChange={() => {}} />
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                              {student.fullName?.charAt(0) ?? "S"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-foreground">{student.fullName}</p>
                              </div>
                              <p className="text-sm text-muted-foreground">{student.college}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {student.skills?.map((skill: string) => (
                                  <span key={skill} className={`px-2 py-0.5 text-xs rounded ${selectedTask.skills?.includes(skill) ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-foreground">{student.rating} ★</div>
                              <div className="text-xs text-muted-foreground">{student.availability} hrs/week</div>
                              <div className="mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                                {student.matchScore}% match
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowShortlist(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSendOffers} disabled={selectedStudents.length === 0}>
                          <Send className="mr-2 h-4 w-4" />
                          Send Offer{selectedStudents.length > 1 ? "s" : ""} ({selectedStudents.length})
                        </Button>
                      </DialogFooter>
                    </>
                  )}
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </AdminRoute>
  );
}

