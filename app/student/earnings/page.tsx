"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { BadgeStatus } from "@/components/ui/badge-status"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { mockStudents, mockTransactions } from "@/lib/mock-data"
import { Wallet, TrendingUp, ArrowDownRight, Loader2, Download } from "lucide-react"

export default function StudentEarningsPage() {
  const studentProfile = mockStudents[0]
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const totalEarnings = mockTransactions.filter((t) => t.type === "earning").reduce((sum, t) => sum + t.amount, 0)

  const totalWithdrawn = Math.abs(
    mockTransactions.filter((t) => t.type === "withdrawal").reduce((sum, t) => sum + t.amount, 0),
  )

  const handleWithdraw = async () => {
    const amount = Number.parseFloat(withdrawAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }
    if (amount > studentProfile.walletBalance) {
      toast.error("Insufficient balance")
      return
    }

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.success(`Withdrawal of ₹${amount.toLocaleString()} initiated (UI only)`)
    setIsWithdrawOpen(false)
    setWithdrawAmount("")
    setIsLoading(false)
  }

  return (
    <DashboardLayout allowedRoles={["student"]}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Earnings</h1>
            <p className="text-muted-foreground mt-1">Track your income and manage withdrawals</p>
          </div>
          <Button onClick={() => setIsWithdrawOpen(true)} className="rounded-xl">
            <ArrowDownRight className="h-4 w-4 mr-2" />
            Withdraw Earnings
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <StatCard
            title="Available Balance"
            value={`₹${studentProfile.walletBalance.toLocaleString()}`}
            description="Ready to withdraw"
            icon={<Wallet className="h-5 w-5" />}
          />
          <StatCard
            title="Total Earnings"
            value={`₹${totalEarnings.toLocaleString()}`}
            description="All time"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard
            title="Total Withdrawn"
            value={`₹${totalWithdrawn.toLocaleString()}`}
            description="All time"
            icon={<ArrowDownRight className="h-5 w-5" />}
          />
        </div>

        {/* Earnings Breakdown */}
        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Earnings Breakdown</CardTitle>
                <CardDescription>Your latest task payment</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Gross Earnings</span>
                <span className="font-medium">₹8,000</span>
              </div>
              <div className="flex justify-between items-center text-destructive">
                <span>Platform Fee (10%)</span>
                <span>-₹800</span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-medium">Net Earnings</span>
                <span className="font-bold text-lg">₹7,200</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Your recent transactions</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTransactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="text-muted-foreground">
                      {new Date(txn.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{txn.description}</TableCell>
                    <TableCell className={txn.amount < 0 ? "text-destructive" : "text-green-600"}>
                      {txn.amount < 0 ? "-" : "+"}₹{Math.abs(txn.amount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <BadgeStatus status={txn.status as "completed" | "pending" | "failed"} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Withdraw Dialog */}
      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Withdraw Earnings</DialogTitle>
            <DialogDescription>Enter the amount you want to withdraw to your bank account.</DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-2xl font-bold">₹{studentProfile.walletBalance.toLocaleString()}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Withdrawal Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <p className="text-sm text-muted-foreground">Withdrawals are processed within 2-3 business days.</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWithdrawOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleWithdraw} disabled={isLoading} className="rounded-xl">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Withdrawal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
