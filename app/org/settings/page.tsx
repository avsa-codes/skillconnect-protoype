"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, CreditCard, UserPlus, Trash2, Save } from "lucide-react"

const teamMembers = [
  { id: 1, name: "Jane Organization", email: "jane@techstart.com", role: "Admin" },
  { id: 2, name: "John Doe", email: "john@techstart.com", role: "Member" },
]

export default function OrgSettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [members, setMembers] = useState(teamMembers)

  const [billingContact, setBillingContact] = useState({
    name: "Jane Organization",
    email: "billing@techstart.com",
    address: "123 Tech Park, Bangalore",
    gst: "29ABCDE1234F1Z5",
  })

  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    role: "Member",
  })

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const handleAddMember = () => {
    if (newMember.name && newMember.email) {
      setMembers([...members, { id: Date.now(), ...newMember }])
      setNewMember({ name: "", email: "", role: "Member" })
      setShowAddMember(false)
    }
  }

  const handleRemoveMember = (id: number) => {
    setMembers(members.filter((m) => m.id !== id))
  }

  return (
    <DashboardLayout allowedRoles={["organization_user", "admin", "super_admin"]}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your organization settings</p>
        </div>

        {/* Team Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
              <CardDescription>Manage who can access your organization account</CardDescription>
            </div>
            <Button onClick={() => setShowAddMember(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">{member.role}</span>
                    {member.role !== "Admin" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Billing Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Billing Information
            </CardTitle>
            <CardDescription>Contact details for invoices and billing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="billingName">Billing Contact Name</Label>
                <Input
                  id="billingName"
                  value={billingContact.name}
                  onChange={(e) => setBillingContact({ ...billingContact, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="billingEmail">Billing Email</Label>
                <Input
                  id="billingEmail"
                  type="email"
                  value={billingContact.email}
                  onChange={(e) => setBillingContact({ ...billingContact, email: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="billingAddress">Billing Address</Label>
              <Input
                id="billingAddress"
                value={billingContact.address}
                onChange={(e) => setBillingContact({ ...billingContact, address: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="gst">GST Number (optional)</Label>
              <Input
                id="gst"
                value={billingContact.gst}
                onChange={(e) => setBillingContact({ ...billingContact, gst: e.target.value })}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} size="lg">
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* Add Member Modal */}
        <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>Invite a new member to access your organization account</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="memberName">Full Name</Label>
                <Input
                  id="memberName"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="memberEmail">Email Address</Label>
                <Input
                  id="memberEmail"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="memberRole">Role</Label>
                <Select value={newMember.role} onValueChange={(v) => setNewMember({ ...newMember, role: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddMember(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMember}>Send Invite</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
