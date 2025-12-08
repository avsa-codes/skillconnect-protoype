"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BadgeStatus } from "@/components/ui/badge-status"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { mockReplacements, mockStudents, mockTasks } from "@/lib/mock-data"
import { RefreshCw, Clock, Users, Send, CheckCircle, AlertTriangle } from "lucide-react"

export default function AdminReplacementsPage() {
  const [selectedReplacement, setSelectedReplacement] = useState<(typeof mockReplacements)[0] | null>(null)
  const [showShortlist, setShowShortlist] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [showSuccess, setShowSuccess] = useState(false)

  // Calculate time remaining until deadline
  const getTimeRemaining = (deadline: string) => {
    const diff = new Date(deadline).getTime() - new Date().getTime()
    if (diff < 0) return "Overdue"
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 24) return `${hours}h remaining`
    return `${Math.floor(hours / 24)}d ${hours % 24}h remaining`
  }

  const task = selectedReplacement ? mockTasks.find((t) => t.id === selectedReplacement.taskId) : null

  const getMatchingStudents = () => {
    if (!task) return []
    return mockStudents
      .filter((student) => student.skills.some((skill) => task.skills.includes(skill)))
      .map((student) => ({
        ...student,
        matchScore: Math.floor(Math.random() * 30) + 70,
      }))
  }

  const handleSendReplacement = () => {
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      setShowShortlist(false)
      setSelectedReplacement(null)
      setSelectedStudents([])
    }, 2000)
  }

  const pendingCount = mockReplacements.filter((r) => r.status === "pending").length

  return (
    <DashboardLayout allowedRoles={["admin", "super_admin"]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Replacements</h1>
          <p className="text-muted-foreground">Handle no-shows and trigger replacement offers</p>
        </div>

        {/* SLA Warning */}
        {pendingCount > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-red-800">
                    {pendingCount} Replacement{pendingCount > 1 ? "s" : ""} Pending
                  </p>
                  <p className="text-sm text-red-700">SLA: Replacements must be sent within 48 hours of the request</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Replacement Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Replacement Requests</CardTitle>
            <CardDescription>Students who became unavailable and need replacement</CardDescription>
          </CardHeader>
          <CardContent>
            {mockReplacements.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <RefreshCw className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No replacement requests</p>
                <p className="text-sm">All tasks are running smoothly</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mockReplacements.map((replacement) => {
                  const timeRemaining = getTimeRemaining(replacement.deadline)
                  const isOverdue = timeRemaining === "Overdue"

                  return (
                    <div
                      key={replacement.id}
                      className={`p-4 rounded-2xl border ${
                        isOverdue
                          ? "bg-red-50 border-red-200"
                          : replacement.status === "pending"
                            ? "bg-amber-50 border-amber-200"
                            : "bg-muted/50 border-border"
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-foreground">{replacement.taskTitle}</h3>
                            <BadgeStatus status={replacement.status} />
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Original student: <span className="font-medium">{replacement.originalStudentName}</span>
                          </p>
                          <p className="text-sm text-muted-foreground mb-2">Reason: {replacement.reason}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span
                              className={`flex items-center gap-1 ${isOverdue ? "text-red-600" : "text-amber-600"}`}
                            >
                              <Clock className="h-4 w-4" />
                              {timeRemaining}
                            </span>
                            <span className="text-muted-foreground">
                              Created: {new Date(replacement.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {replacement.status === "pending" && (
                            <Button
                              onClick={() => {
                                setSelectedReplacement(replacement)
                                setShowShortlist(true)
                              }}
                            >
                              <Users className="mr-2 h-4 w-4" />
                              View Shortlist
                            </Button>
                          )}
                          {replacement.status !== "pending" && (
                            <Button variant="outline" disabled>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              {replacement.status === "replacement_sent" ? "Offer Sent" : "Completed"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shortlist Modal */}
        <Dialog open={showShortlist} onOpenChange={setShowShortlist}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            {selectedReplacement && task && (
              <>
                {showSuccess ? (
                  <div className="py-12 text-center">
                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Replacement Offer Sent!</h3>
                    <p className="text-muted-foreground">
                      {selectedStudents.length} replacement offer(s) have been sent.
                    </p>
                  </div>
                ) : (
                  <>
                    <DialogHeader>
                      <DialogTitle>Select Replacement</DialogTitle>
                      <DialogDescription>
                        Choose a replacement student for &quot;{selectedReplacement.taskTitle}&quot;
                      </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 mb-4">
                        <div className="flex items-center gap-2 text-amber-800">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">SLA Deadline:</span>
                          <span>{new Date(selectedReplacement.deadline).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {getMatchingStudents().map((student) => (
                          <div
                            key={student.id}
                            className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-colors ${
                              selectedStudents.includes(student.id)
                                ? "bg-primary/5 border-primary"
                                : "bg-muted/50 border-border hover:border-primary/30"
                            }`}
                            onClick={() => {
                              setSelectedStudents((prev) =>
                                prev.includes(student.id)
                                  ? prev.filter((id) => id !== student.id)
                                  : [...prev, student.id],
                              )
                            }}
                          >
                            <Checkbox checked={selectedStudents.includes(student.id)} />
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                              {student.fullName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground">{student.fullName}</p>
                              <p className="text-sm text-muted-foreground">{student.college}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {student.skills.map((skill) => (
                                  <span
                                    key={skill}
                                    className={`px-2 py-0.5 text-xs rounded ${
                                      task.skills.includes(skill)
                                        ? "bg-green-100 text-green-700"
                                        : "bg-muted text-muted-foreground"
                                    }`}
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-foreground">{student.rating} ★</div>
                              <div className="mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                                {student.matchScore}% match
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowShortlist(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSendReplacement} disabled={selectedStudents.length === 0}>
                        <Send className="mr-2 h-4 w-4" />
                        Send Replacement Offer ({selectedStudents.length})
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
  )
}
