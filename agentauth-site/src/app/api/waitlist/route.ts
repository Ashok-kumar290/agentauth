import { NextRequest, NextResponse } from "next/server";

/**
 * Waitlist API - Handles email signups
 * In production, this would connect to Supabase or similar
 */

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // In production, save to database
    // For now, just log and return success
    console.log("Waitlist signup:", email);

    // TODO: Connect to Supabase or email service
    // await supabase.from('waitlist').insert({ email });

    return NextResponse.json(
      { success: true, message: "Added to waitlist" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      { error: "Failed to add to waitlist" },
      { status: 500 }
    );
  }
}
