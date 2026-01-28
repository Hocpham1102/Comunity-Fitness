import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserAchievementsByCategory } from "@/lib/server/services/achievement.service";
import { AchievementTier, AchievementType } from "@prisma/client";

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const tier = searchParams.get("tier") as AchievementTier | null;
        const type = searchParams.get("type") as AchievementType | null;
        const unlocked = searchParams.get("unlocked");

        const grouped = await getUserAchievementsByCategory(session.user.id);

        // Flatten and filter
        let achievements = Object.values(grouped).flat();

        if (tier) {
            achievements = achievements.filter((a) => a.tier === tier);
        }

        if (type) {
            achievements = achievements.filter((a) => a.type === type);
        }

        if (unlocked !== null) {
            const isUnlocked = unlocked === "true";
            achievements = achievements.filter((a) => a.isUnlocked === isUnlocked);
        }

        return NextResponse.json({
            achievements,
            grouped,
        });
    } catch (error) {
        console.error("Get achievements error:", error);
        return NextResponse.json(
            { error: "Failed to fetch achievements" },
            { status: 500 }
        );
    }
}
