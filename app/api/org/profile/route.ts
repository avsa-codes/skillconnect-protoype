import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const form = await req.formData();

    const user_id = form.get("user_id") as string;
    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    // FORM FIELDS
    const company_name = form.get("company_name") as string;
    const contact_person = form.get("contact_person") as string;
    const email = form.get("email") as string;
    const phone = form.get("phone") as string;
    const company_size = form.get("company_size") as string;
    const industry = form.get("industry") as string;
    const city = form.get("city") as string;
    const description = form.get("description") as string;

    // FILE (LOGO)
    const logoFile = form.get("logo") as File | null;

    let logo_url: string | null = null;

    // 📌 If logo provided → upload to org-files bucket
    if (logoFile) {
      const ext = logoFile.name.split(".").pop();
      const fileName = `logos/${user_id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("org-files")
        .upload(fileName, logoFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error(uploadError);
        return NextResponse.json(
          { error: "Failed to upload logo" },
          { status: 500 }
        );
      }

      const { data: urlData } = supabase.storage
        .from("org-files")
        .getPublicUrl(fileName);

      logo_url = urlData.publicUrl;
    }

    // 📌 UPSERT organization_profiles
    const { error: upsertError } = await supabase
      .from("organization_profiles")
      .upsert(
        {
          user_id,
          company_name,
          contact_person,
          email,
          phone,
          company_size,
          industry,
          city,
          description,
          logo_url,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      console.error(upsertError);
      return NextResponse.json(
        { error: "Failed to save organization profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("ORG PROFILE ERROR:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
