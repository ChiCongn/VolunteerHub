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
import LeftPanel from "../components/LeftPanel";
import { useUserStore } from "@/stores/user.store";
import { useEffect } from "react";

export default function Feed() {
  const user = useUserStore((s) => s.user);
  useEffect(() => {
    console.log("USER AFTER HYDRATE:", user);
  }, [user]);

  return (
    <div className="min-h-screen bg-white">
      {/* <Navbar05 /> */}

      <div className="flex w-full justify-center">
        {/* 1. LEFT PANEL (Sidebar trái - Sticky) */}
        <div className="hidden md:block sticky top-[60px] h-[calc(100vh-60px)] w-64 border-r z-30 overflow-y-auto">
          {/* <LeftPanel /> */}
        </div>

        {/* 2. MAIN CONTENT AREA (Bao gồm Timeline và Right Sidebar) */}
        {/* flex-1 để chiếm hết không gian còn lại */}
        <div className="flex flex-1 justify-center min-w-0">
          {/* --- TIMELINE (Ở giữa) --- */}
          <div className="w-full max-w-2xl border-r border-border min-h-screen">
            {/* Post Composer */}
            <div className="border-b p-4">
              <div className="flex space-x-3">
                <Avatar>
                  <AvatarImage src="https://bundui-images.netlify.app/avatars/06.png" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Input
                    placeholder="What's happening?"
                    className="placeholder:text-muted-foreground border-none p-0 text-xl focus-visible:ring-0"
                  />
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-500 hover:bg-blue-50"
                      >
                        <ImageIcon />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-500 hover:bg-blue-50"
                      >
                        <Smile />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-500 hover:bg-blue-50"
                      >
                        <Calendar />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-500 hover:bg-blue-50"
                      >
                        <MapPin />
                      </Button>
                    </div>
                    <Button variant="outline">Post</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Posts */}
            <div>
              {/* Post 1 */}
              <Card className="border-b rounded-none border-t-0 border-x-0 p-4 bg-transparent shadow-none hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer">
                <div className="flex space-x-3">
                  <Avatar>
                    <AvatarImage src="https://bundui-images.netlify.app/avatars/01.png" />
                    <AvatarFallback>MS</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">Moyo Shiro</span>
                      <span className="text-muted-foreground">@moyo</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">09:00 AM</span>
                      <Button variant="ghost" size="sm" className="ml-auto">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed">
                      Just launched my new portfolio website! 🚀 Check out these
                      15 standout examples of creative, sleek, and interactive
                      portfolio designs that inspired me. Which one's your
                      favorite? #WebDesign #PortfolioInspiration
                    </p>
                    <div className="text-muted-foreground mt-3 flex items-center space-x-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center space-x-2 hover:text-red-500"
                      >
                        <Heart className="h-4 w-4" />
                        <span className="text-sm">62</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center space-x-2 hover:text-green-500"
                      >
                        <Repeat2 className="h-4 w-4" />
                        <span className="text-sm">23</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center space-x-2 hover:text-blue-500"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-sm">45</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:text-blue-500"
                      >
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Post 2 */}
              <Card className="border-b rounded-none border-t-0 border-x-0 p-4 bg-transparent shadow-none hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer">
                <div className="flex space-x-3">
                  <Avatar>
                    <AvatarImage src="https://bundui-images.netlify.app/avatars/10.png" />
                    <AvatarFallback>S</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">Sophia</span>
                      <span className="text-muted-foreground">@sophia</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">10:12 AM</span>
                      <Button variant="ghost" size="sm" className="ml-auto">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed">
                      Dreaming of distant worlds... 🪐 This AI-generated image
                      captures the essence of exploration. What stories does it
                      spark in your imagination?
                    </p>
                    <div className="mt-3 overflow-hidden rounded-2xl">
                      <img
                        src="https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D"
                        alt="Saturn with rings in space"
                        className="w-full object-cover h-[300px]"
                      />
                    </div>
                    <div className="text-muted-foreground mt-3 flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center space-x-2 hover:text-red-500"
                      >
                        <Heart className="h-4 w-4" />
                        <span className="text-sm">128</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center space-x-2 hover:text-green-500"
                      >
                        <Repeat2 className="h-4 w-4" />
                        <span className="text-sm">34</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center space-x-2 hover:text-blue-500"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-sm">67</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:text-blue-500"
                      >
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* --- RIGHT SIDEBAR (Sticky nếu muốn, hoặc scroll theo trang) --- */}
          <div className="hidden lg:block w-80 space-y-6 p-4 bg-white">
            {/* Who to Follow */}
            <Card className=" bg-transparent">
              <CardHeader>
                <CardTitle>Who to follow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* User 1 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg?height=40&width=40" />
                        <AvatarFallback>G</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">George</p>
                        <p className="text-muted-foreground text-sm">
                          @georgeSZ
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Follow
                    </Button>
                  </div>
                  {/* User 2 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg?height=40&width=40" />
                        <AvatarFallback>NS</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">Nettie Schuster</p>
                        <p className="text-muted-foreground text-sm">
                          @Precious3
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Follow
                    </Button>
                  </div>
                  {/* User 3 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg?height=40&width=40" />
                        <AvatarFallback>LR</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">Mrs. Lola Rohan</p>
                        <p className="text-muted-foreground text-sm">
                          @collin_marks
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Follow
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card className=" bg-transparent">
              <CardHeader>
                <CardTitle>Trending Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-blue-600">
                      #TechInnovation
                    </span>
                    <span className="text-muted-foreground text-sm">
                      5.2K posts
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-blue-600">
                      #ArtificialIntelligence
                    </span>
                    <span className="text-muted-foreground text-sm">
                      12K posts
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-blue-600">
                      #ClimateAction
                    </span>
                    <span className="text-muted-foreground text-sm">
                      8.7K posts
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-blue-600">
                      #SpaceExploration
                    </span>
                    <span className="text-muted-foreground text-sm">
                      3.9K posts
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
