import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { usePushNotifications } from "@/hooks/usePushNotification";
import React, { useState } from "react";
import { toast } from "sonner";

export function NotificationSettings(): React.ReactElement {
  const { subscribeUser } = usePushNotifications();
  const [isPushEnabled, setIsPushEnabled] = useState(false);

  const handlePushChange = async (checked: boolean) => {
    if (checked) {
      // switch
      await subscribeUser();
      setIsPushEnabled(true);
    } else {
      toast.info(
        "Để tắt hoàn toàn thông báo, vui lòng cấu hình trong cài đặt trình duyệt."
      );
      setIsPushEnabled(false);
    }
  };

  const handleSavePreferences = () => {
    toast.success("Preferences saved successfully!");
  };
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Configure how you receive notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <div className="text-sm text-muted-foreground">
                Receive notifications via email.
              </div>
            </div>
            <Switch id="email-notifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <div className="text-sm text-muted-foreground">
                Receive notifications on your device.
              </div>
            </div>
            <Switch
              id="push-notifications"
              checked={isPushEnabled}
              onCheckedChange={handlePushChange}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing-emails">Marketing Emails</Label>
              <div className="text-sm text-muted-foreground">
                Receive emails about new features and updates.
              </div>
            </div>
            <Switch id="marketing-emails" />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="security-emails">Security Emails</Label>
              <div className="text-sm text-muted-foreground">
                Receive emails about your account security.
              </div>
            </div>
            <Switch id="security-emails" defaultChecked />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSavePreferences}>Save Preferences</Button>
      </CardFooter>
    </Card>
  );
}
