import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, TrendingUp, Trophy, Star } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
    getUserAchievementsByCategory,
    getAchievementStats,
} from "@/lib/server/services/achievement.service";
import { AchievementGrid } from "@/components/features/achievements/AchievementGrid";
import Link from "next/link";

export default async function AchievementsPage() {
    const session = await auth();
    if (!session?.user?.email) {
        redirect("/login");
    }

    const [grouped, stats] = await Promise.all([
        getUserAchievementsByCategory(session.user.id),
        getAchievementStats(session.user.id),
    ]);

    const allAchievements = Object.values(grouped).flat();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">Achievements</h1>
                <p className="text-muted-foreground">
                    Track your progress and unlock rewards as you reach new milestones
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">
                                    {stats.unlockedAchievements}
                                </div>
                                <div className="text-sm text-muted-foreground">Unlocked</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                <Star className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.totalPoints}</div>
                                <div className="text-sm text-muted-foreground">Points</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.unlockRate}%</div>
                                <div className="text-sm text-muted-foreground">Completion</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                                <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">
                                    {stats.totalAchievements}
                                </div>
                                <div className="text-sm text-muted-foreground">Total</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tier Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Tier Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {Object.entries(stats.tierBreakdown).map(([tier, data]) => (
                            <div key={tier} className="text-center">
                                <div className="text-2xl font-bold">
                                    {data.unlocked}/{data.total}
                                </div>
                                <Badge
                                    variant="outline"
                                    className="mt-2"
                                >
                                    {tier}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* All Achievements */}
            <AchievementGrid achievements={allAchievements} showFilters={true} />

            {/* Call to Action */}
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
                <CardContent className="pt-6 text-center">
                    <Trophy className="w-12 h-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-xl font-bold mb-2">Keep Going!</h3>
                    <p className="text-muted-foreground mb-4">
                        Complete more workouts to unlock new achievements and earn points
                    </p>
                    <Button asChild>
                        <Link href="/workouts">Browse Workouts</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
