import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera } from "lucide-react";

interface ProfileHeaderProps {
  name: string;
  username?: string;
  avatarUrl?: string;
}

export function ProfileHeader({
  name,
  username,
  avatarUrl,
}: ProfileHeaderProps): React.ReactElement {
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 md:items-center">
          <div className="relative">
            <Avatar className="h-24 w-24">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={name} />
              ) : (
                <AvatarImage
                  src="/placeholder.svg?height=96&width=96"
                  alt={name}
                />
              )}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            <Button
              size="icon"
              variant="outline"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
            >
              <Camera className="h-4 w-4" />
              <span className="sr-only">Change avatar</span>
            </Button>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold">{name}</h2>
            {username && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>@{username}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
