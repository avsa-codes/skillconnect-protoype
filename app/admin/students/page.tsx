 "use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Search,
  Download,
  Eye,
  Edit,
  Key,
  Ban,
  CheckCircle,
} from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function AdminStudentsPage() {
  const supabase = createSupabaseBrowserClient();

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // -------------------------------------------
  // 🔥 1. FETCH STUDENTS FROM SUPABASE
  // -------------------------------------------
  useEffect(() => {
    async function loadStudents() {
      setLoading(true);

      const { data, error } = await supabase
        .from("student_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch students:", error);
      } else {
        setStudents(data || []);
      }

      setLoading(false);
    }

    loadStudents();
  }, []);

  // Unique skills extracted from array column
  const allSkills = [
    ...new Set(
      students.flatMap((s) =>
        Array.isArray(s.skills) ? s.skills : []
      )
    ),
  ];

  // -------------------------------------------
  // 🔥 2. APPLY SEARCH + FILTERS
  // -------------------------------------------
  const filtered = students.filter((s) => {
    const matchesSearch =
      s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.skillconnect_id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSkill =
      skillFilter === "all" ||
      (Array.isArray(s.skills) && s.skills.includes(skillFilter));

    const matchesAvailability =
      availabilityFilter === "all" ||
      s.availability === availabilityFilter;

    return matchesSearch && matchesSkill && matchesAvailability;
  });

  // -------------------------------------------
  // 🔥 RENDER PAGE
  // -------------------------------------------
  return (
    <DashboardLayout allowedRoles={["admin", "super_admin"]}>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Students</h1>
            <p className="text-muted-foreground">
              Manage all registered students
            </p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* FILTERS */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or SC-ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Skills */}
              <Select value={skillFilter} onValueChange={setSkillFilter}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="Filter by skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  {allSkills.map((skill) => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Availability */}
              <Select
                value={availabilityFilter}
                onValueChange={setAvailabilityFilter}
              >
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Availability</SelectItem>
                  <SelectItem value="<10">Less than 10 hrs/week</SelectItem>
                  <SelectItem value="10-20">10-20 hrs/week</SelectItem>
                  <SelectItem value="20+">20+ hrs/week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* STUDENTS TABLE */}
        <Card>
          <CardHeader>
            <CardTitle>All Students</CardTitle>
            <CardDescription>
              {filtered.length} student(s) found
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>SC-ID</TableHead>
                    <TableHead>College</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No students found
                      </TableCell>
                    </TableRow>
                  )}

                  {filtered.map((s) => (
                    <TableRow key={s.user_id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                            {s.full_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{s.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {s.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>{s.skillconnect_id}</TableCell>
                      <TableCell>{s.college || "-"}</TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {Array.isArray(s.skills) &&
                            s.skills.slice(0, 2).map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded"
                              >
                                {skill}
                              </span>
                            ))}

                          {Array.isArray(s.skills) &&
                            s.skills.length > 2 && (
                              <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">
                                +{s.skills.length - 2}
                              </span>
                            )}
                        </div>
                      </TableCell>

                      <TableCell>{s.availability}</TableCell>

                      <TableCell>
                        {s.rating}{" "}
                        <span className="text-amber-500">★</span>
                      </TableCell>

                      <TableCell>
                        {s.profile_strength > 50 ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm">
                            <CheckCircle className="h-4 w-4" />
                            Complete
                          </span>
                        ) : (
                          <span className="text-amber-600 text-sm">
                            Incomplete
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedStudent(s)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedStudent(s);
                              setShowEditModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
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

        {/* VIEW MODAL */}
{/* VIEW MODAL */}
<Dialog
  open={!!selectedStudent && !showEditModal}
  onOpenChange={() => setSelectedStudent(null)}
>
  <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
    {selectedStudent && (
      <>
        <DialogHeader>
          <DialogTitle>Student Profile</DialogTitle>
          <DialogDescription>
            {selectedStudent.skillconnect_id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">

          {/* Top Section */}
          <div className="flex items-center gap-4">
            {selectedStudent.avatar_url ? (
              <img
                src={selectedStudent.avatar_url}
                alt="Avatar"
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                {selectedStudent.full_name?.charAt(0)}
              </div>
            )}

            <div>
              <h3 className="text-xl font-semibold">{selectedStudent.full_name}</h3>
              <p className="text-muted-foreground">{selectedStudent.email}</p>
              {selectedStudent.phone && (
                <p className="text-sm text-muted-foreground">{selectedStudent.phone}</p>
              )}
            </div>
          </div>

          {/* Grid Section */}
          <div className="grid grid-cols-2 gap-4">

            <div className="p-3 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground">College</p>
              <p className="font-medium">{selectedStudent.college || "-"}</p>
            </div>

            <div className="p-3 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground">City</p>
              <p className="font-medium">{selectedStudent.city || "-"}</p>
            </div>

            <div className="p-3 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground">Availability</p>
              <p className="font-medium">{selectedStudent.availability || "-"}</p>
            </div>

            <div className="p-3 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground">Rating</p>
              <p className="font-medium">
                {selectedStudent.rating || 0} ★ ({selectedStudent.tasks_completed || 0} tasks)
              </p>
            </div>

            <div className="p-3 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground">Education</p>
              <p className="font-medium">{selectedStudent.education || "-"}</p>
            </div>

            <div className="p-3 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground">Portfolio</p>
              <p className="font-medium">
                {selectedStudent.portfolio_url ? (
                  <a
                    href={selectedStudent.portfolio_url}
                    target="_blank"
                    className="text-primary underline"
                  >
                    Open Portfolio
                  </a>
                ) : (
                  "-"
                )}
              </p>
            </div>

            {/* Bank Details */}
            <div className="p-3 bg-muted/50 rounded-xl col-span-2">
              <p className="text-xs text-muted-foreground">Bank Account</p>
              <p className="font-medium">{selectedStudent.bank_account || "-"}</p>
            </div>

            <div className="p-3 bg-muted/50 rounded-xl col-span-2">
              <p className="text-xs text-muted-foreground">IFSC Code</p>
              <p className="font-medium">{selectedStudent.ifsc_code || "-"}</p>
            </div>

            {/* Profile Strength */}
            <div className="p-3 bg-muted/50 rounded-xl col-span-2">
              <p className="text-xs text-muted-foreground mb-1">Profile Strength</p>
              <div className="w-full bg-border rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${selectedStudent.profile_strength || 0}%` }}
                ></div>
              </div>
              <p className="text-sm mt-1">{selectedStudent.profile_strength || 0}%</p>
            </div>

          </div>

          {/* Skills */}
          <div>
            <p className="text-sm font-medium mb-1">Skills</p>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(selectedStudent.skills) &&
                selectedStudent.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
            </div>
          </div>

          {/* Bio */}
          {selectedStudent.bio && (
            <div>
              <p className="text-sm font-medium mb-1">Bio</p>
              <p className="text-muted-foreground">{selectedStudent.bio}</p>
            </div>
          )}

          {/* Resume */}
          <div>
            <p className="text-sm font-medium">Resume</p>
            {selectedStudent.resume_url ? (
              <a
                href={selectedStudent.resume_url}
                target="_blank"
                className="text-primary underline"
              >
                View Resume
              </a>
            ) : (
              <p className="text-muted-foreground">No resume uploaded</p>
            )}
          </div>

          {/* Student ID */}
          <div>
            <p className="text-sm font-medium">Student ID Document</p>
            {selectedStudent.student_id_file_url ? (
              <a
                href={selectedStudent.student_id_file_url}
                target="_blank"
                className="text-primary underline"
              >
                View Student ID
              </a>
            ) : (
              <p className="text-muted-foreground">Not uploaded</p>
            )}
          </div>

          {/* Certificates */}
          <div>
            <p className="text-sm font-medium mb-1">Certificates</p>
            {Array.isArray(selectedStudent.certificates) &&
            selectedStudent.certificates.length > 0 ? (
              <div className="space-y-1">
                {selectedStudent.certificates.map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <span>{c.name || `Certificate ${i + 1}`}</span>
                    {c.url && (
                      <a
                        href={c.url}
                        target="_blank"
                        className="text-primary underline text-sm"
                      >
                        Download
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No certificates uploaded</p>
            )}
          </div>

          {/* Experiences */}
          <div>
            <p className="text-sm font-medium mb-2">Experiences</p>

            {Array.isArray(selectedStudent.experiences) &&
            selectedStudent.experiences.length > 0 ? (
              <div className="space-y-3">
                {selectedStudent.experiences.map((exp: any, i: number) => (
                  <div key={i} className="p-3 bg-muted/50 rounded-xl">
                    <p className="font-medium">{exp.role}</p>
                    <p className="text-sm text-muted-foreground">
                      {exp.company} • {exp.duration}
                    </p>
                    {exp.description && (
                      <p className="text-sm mt-1">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No experience added</p>
            )}
          </div>

          {/* Timestamps */}
          <div className="text-xs text-muted-foreground mt-4">
            <p>Created: {new Date(selectedStudent.created_at).toLocaleString()}</p>
            <p>Updated: {new Date(selectedStudent.updated_at).toLocaleString()}</p>
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setSelectedStudent(null)}>
            Close
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowEditModal(true)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </DialogFooter>
      </>
    )}
  </DialogContent>
</Dialog>



        {/* EDIT MODAL */}
        {/* EDIT MODAL */}
<Dialog open={showEditModal} onOpenChange={setShowEditModal}>
  <DialogContent>
    {selectedStudent && (
      <>
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>
            {selectedStudent.skillconnect_id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Full Name</Label>
            <Input
              value={selectedStudent.full_name}
              onChange={(e) =>
                setSelectedStudent({ ...selectedStudent, full_name: e.target.value })
              }
              className="mt-1"
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              value={selectedStudent.email}
              onChange={(e) =>
                setSelectedStudent({ ...selectedStudent, email: e.target.value })
              }
              className="mt-1"
            />
          </div>

          <div>
            <Label>Phone</Label>
            <Input
              value={selectedStudent.phone || ""}
              onChange={(e) =>
                setSelectedStudent({ ...selectedStudent, phone: e.target.value })
              }
              className="mt-1"
            />
          </div>

          <div>
            <Label>College</Label>
            <Input
              value={selectedStudent.college || ""}
              onChange={(e) =>
                setSelectedStudent({ ...selectedStudent, college: e.target.value })
              }
              className="mt-1"
            />
          </div>

          {/* ⭐ NEW RATING FIELD */}
          <div>
            <Label>Rating (0 - 5)</Label>
            <Input
  type="number"
  min="0"
  max="5"
  step="0.1"
  value={selectedStudent.rating !== null && selectedStudent.rating !== undefined 
    ? String(selectedStudent.rating) 
    : ""}
  onChange={(e) =>
    setSelectedStudent({
      ...selectedStudent,
      rating: e.target.value === "" ? null : parseFloat(e.target.value)
    })
  }
  className="mt-1"
/>

          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" className="flex-1 bg-transparent">
              <Key className="mr-2 h-4 w-4" />
              Reset Password
            </Button>

            <Button
              variant="outline"
              className="flex-1 text-destructive hover:text-destructive bg-transparent"
            >
              <Ban className="mr-2 h-4 w-4" />
              Block User
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>

          {/* SAVE BUTTON */}
          <Button
            onClick={async () => {
              const { error } = await supabase
                .from("student_profiles")
                .update({
                  full_name: selectedStudent.full_name,
                  email: selectedStudent.email,
                  phone: selectedStudent.phone,
                  college: selectedStudent.college,
                  rating: selectedStudent.rating,   // ⭐ SAVE RATING
                })
                .eq("user_id", selectedStudent.user_id);

              if (error) {
                console.error(error);
                alert("Failed to update student");
                return;
              }

              // Refresh table
              const { data } = await supabase
                .from("student_profiles")
                .select("*")
                .order("created_at", { ascending: false });

              setStudents(data || []);

              setShowEditModal(false);
            }}
          >
            Save Changes
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
