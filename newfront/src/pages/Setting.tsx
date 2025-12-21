import { ProfileHeader } from "@/components/profile-header";
import { AccountSettings } from "@/components/account-settings";
import { NotificationSettings } from "@/components/notification-settings";
import { PrivacySettings } from "@/components/privacy-settings";

export default function Settings() {
  return (
    <div className="container mx-auto py-10 space-y-8 pl-10 pr-10">
      <h1 className="text-3xl font-bold">Settings</h1>
      <div className="grid gap-8">
          <div className="hidden md:block space-y-2"></div>
          <div className="space-y-10">
            <section id="notifications">
              <NotificationSettings />
            </section>
            <section id="privacy">
              <PrivacySettings />
            </section>
          </div>
      </div>
    </div>
  );
}
