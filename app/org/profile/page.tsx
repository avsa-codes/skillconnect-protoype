"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Save } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser"

export default function OrgProfilePage() {
  // const { user } = useAuth()
  const { user: orgUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const supabase = createSupabaseBrowserClient()




  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: orgUser?.email ?? "",
    phone: "",
    companySize: "",
    industry: "",
    city: "",
    description: "",
    logo_url: "",
  })

  // load profile on mount / when user changes
  useEffect(() => {
    if (!orgUser?.id) {
      setLoading(false)
      return
    }

    let mounted = true
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("organization_profiles")
          .select("*")
          .eq("user_id", orgUser.id)
          .maybeSingle()

        if (error) {
          console.warn("fetch org profile error:", error)
        }

        if (!mounted) return

        if (data) {
          setFormData({
            companyName: data.company_name || "",
            contactPerson: data.contact_person || "",
            email: data.email || orgUser.email || "",
            phone: data.phone || "",
            companySize: data.company_size || "",
            industry: data.industry || "",
            city: data.city || "",
            description: data.description || "",
            logo_url: data.logo_url || "",
          })
        } else {
          // no row yet — prefill email from auth
          setFormData(prev => ({ ...prev, email: orgUser.email || "" }))
        }
      } catch (err) {
        console.error("load org profile:", err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgUser?.id])




const handleLogoUpload = async (e: any) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (!orgUser?.id) return toast.error("User not logged in");

  const ext = file.name.split(".").pop();
  const filePath = `${orgUser.id}.${ext}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from("org-files")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    console.error(uploadError);
    toast.error("Failed to upload logo");
    return;
  }

  // Get public URL
  const { data } = supabase.storage
    .from("org-files")
    .getPublicUrl(filePath);

  const url = data.publicUrl;

  // Update UI immediately
  setFormData((prev) => ({ ...prev, logo_url: url }));

  // 🔥 AUTO-SAVE TO DATABASE
  const { error: dbError } = await supabase
    .from("organization_profiles")
    .update({
      logo_url: url,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", orgUser.id);

  if (dbError) {
    console.error(dbError);
    toast.error("Failed to save logo");
    return;
  }

  toast.success("Logo updated!");
};






  const handleSave = async () => {
    if (!orgUser?.id) {
      toast.error("Not authenticated")
      return
    }

    setIsSaving(true)
    try {
      // upsert so row is created if it doesn't exist
      const payload = {
        user_id: orgUser.id,
        company_name: formData.companyName,
        contact_person: formData.contactPerson,
        email: formData.email || orgUser.email,
        phone: formData.phone,
        company_size: formData.companySize,
        industry: formData.industry,
        city: formData.city,
        description: formData.description,
        logo_url: formData.logo_url || null,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
  .from("organization_profiles")
  .upsert(payload)


      if (error) {
        console.error("Failed saving org profile:", error)
        toast.error("Failed to save changes")
      } else {
        toast.success("Profile updated successfully!")
      }
    } catch (err) {
      console.error("save org profile error:", err)
      toast.error("Failed to save changes")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DashboardLayout allowedRoles={["organization_user", "admin", "super_admin"]}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Company Profile</h1>
          <p className="text-muted-foreground">Manage your organization&apos;s public information</p>
        </div>

{/* Premium Gradient Header */}
<div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-100 via-rose-100 to-purple-100 p-8 shadow-sm mb-8">

  {/* Glow */}
  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,white,transparent_70%)]" />

  <div className="relative flex flex-col md:flex-row items-start md:items-center gap-8">

    {/* Logo Preview Circle */}
    <div className="relative shrink-0">
      <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-white flex items-center justify-center">
        {formData.logo_url ? (
          <img src={formData.logo_url} className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-muted-foreground">No Logo</span>
        )}
      </div>

      {/* Upload Button (camera style) */}
      <label className="absolute bottom-1 right-1 h-9 w-9 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 shadow-md border border-white">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h4l2-3h6l2 3h4v13H3V7z" />
        </svg>
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleLogoUpload}
        />
      </label>
    </div>

    {/* Company Name & Email */}
    <div className="flex-1">
      <h2 className="text-2xl font-bold tracking-tight">{formData.companyName || "Organization"}</h2>
      <p className="text-muted-foreground mt-1">{formData.email}</p>

      <div className="flex gap-4 mt-4">
        <span className="px-3 py-1 bg-white/80 text-primary text-xs font-semibold rounded-full border shadow-sm">
          {formData.companySize || "Size not set"}
        </span>
        <span className="px-3 py-1 bg-white/80 text-primary text-xs font-semibold rounded-full border shadow-sm">
          {formData.industry || "Industry not set"}
        </span>
      </div>
    </div>
  </div>
</div>



        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>Basic details about your organization</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="contactPerson">Contact Person *</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Work Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companySize">Company Size *</Label>
                <Select value={formData.companySize} onValueChange={(v) => setFormData({ ...formData, companySize: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="500+">500+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="industry">Industry *</Label>
                <Select value={formData.industry} onValueChange={(v) => setFormData({ ...formData, industry: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="IT Services">IT Services</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="E-commerce">E-commerce</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="mt-1" />
            </div>

            <div>
              <Label htmlFor="description">Company Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tell us about your company..."
                className="mt-1 min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving || loading} size="lg">
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}

