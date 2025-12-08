"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BadgeStatus } from "@/components/ui/badge-status"
import { StatCard } from "@/components/ui/stat-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { mockInvoices, mockStudents } from "@/lib/mock-data"
import { Search, Download, Wallet, TrendingUp, AlertCircle, Send, CheckCircle, RotateCcw } from "lucide-react"

export default function AdminPaymentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [showPayoutSuccess, setShowPayoutSuccess] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<(typeof mockStudents)[0] | null>(null)
  const [payoutAmount, setPayoutAmount] = useState("")

  // Calculate totals
  const totalOutstanding = mockInvoices
    .filter((i) => i.status === "pending" || i.status === "overdue")
    .reduce((sum, i) => sum + i.amount, 0)
  const totalPaid = mockInvoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.amount, 0)
  const totalWalletBalances = mockStudents.reduce((sum, s) => sum + s.walletBalance, 0)

  const filteredInvoices = mockInvoices.filter((invoice) => {
    const matchesSearch = invoice.taskTitle.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleTriggerPayout = () => {
    setShowPayoutSuccess(true)
    setTimeout(() => {
      setShowPayoutSuccess(false)
      setShowPayoutModal(false)
      setSelectedStudent(null)
      setPayoutAmount("")
    }, 2000)
  }

  return (
    <DashboardLayout allowedRoles={["admin", "super_admin"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Payments</h1>
            <p className="text-muted-foreground">Manage invoices, payouts, and wallet balances</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button onClick={() => setShowPayoutModal(true)}>
              <Send className="mr-2 h-4 w-4" />
              Trigger Payout
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Outstanding"
            value={`₹${totalOutstanding.toLocaleString()}`}
            icon={AlertCircle}
            className={totalOutstanding > 0 ? "border-amber-200 bg-amber-50" : ""}
          />
          <StatCard
            title="Total Paid"
            value={`₹${totalPaid.toLocaleString()}`}
            icon={CheckCircle}
            className="border-green-200 bg-green-50"
          />
          <StatCard title="Student Wallets" value={`₹${totalWalletBalances.toLocaleString()}`} icon={Wallet} />
          <StatCard
            title="Platform Fee (10%)"
            value={`₹${Math.round(totalPaid * 0.1).toLocaleString()}`}
            icon={TrendingUp}
          />
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by task..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Invoices</CardTitle>
            <CardDescription>{filteredInvoices.length} invoice(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Fee (10%)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-sm">{invoice.id.toUpperCase()}</TableCell>
                      <TableCell className="font-medium">{invoice.taskTitle}</TableCell>
                      <TableCell>₹{invoice.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">
                        ₹{Math.round(invoice.amount * 0.1).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <BadgeStatus status={invoice.status} />
                      </TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {invoice.status !== "paid" && (
                            <Button variant="ghost" size="sm">
                              Mark Paid
                            </Button>
                          )}
                          {invoice.status === "paid" && (
                            <Button variant="ghost" size="sm">
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Student Wallet Balances */}
        <Card>
          <CardHeader>
            <CardTitle>Student Wallet Balances</CardTitle>
            <CardDescription>Current balances ready for payout</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>SkillConnect ID</TableHead>
                    <TableHead>Tasks Completed</TableHead>
                    <TableHead>Wallet Balance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                            {student.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{student.fullName}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{student.skillConnectId}</TableCell>
                      <TableCell>{student.tasksCompleted}</TableCell>
                      <TableCell className="font-semibold">₹{student.walletBalance.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStudent(student)
                            setPayoutAmount(student.walletBalance.toString())
                            setShowPayoutModal(true)
                          }}
                          disabled={student.walletBalance === 0}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Payout
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Payout Modal */}
        <Dialog open={showPayoutModal} onOpenChange={setShowPayoutModal}>
          <DialogContent>
            {showPayoutSuccess ? (
              <div className="py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Payout Triggered!</h3>
                <p className="text-muted-foreground">
                  The payout of ₹{Number.parseInt(payoutAmount).toLocaleString()} has been initiated.
                </p>
              </div>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Trigger Payout</DialogTitle>
                  <DialogDescription>
                    {selectedStudent
                      ? `Process payout for ${selectedStudent.fullName}`
                      : "Select a student and enter payout amount"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {!selectedStudent && (
                    <div>
                      <Label>Select Student</Label>
                      <Select
                        onValueChange={(v) => {
                          const student = mockStudents.find((s) => s.id === v)
                          setSelectedStudent(student || null)
                          if (student) setPayoutAmount(student.walletBalance.toString())
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select a student" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockStudents
                            .filter((s) => s.walletBalance > 0)
                            .map((student) => (
                              <SelectItem key={student.id} value={student.id}>
                                {student.fullName} (₹{student.walletBalance.toLocaleString()})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedStudent && (
                    <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {selectedStudent.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{selectedStudent.fullName}</p>
                          <p className="text-sm text-muted-foreground">{selectedStudent.skillConnectId}</p>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Available balance: </span>
                        <span className="font-semibold text-foreground">
                          ₹{selectedStudent.walletBalance.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>Payout Amount</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                      <Input
                        type="number"
                        value={payoutAmount}
                        onChange={(e) => setPayoutAmount(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Notes (optional)</Label>
                    <Input placeholder="Add any notes..." className="mt-1" />
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-sm text-amber-800">
                      This is a UI placeholder. Actual payouts will be processed via Razorpay/Stripe integration.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPayoutModal(false)
                      setSelectedStudent(null)
                      setPayoutAmount("")
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleTriggerPayout} disabled={!selectedStudent || !payoutAmount}>
                    Confirm Payout
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
