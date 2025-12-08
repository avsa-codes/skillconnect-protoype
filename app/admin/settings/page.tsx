"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUploader } from "@/components/ui/file-uploader"
import { Save, Settings, Mail, MessageSquare, DollarSign, Shield, Users } from "lucide-react"

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [logoFiles, setLogoFiles] = useState<File[]>([])

  const [siteSettings, setSiteSettings] = useState({
    siteName: "InstaTask SkillConnect",
    replacementSLA: "48",
    salaryCut: "10",
  })

  const [emailTemplates, setEmailTemplates] = useState({
    welcome: `Hello {name},

Welcome to InstaTask SkillConnect!

Your account has been created. Here are your login credentials:

SkillConnect ID: {skillConnectId}
Temporary Password: {tempPassword}

Please login and change your password.

Best regards,
InstaTask SkillConnect Team`,
    offerSent: `Hello {name},

Great news! You've been shortlisted for a task.

Task: {taskTitle}
Organization: {organizationName}
Start Date: {startDate}
Compensation: {salary}

Login to your dashboard to accept or decline this offer.

Best regards,
InstaTask SkillConnect Team`,
  })

  const [whatsappTemplates, setWhatsappTemplates] = useState({
    outreach: `Hi {name}! Welcome to InstaTask SkillConnect. Your credentials: ID: {skillConnectId}, Password: {tempPassword}. Login at skillconnect.instatask.com`,
    notification: `Hi {name}! You have a new notification on InstaTask SkillConnect. Login to check it out.`,
  })

  const [admins] = useState([
    { id: 1, name: "Super Admin", email: "admin@instatask.com", role: "super_admin" },
    { id: 2, name: "Support Admin", email: "support@instatask.com", role: "admin" },
  ])

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  return (
    <DashboardLayout allowedRoles={["admin", "super_admin"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Configure platform settings and templates</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save All Changes"}
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </TabsTrigger>
            <TabsTrigger value="fees" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Fees</span>
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Admins</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Site Settings</CardTitle>
                  <CardDescription>Basic platform configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Site Name</Label>
                    <Input
                      value={siteSettings.siteName}
                      onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Replacement SLA (hours)</Label>
                    <Input
                      type="number"
                      value={siteSettings.replacementSLA}
                      onChange={(e) => setSiteSettings({ ...siteSettings, replacementSLA: e.target.value })}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Maximum time to provide a replacement student</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Branding</CardTitle>
                  <CardDescription>Upload your logo and customize appearance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Logo</Label>
                    <FileUploader
                      value={logoFiles}
                      onChange={setLogoFiles}
                      accept="image/*"
                      maxSize={2}
                      maxFiles={1}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Primary Color</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-10 w-10 rounded-lg bg-primary border" />
                        <Input defaultValue="#F97316" className="flex-1" />
                      </div>
                    </div>
                    <div>
                      <Label>Secondary Color</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-10 w-10 rounded-lg bg-foreground border" />
                        <Input defaultValue="#1E293B" className="flex-1" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Security preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable 2FA for Admins</Label>
                      <p className="text-sm text-muted-foreground">
                        Require two-factor authentication for admin accounts
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Session Timeout (minutes)</Label>
                      <p className="text-sm text-muted-foreground">Auto logout after inactivity</p>
                    </div>
                    <Input type="number" defaultValue="60" className="w-24" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Email Templates */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>
                  Customize email templates. Use {"{"} name {"}"}, {"{"} skillConnectId {"}"}, etc. as placeholders.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Welcome Email (Seeded Users)</Label>
                  <Textarea
                    value={emailTemplates.welcome}
                    onChange={(e) => setEmailTemplates({ ...emailTemplates, welcome: e.target.value })}
                    className="mt-1 min-h-[200px] font-mono text-sm"
                  />
                </div>
                <div>
                  <Label>Offer Sent Email</Label>
                  <Textarea
                    value={emailTemplates.offerSent}
                    onChange={(e) => setEmailTemplates({ ...emailTemplates, offerSent: e.target.value })}
                    className="mt-1 min-h-[200px] font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WhatsApp Templates */}
          <TabsContent value="whatsapp">
            <Card>
              <CardHeader>
                <CardTitle>WhatsApp Templates</CardTitle>
                <CardDescription>Templates for WhatsApp messages. Keep them concise.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Outreach / Welcome</Label>
                  <Textarea
                    value={whatsappTemplates.outreach}
                    onChange={(e) => setWhatsappTemplates({ ...whatsappTemplates, outreach: e.target.value })}
                    className="mt-1 min-h-[100px] font-mono text-sm"
                  />
                </div>
                <div>
                  <Label>Notification</Label>
                  <Textarea
                    value={whatsappTemplates.notification}
                    onChange={(e) => setWhatsappTemplates({ ...whatsappTemplates, notification: e.target.value })}
                    className="mt-1 min-h-[100px] font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fee Settings */}
          <TabsContent value="fees">
            <Card>
              <CardHeader>
                <CardTitle>Fee Settings</CardTitle>
                <CardDescription>Configure platform fees and commissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Salary Cut (%)</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      value={siteSettings.salaryCut}
                      onChange={(e) => setSiteSettings({ ...siteSettings, salaryCut: e.target.value })}
                      className="w-24"
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Percentage deducted from student earnings as platform fee
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                  <h4 className="font-medium text-foreground mb-2">Fee Breakdown Example</h4>
                  <div className="text-sm space-y-1">
                    <p className="text-muted-foreground">
                      Task payment: <span className="text-foreground">₹10,000</span>
                    </p>
                    <p className="text-muted-foreground">
                      Platform fee ({siteSettings.salaryCut}%):{" "}
                      <span className="text-foreground">
                        ₹{((10000 * Number.parseInt(siteSettings.salaryCut)) / 100).toLocaleString()}
                      </span>
                    </p>
                    <p className="text-muted-foreground">
                      Student receives:{" "}
                      <span className="text-foreground font-semibold">
                        ₹{(10000 - (10000 * Number.parseInt(siteSettings.salaryCut)) / 100).toLocaleString()}
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Management */}
          <TabsContent value="admins">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Admin Users</CardTitle>
                  <CardDescription>Manage platform administrators</CardDescription>
                </div>
                <Button>
                  <Users className="mr-2 h-4 w-4" />
                  Invite Admin
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {admins.map((admin) => (
                    <div
                      key={admin.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <Shield className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{admin.name}</p>
                          <p className="text-sm text-muted-foreground">{admin.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            admin.role === "super_admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {admin.role === "super_admin" ? "Super Admin" : "Admin"}
                        </span>
                        {admin.role !== "super_admin" && (
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
