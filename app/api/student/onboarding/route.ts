import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 🔐 Server-side admin client for Storage + DB writes
function getServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // MUST USE SERVICE ROLE
    { auth: { persistSession: false } }
  );
}

export async function POST(req: Request) {
  try {
    const supabase = getServerClient();
    const form = await req.formData();

    const user_id = form.get("user_id") as string;
    if (!user_id) return NextResponse.json({ error: "Missing user_id" }, { status: 400 });

    const full_name = form.get("full_name") as string;
    const phone = form.get("phone") as string;
    const college = form.get("college") as string;
    const city = form.get("city") as string;
    const skills = JSON.parse(form.get("skills") as string);
    const availability = form.get("availability") as string;
    const portfolio_url = form.get("portfolio_url") as string;
    const bio = form.get("bio") as string;

    const idFile = form.get("student_id_file") as File | null;
    let student_id_file_url: string | null = null;

    // -------------------------------
    // 1️⃣ UPLOAD FILE TO STORAGE
    // -------------------------------
    if (idFile) {
      const arrayBuffer = await idFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const ext = idFile.name.split(".").pop();
      const fileName = `student_id/${user_id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("student-files")
        .upload(fileName, buffer, {
          upsert: true,
          contentType: idFile.type,
        });

      if (uploadError) {
        console.error("UPLOAD ERROR:", uploadError);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
      }

      const { data: urlData } = supabase.storage
        .from("student-files")
        .getPublicUrl(fileName);

      student_id_file_url = urlData.publicUrl;
    }

    // -------------------------------
    // 2️⃣ UPSERT DB PROFILE
    // -------------------------------
    const { error: profileError } = await supabase
      .from("student_profiles")
      .upsert({
        user_id,
        full_name,
        phone,
        college,
        city,
        skills,
        availability,
        portfolio_url,
        bio,
        education: "",
        rating: 0,
        tasks_completed: 0,
        student_id_file_url,
        resume_url: null,
        profile_strength: 80,
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error("PROFILE ERROR:", profileError);
      return NextResponse.json({ error: "Profile save failed" }, { status: 500 });
    }

    // -------------------------------
    // 3️⃣ UPDATE AUTH METADATA
    // -------------------------------
    await supabase.auth.admin.updateUserById(user_id, {
      user_metadata: {
        full_name,
        profile_complete: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
