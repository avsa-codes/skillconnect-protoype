"use client"
 import { createSupabaseBrowserClient } from "@/lib/supabase-browser"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SkillTags } from "@/components/ui/skill-tags"
import { FileUploader } from "@/components/ui/file-uploader"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { mockStudents } from "@/lib/mock-data"
import { useMemo } from "react";

import { Loader2, Camera, Star, Award, Plus, Trash2 } from "lucide-react"

interface Experience {
  id: string;
  title: string;
  organization: string;
  description: string;
  startDate: string; // yyyy-mm-dd
  endDate: string;   // yyyy-mm-dd
  isSaved?: boolean;
}

interface Certificate {
  id: string
  name: string
  issuer: string
  date: string
  file?: File | null
  file_url?: string;
}
export default function StudentProfilePage() {

  
  const { user, isLoading} = useAuth()
  console.log("👤 Profile page auth", { user, isLoading });


if (isLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-muted-foreground">Loading profile…</div>
    </div>
  );
}

if (!user) {
  return null; // layout will redirect
}


  // const studentProfile = mockStudents[0]
  const [profile, setProfile] = useState<any>(null)
const supabase = useMemo(
  () => createSupabaseBrowserClient(),
  []
);

const [showResumeUploader, setShowResumeUploader] = useState(false);


const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [resumeFile, setResumeFile] = useState<File | null>(null);
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
  education: "",
  bankAccount: "",
  ifscCode: "",
  resumeUrl: "",
  resumeFile: null as File | null,
})
const [experiences, setExperiences] = useState<Experience[]>([]);
const [certificates, setCertificates] = useState<Certificate[]>([]);



