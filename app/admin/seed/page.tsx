"use client";

import type React from "react";

import { useState, useCallback, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SkillTagsInput } from "@/components/ui/skill-tags";
import {
  Upload,
  Download,
  Copy,
  Send,
  Mail,
  MessageSquare,
  CheckCircle,
  FileSpreadsheet,
  User,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

interface SeedUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type: "student" | "organization";
  skills?: string[];
  availability?: string;
  college?: string;
  city?: string;
  companySize?: string;
  industry?: string;
  skillConnectId: string;
  tempPassword: string;
  selected: boolean;
  // new status fields
  created?: boolean;
  status?: "idle" | "pending" | "created" | "failed";
  errorMessage?: string | null;
}

// Generate a random SkillConnect ID
const generateSCID = () => `SC-${Math.floor(10000 + Math.random() * 90000)}`;

// Generate a random temp password
const generateTempPassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 8 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
};

export default function AdminSeedPage() {
  const [activeTab, setActiveTab] = useState("csv");
  const [seedUsers, setSeedUsers] = useState<SeedUser[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageType, setMessageType] = useState<"email" | "whatsapp">("email");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createdUsers, setCreatedUsers] = useState<any[]>([]);

  async function loadCreatedUsers() {
  const res = await fetch("/api/admin/list-seeded-users");
  const data = await res.json();
  setCreatedUsers(data.users || []);
}

