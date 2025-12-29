import { getSessionOrNull } from "@/lib/server/auth/session";
import { NextRequest, NextResponse } from "next/server";
import { getUserProfile } from "@/lib/server/services/user.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get session (optional for public exercises)
    const session = await getSessionOrNull();

    const userid = session?.user ? session.user.id : "";

    const result = await getUserProfile(userid);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Search exercises error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
