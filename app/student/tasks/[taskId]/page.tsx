"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BadgeStatus } from "@/components/ui/badge-status";

import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Users,
  FileText,
  Download
} from "lucide-react";

export default function TaskDetailsPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const { taskId } = useParams();

  const [task, setTask] = useState<any>(null);
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!taskId) return;

    async function loadTask() {
      setLoading(true);

      // 1️⃣ Fetch task
      const { data: taskData } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", taskId)
        .single();

      if (!taskData) {
        setLoading(false);
        return;
      }

      setTask(taskData);

      // 2️⃣ Fetch organization
      const { data: orgData } = await supabase
        .from("organization_profiles")
        .select("company_name, description, logo_url, city, industry")
        .eq("user_id", taskData.org_id)
        .single();

      setOrg(orgData);

      setLoading(false);
    }

    loadTask();
  }, [taskId]);

  if (loading || !task) {
    return (
      <DashboardLayout allowedRoles={["student"]}>
        <div className="p-10 text-center text-muted-foreground">Loading task...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRoles={["student"]}>
      <div className="space-y-6 max-w-4xl">

        {/* BACK BUTTON */}
        <Button variant="ghost" asChild className="rounded-xl">
          <span onClick={() => router.push("/student/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </span>
        </Button>

        {/* HEADER */}
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">{task.title}</h1>
                  <BadgeStatus status={task.status} />
                </div>

                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <Building2 className="h-4 w-4" />
                  <span>{org?.company_name || "Organization"}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {Array.isArray(task.skills) &&
                    task.skills.map((skill: string) => (
                      <span key={skill} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                        {skill}
                      </span>
                    ))}
                </div>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-primary">₹{task.salary}</p>
                <p className="text-sm text-muted-foreground">{task.payroll_terms}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DETAILS GRID */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Task Details */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Task Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Start Date */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">{task.start_date ? new Date(task.start_date).toLocaleDateString() : "-"}</p>
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration & Hours</p>
                  <p className="font-medium">
                    {task.duration_weeks} weeks • {task.weekly_hours} hrs/week
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium capitalize">
                    {task.location}
                    {task.city ? ` - ${task.city}` : ""}
                  </p>
                </div>
              </div>

              {/* Positions */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Positions</p>
                  <p className="font-medium">
                    {task.positions_filled}/{task.positions} filled
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Organization Info */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Organization</CardTitle>
            </CardHeader>
            <CardContent>

              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{org?.company_name}</p>
                  <p className="text-sm text-muted-foreground">{org?.industry || "Organization"}</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {org?.description || "No description provided."}
              </p>

            </CardContent>
          </Card>
        </div>


{/*Feedback Section*/ }

{task.status === "completed" && (
  <Card className="mt-6 border-green-200 bg-green-50">
    <CardHeader>
      <CardTitle>Your Performance</CardTitle>
      <CardDescription>Feedback from the Organization</CardDescription>
    </CardHeader>

    <CardContent className="space-y-3">
      <div>
        <p className="text-sm text-muted-foreground">Rating</p>
        <p className="font-semibold text-lg">⭐ {task.org_rating}/5</p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">Feedback</p>
        <p>{task.org_feedback || "No feedback available"}</p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">Completed On</p>
        <p>{new Date(task.completed_at).toLocaleDateString()}</p>
      </div>
    </CardContent>
  </Card>
)}





        {/* FULL BRIEF */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Task Brief</CardTitle>
            <CardDescription>Full description of the task</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{task.full_brief}</p>
          </CardContent>
        </Card>

        {/* ATTACHMENTS */}
        {Array.isArray(task.attachment_urls) && task.attachment_urls.length > 0 && (
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Attachments</CardTitle>
              <CardDescription>Files provided by the organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {task.attachment_urls.map((url: string, i: number) => (
                <div key={i} className="flex items-center justify-between bg-muted/50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                    <p className="font-medium">Attachment {i + 1}</p>
                  </div>

                  <a href={url} target="_blank">
                    <Button variant="outline" size="sm" className="rounded-xl">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </a>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

      </div>
    </DashboardLayout>
  );
}
