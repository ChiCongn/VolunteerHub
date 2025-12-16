import { useMemo, useState } from "react";
import { ProfileCard } from "../components/ProfileCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import type { User } from "../types/user";
import { UserRole, UserStatus } from "../types/enum";

export const sampleUser: User = {
  id: "user_001",
  username: "john_doe",
  email: "john.doe@example.com",
  avatarUrl: "https://i.pravatar.cc/150?img=3",

  role: UserRole.EventManager,
  status: UserStatus.Active,
  lastLogin: new Date("2025-12-10T08:30:00Z"),
  updatedAt: new Date(),

  notifications: ["notif_101", "notif_102"],
  postIds: ["post_001", "post_002"],
  participatedEventIds: ["event_1001"],
  registeredEventIds: ["event_1002", "event_1003"],
};

export function Profile() {
  const user = sampleUser;
  const [name, setName] = useState(user.username);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("");

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleUpdateProfile = () => {
    //onUpdateProfile({ name, bio, email });
    toast.success("Profile updated successfully!");
  };

  const getPasswordStrength = (password: string) => {
    if (!password) {
      return { strength: 0, label: "", color: "bg-gray-300" };
    }

    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const hasMinLength = password.length >= 8;

    const passedRules = [
      hasMinLength,
      hasLower,
      hasUpper,
      hasNumber,
      hasSpecial,
    ].filter(Boolean).length;

    const strength = (passedRules / 5) * 100;

    if (strength < 40) {
      return { strength, label: "Weak", color: "bg-[#F44336]" };
    }

    if (strength < 80) {
      return { strength, label: "Fair", color: "bg-[#FFC107]" };
    }

    if (hasMinLength && hasLower && hasUpper && hasNumber && hasSpecial) {
      return { strength: 100, label: "Good", color: "bg-[#43A047]" };
    }

    return { strength, label: "Fair", color: "bg-[#FFC107]" };
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";

    if (password.length < 8) return "Password must be at least 8 characters";

    if (!/[a-z]/.test(password))
      return "Password must contain a lowercase letter";

    if (!/[A-Z]/.test(password))
      return "Password must contain an uppercase letter";

    if (!/[0-9]/.test(password)) return "Password must contain a number";

    if (!/[^A-Za-z0-9]/.test(password))
      return "Password must contain a special character";

    return null; // ✅ GOOD PASSWORD
  };

  const passwordStrength = useMemo(
    () => getPasswordStrength(newPassword),
    [newPassword]
  );
  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    toast.success("Password changed successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="space-y-6">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <div className="container max-w-[1440px] mx-auto px-4 py-6 mb-16 md:mb-0">
            <div>
              <h1>Profile & Settings</h1>
              <p className="text-muted-foreground">
                Manage your account and preferences
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <ProfileCard
                  user={user}
                  isEdit={false}
                  eventsAttended={12}
                  hoursVolunteered={48}
                />
              </div>

              <div className="lg:col-span-2">
                <Tabs defaultValue="profile" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="notifications">
                      Notifications
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="profile" className="space-y-6">
                    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                      <div>
                        <h3 className="mb-4">Personal Information</h3>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>

                      <Separator />

                      <div className="flex justify-end">
                        <Button
                          onClick={handleUpdateProfile}
                          className="bg-[#43A047] hover:bg-[#388E3C]"
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="security" className="space-y-6">
                    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                      <div>
                        <h3 className="mb-4">Change Password</h3>
                        <p className="text-sm text-muted-foreground">
                          Ensure your account is secure by using a strong
                          password
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="current-password">
                          Current Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="login-password"
                            type={showPassword.current ? "text" : "password"}
                            placeholder="••••••••"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full"
                            aria-label={
                              showPassword.current
                                ? "Hide password"
                                : "Show password"
                            }
                            onClick={() =>
                              setShowPassword((s) => ({
                                ...s,
                                current: !s.current,
                              }))
                            }
                          >
                            {showPassword.current ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <div className="relative">
                          <Input
                            id="login-password"
                            type={showPassword.new ? "text" : "password"}
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => {
                              const value = e.target.value;
                              setNewPassword(value);
                              setPasswordError(validatePassword(value));
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full"
                            aria-label={
                              showPassword.new
                                ? "Hide password"
                                : "Show password"
                            }
                            onClick={() =>
                              setShowPassword((s) => ({
                                ...s,
                                new: !s.new,
                              }))
                            }
                          >
                            {showPassword.new ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </div>

                        {newPassword && (
                          <div className="space-y-2 pt-2">
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${passwordStrength.color}`}
                                style={{
                                  width: `${passwordStrength.strength}%`,
                                }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Strength:{" "}
                              <span className="font-medium">
                                {passwordStrength.label}
                              </span>
                            </p>
                          </div>
                        )}
                        {passwordError && (
                          <p className="text-sm text-red-600">
                            {passwordError}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">
                          Confirm New Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="login-password"
                            type={showPassword.confirm ? "text" : "password"}
                            placeholder="••••••••"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full"
                            aria-label={
                              showPassword.confirm
                                ? "Hide password"
                                : "Show password"
                            }
                            onClick={() =>
                              setShowPassword((s) => ({
                                ...s,
                                confirm: !s.confirm,
                              }))
                            }
                          >
                            {showPassword.confirm ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex justify-end">
                        <Button
                          onClick={handleChangePassword}
                          className="bg-[#43A047] hover:bg-[#388E3C]"
                          disabled={
                            !currentPassword || !newPassword || !confirmPassword
                          }
                        >
                          Update Password
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="notifications" className="space-y-6">
                    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                      <div>
                        <h3 className="mb-4">Notification Preferences</h3>
                        <p className="text-sm text-muted-foreground">
                          Choose how you want to receive updates
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                              Receive updates via email
                            </p>
                          </div>
                          <Switch
                            checked={emailNotifications}
                            onCheckedChange={setEmailNotifications}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Push Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                              Get notifications in your browser
                            </p>
                          </div>
                          <Switch
                            checked={pushNotifications}
                            onCheckedChange={setPushNotifications}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Event Reminders</Label>
                            <p className="text-sm text-muted-foreground">
                              Get reminded about upcoming events
                            </p>
                          </div>
                          <Switch
                            checked={eventReminders}
                            onCheckedChange={setEventReminders}
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="flex justify-end">
                        <Button
                          onClick={() => toast.success("Preferences saved!")}
                          className="bg-[#43A047] hover:bg-[#388E3C]"
                        >
                          Save Preferences
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
