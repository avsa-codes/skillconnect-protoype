"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { SkillTags } from "@/components/ui/skill-tags"
import { FileUploader } from "@/components/ui/file-uploader"
import { toast } from "sonner"
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react"

export default function StudentOnboardingPage() {
  const router = useRouter()
  const { user, isAuthenticated, updateProfile } = useAuth()

  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    college: "",
    city: "",
    skills: [] as string[],
    availability: "",
    portfolioUrl: "",
    bio: "",
    studentIdFile: null as File | null,
    acceptTerms: false,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth?type=student")
    } else if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.fullName || "",
        email: user.email || "",
      }))
    }
  }, [isAuthenticated, user, router])

  const handleNext = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.email) {
        toast.error("Please fill in required fields")
        return
      }
    }
    if (step === 2) {
      if (formData.skills.length === 0 || !formData.availability) {
        toast.error("Please add at least one skill and select availability")
        return
      }
    }
    setStep(step + 1)
  }

  const handleSubmit = async () => {
  if (!formData.acceptTerms) {
    toast.error("Please accept the Terms & Conditions");
    return;
  }

  if (!user) return;

  setIsLoading(true);

  try {
    const form = new FormData();
    form.append("user_id", user.id);
    form.append("full_name", formData.fullName);
    form.append("phone", formData.phone);
    form.append("college", formData.college);
    form.append("city", formData.city);
    form.append("skills", JSON.stringify(formData.skills));
    form.append("availability", formData.availability);
    form.append("portfolio_url", formData.portfolioUrl);
    form.append("bio", formData.bio);

    if (formData.studentIdFile) {
      form.append("student_id_file", formData.studentIdFile);
    }

    const res = await fetch("/api/student/onboarding", {
      method: "POST",
      body: form,
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Failed to save profile");
      setIsLoading(false);
      return;
    }

    toast.success("Profile completed successfully!");

    // Update metadata in auth-context
    await updateProfile({ profileComplete: true });

    router.push("/student/dashboard");
  } catch (err) {
    console.error(err);
    toast.error("Something went wrong");
  }

  setIsLoading(false);
};


  if (!user) return null

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1 mb-6">
            <span className="text-xl font-semibold">InstaTask</span>
            <span className="text-xl font-semibold text-primary">| SkillConnect</span>
          </Link>
          <h1 className="text-2xl font-bold">Welcome to InstaTask SkillConnect</h1>
          <p className="text-muted-foreground mt-2">Tell us a little about yourself</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 w-16 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>

        <Card className="rounded-2xl border-0 shadow-lg">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Let's start with your contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="Your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled
                    className="rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (recommended)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="college">College / Institution</Label>
                    <Input
                      id="college"
                      placeholder="Your college"
                      value={formData.college}
                      onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Your city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={handleNext} className="w-full rounded-xl">
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2: Skills & Availability */}
          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>Skills & Availability</CardTitle>
                <CardDescription>Help us match you with the right opportunities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Top Skills * (up to 3)</Label>
                  <SkillTags
  value={formData.skills}
  onChange={(skills: string[]) =>
    setFormData({
      ...formData,
      skills: Array.isArray(skills) ? skills : []
    })
  }
  maxTags={3}
  placeholder="Add up to 3 skills — use commas or Enter"
/>

                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability">Weekly Availability *</Label>
                  <Select
                    value={formData.availability}
                    onValueChange={(v) => setFormData({ ...formData, availability: v })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select your availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="<10">Less than 10 hours/week</SelectItem>
                      <SelectItem value="10-20">10-20 hours/week</SelectItem>
                      <SelectItem value="20+">20+ hours/week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolioUrl">Portfolio URL (optional)</Label>
                  <Input
                    id="portfolioUrl"
                    type="url"
                    placeholder="https://yourportfolio.com"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    className="rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">
                    Link to your portfolio, GitHub, LinkedIn, or other work samples
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Short Bio (optional)</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us a bit about yourself in 1-2 lines..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="rounded-xl resize-none"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-xl">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleNext} className="flex-1 rounded-xl">
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Verification & Submit */}
          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle>Almost Done!</CardTitle>
                <CardDescription>Upload your student ID and accept terms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Student ID (optional)</Label>
                  <FileUploader
                    value={formData.studentIdFile}
                    onChange={(file) => setFormData({ ...formData, studentIdFile: file })}
                    accept="image/*,.pdf"
                    maxSize={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload a photo of your student ID for faster verification
                  </p>
                </div>

                <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <h4 className="font-medium">Profile Summary</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <span className="ml-2">{formData.fullName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <span className="ml-2">{formData.email}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Skills:</span>
                      <span className="ml-2">{formData.skills.join(", ")}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Availability:</span>
                      <span className="ml-2">{formData.availability} hrs/week</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => setFormData({ ...formData, acceptTerms: checked === true })}
                  />
                  <Label htmlFor="terms" className="text-sm leading-tight cursor-pointer">
                    I accept the{" "}
                    <Link href="/terms" className="text-primary hover:underline" target="_blank">
                      Terms & Conditions
                    </Link>{" "}
                    and the salary cut policy (10% platform fee on earnings).
                  </Label>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1 rounded-xl">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleSubmit} className="flex-1 rounded-xl" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Complete Profile
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
