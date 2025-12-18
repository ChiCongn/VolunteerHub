import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  MessageCircle,
  Heart,
  Share2,
  MoreHorizontal,
  Calendar,
  Send,
} from "lucide-react";

// Components & UI
import { Navbar05 } from "./navbar";
import LeftPanel from "../components/LeftPanel";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

// Services & Store
import { postService } from "@/services/post.service";
import { commentService, type Comment } from "@/services/comment.service";
import { useUserStore } from "@/stores/user.store";
import type { Post } from "@/types";

// --- Helper: Safe Date Formatter ---
const safeFormatTime = (dateString: string | undefined | null) => {
  if (!dateString) return "Just now";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Unknown date";
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return "Unknown date";
  }
};

// --- Component: Comment Item ---
const CommentItem = ({ comment }: { comment: Comment }) => {
  return (
    <div className="flex gap-3 mb-4">
      <div className="flex flex-col items-center">
        <Avatar className="w-8 h-8 cursor-pointer">
          <AvatarImage
            src={comment.author?.avatarUrl || "https://github.com/shadcn.png"}
          />
          <AvatarFallback>
            {comment.author?.username?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        {/* Giữ lại đường kẻ này để kết nối comment, hoặc xóa nếu muốn sạch hoàn toàn */}
        <div className="w-[2px] h-full bg-zinc-300 mt-2 rounded-full" />
      </div>

      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="font-bold text-zinc-900 cursor-pointer hover:underline">
            {comment.author?.username || "Unknown User"}
          </span>
          <span>•</span>
          <span>{safeFormatTime(comment.createdAt)}</span>
        </div>
        <div className="text-sm text-zinc-800 leading-relaxed">
          {comment.content}
        </div>

        <div className="flex items-center gap-4 text-zinc-500 font-bold text-xs mt-1">
          {/* Actions... */}
        </div>
      </div>
    </div>
  );
};

export const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUserStore();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      if (!postId) return;
      try {
        setLoading(true);
        const [postData, commentsData] = await Promise.all([
          postService.getPostById(postId),
          commentService.getCommentsByPost(postId),
        ]);
        setPost(postData);
        setComments(commentsData);
      } catch (error) {
        console.error("Failed to load details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [postId]);

  // Handle Comment Submit
  const handleSubmitComment = async () => {
    //if (!commentText.trim() || !postId || !isAuthenticated) return;
    try {
      setIsSubmitting(true);
      const newComment = await commentService.createComment({
        postId: postId as string,
        content: commentText,
        authorId: user?.id ?? "c1053a85-e0a0-46f8-87bf-261b98a5c5bc",
      });
      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
    } catch (error) {
      console.error("Failed to post comment:", error);
      alert("Failed to post comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#dae0e6]">
        Loading...
      </div>
    );
  if (!post)
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#dae0e6]">
        Post not found
      </div>
    );

  return (
    <div className="min-h-screen bg-[#dae0e6] dark:bg-black">
      <Navbar05 />

      <div className="flex w-full justify-center">
        {/* 1. LEFT SIDEBAR */}
        <div className="hidden md:block sticky top-[60px] h-[calc(100vh-60px)] z-30 w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <LeftPanel />
        </div>

        {/* 2. MAIN CONTENT AREA */}
        <div className="flex flex-1 justify-center min-w-0">
          <div className="container mx-auto px-4 max-w-7xl py-6">
            <div className="flex gap-4">
              {/* Back Button */}
              <div className="hidden md:block">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-zinc hover:bg-zinc-200 h-10 w-10"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="w-5 h-5 text-zinc-600" />
                </Button>
              </div>

              {/* Main Column (Post + Comments) */}
              <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* --- POST DETAIL COLUMN --- */}
                <div className="md:col-span-2 space-y-4">
                  {/* --- THAY ĐỔI Ở ĐÂY: Card trong suốt, không border, không shadow --- */}
                  <Card className="bg-transparent border-none shadow-none overflow-hidden">
                    {/* Post Content */}
                    <div className="flex">
                      {/* Post Body */}
                      <div className="flex-1 p-4">
                        <div className="flex items-center gap-2 mb-2 text-xs text-zinc-500">
                          <Avatar className="w-5 h-5">
                            <AvatarImage
                              src={
                                post.author?.avatarUrl ||
                                "https://github.com/shadcn.png"
                              }
                            />
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          <span className="font-bold text-zinc-900 hover:underline cursor-pointer">
                            r/{post.event?.name || "Community"}
                          </span>
                          <span>•</span>
                          <span>Posted by u/{post.author?.username}</span>
                          <span>{safeFormatTime(post.createdAt)}</span>
                        </div>

                        <h1 className="text-xl font-semibold text-zinc-900 mb-4 leading-snug">
                          {post.content}
                        </h1>

                        {post.imageUrl && (
                          <div className="flex justify-center mb-4 rounded-md overflow-hidden bg-black/5 border border-zinc-200">
                            <img
                              src={post.imageUrl}
                              className="max-h-[500px] object-contain w-full"
                              alt="Post detail"
                            />
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold pt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center space-x-2 hover:text-red-500"
                          >
                            <Heart className="h-4 w-4" />{" "}
                            <span className="text-sm">
                              {post.likes && post.likes.length > 0
                                ? post.likes.length
                                : 0}{" "}
                              Like
                            </span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center space-x-2 hover:text-green-500"
                          >
                            <MessageCircle className="w-4 h-4" />{" "}
                            {comments.length} Comment
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium whitespace-nowrap hidden sm:inline-block">
                          {"   "}
                        </span>

                        <div className="flex-1 relative">
                          <Input
                            placeholder={
                              isAuthenticated
                                ? "What are your thoughts?"
                                : "Please login to comment"
                            }
                            className="pr-10 h-10 bg-white border-zinc-300 focus-visible:ring-1 focus-visible:ring-blue-500 rounded-full shadow-sm"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            //disabled={!isAuthenticated || isSubmitting}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmitComment();
                              }
                            }}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute right-1 top-1 h-8 w-8 text-blue-500 hover:bg-blue-50 rounded-full"
                            onClick={handleSubmitComment}
                            // disabled={
                            //   !commentText || !isAuthenticated || isSubmitting
                            // }
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 md:px-10 min-h-[200px]">
                      {comments.length === 0 ? (
                        <div className="text-center text-zinc-500 py-10 text-sm">
                          No comments yet. Be the first to share your thoughts!
                        </div>
                      ) : (
                        comments.map((comment) => (
                          <CommentItem key={comment._id} comment={comment} />
                        ))
                      )}
                    </div>
                  </Card>
                </div>

                <div className="hidden md:block space-y-4">
                  <Card className="shadow-sm border border-zinc-200 bg-white">
                    <CardHeader className="bg-blue-50 dark:bg-blue-900/20 py-3 px-4 flex flex-row justify-between items-center rounded-t-lg">
                      <span className="font-bold text-sm text-zinc-900">
                        About Community
                      </span>
                      <MoreHorizontal className="w-4 h-4 text-zinc-500 cursor-pointer" />
                    </CardHeader>
                    <div className="p-3 space-y-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-12 h-12">
                          <AvatarImage
                            src={
                              post.event?.imageUrl ||
                              "https://github.com/shadcn.png"
                            }
                          />
                          <AvatarFallback>C</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm line-clamp-1">
                          r/{post.event?.name || "Community"}
                        </span>
                      </div>

                      <p className="text-sm text-zinc-600 leading-snug line-clamp-3">
                        {post.event?.description || "Welcome to the community."}
                      </p>

                      <div className="flex items-center gap-2 text-zinc-500 text-xs">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Created{" "}
                          {post.event?.startTime
                            ? new Date(
                                post.event.startTime
                              ).toLocaleDateString()
                            : "Unknown date"}
                        </span>
                      </div>

                      <Separator />

                      <div className="flex justify-between text-sm">
                        <div>
                          <div className="font-bold text-zinc-900">
                            {post.event?.registerCount || 0}
                          </div>
                          <div className="text-xs text-zinc-500">Members</div>
                        </div>
                        <div>
                          <div className="font-bold text-zinc-900 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
                            {post.event?.capacity || 100}
                          </div>
                          <div className="text-xs text-zinc-500">Online</div>
                        </div>
                      </div>

                      <Separator />

                      <Button
                        className="w-full rounded-full font-bold bg-zinc-900 text-white hover:bg-zinc-800"
                        onClick={() => {
                          if (post.event?._id)
                            navigate(`/events/${post.event._id}`);
                        }}
                      >
                        Visit Community
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
