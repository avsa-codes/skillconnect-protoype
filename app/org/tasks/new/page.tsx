"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SkillTagsInput } from "@/components/ui/skill-tags"
import { FileUploader } from "@/components/ui/file-uploader"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardList,
  Briefcase,
  IndianRupee,
  FileText
} from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const steps = [
  { id: 1, title: "Basics", icon: ClipboardList },
  { id: 2, title: "Requirements", icon: Briefcase },
  { id: 3, title: "Compensation", icon: IndianRupee },
  { id: 4, title: "Review", icon: FileText },
]

export default function NewTaskPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  // Form states
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    fullBrief: "",
    skills: [] as string[],
    weeklyHours: "",
    duration: "",
    startDate: "",
    location: "remote" as "remote" | "onsite",
    city: "",
    salary: "",
    payrollTerms: "weekly" as "weekly" | "bi-weekly" | "end-of-task",
    positions: "1",
    confidential: false,
    attachments: null as File | null,  // ✅ FIXED
  })

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => currentStep < 4 && setCurrentStep(currentStep + 1)
  const handleBack = () => currentStep > 1 && setCurrentStep(currentStep - 1)

  // ---------------------------------------------------------
  // ✅ FIXED handleSubmit (single file, NDA, attachments)
  // ---------------------------------------------------------
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert("Not logged in")
        return
      }

      // Get org profile
      const { data: orgRow, error: orgError } = await supabase
        .from("organization_profiles")
        .select("user_id")
        .eq("user_id", user.id)
        .single()

      if (orgError || !orgRow) {
        alert("Org profile not found")
        return
      }

      // ------------------------------------------
      // Upload attachment if file exists
      // ------------------------------------------
      let attachmentUrl: string | null = null

      if (formData.attachments instanceof File) {
        const file = formData.attachments
        const ext = file.name.split(".").pop()
        const filePath = `task-attachments/${user.id}-${Date.now()}.${ext}`

        const { error: uploadErr } = await supabase.storage
          .from("org-files")
          .upload(filePath, file)

        if (uploadErr) {
          console.error(uploadErr)
          alert("Failed to upload attachment")
          return
        }

        const { data: publicData } = supabase.storage
          .from("org-files")
          .getPublicUrl(filePath)

        attachmentUrl = publicData.publicUrl
      }

      // ------------------------------------------
      // Insert Task
      // ------------------------------------------
      const payload = {
        org_id: orgRow.user_id,
        title: formData.title,
        short_description: formData.shortDescription,
        full_brief: formData.fullBrief,
        skills: formData.skills,
        weekly_hours: formData.weeklyHours,
        duration_weeks: formData.duration,
        start_date: formData.startDate,
        location: formData.location,
        city: formData.location === "onsite" ? formData.city : null,
        salary: formData.salary,
        payroll_terms: formData.payrollTerms,
        positions: parseInt(formData.positions),
        positions_filled: 0,
        confidential: formData.confidential,
        attachment_urls: attachmentUrl ? [attachmentUrl] : null,
        status: "open",
      }

      const { error } = await supabase.from("tasks").insert(payload)

      if (error) {
        console.error(error)
        alert("Failed to submit task: " + error.message)
        return
      }

      setShowSuccess(true)

    } catch (err: any) {
      console.error(err)
      alert("Failed to submit task: " + err?.message)
    } finally {
      setIsSubmitting(false)
    }
  }







  if (showSuccess) {
    return (
      <DashboardLayout allowedRoles={["organization_user", "admin", "super_admin"]}>
        <div className="max-w-2xl mx-auto">
          <Card className="text-center py-12">
            <CardContent>
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Task Submitted for Review</h1>
              <p className="text-muted-foreground mb-6">
                Your task &quot;{formData.title}&quot; has been submitted. Our admin team will review it and start
                shortlisting candidates soon.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" onClick={() => router.push("/org/tasks")}>
                  View All Tasks
                </Button>
                <Button
                  onClick={() => {
                    setShowSuccess(false)
                    setCurrentStep(1)
                    setFormData({
                      title: "",
                      shortDescription: "",
                      fullBrief: "",
                      skills: [],
                      weeklyHours: "",
                      duration: "",
                      startDate: "",
                      location: "remote",
                      city: "",
                      salary: "",
                      payrollTerms: "weekly",
                      positions: "1",
                      confidential: false,
                      attachments: null,
                    })
                  }}
                >
                  Post Another Task
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout allowedRoles={["organization_user", "admin", "super_admin"]}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push("/org/tasks")} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Post a New Task</h1>
          <p className="text-muted-foreground">Fill in the details to find the right student for your project</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    currentStep >= step.id
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {currentStep > step.id ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                </div>
                <span className={`text-xs mt-1 ${currentStep >= step.id ? "text-primary" : "text-muted-foreground"}`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-0.5 w-12 sm:w-20 mx-2 ${currentStep > step.id ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Steps */}
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Task Basics"}
              {currentStep === 2 && "Requirements"}
              {currentStep === 3 && "Compensation & Terms"}
              {currentStep === 4 && "Review & Submit"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Describe what you need help with"}
              {currentStep === 2 && "Specify skills, schedule, and location"}
              {currentStep === 3 && "Set compensation and payment terms"}
              {currentStep === 4 && "Review your task details before submitting"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Basics */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Task Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Social Media Content Creation"
                    value={formData.title}
                    onChange={(e) => updateFormData("title", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="shortDescription">Short Description *</Label>
                  <Input
                    id="shortDescription"
                    placeholder="Brief summary in 1-2 lines"
                    value={formData.shortDescription}
                    onChange={(e) => updateFormData("shortDescription", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="fullBrief">Full Brief *</Label>
                  <Textarea
                    id="fullBrief"
                    placeholder="Detailed description of the task, expectations, and deliverables..."
                    value={formData.fullBrief}
                    onChange={(e) => updateFormData("fullBrief", e.target.value)}
                    className="mt-1 min-h-[150px]"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Requirements */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label>Required Skills *</Label>
                  <SkillTagsInput
                    value={formData.skills}
                    onChange={(skills: string[]) => updateFormData("skills", skills)}
                    placeholder="Type a skill and press Enter"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weeklyHours">Weekly Hours *</Label>
                    <Select value={formData.weeklyHours} onValueChange={(v) => updateFormData("weeklyHours", v)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select hours" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">Up to 5 hours</SelectItem>
                        <SelectItem value="10">Up to 10 hours</SelectItem>
                        <SelectItem value="15">Up to 15 hours</SelectItem>
                        <SelectItem value="20">Up to 20 hours</SelectItem>
                        <SelectItem value="30">Up to 30 hours</SelectItem>
                        <SelectItem value="40">Full-time (40 hours)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration *</Label>
                    <Select value={formData.duration} onValueChange={(v) => updateFormData("duration", v)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 week</SelectItem>
<SelectItem value="2">2 weeks</SelectItem>
<SelectItem value="4">4 weeks</SelectItem>
<SelectItem value="8">8 weeks</SelectItem>
<SelectItem value="12">12 weeks</SelectItem>

                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => updateFormData("startDate", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="positions">Number of Students *</Label>
                    <Select value={formData.positions} onValueChange={(v) => updateFormData("positions", v)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select count" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <SelectItem key={n} value={n.toString()}>
                            {n} student{n > 1 ? "s" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(v) => updateFormData("location", v as "remote" | "onsite")}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select location type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.location === "onsite" && (
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="e.g., Mumbai"
                      value={formData.city}
                      onChange={(e) => updateFormData("city", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Compensation */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="salary">Total Budget / Salary *</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input
                      id="salary"
                      placeholder="e.g., 10000"
                      value={formData.salary}
                      onChange={(e) => updateFormData("salary", e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter the total budget for the entire task duration
                  </p>
                </div>
                <div>
                  <Label htmlFor="payrollTerms">Payment Schedule *</Label>
                  <Select value={formData.payrollTerms} onValueChange={(v) => updateFormData("payrollTerms", v as any)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select payment schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                      <SelectItem value="end-of-task">End of Task</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-2xl border border-border">
                  <Checkbox
                    id="confidential"
                    checked={formData.confidential}
                    onCheckedChange={(checked) => updateFormData("confidential", checked)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="confidential" className="font-medium cursor-pointer">
                      Requires Confidentiality / NDA
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Student will be required to sign a confidentiality agreement before starting
                    </p>
                  </div>
                </div>
                <div>
                  <Label>Attachments (optional)</Label>
                  <FileUploader
  value={formData.attachments}
  onChange={(file) => updateFormData("attachments", file)}
  accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
  maxSize={10}
/>


                  <p className="text-xs text-muted-foreground mt-1">
                    Upload any relevant documents, briefs, or reference materials
                  </p>
                </div>
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20">
                  <p className="text-sm text-primary font-medium">Replacement Guarantee</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    If a student becomes unavailable, we guarantee a replacement within 48 hours at no extra cost.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                  <h3 className="font-semibold text-foreground mb-3">Task Details</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Title</dt>
                      <dd className="font-medium text-foreground">{formData.title || "-"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Description</dt>
                      <dd className="font-medium text-foreground text-right max-w-[60%]">
                        {formData.shortDescription || "-"}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                  <h3 className="font-semibold text-foreground mb-3">Requirements</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Skills</dt>
                      <dd className="font-medium text-foreground">
                        {formData.skills.length > 0 ? formData.skills.join(", ") : "-"}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Duration</dt>
                      <dd className="font-medium text-foreground">{formData.duration || "-"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Weekly Hours</dt>
                      <dd className="font-medium text-foreground">
                        {formData.weeklyHours ? `${formData.weeklyHours} hours` : "-"}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Start Date</dt>
                      <dd className="font-medium text-foreground">{formData.startDate || "-"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Location</dt>
                      <dd className="font-medium text-foreground">
                        {formData.location === "remote" ? "Remote" : formData.city || "On-site"}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Students Needed</dt>
                      <dd className="font-medium text-foreground">{formData.positions}</dd>
                    </div>
                  </dl>
                </div>

                <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                  <h3 className="font-semibold text-foreground mb-3">Compensation</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Total Budget</dt>
                      <dd className="font-medium text-foreground">{formData.salary ? `₹${formData.salary}` : "-"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Payment Schedule</dt>
                      <dd className="font-medium text-foreground capitalize">
                        {formData.payrollTerms.replace("-", " ")}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Confidentiality Required</dt>
                      <dd className="font-medium text-foreground">{formData.confidential ? "Yes" : "No"}</dd>
                    </div>
                  </dl>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                  <p className="text-sm text-amber-800">
                    By submitting this task, you agree to the InstaTask SkillConnect terms of service and replacement
                    policy. Your task will be reviewed by our admin team before candidates are shortlisted.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              {currentStep > 1 ? (
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              ) : (
                <div />
              )}
              {currentStep < 4 ? (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Task"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
