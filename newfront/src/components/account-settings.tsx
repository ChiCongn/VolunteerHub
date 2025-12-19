import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import React, { useState } from "react";

interface AccountSettingsProps {
  fullname: string;
  email: string;
}

export function AccountSettings({
  fullname,
  email,
}: AccountSettingsProps): React.ReactElement {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading] = useState(false);
  const [message] = useState<string | null>(null);

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>
          Update your account information and email preferences.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* PROFILE INFO */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullname">Full Name</Label>
            <Input
              id="fullname"
              value={fullname}
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Gmail</Label>
            <Input
              id="email"
              value={email}
              disabled
            />
          </div>
        </div>

        <Separator />

        {/* CHANGE PASSWORD */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        {message && <div className="text-red-500">{message}</div>}
      </CardContent>

      <CardFooter className="flex justify-start gap-2">
        <Button disabled={loading}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
}
