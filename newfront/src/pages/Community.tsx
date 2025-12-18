import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ImageIcon,
  Smile,
  Calendar,
  MapPin,
  Heart,
  Repeat2,
  Share,
  MoreHorizontal,
  MessageCircle,
} from "lucide-react";
import { Navbar05 } from "./navbar";
import LeftPanel from "../components/LeftPanel";
import { useUserStore } from "@/stores/user.store";
import { useEffect } from "react";

export default function Community() {
  const user = useUserStore((s) => s.user);
  useEffect(() => {
    console.log("USER AFTER HYDRATE:", user);
  }, [user]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar05 />

      <div className="flex w-full justify-center">
        {/* 1. LEFT PANEL (Sidebar trái - Sticky) */}
        <div className="hidden md:block sticky top-[60px] h-[calc(100vh-60px)] w-64 border-r z-30 overflow-y-auto">
          <LeftPanel />
        </div>

        {/* 2. MAIN CONTENT AREA (Bao gồm Timeline và Right Sidebar) */}
        {/* flex-1 để chiếm hết không gian còn lại */}
        <div className="flex flex-1 justify-center min-w-0">
          <div className="w-full max-w-2xl border-r border-border min-h-screen"></div>
        </div>
      </div>
    </div>
  );
}
