import SettingsTabs from "@/components/settings/settings-tabs";
import ProfileInfo from "@/components/profile/profile-info";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/server/db/prisma";

async function getUserProfile(userId: string) {
    try {
        // Fetch user data directly from database
        const user = await db.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                role: true,
            },
        });

        if (!user) {
            return undefined;
        }

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

export default async function SettingsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    const userRole = session.user.role;
    const profileData = await getUserProfile(session.user.id);

    return (
        <div className="flex h-screen bg-background">
            <div className="flex-1 flex flex-col p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your account settings and preferences
                    </p>
                </div>

                {/* Settings Card */}
                <div className="bg-card border border-border rounded-lg p-8">
                    {/* Avatar Section */}
                    <ProfileInfo />

                    {/* Settings Tabs */}
                    <SettingsTabs userRole={userRole} initialData={profileData} />
                </div>
            </div>
        </div>
    );
}
