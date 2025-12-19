import { useState } from "react";
import type { PostFeedView } from "@/components/post/PostData";
import { mockPosts } from "@/components/post/PostData";
import PostCard from "@/components/post/PostCard";
import PostDetailDialog from "@/components/post/PostDetailDialog";

export default function Feed() {
  const [posts] = useState<PostFeedView[]>(mockPosts);
  const [selectedPost, setSelectedPost] =
    useState<PostFeedView | null>(null);
  const [open, setOpen] = useState(false);

  const handleCommentClick = (post: PostFeedView) => {
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
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onCommentClick={handleCommentClick}
            />
          ))}
        </div>
      </div>

      {/* POST DETAIL */}
      <PostDetailDialog
        post={selectedPost}
        open={open}
        onClose={handleClose}
      />
    </>
  );
}
