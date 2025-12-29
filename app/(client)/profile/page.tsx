import ProfileForm from "@/components/profile/profile-form";
import ProfileHeader from "@/components/profile/profile-header";
import ProfileInfo from "@/components/profile/profile-info";

export default function ProfilePage() {
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
          <ProfileForm />
        </div>
      </div>
    </div>
  );
}
