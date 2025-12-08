"use client"

import { use } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BadgeStatus } from "@/components/ui/badge-status"
import { mockTasks } from "@/lib/mock-data"
import { ArrowLeft, Calendar, Clock, MapPin, Building2, Users, FileText, Download } from "lucide-react"

export default function TaskDetailPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = use(params)
  const task = mockTasks.find((t) => t.id === taskId) || mockTasks[0]

  return (
    <DashboardLayout allowedRoles={["student"]}>
      <div className="space-y-6 max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" asChild className="rounded-xl">
          <Link href="/student/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Task Header */}
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
                  <span>{task.organizationName}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {task.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{task.salary}</p>
                <p className="text-sm text-muted-foreground">{task.payrollTerms} payment</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Details Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Details */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Task Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">{new Date(task.startDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration & Hours</p>
                  <p className="font-medium">
                    {task.duration} • {task.weeklyHours} hrs/week
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium capitalize">
                    {task.location}
                    {task.city && ` - ${task.city}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Positions</p>
                  <p className="font-medium">
                    {task.positionsFilled}/{task.positions} filled
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organization */}
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
                  <p className="font-semibold">{task.organizationName}</p>
                  <p className="text-sm text-muted-foreground">Technology Startup</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                A fast-growing startup focused on innovative tech solutions. They have posted 5 tasks on SkillConnect
                with a 4.8 average rating.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Full Brief */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Task Brief</CardTitle>
            <CardDescription>Full description of what you'll be working on</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{task.fullBrief}</p>

            {task.confidential && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-sm text-yellow-800">
                  <strong>Confidential:</strong> This task requires you to sign an NDA before starting.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attachments */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Attachments</CardTitle>
            <CardDescription>Files and resources for this task</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
              <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Project_Brief.pdf</p>
                <p className="text-sm text-muted-foreground">245 KB</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl bg-transparent">
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
