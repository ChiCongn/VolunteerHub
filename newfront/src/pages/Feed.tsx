import { useState } from "react";
import type { PostFeedView } from "@/components/post/PostData";
import { mockPosts } from "@/components/post/PostData";
import PostCard from "@/components/post/PostCard";
import PostDetailDialog from "@/components/post/PostDetailDialog";
import CreatePost from "@/components/post/PostCreate";

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
      <div className="flex flex-1 justify-center min-w-0">
        <div className="w-full max-w-2xl space-y-4 p-4">
            <CreatePost />
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onCommentClick={handleCommentClick}
            />
          ))}
        </div>
      </div>

      {/* POST DETAIL DIALOG */}
      <PostDetailDialog
        post={selectedPost}
        open={open}
        onClose={handleClose}
      />
    </>
  );
}
