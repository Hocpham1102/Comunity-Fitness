"use client";

import { Achievement, AchievementTier } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TIER_GRADIENTS } from "@/lib/constants/achievements";
import { Lock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AchievementCardProps {
    achievement: Achievement;
    className?: string;
}

const TIER_COLORS: Record<AchievementTier, string> = {
    BRONZE: "bg-gradient-to-br from-amber-700 to-orange-600 text-white",
    SILVER: "bg-gradient-to-br from-gray-400 to-gray-500 text-white",
    GOLD: "bg-gradient-to-br from-yellow-400 to-yellow-600 text-gray-900",
    PLATINUM: "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900",
    DIAMOND: "bg-gradient-to-br from-cyan-300 to-blue-400 text-gray-900",
};

const TIER_BORDER_COLORS: Record<AchievementTier, string> = {
    BRONZE: "border-amber-700",
    SILVER: "border-gray-400",
    GOLD: "border-yellow-500",
    PLATINUM: "border-gray-400",
    DIAMOND: "border-cyan-400",
};

export function AchievementCard({
    achievement,
    className,
}: AchievementCardProps) {
    const progressPercentage = Math.min(
        (achievement.progress / achievement.target) * 100,
        100
    );

    const isUnlocked = achievement.isUnlocked;

    return (
        <Card
            className={cn(
                "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
                isUnlocked
                    ? `border-2 ${TIER_BORDER_COLORS[achievement.tier]}`
                    : "border-muted opacity-75 hover:opacity-90",
                className
            )}
        >
            {/* Tier badge in corner */}
            <div className="absolute top-2 right-2 z-10">
                <Badge
                    className={cn(
                        "text-xs font-bold px-2 py-1",
                        TIER_COLORS[achievement.tier]
                    )}
                >
                    {achievement.tier}
                </Badge>
            </div>

            <CardContent className="p-6">
                {/* Icon and status */}
                <div className="flex items-start gap-4 mb-4">
                    <div
                        className={cn(
                            "text-5xl relative",
                            !isUnlocked && "grayscale opacity-50"
                        )}
                    >
                        {achievement.icon}
                        {isUnlocked && (
                            <div className="absolute -bottom-1 -right-1">
                                <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-100" />
                            </div>
                        )}
                        {!isUnlocked && (
                            <div className="absolute -bottom-1 -right-1">
                                <Lock className="w-5 h-5 text-muted-foreground" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{achievement.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {achievement.description}
                        </p>
                    </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">
                            {achievement.progress} / {achievement.target}
                        </span>
                    </div>

                    <Progress value={progressPercentage} className="h-2" />

                    {isUnlocked && achievement.unlockedAt && (
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                            ✓ Unlocked{" "}
                            {new Date(achievement.unlockedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </p>
                    )}

                    {!isUnlocked && progressPercentage > 0 && (
                        <p className="text-xs text-muted-foreground">
                            {Math.round(progressPercentage)}% complete
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
