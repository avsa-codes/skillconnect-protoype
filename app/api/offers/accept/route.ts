import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // same pattern as your /create route
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { offer_id, action } = body;

    // ✅ We ONLY require these 2 from frontend
    if (!offer_id || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const new_status =
      action === "accept" ? "accepted" : action === "decline" ? "declined" : null;

    if (!new_status) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    // 1. Get the offer (we need task + student)
    const { data: offer, error: offerErr } = await supabase
      .from("offers")
      .select("id, task_id, student_id")
      .eq("id", offer_id)
      .maybeSingle();

    if (offerErr || !offer) {
      console.error("Offer not found or error:", offerErr);
      return NextResponse.json(
        { error: "Offer not found" },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();

    // 2. Update offer status + responded_at
    const { error: updateOfferErr } = await supabase
      .from("offers")
      .update({
        status: new_status,
        responded_at: now,
      })
      .eq("id", offer_id);

    if (updateOfferErr) {
      console.error("Error updating offer:", updateOfferErr);
      return NextResponse.json(
        { error: updateOfferErr.message },
        { status: 500 }
      );
    }

    // 3. If accepted, attach student to the task (assigned_students array)
    if (new_status === "accepted" && offer.task_id && offer.student_id) {
      const { data: task, error: taskErr } = await supabase
        .from("tasks")
        .select("assigned_students")
        .eq("id", offer.task_id)
        .maybeSingle();

      if (!taskErr && task) {
        const current =
          (task.assigned_students as string[] | null) ?? [];

        // only add if not already present
        if (!current.includes(offer.student_id)) {
          const updated = [...current, offer.student_id];

          const { error: updateTaskErr } = await supabase
            .from("tasks")
            .update({
              assigned_students: updated,
              status: "active",
            })
            .eq("id", offer.task_id);

          if (updateTaskErr) {
            console.error("Error updating task:", updateTaskErr);
            // don’t fail the whole request for this, but log it
          }
        }
      } else {
        console.error("Error loading task for offer:", taskErr);
      }
    }

    return NextResponse.json({
      success: true,
      status: new_status,
    });
  } catch (err: any) {
    console.error("Offer accept API error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
