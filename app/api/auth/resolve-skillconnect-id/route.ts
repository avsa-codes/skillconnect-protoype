import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase server environment variables.");
}

// Admin client (service role key → server only)
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const scid = searchParams.get("scid");

    if (!scid) {
      return NextResponse.json({ error: "Missing SkillConnect ID" }, { status: 400 });
    }

    // Query Supabase Auth users by metadata
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error("Error listing users:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    // Find user with matching metadata SC-ID
    const matched = data.users.find(
      (u) => u.user_metadata?.skillconnect_id?.toUpperCase() === scid.toUpperCase()
    );

    if (!matched) {
      return NextResponse.json(
        { error: "SkillConnect ID not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      userId: matched.id,
      email: matched.email,
      role: matched.user_metadata?.role || null,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
////////////////////////////////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////
//////////////////
/////////
/////
//
//