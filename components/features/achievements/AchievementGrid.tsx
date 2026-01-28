"use client";

import { Achievement, AchievementType } from "@prisma/client";
import { AchievementCard } from "./AchievementCard";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface AchievementGridProps {
    achievements: Achievement[];
    showFilters?: boolean;
}

const CATEGORY_LABELS: Record<AchievementType, string> = {
    WORKOUT_COUNT: "Workout Count",
    STREAK: "Streak",
    VOLUME: "Volume",
    DURATION: "Duration",
    PERSONAL_RECORD: "Personal Records",
    CONSISTENCY: "Consistency",
    VARIETY: "Variety",
    EARLY_BIRD: "Early Bird",
    NIGHT_OWL: "Night Owl",
    WEEKEND_WARRIOR: "Weekend Warrior",
    NUTRITION: "Nutrition",
};

export function AchievementGrid({
    achievements,
    showFilters = true,
}: AchievementGridProps) {
    const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");
    const [sortBy, setSortBy] = useState<"tier" | "progress" | "recent">(
        "progress"
    );

    // Filter achievements
    let filtered = achievements;
    if (filter === "unlocked") {
        filtered = filtered.filter((a) => a.isUnlocked);
    } else if (filter === "locked") {
        filtered = filtered.filter((a) => !a.isUnlocked);
    }

    // Sort achievements
    const sorted = [...filtered].sort((a, b) => {
        if (sortBy === "tier") {
            const tierOrder = ["BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"];
            return tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier);
        } else if (sortBy === "progress") {
            const aProgress = (a.progress / a.target) * 100;
            const bProgress = (b.progress / b.target) * 100;
            return bProgress - aProgress;
        } else if (sortBy === "recent") {
            if (a.unlockedAt && b.unlockedAt) {
                return (
                    new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime()
                );
            }
            if (a.unlockedAt) return -1;
            if (b.unlockedAt) return 1;
            return 0;
        }
        return 0;
    });

    // Group by category
    const grouped = sorted.reduce((acc, achievement) => {
        if (!acc[achievement.type]) {
            acc[achievement.type] = [];
        }
        acc[achievement.type].push(achievement);
        return acc;
    }, {} as Record<AchievementType, Achievement[]>);

    return (
        <div className="space-y-6">
            {/* Filters */}
            {showFilters && (
                <div className="flex flex-wrap gap-4">
                    <Tabs value={filter} onValueChange={(v: any) => setFilter(v)}>
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
                            <TabsTrigger value="locked">Locked</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="progress">Progress</SelectItem>
                            <SelectItem value="tier">Tier</SelectItem>
                            <SelectItem value="recent">Recently Unlocked</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Achievement Grid */}
            {sorted.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No achievements found</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(grouped).map(([type, categoryAchievements]) => (
                        <div key={type}>
                            <h3 className="text-lg font-semibold mb-4">
                                {CATEGORY_LABELS[type as AchievementType]}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {categoryAchievements.map((achievement) => (
                                    <AchievementCard
                                        key={achievement.id}
                                        achievement={achievement}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
