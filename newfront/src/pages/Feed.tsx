import { useEffect, useState } from "react";
import PostCard from "@/components/post/PostCard";
import PostDetailDialog from "@/components/post/PostDetailDialog";
import type { Post } from "@/types/post.type";
import { postService } from "@/services/post.service";

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch posts on mount
  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setIsLoading(true);
        const data = await postService.getFeedPosts();
        console.log("feed post: ", data);
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
    <>
      <div className="flex flex-col items-center w-full">
        {/* HEADER */}
        <div className="text-center py-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Discover Post That Make a Difference
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Explore opportunities to learn, connect, and make a positive impact
            in your community.
          </p>
        </div>

        {/* FEED */}
        <div className="w-full max-w-2xl space-y-4 px-4 pb-8">
          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground">
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
            <div className="text-center py-10 text-muted-foreground">
              No posts found in your feed. Join some events to see what's
              happening!
            </div>
          )}
        </div>
      </div>

      {/* POST DETAIL */}
      <PostDetailDialog post={selectedPost} open={open} onClose={handleClose} />
    </>
  );
}
