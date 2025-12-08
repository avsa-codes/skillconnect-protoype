"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { mockInvoices } from "@/lib/mock-data"
import { Search, Download, CreditCard, CheckCircle, AlertCircle, Clock } from "lucide-react"

export default function OrgInvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedInvoice, setSelectedInvoice] = useState<(typeof mockInvoices)[0] | null>(null)
  const [showPayModal, setShowPayModal] = useState(false)
  const [isPaying, setIsPaying] = useState(false)

  // Filter for this org's invoices
  const orgInvoices = mockInvoices.filter((i) => i.organizationId === "org-1")

  const filteredInvoices = orgInvoices.filter((invoice) => {
    const matchesSearch =
      invoice.taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPending = orgInvoices.filter((i) => i.status === "pending").reduce((sum, i) => sum + i.amount, 0)
  const totalPaid = orgInvoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.amount, 0)
  const totalOverdue = orgInvoices.filter((i) => i.status === "overdue").reduce((sum, i) => sum + i.amount, 0)

  const handlePay = async () => {
    setIsPaying(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsPaying(false)
    setShowPayModal(false)
    setSelectedInvoice(null)
  }

  return (
    <DashboardLayout allowedRoles={["organization_user", "admin", "super_admin"]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground">Manage your payments and billing</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Paid"
            value={`₹${totalPaid.toLocaleString()}`}
             icon={<CheckCircle className="h-6 w-6 text-green-600" />}
            className="border-green-200 bg-green-50"
          />
          <StatCard
            title="Pending"
            value={`₹${totalPending.toLocaleString()}`}
            icon={<Clock className="h-6 w-6 text-amber-600" />}
            className="border-amber-200 bg-amber-50"
          />
          <StatCard
            title="Overdue"
            value={`₹${totalOverdue.toLocaleString()}`}
             icon={<AlertCircle className="h-6 w-6 text-red-600" />}
            className={totalOverdue > 0 ? "border-red-200 bg-red-50" : ""}
          />
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
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
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Invoices</CardTitle>
            <CardDescription>{filteredInvoices.length} invoice(s) found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No invoices found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono text-sm">{invoice.id.toUpperCase()}</TableCell>
                        <TableCell className="font-medium">{invoice.taskTitle}</TableCell>
                        <TableCell>₹{invoice.amount.toLocaleString()}</TableCell>
                        <TableCell>{invoice.dueDate}</TableCell>
                        <TableCell>
                          <BadgeStatus status={invoice.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedInvoice(invoice)}>
                              View
                            </Button>
                            {invoice.status !== "paid" && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedInvoice(invoice)
                                  setShowPayModal(true)
                                }}
                              >
                                Pay Now
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

        {/* Invoice Detail Modal */}
        <Dialog open={!!selectedInvoice && !showPayModal} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent>
            {selectedInvoice && (
              <>
                <DialogHeader>
                  <DialogTitle>Invoice {selectedInvoice.id.toUpperCase()}</DialogTitle>
                  <DialogDescription>Invoice details</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Task</p>
                        <p className="font-medium text-foreground">{selectedInvoice.taskTitle}</p>
                      </div>
                      <BadgeStatus status={selectedInvoice.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="text-xl font-bold text-foreground">₹{selectedInvoice.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Due Date</p>
                        <p className="font-medium text-foreground">{selectedInvoice.dueDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="font-medium text-foreground">{selectedInvoice.createdAt}</p>
                      </div>
                      {selectedInvoice.paidAt && (
                        <div>
                          <p className="text-sm text-muted-foreground">Paid On</p>
                          <p className="font-medium text-foreground">{selectedInvoice.paidAt}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                  {selectedInvoice.status !== "paid" && (
                    <Button onClick={() => setShowPayModal(true)}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay Now
                    </Button>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Pay Modal */}
        <Dialog open={showPayModal} onOpenChange={setShowPayModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Payment</DialogTitle>
              <DialogDescription>Pay invoice {selectedInvoice?.id.toUpperCase()}</DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground mb-1">Amount to pay</p>
                <p className="text-4xl font-bold text-foreground">₹{selectedInvoice?.amount.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-2xl border border-border mb-4">
                <p className="text-sm text-muted-foreground mb-1">Task</p>
                <p className="font-medium text-foreground">{selectedInvoice?.taskTitle}</p>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                This is a UI placeholder. Payment processing will be handled via Razorpay/Stripe.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPayModal(false)}>
                Cancel
              </Button>
              <Button onClick={handlePay} disabled={isPaying}>
                {isPaying ? "Processing..." : "Confirm Payment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
