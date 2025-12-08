"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BadgeStatus } from "@/components/ui/badge-status"
import { mockTasks, mockStudents } from "@/lib/mock-data"
import { ArrowLeft, Calendar, Clock, MapPin, Users, IndianRupee, Shield } from "lucide-react"

export default function OrgTaskDetailPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = use(params)
  const router = useRouter()

  const task = mockTasks.find((t) => t.id === taskId)
  const assignedStudents = mockStudents.slice(0, task?.positionsFilled || 0)

  if (!task) {
    return (
      <DashboardLayout allowedRoles={["organization_user", "admin", "super_admin"]}>
        <div className="text-center py-12">
          <h1 className="text-xl font-semibold text-foreground mb-2">Task not found</h1>
          <Button variant="outline" onClick={() => router.push("/org/tasks")}>
            Back to Tasks
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout allowedRoles={["organization_user", "admin", "super_admin"]}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/org/tasks")} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-foreground">{task.title}</h1>
                <BadgeStatus status={task.status} />
              </div>
              <p className="text-muted-foreground">{task.description}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Full Brief */}
            <Card>
              <CardHeader>
                <CardTitle>Task Brief</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{task.fullBrief}</p>
              </CardContent>
            </Card>

            {/* Required Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {task.skills.map((skill) => (
                    <span key={skill} className="px-4 py-2 bg-primary/10 text-primary font-medium rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Assigned Students */}
            <Card>
              <CardHeader>
                <CardTitle>Assigned Students</CardTitle>
                <CardDescription>
                  {task.positionsFilled}/{task.positions} positions filled
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assignedStudents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>No students assigned yet</p>
                    <p className="text-sm">Candidates will be shortlisted by our admin team</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignedStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center gap-4 p-4 bg-muted/50 rounded-2xl border border-border"
                      >
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                          {student.fullName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{student.fullName}</p>
                          <p className="text-sm text-muted-foreground">{student.college}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {student.skills.slice(0, 3).map((skill) => (
                              <span key={skill} className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-foreground">{student.rating} ★</div>
                          <div className="text-xs text-muted-foreground">{student.tasksCompleted} tasks done</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Task Details */}
            <Card>
              <CardHeader>
                <CardTitle>Task Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-medium text-foreground">{task.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Weekly Hours</p>
                    <p className="font-medium text-foreground">{task.weeklyHours} hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium text-foreground">{task.location === "remote" ? "Remote" : task.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <p className="font-medium text-foreground">{task.startDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compensation */}
            <Card>
              <CardHeader>
                <CardTitle>Compensation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <IndianRupee className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Budget</p>
                    <p className="font-semibold text-foreground text-lg">{task.salary}</p>
                  </div>
                </div>
                <div className="p-3 bg-muted/50 rounded-xl">
                  <p className="text-xs text-muted-foreground">Payment Schedule</p>
                  <p className="font-medium text-foreground capitalize">{task.payrollTerms.replace("-", " ")}</p>
                </div>
                {task.confidential && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <Shield className="h-4 w-4 text-amber-600" />
                    <span className="text-sm text-amber-800">NDA Required</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