const uploadResumeImmediately = async (file: File) => {
  if (!user) return;

  const ext = file.name.split(".").pop();
  const fileName = `${user.id}-resume.${ext}`;
  const filePath = `resumes/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("student-files")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    toast.error("Failed to upload resume");
    return;
  }

  // get public URL
  const { data } = supabase.storage
    .from("student-files")
    .getPublicUrl(filePath);

  const newUrl = data.publicUrl;

  // update DB instantly
  const { error: dbError } = await supabase
    .from("student_profiles")
    .update({ resume_url: newUrl })
    .eq("user_id", user.id);

  if (dbError) {
    toast.error("Failed to update resume");
    return;
  }

  toast.success("Resume updated");

  // UPDATE UI STATE IMMEDIATELY (THE REAL FIX)
  setFormData((prev) => ({
    ...prev,
    resumeUrl: newUrl,
  }));

  setResumeFile(null);
  setShowResumeUploader(false);

  return newUrl; // <-- VERY IMPORTANT
};






const uploadCertificateImmediately = async (certId: string, file: File) => {
  if (!user) return;

  const ext = file.name.split(".").pop();
  const fileName = `${user.id}-${certId}.${ext}`;
  const filePath = `certificates/${fileName}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from("student-files")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    toast.error("Failed to upload certificate file.");
    return null;
  }

  // Get public URL
  const { data } = supabase.storage
    .from("student-files")
    .getPublicUrl(filePath);

  const newUrl = data.publicUrl;

  // Update DB
  const updatedList = certificates.map(c =>
    c.id === certId ? { ...c, file_url: newUrl, file: null } : c
  );

  setCertificates(updatedList);

  const { error: dbError } = await supabase
    .from("student_profiles")
    .update({
      certificates: updatedList,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (dbError) {
    toast.error("Failed to update certificate.");
    return null;
  }

  toast.success("Certificate updated!");

  return newUrl;
};



useEffect(() => {
  if (!user?.id) return;

  let cancelled = false;

  const loadProfile = async () => {
    const { data, error } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (cancelled) return;

    if (error) {
      console.error("Failed to fetch profile:", error);
      return;
    }

    setProfile(data);

    setFormData(prev => ({
      ...prev,
      fullName: data.full_name || "",
      email: user.email,
      phone: data.phone || "",
      college: data.college || "",
      city: data.city || "",
      skills: data.skills || [],
      availability: data.availability || "",
      portfolioUrl: data.portfolio_url || "",
      bio: data.bio || "",
      education: data.education || "",
      bankAccount: data.bank_account || "",
      ifscCode: data.ifsc_code || "",
      resumeUrl: data.resume_url || "",
    }));

    setExperiences(
      (data.experiences || []).map((exp: any) => ({
        ...exp,
        isSaved: true,
      }))
    );

    setCertificates(
      (data.certificates || []).map((cert: any) => ({
        id: cert.id,
        name: cert.name || "",
        issuer: cert.issuer || "",
        date: cert.date || "",
        file_url: cert.file_url || "",
        file: null,
      }))
    );
  };

  loadProfile();

  return () => {
    cancelled = true;
  };
}, [user?.id]); // ✅ THIS IS THE FIX

 
//PROFILE STRENGTH CALCULATOR 
function calculateProfileStrength(data: any) {
  let total = 15;
  let filled = 0;

  const check = (value: any) =>
    value !== null &&
    value !== undefined &&
    value !== "" &&
    !(Array.isArray(value) && value.length === 0);

  if (check(data.full_name)) filled++;
  if (check(data.phone)) filled++;
  if (check(data.college)) filled++;
  if (check(data.city)) filled++;
  if (check(data.skills)) filled++;
  if (check(data.availability)) filled++;
  if (check(data.portfolio_url)) filled++;
  if (check(data.bio)) filled++;
  if (check(data.education)) filled++;
  if (check(data.bank_account)) filled++;
  if (check(data.ifsc_code)) filled++;
  if (check(data.resume_url)) filled++;
  if (check(data.avatar_url)) filled++;
  if (check(data.experiences)) filled++;
  if (check(data.certificates)) filled++;

  return Math.round((filled / total) * 100);
}






const handleSave = async () => {
  if (!user) return;
  setIsSaving(true);

  let avatarUrl = profile?.avatar_url || null;

  /* ----------------------- AVATAR UPLOAD ----------------------- */
  if (avatarFile) {
    const ext = avatarFile.name.split(".").pop();
    const fileName = `${user.id}.${ext}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("student-files")
      .upload(filePath, avatarFile, { upsert: true });

    if (uploadError) {
      toast.error("Failed to upload avatar.");
    } else {
      const { data } = supabase.storage
        .from("student-files")
        .getPublicUrl(filePath);

      avatarUrl = data.publicUrl;
    }
  }

  /* ----------------------- CERTIFICATE UPLOAD ----------------------- */
  const uploadedCertificates = [];

  for (const cert of certificates) {
    let file_url = cert.file_url || null;

    if (cert.file) {
      const ext = cert.file.name.split(".").pop();
      const fileName = `${user.id}-${cert.id}.${ext}`;
      const filePath = `certificates/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("student-files")
        .upload(filePath, cert.file, { upsert: true });

      if (uploadError) {
        toast.error("Failed to upload certificate.");
        continue;
      }

      const { data } = supabase.storage
        .from("student-files")
        .getPublicUrl(filePath);

      file_url = data.publicUrl;
    }

    uploadedCertificates.push({
      id: cert.id,
      name: cert.name,
      issuer: cert.issuer,
      date: cert.date,
      file_url,
    });
  }



  const strength = calculateProfileStrength({
  full_name: formData.fullName,
  phone: formData.phone,
  college: formData.college,
  city: formData.city,
  skills: formData.skills,
  availability: formData.availability,
  portfolio_url: formData.portfolioUrl,
  bio: formData.bio,
  education: formData.education,
  bank_account: formData.bankAccount,
  ifsc_code: formData.ifscCode,
  resume_url: formData.resumeUrl,
  avatar_url: avatarUrl,
  experiences,
  certificates: uploadedCertificates,
});





  /* ---------------- SAVE EVERYTHING EXCEPT RESUME ---------------- */
  const { error } = await supabase
    .from("student_profiles")
    .update({
      full_name: formData.fullName,
      phone: formData.phone,
      city: formData.city,
      college: formData.college,
      skills: formData.skills,
      availability: formData.availability,
      portfolio_url: formData.portfolioUrl,
      bio: formData.bio,
      education: formData.education,
      bank_account: formData.bankAccount,
      ifsc_code: formData.ifscCode,
      avatar_url: avatarUrl,
      certificates: uploadedCertificates,
      experiences: experiences,
      profile_strength: strength, 
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

    toast.success(`Profile updated! Strength: ${strength}%`);

  if (error) {
    toast.error("Failed to save changes");
  } else {
    toast.success("Profile updated successfully!");
  }

  setIsSaving(false);
};


const addExperience = () => {
  setExperiences([
    ...experiences,
    {
      id: Date.now().toString(),
      title: "",
      organization: "",
      description: "",
      startDate: "",
      endDate: "",
      isSaved: false, // new experience can be edited
    },
  ]);
};


const removeExperience = async (id: string) => {
  // 1. Remove from state
  const updated = experiences.filter((e) => e.id !== id);
  setExperiences(updated);

  // 2. Save to DB immediately
  const { error } = await supabase
    .from("student_profiles")
    .update({
      experiences: updated,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) {
    toast.error("Failed to delete experience");
  } else {
    toast.success("Experience deleted");
  }
};


  const addCertificate = () => {
    setCertificates([
  ...certificates,
  { id: Date.now().toString(), name: "", issuer: "", date: "", file: null, file_url: "" }
])

  }

  const removeCertificate = (id: string) => {
    setCertificates(certificates.filter((c) => c.id !== id))
  }
const [viewCert, setViewCert] = useState<string | null>(null);
{/* CERTIFICATE VIEWER MODAL */}
{viewCert && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white p-4 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">

      <button
        onClick={() => setViewCert(null)}
        className="absolute top-4 right-4 text-black font-bold text-xl"
      >
        ✕
      </button>

      {/* IMAGE VIEW */}
      {viewCert.match(/\.(jpg|jpeg|png|gif)$/i) ? (
        <img src={viewCert} className="rounded-xl w-full" />
      ) : (
        <iframe
          src={viewCert}
          className="w-full h-[80vh] rounded-xl border"
        />
      )}
    </div>
  </div>
)}

if (!profile) {
  return (
    <DashboardLayout allowedRoles={["student"]}>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading profile…</div>
      </div>
    </DashboardLayout>
  );
}




  return (
    <DashboardLayout allowedRoles={["student"]}>
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Your Profile</h1>
            <p className="text-muted-foreground mt-1">Manage your personal information and preferences</p>
          </div>
          <Button onClick={handleSave} disabled={isLoading} className="rounded-xl">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>

        {/* Profile Header Card */}
        {/* Profile Header (Premium Gradient) */}
<div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-100 via-rose-100 to-purple-100 p-8 shadow-sm">

  {/* Background Glow */}
  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,white,transparent_70%)]" />

  <div className="relative flex flex-col md:flex-row items-start md:items-center gap-8">

    {/* Avatar */}
    <div className="relative shrink-0">
      <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-white shadow-md">
        <Avatar className="h-full w-full">
          <AvatarImage
            src={
              avatarFile
                ? URL.createObjectURL(avatarFile)
                : profile?.avatar_url || undefined
            }
          />
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
            {formData.fullName.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Camera button */}
      <label className="absolute bottom-1 right-1 h-9 w-9 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 shadow-md border border-white">
        <Camera className="h-4 w-4" />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
        />
      </label>
    </div>

    {/* Name & Stats */}
    <div className="flex-1">
      <div className="flex items-center gap-4 flex-wrap">
        <h2 className="text-2xl font-bold tracking-tight">
          {formData.fullName}
        </h2>

        {/* SkillConnect ID */}
        <span className="px-3 py-1 bg-white shadow-sm text-primary text-xs font-semibold rounded-full border">
          {user?.skillConnectId}
        </span>
      </div>

      <p className="text-muted-foreground mt-1">{formData.email}</p>

      {/* Stats Row */}
      <div className="flex items-center gap-6 mt-4">

        {/* Rating */}
        <div className="flex items-center gap-1 bg-white/80 px-3 py-1 rounded-full shadow-sm border">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span className="font-medium">{profile?.rating ?? 0}</span>
        </div>

        {/* Tasks */}
        <div className="flex items-center gap-1 bg-white/80 px-3 py-1 rounded-full shadow-sm border text-sm text-muted-foreground">
          <Award className="h-4 w-4" />
          <span>{profile?.tasks_completed ?? 0} tasks completed</span>
        </div>

      </div>
    </div>

  </div>
</div>


        {/* Personal Details */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
            <CardDescription>Your basic information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={formData.email} disabled className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Education & Skills */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Education & Skills</CardTitle>
            <CardDescription>Your academic background and expertise</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="college">College / Institution</Label>
              <Input
                id="college"
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="education">Education Details</Label>
              <Input
                id="education"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                placeholder="Degree, Institution (Year range)"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Skills</Label>
              <SkillTags
                value={formData.skills}
                onChange={(skills) => setFormData({ ...formData, skills })}
                maxTags={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Weekly Availability</Label>
              <Select
                value={formData.availability}
                onValueChange={(v) => setFormData({ ...formData, availability: v as typeof formData.availability })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="<10">Less than 10 hours/week</SelectItem>
                  <SelectItem value="10-20">10-20 hours/week</SelectItem>
                  <SelectItem value="20+">20+ hours/week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Experience & Projects */}
        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Experience & Projects</CardTitle>
                <CardDescription>Showcase your work history</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={addExperience} className="rounded-xl bg-transparent">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {experiences.map((exp, index) => {
  const isSaved = !!exp.isSaved; // determines if it should be locked + premium styling

  return (
    <div
      key={exp.id}
      className={`p-4 rounded-xl space-y-3 border ${
        isSaved
          ? "bg-white shadow-[0_0_12px_rgba(255,140,0,0.35)] border-orange-300"
          : "bg-muted/50 border-border shadow-sm"
      }`}
    >
      {/* Title + Delete */}
      <div className="flex items-start justify-between">
        <Input
          placeholder="Role / Title"
          value={exp.title}
          disabled={isSaved} // ❌ disable editing if saved
          onChange={(e) => {
            const updated = [...experiences];
            updated[index].title = e.target.value;
            setExperiences(updated);
          }}
          className="rounded-xl max-w-md"
        />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeExperience(exp.id)}
          className="text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Organization */}
      <Input
        placeholder="Organization Name"
        value={exp.organization}
        disabled={isSaved}
        onChange={(e) => {
          const updated = [...experiences];
          updated[index].organization = e.target.value;
          setExperiences(updated);
        }}
        className="rounded-xl"
      />

      {/* Start + End Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Start Date</Label>
          <Input
            type="date"
            value={exp.startDate}
            disabled={isSaved}
            onChange={(e) => {
              const updated = [...experiences];
              updated[index].startDate = e.target.value;
              setExperiences(updated);
            }}
          />
        </div>

        <div className="space-y-1">
          <Label>End Date</Label>
          <Input
            type="date"
            value={exp.endDate}
            disabled={isSaved}
            onChange={(e) => {
              const updated = [...experiences];
              updated[index].endDate = e.target.value;
              setExperiences(updated);
            }}
          />
        </div>
      </div>

      {/* Description */}
      <Textarea
        placeholder="Roles and Responsibilities"
        value={exp.description}
        disabled={isSaved}
        onChange={(e) => {
          const updated = [...experiences];
          updated[index].description = e.target.value;
          setExperiences(updated);
        }}
        rows={3}
        className="rounded-xl resize-none"
      />
    </div>
  );
})}


            {experiences.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No experience added yet. Click "Add" to add your first entry.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Certificates */}
        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Certificates</CardTitle>
                <CardDescription>Upload and manage your certificates</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={addCertificate} className="rounded-xl bg-transparent">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
          {certificates.map((cert, index) => (
  <div
    key={cert.id}
    className="p-5 rounded-2xl space-y-4 shadow-lg border border-orange-200 bg-white"
  >

    {/* Top Row Inputs + Delete */}
    <div className="flex items-start justify-between">
      <div className="flex-1 grid md:grid-cols-3 gap-3">
        <Input
          placeholder="Certificate name"
          value={cert.name}
          onChange={(e) => {
            const updated = [...certificates];
            updated[index].name = e.target.value;
            setCertificates(updated);
          }}
          className="rounded-xl"
        />

        <Input
          placeholder="Issuer"
          value={cert.issuer}
          onChange={(e) => {
            const updated = [...certificates];
            updated[index].issuer = e.target.value;
            setCertificates(updated);
          }}
          className="rounded-xl"
        />

        <Input
          type="date"
          value={cert.date}
          onChange={(e) => {
            const updated = [...certificates];
            updated[index].date = e.target.value;
            setCertificates(updated);
          }}
          className="rounded-xl"
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => removeCertificate(cert.id)}
        className="text-destructive ml-3"
      >
        <Trash2 className="h-5 w-5" />
      </Button>
    </div>

    {/* File Uploader OR Preview */}
    {!cert.file_url && !cert.file ? (
      <FileUploader
  value={null}
  accept="image/*,.pdf"
  onChange={async (file) => {
    if (!file) return;
    await uploadCertificateImmediately(cert.id, file);
  }}
/>

    ) : (
      <div className="pt-2">

        {/* FILE PREVIEW IMAGE (IF IMAGE) */}


        {/* ACTION BUTTONS BOTTOM-LEFT */}
       {/* ACTION BUTTONS BOTTOM-LEFT */}
<div className="flex gap-3 items-center mt-2">

  {/* VIEW FILE BUTTON */}
  <Button
    variant="outline"
    size="sm"
    className="rounded-xl border-orange-300 text-orange-600 hover:bg-orange-50"
    asChild
  >
    <a href={cert.file_url} target="_blank">
      View File
    </a>
  </Button>

  {/* UPDATE FILE BUTTON */}
  {/* <Button
    variant="outline"
    size="sm"
    className="rounded-xl border-orange-300 text-orange-600 hover:bg-orange-50"
    onClick={() => {
      const updated = [...certificates];
      updated[index].file = null;
      updated[index].file_url = "";
      setCertificates(updated);
    }}
  >
    Update File
  </Button> */}

</div>

      </div>
    )}

  </div>
))}

            {certificates.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No certificates added yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Portfolio & Bio */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Portfolio & Bio</CardTitle>
            <CardDescription>Tell organizations about yourself</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">


{/* Resume Upload */}
{/* Resume Upload */}
{/* Resume Upload */}
<div className="space-y-2">
  <Label>Resume (PDF)</Label>

  {/* If NO resume uploaded → show uploader */}
  {!formData.resumeUrl ? (
    <FileUploader
      value={null}
      accept=".pdf"
      onChange={async (file) => {
        if (!file) return;
        await uploadResumeImmediately(file);
      }}
    />
  ) : (
    <div className="rounded-xl border border-orange-200 shadow-lg p-4 bg-white space-y-4">

      <div className="flex items-center justify-between">

        {/* VIEW RESUME BUTTON */}
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-orange-300 text-orange-600 hover:bg-orange-50"
          asChild
        >
          <a href={formData.resumeUrl} target="_blank">
            View Resume
          </a>
        </Button>

        {/* DELETE RESUME ICON BUTTON */}
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive"
          onClick={async () => {
            // remove from UI
            setFormData(prev => ({ ...prev, resumeUrl: "" }));

            // remove from DB
            await supabase
              .from("student_profiles")
              .update({ resume_url: "" })
              .eq("user_id", user.id);

            toast.success("Resume deleted.");
          }}
        >
          <Trash2 className="h-5 w-5" />
        </Button>

      </div>

    </div>
  )}
</div>




            <div className="space-y-2">
              <Label htmlFor="portfolioUrl">Portfolio URL/Linkedin URL</Label>
              <Input
                id="portfolioUrl"
                type="url"
                placeholder="https://yourportfolio.com"
                value={formData.portfolioUrl}
                onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself, your interests, and what you're looking for..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="rounded-xl resize-none"
              />
            </div>
          </CardContent>
        </Card>

      {/* Bank Details */}
<Card className="rounded-2xl">
  <CardHeader>
    <CardTitle>Payout Details</CardTitle>
    <CardDescription>Bank account for receiving payments</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="grid md:grid-cols-2 gap-4">

      {/* Bank Account Number */}
      <div className="space-y-2">
        <Label htmlFor="bankAccount">Bank Account Number</Label>
        <Input
          id="bankAccount"
          type="password"               // 👈 MASKS INPUT AS STARS
          value={formData.bankAccount}
          onChange={(e) =>
            setFormData({ ...formData, bankAccount: e.target.value })
          }
          className="rounded-xl"
        />
      </div>

      {/* IFSC Code */}
      <div className="space-y-2">
        <Label htmlFor="ifscCode">IFSC Code</Label>
        <Input
          id="ifscCode"
          type="password"               // 👈 MASK THIS TOO
          value={formData.ifscCode}
          onChange={(e) =>
            setFormData({ ...formData, ifscCode: e.target.value })
          }
          className="rounded-xl"
        />
      </div>
    </div>

    <p className="text-sm text-muted-foreground">
      Your bank details are encrypted and secure. They are only used for processing payouts.
    </p>
  </CardContent>
</Card>


        {/* Save Button (bottom) */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isLoading} className="rounded-xl">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
