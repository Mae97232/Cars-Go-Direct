import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;

  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");

  if (!token_hash || type !== "recovery") {
    return NextResponse.redirect(
      `${origin}/reset-password?error=invalid_or_expired`
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    token_hash,
    type: "recovery",
  });

  if (error) {
    return NextResponse.redirect(
      `${origin}/reset-password?error=invalid_or_expired`
    );
  }

  return NextResponse.redirect(`${origin}/reset-password`);
}