import React from "react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Home,
    Users,
    Bell,
    MessageCircle,
    Bookmark,
    User,
    Settings,
    ImageIcon,
    Smile,
    Calendar,
    MapPin,
    Heart,
    Repeat2,
    Share,
    MoreHorizontal,
    Plus,
    ArrowUp,
    ArrowDown,
    MessageSquare,
    Share2,
} from "lucide-react";
import { Navbar05 } from "./navbar";
import LeftPanel from "../components/LeftPanel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const EventPage = () => {
    return (
        <div className="min-h-screen bg-[#dae0e6] dark:bg-zinc-950">
            {/* Navbar giữ nguyên ở trên cùng */}
            <Navbar05 />

            {/* --- BẮT ĐẦU LAYOUT CHÍNH (FLEX) --- */}
            <div className="flex w-full justify-center">
                {/* 1. LEFT PANEL (Sidebar trái) */}
                {/* hidden md:block: Ẩn trên mobile, hiện trên màn hình medium trở lên */}
                <div className="hidden md:block sticky top-[60px] h-[calc(100vh-60px)] z-30">
                    <LeftPanel />
                </div>

                {/* 2. MAIN CONTENT (Nội dung chính) */}
                {/* flex-1: Chiếm toàn bộ không gian còn lại */}
                {/* min-w-0: Ngăn flex item bị tràn */}
                <div className="flex-1 min-w-0 border-l border-zinc-200 dark:border-zinc-800">
                    {/* --- Phần nội dung cũ của bạn --- */}

                    {/* 1. HEADER SECTION */}

                    <div className="bg-white dark:bg-zinc-900 pb-4">
                        {/* Banner Image */}
                        <div className="h-40 w-full bg-gradient-to-r from-green-800 to-green-600 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-30 pattern-dots" />
                        </div>

                        <div className="container mx-auto px-4 max-w-5xl">
                            <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-8 mb-4 relative z-10">
                                {/* Avatar */}
                                <Avatar className="w-24 h-24 border-4 border-white dark:border-zinc-900 bg-white">
                                    <AvatarImage
                                        src="https://github.com/shadcn.png"
                                        alt="Forest App"
                                    />
                                    <AvatarFallback>FA</AvatarFallback>
                                </Avatar>

                                {/* Title & Actions */}
                                <div className="flex-1 flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4 mt-2 md:mt-0">
                                    <div>
                                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                                            r/forestapp
                                        </h1>
                                        <p className="text-zinc-500 text-sm font-medium">
                                            r/forestapp
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            className="rounded-full px-6"
                                            variant="outline"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />{" "}
                                            Create Post
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="rounded-full"
                                        >
                                            <Bell className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="rounded-full font-bold px-6"
                                        >
                                            Joined
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-full"
                                        >
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. MAIN LAYOUT (GRID) */}
                    <div className="container mx-auto px-4 max-w-5xl py-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* LEFT COLUMN: FEED */}
                            <div className="lg:col-span-2 space-y-4">
                                {/* Highlights Section */}
                                <div className="space-y-2">
                                    <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide">
                                        Community highlights
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Card className="bg-green-50 border-green-200 overflow-hidden cursor-pointer hover:border-green-300 transition-colors">
                                            <CardHeader className="p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-white/80"
                                                    >
                                                        Meta
                                                    </Badge>
                                                </div>
                                                <CardTitle className="text-md">
                                                    META Megapost - All you need
                                                    to know...
                                                </CardTitle>
                                            </CardHeader>
                                        </Card>
                                        <Card className="bg-white border-zinc-200 cursor-pointer hover:border-zinc-300 transition-colors">
                                            <CardHeader className="p-4">
                                                <CardTitle className="text-md">
                                                    MEGATHREAD - Do you need
                                                    trees...
                                                </CardTitle>
                                                <CardDescription>
                                                    92 votes • 2.3k comments
                                                </CardDescription>
                                            </CardHeader>
                                        </Card>
                                    </div>
                                </div>

                                {/* Filter Bar */}
                                <div className="flex items-center gap-2 mb-4">
                                    <Button
                                        variant="ghost"
                                        className="font-bold text-zinc-700 hover:bg-zinc-200 rounded-full"
                                    >
                                        Best
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="font-bold text-zinc-500 hover:bg-zinc-200 rounded-full"
                                    >
                                        Hot
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="font-bold text-zinc-500 hover:bg-zinc-200 rounded-full"
                                    >
                                        New
                                    </Button>
                                </div>

                                {/* Post Card Example 2*/}
                                <Card className="border-b p-4 bg-white hover:border-zinc-400 transition-colors cursor-pointer">
                                    <div className="flex space-x-3">
                                        <Avatar>
                                            <AvatarImage src="https://bundui-images.netlify.app/avatars/01.png" />
                                            <AvatarFallback>MS</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-semibold">
                                                    Moyo Shiro
                                                </span>
                                                <span className="text-muted-foreground">
                                                    @moyo
                                                </span>
                                                <span className="text-muted-foreground">
                                                    ·
                                                </span>
                                                <span className="text-muted-foreground">
                                                    09:00 AM
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="ml-auto"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <p className="mt-2 text-sm leading-relaxed">
                                                Just launched my new portfolio
                                                website! 🚀 Check out these 15
                                                standout examples of creative,
                                                sleek, and interactive portfolio
                                                designs that inspired me. Which
                                                one's your favorite? #WebDesign
                                                #PortfolioInspiration
                                            </p>
                                            <div className="text-muted-foreground mt-3 flex items-center space-x-6">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="flex items-center space-x-2 hover:text-red-500"
                                                >
                                                    <Heart className="h-4 w-4" />
                                                    <span className="text-sm">
                                                        62
                                                    </span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="flex items-center space-x-2 hover:text-green-500"
                                                >
                                                    <Repeat2 className="h-4 w-4" />
                                                    <span className="text-sm">
                                                        23
                                                    </span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="flex items-center space-x-2 hover:text-blue-500"
                                                >
                                                    <MessageCircle className="h-4 w-4" />
                                                    <span className="text-sm">
                                                        45
                                                    </span>
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

                            {/* RIGHT COLUMN: SIDEBAR */}
                            <div className="hidden lg:block space-y-4">
                                {/* About Community Card */}
                                <Card>
                                    <CardHeader className="bg-green-100 dark:bg-green-900/20 rounded-t-lg py-3 px-4 flex flex-row justify-between items-center">
                                        <span className="font-bold text-sm">
                                            About Community
                                        </span>
                                        <MoreHorizontal className="w-4 h-4 text-zinc-500 cursor-pointer" />
                                    </CardHeader>
                                    {/* ... (Phần nội dung sidebar cũ giữ nguyên) ... */}
                                    <div className="p-4 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-12 h-12">
                                                <AvatarImage src="https://github.com/shadcn.png" />
                                                <AvatarFallback>
                                                    FA
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">
                                                Forest - Stay focused
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-600">
                                            Welcome to r/forestapp!
                                        </p>
                                        <Separator />
                                        <div className="flex justify-between text-sm">
                                            <div>
                                                <div className="font-bold">
                                                    7.3k
                                                </div>
                                                <div>Focused</div>
                                            </div>
                                            <div>
                                                <div className="font-bold">
                                                    379
                                                </div>
                                                <div>Distracted</div>
                                            </div>
                                        </div>
                                        <Button className="w-full rounded-full">
                                            Create Post
                                        </Button>
                                    </div>
                                </Card>

                                {/* Community Rules */}
                                <Card>
                                    <CardHeader className="py-3">
                                        <span className="font-bold text-sm uppercase text-zinc-500">
                                            Community Bookmarks
                                        </span>
                                    </CardHeader>
                                    <div className="flex flex-col">
                                        <Button
                                            variant="ghost"
                                            className="justify-start rounded-none h-10 border-t font-normal"
                                        >
                                            Wiki
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="justify-start rounded-none h-10 border-t font-normal"
                                        >
                                            Flair challenge
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="justify-start rounded-none h-10 border-t font-normal"
                                        >
                                            Discord
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                    {/* --- HẾT PHẦN NỘI DUNG CŨ --- */}
                </div>
            </div>
        </div>
    );
};
