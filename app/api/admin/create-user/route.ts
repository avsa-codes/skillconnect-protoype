
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ADMIN_SECRET = process.env.ADMIN_SUPER_SECRET!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ADMIN_SECRET) {
  throw new Error("Missing Supabase environment variables.");
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

export async function POST(req: Request) {
  try {
    // Verify admin secret
    const incomingSecret = req.headers.get("x-admin-secret");
    if (!incomingSecret || incomingSecret !== ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { role, email, password, profile } = body ?? {};
    console.log("### Received create-user role:", role);


    if (!role || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create auth user
    const { data: userData, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role,
        must_change_password: true,
      },
    });

    if (createErr || !userData || !userData.user) {
      console.error("createUser error:", createErr);
      return NextResponse.json(
        { error: createErr?.message || "Failed to create user" },
        { status: 500 }
      );
    }

    const userId = userData.user.id;

    // Generate SkillConnect ID
    const generatedSCID = `SC-${userId.replace(/-/g, "").slice(-6).toUpperCase()}`;

    // Update user metadata with SC ID + role
    const { error: updateMetaErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        role,
        skillconnect_id: generatedSCID,
        must_change_password: true,
      },
    });

    if (updateMetaErr) {
      console.warn("updateUserById metadata error:", updateMetaErr);
      // continue — profile insert can still run
    }

    // Choose sane default profile_strength for seeded accounts so admin UI treats them appropriately.
    // You can make this 0 if you want them to remain "incomplete".
    const defaultProfileStrength = profile?.profile_strength ?? 60;

    // Insert into correct profile table and include email + skillconnect_id
    if (role === "student") {
      const { error: insertErr } = await supabaseAdmin
        .from("student_profiles")
        .insert([
          {
            user_id: userId,
            full_name: profile?.full_name ?? "",
            email: email, // IMPORTANT: store email in profile for admin view ease
            phone: profile?.phone ?? null,
            college: profile?.college ?? null,
            city: profile?.city ?? null,
            skills: profile?.skills ?? [],
            availability: profile?.availability ?? null,
            bio: profile?.bio ?? null,
            portfolio_url: profile?.portfolio_url ?? null,
            student_id_file_url: null,
            resume_url: null,
            profile_strength: defaultProfileStrength,
            skillconnect_id: generatedSCID, // IMPORTANT: store SC-ID in profile
          },
        ]);

      if (insertErr) {
        console.error("Insert student_profiles error:", insertErr);
        // Continue and report below
      }
    }

if (role === "organization") {
  const { error: insertErr } = await supabaseAdmin
    .from("organization_profiles")
    .insert({
      user_id: userId,
      company_name: profile?.company_name ?? "",
      contact_person: profile?.contact_person ?? "",
      email,
      phone: profile?.phone ?? "",
      company_size: profile?.company_size ?? "",
      industry: profile?.industry ?? "",
      city: profile?.city ?? "",
      description: profile?.description ?? "",
      logo_url: null,
      tasks_posted: 0,
      active_students: 0,
      // ❌ DO NOT insert created_at / updated_at / skillconnect_id
    });

  if (insertErr) {
    console.error("Insert organization_profiles error:", insertErr);
  }
}
    



    // Insert into seed_created_users table
await supabaseAdmin.from("seed_created_users").insert({
  user_id: userId,
  name: profile?.full_name || profile?.company_name || email,
  email,
  role,
  skillconnect_id: generatedSCID,
  temp_password: password,
  status: "created"
});


    return NextResponse.json({
      success: true,
      userId,
      skillconnectId: generatedSCID,
      email,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
