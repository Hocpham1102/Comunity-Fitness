import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAchievementStats } from "@/lib/server/services/achievement.service";

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const stats = await getAchievementStats(session.user.id);

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Get achievement stats error:", error);
        return NextResponse.json(
            { error: "Failed to fetch achievement stats" },
            { status: 500 }
        );
    }
}