useEffect(() => {
  loadCreatedUsers();
}, []);




  // Manual form state
  const [manualForm, setManualForm] = useState({
    name: "",
    email: "",
    phone: "",
    type: "student" as "student" | "organization",
    skills: [] as string[],
    availability: "",
    college: "",
    city: "",
    companySize: "",
    industry: "",
    contactPerson: "",
  });

  // Sample CSV content for download
  const sampleCSV = `name,email,phone,college,city,skills,availability,seed_type
Alex Student,alex@example.com,+91 98765 43210,IIT Delhi,Delhi,"React, JavaScript, Python",10-20,student
Priya Sharma,priya@example.com,+91 98765 43211,BITS Pilani,Hyderabad,"Data Analysis, Excel, SQL",20+,student`;

  const sampleOrgCSV = `company_name,contact_person,work_email,phone,company_size,industry,city,short_description,seed_type
TechCorp,John Manager,john@techcorp.com,+91 98765 43212,51-200,Technology,Bangalore,Leading tech solutions provider,organization
StartupXYZ,Jane Founder,jane@startupxyz.com,+91 98765 43213,1-10,E-commerce,Mumbai,Innovative e-commerce platform,organization`;

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      parseCSV(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      parseCSV(file);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());
      if (lines.length === 0) return;
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

      const users: SeedUser[] = lines.slice(1).map((line, index) => {
        const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
        const typeIndex = headers.indexOf("seed_type");
        const isOrg = typeIndex >= 0 && values[typeIndex] === "organization";

        const skillsRaw = values[headers.indexOf("skills")] || "";
        const skills = skillsRaw ? skillsRaw.split(",").map((s) => s.trim()) : [];

        return {
          id: `seed-${Date.now()}-${index}`,
          name: values[headers.indexOf("name")] || values[headers.indexOf("company_name")] || "",
          email: values[headers.indexOf("email")] || values[headers.indexOf("work_email")] || "",
          phone: values[headers.indexOf("phone")] || "",
          type: isOrg ? "organization" : "student",
          skills,
          availability: values[headers.indexOf("availability")] || "",
          college: values[headers.indexOf("college")] || "",
          city: values[headers.indexOf("city")] || "",
          companySize: values[headers.indexOf("company_size")] || "",
          industry: values[headers.indexOf("industry")] || "",
          skillConnectId: generateSCID(),
          tempPassword: generateTempPassword(),
          selected: false,
          created: false,
          status: "idle",
          errorMessage: null,
        };
      });

      setSeedUsers(users);
      setShowPreview(true);
    };
    reader.readAsText(file);
  };

  const handleManualCreate = () => {
    const newUser: SeedUser = {
      id: `seed-manual-${Date.now()}`,
      name: manualForm.name || "",
      email: manualForm.email || "",
      phone: manualForm.phone,
      type: manualForm.type,
      skills: manualForm.skills,
      availability: manualForm.availability,
      college: manualForm.college,
      city: manualForm.city,
      companySize: manualForm.companySize,
      industry: manualForm.industry,
      skillConnectId: generateSCID(),
      tempPassword: generateTempPassword(),
      selected: false,
      created: false,
      status: "idle",
      errorMessage: null,
    };

    setSeedUsers((prev) => [...prev, newUser]);
    setShowPreview(true);

    // Reset form
    setManualForm({
      name: "",
      email: "",
      phone: "",
      type: "student",
      skills: [],
      availability: "",
      college: "",
      city: "",
      companySize: "",
      industry: "",
      contactPerson: "",
    });
  };

  const toggleSelectUser = (id: string) => {
    setSeedUsers((prev) => prev.map((u) => (u.id === id ? { ...u, selected: !u.selected } : u)));
  };

  const toggleSelectAll = () => {
    const allSelected = seedUsers.every((u) => u.selected);
    setSeedUsers((prev) => prev.map((u) => ({ ...u, selected: !allSelected })));
  };

  const copyCredentials = (user: SeedUser) => {
    const text = `SkillConnect ID: ${user.skillConnectId}\nTemporary Password: ${user.tempPassword}`;
    navigator.clipboard.writeText(text);
    toast.success("Credentials copied");
  };

  const downloadPreviewCSV = () => {
    const headers = "name,email,skillConnectId,tempPassword,type\n";
    const rows = seedUsers
      .map((u) => `${u.name || ""},${u.email || ""},${u.skillConnectId},${u.tempPassword},${u.type}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "seeded-users-preview.csv";
    a.click();
  };

  const handleSendMessages = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setShowMessageModal(false);
    }, 2000);
  };

  const selectedCount = seedUsers.filter((u) => u.selected).length;

  // ------------------------
  // Create selected users
  // ------------------------
const createSelectedUsers = async () => {
  const adminSecret = process.env.NEXT_PUBLIC_ADMIN_SUPER_SECRET;
  if (!adminSecret) {
    toast.error("Admin secret missing");
    return;
  }

  setIsCreating(true);
  toast.loading("Creating users...");

  const toCreate = seedUsers.filter((u) => u.selected);

  // Mark all selected as pending
  setSeedUsers((prev) =>
    prev.map((u) => (u.selected ? { ...u, status: "pending", errorMessage: null } : u))
  );

  for (const user of toCreate) {
    try {
      const emailToSend =
        user.email?.trim().length > 0
          ? user.email
          : `${user.skillConnectId.toLowerCase()}@seed.instatask.test`;

      const roleToSend =
        user.type === "student" ? "student" : "organization";

      const profilePayload: any = {};

      if (user.type === "student") {
        profilePayload.full_name = user.name || emailToSend;
        profilePayload.phone = user.phone || null;
        profilePayload.college = user.college || null;
        profilePayload.city = user.city || null;
        profilePayload.skills = user.skills || [];
        profilePayload.availability = user.availability || null;
        profilePayload.portfolio_url = null;
        profilePayload.bio = "";
      } else {
        profilePayload.company_name = user.name || emailToSend;
        profilePayload.contact_person = user.name || null;
        profilePayload.phone = user.phone || null;
        profilePayload.company_size = user.companySize || null;
        profilePayload.industry = user.industry || null;
        profilePayload.city = user.city || null;
        profilePayload.description = "";
      }

// inside createSelectedUsers loop (replace your fetch + response handling)
const res = await fetch("/api/admin/create-user", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-admin-secret": adminSecret,
  },
  body: JSON.stringify({
    role: roleToSend,
    email: emailToSend,
    password: user.tempPassword,
    profile: profilePayload,
  }),
});

let json;
try {
  json = await res.json();
} catch (e) {
  // non-JSON response
  const text = await res.text().catch(() => "<no body>");
  console.error("create-user non-json response:", res.status, text);
  setSeedUsers((prev) =>
    prev.map((u) =>
      u.id === user.id ? { ...u, status: "failed", errorMessage: `HTTP ${res.status}: ${text}` } : u
    )
  );
  toast.error(`Failed: ${user.name || user.email} — HTTP ${res.status}`);
  continue;
}

if (!res.ok) {
  const errMsg = json?.error || json?.message || `HTTP ${res.status}`;
  console.error("create-user failed payload:", { resStatus: res.status, json });
  setSeedUsers((prev) =>
    prev.map((u) => (u.id === user.id ? { ...u, status: "failed", errorMessage: errMsg } : u))
  );
  toast.error(`Failed: ${user.name || user.email} — ${errMsg}`);
  continue;
}


      setSeedUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? {
                ...u,
                status: "created",
                created: true,
                email: emailToSend,
                skillConnectId: json.skillconnectId,
              }
            : u
        )
      );

      toast.success(`Created ${user.name}`);

    } catch (err: any) {
      setSeedUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, status: "failed", errorMessage: err.message }
            : u
        )
      );
      toast.error(`Error: ${err.message}`);
    }
  }

  toast.dismiss();
  toast.success("User creation complete");
  setIsCreating(false);
};


  return (
    <DashboardLayout allowedRoles={["admin", "super_admin"]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Seed Users</h1>
          <p className="text-muted-foreground">Bulk create students and organizations with auto-generated credentials</p>
        </div>

        {!showPreview ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="csv">CSV Upload</TabsTrigger>
              <TabsTrigger value="manual">Manual Create</TabsTrigger>
            </TabsList>

            <TabsContent value="csv" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload CSV File</CardTitle>
                  <CardDescription>Upload a CSV file with user data. Credentials will be auto-generated.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Drop Zone */}
                  <div
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                      isDragging ? "border-primary bg-primary/5" : "border-border"
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleFileDrop}
                  >
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium text-foreground mb-1">Drop your CSV file here</p>
                    <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                    <input type="file" accept=".csv" onChange={handleFileSelect} className="hidden" id="csv-upload" />
                    <Button asChild>
                      <label htmlFor="csv-upload" className="cursor-pointer">
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Select CSV File
                      </label>
                    </Button>
                  </div>

                  {/* Sample Downloads */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const blob = new Blob([sampleCSV], { type: "text/csv" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "sample-students.csv";
                        a.click();
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Student Sample
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const blob = new Blob([sampleOrgCSV], { type: "text/csv" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "sample-organizations.csv";
                        a.click();
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Org Sample
                    </Button>
                  </div>

                  {/* Expected Columns */}
                  <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                    <p className="font-medium text-foreground mb-2">Expected CSV Columns</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-foreground">For Students:</p>
                        <p className="text-muted-foreground">name, email, phone, college, city, skills, availability, seed_type</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">For Organizations:</p>
                        <p className="text-muted-foreground">
                          company_name, contact_person, work_email, phone, company_size, industry, city, seed_type
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manual" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create User Manually</CardTitle>
                  <CardDescription>Add a single user with auto-generated credentials</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>User Type</Label>
                    <Select value={manualForm.type} onValueChange={(v) => setManualForm({ ...manualForm, type: v as "student" | "organization" })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">
                          <span className="flex items-center gap-2">
                            <User className="h-4 w-4" /> Student
                          </span>
                        </SelectItem>
                        <SelectItem value="organization">
                          <span className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" /> Organization
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>{manualForm.type === "organization" ? "Company Name" : "Full Name"} *</Label>
                      <Input value={manualForm.name} onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input type="email" value={manualForm.email} onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })} className="mt-1" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Phone</Label>
                      <Input value={manualForm.phone} onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <Label>City</Label>
                      <Input value={manualForm.city} onChange={(e) => setManualForm({ ...manualForm, city: e.target.value })} className="mt-1" />
                    </div>
                  </div>

                  {manualForm.type === "student" ? (
                    <>
                      <div>
                        <Label>College</Label>
                        <Input value={manualForm.college} onChange={(e) => setManualForm({ ...manualForm, college: e.target.value })} className="mt-1" />
                      </div>
                      <div>
                        <Label>Skills</Label>
                        <SkillTagsInput value={manualForm.skills} onChange={(skills) => setManualForm({ ...manualForm, skills })} className="mt-1" />
                      </div>
                      <div>
                        <Label>Availability</Label>
                        <Select value={manualForm.availability} onValueChange={(v) => setManualForm({ ...manualForm, availability: v })}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select availability" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="<10">Less than 10 hrs/week</SelectItem>
                            <SelectItem value="10-20">10-20 hrs/week</SelectItem>
                            <SelectItem value="20+">20+ hrs/week</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label>Contact Person</Label>
                        <Input value={manualForm.contactPerson} onChange={(e) => setManualForm({ ...manualForm, contactPerson: e.target.value })} className="mt-1" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Company Size</Label>
                          <Select value={manualForm.companySize} onValueChange={(v) => setManualForm({ ...manualForm, companySize: v })}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1-10">1-10</SelectItem>
                              <SelectItem value="11-50">11-50</SelectItem>
                              <SelectItem value="51-200">51-200</SelectItem>
                              <SelectItem value="201-500">201-500</SelectItem>
                              <SelectItem value="500+">500+</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Industry</Label>
                          <Select value={manualForm.industry} onValueChange={(v) => setManualForm({ ...manualForm, industry: v })}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Technology">Technology</SelectItem>
                              <SelectItem value="IT Services">IT Services</SelectItem>
                              <SelectItem value="Finance">Finance</SelectItem>
                              <SelectItem value="E-commerce">E-commerce</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  )}

                  <Button onClick={handleManualCreate} className="w-full" disabled={!manualForm.name}>
                    Create User (local preview)
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          /* Preview Table */
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Preview Seeded Users</CardTitle>
                <CardDescription>
                  {seedUsers.length} user(s) ready • {selectedCount} selected
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Back
                </Button>
                <Button variant="outline" onClick={downloadPreviewCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">
                        <Checkbox checked={seedUsers.length > 0 && seedUsers.every((u) => u.selected)} onCheckedChange={toggleSelectAll} />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>SkillConnect ID</TableHead>
                      <TableHead>Temp Password</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Checkbox checked={user.selected} onCheckedChange={() => toggleSelectUser(user.id)} />
                        </TableCell>
                        <TableCell className="font-medium">{user.name || "—"}</TableCell>
                        <TableCell>{user.email || <span className="text-muted-foreground">no email</span>}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              user.type === "student" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {user.type}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{user.skillConnectId}</TableCell>
                        <TableCell className="font-mono text-sm">{user.tempPassword}</TableCell>
                        <TableCell>
                          {user.status === "idle" && <span className="text-sm text-muted-foreground">idle</span>}
                          {user.status === "pending" && <span className="text-sm text-amber-600">pending...</span>}
                          {user.status === "created" && (
                            <span className="text-sm text-green-600 flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" /> created
                            </span>
                          )}
                          {user.status === "failed" && <span className="text-sm text-red-600">failed</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => copyCredentials(user)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-border">
                <Button
                  onClick={() => {
                    setMessageType("email");
                    setShowMessageModal(true);
                  }}
                  disabled={selectedCount === 0}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send Welcome Email ({selectedCount})
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setMessageType("whatsapp");
                    setShowMessageModal(true);
                  }}
                  disabled={selectedCount === 0}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send WhatsApp ({selectedCount})
                </Button>

                <div className="ml-auto flex items-center gap-2">
                  <Button onClick={createSelectedUsers} disabled={selectedCount === 0 || isCreating}>
                    {isCreating ? "Creating..." : `Create Selected (${selectedCount})`}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}




<Card className="mt-10">
  <CardHeader>
    <CardTitle>Previously Created Users</CardTitle>
    <CardDescription>All seeded users created via this panel</CardDescription>
  </CardHeader>

  <CardContent>
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>SC-ID</TableHead>
            <TableHead>Password</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {createdUsers.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.role}</TableCell>
              <TableCell className="font-mono">{u.skillconnect_id}</TableCell>
              <TableCell className="font-mono">{u.temp_password}</TableCell>
              <TableCell>{new Date(u.created_at).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </CardContent>
</Card>






        {/* Message Modal */}
        <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
          <DialogContent>
            {showSuccess ? (
              <div className="py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Messages Sent!</h3>
                <p className="text-muted-foreground">
                  Welcome {messageType === "email" ? "emails" : "WhatsApp messages"} have been sent to {selectedCount} user(s).
                </p>
              </div>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Send Welcome {messageType === "email" ? "Email" : "WhatsApp"}</DialogTitle>
                  <DialogDescription>Preview the message that will be sent to {selectedCount} selected user(s)</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {`Hello {name},

Welcome to InstaTask SkillConnect! 

Your account has been created. Here are your login credentials:

SkillConnect ID: {skillConnectId}
Temporary Password: {tempPassword}

Please login at https://skillconnect.instatask.com and change your password.

Best regards,
InstaTask SkillConnect Team`}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{"{name}, {skillConnectId}, {tempPassword}"} will be replaced with actual values</p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowMessageModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      // For MVP keep messages local-sim only
                      handleSendMessages();
                    }}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send to {selectedCount} User(s)
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

