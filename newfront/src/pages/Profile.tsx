import { ProfileHeader } from "@/components/profile-header";
import { AccountSettings } from "@/components/account-settings";
import { useAuthState } from "@/hooks/useAuthState";

export default function Profile() {
  const { userName, userEmail, userAvatar } = useAuthState();
  return (
    <div className="container mx-auto py-10 space-y-8 pl-10 pr-10">
      <h1 className="text-3xl font-bold">Profile</h1>
      <div className="grid gap-8 bg">
        <ProfileHeader name={userName} avatarUrl={userAvatar} />
        <div className="hidden md:block space-y-2"></div>
        <div className="space-y-10">
          <section id="account">
            <AccountSettings
              fullname={userName}
                email={userEmail || "Not found"}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
