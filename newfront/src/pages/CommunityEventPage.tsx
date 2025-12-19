import { useEffect, useState } from "react";
import { useParams } from "react-router";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MoreHorizontal, Link as LinkIcon, Calendar } from "lucide-react";

import { EventHeader } from "../components/EventHeader";
//import { PostCard } from "../components/cards/PostCard";
import PostCard from "../components/post/PostCard";

import { CreatePostModal } from "../components/CreatePostModal";

// Import Service & Types
import { useUserStore } from "@/stores/user.store";
import { eventService } from "@/services/event.service";
import { postService } from "@/services/post.service";

import type { Post } from "@/types/post.type";
import type { Event } from "@/types/event.type";

import PostDetailDialog from "@/components/post/PostDetailDialog";

export const CommunityEventPage = () => {
  const { eventId } = useParams();

  // State
  const [event, setEvent] = useState<Event | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  const user = useUserStore((s) => s.user);
  useEffect(() => {
    console.log("USER AFTER HYDRATE:", user);
  }, [user]);

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
        setPosts(postsData.items);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  // Handle Open Modal
  const handleCreatePost = () => {
    setIsCreatePostOpen(true);
  };
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [open, setOpen] = useState(false);

  const handleCommentClick = (post: Post) => {
    setSelectedPost(post);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPost(null);
  };

  // Handle Submit from Modal
  const handleCreatePostSubmit = async (content: string, imageUrl?: string) => {
    if (!eventId) return;

    try {
      //TODO: remove author id
      const newPostData = await postService.createPost({
        eventId: eventId,
        content: content,
        imageUrl: imageUrl,
        authorId: user?.id ? user.id : "56278395-01e3-48cd-912b-c40a937af180",
      });

      const newPost: Post = {
        ...newPostData.data,
        createdAt: new Date().toISOString(), // convert Date to string to render
      };

      setPosts((prev) => [newPost, ...prev]);
    } catch (error) {
      console.error("Failed to create post:", error);
      alert("Failed to create post. Please try again.");
    }
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
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onSubmit={handleCreatePostSubmit}
        userAvatar="https://github.com/shadcn.png"
      />

      <div className="flex w-full justify-center">
        {/* 2. MAIN CONTENT AREA */}
        <div className="flex flex-1 justify-center min-w-0">
          <div className="w-full">
            {/* --- HEADER --- */}
            <EventHeader event={event} onCreatePost={handleCreatePost} />

            {/* --- GRID CONTENT --- */}
            <div className="container mx-auto px-4 max-w-5xl py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* LEFT COLUMN: FEED */}
                <div className="md:col-span-2 space-y-4">
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

                  {/* Posts List */}
                  {posts.map((post) => (

                    <PostCard
                      key={post.id}
                      post={post}
                      onCommentClick={handleCommentClick}
                    />
                  ))}
                  {posts.length === 0 && (
                    <div className="text-center py-10 text-zinc-500">
                      No posts yet. Be the first to start the conversation!
                    </div>
                  )}
                  <PostDetailDialog post={selectedPost} open={open} onClose={handleClose} />
                </div>

                {/* RIGHT COLUMN: SIDEBAR */}
                <div className="hidden md:block space-y-4">
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
                              event.imageUrl || "https://github.com/shadcn.png"
                            }
                          />
                          <AvatarFallback>FA</AvatarFallback>
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
                          {new Date(event.startTime).toLocaleDateString()}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <div>
                          <div className="font-bold text-zinc-900">
                            {event.registerCount || 0}
                          </div>
                          <div className="text-xs text-zinc-500">Members</div>
                        </div>
                        <div>
                          <div className="font-bold text-zinc-900 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
                            {event.capacity}
                          </div>
                          <div className="text-xs text-zinc-500">Online</div>
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
