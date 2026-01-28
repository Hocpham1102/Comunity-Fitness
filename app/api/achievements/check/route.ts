import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkAndUnlockAchievements } from "@/lib/server/services/achievement.service";

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const unlockedAchievements = await checkAndUnlockAchievements(
            session.user.id
        );

        return NextResponse.json({
            success: true,
            newUnlocks: unlockedAchievements,
            count: unlockedAchievements.length,
        });
    } catch (error) {
        console.error("Check achievements error:", error);
        return NextResponse.json(
            { error: "Failed to check achievements" },
            { status: 500 }
        );
    }
}
