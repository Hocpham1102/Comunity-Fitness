import ProfileForm from "@/components/profile/profile-form";
import ProfileHeader from "@/components/profile/profile-header";
import ProfileInfo from "@/components/profile/profile-info";
import { auth } from "@/auth";
import { db } from "@/lib/server/db/prisma";

async function getUserProfile(userId: string) {
  try {
    // Fetch user data with profile directly from database
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
        profile: {
          select: {
            dateOfBirth: true,
            gender: true,
            height: true,
            currentWeight: true,
            targetWeight: true,
            activityLevel: true,
            fitnessGoal: true,
            bmi: true,
            bmr: true,
            tdee: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    // Return only profile-related fields that the form expects
    return {
      dateOfBirth: user.profile?.dateOfBirth,
      gender: user.profile?.gender,
      height: user.profile?.height,
      currentWeight: user.profile?.currentWeight,
      targetWeight: user.profile?.targetWeight,
      activityLevel: user.profile?.activityLevel,
      fitnessGoal: user.profile?.fitnessGoal,
      bmi: user.profile?.bmi,
      bmr: user.profile?.bmr,
      tdee: user.profile?.tdee,
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    return <div>Please log in to view your profile</div>;
  }

  const profileData = await getUserProfile(session.user.id);

  return (
    <div className="flex h-screen bg-background">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Profile Header */}
        <ProfileHeader />

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-lg p-8">
          {/* Avatar Section */}
          <ProfileInfo />

          {/* Form Section */}
          <ProfileForm initialData={profileData ?? undefined} />
        </div>
      </div>
    </div>
  );
}
