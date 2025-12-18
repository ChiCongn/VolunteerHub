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
