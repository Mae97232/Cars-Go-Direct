import { NextResponse } from "next/server";
import { resend, getFromEmail } from "@/lib/resend";

export async function GET() {
  try {
    console.log("TEST EMAIL ROUTE");

    if (!resend) {
      return NextResponse.json({ error: "RESEND non configuré" });
    }

    const result = await resend.emails.send({
      from: getFromEmail(),
      to: "yorick-972@outlook.com",
      subject: "Test email Cars Go Direct",
      html: "<p>Test email depuis Resend</p>",
    });

    console.log("RESEND RESULT =", result);

    return NextResponse.json({
      success: true,
      result,
    });

  } catch (error) {
    console.error("ERROR =", error);

    return NextResponse.json({
      error: "Erreur envoi email",
    });
  }
}