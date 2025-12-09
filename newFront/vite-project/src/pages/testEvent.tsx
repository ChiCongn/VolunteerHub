import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { formatDistanceToNow } from "date-fns";

// UI Components
import { Navbar05 } from "./navbar";
import LeftPanel from "../components/leftPanel";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    MoreHorizontal,
    Plus,
    Heart,
    MessageCircle,
    Share2,
    ImageIcon,
    Link as LinkIcon,
    ArrowUp,
    ArrowDown,
    Bell,
    Calendar,
} from "lucide-react";

import { EventHeader } from "../components/EventHeader";
import { PostCard } from "../components/PostCard";
// Import Service & Types
import { eventService } from "@/services/event.service";
import { postService } from "@/services/post.service";
import type { Event, Post } from "@/types";

export const CommunityEventPage = () => {
    const { eventId } = useParams();

    // State
    const [event, setEvent] = useState<Event | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    // State quản lý content khi tạo post (có thể mở modal sau này)
    const [newPostContent, setNewPostContent] = useState("");

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            if (!eventId) return;
            try {
                setLoading(true);
                const [eventData, postsData] = await Promise.all([
                    eventService.getEventById(eventId),
                    postService.getPostsByEvent(eventId),
                ]);

                setEvent(eventData);
                setPosts(
                    postsData
                    //Array.isArray(postsData) ? postsData : postsData.data || []
                );
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [eventId]);

    // Handle Create Post (Giả lập)
    const handleCreatePost = () => {
        console.log("Open Create Post Modal");
        // Logic mở Modal tạo bài viết sẽ nằm ở đây
    };

    if (loading)
        return (
            <div className="min-h-screen flex justify-center items-center bg-[#dae0e6]">
                Loading...
            </div>
        );
    if (!event)
        return (
            <div className="min-h-screen flex justify-center items-center bg-[#dae0e6]">
                Event not found
            </div>
        );

    return (
        <div className="min-h-screen bg-[#dae0e6] dark:bg-black">
            <Navbar05 />

            <div className="flex w-full justify-center">
                {/* 1. LEFT SIDEBAR (Sticky) */}
                <div className="hidden md:block sticky top-[60px] h-[calc(100vh-60px)] z-30 w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <LeftPanel />
                </div>

                {/* 2. MAIN CONTENT AREA */}
                <div className="flex flex-1 justify-center min-w-0">
                    <div className="w-full">
                        {/* --- HEADER SECTION (Full Width Background White) --- */}
                        {
                            // <div className="bg-white dark:bg-zinc-900 pb-4 shadow-sm">
                            //     {/* Banner Area */}
                            //     <div className="h-24 md:h-40 w-full relative overflow-hidden">
                            //         {/* {event.imageUrl ? (
                            //         <img
                            //             src={event.imageUrl}
                            //             alt="Cover"
                            //             className="w-full h-full object-cover"
                            //         />
                            //     ) : (
                            //         // xanh neu k tim dc anh
                            //         <div className="w-full h-full bg-[#33a852]" />
                            //     )} */}
                            //         <div className="w-full h-full bg-[#33a852]" />
                            //     </div>
                            //     {/* Info Area (Avatar + Title) */}
                            //     <div className="container mx-auto px-4 max-w-5xl">
                            //         <div className="flex flex-col md:flex-row items-start gap-4 -mt-6 relative z-10">
                            //             {/* YÊU CẦU: Avatar đè lên banner */}
                            //             <Avatar className="w-20 h-20 md:w-24 md:h-24 border-4 border-white bg-white">
                            //                 <AvatarImage
                            //                     src={
                            //                         event.imageUrl ||
                            //                         "https://github.com/shadcn.png"
                            //                     }
                            //                     alt={event.name}
                            //                     className="object-cover"
                            //                 />
                            //                 <AvatarFallback className="text-2xl font-bold bg-zinc-100 text-zinc-500">
                            //                     {event.name
                            //                         .charAt(0)
                            //                         .toUpperCase()}
                            //                 </AvatarFallback>
                            //             </Avatar>
                            //             <div className="flex-1 flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4 mt-2">
                            //                 <div>
                            //                     <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                            //                         {event.name}
                            //                     </h1>
                            //                     <p className="text-zinc-500 text-sm font-medium">
                            //                         r/
                            //                         {event.name
                            //                             .toLowerCase()
                            //                             .replace(/\s+/g, "")}
                            //                     </p>
                            //                 </div>
                            //                 <div className="flex gap-2">
                            //                     <Button
                            //                         className="rounded-full px-6 font-semibold"
                            //                         variant="outline"
                            //                         onClick={handleCreatePost}
                            //                     >
                            //                         <Plus className="w-4 h-4 mr-2" />{" "}
                            //                         Create Post
                            //                     </Button>
                            //                     <Button
                            //                         variant="outline"
                            //                         size="icon"
                            //                         className="rounded-full"
                            //                     >
                            //                         <Bell className="w-4 h-4" />
                            //                     </Button>
                            //                     <Button
                            //                         className="rounded-full px-6 font-bold"
                            //                         variant="secondary"
                            //                     >
                            //                         Joined
                            //                     </Button>
                            //                     <Button
                            //                         variant="ghost"
                            //                         size="icon"
                            //                         className="rounded-full"
                            //                     >
                            //                         <MoreHorizontal className="w-4 h-4" />
                            //                     </Button>
                            //                 </div>
                            //             </div>
                            //         </div>
                            //     </div>
                            // </div>
                        }
                        <EventHeader
                            event={event}
                            onCreatePost={handleCreatePost}
                        />

                        {/* --- GRID CONTENT (Feed + Sidebar) --- */}
                        <div className="container mx-auto px-4 max-w-5xl py-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* LEFT COLUMN: FEED */}
                                <div className="md:col-span-2 space-y-4">
                                    <Card className="shadow-sm border border-zinc-200">
                                        <div className="p-2 flex gap-2">
                                            <Avatar className="w-10 h-10">
                                                {/* Ảnh user đang login (giả lập) */}
                                                <AvatarImage src="https://github.com/shadcn.png" />
                                                <AvatarFallback>
                                                    ME
                                                </AvatarFallback>
                                            </Avatar>
                                            <Input
                                                placeholder="Create Post"
                                                className="bg-zinc-100 hover:bg-white hover:border-blue-500 transition-colors cursor-text border-transparent"
                                                readOnly // Để khi click vào sẽ mở modal (xử lý sự kiện onClick)
                                                onClick={handleCreatePost}
                                            />
                                            <Button variant="ghost" size="icon">
                                                <ImageIcon className="w-5 h-5 text-zinc-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <LinkIcon className="w-5 h-5 text-zinc-500" />
                                            </Button>
                                        </div>
                                    </Card>

                                    {/* Filter Bar */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <Button
                                            variant="ghost"
                                            className="font-bold text-zinc-700 bg-zinc-200 rounded-full hover:bg-zinc-300"
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

                                    {/* POSTS LIST */}
                                    {
                                        // {posts.map((post) => (
                                        //     <Card
                                        //         key={post._id}
                                        //         className="shadow-sm border border-zinc-200 hover:border-zinc-400 transition-colors cursor-pointer overflow-hidden"
                                        //     >
                                        //         <div className="flex">
                                        //             {/* YÊU CẦU: Cột Vote bên trái (Giống Reddit Desktop) */}
                                        //             <div className="hidden md:flex w-10 bg-zinc-50 flex-col items-center pt-3 gap-1 border-r border-transparent">
                                        //                 <Button
                                        //                     variant="ghost"
                                        //                     size="icon"
                                        //                     className="h-6 w-6 text-zinc-500 hover:bg-zinc-200 hover:text-orange-500 rounded"
                                        //                 >
                                        //                     <ArrowUp className="w-5 h-5" />
                                        //                 </Button>
                                        //                 <span className="text-xs font-bold text-zinc-900">
                                        //                     {post.likes?.length ||
                                        //                         0}
                                        //                 </span>
                                        //                 <Button
                                        //                     variant="ghost"
                                        //                     size="icon"
                                        //                     className="h-6 w-6 text-zinc-500 hover:bg-zinc-200 hover:text-blue-500 rounded"
                                        //                 >
                                        //                     <ArrowDown className="w-5 h-5" />
                                        //                 </Button>
                                        //             </div>
                                        //             {/* Post Content */}
                                        //             <div className="flex-1 p-3 bg-white">
                                        //                 {/* Metadata */}
                                        //                 <div className="flex items-center gap-1 text-xs text-zinc-500 mb-1.5">
                                        //                     <Avatar className="w-5 h-5 mr-1">
                                        //                         <AvatarImage
                                        //                             src={
                                        //                                 post.author
                                        //                                     ?.avatarUrl
                                        //                             }
                                        //                         />
                                        //                         <AvatarFallback>
                                        //                             {
                                        //                                 post.author
                                        //                                     ?.username?.[0]
                                        //                             }
                                        //                         </AvatarFallback>
                                        //                     </Avatar>
                                        //                     <span className="font-bold text-zinc-900 hover:underline">
                                        //                         u/
                                        //                         {
                                        //                             post.author
                                        //                                 ?.username
                                        //                         }
                                        //                     </span>
                                        //                     <span>•</span>
                                        //                     <span>
                                        //                         {formatDistanceToNow(
                                        //                             new Date(
                                        //                                 post.createdAt
                                        //                             ),
                                        //                             {
                                        //                                 addSuffix:
                                        //                                     true,
                                        //                             }
                                        //                         )}
                                        //                     </span>
                                        //                 </div>
                                        //                 {/* Content */}
                                        //                 <h3 className="text-lg font-medium text-zinc-900 mb-2 leading-snug">
                                        //                     {post.content}
                                        //                 </h3>
                                        //                 {post.imageUrl && (
                                        //                     <div className="rounded-lg overflow-hidden border border-zinc-200 mb-2">
                                        //                         <img
                                        //                             src={
                                        //                                 post.imageUrl
                                        //                             }
                                        //                             alt="Content"
                                        //                             className="w-full object-cover max-h-[500px]"
                                        //                         />
                                        //                     </div>
                                        //                 )}
                                        //                 {/* Action Buttons */}
                                        //                 <div className="flex items-center gap-1 text-zinc-500 font-bold text-xs mt-2">
                                        //                     <Button
                                        //                         variant="ghost"
                                        //                         size="sm"
                                        //                         className="h-8 gap-2 px-2 hover:bg-zinc-100"
                                        //                     >
                                        //                         <MessageCircle className="w-4 h-4" />{" "}
                                        //                         {post.commentsCount ||
                                        //                             0}{" "}
                                        //                         Comments
                                        //                     </Button>
                                        //                     <Button
                                        //                         variant="ghost"
                                        //                         size="sm"
                                        //                         className="h-8 gap-2 px-2 hover:bg-zinc-100"
                                        //                     >
                                        //                         <Share2 className="w-4 h-4" />{" "}
                                        //                         Share
                                        //                     </Button>
                                        //                     <Button
                                        //                         variant="ghost"
                                        //                         size="sm"
                                        //                         className="h-8 gap-2 px-2 hover:bg-zinc-100"
                                        //                     >
                                        //                         <MoreHorizontal className="w-4 h-4" />
                                        //                     </Button>
                                        //                 </div>
                                        //             </div>
                                        //         </div>
                                        //     </Card>
                                        // ))}
                                    }

                                    {posts.map((post) => (
                                        <PostCard key={post._id} post={post} />
                                    ))}
                                    {posts.length === 0 && (
                                        <div className="text-center py-10 text-zinc-500">
                                            No posts yet. Be the first to start
                                            the conversation!
                                        </div>
                                    )}
                                </div>

                                {/* RIGHT COLUMN: SIDEBAR */}
                                <div className="hidden md:block space-y-4">
                                    {/* About Community Card */}
                                    <Card className="shadow-sm border border-zinc-200">
                                        <CardHeader className="bg-blue-50 dark:bg-blue-900/20 py-3 px-4 flex flex-row justify-between items-center rounded-t-lg">
                                            <span className="font-bold text-sm text-zinc-900">
                                                About Community
                                            </span>
                                            <MoreHorizontal className="w-4 h-4 text-zinc-500 cursor-pointer" />
                                        </CardHeader>
                                        <div className="p-3 space-y-3 bg-white">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="w-12 h-12">
                                                    <AvatarImage
                                                        src={
                                                            event.imageUrl ||
                                                            "https://github.com/shadcn.png"
                                                        }
                                                    />
                                                    <AvatarFallback>
                                                        FA
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium text-sm">
                                                    r/{event.name}
                                                </span>
                                            </div>
                                            <p className="text-sm text-zinc-600 leading-snug">
                                                {event.description}
                                            </p>

                                            <div className="flex items-center gap-2 text-zinc-500 text-xs">
                                                <Calendar className="w-4 h-4" />
                                                <span>
                                                    Created{" "}
                                                    {new Date(
                                                        event.startTime
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <Separator />

                                            <div className="flex justify-between text-sm">
                                                <div>
                                                    <div className="font-bold text-zinc-900">
                                                        {event.registerCount ||
                                                            0}
                                                    </div>
                                                    <div className="text-xs text-zinc-500">
                                                        Members
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-zinc-900 flex items-center gap-1">
                                                        <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
                                                        {event.capacity}
                                                    </div>
                                                    <div className="text-xs text-zinc-500">
                                                        Online
                                                    </div>
                                                </div>
                                            </div>

                                            <Separator />
                                            <Button
                                                className="w-full rounded-full font-bold"
                                                onClick={handleCreatePost}
                                            >
                                                Create Post
                                            </Button>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
