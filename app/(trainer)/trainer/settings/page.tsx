import SettingsTabs from "@/components/settings/settings-tabs";
import ProfileInfo from "@/components/profile/profile-info";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/server/db/prisma";

async function getUserProfile(userId: string) {
    try {
        const user = await db.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                role: true,
            },
        });
        if (!user) return undefined;
        return {
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role as string,
        };
    } catch (error) {
        console.error('Error fetching profile:', error);
        return undefined;
    }
}

export default async function TrainerSettingsPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');
    const profileData = await getUserProfile(session.user.id);

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your account settings and preferences
                </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-8">
                {/* Avatar Section */}
                <ProfileInfo />

                {/* Settings Tabs */}
                <SettingsTabs userRole="TRAINER" initialData={profileData} />
            </div>
        </div>
    );
}
