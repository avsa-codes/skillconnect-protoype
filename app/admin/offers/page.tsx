// app/admin/offers/page.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BadgeStatus } from "@/components/ui/badge-status"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Search,
  Eye,
  Send,
  XCircle,
  Calendar,
  CheckCircle,
  Plus,
} from "lucide-react"
import { toast } from "sonner"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser"

type OfferRow = {
  id: string
  task_id: string
  student_id: string
  org_id: string
  status: string
  salary: number | null
  start_date: string | null
  sent_at: string | null
  responded_at: string | null
  created_at: string | null
}

type StudentRow = {
  user_id: string
  full_name: string | null
  email: string | null
  skillconnect_id: string | null
}

type OrgRow = {
  user_id: string
  company_name: string | null
}

type TaskRow = {
  id: string
  org_id: string
  title: string | null
  short_description: string | null
  salary: number | null
  payroll_terms: string | null
}

type OfferWithJoins = OfferRow & {
  taskTitle: string
  studentName: string
  studentEmail: string
  studentSCId: string
  orgName: string
}

export default function AdminOffersPage() {
  const supabase = createSupabaseBrowserClient()

  // raw data
  const [offers, setOffers] = useState<OfferWithJoins[]>([])
  const [students, setStudents] = useState<StudentRow[]>([])
  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [orgs, setOrgs] = useState<OrgRow[]>([])
  const [loading, setLoading] = useState(true)

  // filters / UI
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // detail modal
  const [selectedOffer, setSelectedOffer] = useState<OfferWithJoins | null>(
    null,
  )
  const [showResendSuccess, setShowResendSuccess] = useState(false)

  // create-offer modal
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState({
    studentId: "",
    taskId: "",
    salary: "",
    startDate: "",
  })

  // --------------------------------------------------
  // Load data from Supabase
  // --------------------------------------------------
  const loadData = async () => {
    try {
      setLoading(true)

      // fetch in parallel
      const [
        { data: studentData, error: studentErr },
        { data: taskData, error: taskErr },
        { data: orgData, error: orgErr },
        { data: offerData, error: offerErr },
      ] = await Promise.all([
        supabase
          .from("student_profiles")
          .select("user_id, full_name, email, skillconnect_id")
          .order("created_at", { ascending: false }),
        supabase
          .from("tasks")
          .select("id, org_id, title, short_description, salary, payroll_terms")
          .order("created_at", { ascending: false }),
        supabase
          .from("organization_profiles")
          .select("user_id, company_name"),
        supabase
          .from("offers")
          .select("*")
          .order("created_at", { ascending: false }),
      ])

      if (studentErr) console.error("students error", studentErr)
      if (taskErr) console.error("tasks error", taskErr)
      if (orgErr) console.error("orgs error", orgErr)
      if (offerErr) console.error("offers error", offerErr)

      const studentsArr = studentData || []
      const tasksArr = taskData || []
      const orgsArr = orgData || []
      const offersArr = (offerData || []) as OfferRow[]

      setStudents(studentsArr)
      setTasks(tasksArr)
      setOrgs(orgsArr)

      // maps for joins
      const studentMap: Record<string, StudentRow> = {}
      studentsArr.forEach((s) => {
        studentMap[s.user_id] = s
      })

      const taskMap: Record<string, TaskRow> = {}
      tasksArr.forEach((t) => {
        taskMap[t.id] = t
      })

      const orgMap: Record<string, OrgRow> = {}
      orgsArr.forEach((o) => {
        orgMap[o.user_id] = o
      })

      const joined: OfferWithJoins[] = offersArr.map((o) => {
        const student = studentMap[o.student_id]
        const task = taskMap[o.task_id]
        const org = orgMap[o.org_id]

        return {
          ...o,
          taskTitle: task?.title || "Untitled task",
          studentName: student?.full_name || "Unknown student",
          studentEmail: student?.email || "",
          studentSCId: student?.skillconnect_id || "",
          orgName: org?.company_name || "Unknown org",
        }
      })

      setOffers(joined)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --------------------------------------------------
  // Derived values
  // --------------------------------------------------
  const filteredOffers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return offers.filter((offer) => {
      const matchesSearch =
        !q ||
        offer.taskTitle.toLowerCase().includes(q) ||
        offer.studentName.toLowerCase().includes(q) ||
        offer.orgName.toLowerCase().includes(q) ||
        offer.studentSCId.toLowerCase().includes(q)

      const matchesStatus =
        statusFilter === "all" || offer.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [offers, searchQuery, statusFilter])

  const stats = useMemo(() => {
    return {
      total: offers.length,
      pending: offers.filter((o) => o.status === "sent").length,
      accepted: offers.filter((o) => o.status === "accepted").length,
      declinedExpired: offers.filter(
        (o) => o.status === "declined" || o.status === "expired",
      ).length,
    }
  }, [offers])

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === createForm.taskId) || null,
    [tasks, createForm.taskId],
  )

  const selectedStudent = useMemo(
    () => students.find((s) => s.user_id === createForm.studentId) || null,
    [students, createForm.studentId],
  )

  // --------------------------------------------------
  // Create offer
  // --------------------------------------------------
  const resetCreateForm = () => {
    setCreateForm({
      studentId: "",
      taskId: "",
      salary: "",
      startDate: "",
    })
  }

 const handleCreateOffer = async () => {
  if (!createForm.studentId || !createForm.taskId) {
    toast.error("Select a student and a task")
    return
  }

  if (!createForm.salary) {
    toast.error("Enter a salary")
    return
  }

  if (!createForm.startDate) {
    toast.error("Select a start date")
    return
  }

  const task = tasks.find((t) => t.id === createForm.taskId)
  if (!task) {
    toast.error("Task not found")
    return
  }

  setCreating(true)
  try {
    const res = await fetch("/api/offers/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
  taskId: createForm.taskId,
  studentId: createForm.studentId, // <-- must be user_id
  orgId: task.org_id,
  salary: Number(createForm.salary),
  startDate: createForm.startDate,
}),

    })

    if (!res.ok) {
      const text = await res.text()
      console.error("Create offer failed:", text)
      toast.error("Failed to create offer")
      return
    }

    toast.success("Offer sent to student")
    setShowCreate(false)
    resetCreateForm()
    await loadData()
  } catch (err) {
    console.error("Create offer error:", err)
    toast.error("Unexpected error creating offer")
  } finally {
    setCreating(false)
  }
}

  // --------------------------------------------------
  // Resend (UI only for now)
  // --------------------------------------------------
  const handleResend = () => {
    setShowResendSuccess(true)
    setTimeout(() => {
      setShowResendSuccess(false)
      setSelectedOffer(null)
    }, 2000)
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  return (
    <DashboardLayout allowedRoles={["admin", "super_admin"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Offers</h1>
            <p className="text-muted-foreground">
              Track all sent offers and their status
            </p>
          </div>

          <Button onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Offer
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-foreground">
                {stats.total}
              </p>
              <p className="text-sm text-muted-foreground">Total Offers</p>
            </CardContent>
          </Card>
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-amber-700">
                {stats.pending}
              </p>
              <p className="text-sm text-amber-600">Pending Response</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-green-700">
                {stats.accepted}
              </p>
              <p className="text-sm text-green-600">Accepted</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-foreground">
                {stats.declinedExpired}
              </p>
              <p className="text-sm text-muted-foreground">Declined/Expired</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by task, student, organization, or SC-ID..."
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
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Offers Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Offers</CardTitle>
            <CardDescription>
              {loading
                ? "Loading offers..."
                : `${filteredOffers.length} offer(s) found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Offer ID</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!loading && filteredOffers.length === 0) && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No offers found
                      </TableCell>
                    </TableRow>
                  )}

                  {filteredOffers.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell className="font-mono text-xs">
                        {offer.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {offer.taskTitle}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{offer.studentName}</span>
                          {offer.studentSCId && (
                            <span className="text-xs text-muted-foreground">
                              {offer.studentSCId}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{offer.orgName}</TableCell>
                      <TableCell>
                        {offer.salary != null ? `₹${offer.salary}` : "-"}
                      </TableCell>
                      <TableCell>
                        <BadgeStatus status={offer.status} />
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {offer.sent_at
                            ? new Date(offer.sent_at).toLocaleDateString()
                            : "-"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedOffer(offer)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Offer Detail Modal */}
        <Dialog
          open={!!selectedOffer}
          onOpenChange={() => setSelectedOffer(null)}
        >
          <DialogContent>
            {selectedOffer && (
              <>
                {showResendSuccess ? (
                  <div className="py-12 text-center">
                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Offer Resent!
                    </h3>
                    <p className="text-muted-foreground">
                      The offer has been resent to {selectedOffer.studentName}.
                    </p>
                  </div>
                ) : (
                  <>
                    <DialogHeader>
                      <div className="flex items-center gap-3">
                        <DialogTitle>Offer Details</DialogTitle>
                        <BadgeStatus status={selectedOffer.status} />
                      </div>
                      <DialogDescription className="font-mono text-xs">
                        {selectedOffer.id}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                        <h4 className="font-medium text-foreground mb-3">
                          Task Information
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Task
                            </p>
                            <p className="font-medium text-foreground">
                              {selectedOffer.taskTitle}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Organization
                            </p>
                            <p className="font-medium text-foreground">
                              {selectedOffer.orgName}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Salary
                            </p>
                            <p className="font-medium text-foreground">
                              {selectedOffer.salary != null
                                ? `₹${selectedOffer.salary}`
                                : "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Start Date
                            </p>
                            <p className="font-medium text-foreground">
                              {selectedOffer.start_date
                                ? new Date(
                                    selectedOffer.start_date,
                                  ).toLocaleDateString()
                                : "-"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                        <h4 className="font-medium text-foreground mb-3">
                          Student
                        </h4>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            {selectedOffer.studentName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {selectedOffer.studentName}
                            </p>
                            {selectedOffer.studentSCId && (
                              <p className="text-xs text-muted-foreground">
                                {selectedOffer.studentSCId}
                              </p>
                            )}
                            {selectedOffer.studentEmail && (
                              <p className="text-xs text-muted-foreground">
                                {selectedOffer.studentEmail}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                        <h4 className="font-medium text-foreground mb-3">
                          Timeline
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Send className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground">Sent:</span>
                            <span className="text-foreground">
                              {selectedOffer.sent_at
                                ? new Date(
                                    selectedOffer.sent_at,
                                  ).toLocaleString()
                                : "-"}
                            </span>
                          </div>
                          {selectedOffer.responded_at && (
                            <div className="flex items-center gap-2 text-sm">
                              {selectedOffer.status === "accepted" ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span className="text-muted-foreground">
                                Responded:
                              </span>
                              <span className="text-foreground">
                                {new Date(
                                  selectedOffer.responded_at,
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedOffer(null)}
                      >
                        Close
                      </Button>
                      {selectedOffer.status === "sent" && (
                        <>
                          <Button
                            variant="outline"
                            className="text-destructive hover:text-destructive bg-transparent"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Offer
                          </Button>
                          <Button onClick={handleResend}>
                            <Send className="mr-2 h-4 w-4" />
                            Resend Offer
                          </Button>
                        </>
                      )}
                    </DialogFooter>
                  </>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Offer Modal */}
        <Dialog open={showCreate} onOpenChange={(open) => {
          setShowCreate(open)
          if (!open) resetCreateForm()
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Offer</DialogTitle>
              <DialogDescription>
                Send an offer to a student for a specific task. The offer will
                expire in 24 hours.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Student */}
              <div className="space-y-1">
                <p className="text-sm font-medium">Student *</p>
                <Select
                  value={createForm.studentId}
                  onValueChange={(v) =>
                    setCreateForm((prev) => ({ ...prev, studentId: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.user_id} value={s.user_id}>
                        {s.full_name || "Unnamed"}{" "}
                        {s.skillconnect_id
                          ? `(${s.skillconnect_id})`
                          : s.email
                          ? `– ${s.email}`
                          : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Task */}
              <div className="space-y-1">
                <p className="text-sm font-medium">Task *</p>
                <Select
                  value={createForm.taskId}
                  onValueChange={(v) => {
                    const task = tasks.find((t) => t.id === v)
                    setCreateForm((prev) => ({
                      ...prev,
                      taskId: v,
                      salary:
                        prev.salary || (task?.salary != null
                          ? String(task.salary)
                          : ""),
                    }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select task" />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.title || "Untitled task"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTask && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedTask.short_description || "No short description"}
                  </p>
                )}
              </div>

              {/* Salary + start date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Salary *</p>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      ₹
                    </span>
                    <Input
                      value={createForm.salary}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          salary: e.target.value,
                        }))
                      }
                      className="pl-8"
                      placeholder="e.g., 10000"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Start Date *</p>
                  <Input
                    type="date"
                    value={createForm.startDate}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                By sending this offer, the student will see the role name, a
                short description, total salary, and that the offer expires in
                24 hours.
              </p>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreate(false)
                  resetCreateForm()
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateOffer} disabled={creating}>
                {creating ? "Sending..." : "Send Offer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
