import { useEffect, useState } from "react";
import PostCard from "@/components/post/PostCard";
import PostDetailDialog from "@/components/post/PostDetailDialog";
import type { Post } from "@/types/post.type";
import { postService } from "@/services/post.service";
import TrendingEvents from "@/components/event/TrendingEvent"; // Đảm bảo tên file này đúng với file bạn đã tạo

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setIsLoading(true);
        const data = await postService.getFeedPosts();
        setPosts(data);
      } catch (error) {
        console.error("Error loading feed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeed();
  }, []);

  const handleCommentClick = (post: Post) => {
    setSelectedPost(post);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPost(null);
  };

  return (
    <div className="min-h-screen bg-[#dae0e6] dark:bg-black pb-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center py-10 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            See what people are sharing
          </h1>
          <p className="text-sm text-zinc-500 max-w-xl mx-auto">
            Posts, moments, and updates from the community.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-15">
          {/* FEED*/}
          <div className="lg:col-span-1 space-y-4"></div>
          <div className="lg:col-span-7 space-y-4">
            {isLoading ? (
              <div className="text-center py-10 text-muted-foreground bg-white rounded-lg border">
                Loading feed...
              </div>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onCommentClick={handleCommentClick}
                />
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground bg-white rounded-lg border">
                No posts found in your feed. Join some events to see what's
                happening!
              </div>
            )}
          </div>

          {/* SIDEBAR*/}
          <div className="hidden lg:block lg:col-span-4 space-y-4">
            <TrendingEvents />
          </div>
        </div>
      </div>

      {/* POST DETAIL DIALOG */}
      <PostDetailDialog post={selectedPost} open={open} onClose={handleClose} />
    </div>
  );
}
