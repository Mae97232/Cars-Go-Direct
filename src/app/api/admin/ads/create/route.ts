import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = createAdminClient();

  const formData = await req.formData();

  const title = String(formData.get("title") || "");
  const description = String(formData.get("description") || "");
  const image_url = String(formData.get("image_url") || "");
  const link_url = String(formData.get("link_url") || "");
  const placement = String(formData.get("placement") || "");
  const duration = Number(formData.get("duration") || 7);

  const start_at = new Date();
  const end_at = new Date();
  end_at.setDate(start_at.getDate() + duration);

  const { error } = await supabase.from("ads").insert({
    title,
    description,
    image_url,
    link_url,
    placement,
    status: "active",
    start_at,
    end_at,
    priority: 0,
  });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.redirect(new URL("/admin", req.url));
}