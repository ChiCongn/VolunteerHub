import React, { useRef, useState } from "react";
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

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [localAvatar, setLocalAvatar] = useState<string | undefined>(avatarUrl);

  const handleOpenFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setLocalAvatar(previewUrl);
  };

  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-1 md:items-center">
          <div className="flex flex-col items-center">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={localAvatar || "/placeholder.svg?height=96&width=96"}
                  alt={name}
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>

              <Button
                size="icon"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                onClick={handleOpenFile}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            <Button
              size="sm"
              className="mt-3 text-sm"
              
            >
              Change Your Avatar
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold">{name}</h2>
            {username && (
              <div className="text-muted-foreground">@{username}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
